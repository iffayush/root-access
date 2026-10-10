# Handoff — Ayush Kumar portfolio

Read this before writing code. Phases 1–3 are complete and verified, plus the 2026-10-04 → 2026-10-07 refinement pass (FaultyTerminal hero background, StaggeredMenu nav, ProfileCard profile, Work hover-index, preloader gate, Experience section, LAN dev-origins fix). `npm run build` passes cleanly. **Phase 4 is next but ON HOLD until Ayush says start.**

The original brief is the product spec. This file records what was actually built, what Ayush changed, and what must not be undone.

## Identity

- Ayush Kumar, cybersecurity-focused B.Tech IT student, India.
- Primary role lives only in `siteConfig.title` (`Cybersecurity Engineer`). Components must read it. Do not hardcode the role.
- Focus: Application Security, Cloud Security, Detection & Response, DevSecOps.
- Meridian Studio is one understated line, from `siteConfig.meridian` (`{ label, url? }`). It appears in exactly two places: Profile (in the Focus Areas band row) and Footer. No design portfolio, design services, or creative-developer positioning. `meridian.url` is omitted on purpose; add it only if he gives a URL.
- Never fabricate achievements, metrics, dates, credentials, or contact details. Unknown facts use `[ADD …]` placeholders, searchable with `grep "\[ADD"`. Aegis copy is sourced strictly from its README (github.com/iffayush/aegis); the README claims no metrics, so Aegis has no result block.
- A result metric renders only when `method` is non-empty. No method, no number.
- No marketing language ("industry-leading", "revolutionary", "world-class", "next-generation").
- Palette only: Shadow `#242423`, Graphite `#333533`, Ivory `#E8EDDF`, Dust `#CFDBD5`, Signal `#F5CB5C`. Hex lives only in `app/globals.css` `@theme`. Signal is an accent line/dot, never a fill or body text. Dust on Ivory is ~1.19:1, so muted text on Ivory uses Graphite (Signal text on Ivory fails too — use Signal underlines/dots only). Sharp corners everywhere; the language has no border radii.
- Type: Instrument Sans (headlines, UI; `wdth` axis loaded) and Geist Mono (metadata). Both via `next/font`, `display: "swap"`.
- Reduced motion: every animation added must degrade (`prefers-reduced-motion` → static frame / no anim / instant state).

## Stack

Next.js 16.3.8 App Router, React 19, TypeScript, Tailwind v4. Installed: `gsap` 3.15 + `@gsap/react` (3D transforms use `rotationY`/`rotationX`, never `rotateY`/`rotateX`), `ogl` 1.0.11 (FaultyTerminal only). Not installed: MDX (`next-mdx-remote`, `gray-matter`, `zod`), Lenis, Lucide. **No `motion` package** — CountUp/DecryptedText were hand-adapted (rAF + IntersectionObserver) to avoid it; keep it that way unless asked. No CMS, database, auth, or Three.js.

`next.config.ts` sets `turbopack.root` to `process.cwd()` because `C:\Users\Acer` is a git root. Do not run git commands against that home repo. Do not commit unless Ayush asks.

Dev: the user's own server runs on **port 3456**; a second `npm run dev` fails to bind — verify against 3456 (it can briefly refuse connections mid-recompile; retry before assuming it died). `next.config.ts` sets `allowedDevOrigins: ["192.168.*.*", "169.254.*.*", "10.*.*.*"]` so dev assets load when the site is opened from a phone via the machine's LAN IP (otherwise Next blocks cross-origin `/_next/*` and nothing hydrates — no animations). Gotcha: editing `next.config.ts` while `next dev` runs can auto-restart it **on the default port 3000**; if 3456 goes dead after a config change, kill the 3000 process and restart with `-p 3456`.

Gotchas that bit once: unlayered CSS in `globals.css`/`hero.css` beats Tailwind utilities (the old nav bug: `.nav-toggle { display: inline-flex }` overrode `lg:hidden`; desktop/mobile chrome is a real `@media (min-width: 64rem)` rule). Canvas/GSAP colors cannot parse `var()` — resolve tokens at runtime via `getComputedStyle` with hex only as commented SSR fallbacks. Never read `window` in default parameters (crashes `next build` prerender).

## What is built

### Phase 1 — foundation
App shell, tokens, 12-column `PageGrid`, fonts, skip link, editorial 404. `SiteFooter.tsx`: name, title, links (placeholders render as text, not links, via `resolveExternalHref`), copyright, first Meridian line. `SiteNav.tsx` still on disk (revert path) but superseded by `SiteMenu`.

