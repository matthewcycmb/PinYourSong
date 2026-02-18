import type { SpotifySearchResult, SpotifyTrack } from "@/types";
import https from "https";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function httpsRequest(url: string, options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const raw = await httpsRequest(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
    },
    "grant_type=client_credentials"
  );

  const data = JSON.parse(raw);
  if (!data.access_token) {
    throw new Error(`Spotify token error: ${raw}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

export async function searchTracks(query: string): Promise<SpotifySearchResult[]> {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

  const raw = await httpsRequest(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = JSON.parse(raw);

  if (data.error) {
    // Token might be bad, retry once
    cachedToken = null;
    tokenExpiresAt = 0;
    const newToken = await getAccessToken();
    const retry = await httpsRequest(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${newToken}` },
    });
    const retryData = JSON.parse(retry);
    if (retryData.error) {
      throw new Error(`Spotify search error: ${retryData.error.message}`);
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
  const raw = await httpsRequest(
    `https://api.spotify.com/v1/tracks/${spotifyId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = JSON.parse(raw);
  if (data.error) {
    throw new Error(`Spotify track error: ${data.error.message}`);
  }
  return data;
}
