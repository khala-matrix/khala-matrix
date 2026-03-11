import Link from "next/link";
import { loadHotTopicsPageData } from "@/lib/hot-topics/load-hot-topics";

function scoreTone(score: number) {
  if (score >= 90) {
    return "text-[var(--primary)]";
  }

  if (score >= 80) {
    return "text-[var(--accent)]";
  }

  return "text-[var(--warning)]";
}

export default async function DashboardPage() {
  const { data, mode } = await loadHotTopicsPageData();

  return (
    <div className="app-shell">
      <div className="glow-orb glow-orb--one" />
      <div className="glow-orb glow-orb--two" />

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-10 md:pt-10 lg:px-12">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Signal Atlas Workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Topic Intelligence Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
              {mode} mode
            </p>
            <Link
              href="/office"
              className="rounded-full border border-[var(--line)] bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Office
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[var(--line)] bg-white/85 px-4 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Back to homepage
            </Link>
          </div>
        </header>

        <section className="panel rounded-3xl p-5 md:p-6">
          <h2 className="text-xl font-semibold md:text-2xl">Domain score table</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Backend-ready payload rendered directly from the shared hot-topics contract.
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/85">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-white/70 text-xs uppercase tracking-[0.11em] text-[var(--muted)]">
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Heat score</th>
                  <th className="px-4 py-3">Weekly growth</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.topics.map((topic) => (
                  <tr key={topic.id} className="border-b border-[var(--line)] last:border-b-0">
                    <td className="px-4 py-3 text-[var(--muted)]">{topic.domain}</td>
                    <td className="px-4 py-3 font-semibold">{topic.title}</td>
                    <td className={`px-4 py-3 font-semibold ${scoreTone(topic.heatScore)}`}>
                      {topic.heatScore}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {topic.weeklyGrowthPercent > 0 ? "+" : ""}
                      {topic.weeklyGrowthPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {topic.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="panel rounded-3xl p-5 md:p-6">
            <h2 className="text-xl font-semibold">Signal watchlist</h2>
            <ul className="mt-4 space-y-2">
              {data.watchlist.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[var(--line)] bg-white/85 px-3 py-2 text-sm text-[var(--muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="panel rounded-3xl p-5 md:p-6">
            <h2 className="text-xl font-semibold">Source registry</h2>
            <ul className="mt-4 space-y-3">
              {data.sources.map((source) => (
                <li
                  key={source.id}
                  className="rounded-xl border border-[var(--line)] bg-white/85 px-3 py-2 text-sm"
                >
                  <p className="font-semibold">{source.name}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    {source.type} | {source.lastCheckedAt}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
