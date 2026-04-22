/**
 * JsonLd — injects one or more JSON-LD objects as <script type="application/ld+json">.
 * Server component (no "use client" needed — script tags are safe in RSC).
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------
// Builder helpers — called from article page (server component)
// ---------------------------------------------------------------

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Parse h3 headings under "Вопросы и ответы" section as FAQ entries. */
export function parseFaqEntries(bodyMarkdown: string): FaqEntry[] {
  // Find the "Вопросы и ответы" h2 section up to the next h2/h1
  const sectionMatch = bodyMarkdown.match(
    /^## Вопросы и ответы[ \t]*\n([\s\S]*?)(?=^## |^# )/m
  );
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const entries: FaqEntry[] = [];

  // Split on h3 markers
  const parts = section.split(/^### /m);
  for (const part of parts) {
    if (!part.trim()) continue;
    const lines = part.split("\n");
    const question = lines[0].trim();
    if (!question) continue;

    // Collect answer lines until next heading or end
    const answerLines = lines.slice(1).join("\n").trim();
    // Strip markdown formatting for plain text answer
    const answer = answerLines
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/^[-*>]+\s*/gm, "")
      .replace(/[*_`#|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

    if (question && answer) {
      entries.push({ question, answer });
    }
  }

  return entries;
}
