import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_GATEWAY_STATUS_URL = "http://localhost:8080/v1/gateway/status";

export async function GET() {
  const url =
    process.env.OPENCLAW_GATEWAY_STATUS_URL ?? DEFAULT_GATEWAY_STATUS_URL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { enabled: false, message: `Backend returned ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { enabled: false, message: "Backend unreachable" },
      { status: 502 },
    );
  }
}
