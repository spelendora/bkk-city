import Link from "next/link";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandPalette from "@/components/CommandPaletteLoader";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SiteFooter from "@/components/SiteFooter";
export const metadata = {
  title: "Top",
  description: "Самые частые вопросы о Бангкоке",
};

/**
 * /top — curated list of the 6 most-asked practical questions.
 * Hand-picked, not data-driven: editorial decision to keep the list
 * focused on arrival-day operational questions.
 */
const TOP_ITEMS: { question: string; href: string }[] = [
  {
    question: "Где поменять деньги",
    href: "/faq/money_banking/money_exchange_cash",
  },
  {
    question: "Где купить симкарту",
    href: "/faq/connectivity/connectivity_sim_tourist",
  },
  {
    question: "Трансфер из аэропорта",
    href: "/faq/transport_city/transport_airport_transfer",
  },
  {
    question: "Как снять жильё на краткосрок",
    href: "/faq/housing/housing_short_term_rent",
  },
  {
    question: "Где продлить туристическую визу или штамп в Бангкоке",
    href: "/faq/visas_immigration/visa_tourist_extension_30",
  },
  {
    question: "Как добраться до Паттайи",
    href: "/faq/travel_within_thailand/travel_pattaya",
  },
];

export default function TopPage() {
  const items = TOP_ITEMS;

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
          items={[{ label: "Главная", href: "/" }, { label: "Top" }]}
        />

        {/* Header */}
        <div
          style={{
            paddingTop: "clamp(1rem, 2vw, 1.75rem)",
            paddingBottom: "2rem",
            maxWidth: "640px",
          }}
        >
          <p
            style={{
              fontFamily:
                "var(--font-inter-tight), 'Inter Tight', sans-serif",
              fontSize: "0.5625rem",
              fontWeight: 300,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--stone)",
              marginBottom: "1rem",
            }}
          >
            Самое важное
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
            Top
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
            Вопросы, которые задают чаще всего.
          </p>
        </div>

        {/* Clean ranked list */}
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 4rem 0",
            maxWidth: "760px",
          }}
        >
          {items.map((item, idx) => (
            <li
              key={item.href}
              style={{
                borderTop: "0.5px solid var(--rule)",
                paddingTop: "1.25rem",
                paddingBottom: "1.25rem",
                display: "grid",
                gridTemplateColumns: "2.5rem 1fr auto",
                gap: "1rem",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                  fontSize: "0.6875rem",
                  color: "var(--stone)",
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 200,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.4,
                }}
              >
                {item.question}
              </span>
              <Link
                href={item.href}
                style={{
                  fontFamily:
                    "var(--font-inter-tight), 'Inter Tight', sans-serif",
                  fontSize: "0.5625rem",
                  fontWeight: 300,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Читать →
              </Link>
            </li>
          ))}
          <li style={{ borderTop: "0.5px solid var(--rule)" }} />
        </ol>
      </main>

      <SiteFooter />
    </>
  );
}
