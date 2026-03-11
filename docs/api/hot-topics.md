# AI Domain Hot Topics API Contract

This document defines the backend API expected by the frontend for full page data loading.

## Purpose

- Deliver one payload that hydrates the homepage and dashboard.
- Keep frontend rendering consistent through one typed contract.
- Allow demo mode before backend is ready by using shared mock data.

## Runtime Modes

- `AI_TOPICS_DATA_SOURCE=mock` (default): frontend uses bundled mock payload.
- `AI_TOPICS_DATA_SOURCE=backend`: frontend requests backend endpoint.
- `AI_TOPICS_API_BASE_URL`: required when `AI_TOPICS_DATA_SOURCE=backend`.

Example:

```bash
AI_TOPICS_DATA_SOURCE=backend
AI_TOPICS_API_BASE_URL=https://api.example.com
```

## Required Endpoint

### `GET /v1/hot-topics/page-data`

Returns the full dataset for homepage + dashboard.

#### Response `200 application/json`

```json
{
  "generatedAt": "2026-03-11T07:35:00.000Z",
  "headline": "AI Domain Hot Topics",
  "subheadline": "A daily operating view of where AI attention, capital, and product velocity are moving.",
  "stats": [
    {
      "id": "active-domains",
      "label": "Active domains tracked",
      "value": "18",
      "delta": "+3 this month"
    }
  ],
  "topics": [
    {
      "id": "multimodal-models",
      "title": "Multimodal foundation models",
      "domain": "Model Platforms",
      "summary": "Teams are shipping single-model pipelines for text, image, and video operations in production customer workflows.",
      "heatScore": 93,
      "weeklyGrowthPercent": 12.2,
      "maturity": "mainstream",
      "notableSignals": [
        "Cross-modal API bundling in major cloud SKUs"
      ],
      "updatedAt": "2026-03-10"
    }
  ],
  "briefing": [
    {
      "id": "brief-2026-03-11",
      "date": "2026-03-11",
      "headline": "Enterprises consolidate AI copilots into domain-specific suites",
      "impact": "Procurement shifts from broad assistants toward workflow-native copilots with measurable unit economics."
    }
  ],
  "watchlist": [
    "Model context protocol standardization progress"
  ],
  "sources": [
    {
      "id": "source-arxiv",
      "name": "arXiv AI",
      "type": "paper",
      "url": "https://arxiv.org/list/cs.AI/recent",
      "lastCheckedAt": "2026-03-11T06:15:00.000Z"
    }
  ]
}
```

#### Field Constraints

- `generatedAt`, `lastCheckedAt`: ISO-8601 UTC datetime strings.
- `updatedAt`, `date`: `YYYY-MM-DD`.
- `maturity`: one of `emerging | scaling | mainstream`.
- `heatScore`: integer `0-100`.
- `weeklyGrowthPercent`: decimal percent value.
- Arrays must be present (empty arrays allowed).

## Local Mock API Route

For UI/demo testing, Next.js exposes:

- `GET /api/v1/hot-topics/page-data`

This returns the same contract with mock values and current `generatedAt`.

## Frontend Mapping

- Homepage: hero, stats, top topic cards, timeline, watchlist, source cards.
- Dashboard: topic score table, watchlist, source registry.
- Contract types: `lib/hot-topics/types.ts`.
- Loader + fallback logic: `lib/hot-topics/load-hot-topics.ts`.
- Mock data fixture: `lib/hot-topics/mock-data.ts`.
