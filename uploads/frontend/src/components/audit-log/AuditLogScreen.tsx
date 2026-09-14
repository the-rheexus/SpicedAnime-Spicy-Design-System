"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge, Button, DataTable, EmptyState, ErrorAlert, FilterBar, Input, LoadingState, Select } from "@/components/ds";
import { ApiError, getAuditLog } from "@/lib/api";
import { auditActorLabel, auditEntityLabel } from "@/lib/audit";
import { formatDateTime } from "@/lib/datetime";
import type { AuditEvent, PaginatedResponse } from "@/lib/types";

const ALL_ACTIONS = "__all__";

const PAGE_SIZE_OPTIONS = [20, 50, 100];
// Decision #79 (P95 B4): default page size is 50; option set unchanged.
const DEFAULT_PAGE_SIZE = 50;

export function AuditLogScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get("page_size")))
    ? Number(searchParams.get("page_size"))
    : DEFAULT_PAGE_SIZE;

  const [data, setData] = useState<PaginatedResponse<AuditEvent> | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState(ALL_ACTIONS);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [seenActions, setSeenActions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAuditLog({
      page,
      page_size: pageSize,
      action: actionFilter !== ALL_ACTIONS ? actionFilter : undefined,
      created_at_after: dateStart ? new Date(dateStart).toISOString() : undefined,
      created_at_before: dateEnd ? new Date(dateEnd).toISOString() : undefined,
    })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error("Audit log request failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [actionFilter, dateEnd, dateStart, page, pageSize]);

  useEffect(() => {
    if (!data) return;
    setSeenActions((current) => {
      const next = new Set(current);
      data.results.forEach((event) => next.add(event.action));
      return Array.from(next).sort();
    });
  }, [data]);

  const actionOptions = useMemo(
    () => [{ value: ALL_ACTIONS, label: "All event types" }, ...seenActions.map((action) => ({ value: action, label: action }))],
    [seenActions],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      router.push(`/audit-log?${next.toString()}`);
    },
    [router, searchParams],
  );

  const handleActionFilter = useCallback(
    (value: string) => {
      setActionFilter(value);
      if (page !== 1) updateParams({ page: undefined });
    },
    [page, updateParams],
  );

  const handleDateStart = useCallback(
    (value: string) => {
      setDateStart(value);
      if (page !== 1) updateParams({ page: undefined });
    },
    [page, updateParams],
  );

  const handleDateEnd = useCallback(
    (value: string) => {
      setDateEnd(value);
      if (page !== 1) updateParams({ page: undefined });
    },
    [page, updateParams],
  );

  const columns = [
    {
      key: "created_at",
      header: "Timestamp",
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: "action",
      header: "Event Type",
      mono: true,
      render: (value: unknown) => <Badge tone="info">{String(value)}</Badge>,
    },
    {
      key: "actor_type",
      header: "Actor",
      render: (_value: unknown, row: AuditEvent) => auditActorLabel(row),
    },
    {
      key: "entity_type",
      header: "Affected object",
      render: (_value: unknown, row: AuditEvent) => auditEntityLabel(row),
    },
    {
      key: "metadata",
      header: "Summary",
      render: (value: unknown) => formatMetadata(value as Record<string, unknown> | null | undefined),
    },
  ];

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <FilterBar>
        <div
          style={{
            alignItems: "end",
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(220px, 1fr) minmax(200px, 1fr) minmax(200px, 1fr)",
            width: "100%",
          }}
        >
          <Select
            label="Event Type"
            value={actionFilter}
            options={actionOptions}
            onChange={(event) => handleActionFilter(event.target.value)}
            fullWidth
          />
          <Input
            label="Date Start"
            type="datetime-local"
            value={dateStart}
            onChange={(event) => handleDateStart(event.target.value)}
            fullWidth
          />
          <Input
            label="Date End"
            type="datetime-local"
            value={dateEnd}
            onChange={(event) => handleDateEnd(event.target.value)}
            fullWidth
          />
        </div>
      </FilterBar>

      {loading && !data ? (
        <LoadingState variant="skeleton" rows={8} label="Loading audit log" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="scroll-text" title="NO AUDIT EVENTS">
          {actionFilter !== ALL_ACTIONS || dateStart || dateEnd
            ? "Adjust the current event type or date filters."
            : "Audit events appear here as system actions are recorded."}
        </EmptyState>
      ) : data ? (
        <>
          <DataTable columns={columns} rows={data.results} rowKey="id" emptyLabel="No audit events" />
          <Pagination
            count={data.count}
            page={page}
            pageSize={pageSize}
            hasNext={Boolean(data.next)}
            hasPrevious={Boolean(data.previous)}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            onPageSizeChange={(nextSize) =>
              updateParams({ page_size: String(nextSize), page: undefined })
            }
          />
        </>
      ) : null}
    </div>
  );
}

function Pagination({
  count,
  page,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
}: {
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
      <span>{count} events</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>Per page</span>
        <Select
          value={String(pageSize)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onPageSizeChange(Number(e.target.value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
          fullWidth={false}
          style={{ width: 76 }}
        />
      </div>
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

function formatMetadata(metadata?: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  return Object.entries(metadata)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${formatMetadataValue(value)}`)
    .join(" | ");
}

function formatMetadataValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length}]`;
  if (value && typeof value === "object") return "{...}";
  return value == null ? "—" : String(value);
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Audit log unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view audit events.";
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
