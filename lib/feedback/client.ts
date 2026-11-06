/**
 * Browser-side half of the feedback flow. Shared by the /testimonials box
 * and the home-page rating prompt so both post to /api/feedback the same way
 * and agree on whether this session has already transmitted — whichever one
 * the visitor uses, the other stands down for the rest of the session.
 */

export const FEEDBACK_SESSION_KEY = "feedback-transmitted";

export type FeedbackPayload = {
  rating: number;
  name: string;
  comment: string;
  /** Honeypot value — bots that fill it are silently dropped server-side. */
  website: string;
  /** Time-trap: when the form mounted, in epoch milliseconds. */
  startedAt: number;
};

export type SubmitResult =
  | { status: "ok" }
  | { status: "offline" }
  | { status: "error"; message: string };

export function hasTransmittedThisSession(): boolean {
  try {
    return sessionStorage.getItem(FEEDBACK_SESSION_KEY) === "1";
  } catch {
    // Storage blocked — always ask.
    return false;
  }
}

export async function submitFeedback(payload: FeedbackPayload): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      try {
        sessionStorage.setItem(FEEDBACK_SESSION_KEY, "1");
      } catch {
        // Storage blocked — state still advances for this visit.
      }
      return { status: "ok" };
    }
    if (res.status === 503) {
      return { status: "offline" };
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { status: "error", message: data?.error ?? "Transmission failed." };
  } catch {
    return { status: "error", message: "Transmission failed." };
  }
}
