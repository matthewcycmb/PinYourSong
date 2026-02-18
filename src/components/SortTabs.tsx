"use client";

interface SortTabsProps {
  sortBy: "latest" | "loved";
  onChange: (sort: "latest" | "loved") => void;
}

const tabs = [
  { key: "latest" as const, label: "Latest" },
  { key: "loved" as const, label: "\u2665 Most loved" },
];

export default function SortTabs({ sortBy, onChange }: SortTabsProps) {
  return (
    <div style={{ display: "flex", gap: "4px", marginTop: "28px" }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: "8px 18px",
            borderRadius: "100px",
            border:
              sortBy === tab.key
                ? "1.5px solid rgba(0,0,0,0.15)"
                : "1.5px solid transparent",
            background: sortBy === tab.key ? "rgba(0,0,0,0.06)" : "transparent",
            color: sortBy === tab.key ? "#4a3f35" : "#b0a090",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
