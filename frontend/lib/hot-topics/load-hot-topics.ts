import { cache } from "react";
import { MOCK_HOT_TOPICS_PAGE_DATA } from "./mock-data";
import { HotTopicsPageData, LoadedHotTopicsPageData } from "./types";

const BACKEND_ENDPOINT = "/v1/hot-topics/page-data";
const FETCH_TIMEOUT_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isHotTopicsPageData(value: unknown): value is HotTopicsPageData {
  if (!isRecord(value)) {
    return false;
  }

  const payload = value;

  return (
    typeof payload.generatedAt === "string" &&
    typeof payload.headline === "string" &&
    typeof payload.subheadline === "string" &&
    Array.isArray(payload.stats) &&
    Array.isArray(payload.topics) &&
    Array.isArray(payload.briefing) &&
    isStringArray(payload.watchlist) &&
    Array.isArray(payload.sources)
  );
}

async function fetchBackendPayload(baseUrl: string): Promise<HotTopicsPageData> {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedBaseUrl}${BACKEND_ENDPOINT}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`backend returned status ${response.status}`);
    }

    const payload = (await response.json()) as unknown;

    if (!isHotTopicsPageData(payload)) {
      throw new Error("backend payload does not match HotTopicsPageData shape");
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export const loadHotTopicsPageData = cache(
  async (): Promise<LoadedHotTopicsPageData> => {
    const source = process.env.AI_TOPICS_DATA_SOURCE ?? "mock";

    if (source !== "backend") {
      return {
        mode: "mock",
        data: MOCK_HOT_TOPICS_PAGE_DATA,
      };
    }

    const apiBaseUrl = process.env.AI_TOPICS_API_BASE_URL;

    if (!apiBaseUrl) {
      console.warn(
        "AI_TOPICS_API_BASE_URL is not configured. Falling back to mock data.",
      );

      return {
        mode: "mock",
        data: MOCK_HOT_TOPICS_PAGE_DATA,
      };
    }

    try {
      const backendData = await fetchBackendPayload(apiBaseUrl);

      return {
        mode: "backend",
        data: backendData,
      };
    } catch (error) {
      console.warn(
        "Unable to load backend hot topics payload. Falling back to mock data.",
        error,
      );

      return {
        mode: "mock",
        data: MOCK_HOT_TOPICS_PAGE_DATA,
      };
    }
  },
);
