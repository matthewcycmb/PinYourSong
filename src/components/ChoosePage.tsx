"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import SpotifySearchInput from "./SpotifySearchInput";
import type { SpotifySearchResult, Song } from "@/types";

interface ChoosePageProps {
  onSubmit: (songs: Song[]) => void;
  onBack: () => void;
}

const COLOR_OPTIONS = [
  { name: "Warm Sand", bgBase: "hsl(28, 25%, 62%)", bgDark: "hsl(28, 20%, 52%)", swatch: "hsl(28, 25%, 62%)" },
  { name: "Ocean", bgBase: "hsl(215, 25%, 62%)", bgDark: "hsl(215, 20%, 52%)", swatch: "hsl(215, 25%, 62%)" },
  { name: "Rose", bgBase: "hsl(340, 25%, 62%)", bgDark: "hsl(340, 20%, 52%)", swatch: "hsl(340, 25%, 62%)" },
  { name: "Forest", bgBase: "hsl(130, 25%, 62%)", bgDark: "hsl(130, 20%, 52%)", swatch: "hsl(130, 25%, 62%)" },
  { name: "Plum", bgBase: "hsl(280, 25%, 62%)", bgDark: "hsl(280, 20%, 52%)", swatch: "hsl(280, 25%, 62%)" },
  { name: "Ember", bgBase: "hsl(0, 25%, 62%)", bgDark: "hsl(0, 20%, 52%)", swatch: "hsl(0, 25%, 62%)" },
  { name: "Slate", bgBase: "hsl(195, 25%, 62%)", bgDark: "hsl(195, 20%, 52%)", swatch: "hsl(195, 25%, 62%)" },
  { name: "Gold", bgBase: "hsl(45, 25%, 62%)", bgDark: "hsl(45, 20%, 52%)", swatch: "hsl(45, 25%, 62%)" },
  { name: "Lavender", bgBase: "hsl(260, 30%, 72%)", bgDark: "hsl(260, 25%, 58%)", swatch: "hsl(260, 30%, 72%)" },
  { name: "Sky", bgBase: "hsl(200, 35%, 70%)", bgDark: "hsl(200, 30%, 55%)", swatch: "hsl(200, 35%, 70%)" },
  { name: "Peach", bgBase: "hsl(15, 40%, 72%)", bgDark: "hsl(15, 30%, 58%)", swatch: "hsl(15, 40%, 72%)" },
  { name: "Mint", bgBase: "hsl(160, 25%, 65%)", bgDark: "hsl(160, 20%, 52%)", swatch: "hsl(160, 25%, 65%)" },
  { name: "Black", bgBase: "#3a3a3a", bgDark: "#1a1a1a", swatch: "#1a1a1a" },
  { name: "Charcoal", bgBase: "#5a5a5a", bgDark: "#3a3a3a", swatch: "#4a4a4a" },
  { name: "Grey", bgBase: "#9a9a9a", bgDark: "#7a7a7a", swatch: "#8a8a8a" },
  { name: "White", bgBase: "#e8e8e8", bgDark: "#c8c8c8", swatch: "#e0e0e0" },
];

