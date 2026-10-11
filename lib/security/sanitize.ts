/**
 * Input sanitization helpers (OWASP A03 — Injection / XSS defense-in-depth).
 *
 * Layer 2 of input handling: Zod schemas validate shape and length
 * (see lib/validation/), these helpers neutralize content before it is
 * ever stored or re-rendered. React escapes interpolated output by default;
 * these exist for data that may end up in non-JSX contexts (emails, MDX
 * frontmatter, logs) and as a documented barrier against accidental
 * dangerouslySetInnerHTML use.
 */

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape the five markup-significant characters. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Sanitize free-text user input:
 * - trims outer whitespace
 * - strips control characters (except \n and \t)
 * - caps length to blunt memory/abuse vectors
 * - escapes HTML-significant characters
 */
export function sanitizeText(input: string, maxLength = 2000): string {
  const stripped = input
    .replace(/\r\n/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  return escapeHtml(stripped.slice(0, maxLength));
}

/** Normalize and validate-looking-check an email without over-promising. */
export function sanitizeEmail(input: string, maxLength = 254): string {
  return escapeHtml(input.trim().toLowerCase().slice(0, maxLength));
}

/**
 * Clean free text that will be rendered through React text nodes (which
 * escape output automatically). Strips control characters, trims, and caps
 * length — but does NOT entity-escape, otherwise display would double-escape.
 * Use `escapeHtml` for content heading into non-JSX contexts instead.
 */
export function cleanText(input: string, maxLength: number): string {
  return input
    .replace(/\r\n/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}
