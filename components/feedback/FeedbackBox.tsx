"use client";

import { useEffect, useRef, useState } from "react";
import "./feedback-box.css";

const WITTY_LINES = [
  "All ratings are stored and reviewed during late-night imposter-syndrome episodes.",
  "Feedback is used solely to recalibrate the developer.",
  "5/5 ratings are forwarded directly to my therapist.",
  "Harsh ratings are compiled into patch notes for my personality.",
  "Your rating cannot crash production. My confidence can, though.",
  "Statistically insignificant sample size. Emotionally significant. Proceed.",
] as const;

const SESSION_KEY = "feedback-transmitted";

type Phase = "form" | "sending" | "done" | "already" | "offline";

export function FeedbackBox() {
  const [phase, setPhase] = useState<Phase>("form");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number>(0);
  // Random selection happens after hydration — Math.random during render
  // would desync server and client output.
  const [wittyLine, setWittyLine] = useState<string>(WITTY_LINES[0]);

  useEffect(() => {
    startedAt.current = Date.now();
    setWittyLine(WITTY_LINES[Math.floor(Math.random() * WITTY_LINES.length)]);
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setPhase("already");
      }
    } catch {
      // Storage blocked — always ask.
    }
  }, []);

  async function submit() {
    if (phase !== "form" || rating === 0) return;
    setError(null);
    setPhase("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          name,
          comment,
          // Honeypot is uncontrolled — read straight from the DOM. Bots that
          // auto-fill it get silently dropped server-side.
          website: honeypotRef.current?.value ?? "",
          startedAt: startedAt.current,
        }),
      });
      if (res.ok) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // Storage blocked — state still advances for this visit.
        }
        setPhase("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 503) {
        setPhase("offline");
      } else {
        setError(data?.error ?? "Transmission failed.");
        setPhase("form");
      }
    } catch {
      setError("Transmission failed.");
      setPhase("form");
    }
  }

  const active = hovered || rating;

  if (phase === "already") {
    return (
      <div className="feedback-box">
        <p className="feedback-box__note">
          // SIGNAL ALREADY RECEIVED THIS SESSION — the log remembers.
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="feedback-box">
        <p className="feedback-box__done">SIGNAL RECEIVED.</p>
        <p className="feedback-box__note">
          // Stored for review. Approved transmissions appear on this page.
        </p>
      </div>
    );
  }

  if (phase === "offline") {
    return (
      <div className="feedback-box">
        <p className="feedback-box__done">TRANSMISSION OFFLINE.</p>
        <p className="feedback-box__note">
          // The signal log is not reachable right now. Try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="feedback-box">
      <p className="feedback-box__prompt">RATE // SIGNAL</p>

      <div className="feedback-box__dots" role="group" aria-label="Rating out of 5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} out of 5`}
            aria-pressed={rating >= value}
            className={`feedback-box__dot ${value <= active ? "is-filled" : ""}`}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(value)}
            onBlur={() => setHovered(0)}
            onClick={() => setRating(value)}
          />
        ))}
        <span className="feedback-box__rating-readout" aria-live="polite">
          {rating > 0 ? `${rating}/5` : "—/5"}
        </span>
      </div>

      <label className="feedback-box__field">
        <span className="feedback-box__label">ONE-LINE TRANSMISSION *</span>
        <input
          type="text"
          value={comment}
          maxLength={140}
          onChange={(event) => setComment(event.target.value)}
          placeholder="say something worth storing"
          className="feedback-box__input"
          required
        />
      </label>

      <label className="feedback-box__field">
        <span className="feedback-box__label">CALLSIGN (OPTIONAL)</span>
        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          placeholder="anonymous is acceptable"
          className="feedback-box__input"
        />
      </label>

      <p className="feedback-box__witty">{wittyLine}</p>

      {error && <p className="feedback-box__error">{error}</p>}

      <button
        type="button"
        className="feedback-box__submit"
        onClick={submit}
        disabled={phase === "sending" || rating === 0 || comment.trim().length < 4}
      >
        {phase === "sending" ? "TRANSMITTING…" : "TRANSMIT →"}
      </button>

      {/* Honeypot — off-screen, bot-autofilled, silently dropped server-side. */}
      <div aria-hidden="true" className="feedback-box__honeypot">
        <label>
          Website
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </div>
  );
}
