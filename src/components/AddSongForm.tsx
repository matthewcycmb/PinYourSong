"use client";

import { useState } from "react";
import SpotifySearchInput from "./SpotifySearchInput";
import type { SpotifySearchResult, Song } from "@/types";

interface SongEntry {
  selected: SpotifySearchResult | null;
  reason: string;
}

interface AddSongFormProps {
  onAdd: (songs: Song[]) => void;
  onClose: () => void;
}

export default function AddSongForm({ onAdd, onClose }: AddSongFormProps) {
  const [songs, setSongs] = useState<SongEntry[]>([{ selected: null, reason: "" }]);
  const [yourName, setYourName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: "12px",
    color: "#333",
    fontSize: "14px",
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(0,0,0,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "6px",
    display: "block",
  };

  const updateSong = (idx: number, field: keyof SongEntry, value: SongEntry[keyof SongEntry]) => {
    const updated = [...songs];
    updated[idx] = { ...updated[idx], [field]: value };
    setSongs(updated);
  };

  const canSubmit =
    yourName.trim() && songs.every((s) => s.selected && s.reason.trim()) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: yourName.trim(),
          songs: songs.map((s) => ({
            spotifyId: s.selected!.spotifyId,
            reason: s.reason.trim(),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }

      onAdd(data.songs);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
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
          background: "linear-gradient(160deg, #b8a88a, #a0927a)",
          borderRadius: "28px",
          padding: "28px",
          maxWidth: "400px",
          width: "100%",
          animation: "modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "28px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "rgba(0,0,0,0.8)",
              marginBottom: "4px",
            }}
          >
            Pin your song{songs.length > 1 ? "s" : ""}
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "13px",
              color: "rgba(0,0,0,0.4)",
              marginBottom: "22px",
            }}
          >
            You get 2 pins today. Make them count.
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Your name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Maya"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.6)";
                e.target.style.background = "rgba(255,255,255,0.7)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.3)";
                e.target.style.background = "rgba(255,255,255,0.55)";
              }}
            />
          </div>

          {songs.map((song, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.15)",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.45)",
                  }}
                >
                  {songs.length > 1 ? `Song ${idx + 1}` : "Your song"}
                </span>
                {songs.length > 1 && (
                  <button
                    onClick={() => setSongs(songs.filter((_, i) => i !== idx))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "0 4px",
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <label style={labelStyle}>Song</label>
                  <SpotifySearchInput
                    selected={song.selected}
                    onSelect={(result) => updateSong(idx, "selected", result)}
                    onClear={() => updateSong(idx, "selected", null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Why this song?</label>
                  <input
                    style={inputStyle}
                    placeholder="One line. Make it count."
                    value={song.reason}
                    onChange={(e) => updateSong(idx, "reason", e.target.value)}
                    maxLength={80}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.6)";
                      e.target.style.background = "rgba(255,255,255,0.7)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.3)";
                      e.target.style.background = "rgba(255,255,255,0.55)";
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: "10px",
                      color: "rgba(0,0,0,0.25)",
                      marginTop: "4px",
                      textAlign: "right",
                    }}
                  >
                    {song.reason.length}/80
                  </div>
                </div>
              </div>
            </div>
          ))}

          {songs.length < 2 && (
            <button
              onClick={() => setSongs([...songs, { selected: null, reason: "" }])}
              style={{
                width: "100%",
                padding: "11px",
                background: "transparent",
                border: "1.5px dashed rgba(0,0,0,0.15)",
                borderRadius: "12px",
                color: "rgba(0,0,0,0.35)",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "14px",
                fontWeight: 600,
              }}
            >
              + Can&apos;t choose? Add a second song
            </button>
          )}

          {error && (
            <div
              style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "12px",
                color: "#c0392b",
                background: "rgba(192, 57, 43, 0.1)",
                padding: "10px 14px",
                borderRadius: "10px",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: "14px",
              background: canSubmit ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.12)",
              color: canSubmit ? "#fff" : "rgba(0,0,0,0.25)",
              border: "none",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              cursor: canSubmit ? "pointer" : "default",
              transition: "all 0.2s ease",
              boxShadow: canSubmit ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {submitting ? "Pinning..." : "Pin to Wall"}
          </button>
        </div>
      </div>
    </div>
  );
}
