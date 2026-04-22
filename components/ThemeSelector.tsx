"use client";

import { useEffect, useState } from "react";

type Theme = "paper" | "ink";

const STORAGE_KEY = "bkk-theme";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage disabled */
  }
}

export default function ThemeSelector() {
  const [current, setCurrent] = useState<Theme>("paper");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    setCurrent(attr === "ink" ? "ink" : "paper");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = current === "paper" ? "ink" : "paper";
    applyTheme(next);
    setCurrent(next);
  };

  // Target label is the theme you'll switch TO on click
  const targetLabel = current === "paper" ? "Ink" : "Paper";

  return (
    <button
      type="button"
      className="theme-selector__trigger"
      onClick={toggle}
      aria-label={`Переключить тему на ${targetLabel}`}
      title={`Переключить тему на ${targetLabel}`}
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      {targetLabel}
    </button>
  );
}
