/**
 * SiteFooter — single source of truth for the site footer.
 *
 * Shown on every page. Carries the site name, copyright, and the designer's
 * link. Deliberately free of metrics/counts per editorial direction.
 */
export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "0.5px solid var(--rule)",
        paddingTop: "1.5rem",
        paddingBottom: "2.5rem",
        paddingLeft: "clamp(1.5rem, 6vw, 7.5rem)",
        paddingRight: "clamp(1.5rem, 6vw, 7.5rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
          fontSize: "0.5625rem",
          fontWeight: 300,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--stone)",
        }}
      >
        FAQ Bangkok
      </span>
      <span
        style={{
          fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
          fontSize: "0.5625rem",
          fontWeight: 300,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--stone)",
        }}
      >
        ©{" "}
        <a
          href="https://spelendora.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--stone)",
            textDecoration: "underline",
            textDecorationThickness: "0.5px",
            textUnderlineOffset: "2px",
          }}
        >
          Valeriy Grachev
        </a>
      </span>
    </footer>
  );
}
