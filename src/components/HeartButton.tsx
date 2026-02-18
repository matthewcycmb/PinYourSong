"use client";

import { useState } from "react";

interface HeartButtonProps {
  liked: boolean;
  count: number;
  size?: "sm" | "lg";
  onToggle: () => void;
}

function HeartIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#c9463d" : "none"}
      stroke={filled ? "#c9463d" : "currentColor"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function HeartButton({ liked, count, size = "sm", onToggle }: HeartButtonProps) {
  const [burst, setBurst] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBurst(true);
    onToggle();
    setTimeout(() => setBurst(false), 500);
  };

  if (size === "lg") {
    return (
      <button
        onClick={handleClick}
        style={{
          background: liked ? "rgba(232, 64, 90, 0.15)" : "rgba(0,0,0,0.08)",
          border: liked
            ? "1.5px solid rgba(232, 64, 90, 0.3)"
            : "1.5px solid rgba(0,0,0,0.1)",
          borderRadius: "100px",
          padding: "8px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transform: burst ? "scale(1.15)" : "scale(1)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          flexShrink: 0,
        }}
      >
        <HeartIcon filled={liked} size={16} />
        <span
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            color: liked ? "#c9463d" : "rgba(0,0,0,0.4)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: liked ? "#c9463d" : "rgba(0,0,0,0.45)",
        transition: "all 0.2s ease",
        transform: burst ? "scale(1.3)" : "scale(1)",
      }}
    >
      <HeartIcon filled={liked} size={16} />
      <span
        style={{
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          color: liked ? "#c9463d" : "rgba(0,0,0,0.4)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </span>
    </button>
  );
}
