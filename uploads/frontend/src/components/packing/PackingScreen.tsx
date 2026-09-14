"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, DataTable, EmptyState, ErrorAlert, FilterBar, Input, LoadingState, StatusBadge } from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { StatusKey } from "@/components/status-key/StatusKey";
import { PACKING_EXPORT_STATUS_KEY, group } from "@/lib/statusKeys";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { formatDateTime } from "@/lib/datetime";
import { ApiError, getPackingExports, triggerPackingExport } from "@/lib/api";
import type { PackingExport, PackingExportsResponse } from "@/lib/types";

const MAX_PACKING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Decision #106: the operator-facing message shown when a requested export range
 * exceeds the 30-day maximum contiguous window. The first 30 days are dispatched
 * immediately; the operator runs another export for the remainder.
 */
const EXPORT_LIMIT_MESSAGE =
  "Export limit reached (30 days max). Exporting the first 30 days now. " +
  "Please run another export for the remaining dates once this completes.";

export function PackingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [data, setData] = useState<PackingExportsResponse | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [windowNotice, setWindowNotice] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [windowInitialized, setWindowInitialized] = useState(false);
  const [actionError, setActionError] = useState<ApiError | Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const taskPolling = useTaskPolling({ successStatuses: ["success", "succeeded"] });

  const loadExports = useCallback(() => {
    setLoading(true);
    return getPackingExports({ page })
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error("Packing exports request failed"));
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPackingExports({ page })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error("Packing exports request failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    if (windowInitialized || !data?.default_window) return;
    const { default_window: defaultWindow } = data;
    setWindowStart(toDateTimeLocalValue(new Date(defaultWindow.window_start)));
    setWindowEnd(toDateTimeLocalValue(new Date(defaultWindow.window_end)));
    setWindowNotice(
      defaultWindow.first_export
        ? "This first export covers the most recent 30 days. Export additional contiguous windows to cover older work."
        : defaultWindow.has_remaining_backlog
          ? "More than 30 days remain after this contiguous export window. Export the next window when this one succeeds."
          : null,
    );
    setWindowInitialized(true);
  }, [data, windowInitialized]);

  useEffect(() => {
    if (taskPolling.state === "succeeded") {
      setActionSuccess("Packing export completed.");
      void loadExports();
    } else if (taskPolling.state === "failed" || taskPolling.state === "timed_out") {
      setActionError(taskPolling.error ?? new Error("Packing export task did not complete."));
    }
  }, [loadExports, taskPolling.error, taskPolling.state]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      router.push(`/packing?${next.toString()}`);
    },
    [router, searchParams],
  );

  const handleExport = useCallback(async () => {
    if (!windowStart || !windowEnd) {
      setActionError(new Error("Window start and window end are required."));
      return;
    }

    const start = new Date(windowStart);
    const end = new Date(windowEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      setActionError(new Error("Window start must be before window end."));
      return;
    }

    // Decision #106: a range past the 30-day maximum contiguous window is no
    // longer rejected. The 30-day calculation is unchanged; the first 30 days
    // are exported now and the operator is told to run another export for the
    // remaining dates. Task dispatch, polling, and error handling are unchanged.
    let effectiveEnd = end;
    if (end.getTime() - start.getTime() > MAX_PACKING_WINDOW_MS) {
      effectiveEnd = new Date(start.getTime() + MAX_PACKING_WINDOW_MS);
      setLimitNotice(EXPORT_LIMIT_MESSAGE);
    } else {
      setLimitNotice(null);
    }

    setDispatching(true);
    setActionError(null);
    setActionSuccess(null);
    taskPolling.reset();
    try {
      const payload = await triggerPackingExport({
        window_start: start.toISOString(),
        window_end: effectiveEnd.toISOString(),
      });
      if (!payload.task_id) {
        throw new Error("Packing export did not return a task id.");
      }
      taskPolling.start(`/api/tasks/${payload.task_id}/`);
      setActionSuccess("Packing export dispatched.");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Packing export request failed"));
    } finally {
      setDispatching(false);
    }
  }, [taskPolling, windowEnd, windowStart]);

  const columns = useMemo(
    // Decision #106: no "Export" column. The generated label just repeats the
    // Window Start / Window End dates; it stays in the data and in the Drive
    // link's accessible name but no longer occupies a redundant visible column.
    () => [
      {
        key: "status",
        header: "Status",
        render: (value: unknown) => <StatusBadge status={String(value) as StatusName} size="sm" />,
      },
      {
        key: "export_window_start",
        header: "Window Start",
        render: (value: unknown) => formatDate(value as string | null | undefined),
      },
      {
        key: "export_window_end",
        header: "Window End",
        render: (value: unknown) => formatDate(value as string | null | undefined),
      },
      {
        key: "drive_share_url",
        header: "Drive File",
        render: (value: unknown, row: PackingExport) => {
          const href = typeof value === "string" && value ? value : null;
          return href ? (
            <a href={href} target="_blank" rel="noreferrer" aria-label={`Open Drive file for ${row.export_label}`}>
              Open file
            </a>
          ) : (
            "—"
          );
        },
      },
      {
        key: "created_at",
        header: "Created",
        render: (value: unknown) => formatDate(value as string),
      },
    ],
    [],
  );

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <FilterBar
        right={
          <Button
            variant="primary"
            onClick={handleExport}
            loading={dispatching || taskPolling.state === "running"}
            disabled={dispatching || taskPolling.state === "running"}
          >
            Export Packing Sheet
          </Button>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr)", gap: 12 }}>
          <Input
            label="Window Start"
            type="datetime-local"
            value={windowStart}
            onChange={(event) => setWindowStart(event.target.value)}
            error={actionError ? formatApiError(actionError) : undefined}
            fullWidth
          />
          <Input
            label="Window End"
            type="datetime-local"
            value={windowEnd}
            onChange={(event) => setWindowEnd(event.target.value)}
            error={actionError ? formatApiError(actionError) : undefined}
            fullWidth
          />
        </div>
      </FilterBar>

      {windowNotice && (
        <ErrorAlert tone="warning" title="Contiguous export window" onDismiss={() => setWindowNotice(null)}>
          {windowNotice}
        </ErrorAlert>
      )}

      {limitNotice && (
        <ErrorAlert tone="warning" title="Contiguous export window" onDismiss={() => setLimitNotice(null)}>
          {limitNotice}
        </ErrorAlert>
      )}

      {actionError && (
        <ErrorAlert tone="error" title="Export failed" onDismiss={() => setActionError(null)}>
          {formatApiError(actionError)}
        </ErrorAlert>
      )}

      {actionSuccess && (
        <ErrorAlert tone="success" title="Export status" onDismiss={() => setActionSuccess(null)}>
          {taskPolling.state === "running" ? "Packing export is running." : actionSuccess}
        </ErrorAlert>
      )}

      {loading && !data ? (
        <LoadingState variant="skeleton" rows={8} label="Loading packing exports" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="boxes" title="NO PACKING EXPORTS">
          Packing sheet exports appear here after they are generated.
        </EmptyState>
      ) : data ? (
        <>
          <DataTable columns={columns} rows={data.results} rowKey="id" emptyLabel="No packing exports" />
          <Pagination
            count={data.count}
            page={page}
            hasNext={Boolean(data.next)}
            hasPrevious={Boolean(data.previous)}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      ) : null}

      <StatusKey
        label="Packing Queue status key"
        groups={[group("Packing export", PACKING_EXPORT_STATUS_KEY)]}
      />
    </div>
  );
}

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function Pagination({
  count,
  page,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  count: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        color: "var(--text-lo)",
        display: "flex",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        gap: "var(--space-3)",
        justifyContent: "flex-end",
      }}
    >
      <span>{count} exports</span>
      <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>
        Prev
      </Button>
      <span>Page {page}</span>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Packing queue unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view packing exports.";
  }
  return formatApiError(error);
}

function formatApiError(error: Error): string {
  if (!(error instanceof ApiError) || error.details == null) {
    return error.message || "Request failed.";
  }
  return stringifyDetails(error.details) || error.message;
}

function stringifyDetails(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(stringifyDetails).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${stringifyDetails(item)}`)
      .filter(Boolean)
      .join(" ");
  }
  return value == null ? "" : String(value);
}
