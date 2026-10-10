"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * Fragmented / zoomed form of the isometric hero visual for the Contact section.
 * Features smooth interactive 3D mouse perspective tilt.
 */
export function ContactVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const xTo = gsap.quickTo(scope, "rotationY", { duration: 0.6, ease: "power2.out" });
        const yTo = gsap.quickTo(scope, "rotationX", { duration: 0.6, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = scope.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const percentX = (e.clientX - centerX) / (rect.width / 2);
          const percentY = (e.clientY - centerY) / (rect.height / 2);

          xTo(percentX * 8);
          yTo(-percentY * 8);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        scope.addEventListener("mousemove", handleMouseMove as EventListener);
        scope.addEventListener("mouseleave", handleMouseLeave as EventListener);

        return () => {
          scope.removeEventListener("mousemove", handleMouseMove as EventListener);
          scope.removeEventListener("mouseleave", handleMouseLeave as EventListener);
        };
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-square max-w-lg mx-auto flex items-center justify-center p-4 border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--color-shadow-grey)_80%,transparent)] transition-transform duration-200 ease-out will-change-transform"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        role="img"
        aria-label="Zoomed isometric wireframe structure targeting signal contact node"
      >
        {/* Background Guide Lines */}
        <g stroke="var(--color-dust)" strokeWidth="0.6" opacity="0.4">
          <line x1="40" y1="40" x2="40" y2="360" strokeDasharray="3 3" />
          <line x1="120" y1="40" x2="120" y2="360" strokeDasharray="3 3" />
          <line x1="200" y1="40" x2="200" y2="360" />
          <line x1="280" y1="40" x2="280" y2="360" strokeDasharray="3 3" />
          <line x1="360" y1="40" x2="360" y2="360" strokeDasharray="3 3" />

          <line x1="40" y1="100" x2="360" y2="100" strokeDasharray="3 3" />
          <line x1="40" y1="200" x2="360" y2="200" />
          <line x1="40" y1="300" x2="360" y2="300" strokeDasharray="3 3" />
        </g>

        {/* Zoomed Fragmented Wireframe Tier */}
        <g stroke="var(--color-dust)" strokeWidth="1.25" fill="none">
          {/* Upper Polygon */}
          <polygon points="200,80 320,150 200,220 80,150" />
          {/* Lower Extension */}
          <line x1="80" y1="150" x2="80" y2="250" />
          <line x1="200" y1="220" x2="200" y2="320" />
          <line x1="320" y1="150" x2="320" y2="250" />
          <polygon points="200,320 320,250 80,250" strokeDasharray="4 4" />
        </g>

        {/* Live Highlight Edge */}
        <g stroke="var(--color-ivory)" strokeWidth="1.25" fill="none">
          <polyline points="80,150 200,220 320,150" />
          <line x1="200" y1="220" x2="200" y2="320" />
        </g>

        {/* Signal Node (Contact Node) */}
        <circle cx="200" cy="220" r="6" fill="var(--color-signal)" />
        <circle
          cx="200"
          cy="220"
          r="14"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="0.8"
          opacity="0.6"
          className="animate-ping"
        />

        {/* Axis Target Overlay */}
        <text
          x="220"
          y="215"
          fill="var(--color-signal)"
          fontSize="11"
          fontFamily="var(--font-mono)"
          letterSpacing="0.1em"
        >
          NODE_COMM // CONNECT
        </text>

        <text x="48" y="64" fill="var(--color-dust)" fontSize="10" fontFamily="var(--font-mono)">
          X 200.000
        </text>
        <text x="300" y="64" fill="var(--color-dust)" fontSize="10" fontFamily="var(--font-mono)">
          Y 176.000
        </text>
        <text x="48" y="345" fill="var(--color-dust)" fontSize="10" fontFamily="var(--font-mono)">
          Z 150.000
        </text>
      </svg>
    </div>
  );
}