function strToHue(s: string): number {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

function hueToColors(hue: number) {
  const bgBase = `hsl(${hue}, 25%, 62%)`;
  const bgDark = `hsl(${hue}, 20%, 52%)`;
  return { bgBase, bgDark };
}

export default function ChoosePage({ onSubmit, onBack }: ChoosePageProps) {
  const [selectedSong, setSelectedSong] = useState<SpotifySearchResult | null>(null);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const title = selectedSong?.title || "";
  const artist = selectedSong?.artist || "";
  const canSubmit = selectedSong && name && reason && !submitting;
  const autoHue = useMemo(() => strToHue(title + artist), [title, artist]);
  const autoColors = hueToColors(autoHue);
  const bgBase = selectedColorIdx !== null ? COLOR_OPTIONS[selectedColorIdx].bgBase : autoColors.bgBase;
  const bgDark = selectedColorIdx !== null ? COLOR_OPTIONS[selectedColorIdx].bgDark : autoColors.bgDark;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedSong) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          songs: [{
            spotifyId: selectedSong.spotifyId,
            reason: reason.trim(),
            color: bgDark,
            bgTint: bgBase,
          }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }

      onSubmit(data.songs);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1.5px solid rgba(42,34,24,0.1)",
    color: "#2a2218",
    fontSize: "18px",
    fontFamily:
      "var(--font-cormorant), 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontStyle: "italic",
    fontWeight: 500,
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    fontSize: "9px",
    fontWeight: 700,
    color: "#b0a090",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    marginBottom: "2px",
    display: "block",
  };

  // Build a preview "song" object for the preview card
  const previewProgress = [title, artist, name, reason].filter(Boolean).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0ebe4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/bg-choose.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          pointerEvents: "none",
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: "28px",
          right: "28px",
          background: "none",
          border: "none",
          color: "rgba(0,0,0,0.4)",
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        &larr; back
      </button>

      {/* Content */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "80px",
          maxWidth: "860px",
          width: "92%",
          padding: "80px 0 40px",
          flexWrap: "wrap",
          justifyContent: "center",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Form card */}
        <div
          style={{
            background: "#fff",
            padding: "40px 36px",
            maxWidth: "360px",
            width: "100%",
            flex: "1 1 320px",
            boxShadow:
              "0 4px 8px rgba(0,0,0,0.1), 0 20px 60px rgba(0,0,0,0.2)",
            animation:
              "cardAppear 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
            position: "relative",
          }}
        >
          {/* Paper texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.02,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontFamily:
                  "var(--font-cormorant), 'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: "32px",
                fontWeight: 500,
                color: "#1a1612",
                fontStyle: "italic",
                lineHeight: 1.1,
              }}
            >
              Choose your song<span style={{ color: "#b8543c" }}>.</span>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: "12px",
                color: "#b0a090",
                marginTop: "6px",
                marginBottom: "28px",
              }}
            >
              Watch your card come to life &rarr;
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "22px",
              }}
            >
              {/* Song search */}
              <div>
                <label style={labelStyle}>Song</label>
                <SpotifySearchInput
                  selected={selectedSong}
                  onSelect={setSelectedSong}
                  onClear={() => setSelectedSong(null)}
                  variant="choose"
                />
              </div>

              {/* Your name */}
              <div>
                <label style={labelStyle}>Your name</label>
                <input
                  style={inputStyle}
                  placeholder="Maya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = "#b8543c";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = "rgba(42,34,24,0.1)";
                  }}
                />
              </div>

              {/* Why this song? */}
              <div>
                <label style={labelStyle}>Why this song?</label>
                <input
                  style={{
                    ...inputStyle,
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontStyle: "normal",
                    fontSize: "14px",
                  }}
                  placeholder="One line. Make it count."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={80}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = "#b8543c";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = "rgba(42,34,24,0.1)";
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "10px",
                    color: "#d0c0b0",
                    marginTop: "6px",
                    textAlign: "right",
                  }}
                >
                  {reason.length}/80
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label style={labelStyle}>Card color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Auto option */}
                  <div
                    onClick={() => setSelectedColorIdx(null)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background:
                        "conic-gradient(hsl(0,25%,62%), hsl(60,25%,62%), hsl(120,25%,62%), hsl(180,25%,62%), hsl(240,25%,62%), hsl(300,25%,62%), hsl(360,25%,62%))",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border:
                        selectedColorIdx === null
                          ? "2.5px solid #1a1612"
                          : "2.5px solid transparent",
                      boxShadow:
                        selectedColorIdx === null
                          ? "0 0 0 2px #fff, 0 0 0 4px #1a1612"
                          : "none",
                      transform:
                        selectedColorIdx === null ? "scale(1.1)" : "scale(1)",
                    }}
                    title="Auto"
                  />
                  {COLOR_OPTIONS.map((c, i) => (
                    <div
                      key={c.name}
                      onClick={() => setSelectedColorIdx(i)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: c.swatch,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        border:
                          selectedColorIdx === i
                            ? "2.5px solid #1a1612"
                            : c.name === "White" ? "2.5px solid rgba(0,0,0,0.1)" : "2.5px solid transparent",
                        boxShadow:
                          selectedColorIdx === i
                            ? "0 0 0 2px #fff, 0 0 0 4px #1a1612"
                            : "none",
                        transform:
                          selectedColorIdx === i ? "scale(1.1)" : "scale(1)",
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div
                style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "#c0392b",
                  background: "rgba(192, 57, 43, 0.1)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  marginTop: "14px",
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
                padding: "15px",
                marginTop: "20px",
                background: canSubmit ? "#b8543c" : "#e8ddd0",
                color: canSubmit ? "#fff" : "#c0b0a0",
                border: "none",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                cursor: canSubmit ? "pointer" : "default",
                transition: "all 0.3s",
                boxShadow: canSubmit
                  ? "0 6px 24px rgba(184,84,60,0.25)"
                  : "none",
              }}
            >
              {submitting ? "Pinning..." : "Pin to the wall \u2192"}
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            animation:
              "cardAppear 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              color: "rgba(0,0,0,0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Live Preview
          </div>
          <div
            style={{
              transform: "rotate(-2deg)",
              transition: "transform 0.5s ease",
            }}
          >
            {/* Preview card - inline since it uses hue-based colors and might not have a real album art yet */}
            <div
              style={{
                background: `linear-gradient(150deg, ${bgBase}, ${bgDark})`,
                borderRadius: "18px",
                padding: "14px",
                width: "260px",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 16px 50px ${bgBase}55, 0 4px 14px rgba(0,0,0,0.15)`,
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
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Album art / placeholder */}
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
                {selectedSong?.albumArtUrl ? (
                  <Image
                    src={selectedSong.albumArtUrl}
                    alt="Album art"
                    fill
                    sizes="260px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <PreviewGenArt hue={autoHue} filled={!!(title || artist)} />
                )}
                {!selectedSong && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.18)",
                        fontWeight: 600,
                      }}
                    >
                      Search for a song...
                    </span>
                  </div>
                )}
              </div>

              {/* Info section */}
              <div style={{ marginTop: "12px", position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg
                      width={14}
                      height={14}
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
                        fontSize: "11px",
                        fontWeight: 700,
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        color: "rgba(0,0,0,0.3)",
                      }}
                    >
                      0
                    </span>
                  </div>
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

                <div
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: title ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "color 0.3s",
                    minHeight: "17px",
                  }}
                >
                  {title || "Song title"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: artist ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)",
                    marginTop: "1px",
                    transition: "color 0.3s",
                  }}
                >
                  {artist || "Artist"}
                </div>

                {/* Progress */}
                <div
                  style={{
                    marginTop: "10px",
                    height: "3px",
                    borderRadius: "2px",
                    background: "rgba(0,0,0,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(previewProgress / 4) * 100}%`,
                      height: "100%",
                      borderRadius: "2px",
                      background: "rgba(0,0,0,0.35)",
                      transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>

                {/* Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "8px",
                  }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(0,0,0,0.4)">
                    <path d="M19 20L9 12l10-8v16zM5 4h2v16H5V4z" />
                  </svg>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(0,0,0,0.4)">
                    <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
                  </svg>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    textAlign: "center",
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: name ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.1)",
                    transition: "color 0.3s",
                  }}
                >
                  {name ? `pinned by ${name}` : "pinned by ..."}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 10px",
                    background: "rgba(0,0,0,0.04)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "11px",
                    color: reason ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.12)",
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
                  {reason ? `"${reason}"` : '"Your reason will appear here"'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "11px",
              color: "rgba(0,0,0,0.2)",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "200px",
              fontStyle: "italic",
            }}
          >
            {!title && !artist
              ? "Start typing to see your card"
              : !canSubmit
                ? "Keep going..."
                : "Ready to pin! \u2726"}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Generative art placeholder for preview card when no album art is selected */
function PreviewGenArt({ hue, filled }: { hue: number; filled: boolean }) {
  const h1 = hue;
  const h2 = (hue + 35) % 360;
  const h3 = (hue + 180) % 360;
  return (
    <svg
      viewBox="0 0 200 200"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <radialGradient id={`a-${hue}`} cx="35%" cy="30%">
          <stop
            offset="0%"
            stopColor={filled ? `hsl(${h1}, 50%, 52%)` : "hsl(0, 0%, 28%)"}
          />
          <stop
            offset="100%"
            stopColor={filled ? `hsl(${h2}, 40%, 22%)` : "hsl(0, 0%, 14%)"}
          />
        </radialGradient>
      </defs>
      <rect
        width="200"
        height="200"
        fill={filled ? `url(#a-${hue})` : "#1a1a1a"}
      />
      {filled && (
        <>
          <circle
            cx={40 + ((hue * 3) % 80)}
            cy={40 + ((hue * 5) % 80)}
            r={30 + ((hue * 2) % 30)}
            fill={`hsla(${h3}, 40%, 60%, 0.2)`}
          />
          <circle
            cx={150 - ((hue * 2) % 60)}
            cy={150 - ((hue * 3) % 60)}
            r={25 + (hue % 25)}
            fill={`hsla(${h1}, 50%, 70%, 0.15)`}
          />
        </>
      )}
    </svg>
  );
}
