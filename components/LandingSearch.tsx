"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { buildSearchIndex, SearchEntry } from "@/lib/search";

const INDEX = buildSearchIndex();

const fuse = new Fuse<SearchEntry>(INDEX, {
  keys: [
    { name: "title", weight: 2 },
    { name: "section_title", weight: 1.5 },
    { name: "article_title", weight: 1 },
    { name: "category_title", weight: 0.5 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
});

function getEntryTitle(entry: SearchEntry): string {
  return entry.type === "article" ? entry.title : entry.section_title;
}

function getEntryBreadcrumb(entry: SearchEntry): string {
  if (entry.type === "article") return entry.category_title;
  return `${entry.category_id.replace(/_/g, " ")} › ${entry.article_title}`;
}

function getEntryHref(entry: SearchEntry): string {
  return entry.href;
}

export default function LandingSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const fuseResults = fuse.search(query, { limit: 10 });
    setResults(fuseResults.map((r: { item: SearchEntry }) => r.item));
  }, [query]);

  const handleSelect = useCallback(
    (entry: SearchEntry) => {
      router.push(getEntryHref(entry));
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length === 0) return;
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && query.trim().length > 0 && results.length > 0;

  return (
    <div style={{ position: "relative" }}>
      {/* Heading */}
      <p
        style={{
          fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 200,
          letterSpacing: "-0.025em",
          color: "var(--ink)",
          margin: 0,
          marginBottom: "1rem",
          lineHeight: 1.2,
        }}
      >
        Ответы на вопросы о Бангкоке
      </p>

      {/* Search input row */}
      <div
        style={{
          position: "relative",
          borderBottom: "0.5px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Что найти?"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            height: "60px",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            caretColor: "var(--accent)",
            padding: 0,
          }}
          aria-label="Поиск по FAQ Бангкока"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="landing-search-dropdown"
          aria-activedescendant={
            activeIndex >= 0 ? `landing-search-item-${activeIndex}` : undefined
          }
        />
        {/* Hint: right-aligned. Hidden on touch devices (no physical ⌘ key). */}
        <span
          className="landing-search-hint"
          style={{
            fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontSize: "0.5625rem",
            fontWeight: 300,
            letterSpacing: "0.1em",
            color: "var(--stone)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            userSelect: "none",
          }}
          aria-hidden="true"
        >
          ⌘K для быстрого поиска
        </span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id="landing-search-dropdown"
          ref={listRef}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 0.25rem)",
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
            backgroundColor: "var(--bg)",
            border: "0.5px solid var(--rule)",
            zIndex: 50,
            maxHeight: "22rem",
            overflowY: "auto",
          }}
        >
          {results.map((entry, i) => {
            const isActive = i === activeIndex;
            return (
              <li
                key={`${entry.type}-${entry.href}-${i}`}
                id={`landing-search-item-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={() => handleSelect(entry)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  padding: "0.875rem 1rem",
                  cursor: "pointer",
                  borderBottom: "0.5px solid var(--rule)",
                  backgroundColor: isActive ? "var(--code-bg)" : "transparent",
                  transition: "background-color 0.1s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "var(--font-inter-tight), 'Inter Tight', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 200,
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.35,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getEntryTitle(entry)}
                  </span>
                  {entry.type === "section" && (
                    <span
                      style={{
                        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                        fontSize: "0.5625rem",
                        color: "var(--accent)",
                        letterSpacing: "0.04em",
                        flexShrink: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      §
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily:
                      "var(--font-inter-tight), 'Inter Tight', sans-serif",
                    fontSize: "0.625rem",
                    fontWeight: 300,
                    color: "var(--stone)",
                    letterSpacing: "0.04em",
                    marginTop: "0.25rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getEntryBreadcrumb(entry)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
