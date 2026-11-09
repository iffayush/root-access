import type { PaperAward } from "@/lib/portfolio-data";
import "./award.css";

export function awardSummary(award: PaperAward): string {
  return `${award.place} — ${award.event}. ${award.organizer}, ${award.date}.`;
}

function MedalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

/** Glowing Signal chip with a periodic sheen; the full citation is in the tooltip. */
export function AwardBadge({ award }: { award: PaperAward }) {
  return (
    <span className="award-badge" title={awardSummary(award)}>
      <MedalIcon className="award-badge__icon" />
      {award.place}
    </span>
  );
}

/**
 * Rotating HUD-style seal: the award name orbits a pulsing "1ST" core.
 * Decorative — the badge and event line carry the text for assistive tech.
 */
export function AwardSeal({ award, id, className }: { award: PaperAward; id: string; className?: string }) {
  const pathId = `award-seal-${id}`;
  const orbit = `${award.place} ✦ ${award.short} ✦ `;
  const rank = award.place.split(" ")[0];
  return (
    <span className={`award-seal${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="award-seal__svg">
        <defs>
          <path id={pathId} d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" />
        </defs>
        <g className="award-seal__orbit">
          <circle cx="50" cy="50" r="47" className="award-seal__ring" />
          <text className="award-seal__text">
            <textPath href={`#${pathId}`} textLength="244" lengthAdjust="spacing">
              {orbit.toUpperCase()}
            </textPath>
          </text>
        </g>
        <circle cx="50" cy="50" r="27" className="award-seal__pulse" />
        <circle cx="50" cy="50" r="23" className="award-seal__core" />
        <text x="50" y="50" className="award-seal__rank" dominantBaseline="central" textAnchor="middle">
          {rank.toUpperCase()}
        </text>
      </svg>
    </span>
  );
}
