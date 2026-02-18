import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    console.log("SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID?.slice(0, 8) + "...");
    console.log("SPOTIFY_CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET ? "set" : "MISSING");
    const results = await searchTracks(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("Search route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
