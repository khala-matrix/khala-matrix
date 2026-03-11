import {
  applyGatewayUpdate,
  loadOpenclawOfficeSnapshot,
  normalizeAgentStatus,
  parseAgentStatusPayload,
  parseLatestGatewayStatusPayload,
} from "./load-office-status";

describe("openclaw office status loader", () => {
  it("normalizes supported agent status aliases", () => {
    expect(normalizeAgentStatus("online")).toBe("idle");
    expect(normalizeAgentStatus("working")).toBe("running");
    expect(normalizeAgentStatus("blocked")).toBe("busy");
    expect(normalizeAgentStatus("down")).toBe("offline");
    expect(normalizeAgentStatus("failed")).toBe("error");
  });

  it("parses agent snapshot payload shape", () => {
    const parsed = parseAgentStatusPayload({
      capturedAt: "2026-03-11T10:00:00.000Z",
      agents: [
        {
          id: "agent-orchestrator",
          name: "Orchestrator",
          status: "running",
          owner: "Control Plane",
          task: "Coordinating queue.",
          lastHeartbeatAt: "2026-03-11T10:00:00.000Z",
          updatedAt: "2026-03-11T10:00:00.000Z",
        },
      ],
    });

    expect(parsed.capturedAt).toBe("2026-03-11T10:00:00.000Z");
    expect(parsed.agents).toHaveLength(1);
    expect(parsed.agents[0]?.status).toBe("running");
  });

  it("parses latest gateway update payload shape", () => {
    const parsed = parseLatestGatewayStatusPayload({
      latestUpdate: {
        agentId: "agent-scribe",
        status: "busy",
        message: "Rendering report.",
        at: "2026-03-11T11:01:00.000Z",
      },
    });

    expect(parsed?.agentId).toBe("agent-scribe");
    expect(parsed?.status).toBe("busy");
    expect(parsed?.message).toBe("Rendering report.");
  });

  it("applies latest gateway update to an existing agent", () => {
    const updated = applyGatewayUpdate(
      {
        source: "live",
        capturedAt: "2026-03-11T11:00:00.000Z",
        lastGatewayUpdate: null,
        agents: [
          {
            id: "agent-reviewer",
            name: "Reviewer",
            status: "idle",
            owner: "QA",
            task: "Waiting.",
            lastHeartbeatAt: "2026-03-11T11:00:00.000Z",
            updatedAt: "2026-03-11T11:00:00.000Z",
          },
        ],
      },
      {
        agentId: "agent-reviewer",
        status: "running",
        message: "Running verification suite.",
        at: "2026-03-11T11:03:00.000Z",
      },
    );

    expect(updated.capturedAt).toBe("2026-03-11T11:03:00.000Z");
    expect(updated.agents[0]?.status).toBe("running");
    expect(updated.agents[0]?.task).toBe("Running verification suite.");
  });

  it("falls back to mock snapshot when live fetch fails", async () => {
    const originalMode = process.env.OPENCLAW_OFFICE_DATA_SOURCE;
    process.env.OPENCLAW_OFFICE_DATA_SOURCE = "live";

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network down"));

    try {
      const snapshot = await loadOpenclawOfficeSnapshot();
      expect(snapshot.source).toBe("mock");
      expect(snapshot.agents.length).toBeGreaterThan(0);
    } finally {
      fetchSpy.mockRestore();
      warnSpy.mockRestore();
      process.env.OPENCLAW_OFFICE_DATA_SOURCE = originalMode;
    }
  });
});
