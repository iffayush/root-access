import Link from "next/link";
import { HeroMotion } from "@/components/hero/HeroMotion";
import { HeroTerminal } from "@/components/hero/HeroTerminal";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { PageGrid } from "@/components/layout/PageGrid";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-terminal" aria-hidden="true">
        <HeroTerminal />
      </div>
      <HeroMotion>
        <PageGrid className="hero-grid">
          <p className="hero-kicker hero-reveal">{siteConfig.title}</p>
          <h1 id="hero-heading" className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner">I build</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner">
                <span className="hero-secure">
                  <span className="hero-secure-sizer" aria-hidden="true">
                    Secure
                  </span>
                  <span className="hero-secure-live">Secure</span>
                </span>
              </span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner">Systems.</span>
            </span>
          </h1>
          <div className="hero-visual">
            <HeroVisual />
          </div>
          <div className="hero-body hero-reveal">
            <p className="hero-support">{siteConfig.description}</p>
            <div className="hero-actions">
              <Link className="hero-cta" href="/#work">
                View work
              </Link>
              <Link className="hero-cta" href="/#field-notes">
                Field notes
              </Link>
            </div>
          </div>
          <ul className="hero-index hero-reveal">
            {siteConfig.focusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
          <p className="hero-place hero-reveal">
            {siteConfig.location} / {siteConfig.year}
          </p>
        </PageGrid>
      </HeroMotion>
    </section>
  );
}
