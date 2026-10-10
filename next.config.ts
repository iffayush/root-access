import type { NextConfig } from "next";
import path from "node:path";

/**
 * Security headers (OWASP A05 — Security Misconfiguration).
 *
 * CSP notes for this site:
 * - All assets are self-hosted (next/font serves Google fonts locally; logos
 *   are inline SVG), so the policy is tight.
 * - `script-src 'unsafe-inline'` is required by Next.js: prerendered pages
 *   embed the RSC flight payload as an inline bootstrap script. Nonce-based
   * CSP would need per-request middleware and a dynamic server, which the
 *   static portfolio does not use.
 * - `style-src 'unsafe-inline'` is required by Tailwind utilities and the
 *   runtime styles GSAP/the canvas visuals set via `element.style`.
 * - Dev adds `'unsafe-eval'` (React Refresh / Turbopack HMR) and drops
 *   `upgrade-insecure-requests` so the site stays testable over plain http
 *   through a LAN IP.
 */
const isDev = process.env.NODE_ENV === "development";

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  // Next dev blocks /_next/* asset requests from non-localhost origins by
  // default, which breaks hydration (and every animation) when the site is
  // opened from a phone via this machine's LAN IP. Patterns are hostnames
  // without scheme/port; `*` matches exactly one label.
  allowedDevOrigins: ["192.168.*.*", "169.254.*.*", "10.*.*.*"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
