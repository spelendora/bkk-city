import { Article, getAllArticles } from "./data";
import { slugify } from "./slugify";

/**
 * Get prev/next articles within the same category,
 * sorted by priority desc then slug alphabetically.
 * Returns { prev, next } relative to the given article.
 */
export function getPrevNextArticles(article: Article): {
  prev: Article | null;
  next: Article | null;
} {
  const siblings = getAllArticles()
    .filter((a) => a.category_id === article.category_id)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.slug.localeCompare(b.slug);
    });

  const idx = siblings.findIndex((a) => a.slug === article.slug);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx < siblings.length - 1 ? siblings[idx + 1] : null,
  };
}

/**
 * Find up to `limit` related articles by keyword overlap.
 * Falls back to top-priority articles in the same category.
 */
export function getRelatedArticles(
  article: Article,
  limit = 3
): Article[] {
  const allArticles = getAllArticles().filter(
    (a) => a.slug !== article.slug
  );
  const kwSet = new Set(
    article.keywords
      .filter((k): k is string => typeof k === "string")
      .map((k) => k.toLowerCase())
  );

  if (kwSet.size > 0) {
    // Score by keyword intersection
    const scored = allArticles
      .map((a) => {
        const overlap = a.keywords
          .filter((k): k is string => typeof k === "string")
          .filter((k) => kwSet.has(k.toLowerCase())).length;
        return { article: a, score: overlap };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.article.priority - a.article.priority;
      });

    if (scored.length >= limit) {
      return scored.slice(0, limit).map((x) => x.article);
    }

    // Top keyword results + fill with same-category by priority
    const keywordResults = scored.map((x) => x.article);
    const slugsUsed = new Set(keywordResults.map((a) => a.slug));

    const fallback = allArticles
      .filter(
        (a) =>
          a.category_id === article.category_id && !slugsUsed.has(a.slug)
      )
      .sort((a, b) => b.priority - a.priority);

    return [...keywordResults, ...fallback].slice(0, limit);
  }

  // No keywords — return top articles in same category
  return allArticles
    .filter((a) => a.category_id === article.category_id)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/**
 * Parse h2 headings from markdown for the TOC.
 * Returns array of { text, anchor }.
 */
export function parseH2Headings(
  bodyMarkdown: string
): { text: string; anchor: string }[] {
  const headingRegex = /^## +(.+)$/gm;
  const headings: { text: string; anchor: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(bodyMarkdown)) !== null) {
    const text = match[1].trim();
    if (!text) continue;
    const anchor = slugify(text);
    headings.push({ text, anchor });
  }

  return headings;
}
