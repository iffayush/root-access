"use client";

import { useRef, useState } from "react";
import { DecryptedText } from "@/components/common/DecryptedText";
import { PageGrid } from "@/components/layout/PageGrid";
import { AwardBadge, AwardSeal } from "@/components/papers/AwardBadge";
import { PaperReader } from "@/components/papers/PaperReader";
import { papers, type Paper } from "@/lib/portfolio-data";

const ROW_CLASSES =
  "paper-row w-full py-6 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center text-left";

function RowCells({ paper, index }: { paper: Paper; index: number }) {
  const isPlaceholder = paper.status === "placeholder" || !paper.pdf;
  return (
    <>
      <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-dust)]">
        PAPER_{String(index + 1).padStart(2, "0")}
        {paper.award && <AwardSeal award={paper.award} id={paper.slug} className="mt-3 hidden md:block" />}
      </div>
      <div className="md:col-span-6 font-sans text-lg font-medium text-[var(--color-ivory)]">
        {paper.title}
        {paper.award && (
          <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Phones only — desktop shows the rotating seal instead. The wrapper
                carries the visibility: the badge's own unlayered display rule
                would override Tailwind's layered `md:hidden`. */}
            <span className="md:hidden">
              <AwardBadge award={paper.award} />
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--color-signal)] uppercase">
              <DecryptedText text={paper.award.event.toUpperCase()} />
            </span>
          </span>
        )}
        {!isPlaceholder && paper.pages && (
          <span className="mt-1 block font-mono text-[10px] tracking-widest text-[color-mix(in_srgb,var(--color-dust)_70%,transparent)] uppercase">
            PDF · {paper.pages} pages
          </span>
        )}
      </div>
      <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
        {paper.category}
      </div>
      <div className="md:col-span-2 md:text-right flex flex-wrap items-center md:justify-end gap-2">
        <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[color-mix(in_srgb,var(--color-dust)_30%,transparent)] text-[var(--color-dust)] bg-[color-mix(in_srgb,var(--color-shadow-grey)_50%,transparent)]">
          {isPlaceholder ? "COMING SOON" : paper.date}
        </span>
        {!isPlaceholder && (
          // Visual cue only — the whole row is the button.
          <span
            aria-hidden="true"
            className="font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border border-[var(--color-signal)] text-[var(--color-signal)] transition-colors group-hover:bg-[var(--color-signal)] group-hover:text-[var(--color-shadow-grey)]"
          >
            READ ↗
          </span>
        )}
      </div>
    </>
  );
}

export function TechnicalPapers() {
  const [openPaper, setOpenPaper] = useState<{ paper: Paper; index: number } | null>(null);
  // Focus goes back to the row that opened the reader.
  const openerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <section id="technical-papers" className="bg-[var(--color-graphite)] text-[var(--color-ivory)] py-24 sm:py-32 border-b border-[var(--hairline)]">
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[var(--hairline)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
            05 / TECHNICAL PAPERS
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
            ARCHIVE // RESEARCH &amp; REPORTS
          </span>
        </div>
      </PageGrid>

      <PageGrid>
        <div className="col-span-12">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-[var(--hairline)] font-mono text-[11px] tracking-widest text-[var(--color-dust)] uppercase">
            <div className="col-span-2">INDEX</div>
            <div className="col-span-6">TITLE</div>
            <div className="col-span-2">CATEGORY</div>
            <div className="col-span-2 text-right">STATUS</div>
          </div>

          {/* Paper rows — readable ones open the in-page reader */}
          <div className="divide-y divide-[var(--hairline)]">
            {papers.map((paper, index) =>
              paper.status === "placeholder" || !paper.pdf ? (
                <div key={paper.id} className={`${ROW_CLASSES} opacity-60 select-none`}>
                  <RowCells paper={paper} index={index} />
                </div>
              ) : (
                <button
                  key={paper.id}
                  type="button"
                  aria-haspopup="dialog"
                  className={`${ROW_CLASSES}${paper.award ? " is-awarded" : ""} group cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-ivory)_5%,transparent)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-signal)]`}
                  onClick={(event) => {
                    openerRef.current = event.currentTarget;
                    setOpenPaper({ paper, index });
                  }}
                >
                  <RowCells paper={paper} index={index} />
                </button>
              )
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--hairline)] font-mono text-xs text-[var(--color-dust)] tracking-wider">
            * Select a paper to read it here, or download the PDF.
          </div>
        </div>
      </PageGrid>

      {openPaper && (
        <PaperReader
          paper={openPaper.paper}
          index={openPaper.index}
          onClose={() => {
            setOpenPaper(null);
            openerRef.current?.focus();
          }}
        />
      )}
    </section>
  );
}
