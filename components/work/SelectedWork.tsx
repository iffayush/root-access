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
          <h3 className="work-row-title">{project.title}</h3>
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
                <span>{previewProject.imageName}</span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
