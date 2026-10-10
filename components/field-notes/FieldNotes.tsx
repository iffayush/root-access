import { PageGrid } from "@/components/layout/PageGrid";
import { fieldNotes } from "@/lib/portfolio-data";

export function FieldNotes() {
  return (
    <section id="field-notes" className="bg-[var(--color-graphite)] text-[var(--color-ivory)] py-24 sm:py-32 border-b border-[var(--hairline)]">
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[var(--hairline)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
            05 / FIELD NOTES
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
            ARCHIVE // WRITINGS & LOGS
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

          {/* List of Field Note Archive Rows */}
          <div className="divide-y divide-[var(--hairline)]">
            {fieldNotes.map((note, index) => {
              const formattedIndex = `NOTE_${String(index + 1).padStart(2, "0")}`;
              const isPlaceholder = note.status === "placeholder";

              return (
                <div
                  key={note.id}
                  className={`field-note-row py-6 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center ${
                    isPlaceholder ? "opacity-60 select-none" : "hover:bg-[color-mix(in_srgb,var(--color-ivory)_5%,transparent)] transition-colors"
                  }`}
                >
                  <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-dust)]">
                    {formattedIndex}
                  </div>
                  <div className="md:col-span-6 font-sans text-lg font-medium text-[var(--color-ivory)]">
                    {note.title}
                  </div>
                  <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
                    {note.category}
                  </div>
                  <div className="md:col-span-2 md:text-right flex items-center md:justify-end gap-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[color-mix(in_srgb,var(--color-dust)_30%,transparent)] text-[var(--color-dust)] bg-[color-mix(in_srgb,var(--color-shadow-grey)_50%,transparent)]">
                      {isPlaceholder ? "COMING SOON" : note.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--hairline)] font-mono text-xs text-[var(--color-dust)] tracking-wider">
            * Technical field notes and research write-ups are currently being prepared for publication.
          </div>
        </div>
      </PageGrid>
    </section>
  );
}
