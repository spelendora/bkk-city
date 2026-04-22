import Link from "next/link";
import { PERSONAS, getArticlesForPersona } from "@/lib/personas";

/**
 * PersonaGrid — server component. Each card lists up to 4 matched articles
 * drawn from the persona's `tags` + `pinnedSlugs`. Cards are uniform height
 * (align-items: stretch on the grid) so block headings line up visually with
 * neighbouring landing sections.
 */
export default function PersonaGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0",
        alignItems: "stretch",
      }}
    >
      {PERSONAS.map((persona) => {
        const personaArticles = getArticlesForPersona(persona, 4);

        return (
          <Link
            key={persona.id}
            href={`/personas/${persona.id}`}
            style={{ textDecoration: "none", display: "block" }}
            className="persona-tile"
          >
            <div
              style={{
                border: "0.5px solid var(--rule)",
                marginRight: "-0.5px",
                marginBottom: "-0.5px",
                padding: "1.75rem",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Title + subtitle in a fixed-height block so the list
                  below starts at the same baseline on every card. */}
              <div
                style={{
                  minHeight: "5.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontFamily:
                      "var(--font-inter-tight), 'Inter Tight', sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 200,
                    letterSpacing: "-0.015em",
                    color: "var(--ink)",
                    margin: 0,
                    marginBottom: "0.5rem",
                    lineHeight: 1.25,
                  }}
                >
                  {persona.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-inter), 'Inter', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: "var(--stone)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {persona.subtitle}
                </p>
              </div>

              {/* Article list */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  borderTop: "0.5px solid var(--rule)",
                  flex: 1,
                }}
              >
                {personaArticles.map((article) => (
                  <li
                    key={article.slug}
                    style={{
                      borderBottom: "0.5px solid var(--rule)",
                      padding: "0.625rem 0",
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.625rem",
                    }}
                  >
                    <span
                      className="persona-tile__article-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    <span
                      style={{
                        fontFamily:
                          "var(--font-inter-tight), 'Inter Tight', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 200,
                        color: "var(--ink)",
                        letterSpacing: "-0.005em",
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          </Link>
        );
      })}
    </div>
  );
}
