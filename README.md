# Signal Atlas (KHA-9)

Modern Next.js website for **AI Domain Hot Topics** with a backend-ready data contract and mock data fallback.
KHA-11 adds an **OpenClaw Office** view for live agent status operations.

## Run

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## OpenClaw Office View

- Route: `http://localhost:3000/office`
- Agent snapshot source (default): `http://127.0.0.1:18789/v1/agents/status`
- Gateway latest update source (default): `http://127.0.0.1:18789/v1/gateway/status/latest`

Environment variables:

```bash
OPENCLAW_OFFICE_DATA_SOURCE=live   # or mock
OPENCLAW_AGENT_STATUS_URL=http://127.0.0.1:18789/v1/agents/status
OPENCLAW_GATEWAY_LATEST_STATUS_URL=http://127.0.0.1:18789/v1/gateway/status/latest
```

Implementation plan: `docs/openclaw-office-ui-plan.md`

## Data Loading Modes

The frontend uses `lib/hot-topics/load-hot-topics.ts`.

- Default: mock mode (`AI_TOPICS_DATA_SOURCE=mock`)
- Backend mode: set both

```bash
AI_TOPICS_DATA_SOURCE=backend
AI_TOPICS_API_BASE_URL=https://api.example.com
```

If backend fetch fails or env vars are missing, the loader falls back to mock data.

## API Contract

- API documentation: `docs/api/hot-topics.md`
- Shared types: `lib/hot-topics/types.ts`
- Mock payload: `lib/hot-topics/mock-data.ts`
- Local mock endpoint: `GET /api/v1/hot-topics/page-data`

## Quality Checks

```bash
npm run lint
npm run test
```
