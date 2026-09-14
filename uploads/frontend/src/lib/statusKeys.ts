/**
 * Single source of truth for operator-facing status meanings (P69).
 *
 * Every meaning below is taken from an authoritative source — the Order /
 * Batch / Component / Artwork lifecycle tables in
 * `docs/01_source_of_truth/Order_Status_and_Batch_Lifecycle_SOT.md`, the
 * Decision #42 reconciliation directive, or the existing behaviour of the
 * packing-export and integration-status endpoints. No status semantics are
 * invented here, and no new status vocabulary is introduced.
 *
 * `Being Packaged` and `Shipped` are declared but dormant Phase 3 order states.
 * They are deliberately absent from every entry in this file and must never be
 * added while they remain unreachable.
 */

import type { IconName } from "@/components/ds/core/Icon";
import type { StatusName } from "@/components/ds/core/StatusBadge";

export interface StatusKeyEntry {
  /**
   * The label exactly as the page renders it. Values in the design system's
   * STATUS_MAP render as status pills; other established labels (for example
   * the SKU `Active` flag) render as plain badges.
   */
  status: string;
  meaning: string;
  /**
   * Display-only badge text override (Decision #44/#64 pattern). The
   * underlying `status` value stays the raw enum string; only the rendered
   * pill text changes.
   */
  label?: string;
  /**
   * Tone for a plain-badge entry (a `status` not in the design system's
   * STATUS_MAP). Defaults to `success` so the existing SKU `Active` flag is
   * unchanged; set explicitly for other plain badges (e.g. `No SKU`).
   */
  tone?: "neutral" | "spice" | "info" | "success" | "warning" | "danger";
  /** Icon name for a plain-badge entry, so the legend matches the screen's chip. */
  icon?: IconName;
}

/**
 * Display-only label override for a `Canceled` production component
 * (Decision #64). The stored `production_components.status` value, queries,
 * filters, and audit records all remain `Canceled`; only the rendered badge
 * text changes to "Print Not Needed". This does not apply to order-level
 * `Canceled`, which continues to render as "Canceled" everywhere.
 */
const COMPONENT_STATUS_DISPLAY_LABEL: Partial<Record<string, string>> = {
  Canceled: "Print Not Needed",
};

export function componentStatusDisplayLabel(status: string): string | undefined {
  return COMPONENT_STATUS_DISPLAY_LABEL[status];
}

export interface StatusKeyGroup {
  /** Entity the statuses belong to, e.g. "Order". */
  entity: string;
  entries: StatusKeyEntry[];
}

/** Order statuses reachable and operator-visible in MVP. */
export const ORDER_STATUS_KEY: StatusKeyEntry[] = [
  {
    status: "Queued for Production",
    meaning: "Paid, unfulfilled Shopify order received; produced components not yet printed.",
  },
  {
    status: "In Production",
    meaning: "All required produced components for this order have been printed.",
  },
  {
    status: "In Production (Needs Reprint)",
    meaning: "One or more printed components were flagged for reprint and remain unresolved.",
  },
  {
    status: "Fulfilled Externally",
    meaning:
      "Shopify reported the order fulfilled outside this app. Terminal — no further transition.",
  },
  {
    status: "Canceled",
    meaning:
      "Shopify cancelled or refunded the order; unprinted components were pulled from open batches. Terminal.",
  },
];

/** Order status values offered in operator filters and dropdowns. */
export const MVP_VISIBLE_ORDER_STATUSES: StatusName[] = ORDER_STATUS_KEY.map(
  (entry) => entry.status as StatusName,
);

export const BATCH_STATUS_KEY: StatusKeyEntry[] = [
  {
    status: "Open",
    meaning: "Active batch accepting new components. One per production group at any time.",
  },
  {
    status: "Locked for Review",
    meaning: "PPTX generated; no new components accepted.",
  },
  { status: "Printed", meaning: "Operator confirmed the physical print completed." },
  { status: "Archived", meaning: "Historical record; read-only." },
];

