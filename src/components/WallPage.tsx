"use client";

import { useState } from "react";
import type { Song } from "@/types";
import PlayerCard from "./PlayerCard";
import HeartButton from "./HeartButton";
import { relativeTime } from "@/lib/utils";

interface WallPageProps {
  songs: Song[];
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onAddMore: () => void;
  sortBy: "latest" | "loved";
  onSortChange: (sort: "latest" | "loved") => void;
}

export default function WallPage({
  songs,
  onLike,
  onDelete,
  onBack,
  onAddMore,
  sortBy,
  onSortChange,
}: WallPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? songs.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div style={{ minHeight: "100vh", background: "#ddd", position: "relative" }}>
      {/* Background image */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "url(/bg-wall.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background:
            "linear-gradient(to bottom, rgba(221,221,221,0.95) 70%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#1a1612",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            &larr;
          </button>
          <h1
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              color: "#1a1612",
            }}
          >
            whats ur song?
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Sort tabs */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => onSortChange("latest")}
              style={{
                padding: "7px 14px",
                borderRadius: "100px",
                border:
                  sortBy === "latest"
                    ? "1.5px solid rgba(0,0,0,0.15)"
                    : "1.5px solid transparent",
                background:
                  sortBy === "latest" ? "rgba(0,0,0,0.06)" : "transparent",
                color: sortBy === "latest" ? "#4a3f35" : "#b0a090",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Latest
            </button>
            <button
              onClick={() => onSortChange("loved")}
              style={{
                padding: "7px 14px",
                borderRadius: "100px",
                border:
                  sortBy === "loved"
                    ? "1.5px solid rgba(0,0,0,0.15)"
                    : "1.5px solid transparent",
                background:
                  sortBy === "loved" ? "rgba(0,0,0,0.06)" : "transparent",
                color: sortBy === "loved" ? "#4a3f35" : "#b0a090",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              &#9829; Most loved
            </button>
          </div>
          <button
            onClick={onAddMore}
            style={{
              padding: "9px 20px",
              background: "#1a1612",
              color: "#fff",
              border: "none",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              cursor: "pointer",
              boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          >
            + Add now
          </button>
        </div>
      </div>

      {/* Song grid */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "16px 40px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: "28px",
        }}
      >
        {songs.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 20px",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>&#127925;</div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#8a7a6a",
                marginBottom: "8px",
              }}
            >
              The wall is empty
            </div>
            <div style={{ fontSize: "14px", color: "#b0a090" }}>
              Be the first to pin a song.
            </div>
          </div>
        ) : (
          songs.map((song, i) => (
            <PlayerCard
              key={song.id}
              song={song}
              index={i}
              onLike={onLike}
              onClick={(song) => setSelectedId(song.id)}
            />
          ))
        )}
      </div>

      {/* Song detail modal */}
      {selected && (
        <SongDetailModal
          song={selected}
          onClose={() => setSelectedId(null)}
          onLike={onLike}
          onDelete={(id) => { onDelete(id); setSelectedId(null); }}
        />
      )}
    </div>
  );
}

function SongDetailModal({
  song,
  onClose,
  onLike,
  onDelete,
}: {
  song: Song;
  onClose: () => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.25s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          animation: "cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(42,34,24,0.05)",
            color: "#b0a090",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          &#10005;
        </button>

        {/* Spotify embed player */}
        <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
          <iframe
            src={`https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: "12px" }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: "30px",
            height: "1.5px",
            background: "#b8543c",
            margin: "0 auto 16px",
            opacity: 0.35,
          }}
        />

        {/* Reason */}
        <div
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "14px",
            color: "#6a5a4a",
            lineHeight: 1.7,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          &ldquo;{song.reason}&rdquo;
        </div>

        {/* Pinned by */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "rgba(42,34,24,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              color: "#b0a090",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            }}
          >
            {song.pinned_by[0]}
          </div>
          <span
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "11px",
              color: "#c0b0a0",
            }}
          >
            pinned by{" "}
            <span style={{ color: "#6a5a4a", fontWeight: 600 }}>
              {song.pinned_by}
            </span>
            {" "}
            &middot; {relativeTime(song.created_at)}
          </span>
        </div>

        {/* Like + Delete */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            marginTop: "16px",
          }}
        >
          <HeartButton
            liked={!!song.liked}
            count={song.likes_count}
            size="lg"
            onToggle={() => onLike(song.id)}
          />
          {song.is_owner && (
            <button
              onClick={() => {
                if (confirm("Remove this song from the wall?")) {
                  onDelete(song.id);
                }
              }}
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1.5px solid rgba(0,0,0,0.08)",
                borderRadius: "100px",
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(0,0,0,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(192,57,43,0.2)";
                (e.currentTarget as HTMLElement).style.color = "#c0392b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.35)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
