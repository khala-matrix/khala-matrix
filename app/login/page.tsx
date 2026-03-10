import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <div className="grid-overlay" />
      <div className="floating-orb floating-orb--one" />
      <div className="floating-orb floating-orb--two" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 md:px-10 lg:px-14">
        <section className="grid w-full gap-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)]/85 p-6 backdrop-blur md:grid-cols-2 md:p-10">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[var(--line)] bg-[var(--canvas)] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[var(--muted)]">
              SECURE ACCESS PORTAL
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome back
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Sign in to manage private tunnels, monitor handshake health, and
              deploy policy updates across your client-server network.
            </p>
            <ul className="space-y-3">
              {[
                "Session-level encryption and identity-based controls",
                "Real-time tunnel metrics and latency tracking",
                "Audit logs for configuration and peer lifecycle changes",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-flex text-sm font-semibold text-[var(--brand)] transition hover:brightness-90"
            >
              Back to homepage
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-6 md:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Log in</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use your workspace credentials to continue.
            </p>

            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--line)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-[var(--brand)] transition hover:brightness-90"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--line)]"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--line)] accent-[var(--brand)]"
                />
                Keep me signed in for 7 days
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Sign in to dashboard
              </button>

              <Link
                href="/dashboard"
                className="inline-flex text-sm font-semibold text-[var(--brand)] transition hover:brightness-90"
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
