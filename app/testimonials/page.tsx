import type { Metadata } from "next";
import { PageGrid } from "@/components/layout/PageGrid";
import { SiteMenu } from "@/components/navigation/SiteMenu";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FeedbackBox } from "@/components/feedback/FeedbackBox";
import { readApproved, type FeedbackEntry } from "@/lib/feedback/store";
import "./testimonials.css";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Ratings and one-line transmissions from visitors — curated, stored, occasionally used therapeutically.",
};

export const dynamic = "force-dynamic";

async function getApproved(): Promise<FeedbackEntry[]> {
  try {
    return await readApproved();
  } catch {
    // Storage not configured (e.g. local dev without a Blob token).
    return [];
  }
}

function RatingDots({ rating }: { rating: number }) {
  return (
    <span className="testimonials__dots" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          aria-hidden="true"
          className={`testimonials__dot ${value <= rating ? "is-filled" : ""}`}
        />
      ))}
    </span>
  );
}

export default async function TestimonialsPage() {
  const approved = await getApproved();

  return (
    <>
      <SiteMenu />
      <main id="content" className="flex-1">
        <section className="testimonials">
          <PageGrid className="mb-12">
            <div className="section-header col-span-12 flex items-center justify-between border-b border-[var(--hairline)] pb-4">
              <span className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
                // TRANSMISSIONS
              </span>
              <span className="font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
                FEEDBACK // SIGNAL LOG
              </span>
            </div>
          </PageGrid>

          <PageGrid className="gap-y-16">
            <div className="col-span-12 lg:col-span-5">
              <h1 className="testimonials__title">Rate the signal.</h1>
              <p className="testimonials__copy">
                Five dots, one honest line. Every transmission is reviewed
                before it enters the log — the internet being the internet.
              </p>
              <FeedbackBox />
            </div>

            <div className="col-span-12 lg:col-span-7 lg:pl-6">
              <p className="testimonials__log-label mb-4">
                APPROVED TRANSMISSIONS {approved.length > 0 ? `// ${approved.length}` : ""}
              </p>
              {approved.length > 0 ? (
                <div className="divide-y divide-[var(--hairline)]">
                  {approved.map((entry) => (
                    <div
                      key={entry.id}
                      className="testimonials__entry py-6 border-b border-[var(--hairline)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs tracking-widest text-[var(--color-ivory)] uppercase">
                          {entry.name}
                        </span>
                        <RatingDots rating={entry.rating} />
                      </div>
                      <p className="font-sans text-base sm:text-lg leading-relaxed text-[var(--color-dust)]">
                        “{entry.comment}”
                      </p>
                      <p className="mt-2 font-mono text-[10px] tracking-widest text-[color-mix(in_srgb,var(--color-dust)_60%,transparent)] uppercase">
                        {entry.date}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="testimonials__empty">
                  <p className="font-mono text-sm tracking-wider text-[var(--color-dust)] uppercase">
                    NO TRANSMISSIONS ON RECORD YET.
                  </p>
                  <p className="mt-3 font-mono text-xs leading-relaxed tracking-wide text-[color-mix(in_srgb,var(--color-dust)_65%,transparent)]">
                    The log fills when the signal clears review. Be the first
                    transmission.
                  </p>
                </div>
              )}
            </div>
          </PageGrid>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
