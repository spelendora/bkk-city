"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/data";

interface Props {
  category: Category;
  index: number;
  defaultExpanded?: boolean;
}

/**
 * FaqCategoryAccordion — a single collapsible category block on /faq.
 *
 * Collapsed: shows only the category header (number + title + description +
 * article count). Clicking expands it in place to show the full article list.
 * State is local to each category; no URL state, but hash-links (e.g.
 * /faq#housing) still land on the section.
 */
export default function FaqCategoryAccordion({
  category,
  index,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section
      className="faq-category-section"
      id={category.id}
      data-expanded={expanded}
      style={{ marginBottom: "1.75rem" }}
    >
      {/* Clickable header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          all: "unset",
          cursor: "pointer",
          width: "100%",
          display: "block",
          borderTop: "0.5px solid var(--rule)",
          paddingTop: "1.25rem",
          paddingBottom: expanded ? "1.25rem" : "1.25rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "clamp(60px, 8vw, 120px) 1fr auto",
            gap: "0",
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              fontSize: "0.625rem",
              color: "var(--stone)",
              letterSpacing: "0.04em",
              paddingTop: "0.25rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <h2
              style={{
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 200,
                letterSpacing: "-0.015em",
                color: "var(--ink)",
                marginBottom: "0.375rem",
              }}
            >
              {category.title_ru}
            </h2>
            {category.description_ru && (
              <p
                style={{
                  fontFamily: "var(--font-inter), 'Inter', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 300,
                  color: "var(--stone)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {category.description_ru}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--stone)",
              paddingTop: "0.375rem",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <span
              className="faq-category-toggle--closed"
              style={{
                fontSize: "1rem",
                lineHeight: 1,
                fontWeight: 200,
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
              }}
            >
              +
            </span>
            <span
              className="faq-category-toggle--open"
              style={{
                fontSize: "1rem",
                lineHeight: 1,
                fontWeight: 200,
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
              }}
            >
              −
            </span>
          </div>
        </div>
      </button>

      {/* Collapsible body — grouped by audience: tourists first, then
          both-audiences, then expat-only. Within each group articles keep
          the priority-desc order they already arrive in. Groups with 0
          articles are skipped entirely. */}
      <div className="faq-category-body" style={{ marginTop: "0.5rem" }}>
        {(() => {
          const tourist = category.articles.filter(
            (a) => a.audience === "tourist",
          );
          const both = category.articles.filter(
            (a) => a.audience === "both",
          );
          const expat = category.articles.filter(
            (a) => a.audience === "expat",
          );
          const groups: { label: string; items: typeof tourist }[] = [];
          // Only label groups when there's a real split — i.e. at least
          // two of the three buckets have entries. A homogeneous category
          // (all "both", all "tourist", etc.) reads better without any
          // subheaders.
          const nonEmpty = [tourist, both, expat].filter(
            (g) => g.length > 0,
          ).length;
          if (nonEmpty <= 1) {
            groups.push({ label: "", items: [...tourist, ...both, ...expat] });
          } else {
            if (tourist.length > 0)
              groups.push({ label: "Для туристов", items: tourist });
            if (both.length > 0)
              groups.push({ label: "Для всех", items: both });
            if (expat.length > 0)
              groups.push({ label: "Для экспатов", items: expat });
          }
          return groups.map((group, gi) => (
            <div
              key={group.label || `g-${gi}`}
              style={{ marginTop: gi > 0 ? "0.875rem" : 0 }}
            >
              {group.items.map((article, ai) => (
                <div
                  key={article.slug}
                  className="faq-article-row"
                  style={{ borderTop: "0.5px solid var(--rule)" }}
                >
                  <Link
                    href={`/faq/${article.category_id}/${article.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "clamp(60px, 8vw, 120px) 1fr",
                        gap: "0",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem",
                        alignItems: "baseline",
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            "var(--font-inter-tight), 'Inter Tight', sans-serif",
                          fontSize: "0.4375rem",
                          fontWeight: 300,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--stone)",
                          paddingTop: "0.375rem",
                        }}
                      >
                        {ai === 0 ? group.label : ""}
                      </div>
                      <h3
                        style={{
                          fontFamily:
                            "var(--font-inter-tight), 'Inter Tight', sans-serif",
                          fontSize: "0.9375rem",
                          fontWeight: 200,
                          color: "var(--ink)",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.35,
                          margin: 0,
                        }}
                      >
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ));
        })()}
      </div>
    </section>
  );
}
