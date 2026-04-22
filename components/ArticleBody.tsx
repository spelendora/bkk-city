"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React from "react";
import { GLOSSARY } from "@/lib/glossary";
import { LOCATIONS } from "@/lib/locations";
import type { LocationEntry } from "@/lib/locations";
import type { Components } from "react-markdown";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import LocationTooltip from "@/components/LocationTooltip";
import CopyHeading from "@/components/CopyHeading";
import { slugify } from "@/lib/slugify";

function childrenToText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (React.isValidElement(children)) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return childrenToText(el.props.children);
  }
  return "";
}

// ---------------------------------------------------------------
// Build a flat list of term patterns (sorted longest first)
// ---------------------------------------------------------------
interface TermPattern {
  regex: RegExp;
  short: string;
  term: string;
}

function buildPatterns(): TermPattern[] {
  const patterns: TermPattern[] = [];
  for (const entry of GLOSSARY) {
    const allForms = [entry.term, ...(entry.aliases ?? [])];
    for (const form of allForms) {
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(?<![\\wа-яёА-ЯЁ])(${escaped})(?![\\wа-яёА-ЯЁ])`,
        "iu"
      );
      patterns.push({ regex: pattern, short: entry.short, term: entry.term });
    }
  }
  patterns.sort((a, b) => b.term.length - a.term.length);
  return patterns;
}

const TERM_PATTERNS = buildPatterns();

// ---------------------------------------------------------------
// Location patterns (sorted longest term first to avoid partial matches)
// ---------------------------------------------------------------
interface LocationPattern {
  regex: RegExp;
  entry: LocationEntry;
  matchKey: string; // canonical used for seen-set deduplication
}

function buildLocationPatterns(): LocationPattern[] {
  const patterns: LocationPattern[] = [];
  for (const entry of LOCATIONS) {
    const allForms = [entry.term, ...(entry.aliases ?? [])];
    for (const form of allForms) {
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(?<![\\wа-яёА-ЯЁ])(${escaped})(?![\\wа-яёА-ЯЁ])`,
        "iu"
      );
      patterns.push({ regex: pattern, entry, matchKey: entry.canonical });
    }
  }
  // Sort longest term first so "SuperRich 1965" wins over "SuperRich"
  patterns.sort((a, b) => b.entry.term.length - a.entry.term.length);
  return patterns;
}

const LOCATION_PATTERNS = buildLocationPatterns();

/**
 * Takes a plain string and returns React nodes wrapping:
 *   - FIRST occurrence per article of each glossary term  (glossarySeen — article-level)
 *   - FIRST occurrence per paragraph of each location term (locSeen — paragraph-level,
 *     reset by the caller for every <p> / <li> / <blockquote> invocation)
 *
 * Glossary terms are processed first; when two candidates start at the same
 * position, glossary wins.
 */
function wrapTermsInText(
  text: string,
  glossarySeen: Set<string>,
  locSeen: Set<string>
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // --- Find earliest glossary match ---
    let earliestIndex = -1;
    let earliestPattern: TermPattern | null = null;
    let earliestMatch: RegExpExecArray | null = null;

    for (const p of TERM_PATTERNS) {
      if (glossarySeen.has(p.term)) continue;
      const globalRe = new RegExp(p.regex.source, "giu");
      const match = globalRe.exec(remaining);
      if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
        earliestIndex = match.index;
        earliestPattern = p;
        earliestMatch = match;
      }
    }

    // --- Find earliest location match (paragraph-level dedup via locSeen) ---
    let earliestLocIndex = -1;
    let earliestLocPattern: LocationPattern | null = null;
    let earliestLocMatch: RegExpExecArray | null = null;

    for (const p of LOCATION_PATTERNS) {
      if (locSeen.has(p.matchKey)) continue;
      const globalRe = new RegExp(p.regex.source, "giu");
      const match = globalRe.exec(remaining);
      if (match && (earliestLocIndex === -1 || match.index < earliestLocIndex)) {
        earliestLocIndex = match.index;
        earliestLocPattern = p;
        earliestLocMatch = match;
      }
    }

    // --- Decide which wins (glossary first on tie) ---
    const hasGloss = earliestMatch !== null && earliestPattern !== null && earliestIndex !== -1;
    const hasLoc = earliestLocMatch !== null && earliestLocPattern !== null && earliestLocIndex !== -1;

    if (!hasGloss && !hasLoc) {
      nodes.push(remaining);
      break;
    }

    // Pick glossary if: it exists AND (no loc, OR gloss starts earlier, OR tie)
    const useGloss =
      hasGloss && (!hasLoc || earliestIndex <= earliestLocIndex);

    if (useGloss && earliestMatch && earliestPattern) {
      if (earliestIndex > 0) nodes.push(remaining.slice(0, earliestIndex));
      const matchedText = earliestMatch[0];
      glossarySeen.add(earliestPattern.term);
      nodes.push(
        <GlossaryTooltip key={key++} term={matchedText} hint={earliestPattern.short}>
          {matchedText}
        </GlossaryTooltip>
      );
      remaining = remaining.slice(earliestIndex + matchedText.length);
    } else if (!useGloss && earliestLocMatch && earliestLocPattern) {
      if (earliestLocIndex > 0) nodes.push(remaining.slice(0, earliestLocIndex));
      const matchedText = earliestLocMatch[0];
      locSeen.add(earliestLocPattern.matchKey);
      nodes.push(
        <LocationTooltip key={key++} location={earliestLocPattern.entry}>
          {matchedText}
        </LocationTooltip>
      );
      remaining = remaining.slice(earliestLocIndex + matchedText.length);
    } else {
      // Fallback: nothing matched, push rest
      nodes.push(remaining);
      break;
    }
  }

  return nodes;
}

