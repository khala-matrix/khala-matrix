"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { normalizeAgentStatus } from "@/lib/openclaw-office/load-office-status";
import {
  OpenclawAgentStatus,
  OpenclawAgent,
  OpenclawOfficeSnapshot,
  GatewayClientStatus,
  GatewayStatusResponse,
  OPENCLAW_AGENT_STATUSES,
} from "@/lib/openclaw-office/types";
import { useKhalaWS, type WSEvent } from "@/lib/openclaw-office/use-khala-ws";

const STATUS_ICON_MAP: Record<OpenclawAgentStatus, string> = {
  idle: "/office/status-idle.svg",
  running: "/office/status-running.svg",
  busy: "/office/status-busy.svg",
  offline: "/office/status-offline.svg",
  error: "/office/status-error.svg",
};

const STATUS_LABEL_MAP: Record<OpenclawAgentStatus, string> = {
  idle: "Idle",
  running: "Running",
  busy: "Busy",
  offline: "Offline",
  error: "Error",
};

const STATUS_TONE_MAP: Record<OpenclawAgentStatus, string> = {
  idle: "text-[#2f5cff]",
  running: "text-[#138a42]",
  busy: "text-[#e97400]",
  offline: "text-[#566178]",
  error: "text-[#d2192d]",
};

const PAIRING_LABELS: Record<string, string> = {
  none: "Not Paired",
  pending: "Awaiting Approval",
  approved: "Approved",
  rejected: "Rejected",
  connected: "Connected",
};

const PAIRING_COLORS: Record<string, string> = {
  none: "text-[#566178]",
  pending: "text-[#e97400]",
  approved: "text-[#138a42]",
  rejected: "text-[#d2192d]",
  connected: "text-[#138a42]",
};

function formatAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function OfficeLiveView({
  initialSnapshot,
}: {
  initialSnapshot: OpenclawOfficeSnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const wsConnected = !!process.env.NEXT_PUBLIC_WS_URL;
  const [gatewayStatus, setGatewayStatus] = useState<GatewayClientStatus | null>(null);
  const [gatewayEnabled, setGatewayEnabled] = useState<boolean | null>(null);

  // Fetch gateway status on mount and periodically
  useEffect(() => {
    let active = true;

    const fetchGatewayStatus = async () => {
      try {
        const res = await fetch("/api/v1/openclaw/gateway/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as GatewayStatusResponse;
        if (!active) return;
        setGatewayEnabled(data.enabled);
        if (data.status) {
          setGatewayStatus(data.status);
        }
      } catch {
        // ignore
      }
    };

    void fetchGatewayStatus();
    const interval = setInterval(() => void fetchGatewayStatus(), 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Handle agent_status_change from WebSocket
  const handleAgentChange = useCallback((event: WSEvent) => {
    const agent = event.data as OpenclawAgent;
    if (!agent?.id) return;

    const normalized: OpenclawAgent = {
      id: agent.id,
      name: agent.name || agent.id,
      status: normalizeAgentStatus(agent.status ?? null),
      owner: agent.owner || "Unknown",
      task: agent.task || "",
      lastHeartbeatAt: agent.lastHeartbeatAt || new Date().toISOString(),
      updatedAt: agent.updatedAt || new Date().toISOString(),
    };

    setSnapshot((prev) => {
      const exists = prev.agents.some((a) => a.id === normalized.id);
      const agents = exists
        ? prev.agents.map((a) => (a.id === normalized.id ? normalized : a))
        : [normalized, ...prev.agents];
      return { ...prev, capturedAt: new Date().toISOString(), agents };
    });
  }, []);

  // Handle gateway_status from WebSocket
  const handleGatewayStatus = useCallback((event: WSEvent) => {
    const status = event.data as GatewayClientStatus;
    if (status) {
      setGatewayStatus(status);
      setGatewayEnabled(true);
    }
  }, []);

  useKhalaWS({
    agent_status_change: handleAgentChange,
    gateway_status: handleGatewayStatus,
  });

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      OPENCLAW_AGENT_STATUSES.map((s) => [s, 0]),
    ) as Record<OpenclawAgentStatus, number>;
    for (const agent of snapshot.agents) {
      counts[agent.status] += 1;
    }
    return counts;
  }, [snapshot.agents]);

  return (
    <section className="space-y-6">
      {/* Gateway Status Panel */}
      <GatewayPanel
        enabled={gatewayEnabled}
        status={gatewayStatus}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <article className="panel rounded-2xl px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Snapshot captured
          </p>
          <p className="mt-2 text-lg font-semibold">{formatAt(snapshot.capturedAt)}</p>
        </article>
        <article className="panel rounded-2xl px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Agent count
          </p>
          <p className="mt-2 text-lg font-semibold">{snapshot.agents.length}</p>
        </article>
        <article className="panel rounded-2xl px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
            Real-time feed
          </p>
          <p className="mt-2 text-lg font-semibold capitalize">
            {wsConnected ? "WebSocket" : "Polling"}
          </p>
        </article>
      </div>

      {/* Status Breakdown */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {OPENCLAW_AGENT_STATUSES.map((status) => (
          <article key={status} className="panel rounded-2xl px-4 py-3">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              {STATUS_LABEL_MAP[status]}
            </p>
            <p className={`mt-1 text-2xl font-semibold ${STATUS_TONE_MAP[status]}`}>
              {statusCounts[status]}
            </p>
          </article>
        ))}
      </section>

      {/* Agent Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.agents.map((agent) => (
          <article key={agent.id} className="office-agent-card rounded-2xl px-4 py-4">
            <div className="flex items-start gap-3">
              <Image
                src={STATUS_ICON_MAP[agent.status]}
                width={40}
                height={40}
                alt={`${STATUS_LABEL_MAP[agent.status]} status icon`}
                className="office-status-icon h-10 w-10"
              />
              <div className="min-w-0">
                <p className="truncate text-sm uppercase tracking-[0.12em] text-[var(--muted)]">
                  {agent.owner}
                </p>
                <h3 className="truncate text-lg font-semibold">{agent.name}</h3>
                <p className={`text-sm font-semibold ${STATUS_TONE_MAP[agent.status]}`}>
                  {STATUS_LABEL_MAP[agent.status]}
                </p>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-[var(--line)] bg-white/90 px-3 py-2 text-sm text-[var(--muted)]">
              {agent.task || "No active task"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <p className="rounded-lg border border-[var(--line)] bg-white/80 px-2 py-2">
                Updated:
                <br />
                <span className="font-mono text-[11px] text-[var(--ink)]">
                  {formatAt(agent.updatedAt)}
                </span>
              </p>
              <p className="rounded-lg border border-[var(--line)] bg-white/80 px-2 py-2">
                Heartbeat:
                <br />
                <span className="font-mono text-[11px] text-[var(--ink)]">
                  {formatAt(agent.lastHeartbeatAt)}
                </span>
              </p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function GatewayPanel({
  enabled,
  status,
}: {
  enabled: boolean | null;
  status: GatewayClientStatus | null;
}) {
  if (enabled === null) {
    return (
      <section className="panel rounded-2xl px-5 py-4">
        <p className="text-sm text-[var(--muted)]">Loading gateway status...</p>
      </section>
    );
  }

  if (!enabled) {
    return (
      <section className="panel rounded-2xl px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          OpenClaw Gateway
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upstream gateway not configured. Set <code className="font-mono text-xs">OPENCLAW_GATEWAY_WS_URL</code> in backend .env to enable.
        </p>
      </section>
    );
  }

  if (!status) {
    return (
      <section className="panel rounded-2xl px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
          OpenClaw Gateway
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Waiting for status...</p>
      </section>
    );
  }

  const pairingLabel = PAIRING_LABELS[status.pairingStatus] ?? status.pairingStatus;
  const pairingColor = PAIRING_COLORS[status.pairingStatus] ?? "text-[var(--muted)]";

  return (
    <section className="panel rounded-2xl px-5 py-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
        OpenClaw Gateway
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Connection</p>
          <p className={`mt-1 text-sm font-semibold ${status.connected ? "text-[#138a42]" : "text-[#d2192d]"}`}>
            {status.connected ? "Connected" : "Disconnected"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Pairing</p>
          <p className={`mt-1 text-sm font-semibold ${pairingColor}`}>
            {pairingLabel}
          </p>
          {status.pairingError && (
            <p className="mt-1 text-xs text-[#d2192d]">{status.pairingError}</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Device ID</p>
          <p className="mt-1 font-mono text-xs text-[var(--ink)] break-all">
            {status.deviceId}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Gateway URL</p>
          <p className="mt-1 font-mono text-xs text-[var(--ink)] break-all">
            {status.gatewayUrl}
          </p>
        </div>
      </div>
      {status.lastError && (
        <p className="mt-3 rounded-lg border border-[#d2192d]/20 bg-[#d2192d]/5 px-3 py-2 text-xs text-[#d2192d]">
          {status.lastError}
        </p>
      )}
      {status.pairingStatus === "pending" && (
        <p className="mt-3 rounded-lg border border-[#e97400]/20 bg-[#e97400]/5 px-3 py-2 text-xs text-[#e97400]">
          Device is awaiting approval in the OpenClaw gateway dashboard. Approve the device with ID shown above.
        </p>
      )}
    </section>
  );
}
