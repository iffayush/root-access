import { timingSafeEqual, createHash } from "node:crypto";
import {
  listSubmissions,
  readApproved,
  writeApproved,
  getSubmission,
  deleteSubmission,
} from "@/lib/feedback/store";

export const runtime = "nodejs";

/**
 * Admin surface for the feedback curation flow ("my eyes only").
 * Every method requires the `x-admin-token` header to match ADMIN_TOKEN
 * (constant-time comparison). GET returns pending submissions; POST takes
 * { action: "approve" | "reject", id }.
 */

function isAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get("x-admin-token") ?? "";
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(provided).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const [pending, approved] = await Promise.all([
    listSubmissions(),
    readApproved(),
  ]);
  return Response.json({ pending, approved });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { action?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed payload." }, { status: 400 });
  }

  const { action, id } = body;
  if (!id || (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "Invalid action." }, { status: 400 });
  }

  if (action === "reject") {
    await deleteSubmission(id);
    return Response.json({ ok: true });
  }

  const submission = await getSubmission(id);
  if (!submission) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }

  const approved = await readApproved();
  if (!approved.some((e) => e.id === id)) {
    approved.push(submission);
    await writeApproved(approved);
  }
  await deleteSubmission(id);
  return Response.json({ ok: true });
}
