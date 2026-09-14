"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AgingFlag,
  Badge,
  Button,
  Card,
  ConfirmModal,
  DataTable,
  ErrorAlert,
  Icon,
  LoadingState,
  PairBracket,
  SegmentedSku,
  StatusBadge,
} from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import type { IconName } from "@/components/ds/core/Icon";
import { formatDateTime } from "@/lib/datetime";
import { useArtworkThumbnail } from "@/hooks/useArtworkThumbnail";
import { StatusKey } from "@/components/status-key/StatusKey";
import { auditActorLabel, auditEntityLabel } from "@/lib/audit";
import {
  ApiError,
  flagComponentReprint,
  getOrder,
  getOrderHistory,
  reimportOrder,
} from "@/lib/api";
import { COMPONENT_STATUS_KEY, ORDER_STATUS_KEY, componentStatusDisplayLabel, group } from "@/lib/statusKeys";
import { validationFailureShortLabel } from "@/lib/validationLabels";
import type {
  AuditEvent,
  OrderDetail,
  OrderArtwork,
  OrderGeneratedFile,
  OrderItem,
  OrderReimportResult,
  ProductionComponent,
} from "@/lib/types";

interface OrderDetailScreenProps {
  orderId: string;
}

// Per Order_Status_and_Batch_Lifecycle_SOT.md / Web_App_Screen_Inventory_and_UX_Flow.md §2.3:
// these families are not produced and must be listed separately from produced items.
const NON_PRODUCED_FAMILIES = ["BAT", "HOD", "PIL", "TAP", "TOT"] as const;

// Decision #86 / §6: front/back pairs that move as one unit.
const PAIR_COMPONENT_CODES = ["LITF", "LITB", "WALF", "WALB"] as const;

// Terminal order states never show the aging flag (existing behavior, preserved).
const AGING_SUPPRESSED_STATUSES = ["Fulfilled Externally", "Canceled"] as const;

type TabId = "production" | "items" | "files" | "history";
const TAB_IDS: TabId[] = ["production", "items", "files", "history"];
const TAB_LABELS: Record<TabId, string> = {
  production: "Production",
  items: "Order items",
  files: "Files and reprints",
  history: "History",
};

function initialTab(): TabId {
  if (typeof window === "undefined") return "production";
  const raw = new URLSearchParams(window.location.search).get("tab");
  return TAB_IDS.includes(raw as TabId) ? (raw as TabId) : "production";
}

/** Friendly validation-failure label (Decision #88c) with the raw code as secondary detail. */
function FailureCell({ code }: { code?: string | null }) {
  if (!code) return <>—</>;
  const short = validationFailureShortLabel(code);
  if (!short) {
    // Reported: a code with no entry in the SOT short-label table.
    return <span title="No operator-facing short label defined for this code">{code}</span>;
  }
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <span style={{ color: "var(--text-hi)" }}>{short}</span>
      <span style={{ color: "var(--text-low)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{code}</span>
    </span>
  );
}

function SourceArtworkThumbnail({ artwork, component }: { artwork: OrderArtwork; component: ProductionComponent }) {
  const { failed, imageUrl, loading } = useArtworkThumbnail(artwork.id);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [artwork.id]);

  if (loading) {
    return <span role="status" style={{ color: "var(--text-low)", fontSize: 12 }}>Loading thumbnail…</span>;
  }
  if (failed || imageFailed || !imageUrl) {
    return <span style={{ color: "var(--text-low)", fontSize: 12 }}>Thumbnail unavailable</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`Artwork ${artwork.design_code} for ${component.component_code}`}
      onError={() => setImageFailed(true)}
      style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", height: 88, objectFit: "contain", width: 88 }}
    />
  );
}

