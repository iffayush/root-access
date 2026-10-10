"use client";

import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds before the count starts after entering the viewport. */
  delay?: number;
  decimals?: number;
  separator?: string;
  className?: string;
}

function formatValue(
  value: number,
  decimals: number,
  separator: string
): string {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: !!separator,
  };
  const formatted = new Intl.NumberFormat("en-US", options).format(value);
  return separator ? formatted.replace(/,/g, separator) : formatted;
}

/**
 * Adapted from React Bits' CountUp (reactbits.dev, MIT).
 * Local changes: the `motion` dependency is replaced with a rAF ease-out-expo
 * loop and an IntersectionObserver; the final value is rendered server-side
 * so the metric stays honest without JavaScript; reduced motion renders the
 * final value with no animation.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  delay = 0,
  decimals = 0,
  separator = "",
  className,
}: CountUpProps) {
  const valueRef = useRef<HTMLSpanElement>(null);

  const finalText = formatValue(to, decimals, separator);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = finalText;
      return;
    }

    let raf = 0;
    let started = false;
    let observer: IntersectionObserver | null = null;

    const animate = () => {
      const startTime = performance.now() + delay * 1000;
      const tick = (now: number) => {
        const progress = Math.min(
          Math.max((now - startTime) / (duration * 1000), 0),
          1
        );
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = formatValue(from + (to - from) * eased, decimals, separator);
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer?.disconnect();
        animate();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration, delay, decimals, separator, finalText]);

  return (
    <span className={className}>
      <span className="sr-only">{finalText}</span>
      <span ref={valueRef} aria-hidden="true">
        {finalText}
      </span>
    </span>
  );
}
