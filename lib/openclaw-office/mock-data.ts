import {
  OpenclawOfficeSnapshot,
  OpenclawGatewayStatusUpdate,
} from "./types";

const MOCK_GATEWAY_UPDATE: OpenclawGatewayStatusUpdate = {
  agentId: "agent-scribe",
  status: "running",
  message: "Summarizing KHA-11 progress for office board.",
  at: "2026-03-11T11:04:00.000Z",
};

export const MOCK_OPENCLAW_OFFICE_SNAPSHOT: OpenclawOfficeSnapshot = {
  source: "mock",
  capturedAt: "2026-03-11T11:05:00.000Z",
  lastGatewayUpdate: MOCK_GATEWAY_UPDATE,
  agents: [
    {
      id: "agent-orchestrator",
      name: "Orchestrator",
      status: "running",
      owner: "Control Plane",
      task: "Coordinating queue across active worktrees.",
      lastHeartbeatAt: "2026-03-11T11:04:45.000Z",
      updatedAt: "2026-03-11T11:04:45.000Z",
    },
    {
      id: "agent-scribe",
      name: "Scribe",
      status: "running",
      owner: "Docs",
      task: "Generating sprint summary for KHA-11.",
      lastHeartbeatAt: "2026-03-11T11:04:00.000Z",
      updatedAt: "2026-03-11T11:04:00.000Z",
    },
    {
      id: "agent-reviewer",
      name: "Reviewer",
      status: "busy",
      owner: "QA",
      task: "Running lint and integration checks.",
      lastHeartbeatAt: "2026-03-11T11:03:50.000Z",
      updatedAt: "2026-03-11T11:03:50.000Z",
    },
    {
      id: "agent-publisher",
      name: "Publisher",
      status: "idle",
      owner: "Release",
      task: "Waiting for branch verification to complete.",
      lastHeartbeatAt: "2026-03-11T11:02:10.000Z",
      updatedAt: "2026-03-11T11:02:10.000Z",
    },
    {
      id: "agent-crawler",
      name: "Crawler",
      status: "offline",
      owner: "Signals",
      task: "Awaiting gateway reconnect.",
      lastHeartbeatAt: "2026-03-11T10:58:02.000Z",
      updatedAt: "2026-03-11T10:58:02.000Z",
    },
  ],
};
