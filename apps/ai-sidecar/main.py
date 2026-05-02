from __future__ import annotations

import logging
import json
import os
import re
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Any

import faiss  # type: ignore
import httpx
import numpy as np
import spacy
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

try:
    import certifi
except ImportError:
    certifi = None

try:
    import truststore
except ImportError:
    truststore = None


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
if truststore is not None:
    truststore.inject_into_ssl()
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
if certifi is not None:
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())

from sentence_transformers import SentenceTransformer

try:
    import torch
except ImportError:
    torch = None

if torch is not None:
    torch.set_num_threads(1)
    if hasattr(torch, "set_num_interop_threads"):
        torch.set_num_interop_threads(1)

DEFAULT_EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"
)
DEFAULT_EMBEDDING_CACHE_DIR = Path(
    os.getenv("AI_SIDECAR_CACHE_DIR", str(ROOT_DIR / ".cache" / "ai-sidecar"))
)
DEFAULT_INDEX_DIR = DEFAULT_EMBEDDING_CACHE_DIR / "job-index"
DEFAULT_SPACY_MODEL = os.getenv("SPACY_MODEL_NAME", "en_core_web_sm")
DEFAULT_OLLAMA_URL = os.getenv(
    "AI_MODEL_API_URL", "http://127.0.0.1:11434/v1/chat/completions"
)
DEFAULT_OLLAMA_MODEL = os.getenv("AI_MODEL_NAME", "gemma3:4b")
DEFAULT_OLLAMA_KEY = os.getenv("AI_MODEL_API_KEY", "")

SKILL_PATTERNS = [
    r"react(?:\.js)?",
    r"typescript",
    r"javascript",
    r"node(?:\.js)?",
    r"python",
    r"java",
    r"golang|\bgo\b",
    r"docker",
    r"kubernetes",
    r"terraform",
    r"aws",
    r"azure",
    r"gcp",
    r"mongodb",
    r"postgres(?:ql)?",
    r"redis",
    r"graphql",
    r"machine learning",
    r"artificial intelligence|\bai\b",
    r"llm|large language model",
    r"nlp",
    r"pytorch",
    r"tensorflow",
    r"fastapi",
    r"flask",
    r"spring",
    r"ruby on rails|rails",
]


class MatchRequest(BaseModel):
    profileSkills: list[str] = Field(default_factory=list)
    jobDescription: str


class MatchResponse(BaseModel):
    matchScore: int
    matchedSkills: list[str]
    missingSkills: list[str]
    suggestedImprovements: list[str]


class ResumeProject(BaseModel):
    name: str = ""
    summary: str = ""
    technologies: list[str] = Field(default_factory=list)


class ResumeExperience(BaseModel):
    company: str = ""
    title: str = ""
    startDate: str = ""
    endDate: str = ""
    summary: str = ""


class ResumeEducation(BaseModel):
    institution: str = ""
    degree: str = ""
    startDate: str = ""
    endDate: str = ""


class ResumeCleanupRequest(BaseModel):
    name: str = ""
    skills: list[str] = Field(default_factory=list)
    projects: list[ResumeProject] = Field(default_factory=list)
    experience: list[ResumeExperience] = Field(default_factory=list)
    education: list[ResumeEducation] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    parsedText: str = ""
    resumeScore: int = 0


class ResumeCleanupResponse(ResumeCleanupRequest):
    pass


class IndexedJob(BaseModel):
    id: str
    title: str
    company: str
    description: str
    location: str = "Remote"
    platform: str
    matchedSkills: list[str] = Field(default_factory=list)
    extractedSkills: list[str] = Field(default_factory=list)


class JobIndexUpsertRequest(BaseModel):
    userId: str
    jobs: list[IndexedJob] = Field(default_factory=list)


class JobIndexSearchRequest(BaseModel):
    userId: str
    query: str
    topK: int = 25


class JobIndexSearchResponse(BaseModel):
    matches: list[dict[str, Any]] = Field(default_factory=list)


