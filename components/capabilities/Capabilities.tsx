"use client";

import { useState } from "react";

import { PageGrid } from "@/components/layout/PageGrid";
import { capabilityGroups } from "@/lib/portfolio-data";

import { FlowingMenu } from "./FlowingMenu";

const menuItems = capabilityGroups.map((group) => ({
  text: group.menuLabel,
  image: group.image,
}));

export function Capabilities() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = capabilityGroups[activeIndex] ?? capabilityGroups[0];

  return (
    <section
      id="capabilities"
      className="bg-[var(--color-ivory)] text-[var(--color-shadow-grey)] py-24 sm:py-32 border-b border-[var(--hairline)]"
    >
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase">
            06 / CAPABILITIES
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase">
            TECHNICAL COMPETENCIES
          </span>
        </div>
      </PageGrid>

      <PageGrid className="gap-y-8 lg:gap-y-0 lg:items-stretch">
        <div className="capabilities-flow col-span-12 lg:col-span-7 xl:col-span-8 min-h-[420px] h-[min(560px,72vh)] border border-[color-mix(in_srgb,var(--color-graphite)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-graphite)_3%,transparent)]">
          <FlowingMenu
            items={menuItems}
            speed={18}
            textColor="var(--color-shadow-grey)"
            bgColor="transparent"
            marqueeBgColor="var(--color-shadow-grey)"
            marqueeTextColor="var(--color-ivory)"
            borderColor="color-mix(in srgb, var(--color-graphite) 22%, transparent)"
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        </div>

        <div
          className="capabilities-detail col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col justify-between p-8 sm:p-8 border border-[color-mix(in_srgb,var(--color-graphite)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-graphite)_5%,transparent)] lg:min-h-[420px] lg:h-[min(560px,72vh)]"
        >
          <div>
            <div className="font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase mb-4">
              GROUP // 0{activeIndex + 1}
            </div>

            <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-shadow-grey)] mb-3">
              {active.title}
            </h3>

            <p className="font-sans text-sm sm:text-base text-[var(--color-graphite)] leading-relaxed mb-8">
              {active.description}
            </p>

            <div className="font-mono text-[11px] tracking-widest text-[var(--color-graphite)] uppercase mb-3 pb-2 border-b border-[color-mix(in_srgb,var(--color-graphite)_15%,transparent)]">
              Core skills // {active.skills.length} items
            </div>
          </div>

          <ul className="space-y-2.5 overflow-visible max-h-none">
            {active.skills.map((skill) => (
              <li
                key={skill}
                className="font-mono text-xs text-[var(--color-shadow-grey)] flex items-start gap-2 leading-tight"
              >
                <span className="text-[var(--color-signal)] select-none" aria-hidden>
                  ›
                </span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageGrid>

      <PageGrid className="mt-10 gap-y-4">
        <p className="col-span-12 lg:col-span-8 font-mono text-[11px] tracking-wider text-[var(--color-graphite)] leading-relaxed">
          <span className="lg:hidden">Tap a domain to switch the detail panel and preview its marquee.</span>
          <span className="hidden lg:inline">
            Hover or focus a domain to preview its marquee strip. Detail panel updates with interview-ready
            competencies — remove anything you cannot discuss under scrutiny.
          </span>
        </p>
        <div className="col-span-12 lg:col-span-4 font-mono text-[11px] tracking-wider text-[var(--color-graphite)] lg:text-right">
          * Evaluated against practical hands-on capability &amp; interview readiness.
        </div>
      </PageGrid>
    </section>
  );
}
