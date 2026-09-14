"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, ConfirmModal, DataTable, EmptyState, ErrorAlert, Input, LoadingState, StatusBadge } from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { StatusKey } from "@/components/status-key/StatusKey";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import {
  ApiError,
  checkoutSandboxOrders,
  generateSandboxBatchPptx,
  getSandboxBatches,
  getSandboxSkus,
  resetSandboxData,
} from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { group, SANDBOX_BATCH_STATUS_KEY } from "@/lib/statusKeys";
import type { BatchItem, SandboxBatch, SandboxSku } from "@/lib/types";

const MAX_ORDER_GROUPS = 7;
const MAX_QUANTITY_PER_ITEM = 10;

function emptyOrderGroup(): Record<string, number> {
  return {};
}

interface SandboxOrderRow {
  key: string;
  order_number: string | null;
  sku: string | null;
  component_code: string;
  status: string;
  batch_label: string;
}

export function SandboxScreen() {
  const [batches, setBatches] = useState<SandboxBatch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const [resetting, setResetting] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<ApiError | Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);
  const taskPolling = useTaskPolling({ requireOutputReady: true });

  const [skus, setSkus] = useState<SandboxSku[] | null>(null);
  const [orderGroups, setOrderGroups] = useState<Record<string, number>[]>([emptyOrderGroup()]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<ApiError | Error | null>(null);

  const loadBatches = useCallback(() => {
    setLoading(true);
    return getSandboxBatches()
      .then((payload) => {
        setBatches(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error("Sandbox batches request failed"));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getSandboxSkus()
      .then((payload) => setSkus(payload))
      .catch(() => setSkus([]));
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (taskPolling.state === "succeeded") {
      setActionSuccess("Sandbox PPTX regenerated.");
      setActiveBatchId(null);
      void loadBatches();
    } else if (taskPolling.state === "failed" || taskPolling.state === "timed_out") {
      setActionError(taskPolling.error ?? new Error("Sandbox PPTX generation did not complete."));
      setActiveBatchId(null);
    }
  }, [loadBatches, taskPolling.error, taskPolling.state]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const result = await resetSandboxData();
      setActionSuccess(
        `Sandbox data reset: ${result.orders_deleted} order(s), ` +
          `${result.components_deleted} component(s), and ${result.batches_deleted} ` +
          `batch(es) cleared.`,
      );
      setResetConfirmOpen(false);
      await loadBatches();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Sandbox reset failed"));
    } finally {
      setResetting(false);
    }
  }, [loadBatches]);

  const setQuantity = useCallback((groupIndex: number, sku: string, quantity: number) => {
    setOrderGroups((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) return group;
        const next = { ...group };
        if (quantity > 0) {
          next[sku] = quantity;
        } else {
          delete next[sku];
        }
        return next;
      }),
    );
  }, []);

  const addOrderGroup = useCallback(() => {
    setOrderGroups((prev) => (prev.length >= MAX_ORDER_GROUPS ? prev : [...prev, emptyOrderGroup()]));
  }, []);

  const removeOrderGroup = useCallback((groupIndex: number) => {
    setOrderGroups((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== groupIndex)));
  }, []);

  const handleCheckout = useCallback(async () => {
    const nonEmptyGroups = orderGroups.filter((group) => Object.keys(group).length > 0);
    if (nonEmptyGroups.length === 0) {
      setCheckoutError(new Error("Select at least one SKU quantity before checking out."));
      return;
    }
    setCheckingOut(true);
    setCheckoutError(null);
    setActionSuccess(null);
    try {
      const result = await checkoutSandboxOrders({ order_groups: nonEmptyGroups });
      setActionSuccess(
        `Sandbox checkout: ${result.orders_created} order(s) created ` +
          `(${result.order_numbers.join(", ")}), ${result.components_touched} component(s) touched.`,
      );
      setOrderGroups([emptyOrderGroup()]);
      await loadBatches();
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err : new Error("Sandbox checkout failed"));
    } finally {
      setCheckingOut(false);
    }
  }, [loadBatches, orderGroups]);

  const handleGenerate = useCallback(
    async (batchId: number) => {
      setActionError(null);
      setActionSuccess(null);
      setActiveBatchId(batchId);
      taskPolling.reset();
      try {
        const result = await generateSandboxBatchPptx(batchId);
        if (!result.task_id) {
          throw new Error("Sandbox PPTX generation did not return a task id.");
        }
        taskPolling.start(`/api/tasks/${result.task_id}/`);
        setActionSuccess("Sandbox PPTX generation dispatched.");
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err : new Error("Sandbox PPTX generation failed"));
        setActiveBatchId(null);
      }
    },
    [taskPolling],
  );

  const batchColumns = useMemo(
    () => [
      { key: "production_group", header: "Production Group", mono: true },
      { key: "batch_label", header: "Batch" },
      {
        key: "status",
        header: "Status",
        render: (value: unknown) => <StatusBadge status={String(value) as StatusName} size="sm" />,
      },
      { key: "item_count", header: "Components" },
      {
        key: "opened_at",
        header: "Created",
        render: (value: unknown) => formatDate(value as string),
      },
      {
        key: "generated_file_url",
        header: "Drive File",
        render: (value: unknown) => {
          const href = typeof value === "string" && value ? value : null;
          return href ? (
            <a href={href} target="_blank" rel="noreferrer">
              Open file
            </a>
          ) : (
            "—"
          );
        },
      },
      {
        key: "id",
        header: "",
        render: (value: unknown) => {
          const batchId = Number(value);
          const isRunning = activeBatchId === batchId && taskPolling.state === "running";
          return (
            <Button
              variant="outline"
              size="sm"
              loading={isRunning}
              disabled={activeBatchId !== null && activeBatchId !== batchId}
              onClick={() => handleGenerate(batchId)}
            >
              Generate PPTX
            </Button>
          );
        },
      },
    ],
    [activeBatchId, handleGenerate, taskPolling.state],
  );

  const orderRows: SandboxOrderRow[] = useMemo(() => {
    if (!batches) return [];
    const rows: SandboxOrderRow[] = [];
    for (const batch of batches) {
      for (const item of batch.batch_items ?? []) {
        rows.push(rowFromBatchItem(item, batch.batch_label));
      }
    }
    return rows.sort((a, b) => (a.order_number ?? "").localeCompare(b.order_number ?? ""));
  }, [batches]);

  const orderColumns = useMemo(
    () => [
      { key: "order_number", header: "Order" },
      { key: "sku", header: "SKU", mono: true },
      { key: "component_code", header: "Component" },
      {
        key: "status",
        header: "Status",
        render: (value: unknown) => <StatusBadge status={String(value) as StatusName} size="sm" />,
      },
      { key: "batch_label", header: "Batch" },
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
      <SandboxCheckoutPanel
        skus={skus}
        orderGroups={orderGroups}
        onQuantityChange={setQuantity}
        onAddGroup={addOrderGroup}
        onRemoveGroup={removeOrderGroup}
        onSubmit={handleCheckout}
        submitting={checkingOut}
        error={checkoutError}
        onDismissError={() => setCheckoutError(null)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outline"
          loading={resetting}
          disabled={resetting}
          onClick={() => setResetConfirmOpen(true)}
        >
          Reset sandbox data
        </Button>
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        tone="danger"
        title="Reset sandbox data?"
        confirmLabel="Reset"
        cancelLabel="Cancel"
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => { if (!resetting) setResetConfirmOpen(false); }}
      >
        This will fully clear all current sandbox orders, production components, batches, and
        batch items. It will not recreate any orders.
      </ConfirmModal>

      {actionError && (
        <ErrorAlert tone="error" title="Sandbox action failed" onDismiss={() => setActionError(null)}>
          {formatApiError(actionError)}
        </ErrorAlert>
      )}

      {actionSuccess && (
        <ErrorAlert tone="success" title="Sandbox" onDismiss={() => setActionSuccess(null)}>
          {actionSuccess}
        </ErrorAlert>
      )}

      {loading && !batches ? (
        <LoadingState variant="skeleton" rows={6} label="Loading sandbox batches" />
      ) : batches && batches.length === 0 ? (
        <EmptyState icon="refresh-cw" title="NO SANDBOX DATA">
          Pick SKU quantities above and click &quot;Checkout&quot; to create sandbox test orders.
        </EmptyState>
      ) : batches ? (
        <>
          <DataTable columns={batchColumns} rows={batches} rowKey="id" emptyLabel="No sandbox batches" />
          <DataTable
            columns={orderColumns}
            rows={orderRows}
            rowKey="key"
            emptyLabel="No sandbox test orders"
          />
        </>
      ) : null}

      <StatusKey label="Sandbox status key" groups={[group("Batch", SANDBOX_BATCH_STATUS_KEY)]} />
    </div>
  );
}

