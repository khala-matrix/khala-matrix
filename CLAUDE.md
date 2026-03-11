# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Khala Matrix** — monorepo for Signal Atlas, an AI domain intelligence platform. Next.js frontend, Go backend with WebSocket, Supabase Cloud for persistence, and a shared OpenAPI contract.

## Monorepo Layout

```
frontend/          Next.js 16 (React 19, Tailwind v4, TypeScript)
backend/           Go (Fiber v2, WebSocket, pgx → Supabase Cloud)
shared/api/        OpenAPI 3.1 spec (single source of truth)
supabase/          SQL migrations for Supabase Cloud
docs/              Project documentation
```

## Commands

### Root (Makefile)

```bash
make install         # npm install + go mod download
make dev-frontend    # next dev on :3000
make dev-backend     # go run on :8080
make lint            # eslint + go vet
make test            # vitest + go test
make build           # next build + go build
make docker-up       # docker compose up --build -d
make docker-down     # docker compose down
```

### Frontend (from `frontend/`)

```bash
npm run dev / build / lint / test
npx vitest run <path>    # single test file
```

### Backend (from `backend/`)

```bash
go run ./cmd/server      # start server (requires DATABASE_URL)
go test ./... / go vet ./...
air                      # hot-reload dev
```

## Architecture

### Data Flow

```
OpenClaw Gateway ──WS──► Backend ──SQL──► Supabase Cloud
                          │   ▲
Frontend ◄────────WS──────┘   │
                              │
External Services ──Webhook───┘
```

- Backend is an **upstream WS client** to OpenClaw gateway, receiving agent status changes, persisting to Supabase, and broadcasting to frontend via its own WS hub.
- Hot Topics data is written externally (future skills/agents), backend reads from Supabase.
- Webhook endpoint (`POST /v1/webhooks/:source`) accepts events from Linear, GitHub, etc.

### API Contract

`shared/api/openapi.yaml` defines all endpoints. Update the spec first when changing an endpoint.

### Backend Structure (Go)

- `cmd/server/` — entrypoint, wires store → services → handlers → Fiber app
- `internal/config/` — env-based config (`DATABASE_URL`, `OPENCLAW_GATEWAY_WS_URL`, etc.)
- `internal/store/` — pgx-based database layer (Supabase Cloud via direct PostgreSQL)
- `internal/service/` — business logic (hot topics, office)
- `internal/handler/` — HTTP handlers (hot topics, office, WebSocket, webhooks)
- `internal/middleware/` — CORS, logging, recovery
- `internal/model/` — shared data types (mirrors OpenAPI schemas)
- `internal/ws/` — WebSocket hub: typed `Event{Type, Data}`, broadcast to connected clients
- `internal/upstream/` — OpenClaw gateway WS client (auto-reconnect)

### Database (Supabase)

Schema lives in `supabase/migrations/`. Tables:

- **Hot Topics**: `page_configs`, `topics`, `market_stats`, `briefing_items`, `source_feeds`
- **Office**: `agents`, `agent_status_log`
- **Webhooks**: `webhook_events`

RLS enabled: public read for display tables, service_role write for backend.

### Frontend Data Loading

Mock/live fallback pattern in `frontend/lib/*/load-*.ts`. Env vars toggle data source; loader falls back to mock on failure. Types in `frontend/lib/*/types.ts`.

### WebSocket Events (backend → frontend)

| Event Type | Data | Trigger |
|---|---|---|
| `agent_status_change` | `Agent` object | OpenClaw gateway push |
| `webhook_received` | `{id, source, eventType}` | Incoming webhook |

### Routes

| Endpoint | Method | Description |
|---|---|---|
| `/v1/hot-topics/page-data` | GET | Full hot topics payload |
| `/v1/agents/status` | GET | Agent snapshot from Supabase |
| `/v1/ws` | GET | WebSocket upgrade |
| `/v1/webhooks/:source` | POST | Generic webhook receiver |
| `/healthz` | GET | Health check |

Frontend pages: `/` (home), `/dashboard`, `/office`, `/login`

### CI/CD

Two GitHub Actions workflows with path filters:
- `.github/workflows/frontend-cicd.yml` — triggers on `frontend/**`
- `.github/workflows/backend-cicd.yml` — triggers on `backend/**`

Both deploy Docker containers to a self-hosted Mac Mini.

### Path Alias (frontend)

`@/*` maps to `frontend/` root (tsconfig + vitest config).

### Environment Variables

Backend (`backend/.env`):
- `DATABASE_URL` — Supabase PostgreSQL connection string (required)
- `OPENCLAW_GATEWAY_WS_URL` — upstream WS URL (optional, disables upstream if unset)
- `PORT` — server port (default 8080)
- `FRONTEND_ORIGIN` — CORS origin (default http://localhost:3000)

Frontend (`frontend/.env`):
- `AI_TOPICS_DATA_SOURCE` — `mock` or `backend`
- `AI_TOPICS_API_BASE_URL` — backend URL when using backend mode
- `OPENCLAW_OFFICE_DATA_SOURCE` — `mock` or `live`
