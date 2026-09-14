"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { AgingFlag, Button, DataTable, EmptyState, ErrorAlert, LoadingState, StatusBadge } from "@/components/ds";
import { calendarDaysSince, isAging } from "@/components/ds/feedback/AgingFlag";
import { EmptyBatchLabel } from "@/components/common/EmptyBatchLabel";
import { RelativeTime } from "@/components/common/RelativeTime";
import { ApiError, getBatch, getBatches } from "@/lib/api";
import type { ProductionBatch } from "@/lib/types";

/**
 * Dashboard active-batches table (P105, Decision #90).
 *
 * Scoped to `Open` batches only. One row per Open batch. The list endpoint
 * (`GET /api/batches/?status=Open`, sandbox-excluded) supplies the row set;
 * `component_status_counts` is only on the batch *detail* payload, so each row
 * is enriched with one `GET /api/batches/{id}/` call to derive the real Ready
 * and Blocked counts. There is at most one Open batch per production group
 * (Order_Status_and_Batch_Lifecycle_SOT.md), so this is a small bounded fan-out,
 * not an unbounded N+1. No new endpoint, no backend change.
 *
 * Where enrichment fails for a row, Ready/Blocked render as "—" rather than a
 * fabricated zero.
 */

interface BatchRow {
  id: number;
  production_group: string;
  batch_sequence: string;
  opened_at: string;
  updated_at: string;
  /** null = detail lookup unavailable for this row. */
  ready: number | null;
  blocked: number | null;
  total: number | null;
}

const READY_STATUSES = ["Ready", "Printed"];

function toRow(list: ProductionBatch, detail: ProductionBatch | null): BatchRow {
  let ready: number | null = null;
  let blocked: number | null = null;
  let total: number | null = null;
  const counts = detail?.component_status_counts;
  if (counts) {
    total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    ready = READY_STATUSES.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
    blocked = counts["Blocked"] ?? 0;
  }
  return {
    id: list.id,
    production_group: list.production_group,
    batch_sequence: `#${list.batch_number}`,
    opened_at: list.opened_at,
    updated_at: list.updated_at,
    ready,
    blocked,
    total,
  };
}

export function ActiveBatchTable() {
  const [rows, setRows] = useState<BatchRow[] | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    let active = true;

    getBatches({ status: ["Open"] })
      .then(async (payload) => {
        const details = await Promise.allSettled(payload.results.map((batch) => getBatch(batch.id)));
        if (!active) return;
        setRows(
          payload.results.map((batch, index) => {
            const settled = details[index];
            return toRow(batch, settled.status === "fulfilled" ? settled.value : null);
          }),
        );
        setError(null);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error("Batch table request failed"));
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <ErrorAlert tone="warning" title="Active batches unavailable">
        {error.message || "Open batch data could not be loaded."}
      </ErrorAlert>
    );
  }

  if (!rows) {
    return <LoadingState variant="skeleton" rows={4} label="Loading active batches" />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState icon="layers" title="NO OPEN BATCHES" compact>
        Production groups appear here once orders are assigned to open batches.
      </EmptyState>
    );
  }

  const columns = [
    {
      key: "production_group",
      header: "Group",
      width: 190,
      render: (_value: unknown, row: BatchRow) => (
        <span style={{ color: "var(--text-hi)", fontWeight: 700, whiteSpace: "nowrap" }}>
          {row.production_group}
        </span>
      ),
    },
    { key: "batch_sequence", header: "Batch", mono: true, width: 76 },
    {
      key: "state",
      header: "State",
      render: () => <StatusBadge status="Open" size="sm" />,
    },
    {
      key: "ready",
      header: "Ready",
      width: 150,
      render: (_value: unknown, row: BatchRow) => {
        if (row.ready === null || row.total === null) return <Muted>—</Muted>;
        // A batch with no components is not "complete" — render it neutrally
        // with its own label rather than "0/0 ready" in the success tone
        // (P106 item 4; same treatment on Current Batches).
        if (row.total === 0) return <EmptyBatchLabel />;
        const complete = row.ready === row.total;
        return (
          <span
            style={{
              color: complete ? "var(--tone-success)" : "var(--tone-warning)",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            {row.ready}/{row.total} ready
          </span>
        );
      },
    },
    {
      key: "blocked",
      header: "Blocked",
      width: 120,
      render: (_value: unknown, row: BatchRow) => {
        if (row.blocked === null) return <Muted>—</Muted>;
        if (row.blocked === 0) return <Muted>0</Muted>;
        return <StatusBadge status="Blocked" label={`${row.blocked} blocked`} size="sm" />;
      },
    },
    {
      key: "opened_at",
      header: "Oldest age",
      width: 120,
      render: (_value: unknown, row: BatchRow) => {
        if (isAging(row.opened_at)) return <AgingFlag sinceIso={row.opened_at} />;
        const days = calendarDaysSince(row.opened_at);
        return <Muted>{days === null ? "—" : `${days}d`}</Muted>;
      },
    },
    {
      key: "updated_at",
      header: "Started",
      width: 140,
      render: (_value: unknown, row: BatchRow) => (
        <RelativeTime value={row.updated_at} style={{ color: "var(--text-low)" }} />
      ),
    },
    {
      key: "action",
      header: "",
      align: "right" as const,
      render: (_value: unknown, row: BatchRow) => (
        <Button size="sm" variant="outline" href={`/batches/${row.id}`}>
          Open
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} rows={rows} rowKey="id" emptyLabel="No open batches" />;
}

function Muted({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--text-low)" }}>{children}</span>;
}
