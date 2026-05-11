# StudyForge API

This is the backend project for StudyForge. It provides the FastAPI application,
PostgreSQL data model, JWT authentication, file extraction, AI generation
workflows, quiz scoring, analytics, migrations, and backend tests.

For the full-stack overview, see the root [README](../README.md). For frontend
details, see [web/README.md](../web/README.md).

## Table of Contents

- [Responsibilities](#responsibilities)
- [Tech Stack](#tech-stack)
- [Domain Model](#domain-model)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Run With Docker](#run-with-docker)
- [Run Locally](#run-locally)
- [Database Migrations](#database-migrations)
- [AI Providers](#ai-providers)
- [File Upload and Extraction](#file-upload-and-extraction)
- [API Quickstart](#api-quickstart)
- [Endpoint Reference](#endpoint-reference)
- [Testing and Linting](#testing-and-linting)
- [Operational Notes](#operational-notes)
- [Troubleshooting](#troubleshooting)

## Responsibilities

The API owns the server-side system of record:

- User registration and login
- JWT token issuance and authenticated route protection
- Subject CRUD
- Material upload, storage, and text extraction
- Summary generation
- Flashcard generation, listing, deletion, and CSV export
- Quiz generation, question storage, deletion, attempts, and scoring
- Global analytics for the authenticated user
- Per-subject analytics
- Database migrations
- Integration and service tests

## Tech Stack

| Area | Technology |
| --- | --- |
| Language | Python 3.12+ |
| Web framework | FastAPI |
| ASGI server | Uvicorn |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2 async ORM |
| Migrations | Alembic |
| Settings | Pydantic Settings |
| Auth | JWT with `python-jose` |
| Password hashing | Argon2 via `pwdlib` |
| AI SDK | OpenAI Python SDK |
| File extraction | Built-in text/Markdown handling, `pypdf`, `python-docx` |
| Testing | Pytest, AnyIO, HTTPX |
| Linting | Ruff |

## Domain Model

Core entities:

- User - account identity and owner of study data
- Subject - study category owned by a user
- Material - uploaded file, extracted text, and processing status
- Summary - AI-generated summary for a material
- Flashcard - AI-generated front/back study card
- Quiz - AI-generated quiz for a material
- Quiz Question - multiple-choice quiz question
- Quiz Attempt - submitted answers and score

High-level flow:

```text
User -> Subject -> Material -> Summary
                       |-> Flashcards
                       `-> Quiz -> Quiz Attempts -> Analytics
```

## Project Structure

```text
api/
|-- app/
|   |-- core/                 # Config, database, security
|   |-- modules/
|   |   |-- ai/               # Providers, prompts, service, routes
|   |   |-- analytics/        # Overview and subject analytics
|   |   |-- auth/             # Register, login, current user
|   |   |-- flashcards/       # Flashcard listing/export/deletion
|   |   |-- materials/        # Upload, extraction, storage
|   |   |-- quizzes/          # Quizzes, questions, attempts
|   |   |-- subjects/         # Subject CRUD
|   |   |-- summaries/        # Summary model/schema
|   |   `-- users/            # User model/schema
|   |-- shared/               # Text extraction helpers
|   `-- main.py               # FastAPI app
|-- alembic/
|   `-- versions/             # Migration files
|-- tests/
|-- storage/                  # Local uploaded material storage
|-- docker-compose.yml        # Alternate compose entrypoint from api/
|-- docker-compose.test.yml   # Test PostgreSQL service
|-- docker-entrypoint.sh      # API-only legacy entrypoint
|-- dockerfile                # API-only legacy image
|-- pyproject.toml
|-- .env.example
`-- README.md
```

## Environment Variables

Create `api/.env` from the example:

```powershell
Copy-Item api\.env.example api\.env
```

From inside `api/`:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp api/.env.example api/.env
```

Available settings:

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `APP_NAME` | No | `StudyForge API` | Name shown in health responses and docs |
| `APP_ENV` | No | `development` | Runtime environment label |
| `APP_DEBUG` | No | `true` | Enables SQLAlchemy debug logging when configured |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated browser origins |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge` | Async database URL |
| `JWT_SECRET_KEY` | Yes | `change-me-in-production` | Token signing secret |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token lifetime |
| `AI_PROVIDER` | No | `mock` | `mock`, `groq`, `openai-compatible`, or `openai_compatible` |
| `OPENAI_COMPATIBLE_API_KEY` | For real AI | `gsk_...` | API key for Groq or another compatible provider |
| `OPENAI_COMPATIBLE_BASE_URL` | For real AI | `https://api.groq.com/openai/v1` | OpenAI-compatible base URL |
| `OPENAI_COMPATIBLE_MODEL` | For real AI | `openai/gpt-oss-20b` | Chat model ID |

## Run With Docker

From the repository root, run the complete app:

```bash
docker compose up --build
```

After the first build:

```bash
docker compose up
```

Open:

```text
Web: http://localhost:3000
API: http://localhost:8000
Docs: http://localhost:8000/docs
```

The root Compose stack injects the Docker-internal database URL:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@postgres:5432/studyforge
```

PostgreSQL is exposed to the host at:

```text
localhost:5433
```

## Run Locally

Use this mode when PostgreSQL is already available.

From `api/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -e ".[dev]"
Copy-Item .env.example .env
python -m alembic upgrade head
uvicorn app.main:app --reload
```

macOS/Linux activation:

```bash
source .venv/bin/activate
```

Local API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Database Migrations

Run migrations:

```bash
python -m alembic upgrade head
```

Create a migration:

```bash
python -m alembic revision --autogenerate -m "describe the change"
```

Rollback one migration:

```bash
python -m alembic downgrade -1
```

Runtime uses `postgresql+asyncpg`. Alembic converts the URL internally for
synchronous migration execution where needed.

## AI Providers

### Mock Provider

Best for tests, local development, and demos:

```env
AI_PROVIDER=mock
OPENAI_COMPATIBLE_API_KEY=
```

The mock provider returns deterministic generated content from uploaded text.

### Groq or OpenAI-Compatible Provider

```env
AI_PROVIDER=groq
OPENAI_COMPATIBLE_API_KEY=gsk_your_key_here
OPENAI_COMPATIBLE_BASE_URL=https://api.groq.com/openai/v1
OPENAI_COMPATIBLE_MODEL=openai/gpt-oss-20b
```

The AI service expects structured JSON-like outputs for summaries, flashcards,
and quizzes. Validate any model change before using it in production.

## File Upload and Extraction

Supported material extensions:

```text
.txt, .md, .pdf, .docx
```

Extraction behavior:

- `.txt` and `.md` are decoded as UTF-8 text.
- `.pdf` is parsed with `pypdf`.
- `.docx` is parsed with `python-docx`.
- Empty or unsupported files are rejected.
- Uploaded files are stored under `api/storage/` in local/dev mode.

## API Quickstart

1. Register:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Ada Lovelace\",\"email\":\"ada@example.com\",\"password\":\"strongpassword\"}"
```

2. Login:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ada@example.com\",\"password\":\"strongpassword\"}"
```

3. Use the returned access token:

```powershell
$env:TOKEN = "paste_access_token_here"
```

4. Create a subject:

```bash
curl -X POST http://localhost:8000/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Biology\",\"description\":\"Cell biology and genetics\"}"
```

5. Upload material:

```bash
curl -X POST http://localhost:8000/materials/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "subject_id=paste_subject_id_here" \
  -F "title=Cell Structure Notes" \
  -F "file=@notes.pdf"
```

6. Generate study resources:

```bash
curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/summary \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/flashcards \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/ai/materials/paste_material_id_here/quiz \
  -H "Authorization: Bearer $TOKEN"
```

## Endpoint Reference

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/register` | No | Register user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/auth/me` | Yes | Current user |
| `GET` | `/subjects` | Yes | List subjects |
| `POST` | `/subjects` | Yes | Create subject |
| `GET` | `/subjects/{subject_id}` | Yes | Get subject |
| `PUT` | `/subjects/{subject_id}` | Yes | Update subject |
| `DELETE` | `/subjects/{subject_id}` | Yes | Delete subject |
| `GET` | `/materials` | Yes | List materials |
| `POST` | `/materials/upload` | Yes | Upload material |
| `GET` | `/materials/{material_id}` | Yes | Get material |
| `DELETE` | `/materials/{material_id}` | Yes | Delete material |
| `POST` | `/ai/materials/{material_id}/summary` | Yes | Generate summary |
| `POST` | `/ai/materials/{material_id}/flashcards` | Yes | Generate flashcards |
| `POST` | `/ai/materials/{material_id}/quiz` | Yes | Generate quiz |
| `GET` | `/flashcards` | Yes | List flashcards |
| `GET` | `/flashcards/export/csv` | Yes | Export CSV |
| `GET` | `/flashcards/{flashcard_id}` | Yes | Get flashcard |
| `DELETE` | `/flashcards/{flashcard_id}` | Yes | Delete flashcard |
| `GET` | `/quizzes` | Yes | List quizzes |
| `GET` | `/quizzes/{quiz_id}` | Yes | Get quiz with questions |
| `DELETE` | `/quizzes/{quiz_id}` | Yes | Delete quiz |
| `POST` | `/quizzes/{quiz_id}/attempts` | Yes | Submit attempt |
| `GET` | `/quizzes/{quiz_id}/attempts` | Yes | List attempts |
| `GET` | `/analytics/overview` | Yes | Global analytics |
| `GET` | `/analytics/subjects/{subject_id}` | Yes | Subject analytics |

## Testing and Linting

Start the test database:

```bash
docker compose -f docker-compose.test.yml up -d postgres-test
```

Run tests:

```bash
pytest
```

Stop the test database:

```bash
docker compose -f docker-compose.test.yml down -v
```

Run linting:

```bash
ruff check .
```

Default test database URL:

```env
postgresql+asyncpg://studyforge:studyforge@localhost:5434/studyforge_test
```

Override it with `TEST_DATABASE_URL` when needed.

## Operational Notes

- Use a strong `JWT_SECRET_KEY` in production.
- Do not commit real `.env` files.
- Persist `api/storage/` if uploaded files must survive deployments.
- Use managed PostgreSQL for production.
- Keep `APP_DEBUG=false` in production.
- Use `AI_PROVIDER=mock` only outside production.
- Validate model output quality for summaries, flashcards, and quizzes.

## Troubleshooting

### Database connection fails

Host process connecting to Docker PostgreSQL:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@localhost:5433/studyforge
```

Container process connecting inside Compose:

```env
DATABASE_URL=postgresql+asyncpg://studyforge:studyforge@postgres:5432/studyforge
```

### `OPENAI_COMPATIBLE_API_KEY is missing`

Either configure a key:

```env
OPENAI_COMPATIBLE_API_KEY=gsk_your_key_here
```

or use mock mode:

```env
AI_PROVIDER=mock
```

### Upload is rejected

Use one of:

```text
.txt, .md, .pdf, .docx
```

Make sure the file is not empty and can be parsed.

### CORS blocks browser requests

Add your frontend origin:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Restart the API after editing `.env`.
