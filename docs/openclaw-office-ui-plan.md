# KHA-11 OpenClaw Office UI Implementation Plan

## Goal

Deliver a new OpenClaw Office UI view that shows live agent operational status, connects to a local status service at `127.0.0.1:18789`, and applies latest status updates from the OpenClaw gateway.

## Scope

1. Add a dedicated `/office` view in the Next.js app.
2. Fetch current agent status snapshot from `127.0.0.1:18789`.
3. Fetch latest gateway status updates and merge them into the UI state.
4. Create pixel-style status assets for each agent state.
5. Keep a mock fallback mode for local development resilience.

## Data Flow

1. Server-render `/office` with an initial agent snapshot.
2. Read snapshot from local status endpoint:
   - `OPENCLAW_AGENT_STATUS_URL` (default `http://127.0.0.1:18789/v1/agents/status`)
3. Client polls for latest gateway update:
   - `OPENCLAW_GATEWAY_LATEST_STATUS_URL` (default `http://127.0.0.1:18789/v1/gateway/status/latest`)
4. UI merges latest gateway event into current in-memory snapshot.
5. If live fetch fails, fallback to typed mock payload.

## UI Plan

1. Build an operations-focused Office layout with:
   - environment and connection status,
   - per-status summary counters,
   - agent cards showing owner/task/last update.
2. Map each agent state to a pixel icon:
   - `idle`, `running`, `busy`, `offline`, `error`.

## API Surface Inside Next.js

1. `GET /api/v1/openclaw/agents/status`
   - returns current status snapshot from local service with fallback behavior.
2. `GET /api/v1/openclaw/gateway/latest`
   - returns latest gateway update object.

## Verification Plan

1. Unit test parsers and update-merging logic.
2. Render test for `/office` page.
3. Run:
   - `npm run lint`
   - `npm run test`

## Definition of Done

1. New office view is accessible and renders agent states.
2. Live status is fetched from `127.0.0.1:18789` when available.
3. Gateway latest updates are reflected in UI without full page refresh.
4. Pixel status assets are generated and used in the UI.
5. Lint/tests pass.
