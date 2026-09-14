---
title: "Validation Errors, Reprints, and Recovery SOT"
version: "1.13"
status: "Pending Owner Verification"
last_verified: "2026-09-11"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
  - PPTX Generation Engine
database_dependencies:
  - orders
  - order_items
  - production_components
  - production_batches
  - batch_items
  - artwork_revalidation_runs
  - generated_files
  - audit_events
  - webhook_receipts
core_lifecycle_states:
  - Queued for Production
  - In Production
  - Fulfilled Externally
  - Canceled
  - Open
  - Locked for Review
  - Printed
  - Queued
  - Ready
  - Blocked
  - Reprint Needed
  - Deferred MVP
---

# Validation Errors, Reprints, and Recovery SOT

## Primary Purpose

Defines every error state the app can enter, the user-facing message for each, the recovery action, and reprint behavior. Single source for error semantics across the system.

## Thick Boundaries

- **Must Cover:** Complete error type enum with trigger conditions, user-facing messages, recovery actions, blocking behavior; reprint trigger conditions and effects; partial batch printing behavior.
- **Must Consider:** `FAMILY_DEFERRED_MVP` is a non-error state but uses the same routing infrastructure. Errors block individual components, not entire batches, per Decision #10.
- **Explicitly Excludes:** Workflow narrative, SKU format details, database schema.

## Error Type Catalog

