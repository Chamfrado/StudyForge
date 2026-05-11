# StudyForge API

StudyForge API is an AI-powered study backend built with FastAPI, PostgreSQL,
SQLAlchemy, Alembic, JWT authentication, and OpenAI-compatible LLM providers.

It lets users create subjects, upload study materials, generate summaries,
flashcards, and quizzes from those materials, track quiz attempts, and inspect
learning analytics.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Run with Docker](#run-with-docker)
- [Configure Groq AI](#configure-groq-ai)
- [Use Mock AI](#use-mock-ai)
- [Run Locally Without Docker](#run-locally-without-docker)
- [Database Migrations](#database-migrations)
- [API Quickstart](#api-quickstart)
- [Main Endpoints](#main-endpoints)
- [Development Commands](#development-commands)
- [Troubleshooting](#troubleshooting)

## Features

- User registration, login, and JWT-protected routes
- Subject CRUD for organizing study content
- Material upload for UTF-8 `.txt` and `.md` files
- AI-generated summaries from uploaded material
- AI-generated flashcards with CSV export
- AI-generated multiple-choice quizzes
- Quiz attempt scoring and attempt history
- Overview and per-subject analytics
- Dockerized API and PostgreSQL database
- Alembic migrations executed automatically in Docker
- Groq/OpenAI-compatible AI provider support
- Mock AI provider for local development without an API key

## Tech Stack

- Python 3.12+
- FastAPI
- PostgreSQL 16
- SQLAlchemy 2 async ORM
- Alembic
- Pydantic Settings
- JWT authentication with `python-jose`
- Argon2 password hashing via `pwdlib`
- OpenAI Python SDK for OpenAI-compatible providers such as Groq
- Docker and Docker Compose

## Project Structure

```text
.
|-- alembic/                  # Database migrations
|-- app/
|   |-- core/                 # Config, database, security helpers
|   |-- modules/
|   |   |-- ai/               # AI provider, prompts, generation service
|   |   |-- analytics/        # Learning analytics endpoints
|   |   |-- auth/             # Registration, login, current user
|   |   |-- flashcards/       # Flashcard listing, deletion, CSV export
|   |   |-- materials/        # File upload and material storage
|   |   |-- quizzes/          # Quizzes and attempts
|   |   |-- subjects/         # Subject CRUD
|   |   |-- summaries/        # Summary model/schema
|   |   `-- users/            # User model/schema
|   `-- main.py               # FastAPI app entrypoint
|-- storage/                  # Uploaded material files, mounted in Docker
|-- docker-compose.yml        # API + PostgreSQL services
|-- docker-entrypoint.sh      # Runs migrations, then starts the API
|-- dockerfile                # API image
|-- pyproject.toml            # Python package and dependencies
`-- README.md
```

## Environment Variables

Create your local `.env` from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Available settings:

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `APP_NAME` | No | `StudyForge API` | Name shown in health responses and OpenAPI docs. |
| `APP_ENV` | No | `development` | Runtime environment label. |
| `APP_DEBUG` | No | `true` | Enables SQLAlchemy debug logging when true. |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge` | Async database URL used by the API. |
| `JWT_SECRET_KEY` | Yes | `change-me-in-production` | Secret used to sign JWT access tokens. Replace in production. |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm. |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token lifetime in minutes. |
| `AI_PROVIDER` | No | `mock` | Use `mock`, `groq`, `openai-compatible`, or `openai_compatible`. |
| `OPENAI_COMPATIBLE_API_KEY` | Only for real AI | `gsk_...` | API key for Groq or another OpenAI-compatible provider. |
| `OPENAI_COMPATIBLE_BASE_URL` | Only for real AI | `https://api.groq.com/openai/v1` | OpenAI-compatible API base URL. |
| `OPENAI_COMPATIBLE_MODEL` | Only for real AI | `openai/gpt-oss-20b` | Model ID sent to the provider. |

## Run with Docker

Docker is the recommended setup because it starts both the API and PostgreSQL
with the correct networking.

1. Create `.env`:

```bash
cp .env.example .env
```

2. Choose the AI provider in `.env`.

For mock AI:

```env
AI_PROVIDER=mock
OPENAI_COMPATIBLE_API_KEY=
```

For Groq:

```env
AI_PROVIDER=groq
OPENAI_COMPATIBLE_API_KEY=gsk_your_groq_key_here
OPENAI_COMPATIBLE_BASE_URL=https://api.groq.com/openai/v1
OPENAI_COMPATIBLE_MODEL=openai/gpt-oss-20b
```

3. Start the stack:

```bash
docker compose up --build
```

4. Open the API:

- API base URL: `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc docs: `http://localhost:8000/redoc`

The API container runs:

```bash
python -m alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

PostgreSQL runs inside Docker on port `5432`, and is exposed to your host on
port `5433`.

Useful Docker commands:

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f postgres
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to delete the PostgreSQL volume
and lose local database data.

## Configure Groq AI

The real AI path uses the OpenAI Python SDK with a custom `base_url`, so Groq
works as an OpenAI-compatible provider.

1. Create a Groq API key from your Groq dashboard.
2. Put the key in `.env`:

```env
AI_PROVIDER=groq
OPENAI_COMPATIBLE_API_KEY=gsk_your_groq_key_here
OPENAI_COMPATIBLE_BASE_URL=https://api.groq.com/openai/v1
OPENAI_COMPATIBLE_MODEL=openai/gpt-oss-20b
```

3. Restart the API:

```bash
docker compose up --build
```

The AI module expects the provider to return strict JSON. If you change
`OPENAI_COMPATIBLE_MODEL`, choose a Groq model that supports chat completions
and reliable JSON output.

AI endpoints that use Groq:

- `POST /ai/materials/{material_id}/summary`
- `POST /ai/materials/{material_id}/flashcards`
- `POST /ai/materials/{material_id}/quiz`

## Use Mock AI

Mock AI is best for local development, demos, tests, and frontend integration
when you do not want to spend tokens or depend on an external provider.

Set:

```env
AI_PROVIDER=mock
OPENAI_COMPATIBLE_API_KEY=
```

The mock provider returns deterministic summaries, flashcards, and quizzes
based on a preview of the uploaded material.

## Run Locally Without Docker

Use this option when you already have PostgreSQL running locally.

1. Create and activate a virtual environment:

```bash
python -m venv .venv
```

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install --upgrade pip
pip install -e ".[dev]"
```

3. Create `.env`:

```bash
cp .env.example .env
```

For a local database exposed on port `5433`, keep:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge
```

4. Run migrations:

```bash
python -m alembic upgrade head
```

5. Start the API:

```bash
uvicorn app.main:app --reload
```

The local API will be available at `http://127.0.0.1:8000`.

## Database Migrations

Alembic migration files live in `alembic/versions`.

Run all migrations:

```bash
python -m alembic upgrade head
```

Create a new migration after model changes:

```bash
python -m alembic revision --autogenerate -m "describe the change"
```

Rollback one migration:

```bash
python -m alembic downgrade -1
```

The app uses `postgresql+asyncpg` at runtime. Alembic converts that URL to
`postgresql+psycopg` internally for synchronous migration execution.

## API Quickstart

The fastest way to explore the API is Swagger:

```text
http://localhost:8000/docs
```

Manual flow:

1. Register a user.
2. Login and copy the `access_token`.
3. Create a subject.
4. Upload a `.txt` or `.md` material for that subject.
5. Generate summary, flashcards, or quiz from the material.
6. Answer a quiz and review analytics.

### Register

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "strongpassword"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ada@example.com",
    "password": "strongpassword"
  }'
```

Use the returned token:

```bash
export TOKEN="paste_access_token_here"
```

PowerShell:

```powershell
$env:TOKEN = "paste_access_token_here"
```

### Create a Subject

```bash
curl -X POST http://localhost:8000/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biology",
    "description": "Cell biology and genetics"
  }'
```

### Upload Study Material

Only UTF-8 `.txt` and `.md` files are supported.

```bash
curl -X POST http://localhost:8000/materials/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "subject_id=paste_subject_id_here" \
  -F "title=Cell Structure Notes" \
  -F "file=@test-material.txt"
```

### Generate a Summary

```bash
curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Generate Flashcards

```bash
curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/flashcards \
  -H "Authorization: Bearer $TOKEN"
```

### Generate a Quiz

```bash
curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/quiz \
  -H "Authorization: Bearer $TOKEN"
```

### Submit a Quiz Attempt

```bash
curl -X POST http://localhost:8000/quizzes/paste_quiz_id_here/attempts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "question_id": "paste_question_id_here",
        "selected_answer": "A"
      }
    ]
  }'
```

## Main Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | API health check. |
| `POST` | `/auth/register` | No | Create a user account. |
| `POST` | `/auth/login` | No | Login and receive a JWT token. |
| `GET` | `/auth/me` | Yes | Get the current authenticated user. |
| `POST` | `/subjects` | Yes | Create a subject. |
| `GET` | `/subjects` | Yes | List subjects. |
| `GET` | `/subjects/{subject_id}` | Yes | Get one subject. |
| `PUT` | `/subjects/{subject_id}` | Yes | Update a subject. |
| `DELETE` | `/subjects/{subject_id}` | Yes | Delete a subject. |
| `POST` | `/materials/upload` | Yes | Upload a `.txt` or `.md` material. |
| `GET` | `/materials` | Yes | List uploaded materials. |
| `GET` | `/materials/{material_id}` | Yes | Get one material. |
| `DELETE` | `/materials/{material_id}` | Yes | Delete a material. |
| `POST` | `/ai/materials/{material_id}/summary` | Yes | Generate and save a summary. |
| `POST` | `/ai/materials/{material_id}/flashcards` | Yes | Generate and save flashcards. |
| `POST` | `/ai/materials/{material_id}/quiz` | Yes | Generate and save a quiz. |
| `GET` | `/flashcards` | Yes | List flashcards. |
| `GET` | `/flashcards/export/csv` | Yes | Export flashcards as CSV. |
| `GET` | `/flashcards/{flashcard_id}` | Yes | Get one flashcard. |
| `DELETE` | `/flashcards/{flashcard_id}` | Yes | Delete a flashcard. |
| `GET` | `/quizzes` | Yes | List quizzes. |
| `GET` | `/quizzes/{quiz_id}` | Yes | Get quiz questions. |
| `DELETE` | `/quizzes/{quiz_id}` | Yes | Delete a quiz. |
| `POST` | `/quizzes/{quiz_id}/attempts` | Yes | Submit quiz answers. |
| `GET` | `/quizzes/{quiz_id}/attempts` | Yes | List quiz attempts. |
| `GET` | `/analytics/overview` | Yes | Get global user study analytics. |
| `GET` | `/analytics/subjects/{subject_id}` | Yes | Get analytics for one subject. |

## Development Commands

Install development dependencies:

```bash
pip install -e ".[dev]"
```

Run tests:

```bash
pytest
```

Run linting:

```bash
ruff check .
```

Run the API locally with reload:

```bash
uvicorn app.main:app --reload
```

## Production Notes

- Replace `JWT_SECRET_KEY` with a strong secret before deploying.
- Keep `.env` out of version control.
- Use `AI_PROVIDER=mock` only for development or demos.
- Persist the `storage/` directory if uploaded files must survive deploys.
- Use managed PostgreSQL or a persistent Docker volume in production.
- Keep `APP_DEBUG=false` in production to avoid noisy SQL logging.
- Validate your selected Groq model before shipping, especially JSON output
  reliability for summaries, flashcards, and quizzes.

## Troubleshooting

### `OPENAI_COMPATIBLE_API_KEY is missing`

You set `AI_PROVIDER=groq`, `openai-compatible`, or `openai_compatible` without
an API key. Add:

```env
OPENAI_COMPATIBLE_API_KEY=gsk_your_groq_key_here
```

Or switch back to:

```env
AI_PROVIDER=mock
```

### `Unknown AI_PROVIDER`

Use one of:

```env
AI_PROVIDER=mock
AI_PROVIDER=groq
AI_PROVIDER=openai-compatible
AI_PROVIDER=openai_compatible
```

### Database connection fails locally

If using Docker PostgreSQL from your host machine, the database is exposed on
port `5433`, so use:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge
```

Inside Docker Compose, the API uses the internal service name:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@postgres:5432/studyforge
```

The Compose file already injects the Docker-internal value for the API service.

### Upload returns `Only .txt and .md files are supported`

The material upload service currently accepts only `.txt` and `.md` files.
Files must be UTF-8 encoded and cannot be empty.

### Port already in use

If `8000` is already used, change the API port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"
```

Then open `http://localhost:8001`.

If `5433` is already used, change the PostgreSQL host port:

```yaml
ports:
  - "5434:5432"
```

Then update local non-Docker `DATABASE_URL` to use port `5434`.

## License

No license file is currently included. Add one before distributing or publishing
the project.
