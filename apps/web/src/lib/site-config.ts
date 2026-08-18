// apps/web/src/lib/site-config.ts

// Single source of truth for brand identity. Every place that needs the
// app name — this screen, the sidebar (Phase 8, coming up next), page
// metadata, the README — reads from here instead of hardcoding a string.
export const siteConfig = {
  name: "Cairn",
  // Placeholder — not used anywhere yet, but Section 6 wants it centralized
  // from the start rather than bolted on later. Swap for real copy whenever.
  tagline: "A stack of small, clear tasks.",
} as const;