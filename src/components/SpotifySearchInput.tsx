"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { SpotifySearchResult } from "@/types";

interface SpotifySearchInputProps {
  onSelect: (result: SpotifySearchResult) => void;
  selected: SpotifySearchResult | null;
  onClear: () => void;
  variant?: "default" | "choose";
}

export default function SpotifySearchInput({
  onSelect,
  selected,
  onClear,
  variant = "default",
}: SpotifySearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isChoose = variant === "choose";

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch {
        // keep existing results on error
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // -- Choose variant styles --
  const chooseInputStyle: React.CSSProperties = {
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

  const chooseSelectedStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1.5px solid rgba(42,34,24,0.1)",
  };

  const chooseResultsStyle: React.CSSProperties = {
    marginTop: "4px",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  };

  // -- Default variant styles --
  const defaultInputStyle: React.CSSProperties = {
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
    boxSizing: "border-box",
  };

  const defaultSelectedStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: "12px",
  };

  const defaultResultsStyle: React.CSSProperties = {
    marginTop: "6px",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.4)",
  };

  if (selected) {
    return (
      <div style={isChoose ? chooseSelectedStyle : defaultSelectedStyle}>
        <Image
          src={selected.albumArtUrl}
          alt={selected.album}
          width={40}
          height={40}
          style={{ borderRadius: "6px" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              color: isChoose ? "#2a2218" : "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "11px",
              color: isChoose ? "#b0a090" : "#888",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected.artist}
          </div>
        </div>
        <button
          onClick={onClear}
          style={{
            background: isChoose ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.1)",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "rgba(0,0,0,0.4)",
            flexShrink: 0,
          }}
        >
          &#10005;
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song..."
        style={isChoose ? chooseInputStyle : defaultInputStyle}
        onFocus={(e) => {
          if (isChoose) {
            e.target.style.borderBottomColor = "#b8543c";
          } else {
            e.target.style.borderColor = "rgba(255,255,255,0.6)";
            e.target.style.background = "rgba(255,255,255,0.7)";
          }
        }}
        onBlur={(e) => {
          if (isChoose) {
            e.target.style.borderBottomColor = "rgba(42,34,24,0.1)";
          } else {
            e.target.style.borderColor = "rgba(255,255,255,0.3)";
            e.target.style.background = "rgba(255,255,255,0.55)";
          }
        }}
      />
      {loading && (
        <div
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "11px",
            color: isChoose ? "#b0a090" : "rgba(0,0,0,0.3)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          Searching...
        </div>
      )}
      {results.length > 0 && (
        <div style={isChoose ? chooseResultsStyle : defaultResultsStyle}>
          {results.map((result) => (
            <div
              key={result.spotifyId}
              onClick={() => {
                onSelect(result);
                setQuery("");
                setResults([]);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "none";
              }}
            >
              <Image
                src={result.albumArtUrl}
                alt={result.album}
                width={36}
                height={36}
                style={{ borderRadius: "4px", flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isChoose ? "#2a2218" : "#333",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: "11px",
                    color: isChoose ? "#b0a090" : "#999",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.artist} &middot; {result.album}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
