"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sequence buffer for 2-key shortcuts like "g h", "g f", "g t"
let seqBuffer = "";
let seqTimer: ReturnType<typeof setTimeout> | null = null;

function clearSeq() {
  seqBuffer = "";
  if (seqTimer) {
    clearTimeout(seqTimer);
    seqTimer = null;
  }
}

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when typing in form elements or when modifier keys are held
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      const key = e.key;

      if (seqBuffer === "g") {
        clearSeq();
        if (key === "h") {
          e.preventDefault();
          router.push("/");
          return;
        }
        if (key === "f") {
          e.preventDefault();
          router.push("/faq");
          return;
        }
        if (key === "t") {
          e.preventDefault();
          router.push("/top10");
          return;
        }
        // unknown second key — reset
        return;
      }

      if (key === "g") {
        seqBuffer = "g";
        seqTimer = setTimeout(clearSeq, 800);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearSeq();
    };
  }, [router]);

  return null;
}
