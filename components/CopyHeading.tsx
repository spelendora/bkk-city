"use client";

import { useState } from "react";

interface CopyHeadingProps {
  id: string;
  children: React.ReactNode;
  tag: "h2" | "h3";
}

/**
 * CopyHeading — wraps a heading element and shows a subtle copy-anchor button
 * on hover. Copies the full URL + anchor hash to clipboard.
 * Falls back gracefully if Clipboard API is blocked.
 */
export default function CopyHeading({ id, children, tag: Tag }: CopyHeadingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — silently ignore
    }
  };

  return (
    <Tag id={id} className="copy-heading-wrapper">
      {children}
      <button
        onClick={handleCopy}
        aria-label={copied ? "Скопировано" : "Скопировать ссылку"}
        title={copied ? "Скопировано" : "Скопировать ссылку на раздел"}
        className="copy-heading-btn"
      >
        {copied ? "✓" : "#"}
      </button>
    </Tag>
  );
}
