import type { MetadataRoute } from "next";
import { getAllArticles, getAllCategories } from "@/lib/data";
import { PERSONAS } from "@/lib/personas";

export const dynamic = "force-static";

const BASE = "https://bkk.city";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const categories = getAllCategories();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/top`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // Category hub pages — one dedicated URL per public category.
  // Previously these were fragment links to /faq#id; now they resolve to a
  // real page at /faq/<category> with its own metadata and article list.
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/faq/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${BASE}/faq/${art.category_id}/${art.slug}`,
    lastModified: new Date(art.generated),
    changeFrequency: "monthly" as const,
    priority: art.priority === 1 ? 0.9 : art.priority === 2 ? 0.8 : 0.6,
  }));

  const personaPages: MetadataRoute.Sitemap = PERSONAS.map((p) => ({
    url: `${BASE}/personas/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...personaPages];
}
