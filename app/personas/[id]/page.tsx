import { notFound } from "next/navigation";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import {
  PERSONAS,
  getPersonaById,
  getArticlesForPersona,
} from "@/lib/personas";

export async function generateStaticParams() {
  return PERSONAS.map((p) => ({ id: p.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const persona = getPersonaById(id);
  if (!persona) return {};
  return {
    title: persona.title,
    description: persona.subtitle,
  };
}

export default async function PersonaPage({ params }: Props) {
  const { id } = await params;
  const persona = getPersonaById(id);
  if (!persona) notFound();

  const articles = getArticlesForPersona(persona);

  return (
    <>
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
          items={[
            { label: "Главная", href: "/" },
            { label: "Персона" },
          ]}
        />

        {/* Page header */}
        <section
          style={{
            paddingBottom: "3rem",
            maxWidth: "640px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.5625rem",
              fontWeight: 300,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.875rem",
            }}
          >
            Персона
          </p>
          <h1
            style={{
              fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 200,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              marginBottom: "0.75rem",
            }}
          >
            {persona.title}
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
            {persona.subtitle}
          </p>
        </section>

        {/* Articles list */}
        <section style={{ paddingBottom: "5rem" }}>
          {articles.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 300,
                color: "var(--stone)",
              }}
            >
              Статьи не найдены.
            </p>
          ) : (
            <div>
              {articles.map((article, i) => (
                <div
                  key={article.slug}
                  style={{ borderTop: "0.5px solid var(--rule)" }}
                >
                  <Link
                    href={`/faq/${article.category_id}/${article.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "clamp(60px, 8vw, 120px) 1fr",
                        gap: "0",
                        paddingTop: "1.25rem",
                        paddingBottom: "1.25rem",
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            "ui-monospace, 'SF Mono', Menlo, monospace",
                          fontSize: "0.625rem",
                          color: "var(--stone)",
                          letterSpacing: "0.04em",
                          paddingTop: "0.25rem",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h2
                          style={{
                            fontFamily:
                              "var(--font-inter-tight), 'Inter Tight', sans-serif",
                            fontSize: "0.9375rem",
                            fontWeight: 200,
                            color: "var(--ink)",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.35,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {article.title}
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                            marginTop: "0.375rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily:
                                "var(--font-inter-tight), 'Inter Tight', sans-serif",
                              fontSize: "0.5625rem",
                              fontWeight: 300,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "var(--accent)",
                            }}
                          >
                            {article.category_title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              <div style={{ borderTop: "0.5px solid var(--rule)" }} />
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
