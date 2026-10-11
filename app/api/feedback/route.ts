import { randomUUID } from "node:crypto";
import { feedbackSchema } from "@/lib/validation/feedback";
import { cleanText } from "@/lib/security/sanitize";
import { clientIpFrom } from "@/lib/security/rate-limit";
import { allowSubmission, saveSubmission } from "@/lib/feedback/store";

export const runtime = "nodejs";

/**
 * POST /api/feedback — public submission endpoint.
 * Layers, in order: in-process rate limit (cheap first barrier) → blob-backed
 * per-IP rate limit (survives serverless instances) → honeypot → time-trap →
 * Zod shape/length validation → cleanText sanitization → store as private
 * blob. Nothing here is ever rendered to other users until Ayush curates it
 * (see /api/feedback/admin).
 */
export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers);

  // 3 submissions per hour per client — a guestbook, not a log stream.
  if (!(await allowSubmission(`feedback:${ip}`, 3, 60 * 60 * 1000))) {
    return Response.json(
      { error: "Too many transmissions from your position. Try again later." },
      { status: 429, headers: { "Retry-After": "3600" } }
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