export function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reimporting, setReimporting] = useState(false);
  const [reimportResult, setReimportResult] = useState<OrderReimportResult | null>(null);
  const [reimportError, setReimportError] = useState<ApiError | Error | null>(null);
  const [reprintTarget, setReprintTarget] = useState<ProductionComponent | null>(null);
  const [reprinting, setReprinting] = useState(false);
  const [reprintError, setReprintError] = useState<ApiError | Error | null>(null);

  const [tab, setTab] = useState<TabId>(initialTab);

  const [history, setHistory] = useState<AuditEvent[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<Error | null>(null);
  const [historyRequested, setHistoryRequested] = useState(false);
  const [historyNextPage, setHistoryNextPage] = useState<number | null>(null);

  const selectTab = useCallback((next: TabId) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState({}, "", url);
    }
  }, []);

  const loadOrder = useCallback(() => {
    return getOrder(orderId)
      .then((payload) => {
        setOrder(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error("Order request failed"));
      });
  }, [orderId]);

  useEffect(() => {
    let active = true;
    if (active) {
      loadOrder();
    }
    return () => {
      active = false;
    };
  }, [loadOrder]);

  const loadHistory = useCallback((page = 1, append = false) => {
    setHistoryLoading(true);
    return getOrderHistory(orderId, { page })
      .then((res) => {
        setHistory((current) => append ? [...(current ?? []), ...res.results] : res.results);
        setHistoryNextPage(res.next ? page + 1 : null);
        setHistoryError(null);
      })
      .catch((err: unknown) => {
        setHistoryError(err instanceof Error ? err : new Error("History request failed"));
      })
      .finally(() => setHistoryLoading(false));
  }, [orderId]);

  // Decision #103: fetch lazily when History opens, through the dedicated
  // aggregate endpoint for the order, its components, and relevant batches.
  useEffect(() => {
    if (tab !== "history" || !order || historyRequested) return;
    setHistoryRequested(true);
    void loadHistory();
  }, [tab, order, historyRequested, loadHistory]);

  const handleReimport = useCallback(async () => {
    setReimporting(true);
    setReimportError(null);
    try {
      const result = await reimportOrder(orderId);
      setReimportResult(result);
      setConfirmOpen(false);
      await loadOrder();
    } catch (err: unknown) {
      setReimportError(err instanceof Error ? err : new Error("Reimport request failed"));
    } finally {
      setReimporting(false);
    }
  }, [orderId, loadOrder]);

  const handleReprint = useCallback(async () => {
    if (!reprintTarget || reprinting) return;
    setReprinting(true);
    setReprintError(null);
    try {
      await flagComponentReprint(reprintTarget.id);
      setReprintTarget(null);
      setHistoryRequested(false);
      setHistory(null);
      setHistoryNextPage(null);
      await loadOrder();
    } catch (err: unknown) {
      setReprintError(err instanceof Error ? err : new Error("Component reprint request failed"));
    } finally {
      setReprinting(false);
    }
  }, [loadOrder, reprintTarget, reprinting]);

  const allComponents: ProductionComponent[] = useMemo(
    () => (order ? order.items.flatMap((item: OrderItem) => item.components ?? []) : []),
    [order],
  );
  const hasLighterPair = useMemo(
    () => allComponents.some((c) => c.component_code === "LITF" || c.component_code === "LITB"),
    [allComponents],
  );

  const relationshipCell = useCallback(
    (component: ProductionComponent) => {
      const code = component.component_code;
      const inner = (
        <strong style={{ color: "var(--text-hi)", fontFamily: "var(--font-mono)" }}>{code}</strong>
      );
      if (PAIR_COMPONENT_CODES.includes(code as (typeof PAIR_COMPONENT_CODES)[number])) {
        return <PairBracket variant="pair">{inner}</PairBracket>;
      }
      if (code === "TIN" && hasLighterPair) {
        return <PairBracket variant="shared-source">{inner}</PairBracket>;
      }
      return inner;
    },
    [hasLighterPair],
  );

  const componentColumns = useMemo(
    () => [
      {
        key: "component_code",
        header: "Relationship / Component",
        render: (_value: unknown, component: ProductionComponent) => relationshipCell(component),
      },
      { key: "family_code", header: "Family", mono: true },
      { key: "design_code", header: "Design", mono: true },
      { key: "config_code", header: "Config", mono: true },
      { key: "batch_group", header: "Batch Group" },
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
      {
        key: "validation_failure_code",
        header: "Failure",
        render: (value: unknown) => <FailureCell code={value as string | null} />,
      },
      {
        key: "batch_id",
        header: "Batch",
        mono: true,
        render: (value: unknown) =>
          value ? (
            <Link href={`/batches/${value}`} style={{ color: "var(--spice-400)" }}>
              {`#${value}`}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        key: "id",
        header: "Recovery",
        render: (_value: unknown, component: ProductionComponent) =>
          component.status === "Printed" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReprintError(null);
                setReprintTarget(component);
              }}
              disabled={reprinting}
            >
              Flag Reprint
            </Button>
          ) : (
            "—"
          ),
      },
    ],
    [relationshipCell, reprinting],
  );

  const itemColumns = useMemo(
    () => [
      { key: "product_name", header: "Product" },
      {
        key: "sku",
        header: "SKU",
        render: (_value: unknown, item: OrderItem) => (
          <SegmentedSku
            sku={item.sku}
            familyCode={item.family_code ?? undefined}
            designCode={item.design_code ?? undefined}
            options={item.options ?? undefined}
            configCode={item.config_code ?? undefined}
            size="sm"
          />
        ),
      },
      { key: "variant_title", header: "Variant" },
      { key: "quantity", header: "Qty", align: "right" as const },
      {
        key: "validation_failure_code",
        header: "Failure",
        render: (value: unknown) => <FailureCell code={value as string | null} />,
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

  if (!order) {
    return <LoadingState variant="skeleton" rows={8} label="Loading order detail" />;
  }

  const producedItems = order.items.filter(
    (item: OrderItem) => !NON_PRODUCED_FAMILIES.includes(item.family_code as (typeof NON_PRODUCED_FAMILIES)[number]),
  );
  const nonProducedItems = order.items.filter((item: OrderItem) =>
    NON_PRODUCED_FAMILIES.includes(item.family_code as (typeof NON_PRODUCED_FAMILIES)[number]),
  );

  const producedComponents = allComponents.filter((component) => component.status !== "Deferred MVP");
  const deferredComponents = allComponents.filter((component) => component.status === "Deferred MVP");
  const reprintOriginals = allComponents.filter((component) => component.status === "Reprint Needed");
  const sourceArtworkComponents = allComponents.filter((component) => component.artwork);
  const generatedFiles = order.generated_files ?? [];

  const replacementFor = (original: ProductionComponent): ProductionComponent | undefined =>
    allComponents.find(
      (c) =>
        c.id !== original.id &&
        c.order_item_id === original.order_item_id &&
        c.component_code === original.component_code &&
        c.status !== "Reprint Needed",
    );

  const agingSuppressed = AGING_SUPPRESSED_STATUSES.includes(
    order.status as (typeof AGING_SUPPRESSED_STATUSES)[number],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Card
        title={`ORDER ${order.order_number}`}
        eyebrow="Order Detail"
        accent
        action={
          <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={reimporting}>
            Reimport
          </Button>
        }
      >
        <div
          aria-label="Order summary"
          style={{
            background: "var(--surface-sunken)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            overflow: "hidden",
          }}
        >
          <SummaryCard icon="circle-dashed" label="Status" divider>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <StatusBadge status={order.status as StatusName} size="sm" />
              {!agingSuppressed && <AgingFlag sinceIso={order.created_at} />}
            </span>
          </SummaryCard>
          <SummaryCard icon="clock" label="Order Date" divider>{formatDateTime(order.shopify_created_at)}</SummaryCard>
          <SummaryCard icon="shopping-cart" label="# of Items" divider emphasis>{order.items.length}</SummaryCard>
          <SummaryCard icon="boxes" label="# of Components" emphasis>{allComponents.length}</SummaryCard>
        </div>

        <dl style={{ alignItems: "center", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", gap: "var(--space-8)", margin: "var(--space-4) 0 0", paddingTop: "var(--space-4)" }}>
          <PlainStatus label="Financial Status" value={order.financial_status} />
          <PlainStatus label="Fulfillment Status" value={order.fulfillment_status || "Unfulfilled"} />
        </dl>
      </Card>

      {reimportError && (
        <ErrorAlert tone="error" title="Reimport failed" onDismiss={() => setReimportError(null)}>
          {reimportError.message}
        </ErrorAlert>
      )}

      {reimportResult && (
        <ErrorAlert tone="success" title="Reimport complete" onDismiss={() => setReimportResult(null)}>
          {`Items processed: ${reimportResult.items_processed}. Components created: ${reimportResult.components_created}.`}
        </ErrorAlert>
      )}

      {reprintError && (
        <ErrorAlert tone="error" title="Reprint failed" onDismiss={() => setReprintError(null)}>
          {reprintError.message}
        </ErrorAlert>
      )}

      <div
        role="tablist"
        aria-label="Order detail sections"
        style={{
          borderBottom: "1px solid var(--line)",
          display: "flex",
          gap: "var(--space-5)",
          overflowX: "auto",
        }}
      >
        {TAB_IDS.map((id) => {
          const active = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`order-tab-${id}`}
              aria-selected={active}
              aria-controls={`order-panel-${id}`}
              onClick={() => selectTab(id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--spice-500)" : "transparent"}`,
                color: active ? "var(--text-hi)" : "var(--text-low)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "var(--space-3) var(--space-1)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {TAB_LABELS[id]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="order-panel-production"
        aria-labelledby="order-tab-production"
        hidden={tab !== "production"}
        style={{ display: tab === "production" ? "flex" : undefined, flexDirection: "column", gap: "var(--space-3)" }}
      >
        <SectionTitle>Production Components</SectionTitle>
        <DataTable
          columns={componentColumns}
          rows={producedComponents}
          rowKey="id"
          emptyLabel="No production components"
        />
      </div>

      <div
        role="tabpanel"
        id="order-panel-items"
        aria-labelledby="order-tab-items"
        hidden={tab !== "items"}
        style={{ display: tab === "items" ? "flex" : undefined, flexDirection: "column", gap: "var(--space-4)" }}
      >
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <SectionTitle>Order Items</SectionTitle>
          <DataTable columns={itemColumns} rows={producedItems} rowKey="id" emptyLabel="No order items" />
        </section>

        {nonProducedItems.length > 0 && (
          <Card eyebrow="Not Produced" title="NON-PRODUCED ITEMS">
            <DataTable columns={itemColumns} rows={nonProducedItems} rowKey="id" emptyLabel="No non-produced items" />
          </Card>
        )}

        {deferredComponents.length > 0 && (
          <Card eyebrow="Deferred MVP" title="DEFERRED ITEMS">
            <DataTable
              columns={componentColumns}
              rows={deferredComponents}
              rowKey="id"
              emptyLabel="No deferred items"
            />
          </Card>
        )}
      </div>

      <div
        role="tabpanel"
        id="order-panel-files"
        aria-labelledby="order-tab-files"
        hidden={tab !== "files"}
        style={{ display: tab === "files" ? "flex" : undefined, flexDirection: "column", gap: "var(--space-4)" }}
      >
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <SectionTitle>Reprints</SectionTitle>
          {reprintOriginals.length === 0 ? (
            <Card>
              <p style={{ color: "var(--text-mid)", margin: 0 }}>
                No components on this order have been flagged for reprint.
              </p>
            </Card>
          ) : (
            <DataTable
              columns={[
                {
                  key: "component_code",
                  header: "Component",
                  render: (_v: unknown, c: ProductionComponent) => relationshipCell(c),
                },
                { key: "design_code", header: "Design", mono: true },
                {
                  key: "batch_id",
                  header: "Printed in batch",
                  mono: true,
                  render: (value: unknown) =>
                    value ? (
                      <Link href={`/batches/${value}`} style={{ color: "var(--spice-400)" }}>
                        {`#${value}`}
                      </Link>
                    ) : (
                      "—"
                    ),
                },
                {
                  key: "id",
                  header: "Replacement",
                  render: (_v: unknown, original: ProductionComponent) => {
                    const replacement = replacementFor(original);
                    if (replacement?.batch_id) {
                      return (
                        <Link href={`/batches/${replacement.batch_id}`} style={{ color: "var(--spice-400)" }}>
                          {`#${replacement.batch_id}`}
                        </Link>
                      );
                    }
                    if (replacement) {
                      return <Badge tone="neutral">Awaiting batch</Badge>;
                    }
                    return "—";
                  },
                },
                {
                  key: "status",
                  header: "State",
                  render: (value: unknown) => (
                    <StatusBadge
                      status={value as StatusName}
                      label={componentStatusDisplayLabel(value as string)}
                      size="sm"
                    />
                  ),
                },
              ]}
              rows={reprintOriginals}
              rowKey="id"
              emptyLabel="No reprints"
            />
          )}
          <p style={{ color: "var(--text-low)", fontSize: 12, margin: 0 }}>
            Flag a printed component for reprint from the Production tab. Flagging transitions the
            component to Reprint Needed and queues its replacement automatically; front/back pairs are
            flagged together.
          </p>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <SectionTitle>Source artwork</SectionTitle>
          {sourceArtworkComponents.length === 0 ? (
            <Card><p style={{ color: "var(--text-mid)", margin: 0 }}>No source artwork is known for this order.</p></Card>
          ) : (
            sourceArtworkComponents.map((component) => {
              const artwork = component.artwork!;
              return (
                <Card key={component.id}>
                  <div style={{ alignItems: "center", display: "flex", gap: "var(--space-4)" }}>
                    <SourceArtworkThumbnail artwork={artwork} component={component} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                      <strong style={{ color: "var(--text-hi)" }}>{component.component_code} · {component.design_code ?? artwork.design_code}</strong>
                      <span style={{ color: "var(--text-mid)", fontSize: 13 }}>Status: {artwork.status}</span>
                      <code style={{ color: "var(--text-low)", fontSize: 12 }}>{artwork.source_file_path}</code>
                      {artwork.drive_share_url ? (
                        <a href={artwork.drive_share_url} target="_blank" rel="noreferrer" style={{ color: "var(--spice-400)" }}>Open source artwork in Drive</a>
                      ) : (
                        <span style={{ color: "var(--text-low)", fontSize: 12 }}>No Drive link available</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <SectionTitle>Generated files</SectionTitle>
          <DataTable
            columns={[
              { key: "file_name", header: "File" },
              { key: "file_type", header: "Type" },
              {
                key: "batch_id", header: "Batch",
                render: (_value: unknown, file: OrderGeneratedFile) => (
                  <Link href={`/batches/${file.batch_id}`} style={{ color: "var(--spice-400)" }}>{file.batch_label}</Link>
                ),
              },
              { key: "created_at", header: "Created", render: (value: unknown) => formatDateTime(value as string) },
              {
                key: "drive_share_url", header: "Drive",
                render: (value: unknown) => value ? (
                  <a href={value as string} target="_blank" rel="noreferrer" style={{ color: "var(--spice-400)" }}>Open in Drive</a>
                ) : "No Drive link available",
              },
            ]}
            rows={generatedFiles}
            rowKey="id"
            emptyLabel="No generated files are known for this order."
          />
        </section>
      </div>

      <div
        role="tabpanel"
        id="order-panel-history"
        aria-labelledby="order-tab-history"
        hidden={tab !== "history"}
        style={{ display: tab === "history" ? "flex" : undefined, flexDirection: "column", gap: "var(--space-3)" }}
      >
        <SectionTitle>History</SectionTitle>
        {historyLoading && !history && <LoadingState variant="skeleton" rows={4} label="Loading order history" />}
        {historyError && (
          <ErrorAlert tone="warning" title="History unavailable">
            {historyError.message || "This order's audit events could not be loaded."}
          </ErrorAlert>
        )}
        {history && (
          <>
            <DataTable
              columns={[
                {
                  key: "created_at",
                  header: "When",
                  render: (value: unknown) => formatDateTime(value as string),
                },
                {
                  key: "actor_type",
                  header: "Actor",
                  render: (_v: unknown, event: AuditEvent) => auditActorLabel(event),
                },
                { key: "action", header: "Action", mono: true },
                {
                  key: "entity_type",
                  header: "Object",
                  render: (_v: unknown, event: AuditEvent) => auditEntityLabel(event),
                },
              ]}
              rows={history}
              rowKey="id"
              emptyLabel="No recorded lifecycle history for this order"
            />
            {historyNextPage && (
              <Button
                variant="outline"
                onClick={() => void loadHistory(historyNextPage, true)}
                disabled={historyLoading}
                aria-label="Load more order history"
              >
                {historyLoading ? "Loading more history…" : "Load more history"}
              </Button>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        tone="warning"
        title="Reimport this order?"
        confirmLabel="Reimport"
        cancelLabel="Cancel"
        loading={reimporting}
        onConfirm={handleReimport}
        onCancel={() => setConfirmOpen(false)}
      >
        This re-processes the order against current SKU and component rules. It will not duplicate
        existing order items or components.
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(reprintTarget)}
        tone="warning"
        title="Flag this component for reprint?"
        confirmLabel="Flag Reprint"
        cancelLabel="Cancel"
        loading={reprinting}
        onConfirm={handleReprint}
        onCancel={() => {
          if (!reprinting) setReprintTarget(null);
        }}
      >
        {reprintTarget
          ? `${reprintTarget.component_code} will be marked Reprint Needed and a replacement will be queued in the current Open batch.`
          : null}
      </ConfirmModal>

      <StatusKey
        label="Order Detail status key"
        groups={[group("Order", ORDER_STATUS_KEY), group("Component", COMPONENT_STATUS_KEY)]}
      />
    </div>
  );
}

function SummaryCard({ icon, label, children, divider = false, emphasis = false }: { icon: IconName; label: string; children: React.ReactNode; divider?: boolean; emphasis?: boolean }) {
  return (
    <div style={{ borderRight: divider ? "1px solid var(--line)" : undefined, display: "flex", flexDirection: "column", gap: "var(--space-3)", minHeight: 112, padding: "var(--space-5)" }}>
      <span style={{ alignItems: "center", color: "var(--text-low)", display: "inline-flex", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, gap: "var(--space-2)", letterSpacing: "var(--ls-label)", textTransform: "uppercase" }}>
        <span data-summary-icon={icon} style={{ alignItems: "center", background: "var(--spice-tint)", border: "1px solid var(--line-spice)", borderRadius: "var(--radius-sm)", color: "var(--spice-400)", display: "inline-flex", height: 28, justifyContent: "center", width: 28 }}>
          <Icon name={icon} size={15} strokeWidth={2} />
        </span>
        {label}
      </span>
      <span style={{ color: "var(--text-hi)", fontFamily: emphasis ? "var(--font-mono)" : "var(--font-sans)", fontSize: emphasis ? 24 : 16, fontWeight: 700, lineHeight: 1.2 }}>{children}</span>
    </div>
  );
}

function PlainStatus({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <dt style={{ color: "var(--text-low)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "var(--ls-label)", textTransform: "uppercase" }}>{label}</dt>
      <dd style={{ color: "var(--text-hi)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, margin: 0, textTransform: "capitalize" }}>{value || "—"}</dd>
    </div>
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

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "Order not found";
  }
  return "Order unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view this order.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "This order does not exist or has been removed.";
  }
  return error.message || "Order data could not be loaded.";
}
