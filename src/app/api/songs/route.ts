import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getTrack } from "@/lib/spotify";
import { extractColors } from "@/lib/color";
import { hashIP } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") ?? "latest";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  const orderCol = sort === "loved" ? "likes_count" : "created_at";

  const { data: songs, error } = await getSupabaseAdmin()
    .from("songs")
    .select("*")
    .order(orderCol, { ascending: false })
    .limit(100);

  if (error) {
    console.error("GET /api/songs error:", error.message);
    return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
  }

  // Check which songs this visitor has liked
  const songIds = songs.map((s) => s.id);
  const { data: likes } = await getSupabaseAdmin()
    .from("likes")
    .select("song_id")
    .eq("ip_hash", ipHash)
    .in("song_id", songIds);

  const likedSet = new Set(likes?.map((l) => l.song_id) ?? []);

  const songsWithLiked = songs.map(({ ip_hash, ...s }) => ({
    ...s,
    liked: likedSet.has(s.id),
    is_owner: ip_hash === ipHash,
  }));

  const { count } = await getSupabaseAdmin()
    .from("songs")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ songs: songsWithLiked, totalCount: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIP(ip);

  // Rate limit: max 2 songs per IP per 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await getSupabaseAdmin()
    .from("songs")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((count ?? 0) >= 2) {
    return NextResponse.json(
      { error: "You've used your 2 pins for today. Come back tomorrow!" },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, songs: songEntries } = body as {
    name: string;
    songs: { spotifyId: string; reason: string; color?: string; bgTint?: string }[];
  };

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName || trimmedName.length > 50 || !songEntries?.length || songEntries.length > 2) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Check combined count doesn't exceed limit
  if ((count ?? 0) + songEntries.length > 2) {
    return NextResponse.json(
      { error: `You can only pin ${2 - (count ?? 0)} more song(s) today.` },
      { status: 429 }
    );
  }

  const created = [];

  for (const entry of songEntries) {
    if (!entry.spotifyId || !/^[a-zA-Z0-9]{22}$/.test(entry.spotifyId)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    if (!entry.reason || entry.reason.trim().length === 0 || entry.reason.length > 80) {
      return NextResponse.json(
        { error: "Reason must be 1-80 characters" },
        { status: 400 }
      );
    }

    const track = await getTrack(entry.spotifyId);
    const albumArtUrl = track.album.images[0]?.url ?? "";
    const extracted = await extractColors(albumArtUrl);
    const color = entry.color || extracted.color;
    const bgTint = entry.bgTint || extracted.bgTint;

    const { data, error } = await getSupabaseAdmin()
      .from("songs")
      .insert({
        spotify_id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album_art_url: albumArtUrl,
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify,
        color,
        bg_tint: bgTint,
        reason: entry.reason,
        pinned_by: trimmedName,
        ip_hash: ipHash,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/songs insert error:", error.message);
      return NextResponse.json({ error: "Failed to save song" }, { status: 500 });
    }

    const { ip_hash: _ip, ...safeData } = data;
    created.push({ ...safeData, liked: false, is_owner: true });
  }

  return NextResponse.json({ songs: created }, { status: 201 });
}
