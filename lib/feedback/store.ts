import { head, put, del, list, type ListBlobResultBlob } from "@vercel/blob";
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
 * feature demonstrable — and unlike an in-memory map it is shared across
 * route bundles. The fallback never runs in production (the token is
 * auto-injected there). NOTE: on a serverless deployment without the token,
 * writes fail read-only — which is exactly what the `storageMode()` export
 * exists to surface in the admin console.
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

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const DEV_DIR = path.join(process.cwd(), ".feedback-dev");

/** Which backend is live — surfaced in the admin console for diagnosis. */
export function storageMode(): "blob" | "filesystem-fallback" {
  return hasBlob() ? "blob" : "filesystem-fallback";
}

// --- generic storage helpers ----------------------------------------------

async function readJson<T>(pathname: string): Promise<T | null> {
  if (hasBlob()) {
    try {
      const meta = await head(pathname);
      const res = await fetch(meta.url, { cache: "no-store" });
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
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
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

/** Resolve a submission blob even when Vercel appended a random suffix. */
async function findSubmissionBlob(
  id: string
): Promise<ListBlobResultBlob | null> {
  const prefix = `${SUBMISSION_PREFIX}${id}`;
  let cursor: string | undefined;
  do {
    const result = await list({ prefix, cursor });
    for (const blob of result.blobs) {
      if (
        blob.pathname === `${prefix}.json` ||
        blob.pathname.startsWith(`${prefix}-`)
      ) {
        return blob;
      }
    }
    cursor = result.cursor;
  } while (cursor);
  return null;
}

export async function listSubmissions(): Promise<{
  entries: FeedbackEntry[];
  raw: string[];
  unreadable: string[];
}> {
  const raw: string[] = [];
  const unreadable: string[] = [];
  const entries: FeedbackEntry[] = [];

  const readWithReason = async (
    pathname: string
  ): Promise<{ data: FeedbackEntry | null; reason?: string }> => {
    if (hasBlob()) {
      try {
        const meta = await head(pathname);
        const res = await fetch(meta.url, { cache: "no-store" });
        if (!res.ok) {
          return { data: null, reason: `download failed (HTTP ${res.status})` };
        }
        try {
          return { data: JSON.parse(await res.text()) as FeedbackEntry };
        } catch {
          return { data: null, reason: "content is not valid JSON" };
        }
      } catch (error) {
        return {
          data: null,
          reason: `read failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    try {
      const file = path.join(DEV_DIR, pathname);
      const rawFile = await readFile(file, "utf8");
      try {
        return { data: JSON.parse(rawFile) as FeedbackEntry };
      } catch {
        return { data: null, reason: "content is not valid JSON" };
      }
    } catch (error) {
      return {
        data: null,
        reason: `read failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };

  if (hasBlob()) {
    let cursor: string | undefined;
    do {
      const result = await list({ prefix: SUBMISSION_PREFIX, cursor });
      for (const blob of result.blobs) {
        raw.push(blob.pathname);
        // Read via the list result's downloadUrl directly — skipping the
        // head() hop removes one failing call from the read path.
        try {
          const res = await fetch(blob.url, { cache: 'no-store' });
          if (!res.ok) {
            const detail = (await res.text().catch(() => '')).slice(0, 200);
            unreadable.push(
              `${blob.pathname} (download failed: HTTP ${res.status} ${detail})`
            );
            continue;
          }
          try {
            entries.push(JSON.parse(await res.text()) as FeedbackEntry);
          } catch {
            unreadable.push(`${blob.pathname} (content is not valid JSON)`);
          }
        } catch (error) {
          unreadable.push(
            `${blob.pathname} (read failed: ${error instanceof Error ? error.message : String(error)})`
          );
        }
      }
      cursor = result.cursor;
    } while (cursor);
  } else {
    for await (const pathname of listDevPrefix(SUBMISSION_PREFIX)) {
      raw.push(pathname);
      const { data, reason } = await readWithReason(pathname);
      if (data) {
        entries.push(data);
      } else {
        const label = reason ? `${pathname} (${reason})` : pathname;
        unreadable.push(label);
        console.error(`[feedback] unreadable dev submission skipped: ${label}`);
      }
    }
  }

  return { entries, raw, unreadable };
}

export async function getSubmission(id: string): Promise<FeedbackEntry | null> {
  if (!hasBlob()) {
    return readJson<FeedbackEntry>(`${SUBMISSION_PREFIX}${id}.json`);
  }
  const blob = await findSubmissionBlob(id);
  if (!blob) return null;
  const res = await fetch(blob.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as FeedbackEntry;
}

export async function deleteSubmission(id: string): Promise<void> {
  if (!hasBlob()) {
    await removePath(`${SUBMISSION_PREFIX}${id}.json`);
    return;
  }
  const blob = await findSubmissionBlob(id);
  if (blob) await del(blob.url);
}

// --- curated / approved ----------------------------------------------------

export async function readApproved(): Promise<FeedbackEntry[]> {
  return (await readJson<FeedbackEntry[]>(APPROVED_PATH)) ?? [];
}

export async function writeApproved(entries: FeedbackEntry[]): Promise<void> {
  await writeJson(APPROVED_PATH, entries);
}

