/**
 * Names of the CSS variables defined in app/globals.css.
 * Hex values live only in that file.
 */
export const cssVars = {
  color: {
    shadowGrey: "var(--color-shadow-grey)",
    graphite: "var(--color-graphite)",
    ivory: "var(--color-ivory)",
    dust: "var(--color-dust)",
    signal: "var(--color-signal)",
  },
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  layout: {
    margin: "var(--spacing-margin)",
    gutter: "var(--spacing-gutter)",
    section: "var(--spacing-section)",
    navHeight: "var(--nav-height)",
  },
  z: {
    nav: "var(--z-nav)",
    menu: "var(--z-menu)",
    skip: "var(--z-skip)",
  },
} as const;

export const layout = {
  columns: 12,
  marginMinPx: 20,
  gutterMinPx: 20,
  gutterMaxPx: 32,
  sectionMinPx: 140,
  sectionMaxPx: 220,
} as const;
