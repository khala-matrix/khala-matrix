import Link from "next/link";
import { loadHotTopicsPageData } from "@/lib/hot-topics/load-hot-topics";
import { Topic } from "@/lib/hot-topics/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatGrowth(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function maturityLabel(topic: Topic) {
  if (topic.maturity === "mainstream") {
    return "Mainstream";
  }

  if (topic.maturity === "scaling") {
    return "Scaling";
  }

  return "Emerging";
}

export default async function Home() {
  const { data, mode } = await loadHotTopicsPageData();

  return (
    <div className="app-shell">
      <div className="glow-orb glow-orb--one" />
      <div className="glow-orb glow-orb--two" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-16 pt-7 md:px-10 md:pt-10 lg:px-12">
        <nav className="stagger flex items-center justify-between" style={{ animationDelay: "0.04s" }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Signal Atlas
            </p>
            <p className="text-lg font-semibold">AI Topic Radar</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              href="/office"
              className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Office
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-[var(--primary-ink)] transition hover:brightness-105"
            >
              Analyst Access
            </Link>
          </div>
        </nav>

        <section className="grid gap-7 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-5">
            <p
              className="stagger badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ animationDelay: "0.08s" }}
            >
              Live Intelligence Feed
            </p>
            <h1
              className="stagger text-4xl font-semibold leading-tight tracking-tight text-[var(--ink)] md:text-6xl"
              style={{ animationDelay: "0.13s" }}
            >
              {data.headline}
            </h1>
            <p
              className="stagger max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
              style={{ animationDelay: "0.2s" }}
            >
              {data.subheadline}
            </p>
            <p
              className="stagger font-mono text-xs text-[var(--muted)]"
              style={{ animationDelay: "0.25s" }}
            >
              Data source: <span className="font-semibold uppercase">{mode}</span> mode | Snapshot {dateFormatter.format(new Date(data.generatedAt))}
            </p>
          </div>

          <aside className="stagger panel rounded-3xl p-6" style={{ animationDelay: "0.24s" }}>
            <h2 className="text-lg font-semibold">Today’s briefing</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {data.briefing[0]?.headline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {data.briefing[0]?.impact}
            </p>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((stat, index) => (
            <article
              key={stat.id}
              className="stagger panel rounded-2xl p-4"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-[var(--accent)]">{stat.delta}</p>
            </article>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Top AI domains right now</h2>
            <p className="text-sm text-[var(--muted)]">Sorted by internal heat score and weekly movement.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.topics.map((topic, index) => (
              <article
                key={topic.id}
                className="stagger panel-strong rounded-3xl p-5"
                style={{ animationDelay: `${0.16 + index * 0.05}s` }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {topic.domain}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{topic.title}</h3>
                  </div>
                  <div className="badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                    {maturityLabel(topic)}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[var(--muted)]">{topic.summary}</p>

                <div className="mt-4 grid gap-2 rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-[var(--ink)]">Heat score:</span> {topic.heatScore}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--ink)]">Weekly growth:</span> {formatGrowth(topic.weeklyGrowthPercent)}
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {topic.notableSignals.slice(0, 2).map((signal) => (
                    <li key={signal} className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm text-[var(--muted)]">
                      {signal}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel rounded-3xl p-6">
            <h2 className="text-2xl font-semibold">Latest timeline</h2>
            <ul className="mt-5 space-y-3">
              {data.briefing.map((item) => (
                <li key={item.id} className="rounded-2xl border border-[var(--line)] bg-white/85 p-4">
                  <p className="font-mono text-xs text-[var(--muted)]">{item.date}</p>
                  <p className="mt-2 text-base font-semibold">{item.headline}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.impact}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel rounded-3xl p-6">
            <h2 className="text-2xl font-semibold">Watchlist and feeds</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Key events and source feeds used to fill the topic model payload.
            </p>

            <ul className="mt-5 space-y-2">
              {data.watchlist.map((item) => (
                <li key={item} className="rounded-xl border border-[var(--line)] bg-white/85 px-3 py-2 text-sm text-[var(--muted)]">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-3">
              {data.sources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[var(--line)] bg-white/85 px-3 py-2 text-sm transition hover:border-[var(--primary)]"
                >
                  <p className="font-semibold">{source.name}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    {source.type} | checked {dateFormatter.format(new Date(source.lastCheckedAt))}
                  </p>
                </a>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
