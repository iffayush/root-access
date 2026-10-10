import { PageGrid } from "@/components/layout/PageGrid";
import { ContactVisual } from "@/components/contact/ContactVisual";
import { resolveExternalHref, siteConfig } from "@/lib/site-config";

type IconProps = { className?: string };

function MailIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const contactLinks = [
  {
    label: "EMAIL",
    value: siteConfig.links.email,
    icon: MailIcon,
    external: false,
  },
  {
    label: "LINKEDIN",
    value: siteConfig.links.linkedin,
    icon: LinkedInIcon,
    external: true,
  },
  {
    label: "GITHUB",
    value: siteConfig.links.github,
    icon: GitHubIcon,
    external: true,
  },
] as const;

export function Contact() {
  return (
    <section
      id="contact"
      className="bg-[var(--color-shadow-grey)] text-[var(--color-ivory)] py-24 sm:py-32 border-b border-[var(--hairline)]"
    >
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[var(--hairline)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-dust)] uppercase">
            08 / CONTACT
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-dust)] uppercase">
            INQUIRIES &amp; COLLABORATION
          </span>
        </div>
      </PageGrid>

      <PageGrid className="items-center gap-y-12">
        {/* Left Column: Fragmented Isometric Visual */}
        <div className="col-span-12 lg:col-span-6">
          <ContactVisual />
        </div>

        {/* Right Column: Narrative & Contact Channel Cards */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between space-y-8 pl-0 lg:pl-6">
          <div className="space-y-4">
            <p className="font-mono text-xs tracking-widest text-[var(--color-signal)] uppercase">
              DIRECT COMMUNICATION
            </p>
            <h2 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-ivory)]">
              Initiate Contact.
            </h2>
            <p className="font-sans text-base sm:text-lg text-[var(--color-dust)] leading-relaxed">
              Available for technical security discussions, vulnerability analysis, and security engineering roles. Primary focus: Application Security, Cloud Defense, and DevSecOps.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[var(--hairline)]">
            {contactLinks.map((item) => {
              const href = resolveExternalHref(item.value);
              const Icon = item.icon;

              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-[color-mix(in_srgb,var(--color-dust)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-graphite)_40%,transparent)] transition-colors group-hover:border-[color-mix(in_srgb,var(--color-signal)_45%,transparent)]"
                  >
                    <Icon className="h-5 w-5 text-[var(--color-signal)]" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-mono text-[10px] tracking-widest text-[var(--color-dust)] uppercase">
                      {item.label}
                    </span>
                    <span className="truncate font-sans text-sm text-[var(--color-ivory)]">
                      {item.value}
                    </span>
                  </span>
                  {href ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto font-mono text-sm text-[var(--color-dust)] transition-all group-hover:translate-x-1 group-hover:text-[var(--color-signal)]"
                    >
                      ↗
                    </span>
                  ) : (
                    <span className="ml-auto font-mono text-[10px] tracking-widest text-[var(--color-dust)] uppercase">
                      PENDING
                    </span>
                  )}
                </>
              );

              const classes = `group flex min-h-[4.25rem] items-center gap-4 px-4 py-3.5 border transition-colors ${
                href
                  ? "border-[color-mix(in_srgb,var(--color-dust)_18%,transparent)] hover:border-[color-mix(in_srgb,var(--color-signal)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-signal)_6%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--color-dust)_12%,transparent)] opacity-50 select-none"
              }`;

              return href ? (
                <a
                  key={item.label}
                  href={href}
                  className={classes}
                  {...(item.external && href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {inner}
                </a>
              ) : (
                <div key={item.label} className={classes} aria-disabled="true">
                  {inner}
                </div>
              );
            })}
          </div>

          <div className="font-mono text-xs text-[var(--color-dust)] tracking-wider">
            LOCATION // {siteConfig.location.toUpperCase()} (UTC+05:30)
          </div>
        </div>
      </PageGrid>
    </section>
  );
}
