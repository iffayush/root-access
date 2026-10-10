"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARACTERS = "!<>-_\\/[]{}=+*^?#01";

interface DecryptedTextProps {
  text: string;
  /** Milliseconds between scramble ticks. */
  speed?: number;
  /** Extra ticks each character stays scrambled before resolving. */
  maxIterations?: number;
  characters?: string;
  className?: string;
}

/**
 * Adapted from React Bits' DecryptedText (reactbits.dev, MIT).
 * Local changes: the `motion` dependency is removed; the real text renders
 * server-side (and for screen readers via sr-only) with the scramble as an
 * aria-hidden overlay that runs once when the element enters the viewport;
 * reduced motion never scrambles. Best paired with a fixed-width (mono) font
 * so glyph swapping does not shift layout.
 */
export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 2,
  characters = DEFAULT_CHARACTERS,
  className,
}: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    let interval: number | undefined;
    let started = false;
    let observer: IntersectionObserver | null = null;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer?.disconnect();

        let tick = 0;
        interval = window.setInterval(() => {
          tick += 1;
          let revealed = 0;
          let output = "";
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === " " || tick >= i + 1 + maxIterations) {
              output += char;
              revealed += 1;
            } else {
              output +=
                characters[Math.floor(Math.random() * characters.length)];
            }
          }
          setDisplay(output);
          if (revealed === text.length) {
            window.clearInterval(interval);
            setDisplay(text);
          }
        }, speed);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);

    return () => {
      observer?.disconnect();
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [text, speed, maxIterations, characters]);

  return (
    <span className={className} ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
