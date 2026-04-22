import { LOCATIONS, mapsUrl } from "@/lib/locations";
import type { LocationEntry } from "@/lib/locations";

interface Props {
  markdown: string;
}

/**
 * Scan body_markdown for all location terms and return unique LocationEntry
 * objects found, in the order they first appear in the text.
 */
function extractLocations(markdown: string): LocationEntry[] {
  const found: LocationEntry[] = [];
  const seenCanonicals = new Set<string>();

  // Build a list of (matchIndex, entry) pairs, then sort by first appearance
  const candidates: Array<{ index: number; entry: LocationEntry }> = [];

  for (const entry of LOCATIONS) {
    const allForms = [entry.term, ...(entry.aliases ?? [])];
    let earliestIndex = -1;
    for (const form of allForms) {
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(
        `(?<![\\wа-яёА-ЯЁ])(${escaped})(?![\\wа-яёА-ЯЁ])`,
        "iu"
      );
      const m = re.exec(markdown);
      if (m && (earliestIndex === -1 || m.index < earliestIndex)) {
        earliestIndex = m.index;
      }
    }
    if (earliestIndex !== -1) {
      candidates.push({ index: earliestIndex, entry });
    }
  }

  // Sort by first appearance position
  candidates.sort((a, b) => a.index - b.index);

  for (const { entry } of candidates) {
    if (!seenCanonicals.has(entry.canonical)) {
      seenCanonicals.add(entry.canonical);
      found.push(entry);
    }
  }

  return found;
}

/**
 * "Места в статье" — typographic list of every unique location mentioned in
 * the article body, with canonical name, type badge, and Google Maps link.
 *
 * Renders nothing when the article has zero location mentions.
 * This is a server component — no client boundary needed.
 */
export default function PlacesInArticle({ markdown }: Props) {
  const locations = extractLocations(markdown);

  if (locations.length === 0) return null;

  return (
    <section className="places-in-article" aria-label="Места в статье">
      <div className="places-in-article__heading">Места в статье</div>
      <ul className="places-in-article__list">
        {locations.map((loc) => (
          <li key={loc.canonical} className="places-in-article__item">
            <span className="places-in-article__dash" aria-hidden="true">—</span>
            <div className="places-in-article__body">
              <span className="places-in-article__name">{loc.canonical}</span>
              <span className="places-in-article__meta">
                <span className="places-in-article__type">{loc.category_ru}</span>
                <span className="places-in-article__sep" aria-hidden="true">·</span>
                <a
                  href={mapsUrl(loc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="places-in-article__link"
                >
                  Открыть в Google Maps ↗
                </a>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
