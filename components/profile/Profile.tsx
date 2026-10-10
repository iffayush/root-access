"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProfileCard } from "@/components/common/ProfileCard";
import { PageGrid } from "@/components/layout/PageGrid";
import { resolveExternalHref, siteConfig } from "@/lib/site-config";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CUBIC_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

function MeridianLine() {
  const { label, url } = siteConfig.meridian;
  const href = url ? resolveExternalHref(url) : null;

  if (href) {
    return (
      <a
        className="inline-block font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase hover:text-[var(--color-signal)] transition-colors"
        href={href}
      >
        {label} ↗
      </a>
    );
  }

  return (
    <p className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
      {label}
    </p>
  );
}

export function Profile() {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const handleContactClick = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }, []);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance Choreography & Masked Typography Reveal Timeline
        const headlineTexts = scope.querySelectorAll<HTMLElement>(".profile-line-text");
        const staggerItems = scope.querySelectorAll<HTMLElement>(".profile-stagger-item");
        const headerReadout = scope.querySelector<HTMLElement>(".profile-header");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        // Header Readout Reveal
        if (headerReadout) {
          tl.fromTo(
            headerReadout,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.9, ease: CUBIC_EASE },
            0
          );
        }

        // Masked Typography Reveal (Y 100% + 4deg rotation -> Y 0% + 0deg rotation)
        if (headlineTexts.length > 0) {
          tl.fromTo(
            headlineTexts,
            { yPercent: 120, rotate: 4, opacity: 0 },
            {
              yPercent: 0,
              rotate: 0,
              opacity: 1,
              duration: 1.1,
              ease: CUBIC_EASE,
              stagger: 0.12,
            },
            0.1
          );
        }

        // Subtext & Focus Tags Ripple Entrance (0.07s micro-stagger)
        if (staggerItems.length > 0) {
          tl.fromTo(
            staggerItems,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: CUBIC_EASE,
              stagger: 0.07,
            },
            0.4
          );
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="profile"
      className="bg-[var(--color-shadow-grey)] text-[var(--color-ivory)] py-24 sm:py-32 border-b border-[var(--hairline)] overflow-hidden"
    >
      <PageGrid className="mb-12">
        <div className="profile-header col-span-12 flex items-center justify-between border-b border-[var(--hairline)] pb-4 will-change-[transform,opacity]">
          <span className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
            03 / PROFILE
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
            {siteConfig.location} // {siteConfig.year}
          </span>
        </div>
      </PageGrid>

      {/* Row 1 — Masked Typography Headlines */}
      {/* <PageGrid className="mb-10 lg:mb-12">
        <div className="col-span-12">
          <h2 className="font-sans text-4xl sm:text-6xl font-bold tracking-tight uppercase leading-[0.95] space-y-2">
            <div className="overflow-hidden py-1">
              <span className="profile-line-text block text-[var(--color-ivory)] will-change-[transform,opacity] origin-left">
                I BUILD.
              </span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="profile-line-text block text-[var(--color-dust)] will-change-[transform,opacity] origin-left">
                I BREAK.
              </span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="profile-line-text block text-[var(--color-ivory)] will-change-[transform,opacity] origin-left">
                I ANALYZE.
              </span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="profile-line-text block text-[var(--color-signal)] will-change-[transform,opacity] origin-left">
                I SECURE.
              </span>
            </div>
          </h2>
        </div>
      </PageGrid> */}

      {/* Row 2 — Operator ID Card / Narrative (card first on every viewport) */}
      <PageGrid className="items-center gap-y-10">
        <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-start">
          <div className="profile-stagger-item profile-card-mount will-change-[transform,opacity]">
            <ProfileCard
              name={siteConfig.name}
              title={siteConfig.title}
              handle="iffayush"
              status="OPERATIONAL"
              contactText="CONTACT"
              avatarUrl="/headshot/headshot.png"
              showUserInfo
              enableTilt={!reducedMotion}
              behindGlowEnabled
              behindGlowColor="rgba(245, 203, 92, 0.28)"
              innerGradient="linear-gradient(145deg, rgba(51, 53, 51, 0.5) 0%, rgba(207, 219, 213, 0.22) 100%)"
              onContactClick={handleContactClick}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 flex flex-col space-y-5 lg:pl-6">
          <div className="profile-stagger-item inline-block self-start font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] px-2.5 py-1 border border-[color-mix(in_srgb,var(--color-signal)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] will-change-[transform,opacity]">
            {siteConfig.title}
          </div>

          <p className="profile-stagger-item font-sans text-lg sm:text-xl leading-relaxed text-[var(--color-ivory)] will-change-[transform,opacity]">
            Ayush Kumar is a cybersecurity-focused B.Tech IT student based in India. He specializes in application security, cloud security, dynamic vulnerability scanning, and security automation.
          </p>

          <p className="profile-stagger-item font-sans text-base leading-relaxed text-[var(--color-dust)] will-change-[transform,opacity]">
            His work centers on engineering resilient defensive tooling, conducting thorough application security evaluations, and building automated threat detection pipelines across modern cloud and hybrid environments.
          </p>
        </div>
      </PageGrid>

      {/* Row 3 — Focus Areas band + Meridian */}
      <PageGrid className="mt-10 lg:mt-12 items-end gap-y-8">
        <div className="col-span-12 lg:col-span-8">
          <p className="profile-stagger-item mb-3 font-mono text-xs tracking-widest uppercase text-[var(--color-dust)] will-change-[transform,opacity]">
            FOCUS AREAS
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-y border-[var(--hairline)]">
            {siteConfig.focusAreas.map((area) => (
              <li
                key={area}
                className="profile-stagger-item flex items-center gap-3 py-3.5 font-mono text-xs tracking-wider text-[var(--color-ivory)] uppercase will-change-[transform,opacity]"
              >
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-[var(--color-signal)]" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Second and final Meridian Studio placement */}
        {/* <div className="profile-stagger-item col-span-12 lg:col-span-4 lg:pl-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-[var(--hairline)] will-change-[transform,opacity]">
          <MeridianLine />
        </div> */}
      </PageGrid>
    </section>
  );
}
