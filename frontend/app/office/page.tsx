import Link from "next/link";
import OfficeLiveView from "./office-live-view";
import { loadOpenclawOfficeSnapshot } from "@/lib/openclaw-office/load-office-status";

export const dynamic = "force-dynamic";

export default async function OfficePage() {
  const initialSnapshot = await loadOpenclawOfficeSnapshot();

  return (
    <div className="app-shell">
      <div className="glow-orb glow-orb--one" />
      <div className="glow-orb glow-orb--two" />

      <main className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-8 md:px-10 md:pt-10 lg:px-12">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              OpenClaw Office
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Agent Status Control Room
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <p className="badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
              {initialSnapshot.source} source
            </p>
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--line)] bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[var(--line)] bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Homepage
            </Link>
          </div>
        </header>

        <OfficeLiveView initialSnapshot={initialSnapshot} />
      </main>
    </div>
  );
}
