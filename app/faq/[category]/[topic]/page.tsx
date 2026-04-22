import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import ArticleBody from "@/components/ArticleBody";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleSideTOC from "@/components/ArticleSideTOC";
import ArticleInlineTOC from "@/components/ArticleInlineTOC";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { isTopArticle } from "@/lib/top10";
import JsonLd, {
  parseFaqEntries,
  buildGraph,
  buildArticleSchema,
  buildFAQPageSchema,
  buildBreadcrumbList,
} from "@/components/JsonLd";
import PlacesInArticle from "@/components/PlacesInArticle";
import { getAllArticles, getArticleBySlug } from "@/lib/data";
import type { Article } from "@/lib/data";
import {
  getPrevNextArticles,
  getRelatedArticles,
} from "@/lib/navigation";

// ---------------------------------------------------------------------------
// Inline markdown renderer — converts **bold** and *italic* in plain strings
// into React elements. Used for TL;DR bullet text which comes from raw markdown.
// ---------------------------------------------------------------------------

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Order matters: links first (so bold/italic inside labels is ignored),
  // then bold, then italic, then inline code.
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      const label = match[1];
      const url = match[2];
      const external = /^https?:\/\//.test(url);
      parts.push(
        <a
          key={key++}
          href={url}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            borderBottom: "0.5px solid var(--accent)",
          }}
        >
          {label}
        </a>
      );
    } else if (match[3] !== undefined) {
      parts.push(<strong key={key++} style={{ fontWeight: 400 }}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      parts.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5] !== undefined) {
      parts.push(
        <code
          key={key++}
          style={{
            fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            fontSize: "0.9em",
            padding: "0.1em 0.35em",
            background: "var(--code-bg)",
            borderRadius: "3px",
          }}
        >
          {match[5]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    category: article.category_id,
    topic: article.slug,
  }));
}

interface Props {
  params: Promise<{ category: string; topic: string }>;
}

// ---------------------------------------------------------------------------
// Helpers — SEO description from TL;DR (kept for generateMetadata)
// ---------------------------------------------------------------------------

