import { head, put, del, list, type ListBlobResultBlob } from "@vercel/blob";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

/**
 * Feedback storage — Vercel Blob (free Hobby tier is more than sufficient:
 * entries are sub-kilobyte JSON documents).
 *
 * Layout (Blob):
 *   feedback/<id>.json      one pending (unreviewed) submission per blob
 *   approved.json           array of curated entries shown on /testimonials
 *   ratelimit/<iphash>.json sliding-window timestamps, keyed on a SHA-256
 *                           hash of the client IP (raw IPs are never stored)
 *
 * Dev fallback: when BLOB_READ_WRITE_TOKEN is absent (local dev without
 * `vercel env pull`), a filesystem store under `.feedback-dev/` keeps the
 * feature fully demonstrable — and unlike an in-memory map it is shared
 * across route bundles. The fallback never runs in production (the token is
 * auto-injected there).
 */

export type FeedbackEntry = {
  id: string;
  rating: number;
  name: string;
  comment: string;
  date: string;
};

const SUBMISSION_PREFIX = "feedback/";
const APPROVED_PATH = "approved.json";
const RATELIMIT_PREFIX = "ratelimit/";

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DEV_DIR = path.join(process.cwd(), ".feedback-dev");

// --- generic storage helpers ----------------------------------------------

async function readJson<T>(pathname: string): Promise<T | null> {
  if (hasBlob()) {
    try {
      const meta = await head(pathname);
      const res = await fetch(meta.downloadUrl, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      // head() throws when the blob does not exist — treat as empty.
      return null;
    }
  }
  try {
    const raw = await readFile(path.join(DEV_DIR, pathname), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(pathname: string, data: unknown): Promise<void> {
  if (hasBlob()) {
    await put(pathname, JSON.stringify(data), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return;
  }
  const file = path.join(DEV_DIR, pathname);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data), "utf8");
}

async function removePath(pathname: string): Promise<void> {
  if (hasBlob()) {
    try {
      const meta = await head(pathname);
      await del(meta.url);
    } catch {
      // Already gone — fine.
    }
    return;
  }
  await rm(path.join(DEV_DIR, pathname), { force: true });
}

async function* listDevPrefix(prefix: string): AsyncGenerator<string> {
  const dir = path.join(DEV_DIR, prefix);
  let names: string[] = [];
  try {
    names = await import("node:fs/promises").then((fs) => fs.readdir(dir));
  } catch {
    return;
  }
  for (const name of names) {
    if (name.endsWith(".json")) yield `${prefix}${name}`;
  }
}

// --- submissions -----------------------------------------------------------

export async function saveSubmission(entry: FeedbackEntry): Promise<void> {
  await writeJson(`${SUBMISSION_PREFIX}${entry.id}.json`, entry);
}

export async function listSubmissions(): Promise<FeedbackEntry[]> {
  const entries: FeedbackEntry[] = [];
  if (hasBlob()) {
    let cursor: string | undefined;
    do {
      const result = await list({ prefix: SUBMISSION_PREFIX, cursor });
      for (const blob of result.blobs) {
        const data = await readJson<FeedbackEntry>(blob.pathname);
        if (data) entries.push(data);
      }
      cursor = result.cursor;
    } while (cursor);
  } else {
    for await (const pathname of listDevPrefix(SUBMISSION_PREFIX)) {
      const data = await readJson<FeedbackEntry>(pathname);
      if (data) entries.push(data);
    }
  }
  return entries;
}

export async function getSubmission(id: string): Promise<FeedbackEntry | null> {
  return readJson<FeedbackEntry>(`${SUBMISSION_PREFIX}${id}.json`);
}

export async function deleteSubmission(id: string): Promise<void> {
  await removePath(`${SUBMISSION_PREFIX}${id}.json`);
}

// --- curated / approved ----------------------------------------------------

export async function readApproved(): Promise<FeedbackEntry[]> {
  return (await readJson<FeedbackEntry[]>(APPROVED_PATH)) ?? [];
}

export async function writeApproved(entries: FeedbackEntry[]): Promise<void> {
  await writeJson(APPROVED_PATH, entries);
}

// --- rate limiting (cross-instance) ----------------------------------------

export async function allowSubmission(
  clientKey: string,
  limit = 3,
  windowMs = 60 * 60 * 1000
): Promise<boolean> {
  const hash = createHash("sha256").update(clientKey).digest("hex").slice(0, 32);
  const pathname = `${RATELIMIT_PREFIX}${hash}.json`;
  const now = Date.now();

  const stored = await readJson<number[]>(pathname);
  const stamps = (stored ?? []).filter((t) => now - t < windowMs);
  if (stamps.length >= limit) return false;
  stamps.push(now);
  await writeJson(pathname, stamps);
  return true;
}
