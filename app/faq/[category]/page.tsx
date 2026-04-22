import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import JsonLd, {
  buildGraph,
  buildCollectionPageSchema,
  buildBreadcrumbList,
} from "@/components/JsonLd";
import { getAllCategories, getCategoryById, getSiteData } from "@/lib/data";

// ---------------------------------------------------------------------------
// Static params — one hub page per public category. Test/internal categories
// (id prefixed with "_") are excluded so they never materialise a URL.
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ category: cat.id }));
}

interface Props {
  params: Promise<{ category: string }>;
}

// ---------------------------------------------------------------------------
// Metadata — Russian title + description for each hub.
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryById(category);
  if (!cat || cat.id.startsWith("_")) return {};

  // Root template in app/layout.tsx appends "— FAQ Bangkok" automatically,
  // so the category title here is the bare Russian category name.
  const title = cat.title_ru;
  const description = cat.description_ru;
  const canonical = `https://bkk.city/faq/${category}`;
  const fullTitle = `${cat.title_ru} — FAQ Bangkok`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: canonical,
      siteName: "FAQ Bangkok",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategoryById(category);

  // 404 on unknown or internal/test categories — keeps them off the public site
  // while still allowing direct article access via /faq/_test/<slug> for QA.
  if (!cat || cat.id.startsWith("_")) {
    notFound();
  }

  const site = getSiteData();

  // JSON-LD — CollectionPage with all articles in the hub + breadcrumb.
  const collectionSchema = buildCollectionPageSchema({
    url: `/faq/${cat.id}`,
    name: `${cat.title_ru} — FAQ Bangkok`,
    description: cat.description_ru,
    partType: "Article",
    items: cat.articles.map((a) => ({
      name: a.title,
      url: `/faq/${a.category_id}/${a.slug}`,
    })),
  });

  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Главная", url: "/" },
    { name: "FAQ", url: "/faq" },
    { name: cat.title_ru },
  ]);

  const graph = buildGraph([collectionSchema, breadcrumbSchema]);

  return (
    <>
      <JsonLd data={graph} />
      <Masthead />
      <CommandPalette />
      <KeyboardShortcuts />

      <main
        data-audience-filter-root
        data-audience-filter="all"
        style={{
          paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
          paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
        }}
      >
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "FAQ", href: "/faq" },
            { label: cat.title_ru },
          ]}
        />

        {/* Page header — mirrors /faq h1 typography so the hub feels like
            a natural narrowing of the index page. */}
        <div
          style={{
            paddingTop: "0.5rem",
            paddingBottom: "3rem",
            maxWidth: "640px",
          }}
        >
          <p
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.4375rem",
              fontWeight: 300,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.75rem",
            }}
          >
            Категория
          </p>
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
            {cat.title_ru}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "0.9375rem",
              fontStyle: "italic",
              color: "var(--stone)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}
          >
            {cat.title_en}
          </p>
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
            {cat.description_ru}
          </p>
        </div>

        {/* Article list — reuses the .faq-article-row class from /faq so the
            row hover + audience filter CSS all apply transparently. We keep
            data-audience on each row even though the filter control is not
            mounted here (future-proof; lets a deep-linked ?audience=tourist
            carry over if we ever add that query-param layer). */}
        <section style={{ marginBottom: "4rem" }}>
          <div
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.4375rem",
              fontWeight: 300,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--stone)",
              marginBottom: "1rem",
            }}
          >
            Статьи · {cat.articles.length}
          </div>
          <div>
            {cat.articles.map((article, artIndex) => (
              <div
                key={article.slug}
                className="faq-article-row"
                data-audience={article.audience}
                style={{
                  borderTop: "0.5px solid var(--rule)",
                }}
              >
                <Link
                  href={`/faq/${article.category_id}/${article.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "clamp(60px, 8vw, 120px) 1fr",
                      gap: "0",
                      paddingTop: "1.25rem",
                      paddingBottom: "1.25rem",
                    }}
                  >
                    {/* Number */}
                    <div
                      style={{
                        fontFamily:
                          "var(--font-inter-tight), 'Inter Tight', sans-serif",
                        fontSize: "0.5625rem",
                        fontWeight: 200,
                        color: "var(--stone)",
                        letterSpacing: "0.08em",
                        paddingTop: "0.2rem",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(artIndex + 1).padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <div>
                      <p
                        style={{
                          fontFamily:
                            "var(--font-inter-tight), 'Inter Tight', sans-serif",
                          fontSize: "0.4375rem",
                          fontWeight: 300,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--accent)",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {cat.title_ru}
                      </p>
                      <h3
                        style={{
                          fontFamily:
                            "var(--font-inter-tight), 'Inter Tight', sans-serif",
                          fontSize: "0.9375rem",
                          fontWeight: 200,
                          color: "var(--ink)",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.35,
                          marginBottom: "0.375rem",
                        }}
                      >
                        {article.title}
                      </h3>
                      <p
                        style={{
                          fontFamily:
                            "var(--font-fraunces), Georgia, serif",
                          fontSize: "0.8125rem",
                          fontStyle: "italic",
                          color: "var(--stone)",
                          lineHeight: 1.5,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {article.title_en}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              "var(--font-inter-tight), 'Inter Tight', sans-serif",
                            fontSize: "0.5rem",
                            fontWeight: 300,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color:
                              article.audience === "tourist"
                                ? "var(--accent)"
                                : "var(--stone)",
                          }}
                        >
                          {article.audience === "tourist"
                            ? "Туристы"
                            : article.audience === "expat"
                            ? "Экспаты"
                            : "Все"}
                        </span>
                        <span
                          style={{
                            color: "var(--rule)",
                            fontSize: "0.4rem",
                          }}
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span
                          style={{
                            fontFamily:
                              "ui-monospace, 'SF Mono', Menlo, monospace",
                            fontSize: "0.5rem",
                            color: "var(--stone)",
                            letterSpacing: "0.04em",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {article.source_threads}&thinsp;тредов
                        </span>
                        <span
                          style={{
                            color: "var(--rule)",
                            fontSize: "0.4rem",
                          }}
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span
                          style={{
                            fontFamily:
                              "ui-monospace, 'SF Mono', Menlo, monospace",
                            fontSize: "0.5rem",
                            color: "var(--stone)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          P{article.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div style={{ borderTop: "0.5px solid var(--rule)" }} />
          </div>
        </section>

        {/* Back link — keeps navigation bidirectional without forcing the
            reader to use the breadcrumb, which is tight on mobile. */}
        <div style={{ paddingBottom: "3rem" }}>
          <Link
            href="/faq"
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.5625rem",
              fontWeight: 300,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              textDecoration: "none",
              borderBottom: "0.5px solid var(--accent)",
              paddingBottom: "1px",
            }}
          >
            Все категории
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
