export const OPENCLAW_AGENT_STATUSES = [
  "idle",
  "running",
  "busy",
  "offline",
  "error",
] as const;

export type OpenclawAgentStatus = (typeof OPENCLAW_AGENT_STATUSES)[number];

export type OpenclawAgent = {
  id: string;
  name: string;
  status: OpenclawAgentStatus;
  owner: string;
  task: string;
  lastHeartbeatAt: string;
  updatedAt: string;
};

export type OpenclawGatewayStatusUpdate = {
  agentId: string;
  status: OpenclawAgentStatus;
  message: string;
  at: string;
};

export type OpenclawOfficeSnapshot = {
  source: "mock" | "live";
  capturedAt: string;
  agents: OpenclawAgent[];
  lastGatewayUpdate: OpenclawGatewayStatusUpdate | null;
};