/**
 * Sandbox batches never leave `Open` status (Decision #47's lock-on-generate
 * exemption), so the Sandbox screen's status key shows only that one entry.
 */
export const SANDBOX_BATCH_STATUS_KEY: StatusKeyEntry[] = BATCH_STATUS_KEY.filter(
  (entry) => entry.status === "Open",
);

export const COMPONENT_STATUS_KEY: StatusKeyEntry[] = [
  { status: "Queued", meaning: "Generated from an order item; not yet assigned to an Open batch." },
  { status: "Ready", meaning: "Assigned to an Open batch and validated." },
  {
    status: "Blocked",
    meaning: "Validation failed (missing artwork, missing template). Routed to Needs Attention.",
  },
  { status: "Printed", meaning: "Its containing batch reached Printed status." },
  { status: "Reprint Needed", meaning: "Operator flagged the component for reprint." },
  {
    status: "Deferred MVP",
    meaning: "Belongs to the GRD family; held in Deferred Items and never batched.",
  },
  {
    status: "Canceled",
    label: COMPONENT_STATUS_DISPLAY_LABEL.Canceled,
    meaning: "Pulled out of production because its order was cancelled or refunded.",
  },
];

export const ARTWORK_STATUS_KEY: StatusKeyEntry[] = [
  { status: "Available", meaning: "File exists at the expected Google Drive path." },
  { status: "Missing", meaning: "Expected path is empty. Triggers a MISSING_ARTWORK failure." },
  { status: "Retired", meaning: "Asset is inactive; no new components reference it." },
];

/** Packing export job states returned by the packing endpoints. */
export const PACKING_EXPORT_STATUS_KEY: StatusKeyEntry[] = [
  { status: "Pending", meaning: "Export slot allocated; the background job has not finished." },
  { status: "Success", meaning: "Export completed and the XLSX was persisted to Drive." },
  { status: "Failed", meaning: "Export did not complete. Check logs and retry." },
];

/**
 * Offer SKU catalog state. Not a lifecycle status: it is the existing
 * `is_active` flag the SKU Manager already renders as a badge pair.
 */
export const SKU_STATUS_KEY: StatusKeyEntry[] = [
  {
    status: "Active",
    icon: "circle-check",
    meaning: "SKU is sellable and resolves during order import.",
  },
  {
    // Rendered as a plain neutral Badge with no icon, matching the SKU Manager
    // screen chip and `Frontend_Color_System.md` ("Retired — Neutral tone, no
    // icon"). Without an explicit tone the legend would fall through to the
    // lifecycle STATUS_MAP entry for "Retired" and show a `ban` icon the screen
    // never renders.
    status: "Retired",
    tone: "neutral",
    meaning: "SKU is soft-retired; it no longer resolves for new orders.",
  },
  {
    status: "No SKU",
    tone: "danger",
    icon: "octagon-x",
    meaning:
      "This Shopify product has no SKU yet — its order items are blocked. Generate one before its orders can be produced.",
  },
];

/** Integration health signals on Settings, expressed with the artwork palette. */
export const INTEGRATION_STATUS_KEY: StatusKeyEntry[] = [
  { status: "Available", meaning: "Required configuration is present and the signal is healthy." },
  { status: "Missing", meaning: "Required configuration is absent or the signal is unreachable." },
];

export function group(entity: string, entries: StatusKeyEntry[]): StatusKeyGroup {
  return { entity, entries };
}

/**
 * Restrict an arbitrary status list to the MVP-visible order statuses.
 * Defensive companion to the backend allowlist: a dormant value arriving from
 * an API response or a hand-edited URL never becomes an operator choice.
 */
export function visibleOrderStatuses(values: readonly string[]): StatusName[] {
  return values.filter((value): value is StatusName =>
    (MVP_VISIBLE_ORDER_STATUSES as string[]).includes(value),
  );
}
