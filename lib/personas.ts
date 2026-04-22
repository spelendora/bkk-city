import { getAllArticles } from "@/lib/data";
import type { Article } from "@/lib/data";

export interface Persona {
  id: string;
  title: string;
  subtitle: string;
  /** Tags that articles must carry (in `keywords` or slug) to belong to this persona. */
  tags: string[];
  /** Explicit slugs that are always pinned to this persona, regardless of tags. */
  pinnedSlugs?: string[];
}

// NOTE on deduplication: each article should appear on exactly ONE persona card.
// Because `getArticlesForPersona` runs independently per persona, broad tags
// (like "виза" or "housing") cause the same article to surface on multiple
// cards. The strategy below is: pin every article to its single best home,
// and keep tag lists narrow enough that tag-matching only re-selects already-
// pinned articles (no cross-persona leakage).
export const PERSONAS: Persona[] = [
  {
    id: "just-arrived",
    title: "Первый день",
    subtitle: "Первые часы в Бангкоке — что важно сразу",
    // Narrow tags: each one must only ever match articles pinned to this
    // persona. "такси"/"grab"/"аэропорт" were dropped because they pull
    // food_delivery_grab, safety_solo_female_bkk, etc.
    tags: [
      "тур штамп",
      "туристический штамп",
      "обмен валют",
      "краткосрочная аренда",
      "superrich",
    ],
    pinnedSlugs: [
      "visa_tourist_stamp_entry",
      "transport_airport_transfer",
      "money_exchange_cash",
      "money_foreign_cards",
      "money_atm_cash",
      "safety_tourist_scams",
      "housing_short_term_rent",
      "transport_taxi_apps",
      "transport_bts_mrt",
      "connectivity_sim_tourist",
    ],
  },
  {
    id: "city-life",
    title: "Чем заняться в городе",
    subtitle: "Куда сходить, что посмотреть, где поесть",
    // Narrow tags: "ват"/"спа"/"ресторан"/"кафе"/"бары"/"rooftop"/"market"
    // previously overmatched (e.g. "ват" hit "арендовать", "звать"; "спа"
    // hit "экспатов"). Only distinctive phrases remain.
    tags: [
      "достопримечательности",
      "sightseeing",
      "ночная жизнь",
      "клубы бангкока",
      "шопинг",
      "тайский массаж",
      "скайбар",
      "wat pho",
      "wat arun",
    ],
    pinnedSlugs: [
      "leisure_sightseeing",
      "leisure_nightlife_clubs",
      "leisure_spa_massage",
      "leisure_shopping_malls",
      "food_thai_dishes",
      "food_thai_regional",
      "food_cafes_rooftops_bars",
      "food_markets_products",
      "food_delivery_grab",
      "food_chinese",
      "food_japanese",
      "food_korean",
      "food_vietnamese",
      "food_indian",
      "food_european",
      "food_middle_eastern",
      "travel_pattaya",
    ],
  },
  {
    id: "will-stay",
    title: "Надолго",
    subtitle: "Остаюсь надолго — виза, жильё, еда",
    // Narrow tags: dropped "аренда"/"housing"/"еда"/"продление" because they
    // pull short-term rent, bike rental, border runs, cost-of-living into
    // the wrong home. Everything desired here is pinned.
    tags: ["dtv", "русская кухня", "digital nomad visa"],
    pinnedSlugs: [
      "visa_dtv",
      "visa_tourist_extension_30",
      "housing_long_term_rent_search",
      "housing_neighborhoods",
      "housing_agents_realtors",
      "money_open_thai_bank",
      "money_cost_of_living_bkk",
      "food_russian_ex_soviet",
      "russian_specialists_directory",
    ],
  },
  {
    id: "visa-stuff",
    title: "Документы",
    subtitle: "Всё про иммиграцию и документы",
    // Narrow tags: dropped "виза"/"visa" (they pull every visa_* slug,
    // including the tourist/DTV ones that live in just-arrived/will-stay).
    // Kept only document-type tags that uniquely identify paperwork.
    tags: [
      "tm30",
      "tm47",
      "90-day",
      "overstay",
      "оверстей",
      "residence certificate",
      "резидент сертификат",
      "work permit",
      "ворк пермит",
      "консульство",
      "загранпаспорт",
      "визаран",
      "border run",
    ],
    pinnedSlugs: [
      "visa_90day_report",
      "visa_tm30_registration",
      "visa_overstay_issues",
      "visa_residence_certificate",
      "visa_border_run",
      "visa_ltr",
      "visa_non_o_retirement",
      "visa_non_o_marriage",
      "visa_non_b_business",
      "visa_non_o_business_ltr",
      "visa_student",
      "documents_passport_consulate",
      "documents_consulates_cis",
      "work_permit_company",
      "money_ltr_tax_exemption",
    ],
  },
];

/**
 * Find all articles that match a persona. Matching rules:
 *   1. Pinned slugs come first (in the order declared).
 *   2. Any article whose `keywords` contains a persona tag (case-insensitive)
 *      is appended (deduplicated).
 *   3. Any article whose `slug` contains a persona tag token is appended too.
 * Returns up to `limit` entries (default: all matching, no cap).
 */
export function getArticlesForPersona(
  persona: Persona,
  limit?: number
): Article[] {
  const all = getAllArticles();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const seen = new Set<string>();
  const out: Article[] = [];

  // 1. Pinned first
  for (const slug of persona.pinnedSlugs ?? []) {
    const art = bySlug.get(slug);
    if (art && !seen.has(art.slug)) {
      seen.add(art.slug);
      out.push(art);
    }
  }

  // 2. Tag-match by keywords + slug
  const tagsLower = persona.tags.map((t) => t.toLowerCase());
  for (const art of all) {
    if (seen.has(art.slug)) continue;
    const hay = [
      art.slug.toLowerCase(),
      art.title.toLowerCase(),
      ...(art.keywords ?? [])
        .filter((k): k is string => typeof k === "string")
        .map((k) => k.toLowerCase()),
    ];
    if (tagsLower.some((tag) => hay.some((h) => h.includes(tag)))) {
      seen.add(art.slug);
      out.push(art);
    }
  }

  return typeof limit === "number" ? out.slice(0, limit) : out;
}

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
