-- "one song." database schema
-- Paste this into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Songs table
CREATE TABLE songs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spotify_id    TEXT NOT NULL,
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  album_art_url TEXT NOT NULL,
  preview_url   TEXT,
  spotify_url   TEXT NOT NULL,
  color         TEXT NOT NULL,
  bg_tint       TEXT NOT NULL,
  reason        TEXT NOT NULL CHECK (char_length(reason) <= 80),
  pinned_by     TEXT NOT NULL,
  ip_hash       TEXT NOT NULL,
  likes_count   INTEGER DEFAULT 0 NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_songs_created_at ON songs (created_at DESC);
CREATE INDEX idx_songs_likes ON songs (likes_count DESC);

-- Likes table
CREATE TABLE likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id    UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (song_id, ip_hash)
);

-- Auto-update trigger for likes_count
CREATE OR REPLACE FUNCTION update_song_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE songs SET likes_count = likes_count + 1 WHERE id = NEW.song_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE songs SET likes_count = likes_count - 1 WHERE id = OLD.song_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_song_likes_count();

-- Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);

-- All writes go through API routes using service_role key (bypasses RLS)
