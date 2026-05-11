# StudyForge Web

This is the frontend project for StudyForge. It is a Next.js App Router
application that provides the authenticated learning dashboard, material
management, AI-generated flashcards, quiz practice, and analytics UI.

For the full-stack overview, see the root [README](../README.md). For backend
details, see [api/README.md](../api/README.md).

## Table of Contents

- [Responsibilities](#responsibilities)
- [Tech Stack](#tech-stack)
- [Route Map](#route-map)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment and API Proxy](#environment-and-api-proxy)
- [Scripts](#scripts)
- [API Client](#api-client)
- [Authentication Flow](#authentication-flow)
- [UI System](#ui-system)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Responsibilities

The web project owns the browser experience:

- Public entry page
- Login and registration screens
- JWT session persistence in `localStorage`
- Authenticated dashboard shell with sidebar/topbar
- Subject CRUD UI
- Material listing, upload, details, deletion, and AI actions
- Flashcard review with filtering, grouped cards, flipping, deletion, and CSV
  export
- Quiz listing, quiz answering, score feedback, and attempt history
- Global analytics dashboard
- Per-subject analytics dashboard

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form |
| Validation | Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |
| Utility helpers | `clsx`, `tailwind-merge` |

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Public landing/entry page |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Overview metrics and quick actions |
| `/dashboard/subjects` | Create, edit, search, and delete subjects |
| `/dashboard/subjects/[subjectId]/analytics` | Per-subject analytics |
| `/dashboard/materials` | List and delete uploaded materials |
| `/dashboard/materials/upload` | Upload a material and link it to a subject |
| `/dashboard/materials/[materialId]` | Material details, extracted text, and AI generation actions |
| `/dashboard/flashcards` | Review, filter, flip, delete, and export flashcards |
| `/dashboard/quizzes` | List and delete generated quizzes |
| `/dashboard/quizzes/[quizId]` | Answer quiz questions and review attempts |
| `/dashboard/analytics` | Global analytics dashboard |

## Project Structure

```text
web/
|-- src/
|   |-- app/
|   |   |-- dashboard/        # Authenticated app routes
|   |   |-- login/
|   |   |-- register/
|   |   |-- globals.css
|   |   `-- layout.tsx
|   |-- components/
|   |   |-- layout/           # Auth shell, sidebar, topbar
|   |   `-- ui/               # Button, Card, Input, Badge
|   |-- hooks/
|   |   `-- useAuth.ts
|   `-- lib/
|       |-- api.ts            # HTTP client for backend API
|       |-- auth.ts           # Token/user localStorage helpers
|       |-- types.ts          # Shared frontend API types
|       `-- utils.ts
|-- next.config.ts
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Setup

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend should be running at `http://127.0.0.1:8000` for API calls to work.

## Environment and API Proxy

The frontend API client uses:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
```

By default it calls `/api/*`. The Next.js rewrite in `next.config.ts` proxies
those requests to the local FastAPI backend:

```ts
{
  source: "/api/:path*",
  destination: "http://127.0.0.1:8000/:path*"
}
```

In Docker, the root Compose file sets:

```env
NEXT_PUBLIC_API_URL=/api
```

For a deployed frontend, set `NEXT_PUBLIC_API_URL` to the public backend URL or
configure an equivalent reverse proxy.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Build the production app |
| `npm run start` | Start a production Next.js server |
| `npm run lint` | Run ESLint |

## API Client

The API client lives in `src/lib/api.ts`. It handles:

- JSON requests with auth headers
- Multipart material uploads with `FormData`
- JWT expiration handling
- CSV export for flashcards
- Backend response typing via `src/lib/types.ts`

Main API groups:

- Auth: `register`, `login`, `me`
- Analytics: `getAnalyticsOverview`, `getSubjectAnalytics`
- Subjects: list, get, create, update, delete
- Materials: list, get, upload, delete
- AI actions: generate summary, flashcards, quiz
- Flashcards: list, get, delete, CSV export
- Quizzes: list, get, delete, submit attempt, list attempts

## Authentication Flow

1. `login` calls the backend and receives `access_token` plus `user`.
2. `src/lib/auth.ts` stores the token and user in `localStorage`.
3. `useAuth` checks local state and redirects unauthenticated dashboard users
   to `/login`.
4. API calls attach `Authorization: Bearer <token>` when auth is enabled.
5. A `401` clears local auth and redirects to `/login`.

Current storage keys:

```text
studyforge_access_token
studyforge_user
```

## UI System

Reusable primitives are in `src/components/ui`:

- `Button`
- `Card`
- `Input`
- `Badge`

Layout components are in `src/components/layout`:

- `AuthShell`
- `Sidebar`
- `Topbar`

Global styles live in `src/app/globals.css`. The app uses a restrained
dashboard visual language with high-contrast form controls and predictable
navigation.

## Development Workflow

Recommended full-stack workflow:

```bash
cd ..
docker compose up
```

Frontend-only workflow:

```bash
cd web
npm run dev
```

Run frontend checks:

```bash
npm run lint
npm run build
```

## Troubleshooting

### API calls return 404

Make sure the backend is running at:

```text
http://127.0.0.1:8000
```

Then verify the rewrite exists in `next.config.ts`.

### Browser redirects to login

The stored JWT is missing or expired. Login again, or clear:

```text
studyforge_access_token
studyforge_user
```

from browser local storage.

### Material upload fails

Supported extensions are:

```text
.txt, .md, .pdf, .docx
```

The backend must also be running and authenticated.

### Charts do not show data

Analytics are populated after subjects, materials, generated resources, and quiz
attempts exist for the logged-in user.

### Production build fails

Run:

```bash
npm install
npm run lint
npm run build
```

Fix TypeScript, route, or lint errors before deployment.
