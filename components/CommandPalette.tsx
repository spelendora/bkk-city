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

const TOP_SUGGESTIONS = INDEX.filter((e) => e.type === "article").slice(0, 8);

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

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayedItems = query.trim().length > 0 ? results : TOP_SUGGESTIONS;
  const isShowingSuggestions = query.trim().length === 0;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
      // Focus input on next tick after mount
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const fuseResults = fuse.search(query, { limit: 12 });
    setResults(fuseResults.map((r: { item: SearchEntry }) => r.item));
    setActiveIndex(-1);
  }, [query]);

  const handleSelect = useCallback(
    (entry: SearchEntry) => {
      router.push(getEntryHref(entry));
      onClose?.();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, displayedItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target =
          activeIndex >= 0 ? displayedItems[activeIndex] : displayedItems[0];
        if (target) handleSelect(target);
      } else if (e.key === "Escape") {
        onClose?.();
      }
    },
    [activeIndex, displayedItems, handleSelect, onClose]
  );

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "var(--scrim)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "clamp(4rem, 12vh, 8rem)",
        paddingLeft: "clamp(1rem, 4vw, 2rem)",
        paddingRight: "clamp(1rem, 4vw, 2rem)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Быстрый поиск"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "var(--bg)",
          border: "0.5px solid var(--rule)",
          boxShadow: "var(--shadow-elev-2)",
          overflow: "hidden",
        }}
      >
        {/* Search input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            padding: "1.125rem 1.25rem",
            borderBottom: "0.5px solid var(--rule)",
          }}
        >
          <span
            style={{
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              fontSize: "0.75rem",
              color: "var(--stone)",
              flexShrink: 0,
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            /
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Что спросим?"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "1.125rem",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              caretColor: "var(--accent)",
              padding: 0,
            }}
            aria-label="Поиск по FAQ"
            aria-autocomplete="list"
            aria-expanded={displayedItems.length > 0}
            aria-controls="palette-dropdown"
            aria-activedescendant={
              activeIndex >= 0 ? `palette-item-${activeIndex}` : undefined
            }
          />
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              background: "transparent",
              border: "0.5px solid var(--rule)",
              padding: "0.125rem 0.375rem",
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              fontSize: "0.5rem",
              letterSpacing: "0.06em",
              color: "var(--stone)",
              cursor: "pointer",
            }}
            aria-label="Закрыть поиск"
          >
            esc
          </button>
        </div>

        {/* Results list */}
        {displayedItems.length > 0 && (
          <ul
            id="palette-dropdown"
            role="listbox"
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              maxHeight: "min(28rem, 60vh)",
              overflowY: "auto",
            }}
          >
            {isShowingSuggestions && (
              <li
                style={{
                  padding: "0.625rem 1.25rem",
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 300,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  borderBottom: "0.5px solid var(--rule)",
                  userSelect: "none",
                }}
              >
                Популярные статьи
              </li>
            )}
            {!isShowingSuggestions && (
              <li
                style={{
                  padding: "0.625rem 1.25rem",
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 300,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  borderBottom: "0.5px solid var(--rule)",
                  userSelect: "none",
                }}
              >
                Результаты — {results.length}
              </li>
            )}
            {displayedItems.map((entry, i) => {
              const isActive = i === activeIndex;
              return (
                <li
                  key={`${entry.type}-${entry.href}-${i}`}
                  id={`palette-item-${i}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(entry);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    padding: "0.875rem 1.25rem",
                    cursor: "pointer",
                    borderBottom: "0.5px solid var(--rule)",
                    backgroundColor: isActive ? "var(--code-bg)" : "transparent",
                    transition: "background-color 0.08s ease",
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

        {/* Footer hint */}
        <div
          style={{
            padding: "0.625rem 1.25rem",
            borderTop: "0.5px solid var(--rule)",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          {[
            ["↑↓", "navigate"],
            ["↵", "open"],
            ["esc", "close"],
          ].map(([key, label]) => (
            <span
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <kbd
                style={{
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                  fontSize: "0.5rem",
                  color: "var(--stone)",
                  border: "0.5px solid var(--rule)",
                  padding: "0.125rem 0.25rem",
                  letterSpacing: "0.02em",
                }}
              >
                {key}
              </kbd>
              <span
                style={{
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 300,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Global keyboard listener wrapper — mounts once, listens for Cmd/Ctrl+K
export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // "/" to open (only when not already in an input/textarea)
      if (
        e.key === "/" &&
        !open &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      // g h → go home
      if (!open && e.key === "g") {
        const seq = sessionStorage.getItem("__kbd_seq");
        if (seq === "g") {
          sessionStorage.removeItem("__kbd_seq");
        } else {
          sessionStorage.setItem("__kbd_seq", "g");
          sessionStorage.setItem("__kbd_seq_ts", String(Date.now()));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <CommandPaletteModal
      isOpen={open}
      onClose={() => setOpen(false)}
    />
  );
}
