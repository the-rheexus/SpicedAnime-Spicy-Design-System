"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  ConfirmModal,
  DataTable,
  ErrorAlert,
  Icon,
  IconButton,
  LoadingState,
  StatusBadge,
} from "@/components/ds";
import { SelectCheckbox } from "@/components/batches/SelectCheckbox";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { StatusKey } from "@/components/status-key/StatusKey";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { formatDateTime } from "@/lib/datetime";
import {
  ApiError,
  flagComponentReprint,
  generateBatchPptx,
  getBatch,
  markBatchPrinted,
  previewBatchPptx,
} from "@/lib/api";
import {
  BATCH_STATUS_KEY,
  COMPONENT_STATUS_KEY,
  componentStatusDisplayLabel,
  group,
} from "@/lib/statusKeys";
import type {
  BatchItem,
  GeneratedFile,
  PptxPreviewTaskResult,
  PptxTaskSuccessResult,
  ProductionBatch,
  ProductionComponent,
} from "@/lib/types";

interface BatchDetailScreenProps {
  batchId: string;
}

type ConfirmAction = "generate" | "mark-printed" | { reprintComponentId: number } | null;

/** Tri-state Order ID sort: unsorted → ascending → descending → unsorted. */
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

/**
 * Front/back component codes that must be selected and submitted together.
 * Mirrors the server-side pair expansion; the server re-validates regardless.
 */
const FRONT_CODES = new Set(["LITF", "WALF"]);
const BACK_CODES = new Set(["LITB", "WALB"]);

function isPairCode(componentCode: string): boolean {
  return FRONT_CODES.has(componentCode) || BACK_CODES.has(componentCode);
}

/** Component IDs sharing this component's order item and forming its pair. */
function pairMemberIds(
  component: ProductionComponent,
  components: ProductionComponent[],
): number[] {
  if (!isPairCode(component.component_code) || component.order_item_id === undefined) {
    return [component.id];
  }
  return components
    .filter(
      (candidate) =>
        candidate.order_item_id === component.order_item_id &&
        isPairCode(candidate.component_code),
    )
    .map((candidate) => candidate.id);
}

