import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashIP } from "@/lib/utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: songId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  // Verify the song belongs to this user
  const { data: song } = await getSupabaseAdmin()
    .from("songs")
    .select("id, ip_hash")
    .eq("id", songId)
    .single();

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  if (song.ip_hash !== ipHash) {
    return NextResponse.json({ error: "Not your song" }, { status: 403 });
  }

  // Delete associated likes first, then the song
  await getSupabaseAdmin().from("likes").delete().eq("song_id", songId);
  const { error } = await getSupabaseAdmin().from("songs").delete().eq("id", songId);

  if (error) {
    console.error("DELETE /api/songs/[id] error:", error.message);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
