import type { SpotifySearchResult, SpotifyTrack } from "@/types";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error("Spotify token error:", data);
    throw new Error("Failed to authenticate with Spotify");
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

export async function searchTracks(query: string): Promise<SpotifySearchResult[]> {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (data.error) {
    // Token might be bad, retry once
    cachedToken = null;
    tokenExpiresAt = 0;
    const newToken = await getAccessToken();
    const retryRes = await fetch(url, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    const retryData = await retryRes.json();
    if (retryData.error) {
      console.error("Spotify search error:", retryData.error.message);
      throw new Error("Spotify search failed");
    }
    return retryData.tracks.items.map((track: SpotifyTrack) => ({
      spotifyId: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      albumArtUrl: track.album.images[0]?.url ?? "",
    }));
  }

  return data.tracks.items.map((track: SpotifyTrack) => ({
    spotifyId: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumArtUrl: track.album.images[0]?.url ?? "",
  }));
}

export async function getTrack(spotifyId: string): Promise<SpotifyTrack> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (data.error) {
    console.error("Spotify track error:", data.error.message);
    throw new Error("Failed to fetch track from Spotify");
  }
  return data;
}
