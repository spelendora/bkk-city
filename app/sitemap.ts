import type { MetadataRoute } from "next";
import { getAllArticles, getAllCategories } from "@/lib/data";
import { PERSONAS } from "@/lib/personas";

export const dynamic = "force-static";

const BASE = "https://bkk.city";

// Helper: latest "generated" timestamp from a list of articles. We use this
// (instead of `new Date()` at build time) so sitemap lastmod only moves when
// actual content changes — search engines use lastmod as a freshness signal
// and a stable value avoids "everything updated on every deploy" noise.
function latestArticleDate(articles: { generated: string }[]): Date {
  let max = 0;
  for (const a of articles) {
    const t = Date.parse(a.generated);
    if (!Number.isNaN(t) && t > max) max = t;
  }
  return max > 0 ? new Date(max) : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const categories = getAllCategories();

  // Site-wide latest article date — used for landing/faq/top lastmod so those
  // pages reflect "freshest content anywhere on the site" rather than the
  // build clock.
  const siteLatest = latestArticleDate(articles);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: siteLatest, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/faq`, lastModified: siteLatest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/top`, lastModified: siteLatest, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Category hub pages — one dedicated URL per public category.
  // lastmod = latest generated date among the category's articles, so a
  // category URL only gets a new lastmod when one of its articles actually
  // changes.
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/faq/${cat.id}`,
    lastModified: latestArticleDate(cat.articles),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${BASE}/faq/${art.category_id}/${art.slug}`,
    lastModified: new Date(art.generated),
    changeFrequency: "monthly" as const,
    priority: art.priority === 1 ? 0.9 : art.priority === 2 ? 0.8 : 0.6,
  }));

  // Persona pages are derived from articles — their "freshness" tracks the
  // latest-changed article overall. Priority stays lower (0.6) since they're
  // alternate entry paths, not primary content.
  const personaPages: MetadataRoute.Sitemap = PERSONAS.map((p) => ({
    url: `${BASE}/personas/${p.id}`,
    lastModified: siteLatest,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...personaPages];
}
