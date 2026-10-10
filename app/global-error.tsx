"use client";

import { useEffect } from "react";

/**
 * Root error boundary (OWASP A09 — defensive error handling).
 * Renders a generic message with no stack traces, framework details, or
 * digests. The error itself is intentionally not displayed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side observability hook. The error object stays in the
    // console of the affected user; it is never rendered to the page.
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#242423",
          color: "#e8eddf",
          fontFamily: "ui-monospace, monospace",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", color: "#cfdbd5" }}>
          SYSTEM FAULT
        </p>
        <h1 style={{ fontSize: "1.5rem", margin: 0, textTransform: "uppercase" }}>
          Something went wrong.
        </h1>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "transparent",
            border: "1px solid #f5cb5c",
            color: "#f5cb5c",
            padding: "0.75rem 1.5rem",
            fontFamily: "inherit",
            fontSize: "0.75rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}