### Phase 2 — hero (approved; do not restyle)
Three locked lines: `I build` / `Secure` / `Systems.` Ayush's vetoes, still binding: the wireframe object is **edge lines only** (no graphite fills, no scan-line wipe); **no hover flashlight / radial mask / pointer depth** (the signal node only pulses opacity — never scale or translate); the guide/edge dash animation is continuous CSS (`hero-travel`) independent of the GSAP intro; mobile type is `clamp(2.15rem, 10.4vw, 4rem)` under 64rem with focus list + `INDIA / 2026` stacked full width.

Intro (now gated, see Preloader): word-by-word reveal bottom-to-top, `expo.out`, ~1.45s/word, 0.18s stagger, SplitText per `.hero-line`; `SECURE` stretches Instrument `wdth` 75→100 with a hidden sizer preventing shift; coordinate count-up, stroke draw, then metadata/CTAs/status. First visit ~3.2s, return visit compressed to ~1.2s via `sessionStorage["hero-intro"]`. Inline script adds `motion` on `<html>` unless reduced-motion (`suppressHydrationWarning` on `<html>` because of it); hidden states exist only under `html.motion`; a 9s failsafe removes `motion` if GSAP never finishes — do not lower it below intro length.

### Phase 3 — sections 02–07
Rhythm: Hero dark, Work ivory, Profile dark, Experience ivory, Field Notes dark/graphite, Capabilities ivory, Credentials ivory, Contact dark (sections numbered 02–08). Experience (`components/experience/Experience.tsx`, added 2026-10-07): minimal editorial timeline on Ivory — period/role-org/location/status columns, `EXP_01…` mono indices, signal dot for active roles, method of Field Notes-style dimmed placeholder rows (`[ADD ROLE]` etc., `status: "placeholder"`, PENDING chip) until Ayush supplies real entries; optional `tags` render only when real. `.experience-row` reveal in ScrollMotion. Field Notes rows are placeholders (`status: "placeholder"`, dimmed, "COMING SOON", not linked). Capabilities: four groups, no meters; data comment `// Ayush: remove anything you cannot discuss in an interview.` Credentials (`components/credentials/`): bento of **deep brand-coloured tiles** (`CredentialTile.tsx` + `credentials-bento.css`) — Google cert tile gradients from `#174ea6` with a four-colour brand glow; practice tiles from TryHackMe `#231f20` / Hack The Box `#141d2b` / Hacker101 `#1a1a1a`, each with its brand-secondary glow. Real marks in `BrandLogos.tsx`: Google's multicolour G, TryHackMe's cloud (white, via Simple Icons path), HTB's cube (`#9fef00`), Hacker101 wordmark (orange `101`). Text inside tiles is Ivory / white-alpha (never Graphite — tiles are dark); one restrained hover glow, no loops. Google cert is real and verified (Ayush filled the data: Nov 24, Coursera credential URL). Practice platforms link out and remain labelled practice, never certifications. Contact reuses the zoomed isometric visual. Status readout `SYSTEM / OPERATIONAL` lives in the nav only (bar on desktop + menu panel footer after the StaggeredMenu swap) — do not repeat it in the hero or sections.

### Refinement pass (2026-10-04 → 2026-10-07)

**Hero — FaultyTerminal ambient background.** `components/common/FaultyTerminal.tsx` (adapted React Bits, `ogl`) behind the grid at low brightness. Adaptations: TS; SSR-safe dpr; the shader writes opaque pixels so the section background is mixed in-shader (`uBackground` + `clearColor` prop); reduced-motion renders one settled frame; GPU pauses offscreen; array props keyed against GL teardown. Tuned instance in `components/hero/HeroTerminal.tsx`: ivory tint, brightness 0.18, scale 2.75, glitch 0.55, flicker 0.45, scanline 0.45, curvature 0, mouse ripple on — quiet phosphor grain, headline stays dominant.

**Navigation — StaggeredMenu.** `components/navigation/StaggeredMenu.tsx/.css` + `SiteMenu.tsx`; `page.tsx` renders `<SiteMenu />`. Bar identical to the old nav (Shadow, hairline, brand left, status right on desktop); panel is **Ivory with Graphite text**, Signal as underline accents and status dots only; prelayers Graphite+Dust; mono 01–04 numbering. A11y parity with SiteNav: Escape closes (focus returns to toggle), Tab trap while open, closed panel `inert`, click-away closes. Reduced-motion scrubs timelines at 50×. Socials resolve through `resolveExternalHref` — the section stays hidden until the `[ADD …]` links are real, then appears automatically.

