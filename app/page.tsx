import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import PersonaGrid from "@/components/PersonaGrid";
import LandingSearch from "@/components/LandingSearch";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SiteFooter from "@/components/SiteFooter";
import JsonLd, {
  buildGraph,
  buildWebSiteSchema,
  buildPublisherSchema,
  buildBreadcrumbList,
} from "@/components/JsonLd";

// Landing uses a fully-qualified title (no "— FAQ Bangkok" suffix, since the
// root template would otherwise double-append the brand). `title.absolute`
// bypasses the template defined in app/layout.tsx.
export const metadata: Metadata = {
  title: {
    absolute: "FAQ Bangkok — Ответы на вопросы о Бангкоке",
  },
  description:
    "Ответы на главные вопросы о Бангкоке: визы, жильё, транспорт, деньги, еда. Проверенные подборки из @bkk_chat — коротко и по делу.",
  alternates: {
    canonical: "https://bkk.city/",
  },
  openGraph: {
    title: "FAQ Bangkok — Ответы на вопросы о Бангкоке",
    description:
      "Ответы на главные вопросы о Бангкоке: визы, жильё, транспорт, деньги, еда. Проверенные подборки из @bkk_chat — коротко и по делу.",
    url: "https://bkk.city/",
    siteName: "FAQ Bangkok",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ Bangkok — Ответы на вопросы о Бангкоке",
    description:
      "Ответы на главные вопросы о Бангкоке: визы, жильё, транспорт, деньги, еда. Проверенные подборки из @bkk_chat — коротко и по делу.",
  },
};

/**
 * Landing page.
 *
 * Structure — 3 sections sharing the same gutters and the same "eyebrow"
 * header pattern so block titles line up visually:
 *   1. Я ищу конкретное  — search hero
 *   2. Я здесь, потому что…  — persona cards (tag-matched articles)
 *   3. Нужна шпаргалка  — one-line link to /top10 (no inline list)
 */
export default function LandingPage() {
  // JSON-LD — WebSite (with SearchAction) + Publisher + BreadcrumbList,
  // wrapped in a single @graph so @id cross-references resolve cleanly.
  const graph = buildGraph([
    buildWebSiteSchema(),
    buildPublisherSchema(),
    buildBreadcrumbList([{ name: "Главная" }]),
  ]);

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
        <Breadcrumbs items={[{ label: "Главная" }]} />

        {/* ---- Section 1: Search hero ---- */}
        <section
          style={{
            paddingTop: "clamp(1.75rem, 3vw, 2.5rem)",
            paddingBottom: "clamp(1rem, 2vw, 1.75rem)",
          }}
        >
          <p className="landing-eyebrow">Я ищу конкретное</p>
          <div style={{ maxWidth: "800px" }}>
            <LandingSearch />
          </div>
        </section>

        {/* ---- Section 2: Personas ---- */}
        <section
          id="personas"
          style={{
            paddingTop: "clamp(1rem, 2vw, 1.75rem)",
            paddingBottom: "clamp(1rem, 2vw, 1.75rem)",
            scrollMarginTop: "5rem",
          }}
        >
          <p className="landing-eyebrow">Я здесь, потому что…</p>
          <PersonaGrid />
        </section>

        <div style={{ borderTop: "0.5px solid var(--rule)" }} />

        {/* ---- Section 3: Top shortcut ---- */}
        <section
          style={{
            paddingTop: "clamp(1rem, 2vw, 1.75rem)",
            paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          <p className="landing-eyebrow">Нужна шпаргалка</p>
          <Link
            href="/top"
            className="landing-cheatsheet-link"
            style={{
              display: "block",
              maxWidth: "720px",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <p
              style={{
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "1rem",
                fontWeight: 200,
                letterSpacing: "-0.01em",
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Самые частые вопросы — собраны в короткий чеклист с прямыми
              ссылками на статьи.{" "}
              <span
                style={{
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}
                aria-hidden="true"
              >
                →
              </span>
            </p>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
