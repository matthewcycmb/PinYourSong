import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";
import { hashIP } from "@/lib/utils";

// Simple in-memory rate limiter for search
const searchRateMap = new Map<string, number[]>();

function isRateLimited(ipHash: string, maxPerMinute = 15): boolean {
  const now = Date.now();
  const timestamps = searchRateMap.get(ipHash)?.filter((t) => now - t < 60_000) ?? [];
  if (timestamps.length >= maxPerMinute) return true;
  timestamps.push(now);
  searchRateMap.set(ipHash, timestamps);
  return false;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  if (isRateLimited(ipHash)) {
    return NextResponse.json({ error: "Too many searches, slow down" }, { status: 429 });
  }

  try {
    const results = await searchTracks(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("Search route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
