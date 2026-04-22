# 25-wallpaper-minimal

## Design Name
Wallpaper Minimal

## Philosophy
The expensive architecture magazine of Bangkok FAQs — every element placed with millimeter precision, generous negative space treated as an active design decision, and the single italic Fraunces accent working as a discreet editorial voice against a field of Inter Tight at featherweight 200. No decoration survives that doesn't earn its presence.

## Tech choices specific to this variant
- **Inter Tight** (weights 200–300) as the primary display and UI typeface via `next/font/google` — the surprising lightness at 200 is the defining typographic choice
- **Fraunces** as variable font with `axes: ["SOFT", "WONK"]` and `weight: "variable"`, italic-only for editorial emphasis
- **Inter** (weights 300–400) for body prose
- All colour declared as CSS custom properties in `@theme` block inside `globals.css` (Tailwind v4 pattern)
- Palette: `#fafaf8` bg · `#1a1a1a` ink · `#8a8682` stone · `#7c8471` sage · `#d8d6d2` rule
- Zero `border-radius` throughout; zero box shadows; hairlines are `0.5px`
- Left-margin grid column (`clamp(60px, 8vw, 120px)`) creates the architectural offset layout on category and article pages
- `clamp()` for all responsive sizing; no breakpoint media queries

## How to run
```bash
cd 25-wallpaper-minimal
npm install
npm run dev
# Open http://localhost:3000
```

## Routes
- `/` — landing: featured headline at 64px+, category index, stats, cheatsheet teaser
- `/faq` — FAQ index with visual-only audience/sort filters, numbered entries
- `/faq/[category]/[topic]` — article with metadata strip, keywords as `·`-separated sage text, full markdown body
- `/top10` — cheatsheet with numbered layout
