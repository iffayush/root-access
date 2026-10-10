"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { releasePreloadGate } from "@/lib/preload-gate";
import { siteConfig } from "@/lib/site-config";
import "./Preloader.css";

/** Minimum time the counter runs, even when everything loads instantly. */
const MIN_DURATION = 2000;
/** Failsafe: treat the page as loaded after this long, whatever is pending. */
const FORCE_FINISH = 6000;

/**
 * Preload curtain — counts real page load (capped at 92% until the load
 * event), then slides up and releases the hero intro gate as it moves.
 * Shows once per session; skipped entirely for reduced-motion users and
 * hidden pre-hydration via the inline script + `data-preloader` in layout.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const markSeen = () => {
      try {
        sessionStorage.setItem("preloader-seen", "1");
      } catch {
        // Session storage can be blocked; the gate still releases.
      }
    };

    const seen = (() => {
      try {
        return sessionStorage.getItem("preloader-seen") === "1";
      } catch {
        return true;
      }
    })();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) {
      markSeen();
      releasePreloadGate();
      setGone(true);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener("load", onLoad);
    const forceTimer = window.setTimeout(() => {
      loaded = true;
    }, FORCE_FINISH);

    let finished = false;
    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      window.clearTimeout(forceTimer);
      window.removeEventListener("load", onLoad);
      if (counterRef.current) counterRef.current.textContent = "100";

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = prevOverflow;
          setGone(true);
        },
      });
      // The gate releases as the curtain starts moving, so the hero intro
      // begins underneath and is revealed mid-motion.
      tl.to(counterRef.current, {
        yPercent: -70,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      }).to(
        rootRef.current,
        {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
          onStart: () => {
            document.body.style.overflow = prevOverflow;
            markSeen();
            releasePreloadGate();
          },
        },
        0.32
      );
    };

    const start = performance.now();
    let last = start;
    let display = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (cancelled || finished) return;
      const elapsed = now - start;
      const timeProgress = Math.min(elapsed / MIN_DURATION, 1);
      const target =
        loaded && timeProgress >= 1 ? 100 : Math.min(timeProgress * 100, 92);

      const dt = Math.max(now - last, 0) / 1000;
      last = now;
      display += (target - display) * Math.min(1, dt * 6);
      if (target - display < 0.2) display = target;

      if (counterRef.current) {
        counterRef.current.textContent = String(
          Math.round(Math.min(display, 100))
        ).padStart(3, "0");
      }
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${Math.min(display, 100) / 100})`;
      }

      if (display >= 99.5) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(forceTimer);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="preloader-brand">
        <span>{siteConfig.name}</span>
        <span>
          PORTFOLIO // {siteConfig.year}
        </span>
      </div>
      <span ref={counterRef} className="preloader-counter">
        000
      </span>
      <div ref={lineRef} className="preloader-line" />
    </div>
  );
}
