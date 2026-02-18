"use client";

import { useState, useCallback, useEffect } from "react";
import type { Song } from "@/types";
import LandingPage from "./LandingPage";
import ChoosePage from "./ChoosePage";
import WallPage from "./WallPage";

interface SongWallProps {
  initialSongs: Song[];
  initialCount: number;
}

export default function SongWall({ initialSongs, initialCount }: SongWallProps) {
  const [page, setPage] = useState<"landing" | "choose" | "wall">("landing");
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [sortBy, setSortBy] = useState<"latest" | "loved">("latest");
  const [totalCount, setTotalCount] = useState(initialCount);

  // Fetch songs with correct like status on mount (server render doesn't know user IP)
  useEffect(() => {
    fetch("/api/songs?sort=latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) {
          setSongs(data.songs);
          if (data.totalCount != null) setTotalCount(data.totalCount);
        }
      })
      .catch(() => {});
  }, []);

  const toggleLike = useCallback(async (id: string) => {
    // Optimistic update
    setSongs((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              liked: !s.liked,
              likes_count: s.liked ? s.likes_count - 1 : s.likes_count + 1,
            }
          : s
      )
    );

    try {
      const res = await fetch(`/api/songs/${id}/like`, { method: "POST" });
      const data = await res.json();

      // Reconcile with server state
      setSongs((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, liked: data.liked, likes_count: data.likesCount }
            : s
        )
      );
    } catch {
      // Revert on error
      setSongs((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                liked: !s.liked,
                likes_count: s.liked ? s.likes_count - 1 : s.likes_count + 1,
              }
            : s
        )
      );
    }
  }, []);

  const handleSubmit = (newSongs: Song[]) => {
    setSongs((prev) => [...newSongs, ...prev]);
    setTotalCount((c) => c + newSongs.length);
    setPage("wall");
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        setTotalCount((c) => c - 1);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSortChange = async (sort: "latest" | "loved") => {
    setSortBy(sort);
    try {
      const res = await fetch(`/api/songs?sort=${sort}`);
      const data = await res.json();
      setSongs(data.songs);
    } catch {
      // keep current list on error
    }
  };

  const sortedSongs =
    sortBy === "loved"
      ? [...songs].sort((a, b) => b.likes_count - a.likes_count)
      : songs;

  return (
    <div>
      {page === "landing" && (
        <LandingPage
          onEnter={() => setPage("choose")}
          onBrowse={() => setPage("wall")}
        />
      )}
      {page === "choose" && (
        <ChoosePage
          onSubmit={handleSubmit}
          onBack={() => setPage("landing")}
        />
      )}
      {page === "wall" && (
        <WallPage
          songs={sortedSongs}
          onLike={toggleLike}
          onDelete={handleDelete}
          onBack={() => setPage("landing")}
          onAddMore={() => setPage("choose")}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}