**Profile — ProfileCard.** `components/common/ProfileCard.tsx/.css` (adapted React Bits): sharp corners, palette gradient-clipped name/title, holo stripes remapped from purple/blue, hover sheen **capped at 0.45/0.25** (neutral-palette blend layers white out at stock values), signal behind-glow, hairline targeting brackets. Avatar is the real headshot `/public/headshot/headshot.png` (1080×1350), `object-fit: cover`, top-fade mask; the text zone is reserved via `--pc-header-space` (**118px** desktop / 94px ≤768 / 80px ≤480; desktop floor ~112px or the head overlaps the title — Ayush tunes this himself). Handle `@iffayush`, status `OPERATIONAL`, CONTACT scrolls to `/#contact`.

**Profile — section order and compaction (user-specified, both viewports; DOM order = mobile visual order — he rejected `order-*` divergence): masked headlines → ProfileCard → role badge + description → Focus Areas → Meridian.** Compact sizing (the spacier first pass was rejected — do not re-inflate): card 64svh/max 470px (60/410 ≤768, 56/350 ≤480); row gaps `mb-10 lg:mb-12` / `mt-10 lg:mt-12`; Focus Areas a full-width 2×2 hairline band (`lg:col-span-8`) with Meridian bottom-aligned in the right 4 columns. FlickeringGrid was removed here at his request ("looks bad"); `components/common/FlickeringGrid.tsx` and `/public/profile-schematic.svg` are kept unused.

**Work — hover-index redesign.** `components/work/SelectedWork.tsx` + `work.css`. Projects: **Aegis (01, in-progress), AWS Threat Detection (02), WASS (03, carries the "100+ benchmark" metric)** — KNOCK removed entirely. Rows: mono number, uppercase title, Decrypted-Text subtitle scramble, description, tag dots, method-gated CountUp metric, status. Hover: the row inverts to a Shadow strip (Ivory/Dust text), siblings dim to 0.4, title nudges right. Floating preview: real thumbnails from `/public/projects/` (`dashboard_aegis.png` 1155×1040, `aws-architecture.png` 1337×353, `hero_wass.png` 1902×971); card width computed **per image's own ratio** (max 420px / 72vh — he explicitly does not want the images resized), flips near the right edge, lerped cursor follow, mono caption strip; hidden on touch and reduced-motion. `components/common/CountUp.tsx` / `DecryptedText.tsx`: rAF + IntersectionObserver, real text SSR'd + sr-only, one-shot, mono labels only. `MetricValue` parses `"100+"`-style values; non-numeric falls back to plain text. **Rows are not links yet** — they become `<Link href={`/work/${slug}`}>` when Phase 4 lands.

**Preloader gate.** `components/layout/Preloader.tsx/.css` + `lib/preload-gate.ts`, mounted last in `layout.tsx`; `--z-preloader: 60`. Shadow curtain, mono `000→100` counter bottom-right, signal hairline, name + `PORTFOLIO // {year}` top corners. Counter caps at 92 until the window `load` event; 2s floor (`MIN_DURATION`); 6s failsafe (`FORCE_FINISH`). Exit: counter drifts, curtain slides up `power4.inOut`. **`HeroMotion` builds its intro `paused: true` and plays only when `releasePreloadGate()` fires — called as the curtain starts lifting. Any new above-the-fold entrance MUST subscribe via `onPreloadGateRelease`.** Once per session (`sessionStorage["preloader-seen"]`); a pre-paint inline script sets `html[data-preloader="seen"]` so returning visitors never see the SSR'd curtain; noscript CSS hide; reduced-motion skip; blocked-storage fallback — every skip path still releases the gate.

## Do not build yet

Stop after each remaining phase and wait.

### Phase 4 — content routes (next, when Ayush says go)
MDX with `next-mdx-remote/rsc` and `gray-matter`. Zod schema (`lib/content/schema.ts`) before any real content; projects and field notes share a base schema. Project schema: `title, subtitle, description, status(completed|in-progress), tags, results?[{label,value,method}], imageName, imageWidth, imageHeight`. Field note: `title, date, category, status(published|placeholder), summary`. `content/projects/` + `content/field-notes/` seeded from `lib/portfolio-data.ts` (Aegis stays README-accurate; KNOCK does not come back). Templates `app/work/[slug]/page.tsx`, `app/field-notes/[slug]/page.tsx`; empty MDX sections render nothing. `generateStaticParams`, metadata, sitemap, robots, OG images. Then: make Work rows links; menu socials appear once links are real.

