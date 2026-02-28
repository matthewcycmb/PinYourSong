import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashIP } from "@/lib/utils";

// Simple in-memory rate limiter for likes
const likeRateMap = new Map<string, number[]>();

function isRateLimited(ipHash: string, maxPerMinute = 15): boolean {
  const now = Date.now();
  const timestamps = likeRateMap.get(ipHash)?.filter((t) => now - t < 60_000) ?? [];
  if (timestamps.length >= maxPerMinute) return true;
  timestamps.push(now);
  likeRateMap.set(ipHash, timestamps);
  return false;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: songId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  if (isRateLimited(ipHash)) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  // Check if already liked
  const { data: existing } = await getSupabaseAdmin()
    .from("likes")
    .select("id")
    .eq("song_id", songId)
    .eq("ip_hash", ipHash)
    .single();

  if (existing) {
    // Unlike
    await getSupabaseAdmin().from("likes").delete().eq("id", existing.id);
  } else {
    // Like
    await getSupabaseAdmin().from("likes").insert({ song_id: songId, ip_hash: ipHash });
  }

  // Fetch updated count
  const { data: song } = await getSupabaseAdmin()
    .from("songs")
    .select("likes_count")
    .eq("id", songId)
    .single();

  return NextResponse.json({
    liked: !existing,
    likesCount: song?.likes_count ?? 0,
  });
}
