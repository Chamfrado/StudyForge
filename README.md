# StudyForge

StudyForge is a full-stack AI study workspace. It combines a FastAPI backend,
a Next.js dashboard, PostgreSQL persistence, JWT authentication, and
OpenAI-compatible LLM integrations to turn study materials into summaries,
flashcards, quizzes, quiz attempts, and analytics.

## Preview

![StudyForge Demo](./docs/studyforge-demo.gif)

The repository is split into two application projects:

- `api/` - FastAPI backend, database models, migrations, auth, AI workflows,
  file extraction, tests, and API documentation.
- `web/` - Next.js frontend, authenticated dashboard, material upload flows,
  flashcard practice, quiz attempts, and analytics pages.

The root Docker setup runs both projects together for development.

## Table of Contents

- [Product Overview](#product-overview)
- [Feature Set](#feature-set)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start With Docker](#quick-start-with-docker)
- [Local Development Without Docker](#local-development-without-docker)
- [Environment Configuration](#environment-configuration)
- [Ports and URLs](#ports-and-urls)
- [Quality Commands](#quality-commands)
- [Documentation Map](#documentation-map)
- [Production Notes](#production-notes)
- [Troubleshooting](#troubleshooting)

## Product Overview

StudyForge helps a learner move from raw notes to structured study workflows:

1. Create subjects for areas of study.
2. Upload study materials in text, Markdown, PDF, or DOCX format.
3. Extract text from the uploaded file.
4. Generate AI summaries, flashcards, and multiple-choice quizzes.
5. Practice flashcards and submit quiz attempts.
6. Review global and per-subject analytics.

The app is built as a portfolio-grade full-stack system rather than a single
demo script. The backend owns data integrity and AI orchestration. The frontend
owns the interactive learning experience.

## Feature Set

- Account registration, login, JWT auth, and current-user session handling
- Subject CRUD and per-subject navigation
- Material upload for `.txt`, `.md`, `.pdf`, and `.docx`
- Server-side text extraction for uploaded files
- AI-generated summaries with key points
- AI-generated flashcards with filtering, flip-card review, and CSV export
- AI-generated quizzes with answer submission and attempt history
- Dashboard overview with study metrics
- Global analytics page with charts and recent attempts
- Per-subject analytics pages
- Docker development stack with API, web, and PostgreSQL
- Alembic migrations and integration tests
- Mock AI provider for local development without external API spend
- Groq/OpenAI-compatible provider support for real generation

## Architecture

```text
Browser
  |
  | http://localhost:3000
  v
Next.js Web App
  |
  | /api/* rewrite in development
  v
FastAPI Backend
  |
  | SQLAlchemy async ORM
  v
PostgreSQL

FastAPI also calls an AI provider:

Mock provider for local/demo mode
or
OpenAI-compatible provider such as Groq
```

In Docker development, a single `app` container runs both FastAPI and Next.js
with reload/watch enabled. PostgreSQL runs as a separate Compose service.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, custom UI components |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |
| Backend | FastAPI, Python 3.12+ |
| Database | PostgreSQL 16 |
| ORM and migrations | SQLAlchemy 2, Alembic |
| Auth | JWT, Argon2 password hashing |
| AI | OpenAI Python SDK against OpenAI-compatible providers |
| File parsing | Text, Markdown, PDF, DOCX extraction |
| Testing | Pytest, HTTPX, AnyIO |
| DevOps | Docker, Docker Compose |

## Repository Structure

```text
.
|-- api/
|   |-- app/                  # FastAPI application
|   |-- alembic/              # Database migrations
|   |-- tests/                # Backend tests
|   |-- storage/              # Uploaded files in local/dev mode
|   |-- pyproject.toml
|   |-- .env.example
|   `-- README.md             # Backend-specific guide
|-- web/
|   |-- src/app/              # Next.js App Router pages
|   |-- src/components/       # Reusable UI and layout components
|   |-- src/hooks/
|   |-- src/lib/              # API client, auth helpers, shared types
|   |-- package.json
|   `-- README.md             # Frontend-specific guide
|-- Dockerfile                # Combined dev/prod app image
|-- docker-compose.yml        # Root development stack
|-- docker-entrypoint.sh      # Starts API and web in one app container
|-- .dockerignore
`-- README.md                 # Project overview
```

## Quick Start With Docker

Docker is the recommended way to run the complete project locally.

1. Create the backend environment file:

```powershell
Copy-Item api\.env.example api\.env
```

macOS/Linux:

```bash
cp api/.env.example api/.env
```

2. For local development without an external AI key, keep:

```env
AI_PROVIDER=mock
OPENAI_COMPATIBLE_API_KEY=
```

3. Start the full stack from the repository root:

```bash
docker compose up --build
```

After the first build, the normal development loop is:

```bash
docker compose up
```

4. Open the app:

```text
http://localhost:3000
```

Useful Docker commands:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f postgres
docker compose down
```

Use this only when you intentionally want to delete local database data:

```bash
docker compose down -v
```

## Local Development Without Docker

Use this when you want to run the backend and frontend as separate local
processes.

Backend:

```bash
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -e ".[dev]"
python -m alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd web
npm install
npm run dev
```

The frontend expects the backend at `http://127.0.0.1:8000` through the Next.js
rewrite configured in `web/next.config.ts`.

## Environment Configuration

The backend environment lives at `api/.env`. Start from `api/.env.example`.

Important variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy async PostgreSQL URL |
| `JWT_SECRET_KEY` | Secret used to sign access tokens |
| `CORS_ALLOWED_ORIGINS` | Browser origins allowed to call the API |
| `AI_PROVIDER` | `mock`, `groq`, `openai-compatible`, or `openai_compatible` |
| `OPENAI_COMPATIBLE_API_KEY` | API key for real AI generation |
| `OPENAI_COMPATIBLE_BASE_URL` | OpenAI-compatible API base URL |
| `OPENAI_COMPATIBLE_MODEL` | Chat model used by the AI provider |

See [api/README.md](api/README.md) for the complete backend environment table.

## Ports and URLs

| Service | URL |
| --- | --- |
| Web app | `http://localhost:3000` |
| API through web proxy | `http://localhost:3000/api` |
| Direct API | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| PostgreSQL from host | `localhost:5433` |
| PostgreSQL inside Compose | `postgres:5432` |

## Quality Commands

Backend:

```bash
cd api
ruff check .
pytest
```

Frontend:

```bash
cd web
npm run lint
npm run build
```

Docker smoke check:

```bash
docker compose up --build
```

Then verify:

```text
http://localhost:3000
http://localhost:8000/health
```

## Documentation Map

- [Backend README](api/README.md) - API setup, environment variables,
  migrations, endpoint reference, tests, and backend troubleshooting.
- [Frontend README](web/README.md) - Next.js setup, route map, API client,
  UI structure, scripts, and frontend troubleshooting.

## Production Notes

- Replace `JWT_SECRET_KEY` with a strong secret.
- Keep `.env` files out of version control.
- Use managed PostgreSQL or persistent Docker volumes.
- Persist uploaded material storage if users need files after redeploys.
- Use `AI_PROVIDER=mock` only for local development or demos.
- Validate the selected real AI model for structured JSON output.
- Build the frontend with `npm run build` before shipping.
- Run backend tests before deployment.

## Troubleshooting

### Docker cannot connect to the daemon

Start Docker Desktop and make sure Linux containers are enabled. Then run:

```bash
docker version
docker compose ps
```

### App cannot resolve `postgres`

Recreate Compose containers and networks without deleting volumes:

```bash
docker compose down --remove-orphans
docker compose up --build
```

### API cannot connect from local backend process

When the backend runs on the host and PostgreSQL runs in Docker, use:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge
```

Inside Compose, use:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@postgres:5432/studyforge
```

### AI generation fails

For offline/local mode, use:

```env
AI_PROVIDER=mock
```

For real AI generation, configure an OpenAI-compatible key, base URL, and model
in `api/.env`.

## License

No license file is currently included. Add a license before distributing or
publishing the project.
