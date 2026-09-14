"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DataTable, EmptyState, ErrorAlert, FilterBar, Icon, Input, LoadingState, Select, StatusBadge } from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { AgingIndicator } from "@/components/aging/AgingIndicator";
import { formatDateTime } from "@/lib/datetime";
import { SelectCheckbox } from "@/components/batches/SelectCheckbox";
import { StatusKey } from "@/components/status-key/StatusKey";
import { ApiError, bulkFlagOrderReprints, getOrder, getOrders } from "@/lib/api";
import {
  COMPONENT_STATUS_KEY,
  MVP_VISIBLE_ORDER_STATUSES,
  ORDER_STATUS_KEY,
  group,
} from "@/lib/statusKeys";
import type { OrderDetail, OrderListItem, PaginatedResponse, ProductionComponent } from "@/lib/types";

/** Tri-state Order # sort: unsorted → ascending → descending → unsorted.
 * Mirrors Batch Detail's Order column sort control. */
type OrderSort = "none" | "asc" | "desc";

const NEXT_ORDER_SORT: Record<OrderSort, OrderSort> = {
  none: "asc",
  asc: "desc",
  desc: "none",
};

const ORDER_SORT_LABEL: Record<OrderSort, string> = {
  none: "unsorted",
  asc: "ascending",
  desc: "descending",
};

const ORDER_SORT_TO_ORDERING: Record<OrderSort, string | undefined> = {
  none: undefined,
  asc: "order_number",
  desc: "-order_number",
};

const ORDERING_TO_ORDER_SORT: Record<string, OrderSort> = {
  order_number: "asc",
  "-order_number": "desc",
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];
// Decision #79 (P95 B4): default page size is 50; option set unchanged.
const DEFAULT_PAGE_SIZE = 50;

/**
 * Order statuses that are terminal for aging purposes (Decision #75 / P95 B2):
 * a Fulfilled Externally or Canceled order is done, so it never shows an aging
 * flag regardless of how long ago it was created.
 */
const AGING_EXEMPT_ORDER_STATUSES = ["Fulfilled Externally", "Canceled"];

/**
 * Operator-visible order statuses only. `Being Packaged` and `Shipped` are
 * dormant Phase 3 states: unreachable in MVP and excluded from every filter,
 * badge, and key. The list is derived from the shared allowlist so it cannot
 * drift from the status key or the backend's defensive filter.
 */
const STATUS_FILTER_VALUES = [...MVP_VISIBLE_ORDER_STATUSES];

type QuickDateKind = "today" | "yesterday" | "last7";

const QUICK_DATE_OPTIONS: { kind: QuickDateKind; label: string }[] = [
  { kind: "today", label: "Today" },
  { kind: "yesterday", label: "Yesterday" },
  { kind: "last7", label: "Last 7 Days" },
];

/** `YYYY-MM-DD` for a Date in the operator's local calendar (Decision #105). */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The bare `created_at_after` / `created_at_before` calendar dates a quick-date
 * shortcut writes to the URL. `Today` and `Yesterday` are a single local
 * calendar day; `Last 7 Days` is today plus the six preceding local days. The
 * fetch layer widens the `before` bound to an inclusive end-of-day instant, so
 * nothing here changes stored timestamps or introduces a timezone rule.
 */
export function quickDateRange(kind: QuickDateKind, now: Date = new Date()): { after: string; before: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (kind === "today") {
    return { after: localDateKey(today), before: localDateKey(today) };
  }
  if (kind === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { after: localDateKey(yesterday), before: localDateKey(yesterday) };
  }
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  return { after: localDateKey(start), before: localDateKey(today) };
}

/**
 * Widen a bare `YYYY-MM-DD` filter value to a UTC instant on the operator's
 * local calendar. `start` is 00:00:00.000 local; `end` is 23:59:59.999 local so
 * an inclusive range keeps its final day (the backend compares `<=`). A value
 * that already carries a time component is passed through untouched.
 */
export function dateFilterToInstant(value: string, edge: "start" | "end"): string {
  if (!value || value.includes("T")) return value;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return value;
  const [year, month, day] = parts;
  const date =
    edge === "start"
      ? new Date(year, month - 1, day, 0, 0, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59, 999);
  return date.toISOString();
}

