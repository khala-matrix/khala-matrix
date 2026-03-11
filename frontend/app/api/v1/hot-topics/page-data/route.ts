import { NextResponse } from "next/server";
import { MOCK_HOT_TOPICS_PAGE_DATA } from "@/lib/hot-topics/mock-data";

export async function GET() {
  return NextResponse.json({
    ...MOCK_HOT_TOPICS_PAGE_DATA,
    generatedAt: new Date().toISOString(),
  });
}