export function BatchDetailScreen({ batchId }: BatchDetailScreenProps) {
  const [batch, setBatch] = useState<ProductionBatch | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<ApiError | Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [verifiedTaskOutputId, setVerifiedTaskOutputId] = useState<number | null>(null);
  // Transient UI state only, keyed by component ID so it survives re-sorting
  // and re-fetching. Never persisted, never sent as an ordering hint.
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [orderSort, setOrderSort] = useState<OrderSort>("none");
  // Convenience view filter only — never affects selection state, PPTX
  // placement order, or generation behavior.
  const [colorFilter, setColorFilter] = useState<string>("");

  const taskPolling = useTaskPolling({ requireOutputReady: true });

  // Decision #72: batch preview is independent of the Generate PPTX flow
  // above — no lock transition, no replacement batch, and nothing to refresh
  // on the batch itself — so it gets its own pending/error/result state and
  // its own polling instance rather than sharing taskPolling.
  const [previewPending, setPreviewPending] = useState(false);
  const [previewError, setPreviewError] = useState<ApiError | Error | null>(null);
  const [previewResult, setPreviewResult] = useState<PptxPreviewTaskResult | null>(null);
  const previewPolling = useTaskPolling();

  const loadBatch = useCallback(async (): Promise<ProductionBatch | null> => {
    try {
      const payload = await getBatch(batchId);
      setBatch(payload);
      setError(null);
      return payload;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error("Batch request failed"));
      return null;
    }
  }, [batchId]);

  useEffect(() => {
    let active = true;
    if (active) {
      loadBatch();
    }
    return () => {
      active = false;
    };
  }, [loadBatch]);

  useEffect(() => {
    let active = true;
    if (taskPolling.state === "succeeded") {
      void loadBatch().then((refreshedBatch) => {
        if (!active) return;
        const result = pptxTaskResult(taskPolling.data?.result);
        const persistedOutput = refreshedBatch
          ? currentPptxOutput(refreshedBatch, result?.generated_file_id)
          : null;
        if (
          result &&
          refreshedBatch &&
          result.batch_id === refreshedBatch.id &&
          persistedOutput
        ) {
          setVerifiedTaskOutputId(persistedOutput.id);
          setActionError(null);
          setActionSuccess("PPTX generation complete.");
        } else {
          setVerifiedTaskOutputId(null);
          setActionSuccess(null);
          setActionError(
            new Error(
              "PPTX generation did not produce the matching persisted PPTX output. Retry generation.",
            ),
          );
        }
      });
    } else if (taskPolling.state === "failed") {
      setVerifiedTaskOutputId(null);
      setActionSuccess(null);
      setActionError(taskPolling.error ?? new Error("PPTX generation failed."));
      void loadBatch();
    } else if (taskPolling.state === "timed_out") {
      setVerifiedTaskOutputId(null);
      setActionSuccess(null);
      setActionError(new Error("PPTX generation is taking longer than expected. Refresh to check status."));
      void loadBatch();
    }
    return () => {
      active = false;
    };
  }, [loadBatch, taskPolling.data, taskPolling.error, taskPolling.state]);

  const handleGeneratePptx = useCallback(
    async (componentIds: number[]) => {
      setActionPending(true);
      setActionError(null);
      setActionSuccess(null);
      setVerifiedTaskOutputId(null);
      try {
        const result = await generateBatchPptx(batchId, componentIds);
        setConfirmAction(null);
        setSelectedIds([]);
        await loadBatch();
        if (result.task_id) {
          taskPolling.start(`/api/tasks/${result.task_id}/`);
        } else {
          setActionError(
            new Error("PPTX generation was queued without a task ID. Refresh before retrying."),
          );
        }
      } catch (err: unknown) {
        setActionError(toGenerateError(err));
      } finally {
        setActionPending(false);
      }
    },
    [batchId, loadBatch, taskPolling],
  );

  useEffect(() => {
    if (previewPolling.state === "succeeded") {
      const result = previewPolling.data?.result as PptxPreviewTaskResult | undefined;
      if (result?.share_url) {
        setPreviewResult(result);
        setPreviewError(null);
      } else {
        setPreviewResult(null);
        setPreviewError(new Error("Preview generation did not return a Drive link. Retry."));
      }
    } else if (previewPolling.state === "failed" || previewPolling.state === "timed_out") {
      setPreviewResult(null);
      setPreviewError(previewPolling.error ?? new Error("Preview generation did not complete."));
    }
  }, [previewPolling.data, previewPolling.error, previewPolling.state]);

  const handlePreviewPptx = useCallback(async () => {
    setPreviewPending(true);
    setPreviewError(null);
    setPreviewResult(null);
    previewPolling.reset();
    try {
      const result = await previewBatchPptx(batchId);
      if (result.task_id) {
        previewPolling.start(`/api/tasks/${result.task_id}/`);
      } else {
        setPreviewError(new Error("Preview PPTX was queued without a task ID. Retry."));
      }
    } catch (err: unknown) {
      setPreviewError(err instanceof Error ? err : new Error("Preview PPTX request failed"));
    } finally {
      setPreviewPending(false);
    }
  }, [batchId, previewPolling]);

  const handleMarkPrinted = useCallback(async () => {
    setActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const result = await markBatchPrinted(batchId);
      setConfirmAction(null);
      setActionSuccess(`Batch marked printed. ${result.components_marked_printed} component(s) updated.`);
      await loadBatch();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Mark Printed request failed"));
    } finally {
      setActionPending(false);
    }
  }, [batchId, loadBatch]);

  const handleFlagReprint = useCallback(
    async (componentId: number) => {
      setActionPending(true);
      setActionError(null);
      setActionSuccess(null);
      try {
        await flagComponentReprint(componentId);
        setConfirmAction(null);
        setActionSuccess(`Component ${componentId} flagged for reprint.`);
        await loadBatch();
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err : new Error("Flag Reprint request failed"));
      } finally {
        setActionPending(false);
      }
    },
    [loadBatch],
  );

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  if (!batch) {
    return <LoadingState variant="skeleton" rows={8} label="Loading batch detail" />;
  }

  const canGenerate = batch.status === "Open";
  const showMarkPrinted = batch.status === "Locked for Review";
  const persistedPptxOutput = currentPptxOutput(batch);
  const currentTaskAllowsPrinting =
    taskPolling.state === "idle" ||
    (taskPolling.state === "succeeded" &&
      persistedPptxOutput?.id === verifiedTaskOutputId);
  const canMarkPrinted = Boolean(
    showMarkPrinted && persistedPptxOutput && currentTaskAllowsPrinting,
  );
  const batchItems: BatchItem[] = batch.batch_items ?? [];
  // Default (unsorted) order is the existing component-ID order the API returns.
  const componentRows: ProductionComponent[] = batchItems.map(
    (bi) => bi.component as ProductionComponent,
  );
  const selectableRows = componentRows.filter(isSelectable);
  // Selection is authoritative only for currently eligible component IDs.
  // This preserves selections across visual changes while ensuring a refresh
  // cannot display or submit a stale component as an active selection.
  const selectableIdSet = new Set(selectableRows.map((row) => row.id));
  const selectedEligibleIds = selectedIds.filter((id) => selectableIdSet.has(id));
  const selectedSet = new Set(selectedEligibleIds);
  const selectedCount = selectedEligibleIds.length;
  const selectableCount = selectableRows.length;
  const allSelected = selectableCount > 0 && selectedCount === selectableCount;
  const someSelected = selectedCount > 0 && !allSelected;
  const subsetSelected = selectedCount > 0 && !allSelected;
  // The action label and request payload deliberately share this exact
  // canonical state: no selection or all eligible selections use the backend
  // full-batch branch; only a proper subset sends component IDs.
  const generationComponentIds = subsetSelected ? selectedEligibleIds : [];
  const generationActionLabel = subsetSelected
    ? "Generate PPTX (Selected Items)"
    : "Generate PPTX (All Items)";

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : selectableRows.map((row) => row.id));
  };

  const toggleRow = (row: ProductionComponent) => {
    if (!isSelectable(row)) return;
    // Pair halves move together so a half pair can never be submitted.
    const affected = pairMemberIds(row, selectableRows);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(row.id)) {
        affected.forEach((id) => next.delete(id));
      } else {
        affected.forEach((id) => next.add(id));
      }
      return Array.from(next).sort((a, b) => a - b);
    });
  };

  const sortedRows =
    orderSort === "none"
      ? componentRows
      : [...componentRows].sort((left, right) => {
          const direction = orderSort === "asc" ? 1 : -1;
          const comparison = compareOrderIds(left, right);
          // Component ID breaks ties so the visual order stays deterministic.
          return comparison !== 0 ? comparison * direction : left.id - right.id;
        });

  // Colors present among this batch's components (Decision #57). Empty when
  // no component carries a resolvable border colour, in which case the
  // filter control stays hidden entirely.
  const availableColors = Array.from(
    new Set(componentRows.map((row) => row.color).filter((value): value is string => Boolean(value))),
  ).sort();
  const displayRows =
    colorFilter && availableColors.includes(colorFilter)
      ? sortedRows.filter((row) => row.color === colorFilter)
      : sortedRows;

  const componentColumns = [
    {
      key: "__select",
      header: (
        <SelectCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={selectableCount === 0}
          onChange={toggleAll}
          label={allSelected ? "Deselect all items" : "Select all items"}
        />
      ),
      width: 44,
      render: (_value: unknown, row: ProductionComponent) => {
        const selected = selectedSet.has(row.id);
        const autoIncluded =
          !selected && isPairCode(row.component_code)
            ? pairMemberIds(row, selectableRows).some((id) => selectedSet.has(id))
            : false;
        return (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            onClick={(event) => event.stopPropagation()}
          >
            <SelectCheckbox
              checked={selected || autoIncluded}
              disabled={!isSelectable(row)}
              onChange={() => toggleRow(row)}
              label={`Select component ${row.component_code} ${row.id}`}
            />
            {autoIncluded && (
              <span
                title="Included automatically to keep the front/back pair together"
                style={{ color: "var(--text-lo)", fontSize: 10 }}
              >
                pair
              </span>
            )}
          </span>
        );
      },
    },
    // P95 A8: column order is Checkbox | Order | Design | Component | Color |
    // Family | Config | Order Date | SKU | Status | Failure (+ the trailing
    // reprint action). The Batch Group column is removed — it repeated the
    // page header's Production Group value on every row.
    {
      key: "order_number",
      header: (
        <button
          type="button"
          onClick={() => setOrderSort(NEXT_ORDER_SORT[orderSort])}
          // The sortable cell lives inside the shared DataTable's own <th>, so
          // the direction is announced through the button's accessible name
          // rather than an aria-sort attribute the button role does not support.
          aria-label={`Sort by Order ID (currently ${ORDER_SORT_LABEL[orderSort]})`}
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
          Order
          <Icon
            name={orderSort === "none" ? "chevrons-up-down" : "chevron-down"}
            size={12}
            style={{
              opacity: orderSort === "none" ? 0.4 : 1,
              transform: orderSort === "asc" ? "rotate(180deg)" : "none",
            }}
          />
          <span data-testid="order-sort-state" style={visuallyHidden}>
            {ORDER_SORT_LABEL[orderSort]}
          </span>
        </button>
      ),
      mono: true,
    },
    { key: "design_code", header: "Design", mono: true },
    { key: "component_code", header: "Component", mono: true },
    ...(availableColors.length > 0
      ? [{ key: "color", header: "Color", render: (value: unknown) => (value as string) || "—" }]
      : []),
    { key: "family_code", header: "Family", mono: true },
    { key: "config_code", header: "Config", mono: true },
    {
      key: "order_date",
      header: "Order Date",
      render: (value: unknown) => formatDate(value as string | null | undefined),
    },
    { key: "sku", header: "SKU", mono: true },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => (
        <StatusBadge
          status={value as StatusName}
          label={componentStatusDisplayLabel(value as string)}
          size="sm"
        />
      ),
    },
    { key: "validation_failure_code", header: "Failure", mono: true },
    {
      key: "id",
      header: "",
      align: "right" as const,
      render: (_value: unknown, row: ProductionComponent) =>
        row.status === "Printed" ? (
          <IconButton
            icon="rotate-ccw"
            label="Flag for reprint"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({ reprintComponentId: row.id });
            }}
          />
        ) : null,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Card
        title={`${batch.production_group.toUpperCase()} BATCH #${batch.batch_number}`}
        eyebrow="Batch Detail"
        accent
        action={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {canGenerate && (
              <Button
                variant="primary"
                onClick={() => setConfirmAction("generate")}
                disabled={actionPending || taskPolling.state === "running"}
                loading={taskPolling.state === "running"}
              >
                {generationActionLabel}
              </Button>
            )}
            {showMarkPrinted && (
              <Button
                variant="primary"
                onClick={() => setConfirmAction("mark-printed")}
                disabled={actionPending || !canMarkPrinted}
              >
                Mark Printed
              </Button>
            )}
            {canGenerate && (
              <Button
                variant="secondary"
                onClick={handlePreviewPptx}
                disabled={previewPending || previewPolling.state === "running"}
                loading={previewPending || previewPolling.state === "running"}
              >
                Download Preview PPTX
              </Button>
            )}
          </div>
        }
      >
        <div
          style={{
            display: "grid",
            gap: "var(--space-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          <Field label="Status">
            <StatusBadge status={batch.status as StatusName} size="sm" />
          </Field>
          <Field label="Production Group">{batch.production_group}</Field>
          <Field label="Batch Label">{batch.batch_label}</Field>
          <Field label="Opened">{formatDate(batch.opened_at)}</Field>
          <Field label="Locked">{formatDate(batch.locked_at)}</Field>
          <Field label="Printed">{formatDate(batch.printed_at)}</Field>
        </div>

        {persistedPptxOutput && (
          <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: 6 }}>
            <FieldLabel>Generated Files</FieldLabel>
            <a
              href={persistedPptxOutput.drive_share_url ?? undefined}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--spice-400)" }}
            >
              Download latest PPTX
            </a>
          </div>
        )}

        {previewResult && (
          <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: 6 }}>
            <FieldLabel>Preview PPTX</FieldLabel>
            <a
              href={previewResult.share_url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--spice-400)" }}
            >
              Open latest preview ({previewResult.filename})
            </a>
          </div>
        )}
      </Card>

      {(previewPending || previewPolling.state === "running") && (
        <ErrorAlert tone="info" title="Preview generation in progress">
          PPTX preview is running in the background. A Drive link will appear here on completion.
        </ErrorAlert>
      )}

      {previewError && (
        <ErrorAlert tone="error" title="Preview failed" onDismiss={() => setPreviewError(null)}>
          {previewError.message}
        </ErrorAlert>
      )}

      {taskPolling.state === "running" && (
        <ErrorAlert tone="info" title="Generation in progress">
          PPTX generation is running in the background. This screen will refresh automatically on completion.
        </ErrorAlert>
      )}

      {showMarkPrinted && !persistedPptxOutput && taskPolling.state !== "running" && (
        <ErrorAlert tone="warning" title="PPTX output required">
          Mark Printed stays disabled until this batch has a current persisted PPTX with a usable Drive link.
          Retry Generate PPTX after the batch recovers to Open.
        </ErrorAlert>
      )}

      {actionError && (
        <ErrorAlert tone="error" title="Action failed" onDismiss={() => setActionError(null)}>
          {actionError.message}
        </ErrorAlert>
      )}

      {actionSuccess && (
        <ErrorAlert tone="success" title="Success" onDismiss={() => setActionSuccess(null)}>
          {actionSuccess}
        </ErrorAlert>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div
          style={{
            alignItems: "baseline",
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "space-between",
          }}
        >
          <SectionTitle>Batch Items</SectionTitle>
          <span
            data-testid="selection-count"
            aria-live="polite"
            style={{
              color: "var(--text-lo)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            {selectedCount} of {selectableCount} items selected
          </span>
        </div>
        {availableColors.length > 0 && (
          <ColorFilter colors={availableColors} value={colorFilter} onChange={setColorFilter} />
        )}
        <DataTable
          columns={componentColumns}
          rows={displayRows}
          rowKey="id"
          emptyLabel={colorFilter ? "No components match this color" : "No components in this batch"}
          virtualize
          virtualThreshold={80}
          virtualRowHeight={52}
          virtualOverscan={6}
          scrollHeight={576}
        />
      </section>

      <ConfirmModal
        open={confirmAction === "generate"}
        tone="warning"
        title={
          subsetSelected
            ? "Generate PPTX for the selected items?"
            : "Generate PPTX for this batch?"
        }
        confirmLabel={generationActionLabel}
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={() => handleGeneratePptx(generationComponentIds)}
        onCancel={() => setConfirmAction(null)}
      >
        {subsetSelected
          ? `This moves the ${selectedCount} selected item(s) into a new Locked for Review batch and dispatches PPTX generation. The remaining item(s) stay in this Open batch.`
          : "This locks the batch for review and dispatches PPTX generation. A new Open batch is created for this production group."}
      </ConfirmModal>

      <ConfirmModal
        open={confirmAction === "mark-printed"}
        tone="warning"
        title="Confirm batch was physically printed?"
        confirmLabel="Mark Printed"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={handleMarkPrinted}
        onCancel={() => setConfirmAction(null)}
      >
        This marks the batch and its Ready components Printed, and may promote related orders to In Production.
      </ConfirmModal>

      <ConfirmModal
        open={typeof confirmAction === "object" && confirmAction !== null && "reprintComponentId" in confirmAction}
        tone="warning"
        title="Flag this component for reprint?"
        confirmLabel="Flag Reprint"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={() => {
          if (confirmAction && typeof confirmAction === "object" && "reprintComponentId" in confirmAction) {
            handleFlagReprint(confirmAction.reprintComponentId);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      >
        This transitions the printed component to Reprint Needed and creates a new replacement component in the
        current Open batch.
      </ConfirmModal>

      <StatusKey
        label="Batch Detail status key"
        groups={[
          group("Batch", BATCH_STATUS_KEY),
          group("Component", COMPONENT_STATUS_KEY),
        ]}
      />
    </div>
  );
}

const visuallyHidden: React.CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
};

/** Only validated, batch-resident components can be sent for generation. */
function isSelectable(component: ProductionComponent): boolean {
  return component.status === "Ready";
}

function compareOrderIds(left: ProductionComponent, right: ProductionComponent): number {
  const leftKey = left.order_number ?? "";
  const rightKey = right.order_number ?? "";
  return leftKey.localeCompare(rightKey, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Turn a rejected selective-generation request into the operator-facing
 * refresh message. Non-stale failures keep their original message.
 */
function toGenerateError(err: unknown): Error {
  if (err instanceof ApiError) {
    const details = err.details as
      | { error_code?: string; stale_component_labels?: string[]; stale_component_ids?: number[] }
      | undefined;
    if (details?.error_code === "STALE_SELECTION") {
      const labels =
        details.stale_component_labels?.length
          ? details.stale_component_labels
          : (details.stale_component_ids ?? []).map((id) => `#${id}`);
      return new Error(
        `Some selected items are no longer available: ${labels.join(", ")}. ` +
          "Refresh the page and try again.",
      );
    }
  }
  return err instanceof Error ? err : new Error("Generate PPTX request failed");
}

function pptxTaskResult(value: unknown): PptxTaskSuccessResult | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PptxTaskSuccessResult>;
  if (
    candidate.task_type !== "pptx_generation" ||
    typeof candidate.batch_id !== "number" ||
    typeof candidate.generated_file_id !== "number"
  ) {
    return null;
  }
  return candidate as PptxTaskSuccessResult;
}

// Mirrors the backend's PPTX_LOCK_CLOCK_SKEW_TOLERANCE (views.py): locked_at and
// a generated file's created_at are written by separate backend processes (web
// vs Celery worker) with independently synced clocks, so a small amount of
// ordinary clock skew must not be misread as stale output.
const PPTX_LOCK_CLOCK_SKEW_TOLERANCE_MS = 10_000;

function currentPptxOutput(
  batch: ProductionBatch,
  expectedGeneratedFileId?: number,
): GeneratedFile | null {
  const batchUrl = batch.generated_file_url?.trim() ?? "";
  const lockedAt = batch.locked_at ? Date.parse(batch.locked_at) : Number.NaN;
  if (!batchUrl || !Number.isFinite(lockedAt)) return null;

  const candidates = (batch.generated_files ?? [])
    .filter((file) => {
      const fileUrl = file.drive_share_url?.trim() ?? "";
      const driveFileId = file.drive_file_id?.trim() ?? "";
      const createdAt = Date.parse(file.created_at);
      return (
        file.file_type.toLowerCase() === "pptx" &&
        (expectedGeneratedFileId === undefined || file.id === expectedGeneratedFileId) &&
        Boolean(fileUrl) &&
        Boolean(driveFileId) &&
        fileUrl === batchUrl &&
        Number.isFinite(createdAt) &&
        createdAt >= lockedAt - PPTX_LOCK_CLOCK_SKEW_TOLERANCE_MS
      );
    })
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
  return candidates[0] ?? null;
}

function ColorFilter({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const options = ["", ...colors];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((color) => {
        const active = value === color;
        return (
          <button
            key={color || "all"}
            type="button"
            onClick={() => onChange(color)}
            aria-pressed={active}
            style={{
              alignItems: "center",
              background: active ? "var(--spice-tint)" : "transparent",
              border: `1px solid ${active ? "var(--line-spice)" : "var(--line-strong)"}`,
              borderRadius: "var(--radius-pill)",
              color: active ? "var(--spice-400)" : "var(--text-mid)",
              cursor: "pointer",
              display: "inline-flex",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              gap: 6,
              height: 32,
              letterSpacing: "0.08em",
              padding: "0 12px",
              textTransform: "uppercase",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            {active && <Icon name="check" size={12} />}
            {color || "All Colors"}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FieldLabel>{label}</FieldLabel>
      <span style={{ color: "var(--text-hi)" }}>{children}</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: "var(--text-lo)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        color: "var(--text-hi)",
        fontFamily: "var(--font-sans)",
        fontSize: 16,
        letterSpacing: "0.06em",
        margin: 0,
        textTransform: "uppercase",
      }}
    >
      {children}
    </h2>
  );
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "Batch not found";
  }
  return "Batch unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view this batch.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "This batch does not exist or has been removed.";
  }
  return error.message || "Batch data could not be loaded.";
}
