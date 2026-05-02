# AI Job Search Automation Platform

Production-oriented monorepo for an AI-powered job search workflow focused on early-career engineers. The platform covers authenticated profile management, resume parsing, job discovery, match scoring, LaTeX resume tailoring, recruiter tracking, outreach generation, salary guidance, and guarded auto-apply orchestration.

## Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── lib
│   │   │   ├── middleware
│   │   │   ├── models
│   │   │   ├── routes
│   │   │   ├── services
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   └── validators
│   │   └── Dockerfile
│   ├── web
│   │   ├── src
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── lib
│   │   │   ├── pages
│   │   │   └── types
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── worker
│       ├── src
│       │   ├── automation
│       │   ├── config
│       │   ├── jobs
│       │   └── lib
│       └── Dockerfile
├── packages
│   └── shared
│       └── src
├── docker-compose.yml
└── README.md
```

## Backend Architecture

- `apps/api`: Express + TypeScript API with JWT authentication, Mongoose models, encrypted credential vault, AI services, and queue submission.
- `apps/worker`: BullMQ workers for scraping, resume-generation orchestration, and Playwright-based auto-apply processing.
- `packages/shared`: Queue names and shared job payload contracts.

## MongoDB Schemas

### User

- `fullName`
- `email`
- `passwordHash`
- `currentCtc`
- `expectedCtc`
- `preferredRoles[]`
- `preferredLocations[]`
- `autoApplyEnabled`
- `credentialVault[]` with AES-encrypted portal passwords

### UserProfile

- `userId`
- `name`
- `skills[]`
- `experience[]`
- `projects[]`
- `education[]`
- `certifications[]`
- `parsedText`
- `resumeFileName`
- `resumeStoragePath`
- `resumeScore`

### Job

- `sourceUserId`
- `title`
- `company`
- `description`
- `link`
- `platform`
- `location`
- `relevanceScore`
- `matchedSkills[]`
- `missingSkills[]`
- `status`

### JobApplication

- `userId`
- `jobId`
- `status`
- `appliedVia`
- `history[]`
- `lastAttemptedAt`

### RecruiterLead

- `userId`
- `jobId`
- `name`
- `title`
- `company`
- `profileUrl`
- `recentPosts[]`
- `state`

### GeneratedDocument

- `userId`
- `jobId`
- `type`
- `title`
- `content`
- `metadata`

## API Surface

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PUT /api/v1/settings`
- `POST /api/v1/parse-resume`
- `GET /api/v1/resume/sample-output`
- `POST /api/v1/jobs/fetch`
- `GET /api/v1/jobs`
- `POST /api/v1/jobs/match`
- `GET /api/v1/dashboard`
- `POST /api/v1/resume/generate`
- `POST /api/v1/apply/job`
- `POST /api/v1/hr/find`
- `PATCH /api/v1/hr/state`
- `POST /api/v1/outreach/generate`
- `POST /api/v1/salary/intelligence`

## AI and Automation Notes

- Resume parsing now supports a hybrid pipeline: file extraction in Node, structural parsing in the API, optional spaCy enrichment in the local AI sidecar, and optional LLM JSON cleanup before persisting the profile.
- Job matching now prefers semantic scoring from the local AI sidecar using `sentence-transformers` and FAISS, falls back to the configured chat model, and only then falls back to deterministic skill overlap.
- Resume tailoring generates LaTeX output per target role and stores ATS-oriented suggestions alongside the document.
- Outreach generation and resume summary refinement use an OpenAI-compatible chat completions endpoint when `AI_MODEL_API_URL` is configured. Local Ollama works out of the box with this path.
- Worker automation uses Playwright selectors, request throttling, and CAPTCHA fallback to manual review.

### Using Local Ollama + Gemma

- Set `AI_MODEL_API_URL=http://127.0.0.1:11434/v1/chat/completions`.
- Set `AI_MODEL_NAME=gemma3:4b`.
- `AI_MODEL_API_KEY` can be left blank for local Ollama.
- Set `AI_SIDECAR_URL=http://127.0.0.1:8010` to enable semantic matching and hybrid resume cleanup.
- Install and run the sidecar with `npm run dev:ai-sidecar` after creating a Python environment and installing `apps/ai-sidecar/requirements.txt`.

### Using Groq

