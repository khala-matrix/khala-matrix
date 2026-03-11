import { NextResponse } from "next/server";
import { loadOpenclawOfficeSnapshot } from "@/lib/openclaw-office/load-office-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await loadOpenclawOfficeSnapshot();
  return NextResponse.json(snapshot);
}
