import { NextResponse } from "next/server";
import { loadLatestGatewayStatusUpdate } from "@/lib/openclaw-office/load-office-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const latestUpdate = await loadLatestGatewayStatusUpdate();
  return NextResponse.json({
    latestUpdate,
    receivedAt: new Date().toISOString(),
  });
}