app = FastAPI(title="JobPilot AI Sidecar", version="1.0.0")
logger = logging.getLogger("jobpilot.ai_sidecar")
FALLBACK_EMBEDDING_DIMENSION = 256
DEFAULT_EMBEDDING_CACHE_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_INDEX_DIR.mkdir(parents=True, exist_ok=True)


def user_index_paths(user_id: str) -> tuple[Path, Path]:
    safe_user_id = re.sub(r"[^a-zA-Z0-9_-]", "_", user_id)
    return (
        DEFAULT_INDEX_DIR / f"{safe_user_id}.json",
        DEFAULT_INDEX_DIR / f"{safe_user_id}.npy",
    )


def job_document_text(job: IndexedJob) -> str:
    return " ".join(
        part
        for part in [
            job.title,
            job.company,
            job.description,
            job.location,
            job.platform,
            " ".join(job.matchedSkills),
            " ".join(job.extractedSkills),
        ]
        if part
    )


def load_index_metadata(user_id: str) -> list[dict[str, Any]]:
    metadata_path, _ = user_index_paths(user_id)
    if not metadata_path.exists():
        return []
    return json.loads(metadata_path.read_text())


def load_index_vectors(user_id: str) -> np.ndarray | None:
    _, vectors_path = user_index_paths(user_id)
    if not vectors_path.exists():
        return None
    return np.load(vectors_path)


def save_index(user_id: str, jobs: list[IndexedJob], vectors: np.ndarray) -> None:
    metadata_path, vectors_path = user_index_paths(user_id)
    metadata_path.write_text(json.dumps([job.model_dump() for job in jobs]))
    np.save(vectors_path, vectors)


EMBEDDING_MODEL_LOCK = Lock()
EMBEDDING_ENCODE_LOCK = Lock()
EMBEDDING_MODEL: SentenceTransformer | None = None
EMBEDDING_MODEL_LOAD_FAILED = False


def get_embedding_model() -> SentenceTransformer | None:
    global EMBEDDING_MODEL
    global EMBEDDING_MODEL_LOAD_FAILED

    if EMBEDDING_MODEL is not None:
        return EMBEDDING_MODEL
    if EMBEDDING_MODEL_LOAD_FAILED:
        return None

    with EMBEDDING_MODEL_LOCK:
        if EMBEDDING_MODEL is not None:
            return EMBEDDING_MODEL
        if EMBEDDING_MODEL_LOAD_FAILED:
            return None

        try:
            EMBEDDING_MODEL = SentenceTransformer(
                DEFAULT_EMBEDDING_MODEL,
                cache_folder=str(DEFAULT_EMBEDDING_CACHE_DIR / "hf-cache"),
                device="cpu",
            )
            return EMBEDDING_MODEL
        except Exception as error:
            EMBEDDING_MODEL_LOAD_FAILED = True
            logger.warning(
                "Falling back to local hashed embeddings because the sentence-transformer model could not be loaded: %s",
                error,
            )
            return None


@lru_cache(maxsize=1)
def get_spacy_model():
    try:
        return spacy.load(DEFAULT_SPACY_MODEL)
    except OSError:
        return spacy.blank("en")


def unique_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []
    for value in values:
        candidate = value.strip()
        if not candidate:
            continue
        key = candidate.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append(candidate)
    return normalized


