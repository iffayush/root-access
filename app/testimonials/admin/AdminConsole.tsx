"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedbackEntry } from "@/lib/feedback/store";
import "./admin-console.css";

type Phase = "locked" | "loading" | "ready" | "error";

/**
 * Eyes-only curation console. Gated by ADMIN_TOKEN (stored per session).
 * Lists pending submissions; approve moves one to the public log, reject
 * deletes it. No stacks, no framing — server responses are generic.
 */
export function AdminConsole() {
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<Phase>("locked");
  const [pending, setPending] = useState<FeedbackEntry[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);

  const load = useCallback(async (activeToken: string) => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/feedback/admin", {
        headers: { "x-admin-token": activeToken },
        cache: "no-store",
      });
      if (!res.ok) {
        setPhase("error");
        setError(res.status === 401 ? "ACCESS DENIED." : "CURATION OFFLINE.");
        return;
      }
      const data = (await res.json()) as {
        pending: FeedbackEntry[];
        storage?: string;
      };
      setPending(data.pending);
      setStorageMode(data.storage ?? null);
      setPhase("ready");
    } catch {
      setPhase("error");
      setError("CURATION OFFLINE.");
    }
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("admin-token");
      if (stored) {
        setToken(stored);
        void load(stored);
      }
    } catch {
      // Storage blocked — manual unlock.
    }
  }, [load]);

  async function act(action: "approve" | "reject", id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/feedback/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        setPending((current) => current.filter((e) => e.id !== id));
      } else {
        setError(res.status === 401 ? "ACCESS DENIED." : "ACTION FAILED.");
      }
    } catch {
      setError("ACTION FAILED.");
    } finally {
      setBusyId(null);
    }
  }

  if (phase === "locked" || phase === "loading" || phase === "error") {
    return (
      <main className="admin-console" style={{ minHeight: "60vh" }}>
        <p className="admin-console__label">CURATION // RESTRICTED</p>
        <div className="admin-console__unlock">
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && token) void load(token);
            }}
            placeholder="ADMIN_TOKEN"
            className="admin-console__input"
            aria-label="Admin token"
          />
          <button
            type="button"
            className="admin-console__unlock-btn"
            onClick={() => token && void load(token)}
          >
            UNLOCK →
          </button>
        </div>
        {error && <p className="admin-console__error">{error}</p>}
        {phase === "loading" && (
          <p className="admin-console__error">DECRYPTING…</p>
        )}
      </main>
    );
  }

  return (
    <main className="admin-console">
      <p className="admin-console__label">
        CURATION // PENDING ({pending.length})
        {storageMode && (
          <span className="admin-console__mode"> · STORE: {storageMode}</span>
        )}
      </p>

      {storageMode === "filesystem-fallback" && (
        <p className="admin-console__warning">
          THIS DEPLOYMENT HAS NO BLOB TOKEN — submissions are hitting an empty
          local fallback. Connect the Blob store in Vercel (Storage → Connect)
          and redeploy.
        </p>
      )}

      {pending.length === 0 ? (
        <p className="admin-console__empty">NO PENDING TRANSMISSIONS.</p>
      ) : (
        <ul className="admin-console__list">
          {pending.map((entry) => (
            <li key={entry.id} className="admin-console__entry">
              <div className="admin-console__entry-head">
                <span className="admin-console__name">
                  {entry.name} · {entry.rating}/5 · {entry.date}
                </span>
                <span className="admin-console__actions">
                  <button
                    type="button"
                    className="admin-console__btn admin-console__btn--approve"
                    disabled={busyId === entry.id}
                    onClick={() => act("approve", entry.id)}
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    className="admin-console__btn admin-console__btn--reject"
                    disabled={busyId === entry.id}
                    onClick={() => act("reject", entry.id)}
                  >
                    REJECT
                  </button>
                </span>
              </div>
              <p className="admin-console__comment">“{entry.comment}”</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="admin-console__error">{error}</p>}
    </main>
  );
}
