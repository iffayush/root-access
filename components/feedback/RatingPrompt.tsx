"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { hasTransmittedThisSession, submitFeedback } from "@/lib/feedback/client";
import { onPreloadGateRelease } from "@/lib/preload-gate";
import "./rating-prompt.css";

/** Set once the prompt has opened — it never opens again in this browser. */
const SEEN_KEY = "rating-prompt-seen";
const OPEN_DELAY_MS = 700;

const STAR_PATH =
  "M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.1 6.47L12 17.43l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.6z";

type Phase = "form" | "sending" | "done" | "offline";

/**
 * First-visit rating popup. Opens the first time the visitor reaches the
 * Contact section, as a non-blocking card in the corner so the contact links
 * stay usable. Submissions go through the same /api/feedback pipeline as the
 * /testimonials box: stored for review, and shown there once approved.
 */
export function RatingPrompt() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Time-trap baseline is page mount — the visitor has scrolled the whole
  // page by the time they can submit, so a quick five-star tap still passes.
  const startedAt = useRef<number>(0);
  const titleId = useId();

  useEffect(() => {
    startedAt.current = Date.now();
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      // Storage blocked — the prompt can still open once per page load.
    }
    if (hasTransmittedThisSession()) return;

    const contact = document.getElementById("contact");
    if (!contact) return;

    let observer: IntersectionObserver | null = null;
    let timer = 0;
    // Wait for the preloader so a restored scroll position can't open the
    // prompt underneath the curtain.
    const stopGate = onPreloadGateRelease(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          try {
            localStorage.setItem(SEEN_KEY, "1");
          } catch {
            // Storage blocked — nothing to remember with.
          }
          timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
        },
        // Fires once the section's top edge reaches the upper half of the viewport.
        { rootMargin: "0px 0px -50% 0px" }
      );
      observer.observe(contact);
    });

    return () => {
      stopGate();
      observer?.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function submit() {
    if (phase !== "form" || rating === 0) return;
    setError(null);
    setPhase("sending");
    const result = await submitFeedback({
      rating,
      name,
      comment,
      website: honeypotRef.current?.value ?? "",
      startedAt: startedAt.current,
    });
    if (result.status === "ok") {
      setPhase("done");
    } else if (result.status === "offline") {
      setPhase("offline");
    } else {
      setError(result.message);
      setPhase("form");
    }
  }

  if (!open) return null;

  const active = hovered || rating;
  const commentLength = comment.trim().length;
  const commentTooShort = commentLength > 0 && commentLength < 4;

  return (
    <div
      className="rating-prompt"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="rating-prompt__close"
        aria-label="Close rating prompt"
        onClick={() => setOpen(false)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {phase === "done" || phase === "offline" ? (
        <>
          <p className="rating-prompt__eyebrow">{"// TRANSMISSION"}</p>
          <p id={titleId} className="rating-prompt__done">
            {phase === "done" ? "SIGNAL RECEIVED." : "TRANSMISSION OFFLINE."}
          </p>
          <p className="rating-prompt__note">
            {phase === "done"
              ? "// Stored for review. Approved ratings appear on the testimonials page."
              : "// The signal log is not reachable right now. Try again later."}
          </p>
          <Link href="/testimonials" className="rating-prompt__link">
            VIEW TESTIMONIALS <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <p className="rating-prompt__eyebrow">{"// BEFORE YOU GO"}</p>
          <h2 id={titleId} className="rating-prompt__title">
            Rate the signal.
          </h2>
          <p className="rating-prompt__copy">
            How did this portfolio land? Approved ratings appear on the
            testimonials page.
          </p>

          <div className="rating-prompt__stars" role="group" aria-label="Rating out of 5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} out of 5`}
                aria-pressed={rating >= value}
                className={`rating-prompt__star ${value <= active ? "is-filled" : ""}`}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                onFocus={() => setHovered(value)}
                onBlur={() => setHovered(0)}
                onClick={() => setRating(value)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={STAR_PATH} />
                </svg>
              </button>
            ))}
            <span className="rating-prompt__readout" aria-live="polite">
              {rating > 0 ? `${rating}/5` : "—/5"}
            </span>
          </div>

          <label className="rating-prompt__field">
            <span className="rating-prompt__label">NAME (OPTIONAL)</span>
            <input
              type="text"
              value={name}
              maxLength={40}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="anonymous"
              className="rating-prompt__input"
            />
          </label>

          <label className="rating-prompt__field">
            <span className="rating-prompt__label">ONE LINE (OPTIONAL)</span>
            <input
              type="text"
              value={comment}
              maxLength={140}
              onChange={(event) => setComment(event.target.value)}
              placeholder="say something worth storing"
              className="rating-prompt__input"
              aria-invalid={commentTooShort || undefined}
            />
          </label>

          {commentTooShort && (
            <p className="rating-prompt__hint">
              Say a little more, or leave it empty.
            </p>
          )}

          {error && <p className="rating-prompt__error">{error}</p>}

          <button
            type="submit"
            className="rating-prompt__submit"
            disabled={phase === "sending" || rating === 0 || commentTooShort}
          >
            {phase === "sending" ? "TRANSMITTING…" : "TRANSMIT →"}
          </button>

          {/* Honeypot — off-screen, bot-autofilled, silently dropped server-side. */}
          <div aria-hidden="true" className="rating-prompt__honeypot">
            <label>
              Website
              <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
