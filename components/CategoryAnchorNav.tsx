"use client";

import { useEffect, useRef, useState } from "react";
import { Category } from "@/lib/data";

interface CategoryAnchorNavProps {
  categories: Category[];
}

export default function CategoryAnchorNav({
  categories,
}: CategoryAnchorNavProps) {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element — sits just above the sticky bar */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: -1 }} />

      <nav
        aria-label="Переход к категории"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--bg)",
          borderBottom: "0.5px solid var(--rule)",
          borderTop: stuck ? "0.5px solid var(--rule)" : "none",
          transition: "border-top 0.15s ease, box-shadow 0.15s ease",
          boxShadow: stuck ? "var(--shadow-elev-2)" : "none",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
            paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0",
            minWidth: "max-content",
          }}
        >
          {categories.map((cat, i) => (
            <span
              key={cat.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              {i > 0 && (
                <span
                  style={{
                    color: "var(--rule)",
                    margin: "0 0.625rem",
                    fontSize: "0.4rem",
                    userSelect: "none",
                  }}
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
              <a
                href={`#${cat.id}`}
                style={{
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 300,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.12s ease",
                  paddingBottom: "1px",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--ink)";
                  (e.target as HTMLElement).style.borderBottom =
                    "0.5px solid var(--ink)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--stone)";
                  (e.target as HTMLElement).style.borderBottom = "none";
                }}
              >
                {cat.title_ru}
              </a>
            </span>
          ))}
        </div>
      </nav>
    </>
  );
}
