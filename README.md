<div align="center">

# AYUSH KUMAR

**CYBERSECURITY ENGINEER**

*I build secure systems. I break the rest first.*

[**iffayush.dev**](https://iffayush.dev) — live, static, HTTPS-only. View-source is part of the tour.

![Next.js](https://img.shields.io/badge/Next.js-16-242423?style=for-the-badge&logo=nextdotjs&logoColor=e8eddf)
![React](https://img.shields.io/badge/React-19-242423?style=for-the-badge&logo=react&logoColor=e8eddf)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-242423?style=for-the-badge&logo=typescript&logoColor=e8eddf)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-242423?style=for-the-badge&logo=tailwindcss&logoColor=e8eddf)
![GSAP](https://img.shields.io/badge/GSAP-3.15-242423?style=for-the-badge&logo=greensock&logoColor=e8eddf)
![Zod](https://img.shields.io/badge/Zod-4-242423?style=for-the-badge&logo=zod&logoColor=e8eddf)

</div>

---

## / 01 — WHY THIS EXISTS

Most security portfolios tell you what someone knows. This one shows it — the site is the artifact.

Every pixel is hand-placed against a five-colour palette, every animation degrades under `prefers-reduced-motion`, and the whole thing prerenders to static HTML with a security-header set I'd be comfortable defending in a review. The attack surface is the size of a postcard, because I kept it that way on purpose.

## / 02 — THE STACK, AND WHY

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 16, App Router** | Static-first. Every route prerendered; the server mostly says 200. |
| UI | **React 19 + TypeScript (strict)** | Strict mode catches the bugs I'd otherwise find in a code review. |
| Styling | **Tailwind v4, `@theme` tokens** | Five palette tokens, defined once. Hex values live in one file or they don't live. |
| Motion | **GSAP 3.15 + SplitText** | Choreographed intro, scroll reveals, and a `sessionStorage` gate that compresses the intro from 3.2s → 1.2s on return visits. |
| Shaders | **ogl** | Custom GLSL fragment shader for the CRT terminal field. Hand-tuned to brightness 0.18 — ambient, not art school. |
| Validation | **Zod 4** | Server-authority schemas for the form endpoint that's coming. The client doesn't get a vote. |
| Hosting | **Vercel** | Auto-HTTPS (mandatory on `.dev`), auto-scaling, and it serves my security headers without argument. |

## / 03 — FIELD NOTES FROM THE BUILD

- **Preload gate.** A curtain counts *real* page load (capped at 92% until the browser's `load` event fires) and releases the hero intro as it starts lifting. The reveal is seamless because the intro timeline is literally paused behind it.
- **Holographic operator card.** A tilt-card with the brand's holo treatment remapped from the stock purple/blue into a five-colour palette. Lesson learned the hard way: neutral-palette colours compound through `color-dodge`/`luminosity` blend modes and white out at stock filter values. Opacity caps exist for a reason.
- **Work index, not cards.** Rows invert to dark on hover while a floating preview trails the cursor, sized to each project image's native ratio. No image gets cropped, squashed, or "optimised" into a lie.
- **Zero-dependency motion utilities.** Count-up metrics and decrypted-text labels hand-rolled with `requestAnimationFrame` + `IntersectionObserver` instead of shipping a 30KB animation runtime for two effects. Dependency lists are attack surface too.
- **First paint, choreographed.** Fonts self-hosted, WebGL initialized behind a preload curtain, and a `sessionStorage` gate keeps the intro from playing twice. Your GPU rests when the tab scrolls away — `IntersectionObserver` pauses the render loop.

## / 04 — RUN IT LOCALLY

```bash
git clone https://github.com/iffayush/root-access.git
cd root-access
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First visit plays the full intro; the same tab remembers you and compresses it — like any good recon cache.

Production build: `npm run build && npm start`.

## / 05 — SECURITY POSTURE

- **Headers on every route**: Content-Security-Policy, `X-Frame-Options: DENY`, `nosniff`, HSTS (preload), `Referrer-Policy`, `Permissions-Policy` locking camera/mic/geolocation. Defined in `next.config.ts`, no CDN config required.
- **No secrets in the repo.** `.env.example` documents the keys future features will need; `.gitignore` covers the rest.
- **One tracker, on purpose: Vercel's cookieless, first-party page counter.** No cookies, no fingerprinting, no third-party scripts — the analytics script is served from this site's own origin and passes its own CSP.
- **The contact form doesn't exist yet.** When it does, it ships behind a Zod schema, a 5 req/min per-IP rate limiter, a honeypot field, and server-side sanitization — the scaffolding is already in `lib/security/` and `lib/validation/`.
- Current threat model: static HTML, self-hosted assets, three outbound links. I keep the postcard small on purpose.

## / 06 — REPO MAP

```text
app/                  Routes, layout, security headers
components/
  common/             Adapted open-source primitives (profile card, WebGL terminal, counters)
  hero/               The intro: word reveal, isometric visual, gated timeline
  work/               Hover-index project rows + floating previews
  profile/            Operator card, focus areas
  experience/         Timeline rows
  credentials/        Deep-brand bento with real vendor marks
  navigation/         Staggered-menu navigation
  layout/             Page grid, footer, preload curtain
  motion/             GSAP scroll choreography
lib/
  site-config.ts      Single source of truth for identity + links
  portfolio-data.ts   Projects, experience, credentials — data, not markup
  security/           Sanitization + rate limiting (server-side patterns)
  validation/         Zod schemas
  preload-gate.ts     Curtain → hero intro handshake
```

## / 07 — CONTACT

The point of all this.

[![Email](https://img.shields.io/badge/Email-iffayush.work%40gmail.com-242423?style=for-the-badge&logo=gmail&logoColor=f5cb5c)](mailto:iffayush.work@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-in%2Fiffayush-242423?style=for-the-badge&logo=linkedin&logoColor=f5cb5c)](https://linkedin.com/in/iffayush)
[![GitHub](https://img.shields.io/badge/GitHub-iffayush-242423?style=for-the-badge&logo=github&logoColor=f5cb5c)](https://github.com/iffayush)

---

<div align="center">

**© 2026 Ayush Kumar** · Designed and engineered by hand.

*Found something? It's a static site — but if you did it in an interesting way, I want to hear about it.*

</div>
