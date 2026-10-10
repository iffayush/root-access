"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StaggeredMenu } from "@/components/navigation/StaggeredMenu";
import { resolveExternalHref, siteConfig } from "@/lib/site-config";

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

/**
 * Bar readout — keeps the .status classes so the hero intro choreography
 * animates it exactly like the nav it replaces.
 */
function BarStatus() {
  return (
    <p className="status" aria-label="System status: operational">
      <span aria-hidden="true" className="status-readout">
        <span className="status-dot" />
        System / Operational
      </span>
    </p>
  );
}

/**
 * Panel readout — own class so the intro's `html.motion .status` rule
 * (which hides .status until the hero reveal) cannot strand it invisible.
 */
function PanelStatus() {
  return (
    <p className="sm-panel-status" aria-label="System status: operational">
      <span aria-hidden="true" className="sm-panel-status-readout">
        <span className="sm-panel-status-dot" />
        System / Operational
      </span>
    </p>
  );
}

export function SiteMenu() {
  // Canvas-independent, but colors must be resolved strings for GSAP inline
  // styles; hex fallbacks mirror app/globals.css for the server render only.
  const graphite = useTokenColor("--color-graphite", "#333533");
  const ivory = useTokenColor("--color-ivory", "#e8eddf");
  const dust = useTokenColor("--color-dust", "#cfdbd5");
  const signal = useTokenColor("--color-signal", "#f5cb5c");

  const items = siteConfig.nav.map((item) => ({
    label: item.label,
    link: item.href,
    ariaLabel: `Go to ${item.label}`,
  }));

  const socialItems = [
    { label: "Email", link: siteConfig.links.email },
    { label: "LinkedIn", link: siteConfig.links.linkedin },
    { label: "GitHub", link: siteConfig.links.github },
  ]
    .map((item) => ({ label: item.label, link: resolveExternalHref(item.link) }))
    .filter((item): item is { label: string; link: string } => item.link !== null);

  return (
    <StaggeredMenu
      position="right"
      colors={[graphite, dust]}
      items={items}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      menuButtonColor={ivory}
      openMenuButtonColor={ivory}
      changeMenuColorOnOpen={false}
      accentColor={signal}
      logo={
        <Link className="nav-link shrink-0" href="/">
          {siteConfig.name}
        </Link>
      }
      trailing={<BarStatus />}
      panelFooter={<PanelStatus />}
    />
  );
}
