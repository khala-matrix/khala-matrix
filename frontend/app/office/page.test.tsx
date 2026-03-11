import { render, screen } from "@testing-library/react";
import OfficePage from "./page";

vi.mock("./office-live-view", () => ({
  default: () => <div>office live view</div>,
}));

vi.mock("@/lib/openclaw-office/load-office-status", () => ({
  loadOpenclawOfficeSnapshot: vi.fn(async () => ({
    source: "live",
    capturedAt: "2026-03-11T11:05:00.000Z",
    lastGatewayUpdate: null,
    agents: [
      {
        id: "agent-orchestrator",
        name: "Orchestrator",
        status: "running",
        owner: "Control Plane",
        task: "Coordinating queue.",
        lastHeartbeatAt: "2026-03-11T11:04:45.000Z",
        updatedAt: "2026-03-11T11:04:45.000Z",
      },
    ],
  })),
  loadLatestGatewayStatusUpdate: vi.fn(async () => ({
    agentId: "agent-orchestrator",
    status: "running",
    message: "Gateway says still running.",
    at: "2026-03-11T11:05:10.000Z",
  })),
  applyGatewayUpdate: vi.fn((snapshot, update) => {
    if (!update) {
      return snapshot;
    }

    return {
      ...snapshot,
      capturedAt: update.at,
      lastGatewayUpdate: update,
    };
  }),
}));

describe("Office page", () => {
  it("renders openclaw office control room content", async () => {
    render(await OfficePage());

    expect(
      screen.getByRole("heading", { name: /agent status control room/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/snapshot endpoint:/i)).toBeInTheDocument();
    expect(screen.getByText(/office live view/i)).toBeInTheDocument();
  });
});
