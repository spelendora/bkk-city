import Link from "next/link";
import ThemeSelector from "./ThemeSelector";

interface MastheadProps {
  /** Retained for API compatibility; no longer affects rendering. */
  active?: "landing" | "faq" | "top" | "top10";
}

/**
 * Masthead — brand + theme selector, shared across every page.
 *
 * Page-position signalling (Главная · FAQ · …) is now owned by the
 * Breadcrumbs component. Landing pages use a minimal Breadcrumbs with
 * just "Главная" so the vertical rhythm matches every other page.
 */
export default function Masthead(_: MastheadProps = {}) {
  return (
    <header
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "0",
        paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
        paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
      }}
    >
      {/* Brand + top nav + theme selector */}
      <div
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.6875rem",
              fontWeight: 200,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--ink)",
              textDecoration: "none",
              fontFeatureSettings: '"smcp" 0',
            }}
          >
            FAQ&nbsp;&nbsp;Bangkok
          </Link>
          <nav
            aria-label="Главная навигация"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <Link
              href="/faq"
              style={{
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.625rem",
                fontWeight: 300,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "var(--stone)",
              }}
            >
              FAQ
            </Link>
            <Link
              href="/top"
              style={{
                fontFamily:
                  "var(--font-inter-tight), 'Inter Tight', sans-serif",
                fontSize: "0.625rem",
                fontWeight: 300,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "var(--stone)",
              }}
            >
              Top
            </Link>
          </nav>
        </div>
        <ThemeSelector />
      </div>

      {/* Hairline under brand */}
      <div style={{ borderTop: "0.5px solid var(--rule)" }} />
    </header>
  );
}
