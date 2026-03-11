import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="app-shell">
      <div className="glow-orb glow-orb--one" />
      <div className="glow-orb glow-orb--two" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-5 py-12 md:px-10">
        <section className="panel mx-auto grid w-full gap-8 rounded-3xl p-6 md:grid-cols-2 md:p-10">
          <div className="space-y-5">
            <p className="badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]">
              Analyst workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Access daily AI domain intelligence
            </h1>
            <p className="text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Sign in to curate topic watchlists, configure feed priorities, and export
              snapshots from the hot topics dashboard.
            </p>

            <ul className="space-y-2">
              {[
                "Domain-level trend scoring",
                "Briefing timeline exports",
                "Source trust weighting and alerts",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[var(--line)] bg-white/85 px-3 py-2 text-sm text-[var(--muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="inline-flex text-sm font-semibold text-[var(--primary)] hover:brightness-95"
            >
              Back to homepage
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-6 md:p-8">
            <h2 className="text-xl font-semibold">Analyst sign in</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Demo mode only. Authentication wiring is pending backend rollout.
            </p>

            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-ink)] transition hover:brightness-105"
              >
                Continue to dashboard
              </button>

              <Link
                href="/dashboard"
                className="inline-flex text-sm font-semibold text-[var(--primary)] hover:brightness-95"
              >
                Open dashboard preview
              </Link>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
