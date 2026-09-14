---
title: "Sample Data and Fixtures"
version: "1.3"
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
  - Packing Sheet Exporter
database_dependencies:
  - orders
  - order_items
  - offer_skus
  - designs
  - product_families
  - production_components
  - configuration_components
  - production_batches
  - batch_items
  - packing_exports
  - webhook_receipts
core_lifecycle_states:
  - Queued for Production
  - Fulfilled Externally
  - Canceled
  - Queued
  - Ready
  - Blocked
  - Deferred MVP
---

# Sample Data and Fixtures

This document is the index of every fixture file in `fixtures/`. It describes what each fixture tests, what scenario it covers, and which behavior it validates. The actual JSON and CSV content lives in the fixture files themselves; this document does not duplicate it.

## Fixture File Index

| File | Scenario | Validates |
| :--- | :--- | :--- |
| `shopify_order_single_ashtray.json` | Single ashtray order. | Order import basic path; ASH component generation. |
| `shopify_order_lighter_tin.json` | Lighter + tin bundle. | LIT family decomposition; LITF/LITB single-file rule; TIN component. |
| `shopify_order_stashbox_set.json` | Maximum complexity bundle. | BOX4 config decomposition into 5 components across 3 batch groups. |
| `shopify_order_mixed_products.json` | Produced and non-produced items in one order. | Non-produced item routing; mixed-order status logic. |
| `shopify_order_non_produced_only.json` | Order with only non-produced items. | Order skips component generation and goes directly to packing sheet. |
| `expected_components.csv` | Expected component generation output. | Component generation correctness across all fixtures. |
| `expected_batch_assignments.csv` | Expected batch assignment per component. | Batch routing correctness. |
| `expected_packing_sheet_rows.csv` | Expected packing sheet rows for mixed-order fixture. | Packing sheet column population. |
| `shopify_order_address_updated.json` *(TBD, not yet created)* | Shipping address changed after order import. | `orders/updated` webhook: shipping-address snapshot refresh without lifecycle change. |
| `shopify_order_to_cancel.json` *(TBD, not yet created)* | Order cancelled in Shopify after import. | `orders/cancelled` webhook: order transitions to `Canceled`; unprinted components pulled from their `Open` batch. |
| `shopify_order_to_refund.json` *(TBD, not yet created)* | Order refunded in Shopify after import. | `refunds/create` webhook: same transition and pull-out as cancellation. |
| `shopify_order_to_fulfill_externally.json` *(TBD, not yet created)* | Order fulfilled directly in Shopify (outside the app) after import. | `orders/fulfilled` webhook: order transitions to `Fulfilled Externally`; unprinted components pulled from their `Open` batch (Decision #42, Feature C). |
| `shopify_order_drifted_reconciliation.json` *(TBD, not yet created)* | Order whose Shopify status changed before the four reconciliation webhooks existed. | `reconcile_shopify_history --dry-run`/`--apply`: historical reconciliation of orders that missed the live webhooks. |
| `shopify_order_pre_feature_c_fulfilled.json` *(TBD, not yet created)* | Order already `Fulfilled Externally` with components still sitting in an `Open` batch, predating the Feature C fix. | `backfill_fulfilled_externally_pullout`: one-time retroactive component pull-out. |

## Sandbox Test Data (Decisions #47, #58)

Distinct from the pytest fixtures above, the sandbox mechanism lets the operator check out synthetic test orders on demand directly in the database via `checkout_sandbox_orders` (or `POST /api/sandbox/checkout/`), bypassing Shopify import entirely. This exists to let the operator generate and repeatedly regenerate PPTX output for every producing product type without creating real Shopify orders.

- 25 fixed sandbox SKUs (`SANDBOX_SKU_PLAN`, Decision #132), expanded from 14 to cover all producing component codes (ASH, GRD, JAR, TRY, LITF, LITB, TIN, BOX, WALF, WALB), all bundle configurations (`TINONLY`, GRS combinations, BOX combinations), and all lighter color variants (`WHT`, `SIL`, `GLD`). This catalog is fixed; adding a new sandbox SKU requires a separate implementation pass with owner-supplied artwork.
- Checkout selects quantities (0–10 per SKU) from the 25 fixed sandbox SKUs, across up to 7 order groups per checkout submission, each order group becoming one new sandbox order.
- Synthetic orders use `order_number` values prefixed `TEST-` and a synthetic unique `shopify_order_id` prefixed `SANDBOX-`.
- Every row created (`orders`, `production_components`, `production_batches`, `batch_items`) is flagged `is_sandbox = true`.
- `reset_sandbox_data` (or `POST /api/sandbox/reset/`) fully deletes all sandbox rows rather than restoring a baseline set; the operator checks out again for whatever is needed next.

## Schema Notes

- JSON fixtures follow the Shopify Admin API order payload shape.
- Each fixture must include `financial_status: "paid"` and `fulfillment_status: null` to pass the import guard.
- Each fixture must include at least one valid `shipping_address`.
- Fixtures for the four reconciliation webhooks (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) represent the second, later Shopify webhook payload for an order already imported by an earlier `orders/paid` fixture; they are not standalone order-creation payloads.

## Usage in Tests

- Backend tests load JSON fixtures, POST them to the webhook endpoint with a valid HMAC signature, then assert against the expected CSV outputs.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenarios reference these fixtures. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Webhook payload shape source. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the sandbox batch-lock exemption (Decision #47) that sandbox test data relies on. |
