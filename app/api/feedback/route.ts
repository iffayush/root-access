import { randomUUID } from "node:crypto";
import { feedbackSchema } from "@/lib/validation/feedback";
import { cleanText } from "@/lib/security/sanitize";
import { clientIpFrom, rateLimit } from "@/lib/security/rate-limit";
import { saveSubmission } from "@/lib/feedback/store";

export const runtime = "nodejs";

/**
 * POST /api/feedback — public submission endpoint.
 * Layers, in order: in-memory per-IP rate limit (best-effort, per server
 * instance — the real spam control is the curation step) → honeypot
 * (silent drop) → time-trap → Zod shape/length validation → cleanText
 * sanitization → store as blob for review. Nothing here is ever rendered
 * to other users until it is curated via /api/feedback/admin.
 */
export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers);

  // Best-effort per-IP limit: 3 per hour. Pure in-memory — it cannot fail
  // the request the way the blob-backed limiter did.
  const gate = rateLimit(`feedback:${ip}`, 3, 60 * 60 * 1000);
  if (!gate.allowed) {
    return Response.json(
      { error: "Too many transmissions from your position. Try again later." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed payload." }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid transmission." }, { status: 400 });
  }

  const { rating, name, comment, website, startedAt } = parsed.data;

  // Honeypot: silent 200 so bots think they succeeded, nothing is stored.
  if (website && website.length > 0) {
    return Response.json({ ok: true });
  }

  // Time-trap: humans take at least a couple of seconds to rate and type.
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(elapsed) || elapsed < 2000 || elapsed > 24 * 60 * 60 * 1000) {
    return Response.json({ error: "Transmission rejected." }, { status: 400 });
  }

  const entry = {
    id: randomUUID(),
    rating,
    name: cleanText(name, 40) || "ANONYMOUS",
    comment: cleanText(comment, 140),
    date: new Date().toISOString().slice(0, 10),
  };

  try {
    await saveSubmission(entry);
  } catch (error) {
    console.error("[feedback] storage failure:", error);
    return Response.json(
      { error: "Transmission offline. Try again later." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true });
}
