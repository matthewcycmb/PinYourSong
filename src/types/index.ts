export interface Song {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  album_art_url: string;
  preview_url: string | null;
  spotify_url: string;
  color: string;
  bg_tint: string;
  reason: string;
  pinned_by: string;
  likes_count: number;
  created_at: string;
  liked?: boolean;
  is_owner?: boolean;
}

export interface SpotifySearchResult {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
}