interface SandboxCheckoutPanelProps {
  skus: SandboxSku[] | null;
  orderGroups: Record<string, number>[];
  onQuantityChange: (groupIndex: number, sku: string, quantity: number) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupIndex: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: ApiError | Error | null;
  onDismissError: () => void;
}

/** Decision #58: pick a quantity (0-10) per SKU, across up to 7 independently
 * composed order groups, each becoming one new TEST- order at checkout. */
function SandboxCheckoutPanel({
  skus,
  orderGroups,
  onQuantityChange,
  onAddGroup,
  onRemoveGroup,
  onSubmit,
  submitting,
  error,
  onDismissError,
}: SandboxCheckoutPanelProps) {
  const hasSelection = orderGroups.some((group) => Object.keys(group).length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Checkout sandbox orders</strong>
        <Button
          variant="outline"
          size="sm"
          disabled={orderGroups.length >= MAX_ORDER_GROUPS}
          onClick={onAddGroup}
        >
          Add order group ({orderGroups.length}/{MAX_ORDER_GROUPS})
        </Button>
      </div>

      {error && (
        <ErrorAlert tone="error" title="Checkout failed" onDismiss={onDismissError}>
          {formatApiError(error)}
        </ErrorAlert>
      )}

      {!skus ? (
        <LoadingState variant="skeleton" rows={2} label="Loading sandbox SKUs" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {orderGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                border: "1px solid var(--color-border-subtle, var(--color-border))",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Order {groupIndex + 1}</span>
                {orderGroups.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => onRemoveGroup(groupIndex)}>
                    Remove
                  </Button>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "var(--space-2)",
                }}
              >
                {skus.map((sku) => (
                  <Input
                    key={sku.sku}
                    label={sku.sku}
                    type="number"
                    mono
                    value={String(group[sku.sku] ?? 0)}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const clamped = Number.isFinite(raw)
                        ? Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM, Math.trunc(raw)))
                        : 0;
                      onQuantityChange(groupIndex, sku.sku, clamped);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Button variant="primary" loading={submitting} disabled={submitting || !hasSelection} onClick={onSubmit}>
          Checkout
        </Button>
      </div>
    </div>
  );
}

function rowFromBatchItem(item: BatchItem, batchLabel: string): SandboxOrderRow {
  const component = item.component;
  return {
    key: `${item.id}`,
    order_number: component?.order_number ?? null,
    sku: component?.sku ?? null,
    component_code: component?.component_code ?? "—",
    status: component?.status ?? "—",
    batch_label: batchLabel,
  };
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Sandbox unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view the sandbox.";
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
