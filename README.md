# Khala Matrix

Monorepo for **Signal Atlas** — AI domain intelligence frontend and real-time backend services.

## Structure

```
khala-matrix/
├── frontend/       Next.js 16 (React 19, Tailwind v4, TypeScript)
├── backend/        Go (Fiber, WebSocket, Supabase)
├── shared/         OpenAPI spec — single source of truth for API contracts
├── scripts/        Monorepo-level dev scripts
├── docker-compose.yml
└── Makefile
```

## Quick Start

```bash
# Install all dependencies
make install

# Run frontend dev server (localhost:3000)
make dev-frontend

# Run backend dev server (localhost:8080)
make dev-backend
```

## Quality Checks

```bash
make lint    # ESLint (frontend) + go vet (backend)
make test    # Vitest (frontend) + go test (backend)
```

## Docker

```bash
make docker-up     # Build and start all services
make docker-down   # Stop all services
```

## API Contract

The shared OpenAPI spec lives at `shared/api/openapi.yaml` and defines all endpoints consumed by both frontend and backend.

## Docs

- Hot Topics API: `docs/api/hot-topics.md`
- OpenClaw Office UI Plan: `docs/openclaw-office-ui-plan.md`
