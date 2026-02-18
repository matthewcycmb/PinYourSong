"use client";

import { useState } from "react";
import Image from "next/image";
import type { Song } from "@/types";
import HeartButton from "./HeartButton";
import { useAudio } from "./AudioPlayer";

interface PlayerCardProps {
  song: Song;
  index?: number;
  onLike?: (id: string) => void;
  onClick?: (song: Song) => void;
  isPreview?: boolean;
}

export default function PlayerCard({
  song,
  index = 0,
  onLike,
  onClick,
  isPreview = false,
}: PlayerCardProps) {
  const [hovered, setHovered] = useState(false);
  const audio = useAudio();

  const isThisSongPlaying = audio.currentSongId === song.id && audio.isPlaying;
  const isThisSong = audio.currentSongId === song.id;

  const bgBase = song.bg_tint || song.color || "#8a8a85";
  const bgDark = song.color || "#7a7a75";

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (song.preview_url) {
      audio.toggle(song.id, song.preview_url);
    } else if (onClick) {
      onClick(song);
    }
  };

  return (
    <div
      onClick={() => onClick?.(song)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(150deg, ${bgBase}, ${bgDark})`,
        borderRadius: "18px",
        padding: isPreview ? "14px" : "10px",
        width: isPreview ? "260px" : "100%",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: !isPreview && hovered ? "scale(1.03)" : "scale(1)",
        boxShadow: isPreview
          ? `0 16px 50px ${bgBase}55, 0 4px 14px rgba(0,0,0,0.15)`
          : hovered
            ? `0 10px 30px ${bgBase}44`
            : "0 2px 8px rgba(0,0,0,0.12)",
        animation: !isPreview
          ? `cardIn 0.5s ease ${index * 0.04}s both`
          : undefined,
      }}
    >
      {/* Shine overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Album art */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 10px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <Image
          src={song.album_art_url}
          alt={`${song.title} by ${song.artist}`}
          fill
          sizes={isPreview ? "260px" : "(max-width: 640px) 50vw, 200px"}
          style={{ objectFit: "cover" }}
        />

        {/* Play overlay on hover */}
        {!isPreview && hovered && (
          <div
            onClick={handlePlay}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isThisSongPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#111">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "11px solid #111",
                    borderTop: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    marginLeft: "2px",
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Song info */}
      <div
        style={{
          marginTop: isPreview ? "12px" : "8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Heart + dots row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          {onLike ? (
            <HeartButton
              liked={!!song.liked}
              count={song.likes_count}
              onToggle={() => onLike(song.id)}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                width={isPreview ? 14 : 12}
                height={isPreview ? 14 : 12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "rgba(0,0,0,0.3)" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span
                style={{
                  fontSize: isPreview ? "11px" : "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  color: "rgba(0,0,0,0.3)",
                }}
              >
                {song.likes_count}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "2.5px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "3.5px",
                  height: "3.5px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.25)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: isPreview ? "14px" : "11px",
            fontWeight: 700,
            color: "rgba(0,0,0,0.75)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            transition: "color 0.3s",
            minHeight: isPreview ? "17px" : "14px",
          }}
        >
          {song.title}
        </div>

        {/* Artist */}
        <div
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: isPreview ? "11px" : "9px",
            fontWeight: 500,
            color: "rgba(0,0,0,0.4)",
            marginTop: "1px",
            transition: "color 0.3s",
          }}
        >
          {song.artist}
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: isPreview ? "10px" : "7px",
            height: isPreview ? "3px" : "2.5px",
            borderRadius: "2px",
            background: "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: isThisSong ? `${audio.progress}%` : "0%",
              height: "100%",
              borderRadius: "2px",
              background: "rgba(0,0,0,0.35)",
              transition: isThisSong ? "none" : "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>

        {/* Playback controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isPreview ? "16px" : "12px",
            marginTop: isPreview ? "8px" : "6px",
          }}
        >
          <svg
            width={isPreview ? 12 : 10}
            height={isPreview ? 12 : 10}
            viewBox="0 0 24 24"
            fill="rgba(0,0,0,0.4)"
          >
            <path d="M19 20L9 12l10-8v16zM5 4h2v16H5V4z" />
          </svg>
          <div
            onClick={handlePlay}
            style={{
              width: isPreview ? "28px" : "22px",
              height: isPreview ? "28px" : "22px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isThisSongPlaying ? (
              <svg
                width={isPreview ? 10 : 8}
                height={isPreview ? 10 : 8}
                viewBox="0 0 24 24"
                fill="white"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width={isPreview ? 10 : 8}
                height={isPreview ? 10 : 8}
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
          <svg
            width={isPreview ? 12 : 10}
            height={isPreview ? 12 : 10}
            viewBox="0 0 24 24"
            fill="rgba(0,0,0,0.4)"
          >
            <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
          </svg>
        </div>

        {/* Pinned by */}
        <div
          style={{
            marginTop: isPreview ? "8px" : "5px",
            textAlign: "center",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: isPreview ? "10px" : "8px",
            fontWeight: 600,
            color: "rgba(0,0,0,0.25)",
            transition: "color 0.3s",
          }}
        >
          pinned by {song.pinned_by}
        </div>

        {/* Reason (preview only) */}
        {isPreview && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px 10px",
              background: "rgba(0,0,0,0.04)",
              borderRadius: "8px",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "11px",
              color: song.reason ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.12)",
              fontStyle: "italic",
              lineHeight: 1.5,
              textAlign: "center",
              transition: "color 0.3s",
              minHeight: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {song.reason ? `"${song.reason}"` : '"Your reason will appear here"'}
          </div>
        )}
      </div>
    </div>
  );
}
