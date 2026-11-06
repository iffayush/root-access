"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/common/CountUp";
import { DecryptedText } from "@/components/common/DecryptedText";
import { PageGrid } from "@/components/layout/PageGrid";
import { projects, type Project } from "@/lib/portfolio-data";
import "./work.css";

/** Splits a metric like "100+" into static prefix/suffix around an animated count. */
function MetricValue({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^(\D*?)(-?\d[\d,]*(?:\.\d+)?)(\D*)$/);

  if (!match) {
    return <span className={className}>{value}</span>;
  }

  const [, prefix, numeric, suffix] = match;
  const target = Number(numeric.replace(/,/g, ""));
  if (Number.isNaN(target)) {
    return <span className={className}>{value}</span>;
  }

  const decimals = numeric.includes(".") ? numeric.split(".")[1].length : 0;
  const separator = numeric.includes(",") ? "," : "";

  return (
    <span className={className}>
      {prefix}
      <CountUp to={target} decimals={decimals} separator={separator} />
      {suffix}
    </span>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function computeTarget(
  mouse: { x: number; y: number },
  size: { w: number; h: number }
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const flipLeft = mouse.x + 32 + size.w > viewportWidth - 24;
  const x = flipLeft ? mouse.x - size.w - 32 : mouse.x + 32;
  const y = Math.min(
    Math.max(mouse.y - size.h / 2, 16),
    Math.max(viewportHeight - size.h - 16, 16)
  );
  return { x, y };
}

function ProjectRow({
  project,
  onMouseEnter,
}: {
  project: Project;
  onMouseEnter: () => void;
}) {
  const isCompleted = project.status === "completed";
  const firstResult = project.results?.find(
    (res) => res.method && res.method.trim() !== ""
  );

  return (
    <article className="project-exhibit work-row" onMouseEnter={onMouseEnter}>
      <PageGrid className="items-start gap-y-4 py-10 sm:py-12">
        <div className="work-row-number col-span-2 sm:col-span-1 sm:pt-2.5">
          {project.number}
        </div>

        <div className="col-span-10 sm:col-span-7">
          <h3 className="work-row-title">
            {/* Stretched link: its ::after covers the whole row, so any click
                on the row opens the repo while the link's name stays short. */}
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="work-row-link"
              aria-label={`${project.title} — source on GitHub (opens in a new tab)`}
            >
              {project.title}
            </a>
          </h3>
          <p className="work-row-subtitle">
            <DecryptedText text={project.subtitle.toUpperCase()} />
          </p>
          <p className="work-row-desc">{project.description}</p>
          <div className="work-row-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="work-row-tag">
                <span className="work-row-tag-dot" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-4 sm:col-span-4 sm:items-end">
          {firstResult && (
            <div className="work-row-metric">
              <div className="flex items-baseline gap-3">
                <MetricValue
                  className="work-row-metric-value"
                  value={firstResult.value}
                />
                <span className="work-row-metric-label">{firstResult.label}</span>
              </div>
              <p className="work-row-metric-method">
                METHOD: {firstResult.method}
              </p>
            </div>
          )}
          <span className="work-row-status">
            <span
              aria-hidden="true"
              className={`work-row-status-dot ${isCompleted ? "" : "is-progress"}`}
            />
            {isCompleted ? "COMPLETED" : "IN-PROGRESS"}
          </span>
          {/* Visual cue only — the stretched title link already covers the row. */}
          <span className="work-row-cta" aria-hidden="true">
            <GitHubMark className="work-row-cta-icon" />
            VIEW ON GITHUB
            <span className="work-row-cta-arrow">↗</span>
          </span>
        </div>
      </PageGrid>
    </article>
  );
}

export function SelectedWork() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef({ w: 560, h: 340 });
  const rafRef = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const previewActive = activeIndex !== null && !reducedMotion;

  // Card width follows each image's own aspect ratio, capped to the viewport.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !previewProject) return;
    const maxWidth = Math.min(560, window.innerWidth * 0.85);
    const maxHeight = window.innerHeight * 0.76;
    const ratio = previewProject.imageWidth / previewProject.imageHeight;
    el.style.width = `${Math.round(Math.min(maxWidth, maxHeight * ratio))}px`;
  }, [previewProject]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const updateSize = () => {
      sizeRef.current = { w: el.offsetWidth, h: el.offsetHeight };
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!previewActive) return;
    const el = previewRef.current;
    if (!el) return;

    const start = computeTarget(mouseRef.current, sizeRef.current);
    posRef.current = { ...start };

    let running = true;
    const loop = () => {
      if (!running) return;
      const pos = posRef.current;
      const target = computeTarget(mouseRef.current, sizeRef.current);
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [previewActive]);

  return (
    <section
      id="work"
      className="bg-[var(--color-ivory)] text-[var(--color-shadow-grey)] py-24 sm:py-32 border-b border-[var(--hairline)]"
    >
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase font-semibold">
            03 / SELECTED WORK
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase">
            EXHIBITS 01–03
          </span>
        </div>
      </PageGrid>

      <div
        className="work-list"
        onMouseMove={(event) => {
          mouseRef.current = { x: event.clientX, y: event.clientY };
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            onMouseEnter={() => {
              setActiveIndex(index);
              setPreviewProject(project);
            }}
          />
        ))}
      </div>

      {/* Decorative floating preview — follows the pointer over the row list. */}
      <div
        ref={previewRef}
        className={`work-preview ${previewActive ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <div className="work-preview-card">
          {previewProject && (
            <figure className="work-preview-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/projects/${previewProject.imageName}`}
                width={previewProject.imageWidth}
                height={previewProject.imageHeight}
                alt=""
                draggable={false}
                className="work-preview-image"
              />
              <figcaption className="work-preview-caption">
                <span>{previewProject.title}</span>
                <span className="work-preview-hint">CLICK TO OPEN REPO ↗</span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
