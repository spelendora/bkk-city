"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/slugify";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Parse h2 / h3 headings from raw markdown.
 * Returns entries in document order.
 */
function parseTocFromMarkdown(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const m2 = line.match(/^## (.+)/);
    if (m2) {
      const text = m2[1].trim();
      entries.push({ id: slugify(text), text, level: 2 });
      continue;
    }
    const m3 = line.match(/^### (.+)/);
    if (m3) {
      const text = m3[1].trim();
      entries.push({ id: slugify(text), text, level: 3 });
    }
  }
  return entries;
}

interface ArticleSideTOCProps {
  markdown: string;
}

/**
 * ArticleSideTOC — sticky right-rail table of contents.
 * Visible only on xl screens (≥ 1280 px). Highlights the current section
 * via IntersectionObserver on the heading elements.
 *
 * Named ArticleSideTOC (not ArticleTOC) to avoid collision with any
 * inline TOC that Agent B may produce.
 */
export default function ArticleSideTOC({ markdown }: ArticleSideTOCProps) {
  const entries = parseTocFromMarkdown(markdown);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (entries.length === 0) return;

    // Resolve every heading element once — filter out any TOC entries whose
    // slug we didn't find in the DOM (e.g. if the article was edited).
    const headingEls: HTMLElement[] = [];
    for (const entry of entries) {
      const el = document.getElementById(entry.id) as HTMLElement | null;
      if (el) headingEls.push(el);
    }
    if (headingEls.length === 0) return;

    /**
     * Scroll-progress model — the active section is the heading whose
     * content area the reader is currently looking at. We pick the last
     * heading whose top has passed an activation line at 35% of viewport
     * height. This is a middle-ground between "heading just entered view"
     * (too eager, flickers) and "heading has reached the top" (too lazy,
     * previous heading stays stuck when reader is already in the next
     * section). 35% keeps the active pointer centered on the content the
     * reader is actually reading.
     *
     * Special case: if any heading is within 4 px of the activation line,
     * pick IT (prevents flicker when `scroll-margin-top` places a heading
     * exactly at the line after a click-nav).
     */
    const ACTIVATION_RATIO = 0.35;

    let rafToken = 0;
    const compute = () => {
      rafToken = 0;
      const activationY = window.innerHeight * ACTIVATION_RATIO;
      // Start with "nothing active" when the page is above every heading.
      // Only activate once at least one heading has crossed the line.
      let currentId = "";
      for (const el of headingEls) {
        const top = el.getBoundingClientRect().top;
        if (top <= activationY + 4) {
          currentId = el.id;
        } else {
          break;
        }
      }
      // If we're scrolled way past everything, last heading stays active.
      // If nothing has crossed yet, keep first heading highlighted so the
      // TOC doesn't look blank.
      if (!currentId) currentId = headingEls[0].id;
      setActiveId((prev) => (prev === currentId ? prev : currentId));
    };

    const onScroll = () => {
      if (rafToken) return;
      rafToken = window.requestAnimationFrame(compute);
    };

    compute(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafToken) window.cancelAnimationFrame(rafToken);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Содержание статьи"
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          borderLeft: "0.5px solid var(--rule)",
          paddingLeft: "1.25rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontSize: "0.4375rem",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--stone)",
            marginBottom: "0.875rem",
            marginTop: 0,
          }}
        >
          Содержание
        </p>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {entries.map((entry) => {
            const isActive = entry.id === activeId;
            return (
              <li key={entry.id} style={{ marginBottom: "0.5rem" }}>
                <a
                  href={`#${entry.id}`}
                  className={`side-toc-link${isActive ? " side-toc-link--active" : ""}`}
                  data-level={entry.level}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(entry.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.pushState(null, "", `#${entry.id}`);
                    }
                  }}
                >
                  {entry.text}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
