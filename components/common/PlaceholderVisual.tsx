"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ComponentProps } from "react";

interface PlaceholderVisualProps extends ComponentProps<"div"> {
  filename: string;
  title?: string;
  theme?: "dark" | "light";
  aspectRatio?: string;
}

export function PlaceholderVisual({
  filename,
  title,
  theme = "light",
  aspectRatio = "16/10",
  className = "",
  ...props
}: PlaceholderVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const xTo = gsap.quickTo(scope, "rotationY", { duration: 0.5, ease: "power2.out" });
        const yTo = gsap.quickTo(scope, "rotationX", { duration: 0.5, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = scope.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const percentX = (e.clientX - centerX) / (rect.width / 2);
          const percentY = (e.clientY - centerY) / (rect.height / 2);

          // Smooth 3D perspective tilt
          xTo(percentX * 7);
          yTo(-percentY * 7);
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

  const strokeColor = isDark ? "var(--color-dust)" : "var(--color-graphite)";
  const textColor = isDark ? "var(--color-dust)" : "var(--color-graphite)";
  const labelColor = isDark ? "var(--color-ivory)" : "var(--color-shadow-grey)";
  const bgColor = isDark ? "var(--color-shadow-grey)" : "var(--color-ivory)";
  const borderColor = isDark
    ? "color-mix(in srgb, var(--color-dust) 25%, transparent)"
    : "color-mix(in srgb, var(--color-graphite) 25%, transparent)";

  const isWass = filename.includes("wass");
  const isAws = filename.includes("aws");
  const isKnock = filename.includes("knock");

  return (
    <div
      ref={containerRef}
      className={`group/visual relative overflow-hidden flex flex-col justify-between border transition-all duration-300 ease-out will-change-transform hover:border-[var(--color-shadow-grey)] hover:shadow-lg ${className}`}
      style={{
        aspectRatio,
        backgroundColor: bgColor,
        borderColor: borderColor,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      {...props}
    >
      {/* Top Telemetry Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[color-mix(in_srgb,var(--color-graphite)_15%,transparent)] font-mono text-[10px] tracking-widest uppercase bg-[color-mix(in_srgb,var(--color-graphite)_4%,transparent)]">
        <span style={{ color: textColor }} className="font-semibold">
          {isWass
            ? "[ SCHEMATIC // DAST SCANNER ENGINE ]"
            : isAws
            ? "[ SCHEMATIC // THREAT PIPELINE ]"
            : isKnock
            ? "[ SCHEMATIC // WAF EDGE TOPOLOGY ]"
            : "[ SCHEMATIC // ARCHITECTURE ]"}
        </span>
        <span className="flex items-center gap-1.5" style={{ color: textColor }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal)] animate-ping" />
          <span className="text-[var(--color-shadow-grey)] font-medium">LIVE TELEMETRY</span>
        </span>
      </div>

      {/* Main Diagram Viewport (100% Unobstructed!) */}
      <div className="relative flex-1 w-full h-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center p-4">
        {/* Animated Laser Scanning Beam on Hover */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-signal)] to-transparent opacity-0 group-hover/visual:opacity-100 group-hover/visual:animate-[scan_2.5s_linear_infinite] pointer-events-none z-20" />

        <svg
          className="w-full h-full pointer-events-none"
          viewBox="0 0 500 240"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Technical Grid Lines */}
          <g stroke={strokeColor} strokeWidth="0.5" opacity="0.25">
            <line x1="0" y1="60" x2="500" y2="60" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="500" y2="120" strokeDasharray="4 4" />
            <line x1="0" y1="180" x2="500" y2="180" strokeDasharray="4 4" />
            <line x1="125" y1="0" x2="125" y2="240" strokeDasharray="4 4" />
            <line x1="250" y1="0" x2="250" y2="240" strokeDasharray="4 4" />
            <line x1="375" y1="0" x2="375" y2="240" strokeDasharray="4 4" />
          </g>

          {/* Project Schematics */}
          {isWass && <WassBlueprintDiagram stroke={strokeColor} textCol={labelColor} />}
          {isAws && <AwsBlueprintDiagram stroke={strokeColor} textCol={labelColor} />}
          {isKnock && <KnockBlueprintDiagram stroke={strokeColor} textCol={labelColor} />}

          {!isWass && !isAws && !isKnock && (
            <GenericBlueprintDiagram stroke={strokeColor} textCol={labelColor} />
          )}
        </svg>
      </div>

      {/* Bottom Telemetry Footer (No text overlap over diagram!) */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-t border-[color-mix(in_srgb,var(--color-graphite)_15%,transparent)] font-mono text-[10px] tracking-widest uppercase bg-[color-mix(in_srgb,var(--color-graphite)_4%,transparent)]">
        <span style={{ color: textColor }} className="truncate max-w-[260px]">
          FILE: {filename}
        </span>
        <span style={{ color: textColor }} className="shrink-0">
          SYS_STATUS: OPTIMAL
        </span>
      </div>
    </div>
  );
}

function WassBlueprintDiagram({ stroke, textCol }: { stroke: string; textCol: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="1">
      {/* Target Web App Node */}
      <rect x="35" y="65" width="105" height="110" strokeWidth="1.2" rx="2" />
      <rect x="42" y="72" width="91" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <circle cx="50" cy="80" r="2.5" fill={stroke} />
      <circle cx="58" cy="80" r="2.5" fill={stroke} />
      <circle cx="66" cy="80" r="2.5" fill={stroke} />
      <text x="50" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        TARGET APP
      </text>
      <text x="50" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        JUICE SHOP / DAST
      </text>
      <text x="50" y="145" fill="var(--color-signal)" fontSize="8" fontFamily="var(--font-mono)">
        • PORT 443 HTTPS
      </text>

      {/* DAST Payload Injector Hub (Diamond Core) */}
      <polygon points="250,45 335,120 250,195 165,120" strokeWidth="1.2" />
      <circle
        cx="250"
        cy="120"
        r="22"
        stroke="var(--color-signal)"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        className="animate-spin"
        style={{ transformOrigin: "250px 120px", animationDuration: "12s" }}
      />
      <text x="202" y="116" fill={textCol} fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
        PAYLOAD INJECTOR
      </text>
      <text x="210" y="132" fill="var(--color-signal)" fontSize="8" fontFamily="var(--font-mono)">
        XSS / SQLi / CSRF
      </text>

      {/* Vulnerability Reporter Vault Node */}
      <rect x="360" y="65" width="105" height="110" strokeWidth="1.2" rx="2" />
      <rect x="367" y="72" width="91" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="375" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        REPORT VAULT
      </text>
      <text x="375" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        VULN FINDINGS
      </text>
      <text x="375" y="145" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        STRUCTURED JSON
      </text>

      {/* Connection Vectors with Moving Particles */}
      <path d="M140 120 H165" strokeWidth="1.2" strokeDasharray="4 3" />
      <path d="M335 120 H360" strokeWidth="1.2" strokeDasharray="4 3" />

      {/* Animated Data Travel Particles */}
      <circle cx="152" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />
      <circle cx="347" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />

      {/* Central Signal Pulse */}
      <circle cx="250" cy="120" r="5" fill="var(--color-signal)" stroke="none" />
    </g>
  );
}

function AwsBlueprintDiagram({ stroke, textCol }: { stroke: string; textCol: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="1">
      {/* Log Ingestion Node */}
      <rect x="35" y="65" width="105" height="110" strokeWidth="1.2" rx="2" />
      <rect x="42" y="72" width="91" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="48" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        LOG STREAM
      </text>
      <text x="48" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        AWS CLOUDTRAIL
      </text>
      <text x="48" y="145" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        VPC FLOW LOGS
      </text>

      {/* MITRE ATT&CK Engine */}
      <rect x="195" y="65" width="110" height="110" strokeWidth="1.2" rx="2" />
      <rect x="202" y="72" width="96" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="208" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        DETECTION CORE
      </text>
      <text x="208" y="130" fill="var(--color-signal)" fontSize="8" fontFamily="var(--font-mono)">
        MITRE ATT&CK TTPs
      </text>
      <text x="208" y="145" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        REAL-TIME RULES
      </text>

      {/* SIEM Alert Dispatch Node */}
      <rect x="360" y="65" width="105" height="110" strokeWidth="1.2" rx="2" />
      <rect x="367" y="72" width="91" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="372" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        INCIDENT ALERT
      </text>
      <text x="372" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        SIEM DISPATCH
      </text>
      <text x="372" y="145" fill="var(--color-signal)" fontSize="8" fontFamily="var(--font-mono)">
        • TELEMETRY FEED
      </text>

      {/* Connection Vectors */}
      <line x1="140" y1="120" x2="195" y2="120" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="305" y1="120" x2="360" y2="120" strokeWidth="1.2" strokeDasharray="4 3" />

      {/* Animated Data Travel Particles */}
      <circle cx="167" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />
      <circle cx="332" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />

      {/* Core Node Signal */}
      <circle cx="250" cy="120" r="5" fill="var(--color-signal)" stroke="none" />
    </g>
  );
}

function KnockBlueprintDiagram({ stroke, textCol }: { stroke: string; textCol: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="1">
      {/* Caddy Proxy Node */}
      <rect x="35" y="65" width="100" height="110" strokeWidth="1.2" rx="2" />
      <rect x="42" y="72" width="86" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="48" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        CADDY PROXY
      </text>
      <text x="48" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        TRAFFIC INGRESS
      </text>
      <text x="48" y="145" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        REVERSE PROXY
      </text>

      {/* Coraza WAF Engine (Diamond Core) */}
      <polygon points="250,45 335,120 250,195 165,120" strokeWidth="1.2" />
      <text x="204" y="116" fill={textCol} fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
        CORAZA WAF
      </text>
      <text x="210" y="132" fill="var(--color-signal)" fontSize="8" fontFamily="var(--font-mono)">
        OWASP CORE RULES
      </text>

      {/* Go Shipper & Dashboard Node */}
      <rect x="365" y="65" width="100" height="110" strokeWidth="1.2" rx="2" />
      <rect x="372" y="72" width="86" height="16" fill="color-mix(in srgb, var(--color-graphite) 10%, transparent)" stroke="none" />
      <text x="378" y="112" fill={textCol} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
        GO SHIPPER
      </text>
      <text x="378" y="130" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        LOG SHIPPING
      </text>
      <text x="378" y="145" fill={stroke} fontSize="8" fontFamily="var(--font-mono)">
        NEXT.JS DASH
      </text>

      {/* Connection Vectors */}
      <path d="M135 120 H165" strokeWidth="1.2" strokeDasharray="4 3" />
      <path d="M335 120 H365" strokeWidth="1.2" strokeDasharray="4 3" />

      {/* Animated Data Travel Particles */}
      <circle cx="150" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />
      <circle cx="350" cy="120" r="3" fill="var(--color-signal)" stroke="none" className="animate-pulse" />

      {/* Signal Node */}
      <circle cx="250" cy="120" r="5" fill="var(--color-signal)" stroke="none" />
    </g>
  );
}

function GenericBlueprintDiagram({ stroke, textCol }: { stroke: string; textCol: string }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth="1">
      <polygon points="250,45 350,120 250,195 150,120" strokeWidth="1.2" />
      <circle cx="250" cy="120" r="5" fill="var(--color-signal)" stroke="none" />
    </g>
  );
}