- Groq works with the current outreach integration because the API client is OpenAI-compatible.
- Set `AI_MODEL_API_URL=https://api.groq.com/openai/v1/chat/completions`.
- Set `AI_MODEL_API_KEY` to your Groq API key.
- Set `AI_MODEL_NAME` to a Groq chat model such as `llama-3.1-8b-instant` or `llama-3.3-70b-versatile`.
- With these variables set, outreach generation will use Groq. Without them, the backend falls back to the heuristic generator.
- Groq can improve parsing, outreach, and resume tailoring text generation, but it does not solve job ingestion by itself. Real job fetching still requires `JOB_SOURCE_MODE=remote` plus a real provider endpoint in `JOB_PROVIDER_URL`.

## Job Source Modes

- `JOB_SOURCE_MODE=mock`: uses built-in demo jobs and skips link validation so demo listings remain visible.
- `JOB_SOURCE_MODE=remote`: uses the built-in free Remote OK feed by default, then filters and normalizes listings against the user's preferred roles and skills.
- `JOB_PROVIDER_URL`: optional override for `JOB_SOURCE_MODE=remote`. If set, the backend will fetch from that URL instead of Remote OK. The custom feed should return either a JSON array of jobs or `{ "jobs": [...] }`.
- `GET /api/v1/jobs` and `POST /api/v1/jobs/fetch` include `sourceMode` and `isMockData` so the client can surface whether listings are demo data.

## Frontend Pages

- Dashboard
- Resume Upload
- Job Listings
- Job Details
- Resume Optimizer
- HR Outreach
- Settings

## Sample Resume Parsing Output

```json
{
  "name": "Aarav Sharma",
  "skills": ["react", "typescript", "node.js", "mongodb", "networking"],
  "projects": [
    {
      "name": "Campus Placement Portal",
      "summary": "Built a full-stack portal with React and Node.js for campus hiring workflows.",
      "technologies": ["react", "node.js", "mongodb"]
    }
  ],
  "experience": [
    {
      "company": "Cisco TAC Intern",
      "title": "Technical Support Intern",
      "startDate": "2025-01",
      "endDate": "2025-06",
      "summary": "Assisted in triaging enterprise wireless incidents and documenting RCA steps."
    }
  ],
  "education": [
    {
      "institution": "VTU",
      "degree": "B.E. Computer Science",
      "startDate": "2021",
      "endDate": "2025"
    }
  ],
  "certifications": ["CCNA", "AWS Cloud Practitioner"],
  "parsedText": "Sample parsed text omitted for brevity.",
  "resumeScore": 84
}
```

## Local Development

1. Copy `.env.example` to `.env` and update secrets.
2. Run `npm install` from the repository root.
3. Start MongoDB and Redis locally, or run `docker compose up mongodb redis`.
4. Run the API with `npm run dev --workspace @job-automation/api`.
5. Run the worker with `npm run dev --workspace @job-automation/worker`.
6. Run the web client with `npm run dev --workspace @job-automation/web`.
7. For the free local AI stack, start Ollama and then run `npm run dev:ai-sidecar`.

Keep `JOB_SOURCE_MODE=mock` for demo data.
Set `JOB_SOURCE_MODE=remote` to enable real listings from the built-in free feed.
Set `JOB_PROVIDER_URL` only if you want to replace the built-in provider with your own JSON feed.

## Production Deployment Guide

### Docker Compose

1. Create a production `.env` file.
2. Run `docker compose build`.
3. Run `docker compose up -d`.
4. Expose the web container through a reverse proxy or ingress if deploying outside local infrastructure.

### Service-by-Service

1. Build shared types: `npm run build --workspace @job-automation/shared`
2. Build API: `npm run build --workspace @job-automation/api`
3. Build worker: `npm run build --workspace @job-automation/worker`
4. Build web: `npm run build --workspace @job-automation/web`
5. Deploy the API behind TLS with MongoDB and Redis on private networking.
6. Run the worker separately with the same Redis and API environment.
7. Serve the web `dist` output through Nginx, CloudFront, or another static host.

## Validation Commands

- `npm run build --workspace @job-automation/api`
- `npm run build --workspace @job-automation/shared`
- `npm run build --workspace @job-automation/worker`
- `npm run build --workspace @job-automation/web`

## Future Enhancements

- Provider-specific adapters for Naukri, Foundit, Greenhouse, and direct careers pages.
- Larger vector indexes and background embedding refresh jobs for semantic search at scale.
- PDF rendering from LaTeX in the worker.
- Browser extension for saved jobs and manual handoff.
- Notification jobs for daily alerts and interview-prep digests.