/**
 * Recursively process React children, wrapping glossary/location terms in text nodes.
 * Skips content inside <code> and <pre>.
 *
 * @param glossarySeen - article-level dedup set for glossary terms
 * @param locSeen      - paragraph-level dedup set for location terms (reset per block)
 */
function processNode(
  node: React.ReactNode,
  glossarySeen: Set<string>,
  locSeen: Set<string>,
  inCode: boolean
): React.ReactNode {
  if (typeof node === "string") {
    if (inCode) return node;
    const wrapped = wrapTermsInText(node, glossarySeen, locSeen);
    if (wrapped.length === 1 && typeof wrapped[0] === "string") return node;
    return <>{wrapped}</>;
  }

  if (!React.isValidElement(node)) return node;

  const el = node as React.ReactElement<{
    children?: React.ReactNode;
    [key: string]: unknown;
  }>;
  const tagName = typeof el.type === "string" ? el.type : null;
  const nowInCode = inCode || tagName === "code" || tagName === "pre";

  const rawChildren = el.props.children;
  if (rawChildren == null) return node;

  const processed = React.Children.map(rawChildren, (child) =>
    processNode(child, glossarySeen, locSeen, nowInCode)
  );

  return React.cloneElement(el, {}, processed);
}

// ---------------------------------------------------------------
// Custom react-markdown component overrides
// ---------------------------------------------------------------

/**
 * Build components object that injects glossary/location wrapping into
 * text-bearing block elements.
 *
 * - Glossary:  first-occurrence per article (glossarySeen persists across blocks)
 * - Locations: first-occurrence per paragraph/li/blockquote (locSeen is
 *   freshly created for each block invocation, allowing every paragraph to
 *   wrap its own first mention of a location)
 */
function makeComponents(glossarySeen: Set<string>): Components {
  // Helper: wrap with a fresh paragraph-level locSeen each call
  const wrap = (children: React.ReactNode): React.ReactNode =>
    processNode(children, glossarySeen, new Set<string>(), false);

  return {
    p: ({ children, ...props }) => <p {...props}>{wrap(children)}</p>,
    li: ({ children, ...props }) => <li {...props}>{wrap(children)}</li>,
    blockquote: ({ children, ...props }) => (
      <blockquote {...props}>{wrap(children)}</blockquote>
    ),
    /**
     * Inline link renderer. Hides raw URL text: if the link label equals its
     * href (autolink or `[https://…](https://…)` pattern), substitute a short
     * descriptive token derived from the URL's hostname. If the label is real
     * prose, leave it alone but still normalise display.
     */
    a: ({ children, href, ...props }) => {
      const label = childrenToText(children).trim();
      const rawHref = typeof href === "string" ? href : "";
      const looksLikeUrl = /^https?:\/\//i.test(label) || label === rawHref;
      let displayLabel: React.ReactNode = children;
      if (looksLikeUrl && rawHref) {
        try {
          const u = new URL(rawHref);
          // Strip leading www. + trailing slash; keep hostname + first path segment
          const host = u.hostname.replace(/^www\./, "");
          const firstPath = u.pathname.split("/").filter(Boolean)[0];
          displayLabel = firstPath ? `${host}/${firstPath}` : host;
        } catch {
          displayLabel = label;
        }
      }
      const external = /^https?:\/\//i.test(rawHref);
      return (
        <a
          href={rawHref}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {displayLabel}
        </a>
      );
    },
    // Suppress h1 from markdown — the page already renders article.title as <h1>
    h1: () => null,
    h2: ({ children, ...props }) => {
      const id = slugify(childrenToText(children));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { node: _node, ...rest } = props as typeof props & { node?: unknown };
      return (
        <CopyHeading id={id} tag="h2" {...rest}>
          {wrap(children)}
        </CopyHeading>
      );
    },
    h3: ({ children, ...props }) => {
      const id = slugify(childrenToText(children));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { node: _node, ...rest } = props as typeof props & { node?: unknown };
      return (
        <CopyHeading id={id} tag="h3" {...rest}>
          {wrap(children)}
        </CopyHeading>
      );
    },
    h4: ({ children, ...props }) => <h4 {...props}>{wrap(children)}</h4>,
    td: ({ children, ...props }) => <td {...props}>{wrap(children)}</td>,
    // Wrap tables in a scrollable container so they don't break layout on narrow viewports
    table: ({ children, ...props }) => (
      <div className="table-scroll">
        <table {...props}>{children}</table>
      </div>
    ),
  };
}

