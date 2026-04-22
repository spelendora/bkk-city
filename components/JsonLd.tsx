/**
 * JsonLd — injects one or more JSON-LD objects as <script type="application/ld+json">.
 * Server component (no "use client" needed — script tags are safe in RSC).
 *
 * Usage patterns:
 *   1. Single schema:  <JsonLd data={schema} />
 *   2. Multiple flat:  <JsonLd data={[a, b, c]} />
 *   3. @graph wrap:    <JsonLd data={buildGraph([a, b, c])} />
 *
 * The builder helpers below return plain objects and never serialize to JSON
 * themselves — serialization happens in the component via JSON.stringify so
 * any builder consumer can compose them freely.
 */

const SITE_URL = "https://bkk.city";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  /** Absolute or site-relative path (e.g. "/faq" or "https://bkk.city/faq").
   *  Omit `url` for the current page (last crumb). */
  url?: string;
}

export interface CollectionPageItem {
  name: string;
  url: string;
  description?: string;
}

// ---------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------

/** Ensure an absolute https://bkk.city URL. */
function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Wrap an array of schemas in a single @graph document. */
export function buildGraph(
  nodes: Record<string, unknown>[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

// ---------------------------------------------------------------
// Parse h3 headings from the "Вопросы и ответы" section as FAQ entries.
// Strips any "**Актуально на:** YYYY" trailer and other markdown noise so
// Google's FAQ rich-result parser sees clean Q&A text.
// Returns [] if the section is missing or every entry is too short to be
// meaningful — callers then fall back to Article schema.
// ---------------------------------------------------------------

export function parseFaqEntries(bodyMarkdown: string): FaqEntry[] {
  const sectionMatch = bodyMarkdown.match(
    /^## Вопросы и ответы[ \t]*\n([\s\S]*?)(?=^## |^# )/m
  );
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const entries: FaqEntry[] = [];

  const parts = section.split(/^### /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const lines = part.split("\n");
    const question = lines[0].trim();
    if (!question) continue;

    const answerLines = lines.slice(1).join("\n").trim();
    const answer = answerLines
      // Drop "Актуально на: YYYY" timestamps that Google would flag as noise.
      .replace(/\*\*Актуально на:\*\*[^\n]*/gi, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/^[-*>]+\s*/gm, "")
      .replace(/[*_`#|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

    if (question && answer) {
      entries.push({ question, answer });
    }
  }

  return entries;
}

// ---------------------------------------------------------------
// Builder: WebSite (landing page)
// Includes SearchAction pointing at the client-side CommandPalette via ?q=.
// ---------------------------------------------------------------

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: "FAQ Bangkok",
    description:
      "Архив знаний о Бангкоке — визы, жильё, транспорт. На основе @bkk_chat.",
    inLanguage: "ru-RU",
    publisher: { "@id": `${SITE_URL}/#publisher` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------
// Builder: Publisher (Person — solo author)
// Swap for an Organization block if the project later moves to a team model.
// ---------------------------------------------------------------

export function buildPublisherSchema(): Record<string, unknown> {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#publisher`,
    name: "Valeriy Grachev",
    url: `${SITE_URL}/`,
  };
}

// ---------------------------------------------------------------
// Builder: BreadcrumbList
// Last item MUST omit `url` (it's the current page).
// ---------------------------------------------------------------

export function buildBreadcrumbList(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const node: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
      };
      if (item.url) node.item = absUrl(item.url);
      return node;
    }),
  };
}

// ---------------------------------------------------------------
// Builder: Article (fallback when FAQPage parsing is unreliable)
// ---------------------------------------------------------------

export interface ArticleSchemaInput {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  keywords?: string[];
}

export function buildArticleSchema(
  input: ArticleSchemaInput
): Record<string, unknown> {
  const url = absUrl(input.url);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: "ru-RU",
    author: { "@id": `${SITE_URL}/#publisher` },
    publisher: { "@id": `${SITE_URL}/#publisher` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(input.keywords && input.keywords.length > 0
      ? { keywords: input.keywords.join(", ") }
      : {}),
  };
}

// ---------------------------------------------------------------
// Builder: FAQPage — preferred for Q&A-heavy articles.
// Returns null if entries are empty (caller falls back to Article).
// ---------------------------------------------------------------

export interface FaqPageSchemaInput {
  url: string;
  title: string;
  description: string;
  entries: FaqEntry[];
}

export function buildFAQPageSchema(
  input: FaqPageSchemaInput
): Record<string, unknown> | null {
  if (!input.entries || input.entries.length === 0) return null;
  const url = absUrl(input.url);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faqpage`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: "ru-RU",
    mainEntity: input.entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------
// Builder: CollectionPage (FAQ index, category hub, persona page)
// ---------------------------------------------------------------

export interface CollectionPageSchemaInput {
  url: string;
  name: string;
  description: string;
  items: CollectionPageItem[];
  /** Schema.org @type to use for each `hasPart` entry. Defaults to "Article". */
  partType?: "Article" | "WebPage" | "CreativeWork";
}

export function buildCollectionPageSchema(
  input: CollectionPageSchemaInput
): Record<string, unknown> {
  const url = absUrl(input.url);
  const partType = input.partType ?? "Article";
  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    hasPart: input.items.map((item) => ({
      "@type": partType,
      name: item.name,
      url: absUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

// ---------------------------------------------------------------
// Builder: ItemList (used on /top for the 6 curated picks)
// ---------------------------------------------------------------

export interface ItemListEntry {
  name: string;
  url: string;
}

export function buildItemListSchema(
  items: ItemListEntry[],
  listName: string
): Record<string, unknown> {
  return {
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absUrl(item.url),
    })),
  };
}
