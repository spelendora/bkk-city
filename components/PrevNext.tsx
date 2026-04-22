import Link from "next/link";
import { Article } from "@/lib/data";

interface PrevNextProps {
  prev: Article | null;
  next: Article | null;
}

export default function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Навигация по статьям"
      style={{
        borderTop: "0.5px solid var(--rule)",
        borderBottom: "0.5px solid var(--rule)",
        marginTop: "3rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* Prev */}
      <div
        style={{
          borderRight: "0.5px solid var(--rule)",
          padding: "1.25rem 1.25rem 1.25rem 0",
        }}
      >
        {prev ? (
          <Link
            href={`/faq/${prev.category_id}/${prev.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.4375rem",
                fontWeight: 300,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--stone)",
                marginBottom: "0.5rem",
              }}
            >
              ← Предыдущая
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.8125rem",
                fontWeight: 200,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                lineHeight: 1.35,
              }}
            >
              {prev.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next */}
      <div
        style={{
          padding: "1.25rem 0 1.25rem 1.25rem",
          textAlign: "right",
        }}
      >
        {next ? (
          <Link
            href={`/faq/${next.category_id}/${next.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.4375rem",
                fontWeight: 300,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--stone)",
                marginBottom: "0.5rem",
              }}
            >
              Следующая →
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.8125rem",
                fontWeight: 200,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                lineHeight: 1.35,
              }}
            >
              {next.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
