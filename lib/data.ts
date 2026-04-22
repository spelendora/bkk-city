import rawData from "../mock-data.json";

export type Audience = "tourist" | "expat" | "both";
export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Article {
  slug: string;
  title: string;
  title_en: string;
  category_id: string;
  category_title: string;
  audience: Audience;
  priority: Priority;
  source_threads: number;
  sampled_questions: number;
  total_matches: number;
  date_range: string;
  years_covered: number[];
  keep_score_avg: number;
  generated: string;
  chat: string;
  keywords: string[];
  body_markdown: string;
}

export interface Category {
  id: string;
  title_ru: string;
  title_en: string;
  description_ru: string;
  articles: Article[];
}

export interface CheatsheetItem {
  rank: number;
  question: string;
  body_markdown: string;
}

export interface SiteData {
  title: string;
  subtitle: string;
  based_on_chat: string;
  total_articles_in_full_faq: number;
  source_threads_total: number;
  date_range: string;
  generated: string;
}

const data = rawData as {
  site: SiteData;
  categories: Category[];
  articles: Article[];
  top_cheatsheet: CheatsheetItem[];
  stats: Record<string, unknown>;
};

export function getSiteData(): SiteData {
  return data.site;
}

export function getAllCategories(): Category[] {
  // Filter out internal/test categories (id starts with '_') from the public index
  return data.categories.filter((c) => !c.id.startsWith("_"));
}

export function getAllArticles(): Article[] {
  // Match getAllCategories: hide internal/test articles from the public index.
  // Articles whose category starts with "_" (e.g. _test) are not part of the
  // published FAQ. Direct access via slug is still allowed via the test route.
  return data.articles.filter((a) => !a.category_id.startsWith("_"));
}

export function getArticleBySlug(slug: string): Article | undefined {
  // No filter — direct URLs for test articles still work for internal use.
  return data.articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categoryId: string): Article[] {
  return data.articles.filter((a) => a.category_id === categoryId);
}

export function getTopCheatsheet(): CheatsheetItem[] {
  return data.top_cheatsheet;
}

export function getCategoryById(id: string): Category | undefined {
  return data.categories.find((c) => c.id === id);
}
