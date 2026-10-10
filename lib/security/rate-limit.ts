/**
 * In-memory sliding-window rate limiter (OWASP A04/A07 abuse control).
 *
 * Scope: one server process. This portfolio deploys as a single Next.js
 * server, so a Map is correct here. If the site ever moves to a
 * multi-instance/serverless host, swap the body of `rateLimit` for a shared
 * store (e.g. Upstash Redis `INCR`+`EXPIRE`) — the call signature is the
 * contract to keep.
 */

type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the next request is permitted. 0 when allowed. */
  retryAfterSeconds: number;
  /** Requests remaining in the current window. */
  remaining: number;
};

const buckets = new Map<string, number[]>();

let lastSweep = 0;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, timestamps] of buckets) {
    const alive = timestamps.filter((t) => now - t < windowMs);
    if (alive.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, alive);
    }
  }
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const timestamps = (buckets.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      remaining: 0,
    };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: limit - timestamps.length,
  };
}

/**
 * Best-effort client IP for rate-limit keying. Headers only — the proxy
 * chain must be trusted; on the planned single-origin deployment without a
 * CDN, `x-forwarded-for` is set by the host and safe to key on.
 */
export function clientIpFrom(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
