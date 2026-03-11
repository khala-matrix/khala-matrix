# Signal Atlas (KHA-9)

Modern Next.js website for **AI Domain Hot Topics** with a backend-ready data contract and mock data fallback.

## Run

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

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
