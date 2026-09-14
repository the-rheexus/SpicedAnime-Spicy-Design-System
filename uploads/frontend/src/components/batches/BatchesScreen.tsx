"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AgingFlag,
  Button,
  EmptyState,
  ErrorAlert,
  FilterBar,
  LoadingState,
  Select,
  StatusBadge,
} from "@/components/ds";
import { calendarDaysSince, isAging } from "@/components/ds/feedback/AgingFlag";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { EmptyBatchLabel } from "@/components/common/EmptyBatchLabel";
import { RelativeTime } from "@/components/common/RelativeTime";
import { StatusKey } from "@/components/status-key/StatusKey";
import { ApiError, getBatches } from "@/lib/api";
import { BATCH_STATUS_KEY, group } from "@/lib/statusKeys";
import type { PaginatedResponse, ProductionBatch } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "active", label: "Active Queue" },
  { value: "Open", label: "Open" },
  { value: "Locked for Review", label: "Locked for Review" },
  { value: "Printed", label: "Printed" },
  { value: "Archived", label: "Archived" },
  { value: "history", label: "All" },
];

const ACTIVE_STATUSES = ["Open", "Locked for Review"];

/**
 * Display-only badge text override (Decision #44). The underlying
 * `Locked for Review` status value — DB, API, filters, the status-key legend on
 * this screen and on Batch Detail, and every other screen — is unchanged; only
 * the badge label on this screen's rows reads "PPT Generated" for it.
 */
const BATCH_BADGE_LABEL: Partial<Record<string, string>> = {
  "Locked for Review": "PPT Generated",
};

function batchStatusDisplayLabel(status: string): string | undefined {
  return BATCH_BADGE_LABEL[status];
}

const PRODUCTION_GROUP_OPTIONS = [
  { value: "", label: "All Production Groups" },
  { value: "Ashtray", label: "Ashtray" },
  { value: "Lighter", label: "Lighter" },
  { value: "Tin", label: "Tin" },
  { value: "Grinder/Jar/Tray", label: "Grinder/Jar/Tray" },
  { value: "Box", label: "Box" },
  { value: "Wallet", label: "Wallet" },
];

const GROUP_ORDER = PRODUCTION_GROUP_OPTIONS.slice(1).map((option) => option.value);

/** Detail route for a batch — used to render the "Open Batch" control as a real link. */
function batchHref(id: number): string {
  return `/batches/${id}`;
}

