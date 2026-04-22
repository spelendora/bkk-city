/**
 * Unified slug helper — used by ArticleBody, ArticleSideTOC, and navigation.ts.
 *
 * Preserves Cyrillic and Latin letters so Russian h2/h3 headings get
 * non-empty ids that match the TOC anchors.
 *
 * Algorithm:
 *   1. Lowercase the text
 *   2. Replace any run of characters that are NOT Unicode letters/digits
 *      or hyphens with a single hyphen (regex \p{L}\p{N} covers Cyrillic)
 *   3. Strip leading/trailing hyphens
 *
 * Examples:
 *   "TL;DR"                          → "tldr"
 *   "Вопросы и ответы"               → "вопросы-и-ответы"
 *   "Where to buy a SIM?"            → "where-to-buy-a-sim"
 *   "Café & bars — top 5"            → "café-bars-top-5"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
