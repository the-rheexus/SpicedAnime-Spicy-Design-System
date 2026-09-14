"use client";

import { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/ds";
import type { DashboardAttentionQueues } from "@/lib/needsAttention";

interface NeedsAttentionMetricTileProps {
  queues: DashboardAttentionQueues | null;
}

export function NeedsAttentionMetricTile({ queues }: NeedsAttentionMetricTileProps) {
  const [revealed, setRevealed] = useState(false);
  const counts = {
    blocked: queues?.errors.length ?? null,
    missingSku: queues?.noSku.length ?? null,
    deferred: queues?.deferred.length ?? null,
  };
  const total = queues
    ? counts.blocked! + counts.missingSku! + counts.deferred!
    : null;

  return (
    <Link
      href="/needs-attention"
      aria-label={
        total === null
          ? "Needs Attention — counts loading"
          : `Needs Attention — ${total} total: ${counts.blocked} blocked components, ${counts.missingSku} missing SKU, ${counts.deferred} deferred items`
      }
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${revealed ? "var(--line-strong)" : "var(--line)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        minHeight: 132,
        padding: "20px 22px",
        textDecoration: "none",
        transition: "border-color var(--dur-base) var(--ease-out)",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            color: "var(--text-low)",
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
          }}
        >
          Needs Attention
        </span>
        <span style={{ color: "var(--text-faint)", display: "flex" }}>
          <Icon name="octagon-x" size={17} />
        </span>
      </div>

      <span
        style={{
          color: "var(--text-hi)",
          fontFamily: "var(--font-mono)",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {total ?? "—"}
      </span>

      <div
        aria-hidden={!revealed}
        style={{
          display: "grid",
          gap: 5,
          gridTemplateRows: revealed ? "repeat(3, 1fr)" : "repeat(3, 0fr)",
          marginTop: revealed ? 14 : 0,
          opacity: revealed ? 1 : 0,
          overflow: "hidden",
          transition: "opacity var(--dur-base) var(--ease-out), margin-top var(--dur-base) var(--ease-out)",
        }}
      >
        <BreakdownRow label="Blocked components" value={counts.blocked} />
        <BreakdownRow label="Missing SKU" value={counts.missingSku} />
        <BreakdownRow label="Deferred items" value={counts.deferred} />
      </div>
    </Link>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number | null }) {
  return (
    <span
      style={{
        alignItems: "center",
        color: "var(--text-mid)",
        display: "flex",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        justifyContent: "space-between",
        minHeight: 0,
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--text-hi)", fontFamily: "var(--font-mono)" }}>{value ?? "—"}</span>
    </span>
  );
}
