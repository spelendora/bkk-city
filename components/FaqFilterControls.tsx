"use client";

import { useState, useEffect } from "react";

/**
 * FaqFilterControls — audience filter for /faq.
 * Sets data-audience-filter on <main data-audience-filter-root> so CSS can
 * hide/show .faq-article-row[data-audience="..."] rows without re-rendering.
 * Choice persists in localStorage so a returning reader keeps their preset.
 */
export default function FaqFilterControls() {
  const [audience, setAudience] = useState<"all" | "tourist" | "expat">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bkk-faq-audience");
      if (saved === "tourist" || saved === "expat" || saved === "all") {
        setAudience(saved);
      }
    } catch {
      /* localStorage disabled — default to "all" */
    }
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      "[data-audience-filter-root]"
    );
    if (root) root.dataset.audienceFilter = audience;
    try {
      localStorage.setItem("bkk-faq-audience", audience);
    } catch {
      /* ignore */
    }
  }, [audience]);

  const options: { value: "all" | "tourist" | "expat"; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "tourist", label: "Туристы" },
    { value: "expat", label: "Экспаты" },
  ];

  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
      {options.map((opt) => {
        const active = audience === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAudience(opt.value)}
            aria-pressed={active}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.625rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: active ? "var(--ink)" : "var(--stone)",
              borderBottom: active
                ? "0.5px solid var(--ink)"
                : "0.5px solid transparent",
              paddingBottom: "1px",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
