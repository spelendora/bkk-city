import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import FaqCategoryAccordion from "@/components/FaqCategoryAccordion";
import SiteFooter from "@/components/SiteFooter";
import JsonLd, {
  buildGraph,
  buildCollectionPageSchema,
  buildBreadcrumbList,
} from "@/components/JsonLd";
import { getAllCategories, getSiteData } from "@/lib/data";

const FAQ_TITLE = "FAQ — все статьи по категориям";
const FAQ_DESCRIPTION =
  "Все статьи FAQ Bangkok по категориям: визы, жильё, транспорт, деньги, связь, еда, медицина. Находите ответ за пару кликов.";

export const metadata: Metadata = {
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  alternates: {
    canonical: "https://bkk.city/faq",
  },
  openGraph: {
    title: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    url: "https://bkk.city/faq",
    siteName: "FAQ Bangkok",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
  },
};

export default function FaqPage() {
  const categories = getAllCategories();
  const site = getSiteData();

  // JSON-LD — CollectionPage listing the category hubs, plus breadcrumb.
  // Each category becomes a WebPage part (categories aren't "Article" —
  // they're hub pages that group articles).
  const collectionSchema = buildCollectionPageSchema({
    url: "/faq",
    name: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    partType: "WebPage",
    items: categories.map((cat) => ({
      name: cat.title_ru,
      url: `/faq/${cat.id}`,
      description: cat.description_ru,
    })),
  });

  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Главная", url: "/" },
    { name: "FAQ" },
  ]);

  const graph = buildGraph([collectionSchema, breadcrumbSchema]);

  return (
    <>
      <JsonLd data={graph} />
      <Masthead />
      <CommandPalette />
      <KeyboardShortcuts />

      <main
        style={{
          paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
          paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
        }}
      >
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "FAQ" }]}
        />

        {/* Page header */}
        <div
          style={{
            paddingTop: "clamp(1rem, 3vw, 2rem)",
            paddingBottom: "2rem",
            maxWidth: "640px",
          }}
        >
          <h1
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 200,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              marginBottom: "1rem",
            }}
          >
            FAQ
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 300,
              color: "var(--stone)",
              lineHeight: 1.7,
              marginBottom: 0,
            }}
          >
            {site.subtitle}
          </p>
        </div>

        {/* Categories — collapsed by default, expandable inline */}
        <div style={{ marginBottom: "4rem" }}>
          {categories.map((cat, catIndex) => (
            <FaqCategoryAccordion
              key={cat.id}
              category={cat}
              index={catIndex}
            />
          ))}
          <div style={{ borderTop: "0.5px solid var(--rule)" }} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
