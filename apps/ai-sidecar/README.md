# AI Sidecar

Small local Python service for semantic job matching and hybrid resume cleanup.

## Stack

- `sentence-transformers` for semantic embeddings
- `FAISS` for nearest-neighbor skill matching
- `spaCy` for lightweight resume/entity enrichment
- local Ollama-compatible chat completions for JSON cleanup
- persistent local embedding cache and per-user job index under `.cache/ai-sidecar`

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r apps/ai-sidecar/requirements.txt
python -m spacy download en_core_web_sm
ollama pull gemma3:4b
ollama serve
npm run dev:ai-sidecar
```

The sidecar reads the repository root `.env` file. Set `AI_SIDECAR_URL=http://127.0.0.1:8010` in the API env so Node can call it.

The sidecar now uses the system trust store via `truststore`, caches the sentence-transformer model inside the repo, and falls back to deterministic hashed embeddings if the model still cannot be downloaded.
