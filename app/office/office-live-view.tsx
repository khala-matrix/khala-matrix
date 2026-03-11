"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  applyGatewayUpdate,
  normalizeAgentStatus,
} from "@/lib/openclaw-office/load-office-status";
import {
  OpenclawAgentStatus,
  OpenclawGatewayStatusUpdate,
  OpenclawOfficeSnapshot,
  OPENCLAW_AGENT_STATUSES,
} from "@/lib/openclaw-office/types";

const GATEWAY_POLL_INTERVAL_MS = 4000;

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

type GatewayLatestApiPayload = {
  latestUpdate?: {
    agentId?: string;
    status?: string;
    message?: string;
    at?: string;
  } | null;
  receivedAt?: string;
};

function toGatewayStatusUpdate(payload: GatewayLatestApiPayload): OpenclawGatewayStatusUpdate | null {
  const latestUpdate = payload.latestUpdate;

  if (!latestUpdate?.agentId) {
    return null;
  }

  return {
    agentId: latestUpdate.agentId,
    status: normalizeAgentStatus(latestUpdate.status ?? null),
    message: latestUpdate.message ?? "Gateway update received.",
    at: latestUpdate.at ?? payload.receivedAt ?? new Date().toISOString(),
  };
}

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
  const [connectionState, setConnectionState] = useState<
    "connected" | "fallback" | "disconnected"
  >(initialSnapshot.source === "live" ? "connected" : "fallback");

  useEffect(() => {
    let active = true;

    const pollGateway = async () => {
      try {
        const response = await fetch("/api/v1/openclaw/gateway/latest", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`gateway poll failed: ${response.status}`);
        }

        const payload = (await response.json()) as GatewayLatestApiPayload;
        const update = toGatewayStatusUpdate(payload);

        if (!active) {
          return;
        }

        if (update) {
          setSnapshot((current) => applyGatewayUpdate(current, update));
        }

        setConnectionState("connected");
      } catch {
        if (!active) {
          return;
        }

        setConnectionState("disconnected");
      }
    };

    void pollGateway();
    const intervalId = setInterval(() => {
      void pollGateway();
    }, GATEWAY_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const statusCounts = useMemo(() => {
    const initialCounts = Object.fromEntries(
      OPENCLAW_AGENT_STATUSES.map((status) => [status, 0]),
    ) as Record<OpenclawAgentStatus, number>;

    for (const agent of snapshot.agents) {
      initialCounts[agent.status] += 1;
    }

    return initialCounts;
  }, [snapshot.agents]);

  return (
    <section className="space-y-6">
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
            Gateway connection
          </p>
          <p className="mt-2 text-lg font-semibold capitalize">{connectionState}</p>
        </article>
      </div>

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
              {agent.task}
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