### Phase 5 — motion system
`lib/motion.ts`. Lenis + ScrollTrigger. Aperture section transitions, line-mask headings, progress rail, custom cursor, page transitions, signature moments from the original brief §12.5. At most two pinned sections (Profile, AWS flow) with mobile fallbacks. Do not replace the approved hero behavior; the rejected flashlight / fill wipe / pointer depth stay out.

### Phase 6 — QA
Reduced motion, responsive, accessibility, performance, Lighthouse 95+, `grep "\[ADD"` checklist. Report results. Do not invent missing contact details.

## Security posture (2026-10-11 audit)

- **Security headers** via `next.config.ts` `headers()` on every route: strict CSP (self-only; `img-src` allows `images.unsplash.com`; `unsafe-inline` script/style required by Next RSC payload + Tailwind/GSAP runtime styles; dev adds `unsafe-eval` for HMR and drops `upgrade-insecure-requests` so LAN-IP testing works), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geolocation/topics/payment denied), HSTS preload.
- **Secrets**: none exist in the codebase (grepped). `.env.example` documents future keys (mail provider, Turnstile); `.gitignore` already covers `.env*`.
- **Future-form scaffolding** in place for Phase 4: `lib/validation/contact.ts` (zod 4.6.5 schema + honeypot field), `lib/security/sanitize.ts` (escapeHtml/sanitizeText/sanitizeEmail), `lib/security/rate-limit.ts` (in-process sliding window, 5/min default, keyed on client IP — swap for Redis if ever multi-instance). Intended handler is documented in the schema file's comment.
- **`app/global-error.tsx`**: generic root error boundary — no stacks or digests rendered.
- **Dependencies**: all legitimate (next/react/gsap/@gsap/react/ogl/zod/tailwind). `npm audit` reports 5 highs, all in the dev-only lint chain (`braces`→`micromatch`→`fast-glob`→eslint-config-next); `braces@3.0.3` is already the latest published version and the advisory offers no forward fix — its "remedy" downgrades the Next 16 toolchain. Accepted dev-only risk: nothing ships to production from that chain.
- No database, no auth, no user-generated content → SQLi/auth surfaces do not exist yet; the validation layer above is the contract for when they do.

## File map

```text
app/layout.tsx          fonts, metadata, motion-class script, preloader-seen script, <Preloader/>
app/page.tsx            SiteMenu + Hero + ScrollMotion(02–07) + SiteFooter
app/globals.css         tokens, chrome CSS, --z-preloader
app/not-found.tsx
components/common/      FaultyTerminal.tsx/.css  CountUp.tsx  DecryptedText.tsx
                        ProfileCard.tsx/.css  PlaceholderVisual.tsx (unused)  FlickeringGrid.tsx (unused)
components/hero/        Hero.tsx  HeroMotion.tsx (gated)  HeroVisual.tsx  HeroTerminal.tsx  hero.css
components/work/        SelectedWork.tsx  work.css
components/profile/     Profile.tsx
components/navigation/  SiteMenu.tsx  StaggeredMenu.tsx/.css  SiteNav.tsx (unused, revert path)
components/layout/      PageGrid.tsx  SiteFooter.tsx  Preloader.tsx/.css
components/motion/      ScrollMotion.tsx
components/field-notes/ components/capabilities/ components/credentials/ components/contact/
lib/site-config.ts      title, meridian, links, focus, nav, resolveExternalHref
lib/portfolio-data.ts   projects (Aegis/AWS/WASS), field notes, capabilities, credentials, platforms
lib/tokens.ts           CSS variable names only, no hex
lib/preload-gate.ts     preloader → hero intro release signal
public/headshot/headshot.png          1080×1350
public/projects/dashboard_aegis.png    1155×1040
public/projects/aws-architecture.png   1337×353
public/projects/hero_wass.png          1902×971
public/profile-schematic.svg           (unused)
next.config.ts          turbopack.root
```

Not created yet: `content/`, `lib/content/`, `lib/motion.ts`, project/field-note routes, sitemap, robots.

## Content still missing

**None — all placeholders are resolved.** Ayush filled the contact links themselves (as bare domains, e.g. `linkedin.com/in/iffayush`); `resolveExternalHref` in `lib/site-config.ts` now auto-prepends `https://` for bare domains and `mailto:` for bare addresses, so Contact cards, footer links, and the StaggeredMenu socials section all render as live links. The single remaining `grep "\[ADD"` match is the literal inside that resolver's placeholder guard, not content. Any project `results` values still need their `method`.