def normalize_skill(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def extract_candidate_skills(text: str) -> list[str]:
    lowered = text.lower()
    matches: list[str] = []

    for pattern in SKILL_PATTERNS:
      for match in re.findall(pattern, lowered, flags=re.IGNORECASE):
          if isinstance(match, tuple):
              token = next((part for part in match if part), "")
          else:
              token = match
          if token:
              matches.append(normalize_skill(token))

    doc = get_spacy_model()(text)
    for chunk in getattr(doc, "noun_chunks", []):
        phrase = normalize_skill(chunk.text)
        if 2 <= len(phrase) <= 40 and any(ch.isalpha() for ch in phrase):
            if any(keyword in phrase for keyword in ["engineer", "python", "react", "data", "cloud", "kubernetes", "node", "ai", "ml"]):
                matches.append(phrase)

    return unique_strings(matches)


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    return float(np.dot(left, right))


def encode_texts(texts: list[str]) -> np.ndarray:
    model = get_embedding_model()
    if model is not None:
        with EMBEDDING_ENCODE_LOCK:
            embeddings = model.encode(
                texts,
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
        return np.asarray(embeddings, dtype="float32")

    vectors = np.asarray([fallback_embedding(text) for text in texts], dtype="float32")
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def fallback_embedding(text: str) -> np.ndarray:
    vector = np.zeros(FALLBACK_EMBEDDING_DIMENSION, dtype="float32")
    tokens = re.findall(r"[a-z0-9#+.-]+", text.lower())

    for token in tokens:
        slot = hash(token) % FALLBACK_EMBEDDING_DIMENSION
        vector[slot] += 1.0

    if not tokens:
        return vector

    return vector


def get_embedding_mode() -> str:
    return "sentence-transformers" if get_embedding_model() is not None else "fallback-hash"


def semantic_skill_match(profile_skills: list[str], job_skills: list[str]) -> tuple[list[str], list[str], float]:
    if not profile_skills or not job_skills:
        return [], job_skills, 0.0

    profile_matrix = encode_texts(profile_skills)
    job_matrix = encode_texts(job_skills)

    index = faiss.IndexFlatIP(job_matrix.shape[1])
    index.add(job_matrix)
    similarities, indices = index.search(profile_matrix, 1)

    matched: set[str] = set()
    for similarity, index_value in zip(similarities[:, 0], indices[:, 0]):
        if index_value >= 0 and float(similarity) >= 0.48:
            matched.add(job_skills[int(index_value)])

    missing = [skill for skill in job_skills if skill not in matched]
    coverage = len(matched) / max(len(job_skills), 1)
    return sorted(matched), missing, coverage


def extract_json_object(raw_text: str) -> dict[str, Any] | None:
    raw_text = raw_text.strip()
    if raw_text.startswith("{") and raw_text.endswith("}"):
        return json.loads(raw_text)

    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    return json.loads(raw_text[start : end + 1])


async def ollama_cleanup_resume(payload: ResumeCleanupRequest) -> dict[str, Any] | None:
    if not DEFAULT_OLLAMA_URL or not DEFAULT_OLLAMA_MODEL:
        return None

    headers = {"Content-Type": "application/json"}
    if DEFAULT_OLLAMA_KEY:
        headers["Authorization"] = f"Bearer {DEFAULT_OLLAMA_KEY}"

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            DEFAULT_OLLAMA_URL,
            headers=headers,
            json={
                "model": DEFAULT_OLLAMA_MODEL,
                "temperature": 0.2,
                "messages": [
                    {
                        "role": "system",
                        "content": "You clean parsed resume JSON. Return JSON only with keys name, skills, projects, experience, education, certifications, parsedText, and resumeScore. Preserve facts. Do not invent employers, dates, certifications, or skills.",
                    },
                    {"role": "user", "content": payload.model_dump_json()},
                ],
            },
        )
        response.raise_for_status()
        body = response.json()
        raw_content = (
            body.get("choices", [{}])[0].get("message", {}).get("content")
            or body.get("message", {}).get("content")
            or body.get("response")
            or ""
        )

    if not raw_content:
        return None

    try:
        return extract_json_object(raw_content)
    except Exception:
        return None


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "embeddingModel": DEFAULT_EMBEDDING_MODEL,
        "embeddingMode": get_embedding_mode(),
        "embeddingCacheDir": str(DEFAULT_EMBEDDING_CACHE_DIR),
        "spacyModel": DEFAULT_SPACY_MODEL,
        "llmModel": DEFAULT_OLLAMA_MODEL,
    }


@app.post("/index/jobs/upsert")
def upsert_job_index(payload: JobIndexUpsertRequest):
    if not payload.jobs:
        return {"indexedCount": 0}

    deduped_jobs = list({job.id: job for job in payload.jobs}.values())
    vectors = encode_texts([job_document_text(job) for job in deduped_jobs])
    save_index(payload.userId, deduped_jobs, vectors)
    return {"indexedCount": len(deduped_jobs)}


