import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const dotStyle: React.CSSProperties = {
  color: "var(--rule)",
  fontSize: "0.4rem",
  userSelect: "none",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
  fontSize: "0.5625rem",
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Хлебные крошки"
      style={{
        paddingTop: "0.875rem",
        paddingBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        flexWrap: "wrap",
      }}
    >
      {items.map((item, i) => (
        <span
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
        >
          {i > 0 && (
            <span style={dotStyle} aria-hidden="true">
              ·
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              style={{
                ...labelStyle,
                color: "var(--stone)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              style={{
                ...labelStyle,
                color: "var(--ink)",
              }}
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
