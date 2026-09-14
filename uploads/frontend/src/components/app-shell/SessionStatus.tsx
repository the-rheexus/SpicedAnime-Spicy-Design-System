"use client";

import { useEffect, useState } from "react";

import { getAuthSession } from "@/lib/api";
import type { AuthSession } from "@/lib/types";

export function SessionStatus() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthSession()
      .then((data) => {
        if (active) {
          setSession(data);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const label = failed
    ? "SESSION UNKNOWN"
    : session?.authenticated
      ? session.user?.display_name || session.user?.username || "AUTHENTICATED"
      : "NOT SIGNED IN";

  return (
    <span
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        color: session?.authenticated ? "var(--tone-success)" : "var(--text-low)",
        fontFamily: "var(--font-sans)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "var(--ls-label)",
        padding: "8px 10px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
