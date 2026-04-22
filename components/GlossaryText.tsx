"use client";

import React from "react";
import { GLOSSARY, GlossaryEntry } from "@/lib/glossary";
import GlossaryTooltip from "@/components/GlossaryTooltip";

// Build a flat list of {pattern, short} sorted by length (longest first)
// to avoid partial matches (e.g. "Non-B" before "Non")
interface TermPattern {
  regex: RegExp;
  short: string;
  term: string;
}

function buildPatterns(): TermPattern[] {
  const patterns: TermPattern[] = [];

  for (const entry of GLOSSARY) {
    const allForms = [entry.term, ...(entry.aliases ?? [])];
    for (const form of allForms) {
      // Escape special regex chars
      const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Word boundary — use lookahead/lookbehind compatible approach
      const pattern = new RegExp(`(?<![\\wа-яёА-ЯЁ])(${escaped})(?![\\wа-яёА-ЯЁ])`, "iu");
      patterns.push({ regex: pattern, short: entry.short, term: entry.term });
    }
  }

  // Sort by pattern string length descending so longer terms match first
  patterns.sort((a, b) => b.term.length - a.term.length);
  return patterns;
}

const TERM_PATTERNS = buildPatterns();

/**
 * Takes a plain text string and returns an array of React nodes with
 * <abbr> wrapping the FIRST occurrence of each glossary term.
 * Already-wrapped terms are tracked via the `seen` set.
 */
function wrapTermsInText(
  text: string,
  seen: Set<string>
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliestIndex = -1;
    let earliestPattern: TermPattern | null = null;
    let earliestMatch: RegExpExecArray | null = null;

    for (const pattern of TERM_PATTERNS) {
      // Only try patterns for terms not yet seen
      if (seen.has(pattern.term)) continue;

      const globalRegex = new RegExp(pattern.regex.source, "giu");
      const match = globalRegex.exec(remaining);
      if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
        earliestIndex = match.index;
        earliestPattern = pattern;
        earliestMatch = match;
      }
    }

    if (!earliestMatch || !earliestPattern || earliestIndex === -1) {
      // No more matches — push remaining as plain text
      nodes.push(remaining);
      break;
    }

    // Push text before the match
    if (earliestIndex > 0) {
      nodes.push(remaining.slice(0, earliestIndex));
    }

    // Push <GlossaryTooltip> for the match
    const matchedText = earliestMatch[0];
    seen.add(earliestPattern.term);
    nodes.push(
      <GlossaryTooltip key={key++} term={matchedText} hint={earliestPattern.short}>
        {matchedText}
      </GlossaryTooltip>
    );

    // Advance remaining
    remaining = remaining.slice(earliestIndex + matchedText.length);
  }

  return nodes;
}

/**
 * Recursively walk React children and wrap text nodes with glossary abbrs.
 * Skips children inside <code> and <pre> elements.
 */
function processChildren(
  children: React.ReactNode,
  seen: Set<string>,
  skipCode: boolean
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      if (skipCode) return child;
      const wrapped = wrapTermsInText(child, seen);
      if (wrapped.length === 1 && typeof wrapped[0] === "string") {
        return child; // no change
      }
      return <>{wrapped}</>;
    }

    if (!React.isValidElement(child)) return child;

    const el = child as React.ReactElement<{ children?: React.ReactNode }>;
    const type = el.type;

    // Skip code/pre elements
    if (type === "code" || type === "pre") return child;

    const childChildren = el.props.children;
    if (childChildren == null) return child;

    const processedChildren = processChildren(childChildren, seen, skipCode);
    return React.cloneElement(el, {}, processedChildren);
  }) ?? null;
}

interface GlossaryTextProps {
  children: React.ReactNode;
}

/**
 * Wrapper component: takes rendered ReactMarkdown output as children
 * and injects <abbr title="..."> for the first occurrence of each glossary term.
 */
export default function GlossaryText({ children }: GlossaryTextProps) {
  const seen = new Set<string>();
  const processed = processChildren(children, seen, false);
  return <>{processed}</>;
}
