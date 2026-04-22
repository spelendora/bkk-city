/**
 * ArticleReadingStats — server component (no "use client" needed).
 * Computes word count and estimated reading time from raw markdown.
 * Displays inline with the article meta strip.
 */

interface ArticleReadingStatsProps {
  markdown: string;
  /** ISO date string from the article's `generated` field */
  generated: string;
}

/**
 * Strip markdown syntax to get readable word count.
 * Removes: headings (#), bold/italic (*_), links [], images ![], code blocks, HTML tags.
 */
function countWords(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[.*?\]\(.*?\)/g, "$1") // links → keep text
    .replace(/<[^>]+>/g, "") // HTML tags
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_~`>#|]/g, " ") // markdown punctuation
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}

/** Format ISO date string to Russian locale, e.g. "22 апреля 2026" */
function formatDateRu(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ArticleReadingStats({
  markdown,
  generated,
}: ArticleReadingStatsProps) {
  const words = countWords(markdown);
  // Average adult reading speed: ~200 words/min for dense informational text
  const minutes = Math.max(1, Math.round(words / 200));
  const formattedDate = formatDateRu(generated);

  return (
    <>
      {/* Reading time cell */}
      <div>
        <div
          style={{
            fontFamily:
              "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontSize: "0.4375rem",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--stone)",
            marginBottom: "0.3rem",
          }}
        >
          Чтение
        </div>
        <div className="reading-time">
          {minutes}&thinsp;мин · {words.toLocaleString("ru-RU")}&thinsp;сл.
        </div>
      </div>

      {/* Last updated cell */}
      <div>
        <div
          style={{
            fontFamily:
              "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontSize: "0.4375rem",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--stone)",
            marginBottom: "0.3rem",
          }}
        >
          Обновлено
        </div>
        <div
          style={{
            fontFamily:
              "var(--font-fraunces), Georgia, serif",
            fontSize: "0.6875rem",
            fontStyle: "italic",
            color: "var(--stone)",
          }}
        >
          {formattedDate}
        </div>
      </div>
    </>
  );
}
