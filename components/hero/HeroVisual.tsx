"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

/**
 * Swap point for the hero object.
 * /public/images/hero/hero-architecture.webp
 */
export function HeroVisual() {
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

          // Subtle interactive 3D perspective tilt
          xTo(percentX * 9);
          yTo(-percentY * 9);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        const parent = scope.closest(".hero-visual") || scope;
        parent.addEventListener("mousemove", handleMouseMove as EventListener);
        parent.addEventListener("mouseleave", handleMouseLeave as EventListener);

        return () => {
          parent.removeEventListener("mousemove", handleMouseMove as EventListener);
          parent.removeEventListener("mouseleave", handleMouseLeave as EventListener);
        };
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="hero-object transition-transform duration-200 ease-out will-change-transform"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <svg
        className="hero-wire"
        viewBox="0 0 560 560"
        role="img"
        aria-label="Stepped isometric security architecture volume with telemetry signal node"
      >
        <Guides />

        {/* Structural Isometric Volume Tiers */}
        {/* Tier 1: Ingress Base Volume */}
        <StrokeTier
          depth="1"
          top="M250,324L423.2,424L293.3,499L120.1,399Z"
          left="M250,360L250,324L120.1,399L120.1,435Z"
          right="M120.1,435L293.3,535L293.3,499L120.1,399Z"
        />

        {/* Vertical Structural Risers (Connecting Base to Tier 2) */}
        <g stroke="var(--color-dust)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6">
          <line x1="250" y1="324" x2="255.2" y2="275" />
          <line x1="423.2" y1="424" x2="376.4" y2="345" />
          <line x1="293.3" y1="499" x2="293.3" y2="393" />
          <line x1="120.1" y1="399" x2="172.1" y2="323" />
        </g>

        {/* Tier 2: Core Security Engine Volume */}
        <StrokeTier
          depth="2"
          top="M255.2,275L376.4,345L293.3,393L172.1,323Z"
          left="M255.2,349L255.2,275L172.1,323L172.1,397Z"
          right="M172.1,397L293.3,467L293.3,393L172.1,323Z"
        />

        {/* Vertical Structural Risers (Connecting Tier 2 to Tier 3 Apex) */}
        <g stroke="var(--color-dust)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.7">
          <line x1="255.2" y1="275" x2="262.1" y2="239" />
          <line x1="376.4" y1="345" x2="322.7" y2="274" />
          <line x1="293.3" y1="393" x2="281.2" y2="298" />
          <line x1="172.1" y1="323" x2="220.6" y2="263" />
        </g>

        {/* Tier 3: Apex Detection Vault Volume */}
        <StrokeTier
          depth="3"
          top="M262.1,239L322.7,274L281.2,298L220.6,263Z"
          left="M262.1,305L262.1,239L220.6,263L220.6,329Z"
          right="M220.6,329L281.2,364L281.2,298L220.6,263Z"
        />

        {/* Vertex Telemetry Nodes */}
        <g fill="var(--color-dust)">
          <circle cx="250" cy="324" r="2" />
          <circle cx="423.2" cy="424" r="2" />
          <circle cx="293.3" cy="499" r="2" />
          <circle cx="120.1" cy="399" r="2" />
          <circle cx="255.2" cy="275" r="2" />
          <circle cx="376.4" cy="345" r="2" />
          <circle cx="172.1" cy="323" r="2" />
          <circle cx="262.1" cy="239" r="2" />
          <circle cx="220.6" cy="263" r="2" />
          <circle cx="281.2" cy="298" r="2" />
        </g>

        {/* Signal Apex Telemetry Ring & Pulse Node */}
        <ellipse
          cx="322.7"
          cy="274"
          rx="14"
          ry="8"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="0.8"
          strokeDasharray="4 2"
          opacity="0.7"
        />
        <circle className="hero-signal" cx="322.7" cy="274" r="4.5" fill="var(--color-signal)" />

        {/* Axis Target Coordinate Tags */}
        <Coord className="hero-coord" x="36" y="48" axis="X" target="200" />
        <Coord className="hero-coord" x="400" y="48" axis="Y" target="176" />
        <Coord className="hero-coord" x="36" y="530" axis="Z" target="150" />
      </svg>
    </div>
  );
}

function StrokeTier({ depth, top, left, right }: { depth: string; top: string; left: string; right: string }) {
  return (
    <g className="hero-depth" data-depth={depth}>
      <g className="hero-stroke" fill="none" stroke="var(--color-dust)" strokeWidth="1.25">
        <path pathLength={1} d={top} />
        <path pathLength={1} d={left} />
        <path pathLength={1} d={right} />
      </g>
      <g className="hero-edge-live" fill="none" stroke="var(--color-ivory)" strokeWidth="1.25">
        <path pathLength={1} d={top} />
        <path pathLength={1} d={left} />
        <path pathLength={1} d={right} />
      </g>
    </g>
  );
}

function Guides() {
  const vertical = [80, 160, 240, 320, 400, 480];
  const horizontal = [70, 150, 230, 310, 390, 470];

  return (
    <g className="hero-guides" stroke="var(--color-dust)" strokeWidth="0.7">
      {vertical.map((x) => (
        <line key={`v-${x}`} className="hero-guide" pathLength={1} x1={x} y1="28" x2={x} y2="532" />
      ))}
      {horizontal.map((y) => (
        <line key={`h-${y}`} className="hero-guide" pathLength={1} x1="28" y1={y} x2="532" y2={y} />
      ))}
      {vertical.map((x) => (
        <line key={`vl-${x}`} className="hero-guide-live" pathLength={1} x1={x} y1="28" x2={x} y2="532" />
      ))}
      {horizontal.map((y) => (
        <line key={`hl-${y}`} className="hero-guide-live" pathLength={1} x1="28" y1={y} x2="532" y2={y} />
      ))}
    </g>
  );
}

function Coord({
  className,
  x,
  y,
  axis,
  target,
  revealed = false,
}: {
  className: string;
  x: number | string;
  y: number | string;
  axis: string;
  target: string;
  revealed?: boolean;
}) {
  const label = revealed ? `${axis} ${target.padStart(3, "0")}.000` : `${axis} 000.000`;

  return (
    <text
      className={className}
      data-axis={axis}
      data-target={target}
      x={x}
      y={y}
      fill="var(--color-dust)"
      fontSize="11"
      fontFamily="var(--font-mono)"
    >
      {label}
    </text>
  );
}