function GroupedBatchTable({ rows }: { rows: ProductionBatch[] }) {
  const grouped = new Map<string, ProductionBatch[]>();
  rows.forEach((row) => grouped.set(row.production_group, [...(grouped.get(row.production_group) ?? []), row]));
  const groups = Array.from(grouped.entries()).sort(([left], [right]) => {
    const leftIndex = GROUP_ORDER.indexOf(left);
    const rightIndex = GROUP_ORDER.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        overflowX: "auto",
      }}
    >
      <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-sans)", minWidth: 980, width: "100%" }}>
        <thead>
          <tr style={{ background: "var(--ink-850)" }}>
            <th style={{ ...batchHeaderStyle, width: 90 }}>Batch</th>
            <th style={{ ...batchHeaderStyle, width: 240 }}>Label</th>
            <th style={{ ...batchHeaderStyle, width: 180 }}>Status</th>
            <th style={{ ...batchHeaderStyle, textAlign: "right", width: 110 }}>Items</th>
            <th style={{ ...batchHeaderStyle, width: 180 }}>Started</th>
            <th style={{ ...batchHeaderStyle, width: 120 }}>Age</th>
            <th aria-label="Action" style={{ ...batchHeaderStyle, width: 150 }} />
          </tr>
        </thead>
        <tbody>
          {groups.map(([groupName, batches]) => (
            <BatchGroup key={groupName} groupName={groupName} batches={batches} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BatchGroup({
  groupName,
  batches,
}: {
  groupName: string;
  batches: ProductionBatch[];
}) {
  return (
    <>
      <tr>
        <th
          colSpan={7}
          scope="rowgroup"
          style={{
            background: "var(--ink-900)",
            borderTop: "1px solid var(--line)",
            color: "var(--text-low)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            padding: "12px 18px",
            textAlign: "left",
            textTransform: "uppercase",
          }}
        >
          {groupName}
        </th>
      </tr>
      {batches.map((batch) => {
        const total = batch.item_count ?? 0;
        const days = calendarDaysSince(batch.opened_at);
        return (
          <tr key={batch.id} style={{ borderTop: "1px solid var(--line)" }}>
            <td style={{ ...batchCellStyle, color: "var(--text-hi)", fontFamily: "var(--font-mono)" }}>
              #{batch.batch_number}
            </td>
            <td style={{ ...batchCellStyle, color: "var(--text-mid)" }}>{batch.batch_label}</td>
            <td style={batchCellStyle}>
              <StatusBadge
                status={batch.status as StatusName}
                label={batchStatusDisplayLabel(batch.status)}
                size="sm"
              />
            </td>
            <td style={{ ...batchCellStyle, textAlign: "right" }}>
              {total === 0 ? (
                <EmptyBatchLabel />
              ) : (
                <span style={{ color: "var(--text-hi)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  {total}
                </span>
              )}
            </td>
            <td style={batchCellStyle}>
              <RelativeTime value={batch.updated_at} style={{ color: "var(--text-low)" }} />
            </td>
            <td style={batchCellStyle}>
              {isAging(batch.opened_at) ? (
                <AgingFlag sinceIso={batch.opened_at} />
              ) : (
                <span style={{ color: "var(--text-low)" }}>{days === null ? "—" : `${days}d`}</span>
              )}
            </td>
            <td style={{ ...batchCellStyle, textAlign: "right" }}>
              <Button size="sm" variant="outline" href={batchHref(batch.id)}>
                Open Batch
              </Button>
            </td>
          </tr>
        );
      })}
    </>
  );
}

const batchHeaderStyle: React.CSSProperties = {
  color: "var(--text-low)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "var(--ls-label)",
  padding: "13px 18px",
  textAlign: "left",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const batchCellStyle: React.CSSProperties = {
  padding: "13px 18px",
  verticalAlign: "middle",
};

export function BatchesScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedStatuses = searchParams.getAll("status");
  const status = selectedStatuses.length === 1 ? selectedStatuses[0] : "";
  const activeQueue = selectedStatuses.length === 0 || (
    selectedStatuses.length === ACTIVE_STATUSES.length &&
    ACTIVE_STATUSES.every((value) => selectedStatuses.includes(value))
  );
  const productionGroup = searchParams.get("production_group") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [data, setData] = useState<PaginatedResponse<ProductionBatch> | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getBatches({
      status: activeQueue ? ACTIVE_STATUSES : status || undefined,
      production_group: productionGroup || undefined,
      page,
    })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Batches request failed"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeQueue, status, productionGroup, page]);

  const updateParams = (updates: Record<string, string | string[] | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) {
        value.forEach((item) => next.append(key, item));
      } else if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    if (!("page" in updates)) {
      next.delete("page");
    }
    router.push(`/batches?${next.toString()}`);
  };

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
        filters={STATUS_FILTERS.map((f) => f.label)}
        activeFilter={
          activeQueue
            ? "Active Queue"
            : status === "Open" || status === "Locked for Review" || status === "Printed" || status === "Archived"
              ? status
              : "All"
        }
        onFilter={(label) => {
          const value = STATUS_FILTERS.find((filter) => filter.label === label)?.value;
          if (value === "active") updateParams({ status: ACTIVE_STATUSES });
          else if (value === "history") updateParams({ status: undefined });
          else updateParams({ status: value });
        }}
        right={
          <Select
            value={productionGroup}
            onChange={(e) => updateParams({ production_group: e.target.value || undefined })}
            options={PRODUCTION_GROUP_OPTIONS}
          />
        }
      />

      {loading && !data ? (
        <LoadingState variant="skeleton" rows={6} label="Loading current batches" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="layers" title="NO BATCHES FOUND">
          Adjust filters to find production batches.
        </EmptyState>
      ) : data ? (
        <>
          <GroupedBatchTable rows={data.results} />
          <Pagination
            count={data.count}
            page={page}
            hasNext={Boolean(data.next)}
            hasPrevious={Boolean(data.previous)}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      ) : null}

      {/* Printed and Archived are included because the history filters can
          genuinely render them on this screen. */}
      <StatusKey label="Current Batches status key" groups={[group("Batch", BATCH_STATUS_KEY)]} />
    </div>
  );
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
        color: "var(--text-low)",
        display: "flex",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        gap: "var(--space-3)",
        justifyContent: "flex-end",
      }}
    >
      <span>{count} batches</span>
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={() => onPageChange(page - 1)}
        style={pagerButtonStyle(!hasPrevious)}
      >
        Prev
      </button>
      <span>Page {page}</span>
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        style={pagerButtonStyle(!hasNext)}
      >
        Next
      </button>
    </div>
  );
}

function pagerButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid var(--line-strong)",
    borderRadius: 5,
    color: disabled ? "var(--text-low)" : "var(--text-hi)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    opacity: disabled ? 0.5 : 1,
    padding: "4px 10px",
    textTransform: "uppercase",
  };
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Batches unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view batches.";
  }
  return error.message || "Batch data could not be loaded.";
}
