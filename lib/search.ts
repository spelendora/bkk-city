import indexData from "../search-index.json";

export type SearchEntryType = "article" | "section";

export interface SearchEntryArticle {
  type: "article";
  title: string;
  category_title: string;
  slug: string;
  category_id: string;
  href: string;
}

export interface SearchEntrySection {
  type: "section";
  section_title: string;
  article_title: string;
  article_slug: string;
  category_id: string;
  href: string;
}

export type SearchEntry = SearchEntryArticle | SearchEntrySection;

/**
 * Returns the pre-built search index.
 *
 * The index is generated at build time by `tg-export/make_search_index.py`,
 * which writes a slim JSON file with ONLY the fields needed for Fuse.js
 * matching + navigation — no body_markdown, no metadata. This keeps the
 * client bundle small (~300kB uncompressed, ~27kB gzipped for ~860 entries)
 * and preserves the shape expected by `CommandPalette`, `LandingSearch`,
 * and `SearchBar`.
 */
export function buildSearchIndex(): SearchEntry[] {
  return indexData as SearchEntry[];
}
