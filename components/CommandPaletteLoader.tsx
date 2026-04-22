"use client";

/**
 * Client-side lazy loader for the CommandPalette.
 *
 * Why this wrapper exists:
 *   - `CommandPalette` eagerly imports the Fuse.js search index at module
 *     scope, so shipping it in the initial client bundle adds ~300kB JSON
 *     + Fuse.js to every route.
 *   - We want to defer BOTH the component code and the index parsing until
 *     after hydration.
 *   - `next/dynamic({ ssr: false })` can only be called from a Client
 *     Component (Next.js 15 App Router restriction). The FAQ pages that
 *     mount the palette are Server Components — so we wrap the dynamic
 *     import here and import this tiny wrapper from the pages instead.
 *
 * `loading: () => null` because the palette is invisible until the user
 * hits Cmd+K / "/".
 */
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
  loading: () => null,
});

export default function CommandPaletteLoader() {
  return <CommandPalette />;
}
