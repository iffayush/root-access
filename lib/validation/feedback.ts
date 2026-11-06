import { z } from "zod";

/**
 * Feedback contract for POST /api/feedback — the authority on shape and
 * length. Sanitization (control-char stripping, capping) happens after
 * validation via lib/security/sanitize.ts `cleanText`.
 */

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  name: z.string().trim().max(40).optional().default(""),
  // Optional: the home-page rating prompt allows a stars-only rating. When a
  // line is given it still has to say something.
  comment: z
    .string()
    .trim()
    .max(140)
    .refine((value) => value.length === 0 || value.length >= 4, "Say a little more")
    .default(""),
  // Honeypot: any value is accepted here and silently dropped by the route —
  // bots get an identical "ok" response and learn nothing.
  website: z.string().max(500).optional().default(""),
  // Time-trap: milliseconds between the box mounting and submitting.
  startedAt: z.number().int(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