| Code | Trigger | User-Facing Message | Recovery Action | Blocks Batch? |
| :--- | :--- | :--- | :--- | :---: |
| `INVALID_CASE` | SKU contains lowercase. | "SKU '{sku}' contains lowercase letters. SKUs must be uppercase." | Update SKU in Shopify and re-import. | No |
| `INVALID_CHARACTERS` | SKU contains disallowed characters. | "SKU '{sku}' contains disallowed characters." | Update SKU in Shopify and re-import. | No |
| `NO_SKU` | Shopify line item has no SKU; the value is null or empty after normalization. A blank item may later become locally resolvable during re-import if an accepted active canonical `offer_skus` record carries the Shopify product linkage needed to identify it safely. | "This item has no SKU. Generate or add a canonical SKU, approve it, then re-import the order." | Generate or add the canonical SKU, approve/save it, then re-import the affected order. Accepted SKUs created through the Missing SKU generation/accept flow capture Shopify product linkage that can allow re-import recovery before the Human performs the separate Shopify CSV import. An older/unlinked `offer_skus` row does not provide this fallback and the item remains unresolved until usable linkage exists or Shopify itself carries the SKU. | No |
| `DUPLICATE_SKU` | SKU already exists in `offer_skus`. | "SKU '{sku}' is duplicated in the catalog." | Resolve duplicate in Shopify; retire one record. | No |
| `UNKNOWN_FAMILY` | Family code not in `product_families`. | "SKU '{sku}' uses unknown family code '{family}'. Add to the SKU dictionary or correct the SKU." | Add family or correct SKU. | No |
| `INVALID_FORMAT` | SKU does not match family-specific pattern. | "SKU '{sku}' does not match the expected format for family '{family}'." | Correct SKU format. | No |
| `UNKNOWN_CONFIG` | Config code not valid for family. | "Config '{config}' is not valid for family '{family}'." | Correct SKU or add config rule. | No |
| `UNKNOWN_OPTION` | Option code (color, flame, size) not in dictionary. | "Option '{option}' is not recognized." | Add option code or correct SKU. | No |
| `NO_COMPONENT_RULE` | No row in `configuration_components` for family + config. | "No decomposition rule exists for '{family}-{config}'. Update decomposition rules." | Update `production_component_rules.yaml` and re-seed. | No |
| `MISSING_ARTWORK` | Expected artwork file not at Drive path. | "Artwork file missing: {expected_path}. Upload to continue." | Upload file to Drive at expected path, then either wait for the hourly artwork revalidation task or trigger it manually with the Revalidate Artwork action on the Artwork Library screen. | No |
| `MISSING_SERIES_METAFIELD` | GRS-family component generated but the Shopify product `custom.series` metafield is absent or the API call failed. | "Series metafield missing for product {shopify_product_id}. Set the 'Series' custom metafield in Shopify and re-import." | Set the `custom.series` metafield on the affected product in Shopify admin to exactly match the corresponding Drive series subfolder name; then re-import the order from the SKU Manager screen. | No |
| `MISSING_TEMPLATE` | No `print_templates` row for component. | "Print template not configured for component '{code}'." | Add print template row. | No |
| `FAILED_PPTX_GENERATION` | PPTX generation task failed (full-batch or selected-subset generation). | "PPTX generation failed for batch {batch_id}. Check logs and retry." | Retry generation from Batch Detail. For a failed subset generation, the selected components are automatically merged back into the group's Open batch and the empty failed batch is deleted before this message is shown. **Google Drive filename collision:** if the failure is that the target `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx` name already exists in Drive and was not produced by this batch, the app reports it as a distinct condition (recorded in the audit log as `upload:DriveFileExistsError`, not a generic transient Drive fault) and the operator message states that retrying cannot clear a name collision; the existing Drive file must be reconciled, or the batch renumbered, before generation can succeed. Decision #115's permanent batch-number uniqueness prevents this from recurring on newly allocated numbers. | Yes (locks rollback to Open) |
| `STALE_SELECTION` | Operator submitted a component selection for PPTX generation where one or more selected components are no longer `Ready` or no longer belong to the target batch (moved, cancelled, or already generated by another operator). | "Some selected items are no longer available: {stale_component_labels}. Refresh the page and try again." | Refresh Batch Detail and re-select. No mutation occurs; the request is rejected before any write. | No |
| `FAILED_PACKING_EXPORT` | XLSX generation task failed. | "Packing sheet export failed. Check logs and retry." | Retry export. | No |
| `WEBHOOK_FAILURE` | Any of the five Shopify webhook endpoints (`orders/paid`, `orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) failed HMAC signature verification, was missing a required delivery ID (the four reconciliation endpoints only), or raised an unhandled exception during processing. | (Logged only; surfaced read-only on the Needs Attention screen's webhook-failures section. No recovery action.) | Investigate the `webhook_receipts` row and application logs. A retried delivery under the same delivery ID is treated as a duplicate no-op, not reprocessed; there is no in-app retry action. | No |
| `DUPLICATE_ORDER` | Same `shopify_order_id` received twice on `orders/paid`. | (Idempotent: returns 200 OK silently.) | None required. | No |
| `FAMILY_DEFERRED_MVP` | SKU family is `GRD`. | "This item's product family is not yet supported. It has been held in Deferred Items." | None required; expected behavior. | No |

`INVALID_CHARACTERS` and `NO_SKU` are item-level failures. They do not block other line items in the same order.

### Operator-Facing Short Labels (Decision #88)

The `User-Facing Message` column above is the full explanatory sentence. Where the interface has room for only a compact label — a badge, a table cell, or a section heading — it renders the short label below instead, with the raw code retained as secondary detail for support purposes. The stored `validation_failure_code` value is unchanged in every case; this is a display-label mapping only.

| Code | Short Label |
| :--- | :--- |
| `INVALID_CASE` | Lowercase in SKU |
| `INVALID_CHARACTERS` | Invalid characters in SKU |
| `NO_SKU` | Missing SKU |
| `DUPLICATE_SKU` | Duplicate SKU |
| `UNKNOWN_FAMILY` | Unknown family code |
| `INVALID_FORMAT` | Invalid SKU format |
| `UNKNOWN_CONFIG` | Invalid config for family |
| `UNKNOWN_OPTION` | Unrecognized option code |
| `NO_COMPONENT_RULE` | No decomposition rule |
| `MISSING_ARTWORK` | Missing artwork |
| `MISSING_SERIES_METAFIELD` | Missing series metafield |
| `MISSING_TEMPLATE` | Missing print template |
| `FAILED_PPTX_GENERATION` | Print file generation failed |
| `STALE_SELECTION` | Selection out of date |
| `FAILED_PACKING_EXPORT` | Packing export failed |
| `WEBHOOK_FAILURE` | Webhook delivery failed |
| `DUPLICATE_ORDER` | Duplicate order |
| `FAMILY_DEFERRED_MVP` | Deferred product family |

Raw enum strings are not shown as primary interface text where a short label exists. This document owns the mapping; screens render it rather than defining their own wording.

## Missing SKU Recovery Workflow

`NO_SKU` remains the stored item-level validation failure. `Missing SKU` remains its operator-facing short label (Decision #88). Decision #104 expands recovery workflow only; it does not add a new validation code or lifecycle state.

### Individual recovery

1. Operator opens an unresolved Missing SKU item.
2. The existing SKU Auto-Generation Engine proposes the canonical SKU.
3. Operator reviews the proposal.
4. An accepted proposal is persisted through the existing canonical-SKU acceptance behavior.
5. A rejected proposal is not persisted.
6. The affected order is re-imported.
7. Re-import remains idempotent and creates only production components that were previously missing and have become resolvable.

The existing single-item Generate SKU flow remains available after the bulk workflow is implemented.

### Implemented blank-SKU re-import fallback

For a Shopify line item whose Shopify SKU remains blank, re-import can resolve the item through an active canonical `offer_skus` record when the accepted row contains the captured Shopify product linkage required by the existing fallback.

The existing fallback matches using:

- `shopify_product_title`;
- `shopify_option_values`.

These linkage values are captured by the Missing SKU Generate/Accept flow.

Older or otherwise unlinked `offer_skus` rows whose required Shopify linkage fields are absent cannot be used by this fallback. Those items remain unresolved until usable linkage exists or the SKU is present on the Shopify variant.

This fallback changes fulfillment-app recovery only. It does not write a SKU value to Shopify.

A later whole-order re-import does not revert an item that is already resolved: when the current Shopify line-item SKU is still blank and the order item already holds a resolved SKU, that SKU is preserved and the item does not return to `NO_SKU` (Decision #128).

### Bulk recovery (Decision #104)

The bulk workflow must preserve the same underlying SKU-generation and acceptance rules:

1. Operator selects multiple unresolved Missing SKU items.
2. The existing SKU Auto-Generation Engine generates proposals for the selected items.
3. The proposals are displayed together in one review workspace.
4. Each proposal can be approved or rejected.
5. The reviewed set can be handled from the same page without returning to each queue row.
6. Rejected proposals are not persisted.
7. Approved proposals use the existing canonical-SKU acceptance behavior.
8. After approval, the distinct affected orders are re-imported.
9. An order with multiple approved Missing SKU items is re-imported once for that recovery operation.
10. Re-import remains idempotent.
11. One order's failure must not silently make another successfully recovered order appear failed.
12. Unresolved per-order failures remain visible to the operator.

The exact future bulk API endpoint, request shape, and response shape are implementation details owned by `Technical_Architecture_and_API_Contract.md` and are not defined by this recovery SOT.

### Relationship to Shopify synchronization

Local Missing SKU recovery and Shopify catalog synchronization are separate operations.

Local recovery:

- approve/save the canonical SKU;
- re-import the affected order;
- create newly resolvable missing components.

Shopify synchronization:

- include the active canonical SKU in the cumulative full Shopify product CSV;
- download the CSV;
- Human manually imports the file into Shopify.

Successful local recovery does not mean Shopify has already been updated.

Successful Shopify CSV import does not itself create the already-missing fulfillment-app production components; the affected app order must still be re-imported when recovery is required.

### NO_SKU — Orders Screen Presentation (Decision #111)

`NO_SKU` remains an item-level validation failure code per Decision #67. It does not create a production component or change the parent order's lifecycle status.

Orders with unresolved `NO_SKU` items display a Missing SKU indicator in the `Attention` column on the Orders screen, using the Danger treatment from the design system. The indicator uses the same concise format as Blocked (e.g. `Missing SKU 1`). An order with both Blocked components and Missing SKU items shows both indicators in the same Attention cell.

This presentation rule does not alter `NO_SKU` recovery behavior defined above. It surfaces the condition on Orders for operator awareness alongside the existing Needs Attention recovery workflow.

## Validation Failures vs Operational Errors

- Validation failures (anything from `INVALID_CASE` through `MISSING_TEMPLATE`, and `MISSING_SERIES_METAFIELD`) happen at order import or batch validation time. They block individual components, never entire batches.
- Operational errors (`FAILED_PPTX_GENERATION`, `FAILED_PACKING_EXPORT`, `WEBHOOK_FAILURE`, `STALE_SELECTION`) are runtime errors. `FAILED_PPTX_GENERATION` has a batch-level effect: the affected batch (or, for a subset generation, the temporary subset batch) returns to `Open`/is merged back, and the operator can retry. `STALE_SELECTION` has no batch-level or component-level effect; it is rejected before any mutation occurs. `WEBHOOK_FAILURE` has no batch-level or component-level effect; the originating order's state is unchanged and the failure is recorded as evidence only.

## Partial Batch Printing Rule

- A batch may contain a mix of `Ready` and `Blocked` components.
- Generate PPTX includes all `Ready` components (or the operator-selected subset of them; see `Order_Status_and_Batch_Lifecycle_SOT.md`).
- `Blocked` components remain in the next `Open` batch for the same group; they do not block the current generation.
- The Needs Attention screen surfaces all `Blocked` components for operator resolution.

## Webhook Failure Surfacing

Authenticated Shopify webhook deliveries that fail processing (`WEBHOOK_FAILURE`) surface in the dedicated read-only `Webhook Failures` queue within the four-queue Needs Attention switcher defined by Decision #97. The other queues are `Blocked`, `Missing SKU`, and `Deferred`.

The queue that lists records carrying validation failure code `NO_SKU` is labeled `Missing SKU` in the interface (Decision #88). The stored validation code remains `NO_SKU` here, in the database, and in API data.

- Webhook Failures has no recovery action and no resolution state. There is no component or order lifecycle change associated with it.
- A failed delivery is terminal from the app's perspective: Shopify's automatic retry arrives under the same delivery ID and is treated as a duplicate no-op rather than reprocessed. Recovering from a webhook failure requires investigating the underlying cause and is an out-of-band engineering action, not an in-app operator action.
- Webhook failures remain separately counted from actionable production-attention records.
- `Missing SKU` is a presentation/recovery queue for the `NO_SKU` validation failure, not a new stored status.
- `Deferred` remains expected non-error behavior rather than an operator-correctable validation failure.

## Reprint Workflow

- Operator flags a component as `Reprint Needed` from the Batch Detail screen, Order Detail screen, or, for a `Printed` order's items, the bulk Flag Reprint action on the Orders screen (Decision #71).
- The component's status transitions to `Reprint Needed`.
- If the flagged component is one half of a front/back pair (LITF/LITB, WALF/WALB), its pair is flagged alongside it automatically, even if only one side was selected.
- A new component record is created with status `Queued` for the same design and component code (one per flagged component, so a flagged pair produces two new `Queued` records).
- The new component(s) are assigned to the current `Open` batch for their production group.
- The original `Reprint Needed` component(s) remain for traceability but are not reprinted automatically.
- Whether reprints affect order status: YES, as of Decision #71 (supersedes the prior "NO" rule). Flagging any component on an `In Production` order transitions that order to `In Production (Needs Reprint)`. This is additive, not a regression to `Queued for Production`. When every `Reprint Needed` component on that order reaches `Printed`, the order returns to plain `In Production`. See `Order_Status_and_Batch_Lifecycle_SOT.md` for the full transition rule.
- Reprinted components appear on the next packing sheet export with a "Reprint" indicator. TBD requires owner approval for exact display.

## Selective Generation Stale-Selection Handling

When an operator selects a subset of a batch's components for PPTX generation, the server independently re-validates the selection immediately before any write. If any selected component is no longer `Ready` or no longer belongs to the target batch — because it was pulled out by a cancellation, moved by another operator, or already included in a prior generation — the entire request is rejected with `STALE_SELECTION` before any mutation occurs. No partial generation is produced. The operator must refresh Batch Detail and re-select.

## Deferred Items Handling

- `FAMILY_DEFERRED_MVP` components appear on the Needs Attention screen in a separate "Deferred Items" section visually distinct from errors.
- The Deferred Items section is informational only; no action is required from the operator.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `SKU_and_Internal_ID_Guide.md` | Defines validation failure codes referenced here. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines component statuses affected by errors and reprints, and the selective-batch-generation behavior underlying `STALE_SELECTION`. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Needs Attention screen surfaces these errors, the Deferred Items section, and the webhook-failures section. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the five webhook endpoints and delivery-ID idempotency underlying `WEBHOOK_FAILURE`. |
| `Decision_Log_and_Open_Questions.md`           | Decision #110 scopes Needs Attention queues (including Missing SKU) to the Global Filter date range; Decision #111 surfaces `NO_SKU` in the Orders Attention column. |
