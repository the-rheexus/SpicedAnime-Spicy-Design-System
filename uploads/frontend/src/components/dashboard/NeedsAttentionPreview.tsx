"use client";

import Link from "next/link";

import { Icon, LoadingState } from "@/components/ds";
import { calendarDaysSince } from "@/components/ds/feedback/AgingFlag";
import type { DashboardAttentionQueues } from "@/lib/needsAttention";
import { validationFailureShortLabel } from "@/lib/validationLabels";
import type { BlockedComponent, DeferredComponent, NoSkuItem } from "@/lib/types";

/**
 * Dashboard "Needs your attention" preview panel (P105, Decision #90).
 *
 * Read-only. It draws on the same fully paginated, sandbox-filtered Dashboard
 * attention queues as the merged metric tile, orders them blocked-first then
 * oldest-first. The non-scrolling section header links to `/needs-attention`
 * for the authoritative view.
 *
 * Inline resolution controls appear only where the action already exists on
 * Needs Attention. The only inline handler there is the multi-step "Generate
 * SKU" dialog flow on NO_SKU rows, which is a stateful dialog rather than a
 * one-shot inline action and cannot be reused in a read-only preview without
 * introducing new behaviour — so every preview row renders without a button.
 * See the P105 report.
 */

type Priority = 0 | 1;

interface PreviewItem {
  key: string;
  priority: Priority;
  anchor: string | null;
  tone: "danger" | "neutral";
  title: string;
  meta: string;
  orderNumber: string | null;
  orderId: number | null;
}

function humanize(code?: string | null): string {
  if (!code) return "";
  const words = code.replace(/_/g, " ").toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function ageLabel(anchor: string | null): string {
  const days = calendarDaysSince(anchor);
  if (days === null) return "age unknown";
  if (days === 0) return "today";
  return `${days} day${days === 1 ? "" : "s"} old`;
}

function fromBlocked(component: BlockedComponent): PreviewItem {
  const anchor = component.order_date ?? component.created_at ?? null;
  const rawCode = component.validation_failure_code ?? null;
  const label = validationFailureShortLabel(rawCode) ?? (humanize(rawCode) || "Blocked component");
  return {
    key: `blocked-${component.id}`,
    priority: 0,
    anchor,
    tone: "danger",
    title: `${label} — ${component.component_code}`,
    meta: `${rawCode ? `${rawCode} · ` : ""}Component ${component.component_code} · ${ageLabel(anchor)}`,
    orderNumber: component.order_number ?? null,
    orderId: component.order_id ?? null,
  };
}

function fromNoSku(item: NoSkuItem): PreviewItem {
  const anchor = item.created_at ?? null;
  const product = [item.product_name, item.variant_options].filter(Boolean).join(", ");
  return {
    key: `nosku-${item.id}`,
    priority: 0,
    anchor,
    tone: "danger",
    title: `Missing SKU on line item — order ${item.order_number}`,
    meta: `${product || "Line item"} · ${ageLabel(anchor)}`,
    orderNumber: item.order_number ?? null,
    orderId: item.order_id ?? null,
  };
}

function fromDeferred(component: DeferredComponent): PreviewItem {
  const anchor = component.order_date ?? component.created_at ?? null;
  return {
    key: `deferred-${component.id}`,
    priority: 1,
    anchor,
    tone: "neutral",
    title: `Deferred MVP item — ${component.component_code}`,
    meta: `${component.family_code} family · ${ageLabel(anchor)}`,
    orderNumber: component.order_number ?? null,
    orderId: component.order_id ?? null,
  };
}

function buildItems(data: DashboardAttentionQueues): PreviewItem[] {
  const items = [
    ...data.errors.map(fromBlocked),
    ...data.noSku.map(fromNoSku),
    ...data.deferred.map(fromDeferred),
  ];
  items.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const at = a.anchor ? new Date(a.anchor).getTime() : Number.POSITIVE_INFINITY;
    const bt = b.anchor ? new Date(b.anchor).getTime() : Number.POSITIVE_INFINITY;
    return at - bt;
  });
  return items.slice(0, 30);
}

export function NeedsAttentionPreview({ queues, failed }: { queues: DashboardAttentionQueues | null; failed: boolean }) {
  const items = queues ? buildItems(queues) : [];
  return (
    <article
      aria-label="Needs your attention preview"
      style={{
        maxHeight: 420,
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
      data-testid="needs-attention-scroll-region"
      tabIndex={0}
    >
      {!queues && !failed && (
        <div style={{ padding: 18 }}>
          <LoadingState variant="skeleton" rows={4} label="Loading attention items" />
        </div>
      )}

      {failed && (
        <p style={{ color: "var(--text-low)", fontSize: 13, margin: 0, padding: 18 }}>
          Attention items could not be loaded. Open Needs Attention for the full list.
        </p>
      )}

      {queues && items.length === 0 && (
        <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0, padding: 18 }}>
          Nothing needs attention right now.
        </p>
      )}

      {queues && items.length > 0 && (
        <ul aria-label="Needs attention items" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.key}
              style={{
                alignItems: "center",
                borderTop: "1px solid var(--line)",
                display: "flex",
                gap: 12,
                padding: "12px 18px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  color: item.tone === "danger" ? "var(--tone-danger)" : "var(--tone-neutral)",
                  display: "flex",
                  flex: "none",
                }}
              >
                <Icon name={item.tone === "danger" ? "octagon-x" : "minus"} size={15} strokeWidth={2.25} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--text-hi)", fontSize: 13 }}>
                  {item.title}
                  {item.orderId !== null && (
                    <>
                      {" "}
                      <Link
                        href={`/orders/${item.orderId}`}
                        style={{ color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}
                      >
                        {item.orderNumber ?? `#${item.orderId}`}
                      </Link>
                    </>
                  )}
                </div>
                <div style={{ color: "var(--text-low)", fontSize: 11, marginTop: 2 }}>{item.meta}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