/** Extract first 160 chars of the TL;DR section, stripped of markdown. */
function extractTldrDescription(
  markdown: string,
  fallbackTitle: string,
  categoryTitle: string
): string {
  const tldrMatch = markdown.match(
    /^## TL;DR\s*\n+([\s\S]*?)(?=\n## |\n# |$(?![\r\n]))/m
  );
  if (tldrMatch) {
    const raw = tldrMatch[1]
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/^[-*>\s]+/gm, " ")
      .replace(/[*_`#|]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (raw.length > 10) {
      return raw.slice(0, 157).replace(/[,\s]+$/, "") + (raw.length > 157 ? "…" : "");
    }
  }
  const fallback = `${categoryTitle} · ${fallbackTitle}. На основе @bkk_chat.`;
  return fallback.slice(0, 160);
}

/**
 * Extract TL;DR bullet strings from body markdown for above-the-fold rendering.
 * Returns an empty array when the section is absent.
 */
function extractTldrBullets(markdown: string): string[] {
  // Consume optional blank line after the heading so bullets aren't lost to
  // a zero-width match at EOL. The `$(?![\r\n])` negative lookahead pins the
  // end-of-string alternative to actual EOS (not EOL under /m flag), so the
  // lazy group can't short-circuit on an empty line right after the heading.
  const match = markdown.match(
    /^## TL;DR\s*\n+([\s\S]*?)(?=\n## |\n# |$(?![\r\n]))/m
  );
  if (!match) return [];
  return match[1]
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, topic } = await params;
  const article = getArticleBySlug(topic);
  if (!article) return {};

  const description = extractTldrDescription(
    article.body_markdown,
    article.title,
    article.category_title
  );
  const canonical = `https://bkk.city/faq/${category}/${topic}`;
  const isInternal = category.startsWith("_");

  // Root template in app/layout.tsx appends "— FAQ Bangkok" to `title`. For
  // OG/Twitter we pass the full, flattened title since those consumers don't
  // apply the template.
  const fullTitle = `${article.title} — FAQ Bangkok`;

  return {
    title: article.title,
    description,
    keywords: article.keywords,
    robots: isInternal ? { index: false, follow: false } : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      publishedTime: article.generated,
      modifiedTime: article.generated,
      url: canonical,
      siteName: "FAQ Bangkok",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Humanised label helpers
// ---------------------------------------------------------------------------

/** Format ISO datetime to Russian month + year, e.g. "апрель 2026". */
function formatDateRu(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Strip markdown syntax and count words. */
function countWords(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

// ---------------------------------------------------------------------------
// "Читайте дальше" — merged next article + related links
// ---------------------------------------------------------------------------

interface ReadMoreItem {
  slug: string;
  category_id: string;
  title: string;
  category_title: string;
  isNext?: boolean;
}

function buildReadMore(
  next: Article | null,
  related: Article[]
): ReadMoreItem[] {
  const items: ReadMoreItem[] = [];
  if (next) {
    items.push({
      slug: next.slug,
      category_id: next.category_id,
      title: next.title,
      category_title: next.category_title,
      isNext: true,
    });
  }
  for (const r of related) {
    if (!items.some((i) => i.slug === r.slug)) {
      items.push({
        slug: r.slug,
        category_id: r.category_id,
        title: r.title,
        category_title: r.category_title,
      });
    }
  }
  return items.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Shared inline style atoms
// ---------------------------------------------------------------------------

const META_VALUE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontSize: "0.75rem",
  fontStyle: "italic",
  color: "var(--stone)",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ArticlePage({ params }: Props) {
  const { category, topic } = await params;
  const article = getArticleBySlug(topic);

  if (!article || article.category_id !== category) {
    notFound();
  }

  const tldrBullets = extractTldrBullets(article.body_markdown);

  const { next } = getPrevNextArticles(article);
  const related = getRelatedArticles(article, 3);
  const readMore = buildReadMore(next, related);

  // ---------------------------------------------------------------
  // JSON-LD structured data
  //
  // Strategy:
  //   - Always emit Article + BreadcrumbList.
  //   - Additionally emit FAQPage when the body contains a well-formed
  //     "Вопросы и ответы" section with >= 2 parsed Q&A entries. Google
  //     penalises mismatched/sparse FAQPage markup, so we fall back to
  //     Article-only when parsing yields fewer than 2 entries.
  //   - Everything is wrapped in a single @graph for clean @id resolution.
  // ---------------------------------------------------------------
  const description = extractTldrDescription(
    article.body_markdown,
    article.title,
    article.category_title
  );
  const articleUrl = `/faq/${category}/${topic}`;

  const articleSchema = buildArticleSchema({
    title: article.title,
    description,
    datePublished: article.generated,
    dateModified: article.generated,
    url: articleUrl,
    keywords: article.keywords,
  });

  const faqEntries = parseFaqEntries(article.body_markdown);
  const faqSchema =
    faqEntries.length >= 2
      ? buildFAQPageSchema({
          url: articleUrl,
          title: article.title,
          description,
          entries: faqEntries,
        })
      : null;

  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Главная", url: "/" },
    { name: "FAQ", url: "/faq" },
    { name: article.category_title, url: `/faq/${article.category_id}` },
    { name: article.title },
  ]);

  const jsonLdGraph = buildGraph([
    articleSchema,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
  ]);

  return (
    <>
      {/* JSON-LD structured data — single @graph document */}
      <JsonLd data={jsonLdGraph} />

      {/* Reading progress bar — client component, fixed to top of viewport */}
      <ReadingProgress />

      {/* Global keyboard palette + shortcuts */}
      <CommandPalette />
      <KeyboardShortcuts />

      <Masthead />

      <main
        style={{
          paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
          paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "FAQ", href: "/faq" },
            { label: article.category_title, href: `/faq#${article.category_id}` },
            { label: article.title },
          ]}
        />

        {/*
          Outer flex row:
            col 1 — article body (max 640px)
            col 2 — side TOC rail (200px, hidden below 1280px)
          Left-gutter P{n} marker removed — dev metric, not useful to readers.
        */}
        <div className="article-outer-row">
          {/* Main content */}
          <article style={{ minWidth: 0 }}>

            {/* ── 1. H1 Article title + optional "В TOP" badge ────────── */}
            {isTopArticle(article.slug) && (
              <Link
                href="/top"
                style={{
                  display: "inline-block",
                  marginBottom: "0.75rem",
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5625rem",
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  textDecoration: "none",
                  borderBottom: "0.5px solid var(--accent)",
                  paddingBottom: "1px",
                }}
              >
                В TOP →
              </Link>
            )}
            <h1
              style={{
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "clamp(1.625rem, 3.5vw, 2.5rem)",
                fontWeight: 200,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                lineHeight: 1.15,
                marginBottom: "1.5rem",
              }}
            >
              {article.title}
            </h1>

            {/* ── 2. TL;DR — answer above the fold ────────────────────── */}
            {tldrBullets.length > 0 && (
              <div
                style={{
                  borderLeft: "2px solid var(--accent)",
                  paddingLeft: "1.25rem",
                  marginBottom: "2.5rem",
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
                    color: "var(--accent)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Коротко
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tldrBullets.map((bullet, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.625rem",
                        marginBottom: "0.625rem",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--accent)",
                          flexShrink: 0,
                          fontSize: "0.625rem",
                          lineHeight: "1.75",
                          userSelect: "none",
                        }}
                        aria-hidden="true"
                      >
                        —
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "var(--font-inter), 'Inter', sans-serif",
                          fontSize: "0.9375rem",
                          fontWeight: 300,
                          color: "var(--ink)",
                          lineHeight: 1.6,
                        }}
                      >
                        {renderInlineMarkdown(bullet)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mobile + tablet inline TOC — hidden at ≥1280px where the
                sticky side rail takes over. Renders directly under TL;DR
                (or right after the h1 when TL;DR is absent). */}
            <ArticleInlineTOC markdown={article.body_markdown} />

            {/* Article body — audience/keywords now live in <meta> tags
                via generateMetadata, no longer rendered visibly. */}
            <ArticleBody markdown={article.body_markdown} />

            {/* ── 6. Места в статье — unique locations mentioned in body ─ */}
            <PlacesInArticle markdown={article.body_markdown} />

            {/* ── 7. "Читайте дальше" — next + related merged ─────────── */}
            {readMore.length > 0 && (
              <nav
                aria-label="Читайте дальше"
                style={{ marginTop: "3rem" }}
              >
                <div
                  style={{
                    borderTop: "0.5px solid var(--rule)",
                    paddingTop: "1.25rem",
                    marginBottom: "1rem",
                    fontFamily:
                      "var(--font-inter-tight), 'Inter Tight', sans-serif",
                    fontSize: "0.4375rem",
                    fontWeight: 300,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                  }}
                >
                  Читайте дальше
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {readMore.map((item) => (
                    <li
                      key={item.slug}
                      style={{ borderTop: "0.5px solid var(--rule)" }}
                    >
                      <Link
                        href={`/faq/${item.category_id}/${item.slug}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <div
                          style={{
                            paddingTop: "0.875rem",
                            paddingBottom: "0.875rem",
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            {item.isNext && (
                              <div
                                style={{
                                  fontFamily:
                                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                                  fontSize: "0.4375rem",
                                  fontWeight: 300,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: "var(--stone)",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                Следующая
                              </div>
                            )}
                            <div
                              style={{
                                fontFamily:
                                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: 200,
                                letterSpacing: "-0.01em",
                                color: "var(--ink)",
                                lineHeight: 1.35,
                                marginBottom: "0.25rem",
                              }}
                            >
                              {item.title}
                            </div>
                            <div style={META_VALUE_STYLE}>
                              {item.category_title}
                            </div>
                          </div>
                          <span
                            style={{
                              fontFamily:
                                "var(--font-inter-tight), 'Inter Tight', sans-serif",
                              fontSize: "0.5rem",
                              fontWeight: 300,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "var(--accent)",
                              flexShrink: 0,
                            }}
                          >
                            →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li style={{ borderTop: "0.5px solid var(--rule)" }} />
                </ul>
              </nav>
            )}

            {/* Back to all articles */}
            <div
              style={{
                paddingTop: "1.5rem",
                paddingBottom: "3rem",
              }}
            >
              <Link
                href="/faq"
                style={{
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5625rem",
                  fontWeight: 300,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  textDecoration: "none",
                  borderBottom: "0.5px solid var(--accent)",
                  paddingBottom: "1px",
                }}
              >
                Все статьи
              </Link>
            </div>
          </article>

          {/* Right-rail sticky TOC — hidden below 1280px via CSS class */}
          <div className="article-side-toc-rail">
            <ArticleSideTOC markdown={article.body_markdown} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