function isReprintEligible(order: Pick<OrderListItem, "reprint_eligible_count">): boolean {
  return (order.reprint_eligible_count ?? 0) > 0;
}

function orderBlockedCount(order: Pick<OrderListItem, "blocked_count" | "has_blocked">): number {
  if (typeof order.blocked_count === "number") return order.blocked_count;
  return order.has_blocked ? 1 : 0;
}

function orderNumberHeader(orderSort: OrderSort, onToggle: () => void) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Sort by Order # (currently ${ORDER_SORT_LABEL[orderSort]})`}
      style={{
        alignItems: "center",
        background: "transparent",
        border: "none",
        color: orderSort === "none" ? "inherit" : "var(--text-hi)",
        cursor: "pointer",
        display: "inline-flex",
        font: "inherit",
        gap: 5,
        letterSpacing: "inherit",
        padding: 0,
        textTransform: "inherit",
      }}
    >
      Order #
      <Icon
        name={orderSort === "none" ? "chevrons-up-down" : "chevron-down"}
        size={12}
        style={{
          opacity: orderSort === "none" ? 0.4 : 1,
          transform: orderSort === "asc" ? "rotate(180deg)" : "none",
        }}
      />
    </button>
  );
}

function OrderNumberLink({ orderId, orderNumber }: { orderId: number; orderNumber: string }) {
  const [active, setActive] = useState(false);
  return (
    <Link
      href={`/orders/${orderId}`}
      onBlur={() => setActive(false)}
      onFocus={() => setActive(true)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={{
        color: active ? "var(--spice-400)" : "var(--text-hi)",
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      {orderNumber}
    </Link>
  );
}

interface ColumnDeps {
  orderSort: OrderSort;
  onToggleOrderSort: () => void;
  selectedOrderIds: Set<number>;
  expandedOrderIds: Set<number>;
  onToggleExpanded: (order: OrderListItem) => void;
  onToggleOrder: (orderId: number) => void;
  allEligibleSelected: boolean;
  someEligibleSelected: boolean;
  hasEligibleVisible: boolean;
  onToggleAllEligible: () => void;
}

function quietDash() {
  return <span style={{ color: "var(--text-lo)" }}>—</span>;
}

function buildColumns(deps: ColumnDeps) {
  const {
    orderSort,
    onToggleOrderSort,
    selectedOrderIds,
    expandedOrderIds,
    onToggleExpanded,
    onToggleOrder,
    allEligibleSelected,
    someEligibleSelected,
    hasEligibleVisible,
    onToggleAllEligible,
  } = deps;
  return [
    {
      key: "__select",
      header: (
        <SelectCheckbox
          checked={allEligibleSelected}
          indeterminate={someEligibleSelected}
          disabled={!hasEligibleVisible}
          label="Select all reprint-eligible orders on this page"
          onChange={onToggleAllEligible}
        />
      ),
      width: 44,
      render: (_value: unknown, row: OrderListItem) => {
        // Order selection exists only to drive Bulk Flag Reprint, so an order
        // with no eligible Printed items gets no checkbox (Decision #105) —
        // never a disabled or misleading control.
        if (!isReprintEligible(row)) return quietDash();
        return (
          <span onClick={(event) => event.stopPropagation()}>
            <SelectCheckbox
              checked={selectedOrderIds.has(row.id)}
              label={`Select order ${row.order_number}`}
              onChange={() => onToggleOrder(row.id)}
            />
          </span>
        );
      },
    },
    {
      key: "order_number",
      header: orderNumberHeader(orderSort, onToggleOrderSort),
      mono: true,
      render: (value: unknown, row: OrderListItem) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <OrderNumberLink orderId={row.id} orderNumber={value as string} />
          {!AGING_EXEMPT_ORDER_STATUSES.includes(row.status) && (
            <AgingIndicator sinceIso={row.created_at} />
          )}
        </span>
      ),
    },
    {
      key: "shopify_created_at",
      header: "Order Date",
      render: (value: unknown) => formatDateTime(value as string | null | undefined),
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => <StatusBadge status={value as StatusName} size="sm" />,
    },
    { key: "item_count", header: "Items", align: "right" as const },
    {
      key: "__attention",
      header: "Attention",
      render: (_value: unknown, row: OrderListItem) => {
        const blocked = orderBlockedCount(row);
        if (blocked <= 0) return quietDash();
        // Only the Blocked component status is surfaced here (Decision #105);
        // no other component status appears on the Orders screen.
        return <StatusBadge status="Blocked" size="sm" label={`Blocked ${blocked}`} />;
      },
    },
    {
      key: "__reprint",
      header: "Reprint",
      render: (_value: unknown, row: OrderListItem) => {
        if (!isReprintEligible(row)) return quietDash();
        const expanded = expandedOrderIds.has(row.id);
        return (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpanded(row);
            }}
            style={inlineButtonStyle(false)}
          >
            {expanded ? "Hide items" : "Select items"}
          </button>
        );
      },
    },
  ];
}

