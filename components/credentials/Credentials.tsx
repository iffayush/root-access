import { PageGrid } from "@/components/layout/PageGrid";
import { resolveExternalHref } from "@/lib/site-config";
import { certifications, practicePlatforms } from "@/lib/portfolio-data";

import { BrandLogo } from "./BrandLogos";
import { CredentialTile } from "./CredentialTile";

const layoutByLogo = {
  google: "credential-tile--google",
  bugcrowd: "credential-tile--bugcrowd",
  tryhackme: "credential-tile--tryhackme",
  hackthebox: "credential-tile--hackthebox",
  hacker101: "credential-tile--hacker101",
} as const;

export function Credentials() {
  const [cert] = certifications;

  return (
    <section
      id="credentials"
      className="bg-[var(--color-ivory)] text-[var(--color-shadow-grey)] py-24 sm:py-32 border-b border-[var(--hairline)]"
    >
      <PageGrid className="mb-12">
        <div className="section-header col-span-12 flex items-center justify-between border-b border-[color-mix(in_srgb,var(--color-graphite)_25%,transparent)] pb-4">
          <span className="font-mono text-xs tracking-widest text-[var(--color-graphite)] uppercase">
            07 / CREDENTIALS
          </span>
          <span className="font-mono text-xs tracking-wider text-[var(--color-graphite)] uppercase">
            VERIFICATION &amp; PRACTICE
          </span>
        </div>
      </PageGrid>

      <PageGrid>
        <div className="credentials-bento col-span-12">
          {cert ? (
            <CredentialTile
              id={cert.id}
              layoutClass={`${layoutByLogo[cert.logo]} credential-tile--${cert.logo}`}
              brandPrimary={cert.brandPrimary}
              brandAccent={cert.brandSecondary}
              href={resolveExternalHref(cert.credentialUrl) ?? undefined}
              external={Boolean(resolveExternalHref(cert.credentialUrl))}
              logo={
                <BrandLogo
                  logo={cert.logo}
                  className="credential-tile__logo"
                />
              }
            >
              <div className="flex flex-col gap-4 flex-1 justify-end">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 border border-[rgba(232,237,223,0.28)] text-[var(--color-ivory)]">
                    <span
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 rounded-full ${
                        cert.status === "verified"
                          ? "bg-[var(--tile-brand-accent)]"
                          : "bg-[rgba(232,237,223,0.4)]"
                      }`}
                    />
                    {cert.date}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 border border-[rgba(232,237,223,0.28)] bg-[rgba(232,237,223,0.08)] text-[var(--color-ivory)]">
                    {cert.status === "verified" ? "VERIFIED" : "PENDING"}
                  </span>
                </div>

                <div>
                  <p className="font-mono text-xs tracking-widest text-[rgba(232,237,223,0.66)] uppercase mb-2">
                    Formal certification // {cert.issuer}
                  </p>
                  <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight max-w-xl text-[var(--color-ivory)]">
                    {cert.title}
                  </h3>
                </div>

                {resolveExternalHref(cert.credentialUrl) ? (
                  <p className="font-mono text-xs tracking-wider text-[rgba(232,237,223,0.78)] uppercase">
                    View credential ↗
                  </p>
                ) : (
                  <p className="font-mono text-xs tracking-wider text-[rgba(232,237,223,0.66)]">
                    {cert.credentialUrl}
                  </p>
                )}
              </div>
            </CredentialTile>
          ) : null}

          {practicePlatforms.map((platform) => (
            <CredentialTile
              key={platform.id}
              id={platform.id}
              layoutClass={`${layoutByLogo[platform.logo]} credential-tile--${platform.logo}`}
              brandPrimary={platform.brandPrimary}
              brandAccent={platform.brandSecondary}
              href={platform.platformUrl}
              external
              logo={
                <BrandLogo
                  logo={platform.logo}
                  className={`credential-tile__logo ${
                    platform.logo === "tryhackme" ||
                    platform.logo === "hacker101" ||
                    platform.logo === "bugcrowd"
                      ? "text-[var(--color-ivory)]"
                      : ""
                  }`}
                />
              }
            >
              <div className="flex flex-col gap-3 flex-1 justify-end">
                <p className="font-mono text-[10px] tracking-widest uppercase text-[rgba(232,237,223,0.66)]">
                  {platform.role}
                </p>
                <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ivory)]">
                  {platform.name}
                </h3>
                <p className="font-sans text-sm text-[rgba(232,237,223,0.72)] leading-relaxed max-w-md">
                  {platform.focus}
                </p>
                <p className="font-mono text-[11px] tracking-wider text-[rgba(232,237,223,0.78)] uppercase pt-1">
                  Open platform ↗
                </p>
              </div>
            </CredentialTile>
          ))}

          <p className="credentials-bento__note font-mono text-[11px] tracking-wider text-[var(--color-graphite)] leading-relaxed pt-2">
            * Certifications are verified where linked. Lab platforms are continuous hands-on practice — not
            formal credentials.
          </p>
        </div>
      </PageGrid>
    </section>
  );
}
