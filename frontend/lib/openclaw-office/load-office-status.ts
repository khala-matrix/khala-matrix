import {
  OpenclawAgent,
  OpenclawAgentStatus,
  OpenclawGatewayStatusUpdate,
  OpenclawOfficeSnapshot,
} from "./types";
import { MOCK_OPENCLAW_OFFICE_SNAPSHOT } from "./mock-data";

const DEFAULT_AGENT_STATUS_URL = "http://127.0.0.1:18789/v1/agents/status";
const DEFAULT_GATEWAY_LATEST_STATUS_URL =
  "http://127.0.0.1:18789/v1/gateway/status/latest";
const FETCH_TIMEOUT_MS = 2500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstString(
  source: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function toIsoDate(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return fallback;
  }

  return new Date(timestamp).toISOString();
}

export function normalizeAgentStatus(raw: string | null): OpenclawAgentStatus {
  if (!raw) {
    return "offline";
  }

  const normalized = raw.toLowerCase();

  if (["error", "failed", "failure", "panic", "crashed"].includes(normalized)) {
    return "error";
  }

  if (["offline", "disconnected", "down", "unreachable"].includes(normalized)) {
    return "offline";
  }

  if (["busy", "queued", "blocked", "waiting"].includes(normalized)) {
    return "busy";
  }

  if (["running", "active", "working", "executing"].includes(normalized)) {
    return "running";
  }

  if (["idle", "ready", "online"].includes(normalized)) {
    return "idle";
  }

  return "idle";
}

function parseAgentRecord(
  value: unknown,
  fallbackTimestamp: string,
): OpenclawAgent | null {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    firstString(value, ["id", "agentId", "agent_id", "name"]) ??
    "agent-unknown";
  const name = firstString(value, ["name", "displayName", "label"]) ?? id;
  const status = normalizeAgentStatus(
    firstString(value, ["status", "state", "agentStatus"]),
  );
  const owner = firstString(value, ["owner", "team", "pool"]) ?? "Unassigned";
  const task =
    firstString(value, ["task", "currentTask", "message"]) ??
    "No active task provided.";
  const lastHeartbeatAt = toIsoDate(
    firstString(value, ["lastHeartbeatAt", "heartbeatAt", "lastSeenAt"]),
    fallbackTimestamp,
  );
  const updatedAt = toIsoDate(
    firstString(value, ["updatedAt", "timestamp", "at", "time"]),
    lastHeartbeatAt,
  );

  return {
    id,
    name,
    status,
    owner,
    task,
    lastHeartbeatAt,
    updatedAt,
  };
}

function getAgentsArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  if (Array.isArray(payload.agents)) {
    return payload.agents;
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.agents)) {
    return payload.data.agents;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return null;
}

function extractCapturedAt(payload: unknown, fallbackTimestamp: string): string {
  if (!isRecord(payload)) {
    return fallbackTimestamp;
  }

  return toIsoDate(
    firstString(payload, ["capturedAt", "generatedAt", "timestamp", "updatedAt"]),
    fallbackTimestamp,
  );
}

export function parseAgentStatusPayload(
  payload: unknown,
  now = new Date().toISOString(),
): Pick<OpenclawOfficeSnapshot, "capturedAt" | "agents"> {
  const capturedAt = extractCapturedAt(payload, now);
  const rawAgents = getAgentsArray(payload);

  if (!rawAgents) {
    throw new Error("agent status payload missing agents array");
  }

  const agents = rawAgents
    .map((entry) => parseAgentRecord(entry, capturedAt))
    .filter((entry): entry is OpenclawAgent => entry !== null);

  if (agents.length === 0) {
    throw new Error("agent status payload contains no valid agents");
  }

  return {
    capturedAt,
    agents,
  };
}

function parseGatewayUpdateRecord(
  value: unknown,
  fallbackTimestamp: string,
): OpenclawGatewayStatusUpdate | null {
  if (!isRecord(value)) {
    return null;
  }

  const agentId =
    firstString(value, ["agentId", "agent_id", "id", "agent"]) ?? null;

  if (!agentId) {
    return null;
  }

  return {
    agentId,
    status: normalizeAgentStatus(
      firstString(value, ["status", "state", "agentStatus"]),
    ),
    message:
      firstString(value, ["message", "task", "summary"]) ??
      "Gateway update received.",
    at: toIsoDate(
      firstString(value, ["at", "timestamp", "updatedAt", "time"]),
      fallbackTimestamp,
    ),
  };
}

