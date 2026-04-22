// Curated list of the 6 most-asked practical Bangkok questions.
// Hand-picked, editorial (no longer data-driven). Kept in sync with
// `app/top/page.tsx` so that article pages can show a "В TOP" badge
// whenever they're in the curated list.
const TOP_ROUTES: string[] = [
  "/faq/money_banking/money_exchange_cash",
  "/faq/connectivity/connectivity_sim_tourist",
  "/faq/transport_city/transport_airport_transfer",
  "/faq/housing/housing_short_term_rent",
  "/faq/visas_immigration/visa_tourist_extension_30",
  "/faq/travel_within_thailand/travel_pattaya",
];

export const TOP_ARTICLE_SLUGS: Set<string> = new Set(
  TOP_ROUTES.map((route) => route.split("/").pop() ?? "").filter(Boolean)
);

export function isTopArticle(slug: string): boolean {
  return TOP_ARTICLE_SLUGS.has(slug);
}