@app.post("/index/jobs/search", response_model=JobIndexSearchResponse)
def search_job_index(payload: JobIndexSearchRequest):
    metadata = load_index_metadata(payload.userId)
    vectors = load_index_vectors(payload.userId)
    if not metadata or vectors is None or vectors.size == 0:
        return JobIndexSearchResponse(matches=[])

    query_vector = encode_texts([payload.query])[0:1]
    matrix = np.asarray(vectors, dtype="float32")
    index = faiss.IndexFlatIP(matrix.shape[1])
    index.add(matrix)
    top_k = max(1, min(payload.topK, len(metadata)))
    similarities, indices = index.search(query_vector, top_k)

    matches: list[dict[str, Any]] = []
    for similarity, index_value in zip(similarities[0], indices[0]):
        if index_value < 0:
            continue
        record = metadata[int(index_value)]
        matches.append(
            {
                "id": record["id"],
                "score": float(similarity),
                "title": record.get("title", ""),
                "company": record.get("company", ""),
                "platform": record.get("platform", ""),
            }
        )

    return JobIndexSearchResponse(matches=matches)


@app.post("/match", response_model=MatchResponse)
def match_resume_to_job(payload: MatchRequest):
    normalized_profile_skills = unique_strings(
        [normalize_skill(skill) for skill in payload.profileSkills]
    )
    extracted_job_skills = extract_candidate_skills(payload.jobDescription)
    matched_skills, missing_skills, coverage = semantic_skill_match(
        normalized_profile_skills,
        extracted_job_skills,
    )

    resume_vector, job_vector = encode_texts(
        [" ".join(normalized_profile_skills), payload.jobDescription]
    )
    semantic_score = max(0.0, cosine_similarity(resume_vector, job_vector))
    match_score = round(
        min(100.0, semantic_score * 100 * 0.7 + coverage * 100 * 0.3)
    )

    return MatchResponse(
        matchScore=match_score,
        matchedSkills=matched_skills,
        missingSkills=missing_skills,
        suggestedImprovements=[
            f"Add measurable project or hands-on experience demonstrating {skill}."
            for skill in missing_skills[:8]
        ],
    )


@app.post("/resume/cleanup", response_model=ResumeCleanupResponse)
async def cleanup_resume(payload: ResumeCleanupRequest):
    doc = get_spacy_model()(payload.parsedText)
    person_entities = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON"]
    org_entities = unique_strings(
        [ent.text.strip() for ent in doc.ents if ent.label_ == "ORG"]
    )

    enriched_skills = unique_strings(payload.skills + extract_candidate_skills(payload.parsedText))
    enriched_certifications = unique_strings(
        payload.certifications
        + re.findall(r"(?:AWS|Azure|GCP|CCNA|CCNP|PMP|Scrum|Kubernetes)[^\n,;]*", payload.parsedText, flags=re.IGNORECASE)
    )

    enriched = payload.model_copy(deep=True)
    if person_entities and (not enriched.name or enriched.name == "Unknown Candidate"):
        enriched.name = person_entities[0]
    enriched.skills = enriched_skills
    enriched.certifications = enriched_certifications[:8]

    if not enriched.experience and org_entities:
        enriched.experience = [
            ResumeExperience(company=org_entities[0], title="", startDate="", endDate="", summary="")
        ]

    enriched.resumeScore = max(
        payload.resumeScore,
        min(100, 50 + len(enriched.skills) * 4 + len(enriched.experience) * 5),
    )

    cleaned = await ollama_cleanup_resume(enriched)
    if cleaned:
        try:
            cleaned_payload = ResumeCleanupResponse.model_validate(cleaned)
            cleaned_payload.parsedText = payload.parsedText
            cleaned_payload.skills = unique_strings(cleaned_payload.skills + enriched.skills)
            cleaned_payload.certifications = unique_strings(
                cleaned_payload.certifications + enriched.certifications
            )
            cleaned_payload.resumeScore = max(
                enriched.resumeScore,
                min(100, int(cleaned_payload.resumeScore)),
            )
            return cleaned_payload
        except Exception:
            pass

    return ResumeCleanupResponse.model_validate(enriched.model_dump())