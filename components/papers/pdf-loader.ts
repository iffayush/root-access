import type * as PdfJs from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Lazy PDF.js loader for the paper reader. Nothing is fetched until the
 * first paper opens; later opens reuse the same module and worker.
 *
 * - Legacy build: the modern one calls very new built-ins
 *   (Map#getOrInsertComputed) without polyfills, which older Safari lacks.
 * - The worker is bundled through `new Worker(new URL(...))`, so it is
 *   served from this origin and stays inside CSP `script-src 'self'`.
 *   PDF.js 6 needs no eval, so the production CSP is unchanged.
 */

let pdfjsPromise: Promise<typeof PdfJs> | null = null;

export function getPdfjs(): Promise<typeof PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist/legacy/build/pdf.mjs")
    .then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerPort = new Worker(
        new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url),
        { type: "module" }
      );
      return pdfjs;
    })
    .catch((error: unknown) => {
      // Let a later open retry instead of caching the failure.
      pdfjsPromise = null;
      throw error;
    });
  return pdfjsPromise;
}

/** Render one page to a fresh canvas `cssWidth` CSS pixels wide. */
export async function renderPageCanvas(
  doc: PdfJs.PDFDocumentProxy,
  pageNumber: number,
  cssWidth: number,
  pixelRatio: number
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: (cssWidth * pixelRatio) / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.className = "paper-reader__canvas";
  await page.render({ canvas, viewport }).promise;
  page.cleanup();
  return canvas;
}
