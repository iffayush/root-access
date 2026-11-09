"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import type { Paper } from "@/lib/portfolio-data";
import { AwardBadge } from "@/components/papers/AwardBadge";
import { getPdfjs, renderPageCanvas } from "@/components/papers/pdf-loader";
import "./paper-reader.css";

/** Keep in sync with the leaf transition in paper-reader.css. */
const TURN_MS = 700;
/** Below this stage width the book shows one page at a time. */
const SPREAD_MIN_WIDTH = 820;
/** Rendered pages kept on each side of the current one; the rest are freed. */
const KEEP_RADIUS = 4;

type Layout = "spread" | "single";
type Direction = "next" | "prev";
type Turn = { dir: Direction; from: number; to: number };
type Status = "loading" | "ready" | "error";
type LeafKind = "spread-next" | "spread-prev" | "single-next" | "single-prev";

/** Page shown by each part of the book; 0 means nothing (or a blank leaf back). */
type View = {
  left: number;
  right: number;
  leafFront: number;
  leafBack: number;
  leafKind: LeafKind | null;
};

const spreadOf = (page: number) => Math.floor(page / 2);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Book-style spreads: the cover sits alone on the right ([–,1] [2,3] … [12,–]).
 * During a turn the destination pages are already drawn underneath, and the
 * leaf carries the page being turned (front) and the one it reveals (back).
 */
function viewFor(layout: Layout, anchor: number, turn: Turn | null, total: number): View {
  const valid = (page: number) => (page >= 1 && page <= total ? page : 0);

  if (layout === "spread") {
    if (!turn) {
      const s = spreadOf(anchor);
      return { left: valid(2 * s), right: valid(2 * s + 1), leafFront: 0, leafBack: 0, leafKind: null };
    }
    const from = spreadOf(turn.from);
    const to = spreadOf(turn.to);
    return turn.dir === "next"
      ? {
          left: valid(2 * from),
          right: valid(2 * to + 1),
          leafFront: valid(2 * from + 1),
          leafBack: valid(2 * to),
          leafKind: "spread-next",
        }
      : {
          left: valid(2 * to),
          right: valid(2 * from + 1),
          leafFront: valid(2 * from),
          leafBack: valid(2 * to + 1),
          leafKind: "spread-prev",
        };
  }

  if (!turn) {
    return { left: 0, right: valid(anchor), leafFront: 0, leafBack: 0, leafKind: null };
  }
  return turn.dir === "next"
    ? { left: 0, right: valid(turn.to), leafFront: valid(turn.from), leafBack: 0, leafKind: "single-next" }
    : { left: 0, right: valid(turn.from), leafFront: valid(turn.to), leafBack: 0, leafKind: "single-prev" };
}

/** Anchor page after turning, or null at either end. */
function targetOf(layout: Layout, anchor: number, dir: Direction, total: number): number | null {
  if (layout === "spread") {
    const s = spreadOf(anchor);
    if (dir === "next") return s < spreadOf(total) ? 2 * (s + 1) : null;
    if (s === 0) return null;
    return s - 1 === 0 ? 1 : 2 * (s - 1);
  }
  if (dir === "next") return anchor < total ? anchor + 1 : null;
  return anchor > 1 ? anchor - 1 : null;
}

function counterFor(layout: Layout, anchor: number, total: number): string {
  if (layout === "single") return `${pad(anchor)} / ${pad(total)}`;
  const s = spreadOf(anchor);
  const shown = [2 * s, 2 * s + 1].filter((page) => page >= 1 && page <= total);
  return `${shown.map(pad).join("–")} / ${pad(total)}`;
}

/**
 * Modal flipbook reader for one paper. Pages are rendered by PDF.js onto
 * canvases (the site's CSP forbids framing, which rules out the browser's
 * own PDF viewer in a popup) and turned with a CSS 3D leaf.
 */
