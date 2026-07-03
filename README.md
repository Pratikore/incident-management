# Incident Management

A lightweight full-stack Incident Management application: a Spring Boot 3 REST API with an in-memory
store, plus a React + TypeScript UI to create, list, filter, view, and update incidents. Includes
token-based authentication with roles, an admin user-management screen, a dark-themed monitoring
dashboard with charts, and optional AI assists (incident summaries, severity recommendations, and
root-cause suggestions).

## Features

- Login screen with token-based auth; a default admin is seeded on first startup
- Role-based access (ADMIN / USER); admins can create users and manage roles
- Monitoring dashboard with stat cards, a system-health gauge, and status/severity/category charts
  plus a 7-day "new incidents" trend
- Incident categories (Networking, Infrastructure, Database, Application, Security, Hardware, Other)
  with create, filter, table, and dashboard support
- Dark theme (default) with a light/dark toggle, and glass-effect header and footer
- Full incident lifecycle: create, filter by severity/status/category, view details, update status
- Floating AI chatbot that answers questions from your live incident data (works free with no key; upgrades to any OpenAI-compatible LLM, e.g. Groq's free tier)
- AI assists: summaries, severity recommendations, and root-cause suggestions
- Robust error handling: consistent JSON API errors and a React error boundary in the UI

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Java 17, Spring Boot 3.3 (Web, Validation, Security), Maven |
| Storage   | In-memory, thread-safe `ConcurrentHashMap` (data resets on restart) |
| Auth      | Opaque bearer tokens + Spring Security, BCrypt-hashed passwords |
| AI        | Any OpenAI-compatible chat API via Spring `RestClient` (Groq free tier by default), with a live-data local assistant fallback |
| Frontend  | React 18, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS, Recharts |
| API Docs  | springdoc OpenAPI + Swagger UI |
| Packaging | Docker (multi-stage backend image, nginx-served frontend), Docker Compose |
| Testing   | JUnit 5 + MockMvc (backend), Vitest + React Testing Library (frontend) |

## Default Login

On first startup an admin account is seeded (configurable in `application.properties`):

```
username: admin
password: admin123
```

Log in with these credentials, then use the Users screen (admin only) to create additional users
with ADMIN or USER roles.

## Project Structure

The backend follows a conventional layered package layout under `com.pm.incidentservice`
(controller / service / repository / model / dto / mapper / exception / config / security / ai),
with request/response DTOs suffixed `*RequestDTO` / `*ResponseDTO` and static mapper classes that
translate between models and DTOs.

```
incident-management/
  backend/                         Spring Boot REST API
    Dockerfile                     Multi-stage build (Maven -> JRE)
    src/main/java/com/pm/incidentservice/
      controller/                  REST controllers (@RestController)
      service/                     Business logic (@Service)
      repository/                  In-memory stores (@Repository)
      model/                       Domain models and enums
      dto/                         *RequestDTO / *ResponseDTO
      mapper/                      IncidentMapper, UserMapper (model <-> DTO)
      exception/                   Custom exceptions + GlobalExceptionHandler
      config/                      App configuration and data seeding
      security/                    Token auth, filter, security config
      ai/                          AiService + local assistant
  frontend/                        React + TypeScript SPA
    Dockerfile                     Build (Vite) -> nginx
    nginx.conf                     Serves the SPA and proxies /api to backend
  docker-compose.yml               Runs backend + frontend together
  README.md
```

## Prerequisites

- Java 17+ and Maven 3.9+
- Node.js 18+ and npm
- (Optional) Docker + Docker Compose to run everything in containers

## Backend - Setup & Run

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

Run the backend tests:

```bash
mvn test
```

## Frontend - Setup & Run

```bash
cd frontend
npm install
npm run dev
```

The UI starts on `http://localhost:5173`. During development, requests to `/api` are proxied to the
backend on port 8080 (see `vite.config.ts`), so start the backend first.

Run the frontend tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Run with Docker

Each tier is containerized (mirroring the microservice-per-Dockerfile setup): the backend uses a
multi-stage Maven build producing a slim JRE image, and the frontend builds with Vite and is served
by nginx (which also proxies `/api` to the backend, so there are no CORS concerns).

Bring the whole stack up with one command from the `incident-management/` folder:

```bash
docker compose up --build
```

- Frontend (nginx): http://localhost:3000
- Backend API: http://localhost:8080

Optional environment variables (all have sensible defaults):

```bash
# Enable full conversational AI with a free Groq key
AI_API_KEY=gsk_...
# Override the seeded admin account
APP_DEFAULT_ADMIN_USERNAME=admin
APP_DEFAULT_ADMIN_PASSWORD=admin123
```

Build or run a single service directly if you prefer:

```bash
# Backend image
docker build -t incident-management-backend ./backend
docker run -p 8080:8080 incident-management-backend

# Frontend image
docker build -t incident-management-frontend ./frontend
docker run -p 3000:80 incident-management-frontend
```

Stop everything with `docker compose down`.

## API Docs (Swagger)

Interactive OpenAPI docs are available once the backend is running:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## Deploy for Free (Render + Vercel)

The repo includes ready-to-use configs to host the app publicly at no cost:

- `render.yaml` — Render Blueprint that deploys the backend as a free Docker web service.
- `frontend/vercel.json` — Vercel config that builds the SPA and proxies `/api/*` to the backend
  (so it stays same-origin, no CORS needed).

**Backend (Render):**
1. Push this repo to GitHub.
2. On Render: New → Blueprint, select the repo (it reads `render.yaml`). Or create a Docker web
   service manually with root directory `incident-management/backend`.
3. Note the generated URL, e.g. `https://incident-backend.onrender.com`.

**Frontend (Vercel):**
1. On Vercel: import the repo with root directory `incident-management/frontend`.
2. Edit `frontend/vercel.json` and replace the `destination` host with your actual Render backend
   URL, then redeploy.
3. Open the Vercel URL and log in with `admin` / `admin123`.

**Free-tier caveats:** the backend uses in-memory storage, so data resets on every restart. Render's
free service also sleeps after ~15 min idle and cold-starts (~30–60s for Java) on the next request.
The default admin is public, so treat the deployment as a demo only.

## AI Features (Bonus)

The assistant works out of the box for **free**: with no key configured, the chatbot answers
questions about your incidents directly from the live data (counts, criticals, per-category
breakdowns, health summary), and the other AI assists fall back to local heuristics.

To upgrade to full conversational AI, plug in any OpenAI-compatible provider. The defaults target
[Groq's free tier](https://console.groq.com/keys) — create a free key and set it before starting the backend:

```bash
# macOS / Linux
export AI_API_KEY=gsk_...
# Windows (PowerShell)
$env:AI_API_KEY="gsk_..."
```

Provider settings live in `backend/src/main/resources/application.properties` and can be overridden
by environment variables:

```
ai.api-key=${AI_API_KEY:${GROQ_API_KEY:${OPENAI_API_KEY:}}}
ai.base-url=${AI_BASE_URL:https://api.groq.com/openai/v1}   # e.g. https://api.openai.com/v1
ai.model=${AI_MODEL:llama-3.1-8b-instant}                   # e.g. gpt-4o-mini
```

This works with Groq, OpenAI, OpenRouter, Together, or any OpenAI-compatible endpoint — just set the
matching `AI_BASE_URL`, `AI_MODEL`, and key. If no key is set (or a call fails), everything gracefully
falls back to the local logic so the app keeps working. AI capabilities:

- Incident summaries (`POST /api/incidents/{id}/ai/summary`)
- Severity recommendations (`POST /api/incidents/ai/severity-recommendation`) - also available as
  "Suggest with AI" in the create form
- Root-cause suggestions (`POST /api/incidents/{id}/ai/root-cause`)

## REST API

All endpoints except `POST /api/auth/login` require an `Authorization: Bearer <token>` header.
Obtain a token from the login endpoint. User-management endpoints require the ADMIN role.

### Auth

| Method | Path                | Description |
|--------|---------------------|-------------|
| POST   | `/api/auth/login`   | Log in; returns `{ token, username, role }` |
| POST   | `/api/auth/logout`  | Revoke the current token |
| GET    | `/api/auth/me`      | Current authenticated user |

### Users (ADMIN only)

| Method | Path          | Description |
|--------|---------------|-------------|
| GET    | `/api/users`  | List users |
| POST   | `/api/users`  | Create a user with a role |

### Incidents

Base path: `/api/incidents`

| Method | Path                              | Description |
|--------|-----------------------------------|-------------|
| POST   | `/`                               | Create an incident (validated) |
| GET    | `/?severity=&status=`             | List incidents, optionally filtered |
| GET    | `/{id}`                           | Get incident details (404 if missing) |
| PATCH  | `/{id}/status`                    | Update incident status |
| POST   | `/ai/severity-recommendation`     | Recommend a severity from a description |
| POST   | `/{id}/ai/summary`                | Generate an AI summary |
| POST   | `/{id}/ai/root-cause`             | Suggest likely root causes |

Incidents can be filtered by any combination of `severity`, `status`, and `category`.

### AI Chat

| Method | Path            | Description |
|--------|-----------------|-------------|
| POST   | `/api/ai/chat`  | Chat with an assistant that has a live incident snapshot as context |

Request body: `{ "message": "...", "history": [{ "role": "user|assistant", "content": "..." }] }`.

### Incident model

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "category": "NETWORKING | INFRASTRUCTURE | DATABASE | APPLICATION | SECURITY | HARDWARE | OTHER",
  "status": "OPEN | IN_PROGRESS | RESOLVED | CLOSED",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "aiSummary": "string | null",
  "aiRootCause": "string | null"
}
```

### Example requests

Log in and capture a token:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)
```

Create:

```bash
curl -X POST http://localhost:8080/api/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Checkout errors","description":"Users see 500s at checkout","severity":"HIGH","category":"APPLICATION"}'
```

Filter:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/incidents?severity=HIGH&status=OPEN"
```

Update status:

```bash
curl -X PATCH http://localhost:8080/api/incidents/{id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED"}'
```

Create a user (admin token required):

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"operator1","password":"secret123","role":"USER"}'
```

## Validation & Error Handling

- Request bodies are validated with Jakarta Bean Validation (`title`, `description`, `severity`
  required on create; `status` required on update).
- A global `@RestControllerAdvice` returns consistent JSON errors:
  - `400` with a `errors` map for validation failures
  - `404` for unknown incident IDs

## Notes

- Persistence is in-memory by design; restarting the backend clears all incidents, users, and
  tokens (the default admin is re-seeded on the next start).
- The default admin credentials are configurable via `app.default-admin.username` /
  `app.default-admin.password` in `application.properties`.
- Authentication uses opaque bearer tokens stored in-memory; passwords are hashed with BCrypt.
- CORS allows `http://localhost:5173` by default (configurable via `app.cors.allowed-origins`).
```
