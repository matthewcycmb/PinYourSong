import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashIP } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: songId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("song_id", songId)
    .eq("ip_hash", ipHash)
    .single();

  if (existing) {
    // Unlike
    await supabaseAdmin.from("likes").delete().eq("id", existing.id);
  } else {
    // Like
    await supabaseAdmin.from("likes").insert({ song_id: songId, ip_hash: ipHash });
  }

  // Fetch updated count
  const { data: song } = await supabaseAdmin
    .from("songs")
    .select("likes_count")
    .eq("id", songId)
    .single();

  return NextResponse.json({
    liked: !existing,
    likesCount: song?.likes_count ?? 0,
  });
}
