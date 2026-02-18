"use client";

import { useState } from "react";

interface LandingPageProps {
  onEnter: () => void;
  onBrowse: () => void;
}

export default function LandingPage({ onEnter, onBrowse }: LandingPageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#f0ebe4",
      }}
    >
      {/* Full-bleed background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/bg-landing.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Nav */}
      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "32px",
          zIndex: 20,
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          color: "#a89880",
          cursor: "pointer",
          letterSpacing: "0.02em",
        }}
      >
        About
      </div>

      {/* Centered card */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "none",
            padding: "40px 60px 36px",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.02), 0 6px 20px rgba(0,0,0,0.04), 0 20px 50px rgba(0,0,0,0.06)",
            maxWidth: "440px",
            width: "82vw",
            textAlign: "center",
            pointerEvents: "auto",
            animation: "cardAppear 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
            position: "relative",
            transform: "rotate(-1deg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Paper texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#1a1612",
              marginBottom: "4px",
            }}
          >
            Add ur favorite song
          </div>

          <h1
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "clamp(36px, 6vw, 50px)",
              fontWeight: 700,
              color: "#1a1612",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              fontStyle: "normal",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            whats ur song?
          </h1>

          <button
            onClick={onEnter}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              marginTop: "18px",
              padding: "11px 36px",
              background: hovered ? "#333" : "#1a1612",
              color: "#fff",
              border: "none",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: hovered
                ? "0 6px 24px rgba(0,0,0,0.25)"
                : "0 3px 14px rgba(0,0,0,0.1)",
              transform: hovered ? "translateY(-1px)" : "translateY(0)",
              letterSpacing: "0.04em",
            }}
          >
            Add now
          </button>

          <button
            onClick={onBrowse}
            style={{
              marginTop: "14px",
              background: "none",
              border: "none",
              color: "#1a1612",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.08em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#555";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#1a1612";
            }}
          >
            Browse the wall &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