export function parseLatestGatewayStatusPayload(
  payload: unknown,
  now = new Date().toISOString(),
): OpenclawGatewayStatusUpdate | null {
  if (Array.isArray(payload)) {
    return parseGatewayUpdateRecord(payload[payload.length - 1], now);
  }

  if (!isRecord(payload)) {
    return null;
  }

  if (payload.latestUpdate) {
    return parseGatewayUpdateRecord(payload.latestUpdate, now);
  }

  if (isRecord(payload.data) && payload.data.latestUpdate) {
    return parseGatewayUpdateRecord(payload.data.latestUpdate, now);
  }

  if (payload.event) {
    return parseGatewayUpdateRecord(payload.event, now);
  }

  return parseGatewayUpdateRecord(payload, now);
}

function cloneMockSnapshot(): OpenclawOfficeSnapshot {
  return {
    source: "mock",
    capturedAt: new Date().toISOString(),
    lastGatewayUpdate: MOCK_OPENCLAW_OFFICE_SNAPSHOT.lastGatewayUpdate,
    agents: MOCK_OPENCLAW_OFFICE_SNAPSHOT.agents.map((agent) => ({ ...agent })),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`request failed with status ${response.status}`);
    }

    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadOpenclawOfficeSnapshot(): Promise<OpenclawOfficeSnapshot> {
  const source = process.env.OPENCLAW_OFFICE_DATA_SOURCE ?? "live";

  if (source === "mock") {
    return cloneMockSnapshot();
  }

  const url = process.env.OPENCLAW_AGENT_STATUS_URL ?? DEFAULT_AGENT_STATUS_URL;

  try {
    const payload = await fetchJson(url);
    const { capturedAt, agents } = parseAgentStatusPayload(payload);

    return {
      source: "live",
      capturedAt,
      agents,
      lastGatewayUpdate: null,
    };
  } catch (error) {
    console.warn(
      "Unable to load OpenClaw agent status from local endpoint. Falling back to mock data.",
      error,
    );

    return cloneMockSnapshot();
  }
}

export async function loadLatestGatewayStatusUpdate(): Promise<OpenclawGatewayStatusUpdate | null> {
  const source = process.env.OPENCLAW_OFFICE_DATA_SOURCE ?? "live";

  if (source === "mock") {
    return MOCK_OPENCLAW_OFFICE_SNAPSHOT.lastGatewayUpdate;
  }

  const url =
    process.env.OPENCLAW_GATEWAY_LATEST_STATUS_URL ??
    DEFAULT_GATEWAY_LATEST_STATUS_URL;

  try {
    const payload = await fetchJson(url);
    return parseLatestGatewayStatusPayload(payload);
  } catch (error) {
    console.warn(
      "Unable to load latest OpenClaw gateway status update. Continuing without a live update.",
      error,
    );

    return null;
  }
}

export function applyGatewayUpdate(
  snapshot: OpenclawOfficeSnapshot,
  update: OpenclawGatewayStatusUpdate | null,
): OpenclawOfficeSnapshot {
  if (!update) {
    return snapshot;
  }

  const existingAgent = snapshot.agents.find((agent) => agent.id === update.agentId);
  const nextAgent: OpenclawAgent = existingAgent
    ? {
        ...existingAgent,
        status: update.status,
        task: update.message,
        updatedAt: update.at,
      }
    : {
        id: update.agentId,
        name: update.agentId,
        status: update.status,
        owner: "Gateway",
        task: update.message,
        lastHeartbeatAt: update.at,
        updatedAt: update.at,
      };

  const agents = existingAgent
    ? snapshot.agents.map((agent) =>
        agent.id === update.agentId ? nextAgent : agent,
      )
    : [nextAgent, ...snapshot.agents];

  return {
    ...snapshot,
    capturedAt: update.at,
    agents,
    lastGatewayUpdate: update,
  };
}