// ---------------------------------------------------------------
// Markdown pre-processing helpers
// ---------------------------------------------------------------

/**
 * Strip the leading H1 title + byline blockquote that the mock generator
 * embeds at the top of every article body. The page component renders the
 * <h1> and meta strip already, so this avoids duplication.
 *
 * Pattern:  # Title\n\n> **Категория:** …\n>\n> Основано на …\n\n
 */
function stripLeadingByline(md: string): string {
  return md.replace(
    /^# [^\n]+\n\n> \*\*Категория:\*\*[\s\S]*?\n\n/,
    ""
  );
}

/**
 * Strip the TL;DR section from the body markdown. The page component now
 * renders TL;DR above-the-fold, so it must not appear again in the body.
 * Removes everything from "## TL;DR\n" up to (not including) the next h2.
 */
function stripTldr(md: string): string {
  // Consume optional blank line(s) after the heading and match until the next
  // top-level section. The `$(?![\r\n])` negative lookahead pins the
  // end-of-string alternative to actual EOS (not EOL under /m flag), so the
  // lazy group can't short-circuit on the empty line right after the heading
  // and leave TL;DR bullets behind in the body.
  return md.replace(
    /^## TL;DR\s*\n+[\s\S]*?(?=\n## |\n# |$(?![\r\n]))/m,
    ""
  );
}

/**
 * Remove inline "**Источник:** N, N, N" attribution lines from Q&A blocks.
 */
function stripSourceLines(md: string): string {
  return md.replace(/\n\*\*Источник:\*\*[^\n]+/g, "");
}

/**
 * Strip "**Актуально на:** YYYY" lines from Q&A blocks (Issue 3).
 * These are no longer surfaced in the rendered body — the article meta strip
 * (generated date) already conveys freshness to the reader.
 */
function stripActualnoNa(md: string): string {
  return md.replace(/^\s*\*\*Актуально на:\*\*\s*\d{4}\s*$/gm, "");
}

/**
 * Remove the "## Исходные обсуждения" section entirely — source threads
 * are now an editorial-internal artefact and should not ship to readers.
 */
function stripSourcesTable(md: string): string {
  return md.replace(
    /## Исходные обсуждения\n[\s\S]*?(?=\n<details class="web-check">|$)/,
    ""
  );
}

/**
 * Convert GFM-style callout markers inside blockquotes to raw HTML blockquotes
 * with a `callout callout--X` class so CSS can style them distinctly.
 *
 * Supported markers (case-insensitive): TIP, WARN, WARNING, NOTE, IMPORTANT.
 * Syntax (first line of the blockquote):
 *   > [!TIP]
 *   > Тело совета.
 */
function transformCallouts(md: string): string {
  const LABELS: Record<string, { cls: string; label: string }> = {
    tip: { cls: "tip", label: "Совет" },
    warn: { cls: "warn", label: "Внимание" },
    warning: { cls: "warn", label: "Внимание" },
    note: { cls: "note", label: "Заметка" },
    important: { cls: "important", label: "Важно" },
  };
  // Match a blockquote whose FIRST line is "> [!KIND]" — capture the rest of
  // the blockquote (contiguous "> ..." or "> " lines).
  const re = /(^|\n)> \[!(\w+)\][^\n]*((?:\n> [^\n]*)*)/g;
  return md.replace(re, (full, prefix: string, rawKind: string, body: string) => {
    const kind = rawKind.toLowerCase();
    const meta = LABELS[kind];
    if (!meta) return full;
    // Strip leading "> " from each body line so the inner markdown renders.
    const inner = body.replace(/\n> ?/g, "\n").trim();
    return (
      `${prefix}<blockquote class="callout callout--${meta.cls}" data-callout-label="${meta.label}">\n\n` +
      `${inner}\n\n` +
      `</blockquote>`
    );
  });
}

/** Apply all pre-processing transforms in document order. */
function preprocessMarkdown(md: string): string {
  let out = md;
  out = stripLeadingByline(out);
  out = stripTldr(out);
  out = stripSourceLines(out);
  out = stripActualnoNa(out);
  out = transformCallouts(out);
  out = stripSourcesTable(out);
  return out;
}

// ---------------------------------------------------------------
// The exported component
// ---------------------------------------------------------------

interface ArticleBodyProps {
  markdown: string;
}

export default function ArticleBody({ markdown }: ArticleBodyProps) {
  const processed = preprocessMarkdown(markdown);

  // glossarySeen: article-level, first occurrence per glossary term only
  // locSeen: paragraph-level, created fresh per block in makeComponents
  const glossarySeen = new Set<string>();
  const components = makeComponents(glossarySeen);

  return (
    <div
      className="prose-wallpaper"
      style={{ marginBottom: "5rem" }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}
