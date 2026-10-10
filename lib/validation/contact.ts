import { z } from "zod";

/**
 * Server-side validation contract for the future contact endpoint
 * (app/api/contact/route.ts). The client may mirror these limits, but this
 * schema is the authority — never trust the request body as typed.
 *
 * Intended handler shape (Phase 4+):
 *
 *   import { contactSchema } from "@/lib/validation/contact";
 *   import { sanitizeText } from "@/lib/security/sanitize";
 *   import { rateLimit, clientIpFrom } from "@/lib/security/rate-limit";
 *
 *   export async function POST(request: Request) {
 *     const gate = rateLimit(`contact:${clientIpFrom(request.headers)}`, 5, 60_000);
 *     if (!gate.allowed) {
 *       return Response.json(
 *         { error: "Too many requests." },
 *         { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } }
 *       );
 *     }
 *
 *     const parsed = contactSchema.safeParse(await request.json());
 *     if (!parsed.success) {
 *       return Response.json({ error: "Invalid submission." }, { status: 400 });
 *     }
 *
 *     const safe = {
 *       name: sanitizeText(parsed.data.name, 80),
 *       email: sanitizeEmail(parsed.data.email),
 *       message: sanitizeText(parsed.data.message, 2000),
 *     };
 *     // forward to the mail provider — key read from process.env only
 *   }
 */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.email().max(254),
  message: z.string().trim().min(10, "Message too short").max(2000),
  // Honeypot: must arrive empty. Real users never fill it; bots do.
  website: z.string().max(0).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
