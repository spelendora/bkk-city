import Link from "next/link";
import { slugify } from "@/lib/slugify";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Parse h2 / h3 headings from raw markdown. Returns entries in document order.
 * Mirrors the parser in ArticleSideTOC so both TOCs surface the same anchors.
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

interface ArticleInlineTOCProps {
  markdown: string;
}

/**
 * ArticleInlineTOC — mobile + tablet inline table of contents.
 *
 * Renders as a collapsed <details> so it doesn't push article content too far
 * below the fold. Hidden at ≥1280px via CSS because the sticky ArticleSideTOC
 * rail takes over there.
 *
 * This is a server component (no state) — anchor navigation works natively
 * via fragment links; the server renders the same HTML the client would.
 */
export default function ArticleInlineTOC({ markdown }: ArticleInlineTOCProps) {
  const entries = parseTocFromMarkdown(markdown);
  if (entries.length < 2) return null;

  return (
    <details className="article-inline-toc">
      <summary>Содержание</summary>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id} data-level={entry.level}>
            <Link href={`#${entry.id}`}>{entry.text}</Link>
          </li>
        ))}
      </ol>
    </details>
  );
}