export function PaperReader({
  paper,
  index,
  onClose,
}: {
  paper: Paper;
  index: number;
  onClose: () => void;
}) {
  const pdfUrl = paper.pdf ?? "";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leafFrontRef = useRef<HTMLDivElement>(null);
  const leafBackRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();

  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [total, setTotal] = useState(paper.pages ?? 1);
  const [aspect, setAspect] = useState(612 / 792);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [anchor, setAnchor] = useState(1);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [turning, setTurning] = useState(false);
  const [renderWidth, setRenderWidth] = useState(0);
  // Bumped whenever a page finishes rendering so the canvases get placed.
  const [, setRenderedCount] = useState(0);

  // Rendered pages, outside React state: canvases are moved between slots
  // directly, and a page is only ever shown in one slot at a time.
  const canvasesRef = useRef(new Map<number, { canvas: HTMLCanvasElement; width: number }>());
  const retiredRef = useRef<HTMLCanvasElement[]>([]);
  const inFlightRef = useRef(new Set<string>());
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const aliveRef = useRef(true);

  const layout: Layout = stage.w >= SPREAD_MIN_WIDTH ? "spread" : "single";
  const pageHeight =
    layout === "spread"
      ? Math.min(stage.h, stage.w / (2 * aspect))
      : Math.min(stage.h, stage.w / aspect);
  const pageWidth = Math.floor(pageHeight * aspect);
  const bookWidth = layout === "spread" ? pageWidth * 2 : pageWidth;
  const bookHeight = Math.floor(pageHeight);
  const view = viewFor(layout, anchor, turn, total);

  // Open as a modal (focus trap, Esc, inert page) and lock page scroll.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  // Free every canvas when the reader goes away.
  useEffect(() => {
    aliveRef.current = true;
    const canvases = canvasesRef.current;
    return () => {
      aliveRef.current = false;
      for (const { canvas } of canvases.values()) {
        canvas.width = 0;
        canvas.height = 0;
      }
      canvases.clear();
    };
  }, []);

  // Load the document.
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;

    getPdfjs()
      .then(async (pdfjs) => {
        if (cancelled) return;
        task = pdfjs.getDocument({ url: pdfUrl });
        task.onProgress = ({ loaded, total: size }: { loaded: number; total: number }) => {
          if (size > 0) setProgress(Math.min(1, loaded / size));
        };
        const loaded = await task.promise;
        const first = await loaded.getPage(1);
        if (cancelled) return;
        const viewport = first.getViewport({ scale: 1 });
        setAspect(viewport.width / viewport.height);
        setTotal(loaded.numPages);
        setDoc(loaded);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("[paper-reader] could not open", pdfUrl, error);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [pdfUrl]);

  // Track the stage size; the book is fitted inside it.
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStage({ w: Math.floor(width), h: Math.floor(height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Re-render resolution follows the page size, debounced while resizing.
  useEffect(() => {
    if (pageWidth <= 0) return;
    const bucket = Math.max(64, Math.round(pageWidth / 16) * 16);
    const timer = window.setTimeout(() => setRenderWidth(bucket), renderWidth === 0 ? 0 : 180);
    return () => window.clearTimeout(timer);
  }, [pageWidth, renderWidth]);

  // Render the pages on show plus neighbours, so turns never wait.
  useEffect(() => {
    if (!doc || renderWidth === 0) return;
    const canvases = canvasesRef.current;
    // Phones get extra resolution so pinch-zoom stays sharp.
    const pixelRatio = Math.min(3, (window.devicePixelRatio || 1) * (layout === "single" ? 1.5 : 1));
    const current = viewFor(layout, anchor, turn, total);

    const wanted = new Set<number>();
    const want = (page: number) => {
      if (page >= 1 && page <= total) wanted.add(page);
    };
    [current.left, current.right, current.leafFront, current.leafBack].forEach(want);
    for (let offset = -3; offset <= 3; offset++) want(anchor + offset);

    for (const [page, entry] of canvases) {
      if (!wanted.has(page) && Math.abs(page - anchor) > KEEP_RADIUS) {
        retiredRef.current.push(entry.canvas);
        canvases.delete(page);
      }
    }

    const ordered = [...wanted].sort((a, b) => Math.abs(a - anchor) - Math.abs(b - anchor));
    for (const page of ordered) {
      if (canvases.get(page)?.width === renderWidth) continue;
      const key = `${page}@${renderWidth}`;
      if (inFlightRef.current.has(key)) continue;
      inFlightRef.current.add(key);
      queueRef.current = queueRef.current.then(async () => {
        try {
          const canvas = await renderPageCanvas(doc, page, renderWidth, pixelRatio);
          if (!aliveRef.current) return;
          const previous = canvases.get(page);
          if (previous) retiredRef.current.push(previous.canvas);
          canvases.set(page, { canvas, width: renderWidth });
          setRenderedCount((count) => count + 1);
        } catch {
          // Document closed mid-render, or a page failed: its slot keeps the placeholder.
        } finally {
          inFlightRef.current.delete(key);
        }
      });
    }
  }, [doc, renderWidth, layout, anchor, turn, total]);

  // Put each rendered canvas into the slot that shows it (every commit).
  useLayoutEffect(() => {
    const canvases = canvasesRef.current;
    const place = (slot: HTMLDivElement | null, page: number) => {
      if (!slot) return;
      const canvas = page ? canvases.get(page)?.canvas : undefined;
      if (canvas) {
        if (slot.firstChild !== canvas || slot.childNodes.length !== 1) slot.replaceChildren(canvas);
      } else if (slot.childNodes.length > 0) {
        slot.replaceChildren();
      }
    };
    place(leftRef.current, view.left);
    place(rightRef.current, view.right);
    place(leafFrontRef.current, view.leafFront);
    place(leafBackRef.current, view.leafBack);
    // Free superseded canvases once nothing displays them.
    retiredRef.current = retiredRef.current.filter((canvas) => {
      if (canvas.isConnected) return true;
      canvas.width = 0;
      canvas.height = 0;
      return false;
    });
  });

  // Start the leaf's transition a frame after it mounts at its start angle.
  useEffect(() => {
    if (!turn) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setTurning(true));
    });
    // Fallback in case transitionend never fires (background tab, etc.).
    const fallback = window.setTimeout(() => finishTurn(turn), TURN_MS + 250);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [turn]);

  function finishTurn(done: Turn) {
    setAnchor(done.to);
    setTurn(null);
    setTurning(false);
  }

  function go(dir: Direction) {
    if (status !== "ready" || turn) return;
    const to = targetOf(layout, anchor, dir, total);
    if (to === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnchor(to);
      return;
    }
    setTurning(false);
    setTurn({ dir, from: anchor, to });
  }

  const canPrev = targetOf(layout, anchor, "prev", total) !== null;
  const canNext = targetOf(layout, anchor, "next", total) !== null;
  // Centre the book when one side of the spread is empty (cover, last page).
  const shownSpread = spreadOf(turn ? turn.to : anchor);
  const shift =
    layout !== "spread"
      ? 0
      : 2 * shownSpread < 1
        ? -pageWidth / 2
        : 2 * shownSpread + 1 > total
          ? pageWidth / 2
          : 0;
  const downloadName = `Ayush-Kumar_${paper.slug}.pdf`;
  const pageLabel = (page: number) => (page ? `Page ${page} of ${total}` : undefined);

  return (
    <dialog
      ref={dialogRef}
      className="paper-reader"
      aria-labelledby={titleId}
      onClose={() => {
        // Ignore a stale close event when the dialog was immediately reopened.
        if (!dialogRef.current?.open) onClose();
      }}
      onClick={(event) => {
        // Clicks on the backdrop land on the dialog element itself.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go("next");
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go("prev");
        }
      }}
    >
      <header className="paper-reader__bar">
        <div className="paper-reader__heading">
          <p className="paper-reader__eyebrow">
            <span>
              PAPER_{pad(index + 1)} · {paper.category} · {total} pages
            </span>
            {paper.award && <AwardBadge award={paper.award} />}
          </p>
          <h2 id={titleId} className="paper-reader__title">
            {paper.title}
          </h2>
        </div>
        <div className="paper-reader__actions">
          <a
            className="paper-reader__action paper-reader__action--primary"
            href={pdfUrl}
            download={downloadName}
            aria-label="Download PDF"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            <span className="paper-reader__action-label">Download</span>
          </a>
          <a
            className="paper-reader__action"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open PDF in a new tab"
          >
            <span className="paper-reader__action-label">Open</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="paper-reader__close"
            aria-label="Close reader"
            onClick={() => dialogRef.current?.close()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </header>

      <div ref={stageRef} className="paper-reader__stage">
        {status === "loading" && (
          <p className="paper-reader__status" role="status">
            LOADING PAPER… {Math.round(progress * 100)}%
          </p>
        )}

        {status === "error" && (
          <div className="paper-reader__status" role="alert">
            <p>COULDN&apos;T OPEN THIS PAPER HERE.</p>
            <a href={pdfUrl} download={downloadName} className="paper-reader__fallback">
              DOWNLOAD THE PDF INSTEAD →
            </a>
          </div>
        )}

        {status === "ready" && bookWidth > 0 && (
          <div
            className={`paper-reader__book is-${layout}`}
            style={{ width: bookWidth, height: bookHeight, transform: `translateX(${shift}px)` }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              pointerRef.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              const start = pointerRef.current;
              pointerRef.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                go(dx < 0 ? "next" : "prev");
              } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                // A tap: right half turns forward, left half back.
                const rect = event.currentTarget.getBoundingClientRect();
                go(event.clientX >= rect.left + rect.width / 2 ? "next" : "prev");
              }
            }}
            onPointerCancel={() => {
              pointerRef.current = null;
            }}
          >
            {layout === "spread" && (
              <div
                ref={leftRef}
                className="paper-reader__page is-left"
                data-state={view.left ? "page" : "empty"}
                role={view.left ? "img" : undefined}
                aria-label={pageLabel(view.left)}
              />
            )}
            <div
              ref={rightRef}
              className={`paper-reader__page ${layout === "spread" ? "is-right" : "is-single"}`}
              data-state={view.right ? "page" : "empty"}
              role={view.right ? "img" : undefined}
              aria-label={pageLabel(view.right)}
            />
            {layout === "spread" && view.left > 0 && view.right > 0 && (
              <div className="paper-reader__spine" aria-hidden="true" />
            )}
            {view.leafKind && (
              <div
                className={`paper-reader__leaf${turning ? " is-turning" : ""}`}
                data-kind={view.leafKind}
                aria-hidden="true"
                onTransitionEnd={(event) => {
                  if (event.target === event.currentTarget && event.propertyName === "transform" && turn) {
                    finishTurn(turn);
                  }
                }}
              >
                <div
                  ref={leafFrontRef}
                  className="paper-reader__face is-front"
                  data-state={view.leafFront ? "page" : "blank"}
                />
                <div
                  ref={leafBackRef}
                  className="paper-reader__face is-back"
                  data-state={view.leafBack ? "page" : "blank"}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="paper-reader__nav">
        <button
          type="button"
          className="paper-reader__turn"
          onClick={() => go("prev")}
          disabled={status !== "ready" || !canPrev}
        >
          <span aria-hidden="true">←</span> Prev
        </button>
        <div className="paper-reader__counter">
          <p aria-live="polite">
            {status === "ready" ? counterFor(layout, anchor, total) : `— / ${pad(total)}`}
          </p>
          <p className="paper-reader__hint">← → keys · click or swipe to turn</p>
        </div>
        <button
          type="button"
          className="paper-reader__turn is-next"
          onClick={() => go("next")}
          disabled={status !== "ready" || !canNext}
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </footer>
    </dialog>
  );
}
