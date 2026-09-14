---
title: "Shopify Integration and Order Import Spec"
version: "1.13"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Shopify Admin API
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
database_dependencies:
  - orders
  - order_items
  - offer_skus
  - designs
  - product_families
  - production_components
  - production_batches
  - batch_items
  - configuration_components
  - artwork_assets
  - print_templates
  - webhook_receipts
core_lifecycle_states:
  - Queued for Production
  - Fulfilled Externally
  - Canceled
  - Open
  - Queued
  - Ready
  - Blocked
  - Deferred MVP
---

# Shopify Integration and Order Import Spec

## Webhook Configuration

| Setting | Value |
| :--- | :--- |
| Subscribed events | `orders/paid`, `orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create` |
| Endpoints | `POST /api/webhooks/shopify/orders-paid/`, `POST /api/webhooks/shopify/orders-updated/`, `POST /api/webhooks/shopify/orders-fulfilled/`, `POST /api/webhooks/shopify/orders-cancelled/`, `POST /api/webhooks/shopify/refunds-create/` (Django routes) |
| Security | HMAC SHA-256 signature verification against `X-Shopify-Hmac-SHA256`, using `SHOPIFY_WEBHOOK_SECRET`, on every endpoint. Verified before any payload byte is trusted; an invalid signature returns 401 with no receipt row and no state change. |
| Retry policy | Shopify default. `orders/paid` remains idempotent on `shopify_order_id` with no delivery-id requirement (unchanged, Decision #2). The four reconciliation endpoints (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) require `X-Shopify-Webhook-Id` and are idempotent on that header; see Reconciliation Webhook Idempotency below. |

Note: `refunds/create` is the Shopify-supported topic used for refund reconciliation. `orders/refunded` is not a valid Shopify webhook topic and is never subscribed.

## API Permissions

Required Shopify API scopes:

- `read_orders`
- `read_products`
- `read_inventory` (for future inventory features)

## Admin API Authentication

Two authentication modes are supported for outbound Shopify Admin API calls (order fetch, GRS metafield lookup):

1. **Client-credentials (preferred).** `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` are both set. The app exchanges them for a short-lived OAuth access token via `POST https://{SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, caches the token in-process with proactive refresh ahead of expiry, and retries once on a 401 by invalidating and re-acquiring the token. This mode is deployed in production as of 2026-07-15. This same authenticated client is reused by the live catalog read (`GET /api/shopify/catalog/`) that powers the SKU Manager (Decision #69); no new Shopify credential or scope is required, since catalog read is already covered by the existing Admin API access.
2. **Static token (legacy fallback).** Used only when the client-credentials pair is not configured. `SHOPIFY_ADMIN_ACCESS_TOKEN`, or `SHOPIFY_API_KEY` if the former is absent, is sent as a fixed `X-Shopify-Access-Token` header with no refresh logic.

If exactly one of `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` is set, the app fails closed with a configuration error rather than falling back to the static token. Both the Railway backend service and the Celery worker service must have the same client-credentials pair configured, since the worker independently performs GRS metafield lookups during order import.

## Required Fields

Customer name is required. A present, nonblank `customer.first_name` preserves the existing customer first/last-name behavior. When `customer` is absent or `customer.first_name` is null or blank, the importer uses a present, nonblank `shipping_address.name`. If no usable shipping name exists, the import fails closed with `Missing required Shopify field: first_name`. No billing-address or other fallback is used.

Required order fields:

| Shopify Field | App Field | Required? |
| :--- | :--- | :--- |
| `id` | `shopify_order_id` | Yes |
| `order_number` | `order_number` | Yes |
| `email` | `customer_email` | Yes |
| `customer.first_name`, `customer.last_name` or `shipping_address.name` | `customer_name` | Yes; shipping-name fallback applies when `customer` is absent or `customer.first_name` is null/blank |
| `shipping_address` | `shipping_address` (JSON) | Yes |
| `financial_status` | (verify == "paid") | Yes |
| `fulfillment_status` | (verify == null or "unfulfilled") | Yes |
| `created_at` | `shopify_created_at` | Yes |
| `line_items` | (iterate to create `order_items`) | Yes |

Required line item fields:

| Shopify Field | App Field | Required? |
| :--- | :--- | :--- |
| `id` | `shopify_line_item_id` | Yes |
| `sku` | `sku` | Yes; null routes to item-level validation |
| `quantity` | `quantity` | Yes |
| `title` | `product_name` | Yes |
| `variant_title` | `variant_title` | Optional |
| `product_id` | `shopify_product_id` | Yes (required for GRS-family lookup; captured for all line items) |
| `variant_id` | `shopify_variant_id` | Optional (captured for traceability) |

## Idempotency and Deduplication

Idempotency strategy (`orders/paid` only):

- Use `shopify_order_id` as the idempotency key.
- On duplicate webhook receipt, return 200 OK without creating duplicate records.

## Reconciliation Webhook Idempotency

The four reconciliation endpoints (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) use a separate idempotency mechanism, since a single order can legitimately receive more than one `orders/updated` event over its lifetime.

- Idempotency key: `X-Shopify-Webhook-Id` (the delivery id), stored in the `webhook_receipts` table with a unique constraint.
- The receiver claims the delivery id inside its own transaction. A concurrent duplicate delivery is detected via an `IntegrityError` on the unique constraint and reported as a no-op duplicate rather than reprocessed.
- A repeated delivery id returns the normal 200 response and repeats neither the state mutation nor the audit side effects.
- `X-Shopify-Event-Id` is stored on the receipt for correlation only. It never deduplicates; two different topics delivered under the same event id each produce their own receipt.
- A delivery with a valid HMAC signature but no `X-Shopify-Webhook-Id` header fails closed: HTTP 400, no receipt row (there is no key to store), no state mutation, and a `shopify_webhook_missing_delivery_id` audit event.
- Every authenticated delivery — including no-op deliveries against a terminal or not-yet-imported order — produces a `webhook_receipts` row recording: delivery id, event id, topic, a safe Shopify order reference, receipt timestamp, outcome (`Processed` / `No-op` / `Failed`), whether state mutated, and a classification-only failure summary (`topic:ExceptionType`) when applicable. No raw header, raw payload, credential, tracking data, or customer PII is persisted to this table.
- A processing failure marks the receipt `Failed`, emits a `shopify_webhook_processing_failed` audit event, and returns HTTP 500. The receipt row commits independently of the failed processing transaction, so failure evidence is never lost.
- A failed delivery is terminal from the app's perspective: Shopify's retry arrives under the same delivery id and is treated as a duplicate no-op, not reprocessed. Failed deliveries surface on the Needs Attention screen for manual review; there is no automatic retry or recovery action.

## Order Import Algorithm

1. Verify HMAC signature.
2. Look up `shopify_order_id`. If exists, return 200 OK.
3. Verify `financial_status == "paid"` and `fulfillment_status` is null or `"unfulfilled"`. If not, log and skip.
4. Create `orders` row with status `Queued for Production`.
5. For each line item:
   a. Create `order_items` row. Capture `shopify_product_id` from the Shopify line item's `product_id` field; capture `shopify_variant_id` from `variant_id`.
   b. Parse SKU. If invalid, mark item with `UNKNOWN_SKU` or appropriate validation failure code.
   c. Look up family in `product_families`.
   d. Resolve design. Call `get_or_create` on the `designs` table using the parsed `design_code`. If no row exists, create one with `design_name = design_code` and `is_active = True`. Design resolution always succeeds for a validly-parsed `design_code`; no failure code is generated.
   e. If family `production_required == false` (BAT, HOD, PIL, TAP, TOT): skip component generation; item appears on packing sheet only.
   f. If family is `GRD`: create component records with status `Deferred MVP`; route to Deferred Items queue; no batch assignment.
   g. Otherwise: look up `configuration_components` row for the family + config. Generate one component per row, expanded by line item quantity.
   h. If family is `GRS`: resolve the series name. Call `GET https://{SHOPIFY_STORE_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products/{shopify_product_id}/metafields.json` using the configured Shopify Admin authentication (see Admin API Authentication). Filter the response for `namespace == "custom"` and `key == "series"`. If a matching metafield is found, use its `value` as `{SERIES}` for the artwork path. If no matching metafield is found, or the call returns a non-200 status, mark the component Blocked with failure code `MISSING_SERIES_METAFIELD`. Deduplicate calls within a single order by `shopify_product_id` to avoid redundant requests for orders with multiple GRS variants of the same product.
6. For each generated component: assign to the active `Open` batch for its batch group.
7. Trigger validation: missing artwork, missing template checks per component.
8. Commit transaction.

## Post-Import Reconciliation (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`)

These four endpoints reconcile the app's order state against changes made in Shopify after import. All transitions are forward-only; a terminal-state order (`Fulfilled Externally`, `Canceled`, `Being Packaged`, `Shipped`) never moves backward or sideways.

- **`orders/fulfilled`.** An order in `Queued for Production` or `In Production` transitions to `Fulfilled Externally`, and the same component pull-out described below for cancellation runs first (Decision #42, Feature C amendment). An order in any other state is an audited no-op.
- **`orders/cancelled` or `refunds/create`.** An order in `Queued for Production` or `In Production` transitions to `Canceled`, and cancellation component pull-out runs (see below). An order in any other state is an audited no-op.
- **`orders/updated`.** Refreshes the shipping-address snapshot on the existing order record only. Lifecycle state is never changed by this event; the handler re-reads order status immediately after the write and raises if it changed, enforcing this in code rather than by convention. Line-item mutations (added, removed, or resized line items) in the payload are detected by comparing payload line-item ids and quantities against the imported `order_items` rows and are reported in audit metadata only; no `order_items` row is added, removed, or resized. Tracking-number and tracking-URL fields present in any payload are read by no code path and stored nowhere. Tracking is out of scope for this app; Shopify remains the sole source of truth for tracking data.

### Component Pull-Out on Cancellation or External Fulfillment

When an order transitions to `Canceled` (via `orders/cancelled`, `refunds/create`, or the historical reconciliation command) or to `Fulfilled Externally` (via `orders/fulfilled`, the historical reconciliation command, or the one-time `backfill_fulfilled_externally_pullout` command — see below):

1. Every `production_components` row for that order with status `Queued` or `Ready` is removed from its assigned `Open` batch and set to component status `Canceled`. This is the same component status used for cancellation; a fulfilled-externally pull-out does not introduce a separate status (Decision #42, Feature C amendment).
2. Components already `Printed`, `Blocked`, `Reprint Needed`, or `Deferred MVP` are left untouched; printed components are never re-batched or reverted.
3. Components sitting in a `Locked for Review`, `Printed`, or `Archived` batch are past the pull-out window; neither the component nor the batch is altered.
4. The one-`Open`-batch-per-production-group invariant is asserted before commit; a violation rolls back the entire transition.

## Historical Reconciliation (One-Time, Operator-Run)

A management command, `reconcile_shopify_history`, performs a one-time reconciliation of orders that drifted out of sync with Shopify before the four reconciliation webhooks went live (e.g., orders fulfilled or cancelled in Shopify during the period the app only ingested `orders/paid`).

- Invocation: `python manage.py reconcile_shopify_history --dry-run` or `--apply`. Exactly one of the two flags is required; the command rejects both-set and neither-set.
- Scope: only orders currently in `Queued for Production` or `In Production` (the same two reconcilable states used by the live webhooks) are candidates. Already-terminal orders are never fetched from Shopify and never touched.
- For each candidate, the command performs a read-only `GET` against the Shopify Admin API (the same authenticated client used elsewhere in this spec) and classifies the order as `fulfilled`, `canceled`, `active`, or `ambiguous` based on `fulfillment_status`, `cancelled_at`, and `financial_status`.
- `active` orders (unfulfilled or partially fulfilled) are left unchanged. `ambiguous` orders (contradictory or unrecognized status signals) are reported and left untouched; the command never guesses.
- `--dry-run` performs no database write and no Shopify write; it reports, per candidate, the order number, current status, proposed status, and (for a proposed cancellation) the count of components eligible for pull-out.
- `--apply` re-fetches Shopify fresh for every candidate and applies the same transition and pull-out logic the live `orders/fulfilled` and `orders/cancelled` webhooks use. Each order's mutation is independently transactional; one order's failure does not affect others.
- This command performs no automatic backfill on deploy, startup, or schedule. It is a manual, operator-invoked one-time tool. No historical backfill is otherwise performed by this app (Decision #42).
- The command writes no `webhook_receipts` row (it is not webhook-driven); its audit events use a distinct `historical_reconciliation:fulfilled` / `historical_reconciliation:canceled` topic string so they remain distinguishable from live webhook events.

## One-Time Backfill: Fulfilled-Externally Component Pull-Out

A separate one-time management command, `backfill_fulfilled_externally_pullout`, retroactively applies the Feature C component pull-out (Decision #42 amendment, 2026-08-18) to orders that were already `Fulfilled Externally` before that fix existed in the live `orders/fulfilled` path.

- Invocation: `python manage.py backfill_fulfilled_externally_pullout --dry-run` or `--apply`. Exactly one of the two flags is required.
- Scope: orders currently in `Fulfilled Externally` status. It never contacts Shopify and never changes order status; it only touches `production_components` and `batch_items` rows for components still `Queued` or `Ready`, using the same pull-out logic and eligibility rules as live cancellation and fulfillment reconciliation.
- Idempotent: an order with nothing left to pull out (already backfilled, or never had unprinted components) is a no-op on a repeat run.
- Its audit events use a distinct `historical_reconciliation:fulfilled_pullout_backfill` topic string, separate from both the live webhook topics and the `reconcile_shopify_history` historical topics.
- Run once against production on 2026-08-14: 266 `Fulfilled Externally` orders checked, 136 touched (524 components pulled out), 130 untouched (no eligible components). This command performs no automatic execution on deploy, startup, or schedule; it is a manual, operator-invoked tool.

## Quantity Handling

- Line item with `quantity = N` generates N copies of each component defined in the decomposition rule.
- Example: order line `ASH-CHARFRIE-ASHGRD` with quantity 3 generates 3 `ASH` components and 3 `GRD` components.

## Unknown SKU Handling

- A line-item SKU is required by the Shopify schema, but Shopify may send `null` for a variant without a configured SKU. The importer normalizes a null SKU to an empty string and routes it to the existing SKU parser.
- An empty SKU (including a null normalized to an empty string) receives item-level validation error `NO_SKU`. The failure does not reject the order or prevent other line items from processing. An order with only no-SKU or otherwise invalid line items creates zero production components.
- If SKU does not match the canonical SKU pattern: validation failure `INVALID_FORMAT`. Routed to Needs Attention.
- If SKU is well-formed but the config code has no matching row in `configuration_components`: validation failure `UNKNOWN_CONFIG`. Routed to Needs Attention.
- Design codes are auto-created on first import; a well-formed SKU with an unknown design code is never blocked for this reason.
- Other order items in the same order continue processing normally.

## GRS Series Resolution

The Grinder Sets artwork hierarchy includes a series-level folder (`artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/`). The `{SERIES}` value must be resolved at order import time.

The series name is a product-level attribute in Shopify, stored in the custom metafield `custom.series`. It applies to all variants of a given Shopify product. The lookup is performed using the `shopify_product_id` captured from the order line item.

Resolution algorithm:

1. For each GRS-family line item in the order, group by `shopify_product_id` to deduplicate calls.
2. For each unique `shopify_product_id`, call `GET https://{SHOPIFY_STORE_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products/{shopify_product_id}/metafields.json` using the configured Shopify Admin authentication (see Admin API Authentication section above).
3. Filter the response array for an object where `namespace == "custom"` and `key == "series"`.
4. If a matching object is found, extract its `value` field. This is the series name. Use it directly as the `{SERIES}` segment in the artwork path. The value must match the corresponding series subfolder name in Drive exactly, including capitalization and spacing.
5. If no matching object is found, or the HTTP call returns a non-200 status, set the component status to `Blocked` with failure code `MISSING_SERIES_METAFIELD`. Log the `shopify_product_id` and the failure cause in the audit event.

No fallback path exists. There is no internal mapping table. There is no flat-path degradation. A GRS component without a resolvable series name does not enter a batch.

Recovery from `MISSING_SERIES_METAFIELD`:

- Navigate to the affected product in Shopify admin.
- Set the custom metafield `Series` (namespace: `custom`, key: `series`) to the exact series name matching the Drive folder.
- Re-import the order via the SKU Manager screen.

## Non-Produced Family Handling

- Families with `production_required == false` (BAT, HOD, PIL, TAP, TOT) create only `order_items` records.
- No `production_components` rows are generated.
- The order appears on the next packing sheet export.
- Order status remains `Queued for Production` until shipping label is generated (Phase 3) or until any produced components in the same order are printed.

## Deferred Family (`GRD`) Handling

- Components are created with status `Deferred MVP` for traceability.
- They are not assigned to any batch.
- They appear in the Deferred Items section of the Needs Attention screen as expected behavior, not as an error.
- The rest of the order processes normally.

## Canceled and Refunded Orders

Canceled and refunded orders are handled per Decision #42 (2026-08-13, supersedes Decision #13):

- `orders/cancelled` and `refunds/create` are both subscribed and processed. See Post-Import Reconciliation above for the transition and pull-out behavior.
- Orders that were cancelled or refunded in Shopify before these webhooks went live are reconciled via the one-time `reconcile_shopify_history` command (see Historical Reconciliation above), run manually by the owner. No automatic backfill occurs.

## Re-Import Behavior

Re-import is the recovery path used after an order item's missing or unresolved canonical SKU mapping has been corrected.

### Existing single-order behavior

- Single-order re-import remains idempotent: it does not create duplicate order items or duplicate already-existing production components.
- Re-import does not reset or regress existing production-component lifecycle states.
- It fills in production components that were previously missing and have become resolvable.
- When Shopify Admin access is configured, the existing re-import path may fetch the current Shopify order payload before reprocessing the affected order.
- A nonblank Shopify line-item SKU remains authoritative and follows the normal parsing/import rules.
- When the current Shopify line-item SKU is blank and the order item already holds a resolved SKU, re-import preserves that SKU; it does not reset the item to a blank SKU or `NO_SKU`. The blank-SKU canonical fallback below is attempted only when the order item's stored SKU is itself blank (Decision #128).

### Implemented blank-SKU canonical fallback

When a Shopify line item's SKU remains blank, the existing re-import implementation can resolve the item through the canonical SKU dictionary when one active `offer_skus` record contains the Shopify product linkage captured by the Generate/Accept flow.

The implemented fallback uses:

- `offer_skus.shopify_product_title`;
- `offer_skus.shopify_option_values`.

If the blank line item resolves safely through that captured linkage:

- the accepted canonical SKU is used to reprocess the item;
- the previously missing production components may be created through the normal decomposition, validation, artwork, and batch-assignment rules;
- repeated re-import remains idempotent.

If the required linkage is absent — including older canonical SKU rows created without those captured Shopify fields — that canonical row cannot resolve the blank Shopify line item through this fallback. The item remains in Missing SKU recovery until usable linkage exists or Shopify itself carries a usable SKU.

The fallback does not write the SKU to Shopify.

### Bulk Missing SKU re-import requirement (Decision #104)

After multiple Missing SKU proposals are approved, the system must support re-importing the distinct affected orders as one operator workflow.

Requirements:

- derive the affected order set from the approved Missing SKU recovery items;
- deduplicate orders so multiple approved items on one order do not trigger duplicate order re-imports;
- reuse the same idempotent single-order re-import behavior above;
- preserve existing component lifecycle states;
- create only newly resolvable missing components;
- process/report orders independently so one failed order does not erase another order's successful recovery;
- leave unresolved failures visible for operator follow-up.

The exact bulk API path, HTTP method, request payload, response payload, and frontend orchestration are deferred to implementation and must be recorded in `Technical_Architecture_and_API_Contract.md` once defined.

### Relationship to Shopify SKU synchronization

Accepting a canonical SKU and successfully re-importing an order changes fulfillment-app state only.

Shopify catalog synchronization remains a separate Human-controlled workflow:

1. active canonical SKUs participate in the cumulative full Shopify product CSV defined by Decision #99;
2. the operator downloads that file;
3. the Human manually imports it into Shopify.

The app does not write product SKU values directly to Shopify.

A successful app re-import does not mean Shopify has been updated.

A later successful Shopify CSV import does not replace re-import of an already-blocked app order when missing production components still need to be created.

## Shopify product_type to Family Code Mapping

The Shopify `product_type` field on each line item is used as a cross-check against the family code parsed from the SKU. Mismatches are recorded in the audit log but do not block import. Strings are matched case-sensitive and whitespace-exact.

| Shopify `product_type` | Internal `family_code` |
| :--- | :--- |
| `Flip Lighter` | `LIT` |
| `Rolling Tray` | `TRY` |
| `Ashtray` | `ASH` |
| `Wallet` | `WAL` |
| `Tote Bags` | `TOT` |
| `Stash Jar` | `JAR` |
| `Tapestry` | `TAP` |
| `Hoodies` | `HOD` |
| `Herb Grinder` | `GRD` |
| `Grinder Sets` | `GRS` |
| `Boxes` / `Stash Box` | `BOX` (Decision #135) |
| `Pillow cases` / `Pillow Covers` | `PIL` (Decision #135) |

The internal family `BAT` (Black Art Tapestry) is intentionally excluded from the `product_type` mapping for MVP (Decision #30, 2026-06-15). BAT line items are identified by SKU family prefix only. `product_type` cross-checking is skipped for `BAT`; `product_type` mismatch audit warnings do not apply to `BAT` because it has no `product_type` mapping. No `product_type` value is assigned to `BAT`.

The internal value `TIN` is intentionally excluded from the `product_type` mapping for MVP (Decision #31, 2026-06-18). `TIN` is a production component code generated by `LIT` + `LITTIN` and `LIT` + `TINONLY`, not a standalone Shopify SKU family. `Tin cases` is not a valid Shopify `product_type` for this app; if observed on a line item, it must not resolve to family `TIN`.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `End_to_End_Fulfillment_Workflow_SOT.md` | Steps 1-3 of the workflow are implemented per this spec. |
| `SKU_and_Internal_ID_Guide.md` | SKU parser invoked during import. |
| `Production_Component_Decomposition_Rules.md` | Component generation rules invoked during import. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Validation failure codes and webhook-failure surfacing used here are defined there. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Django endpoints for all five webhooks and the historical reconciliation command. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | `Fulfilled Externally` and `Canceled` order states, and the `Canceled` component state, are defined there. |
| `Decision_Log_and_Open_Questions.md` | Decision #42 is the authorizing decision for this section. |
