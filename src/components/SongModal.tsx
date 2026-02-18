"use client";

import Image from "next/image";
import type { Song } from "@/types";
import HeartButton from "./HeartButton";
import { useAudio } from "./AudioPlayer";
import { relativeTime } from "@/lib/utils";

interface SongModalProps {
  song: Song;
  onClose: () => void;
  onLike: (id: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SongModal({ song, onClose, onLike }: SongModalProps) {
  const audio = useAudio();
  const isThisSong = audio.currentSongId === song.id;
  const isPlaying = isThisSong && audio.isPlaying;

  const handlePlay = () => {
    if (song.preview_url) {
      audio.toggle(song.id, song.preview_url);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isThisSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    audio.seek(percent);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(30px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(160deg, ${song.bg_tint}, ${song.color})`,
          borderRadius: "28px",
          padding: "24px",
          maxWidth: "340px",
          width: "100%",
          animation: "modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          boxShadow: `0 30px 80px ${song.color}66, 0 10px 30px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "28px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.15)",
            color: "rgba(0,0,0,0.5)",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          &#10005;
        </button>

        {/* Album art large */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          <Image
            src={song.album_art_url}
            alt={`${song.title} by ${song.artist}`}
            fill
            sizes="340px"
            style={{ objectFit: "cover" }}
            priority
          />
          <div
            onClick={handlePlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.15)",
              cursor: song.preview_url ? "pointer" : "default",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 30px rgba(0,0,0,0.3)",
              }}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#111">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "20px solid #111",
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    marginLeft: "4px",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ marginTop: "20px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.85)",
                  lineHeight: 1.1,
                }}
              >
                {song.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "rgba(0,0,0,0.45)",
                  marginTop: "4px",
                  fontWeight: 500,
                }}
              >
                {song.artist}
              </div>
            </div>
            <HeartButton
              liked={!!song.liked}
              count={song.likes_count}
              size="lg"
              onToggle={() => onLike(song.id)}
            />
          </div>

          {/* Progress */}
          <div
            onClick={handleSeek}
            style={{
              marginTop: "20px",
              height: "4px",
              borderRadius: "2px",
              background: "rgba(0,0,0,0.1)",
              overflow: "hidden",
              cursor: isThisSong ? "pointer" : "default",
            }}
          >
            <div
              style={{
                width: isThisSong ? `${audio.progress}%` : "0%",
                height: "100%",
                borderRadius: "2px",
                background: "rgba(0,0,0,0.4)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "10px",
              color: "rgba(0,0,0,0.3)",
              fontWeight: 600,
            }}
          >
            <span>{isThisSong ? formatTime(audio.currentTime) : "0:00"}</span>
            <span>{isThisSong && audio.duration ? formatTime(audio.duration) : "0:30"}</span>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "24px",
              marginTop: "12px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.45)">
              <path d="M19 20L9 12l10-8v16zM5 4h2v16H5V4z" />
            </svg>
            <div
              onClick={handlePlay}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.45)">
              <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
            </svg>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "40px",
              height: "2px",
              background: "rgba(0,0,0,0.1)",
              margin: "18px auto",
              borderRadius: "1px",
            }}
          />

          {/* Reason */}
          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "14px",
              color: "rgba(0,0,0,0.6)",
              lineHeight: 1.6,
              fontStyle: "italic",
              textAlign: "center",
              padding: "0 8px",
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
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.1)",
                border: "1.5px solid rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(0,0,0,0.45)",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
            >
              {song.pinned_by[0]}
            </div>
            <span
              style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "12px",
                color: "rgba(0,0,0,0.35)",
                fontWeight: 500,
              }}
            >
              pinned by{" "}
              <span style={{ color: "rgba(0,0,0,0.55)", fontWeight: 600 }}>
                {song.pinned_by}
              </span>{" "}
              &middot; {relativeTime(song.created_at)}
            </span>
          </div>

          {/* Spotify link */}
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <a
              href={song.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "11px",
                color: "rgba(0,0,0,0.3)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Open in Spotify &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
