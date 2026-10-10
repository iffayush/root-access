"use client";

import { useMemo } from "react";
import { FaultyTerminal } from "@/components/common/FaultyTerminal";

/**
 * Hero ambient layer. Canvas colors are resolved from the CSS tokens at
 * runtime (canvas cannot parse var()); the hex fallbacks mirror
 * app/globals.css and are used for the server render only.
 */
function useTokenColor(token: string, fallback: string) {
  return useMemo(() => {
    if (typeof window === "undefined") return fallback;
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    return value || fallback;
  }, [token, fallback]);
}

export function HeroTerminal() {
  const tint = useTokenColor("--color-ivory", "#e8eddf");
  const background = useTokenColor("--color-shadow-grey", "#242423");

  return (
    <FaultyTerminal
      scale={2.75}
      gridMul={[2, 1]}
      digitSize={1.3}
      timeScale={0.4}
      scanlineIntensity={0.45}
      glitchAmount={0.55}
      flickerAmount={0.45}
      noiseAmp={0.9}
      curvature={0}
      chromaticAberration={0}
      dither={0}
      tint={tint}
      mouseReact
      mouseStrength={0.3}
      pageLoadAnimation
      brightness={0.18}
      clearColor={background}
    />
  );
}
