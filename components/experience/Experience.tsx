import { PageGrid } from "@/components/layout/PageGrid";
import { experience } from "@/lib/portfolio-data";

export function Experience() {
  return (
    <section
      id="experience"
      className="bg-[var(--color-ivory)] text-[var(--color-shadow-grey)] py-24 sm:py-32 border-b border-[var(--hairline)]"
    >
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase font-semibold">
            04 / EXPERIENCE
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase">
            TIMELINE // ROLES &amp; ENGAGEMENTS
          </span>
        </div>
      </PageGrid>

      <PageGrid>
        <div className="col-span-12">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] font-mono text-[11px] tracking-widest text-[var(--color-graphite)] uppercase">
            <div className="col-span-2">PERIOD</div>
            <div className="col-span-6">ROLE / ORGANISATION</div>
            <div className="col-span-2">LOCATION</div>
            <div className="col-span-2 text-right">STATUS</div>
          </div>

          {/* Timeline rows */}
          <div className="divide-y divide-[color-mix(in_srgb,var(--color-graphite)_20%,transparent)]">
            {experience.map((entry, index) => {
              const formattedIndex = `EXP_${String(index + 1).padStart(2, "0")}`;
              const isPlaceholder = entry.status === "placeholder";

              return (
                <div
                  key={entry.id}
                  className={`experience-row py-8 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start ${
                    isPlaceholder ? "opacity-60 select-none" : ""
                  }`}
                >
                  <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase">
                    {formattedIndex}
                    <span className="block mt-1">{entry.period}</span>
                  </div>

                  <div className="md:col-span-6">
                    <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight uppercase flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                          entry.status === "active"
                            ? "bg-[var(--color-signal)] animate-pulse"
                            : "bg-[var(--color-graphite)]"
                        }`}
                      />
                      {entry.role}
                    </h3>
                    <p className="mt-1 font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase font-semibold">
                      {entry.organisation}
                    </p>
                    <p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-[var(--color-graphite)] max-w-[38rem]">
                      {entry.summary}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-[var(--color-graphite)] uppercase"
                          >
                            <span
                              aria-hidden="true"
                              className="w-1 h-1 rounded-full bg-[var(--color-signal)]"
                            />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase self-center md:self-auto md:pt-2">
                    {entry.location}
                  </div>

                  <div className="md:col-span-2 md:text-right flex md:justify-end self-center md:self-auto md:pt-1">
                    <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[color-mix(in_srgb,var(--color-graphite)_30%,transparent)] text-[var(--color-graphite)] bg-[color-mix(in_srgb,var(--color-graphite)_5%,transparent)]">
                      {isPlaceholder
                        ? "PENDING"
                        : entry.status === "active"
                        ? "ACTIVE"
                        : "COMPLETE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] font-mono text-xs text-[var(--color-graphite)] tracking-wider">
            * Roles are listed only with verified details — entries appear as they are confirmed.
          </div>
        </div>
      </PageGrid>
    </section>
  );
}
