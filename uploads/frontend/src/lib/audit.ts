/**
 * Human-readable audit-event descriptors (P95 / A2).
 *
 * `Web_App_Screen_Inventory_and_UX_Flow.md` §2.11 calls for "affected object
 * (order ID, batch ID, component ID), description" rather than only raw
 * `audit_events` columns. The Dashboard builds its activity-feed sentence from
 * the same friendly action label rather than maintaining competing copy.
 *
 * The backend serializer supplies `actor_label` / `entity_label` (the entity
 * label includes a real order number or batch number via a lookup where one is
 * available). These helpers prefer those and fall back to a client-side
 * translation so the screens still render if an older payload arrives.
 */

import type { AuditEvent } from "@/lib/types";
import type { IconName } from "@/components/ds/core/Icon";

const ACTOR_LABELS: Record<string, string> = {
  operator: "Operator",
  system: "System",
  webhook: "Webhook",
  "background worker": "Background worker",
};

const ENTITY_NOUNS: Record<string, string> = {
  Order: "Order",
  OrderItem: "Order item",
  ProductionBatch: "Batch",
  ProductionComponent: "Component",
  ArtworkAsset: "Artwork",
  ArtworkRevalidationRun: "Revalidation run",
  OfferSku: "SKU",
  PackingExport: "Packing export",
  EventPrint: "Event print",
  WebhookReceipt: "Webhook",
  Authentication: "Authentication",
};

const ACTION_LABELS: Record<string, string> = {
  login_success: "Signed in",
  login_failed: "Sign-in failed",
  login_lockout: "Sign-in locked",
  order_imported: "Order imported",
  order_reimported: "Order reimported",
  order_reimport_action: "Order reimport requested",
  duplicate_order: "Duplicate order detected",
  shopify_order_skipped: "Shopify order skipped",
  shopify_product_type_mismatch: "Shopify product type mismatch",
  component_generated: "Production component generated",
  component_flagged_for_reprint: "Component flagged for reprint",
  component_reprint_resolved: "Component reprint resolved",
  order_reprint_resolved: "Order reprint resolved",
  order_promoted_to_in_production: "Order moved to production",
  batch_locked_for_review: "Batch locked for review",
  batch_subset_locked_for_review: "Batch subset locked for review",
  batch_marked_printed: "Batch marked printed",
  pptx_generation_dispatched: "Print file generation queued",
  pptx_generation_dispatch_failed: "Print file dispatch failed",
  pptx_generation_completed: "Print file generated",
  pptx_generation_failed: "Print file generation failed",
  FAILED_PPTX_GENERATION: "Print file generation failed",
  batch_pptx_preview_generated: "Batch preview generated",
  artwork_uploaded: "Artwork uploaded",
  artwork_retired: "Artwork retired",
  artwork_reconciliation_requested: "Artwork reconciliation requested",
  artwork_reconciliation_completed: "Artwork reconciliation completed",
  artwork_reconciliation_failed: "Artwork reconciliation failed",
  artwork_revalidation_completed: "Artwork revalidation completed",
  sku_generated_and_accepted: "SKU generated and accepted",
  packing_export_requested: "Packing export requested",
  packing_export_dispatched: "Packing export queued",
  packing_export_dispatch_failed: "Packing export dispatch failed",
  packing_export_started: "Packing export started",
  packing_export_completed: "Packing export completed",
  packing_export_failed: "Packing export failed",
  packing_export_purge_scheduled: "Packing export cleanup scheduled",
  packing_export_purged: "Packing export cleaned up",
  packing_export_purge_failed: "Packing export cleanup failed",
  shopify_order_reconciled: "Shopify order reconciled",
  shopify_webhook_missing_delivery_id: "Shopify webhook missing delivery ID",
  shopify_webhook_processing_failed: "Shopify webhook processing failed",
  sandbox_checkout: "Sandbox order checked out",
  sandbox_data_reset: "Sandbox data reset",
  sandbox_pptx_regenerated: "Sandbox print file regenerated",
  event_print_dispatched: "Event print queued",
  event_print_generated: "Event print generated",
  p77_locked_batch_merged: "Locked batch merged",
};

function titleCase(value?: string | null): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function auditActorLabel(event: AuditEvent): string {
  if (event.actor_label) return event.actor_label;
  const key = (event.actor_type ?? "").toLowerCase();
  return ACTOR_LABELS[key] || titleCase(event.actor_type) || "—";
}

export function auditEntityLabel(event: AuditEvent): string {
  if (event.entity_label) return event.entity_label;
  if (!event.entity_type) return "—";
  const noun = ENTITY_NOUNS[event.entity_type] ?? event.entity_type;
  if (event.entity_type === "Authentication") return noun;
  return event.entity_id ? `${noun} #${event.entity_id}` : noun;
}

export function auditActionLabel(event: AuditEvent): string {
  return ACTION_LABELS[event.action] ?? event.action;
}

export function auditActionHasFriendlyLabel(event: AuditEvent): boolean {
  return event.action in ACTION_LABELS;
}

/**
 * Dashboard-feed sentence built from the P108.1 action mapping and the
 * serializer's useful entity identifier. This deliberately does not maintain
 * a second action-to-copy map: unknown actions stay raw, while mapped actions
 * reuse `auditActionLabel` as their only friendly wording source.
 */
export function auditActivityDescription(event: AuditEvent): string {
  const action = auditActionLabel(event);
  const entity = auditEntityLabel(event);
  if (entity === "—" || entity === "Authentication") return action;

  const noun = ENTITY_NOUNS[event.entity_type] ?? event.entity_type;
  if (noun && action.toLocaleLowerCase().startsWith(`${noun.toLocaleLowerCase()} `)) {
    return `${entity}${action.slice(noun.length)}`;
  }
  return `${action} — ${entity}`;
}

/** Semantic feed icon derived from the affected object, independent of copy. */
export function auditActivityIcon(event: AuditEvent): IconName {
  const icons: Record<string, IconName> = {
    Order: "shopping-cart",
    OrderItem: "shopping-cart",
    ProductionBatch: "layers",
    ProductionComponent: "boxes",
    ArtworkAsset: "image",
    ArtworkRevalidationRun: "image",
    OfferSku: "tag",
    PackingExport: "package",
    EventPrint: "printer",
    WebhookReceipt: "refresh-cw",
    Authentication: "lock",
  };
  return icons[event.entity_type] ?? "scroll-text";
}
