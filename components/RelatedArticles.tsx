import Link from "next/link";
import { Article } from "@/lib/data";

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-label="Связанные статьи"
      style={{
        marginTop: "2.5rem",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
          fontSize: "0.4375rem",
          fontWeight: 300,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--stone)",
          marginBottom: "1.25rem",
        }}
      >
        Читайте также
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {articles.map((article) => (
          <li
            key={article.slug}
            style={{ borderTop: "0.5px solid var(--rule)" }}
          >
            <Link
              href={`/faq/${article.category_id}/${article.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  paddingTop: "0.875rem",
                  paddingBottom: "0.875rem",
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily:
                        "var(--font-inter-tight), 'Inter Tight', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 200,
                      letterSpacing: "-0.01em",
                      color: "var(--ink)",
                      lineHeight: 1.35,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {article.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      color: "var(--stone)",
                    }}
                  >
                    {article.category_title}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
                    fontSize: "0.5rem",
                    fontWeight: 300,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
        <li style={{ borderTop: "0.5px solid var(--rule)" }} />
      </ul>
    </section>
  );
}