export function OrdersScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusValues = searchParams.getAll("status").filter((v) => STATUS_FILTER_VALUES.includes(v as never));
  const createdAfter = searchParams.get("created_at_after") ?? "";
  const createdBefore = searchParams.get("created_at_before") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get("page_size")))
    ? Number(searchParams.get("page_size"))
    : DEFAULT_PAGE_SIZE;
  const ordering = searchParams.get("ordering") ?? "";
  const orderSort: OrderSort = ORDERING_TO_ORDER_SORT[ordering] ?? "none";

  const [searchDraft, setSearchDraft] = useState(search);
  const [afterDraft, setAfterDraft] = useState(createdAfter);
  const [beforeDraft, setBeforeDraft] = useState(createdBefore);

  const [data, setData] = useState<PaginatedResponse<OrderListItem> | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderDetail>>({});
  const [detailErrors, setDetailErrors] = useState<Record<number, Error>>({});
  const [selectedComponentIds, setSelectedComponentIds] = useState<number[]>([]);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSearchDraft(search);
    setAfterDraft(createdAfter);
    setBeforeDraft(createdBefore);
  }, [search, createdAfter, createdBefore]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getOrders({
      status: statusValues.length ? statusValues : undefined,
      // A bare calendar date is widened to a local-day instant here so the
      // stored filter stays a shareable `YYYY-MM-DD` value while the query is
      // inclusive of its final day (Decision #105).
      created_at_after: createdAfter ? dateFilterToInstant(createdAfter, "start") : undefined,
      created_at_before: createdBefore ? dateFilterToInstant(createdBefore, "end") : undefined,
      search: search || undefined,
      page,
      page_size: pageSize,
      ordering: ordering || undefined,
    })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Orders request failed"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusValues.join(","), createdAfter, createdBefore, search, page, pageSize, ordering, refreshToken]);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        next.delete(key);
        if (Array.isArray(value)) {
          value.forEach((v) => next.append(key, v));
        } else if (value) {
          next.set(key, value);
        }
      });
      if (!("page" in updates)) {
        next.delete("page");
      }
      router.push(`/orders?${next.toString()}`);
    },
    [router, searchParams],
  );

  const applyDateFilters = useCallback(() => {
    updateParams({ created_at_after: afterDraft, created_at_before: beforeDraft });
  }, [afterDraft, beforeDraft, updateParams]);

  const applyQuickDate = useCallback(
    (kind: QuickDateKind) => {
      const range = quickDateRange(kind);
      updateParams({ created_at_after: range.after, created_at_before: range.before });
    },
    [updateParams],
  );

  const activeQuickDate: QuickDateKind | null = (() => {
    if (!createdAfter || !createdBefore) return null;
    for (const { kind } of QUICK_DATE_OPTIONS) {
      const range = quickDateRange(kind);
      if (range.after === createdAfter && range.before === createdBefore) return kind;
    }
    return null;
  })();

  const toggleStatus = useCallback(
    (value: string) => {
      const next = statusValues.includes(value)
        ? statusValues.filter((v) => v !== value)
        : [...statusValues, value];
      updateParams({ status: next.length ? next : undefined });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusValues.join(","), updateParams],
  );

  const selectedOrderSet = new Set(selectedOrderIds);
  const expandedOrderSet = new Set(expandedOrderIds);
  const eligibleVisibleIds = (data?.results ?? []).filter(isReprintEligible).map((order) => order.id);
  const hasEligibleVisible = eligibleVisibleIds.length > 0;
  const allEligibleSelected =
    hasEligibleVisible && eligibleVisibleIds.every((id) => selectedOrderSet.has(id));
  const someEligibleSelected =
    !allEligibleSelected && eligibleVisibleIds.some((id) => selectedOrderSet.has(id));

  const handleOrderSelection = (ids: number[]) => {
    const retained = new Set(ids);
    setSelectedOrderIds(ids);
    setExpandedOrderIds((current) => current.filter((id) => retained.has(id)));
    setSelectedComponentIds((current) =>
      current.filter((componentId) =>
        ids.some((orderId) => orderContainsComponent(orderDetails[orderId], componentId)),
      ),
    );
  };

  const toggleOrder = (orderId: number) => {
    handleOrderSelection(
      selectedOrderSet.has(orderId)
        ? selectedOrderIds.filter((id) => id !== orderId)
        : [...selectedOrderIds, orderId],
    );
  };

  const toggleAllEligibleOrders = () => {
    if (allEligibleSelected) {
      const visible = new Set(eligibleVisibleIds);
      handleOrderSelection(selectedOrderIds.filter((id) => !visible.has(id)));
      return;
    }
    handleOrderSelection(Array.from(new Set([...selectedOrderIds, ...eligibleVisibleIds])));
  };

  const loadOrderDetail = useCallback(async (order: OrderListItem) => {
    setDetailErrors((current) => {
      const next = { ...current };
      delete next[order.id];
      return next;
    });
    try {
      const detail = await getOrder(order.id);
      setOrderDetails((current) => ({ ...current, [order.id]: detail }));
    } catch (err: unknown) {
      setDetailErrors((current) => ({
        ...current,
        [order.id]: err instanceof Error ? err : new Error("Order detail request failed"),
      }));
    }
  }, []);

  const toggleExpandedOrder = async (order: OrderListItem) => {
    if (expandedOrderSet.has(order.id)) {
      setExpandedOrderIds((current) => current.filter((id) => id !== order.id));
      return;
    }
    // Opening the item picker and selecting the order are one gesture, so the
    // selected-order / selected-component counts stay coherent (Decision #105).
    if (!selectedOrderSet.has(order.id)) {
      handleOrderSelection([...selectedOrderIds, order.id]);
    }
    setExpandedOrderIds((current) => (current.includes(order.id) ? current : [...current, order.id]));
    if (!orderDetails[order.id]) {
      await loadOrderDetail(order);
    }
  };

  const toggleComponentGroup = (componentIds: number[]) => {
    setSelectedComponentIds((current) => {
      const next = new Set(current);
      const remove = componentIds.every((id) => next.has(id));
      componentIds.forEach((id) => (remove ? next.delete(id) : next.add(id)));
      return Array.from(next).sort((left, right) => left - right);
    });
  };

  const handleBulkReprint = async () => {
    setActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const result = await bulkFlagOrderReprints(selectedComponentIds);
      setActionSuccess(
        `${result.component_ids.length} component(s) flagged across ${result.affected_order_ids.length} order(s).`,
      );
      setSelectedOrderIds([]);
      setExpandedOrderIds([]);
      setSelectedComponentIds([]);
      setOrderDetails({});
      setDetailErrors({});
      setRefreshToken((current) => current + 1);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Bulk reprint request failed"));
    } finally {
      setActionPending(false);
    }
  };

  const columns = buildColumns({
    orderSort,
    onToggleOrderSort: () => updateParams({ ordering: ORDER_SORT_TO_ORDERING[NEXT_ORDER_SORT[orderSort]] }),
    selectedOrderIds: selectedOrderSet,
    expandedOrderIds: expandedOrderSet,
    onToggleExpanded: (order) => void toggleExpandedOrder(order),
    onToggleOrder: toggleOrder,
    allEligibleSelected,
    someEligibleSelected,
    hasEligibleVisible,
    onToggleAllEligible: toggleAllEligibleOrders,
  });

  const renderReprintRegion = (row: OrderListItem) => {
    const detailError = detailErrors[row.id];
    if (detailError) {
      return (
        <div style={{ padding: "var(--space-3)" }}>
          <ErrorAlert tone="error" title={`Order ${row.order_number} items unavailable`}>
            <span style={{ alignItems: "center", display: "flex", gap: "var(--space-2)" }}>
              {detailError.message}
              <button type="button" onClick={() => void loadOrderDetail(row)} style={inlineButtonStyle(false)}>
                Retry
              </button>
            </span>
          </ErrorAlert>
        </div>
      );
    }
    const detail = orderDetails[row.id];
    if (!detail) {
      return (
        <div style={{ padding: "var(--space-3)" }}>
          <LoadingState variant="skeleton" rows={2} label={`Loading order ${row.order_number} items`} />
        </div>
      );
    }
    return (
      <ReprintItemPicker
        order={detail}
        listEligibleCount={row.reprint_eligible_count ?? 0}
        selectedComponentIds={new Set(selectedComponentIds)}
        onToggle={toggleComponentGroup}
      />
    );
  };

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <FilterBar
        style={{ gap: 10, padding: "10px 12px" }}
        searchValue={searchDraft}
        onSearch={(value) => {
          setSearchDraft(value);
          updateParams({ search: value });
        }}
        searchPlaceholder="Search order number..."
        right={
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
            <div role="group" aria-label="Quick date ranges" style={{ display: "flex", gap: 4 }}>
              {QUICK_DATE_OPTIONS.map(({ kind, label }) => {
                const isActive = activeQuickDate === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => applyQuickDate(kind)}
                    style={{
                      background: isActive ? "var(--spice-tint)" : "transparent",
                      border: `1px solid ${isActive ? "var(--line-spice)" : "var(--line-strong)"}`,
                      borderRadius: 5,
                      color: isActive ? "var(--spice-400)" : "var(--text-mid)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      padding: "6px 8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <Input
              type="date"
              label="From"
              value={afterDraft ? afterDraft.slice(0, 10) : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAfterDraft(e.target.value)}
            />
            <span style={{ color: "var(--text-lo)" }}>to</span>
            <Input
              type="date"
              label="To"
              value={beforeDraft ? beforeDraft.slice(0, 10) : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBeforeDraft(e.target.value)}
            />
            <button
              type="button"
              onClick={applyDateFilters}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 5,
                color: "var(--text-hi)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "6px 10px",
                textTransform: "uppercase",
              }}
            >
              Apply
            </button>
          </div>
        }
      >
        <StatusMultiSelect selected={statusValues} onToggle={toggleStatus} />
      </FilterBar>

      <div style={{ alignItems: "center", display: "flex", gap: "var(--space-3)", justifyContent: "space-between" }}>
        <span aria-live="polite" style={{ color: "var(--text-lo)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
          {selectedOrderIds.length} order(s), {selectedComponentIds.length} component(s) selected
        </span>
        <button
          type="button"
          disabled={selectedComponentIds.length === 0 || actionPending}
          onClick={() => void handleBulkReprint()}
          style={bulkButtonStyle(selectedComponentIds.length === 0 || actionPending)}
        >
          {actionPending ? "Flagging…" : "Bulk Flag Reprint"}
        </button>
      </div>

      {actionError && <ErrorAlert tone="error" title="Bulk reprint failed">{actionError.message}</ErrorAlert>}
      {actionSuccess && <ErrorAlert tone="success" title="Bulk reprint complete">{actionSuccess}</ErrorAlert>}

      {loading && !data ? (
        <LoadingState variant="skeleton" rows={8} label="Loading orders" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="shopping-cart" title="NO ORDERS FOUND">
          Adjust filters or search to find orders.
        </EmptyState>
      ) : data ? (
        <>
          <DataTable
            columns={columns}
            rows={data.results}
            rowKey="id"
            emptyLabel="No orders"
            expandedRowKeys={expandedOrderIds}
            renderExpandedRow={(row: OrderListItem) => renderReprintRegion(row)}
          />
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

      <StatusKey
        label="Orders status key"
        groups={[
          group("Order", ORDER_STATUS_KEY),
          // The Attention column renders only this one component status.
          group(
            "Component",
            COMPONENT_STATUS_KEY.filter((entry) => entry.status === "Blocked"),
          ),
        ]}
      />
    </div>
  );
}

interface ReprintGroup {
  key: string;
  label: string;
  componentIds: number[];
}

function reprintGroups(order: OrderDetail): ReprintGroup[] {
  return order.items.flatMap((item) => {
    const printed = (item.components ?? []).filter((component) => component.status === "Printed");
    const paired = printed.filter((component) => isPairComponent(component));
    const singles = printed.filter((component) => !isPairComponent(component));
    return [
      ...(paired.length > 0
        ? [{
            key: `${item.id}-pair`,
            label: `${item.product_name}: ${paired.map((component) => component.component_code).join(" / ")}`,
            componentIds: paired.map((component) => component.id),
          }]
        : []),
      ...singles.map((component) => ({
        key: `${item.id}-${component.id}`,
        label: `${item.product_name}: ${component.component_code}`,
        componentIds: [component.id],
      })),
    ];
  });
}

function isPairComponent(component: ProductionComponent): boolean {
  return ["LITF", "LITB", "WALF", "WALB"].includes(component.component_code);
}

function orderContainsComponent(order: OrderDetail | undefined, componentId: number): boolean {
  return Boolean(
    order?.items.some((item) =>
      item.components?.some((component) => component.id === componentId),
    ),
  );
}

function ReprintItemPicker({
  order,
  listEligibleCount,
  selectedComponentIds,
  onToggle,
}: {
  order: OrderDetail;
  listEligibleCount: number;
  selectedComponentIds: Set<number>;
  onToggle: (componentIds: number[]) => void;
}) {
  const groups = reprintGroups(order);
  return (
    <section
      aria-label={`Printed items for order ${order.order_number}`}
      style={{
        background: "var(--surface-card)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        padding: "var(--space-3)",
      }}
    >
      <strong style={{ color: "var(--text-hi)", fontSize: 13 }}>
        Order {order.order_number} — Printed items
      </strong>
      {groups.length === 0 ? (
        <span style={{ color: "var(--text-lo)", fontSize: 12 }}>
          {listEligibleCount > 0
            ? "These items are no longer available for reprint — their status changed since the list loaded."
            : "No Printed items are available for reprint."}
        </span>
      ) : (
        groups.map((group) => {
          const checked = group.componentIds.every((id) => selectedComponentIds.has(id));
          return (
            <label key={group.key} style={{ alignItems: "center", display: "flex", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(group.componentIds)}
              />
              <span>{group.label}</span>
              {group.componentIds.length > 1 && (
                <span style={{ color: "var(--text-lo)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  paired
                </span>
              )}
            </label>
          );
        })
      )}
    </section>
  );
}

function inlineButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: "transparent",
    border: "none",
    color: disabled ? "var(--text-lo)" : "var(--spice-400)",
    cursor: disabled ? "not-allowed" : "pointer",
    font: "inherit",
    opacity: disabled ? 0.55 : 1,
    padding: 0,
  };
}

function bulkButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "var(--surface-muted)" : "var(--spice-500)",
    border: "1px solid var(--line-spice)",
    borderRadius: "var(--radius-sm)",
    color: disabled ? "var(--text-lo)" : "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 12px",
  };
}

function StatusMultiSelect({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {STATUS_FILTER_VALUES.map((value) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            aria-pressed={active}
            style={{
              alignItems: "center",
              // Lighter than the table: shorter, thinner weight, subtler border
              // so the Orders table stays the primary object (Decision #105).
              background: active ? "var(--spice-tint)" : "transparent",
              border: `1px solid ${active ? "var(--line-spice)" : "var(--line)"}`,
              borderRadius: "var(--radius-pill)",
              color: active ? "var(--spice-400)" : "var(--text-mid)",
              cursor: "pointer",
              display: "inline-flex",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              gap: 6,
              height: 28,
              letterSpacing: "0.06em",
              padding: "0 10px",
              textTransform: "uppercase",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            {active && <Icon name="check" size={11} />}
            {value}
          </button>
        );
      })}
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
      <span>{count} orders</span>
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
    border: "1px solid var(--border)",
    borderRadius: 5,
    color: disabled ? "var(--text-lo)" : "var(--text-hi)",
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
  return "Orders unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view orders.";
  }
  return error.message || "Orders data could not be loaded.";
}
