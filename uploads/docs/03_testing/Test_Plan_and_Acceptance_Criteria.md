---
title: "Test Plan and Acceptance Criteria"
version: "1.6"
status: "Pending Owner Verification"
last_verified: "2026-09-07"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Shopify Admin API
  - SpicedAnime Fulfillment Web App
  - Artwork Library
  - Production Batch Engine
  - PPTX Generation Engine
  - Packing Sheet Exporter
  - Cloud File Storage
database_dependencies:
  - orders
  - order_items
  - offer_skus
  - designs
  - artwork_assets
  - product_families
  - production_components
  - production_batches
  - batch_items
  - configuration_components
  - print_templates
  - packing_exports
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
  - Archived
  - Queued
  - Ready
  - Blocked
  - Reprint Needed
  - Deferred MVP
---

# Test Plan and Acceptance Criteria

## Test Scenario Table

| # | Scenario | Fixture | Expected Components | Expected Batch Assignment | Pass Condition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Single ashtray order | `shopify_order_single_ashtray.json` | 1x ASH | Ashtray batch | Component created, assigned to active Ashtray batch. |
| 2 | Ashtray + grinder bundle | (variant of fixture 1) | 1x ASH, 1x GRD | Ashtray + Grinder/Jar/Tray batches | Two components in two different batches. |
| 3 | Lighter + tin bundle | `shopify_order_lighter_tin.json` | 1x LITF, 1x LITB, 1x TIN | Lighter + Tin batches | LITF, LITB, and TIN all resolve to `artwork/Flip Lighter/{DESIGN_CODE}.png` (shared source file); LITF and LITB placed in Lighter batch; TIN placed in Tin batch with 90-degree rotation applied at generation. |
| 4 | Stashbox set | `shopify_order_stashbox_set.json` | 1x BOX, 1x LITF, 1x LITB, 1x GRD, 1x JAR | Box + Lighter + Grinder/Jar/Tray batches | Five components across three batches. |
| 5 | Mixed produced + non-produced | `shopify_order_mixed_products.json` | (produced components only) | (produced batches) | Non-produced item on packing sheet; no components created for it. |
| 6 | Non-produced only | `shopify_order_non_produced_only.json` | (none) | (none) | Order appears on packing sheet; no components; status remains `Queued for Production`. |
| 7 | `GRD` family in order | (TBD fixture) | 1x GRD (status: Deferred MVP) | None | Component appears in Deferred Items queue; no batch assignment. |
| 8 | Unknown SKU | (TBD fixture with garbage SKU) | (none for that item) | None | Item appears in Needs Attention with `UNKNOWN_FAMILY` or `INVALID_FORMAT`. |
| 9 | Missing artwork | (any fixture with deleted Drive file) | Component created | Assigned but `Blocked` | Component status is `Blocked` with `MISSING_ARTWORK`; appears in Needs Attention. |
| 10 | Generate PPTX | (any produced fixture) | (existing components) | Batch transitions to `Locked for Review` | PPTX file uploaded to Drive; new Open batch created for the group. |
| 11 | Mark Printed | (after scenario 10) | (existing components) | Batch transitions to `Printed` | All components transition to `Printed`; order promotion check runs. |
| 12 | New order routing after print | (after scenario 11) | New order's components | Assigned to the new Open batch (not the Printed one) | New order does not appear in the Printed batch. |
| 13 | Mixed-order status hold | Order with lighter + grinder | LITF, LITB, GRD | Lighter + Grinder/Jar/Tray batches | Order remains `Queued for Production` after only the lighter batch is printed. |
| 14 | Mixed-order status promotion | (continuation of 13) | (after both batches printed) | Both batches `Printed` | Order transitions to `In Production`. |
| 15 | Packing sheet export | All scenarios 1-14 active | N/A | N/A | XLSX file generated with all orders, produced and non-produced rows correctly displayed. |
| 16 | Tray layout: 3 per page | Order with 3+ trays | 3+ TRY components | Grinder/Jar/Tray batch | Generated PPTX has 3 trays per slide, additional slides for overflow. |
| 17 | Ashtray layout: 6 per page | Order with 6+ ashtrays | 6+ ASH components | Ashtray batch | Generated PPTX has 6 ashtrays per slide. |
| 18 | Lighter single-file placement | Lighter order | LITF, LITB | Lighter batch | PPTX shows two placements of `artwork/Flip Lighter/{DESIGN_CODE}.png` for each lighter, with the front directly above the back in the same column per Decision #48. |
| 19 | Wallet single-file placement | Wallet order | WALF, WALB | Wallet batch | PPTX shows two placements of `artwork/Wallet/{DESIGN_CODE}.png` side by side per wallet. |
| 20 | Reprint flag | (any printed component on an `In Production` order) | New component created with status `Queued` | Active Open batch | Original component status becomes `Reprint Needed`; new component appears in the active batch; front/back sibling is included automatically where applicable; order transitions to `In Production (Needs Reprint)` and returns to `In Production` when all flagged replacements reach `Printed` (Decision #71). |
| 21 | GRS order with `custom.series` metafield set | (TBD GRS fixture) | 1x GRD, 1x JAR, 1x TRY | Grinder/Jar/Tray batch | Components are `Ready`; `source_file_path` resolves to `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/`, where `{SERIES}` matches the metafield value exactly. |
| 22 | GRS order with missing `custom.series` metafield | (TBD GRS fixture without metafield) | 1x GRD, 1x JAR, 1x TRY | Not assigned | All three components are `Blocked` with failure code `MISSING_SERIES_METAFIELD`; other items in the same order continue processing; components appear on Needs Attention screen. |
| 23 | `orders/updated` webhook received | (TBD fixture: order with changed shipping address) | (no components created) | (unchanged) | Shipping-address snapshot on the order refreshes; order lifecycle status does not change. |
| 24 | `orders/fulfilled` webhook received, qualifying order | (TBD fixture) | Existing unprinted (`Queued`/`Ready`) components pulled from their `Open` batch | Removed from `Open` batch; component status `Canceled` | Order transitions `Queued for Production` or `In Production` → `Fulfilled Externally`; already-`Printed`, `Blocked`, `Reprint Needed`, and `Deferred MVP` components are left untouched. |
| 25 | `orders/cancelled` webhook received, qualifying order | (TBD fixture) | Existing unprinted (`Queued`/`Ready`) components pulled from their `Open` batch | Removed from `Open` batch; component status `Canceled` | Order transitions `Queued for Production` or `In Production` → `Canceled`; already-`Printed` components are left untouched. |
| 26 | `refunds/create` webhook received, qualifying order | (TBD fixture) | Same as scenario 25 | Same as scenario 25 | Same transition and pull-out behavior as `orders/cancelled`. |
| 27 | Duplicate webhook delivery (any of the four topics) | (re-send of scenario 23–26 fixture with identical `X-Shopify-Webhook-Id`) | (unchanged from first delivery) | (unchanged) | Second delivery returns HTTP 200, produces no repeated state change, and exactly one `webhook_receipts` row exists for that delivery id. |
| 28 | Selective PPTX generation, proper subset selected | (any produced fixture with 2+ eligible components in one batch) | (existing components) | New `Locked for Review` batch holds only the selected components; originating batch remains `Open` with the remainder | Exactly one `Open` batch remains for the group; unselected components stay in it. |
| 29 | Selective generation with a front/back pair partially selected | Lighter or Wallet order (LITF/LITB or WALF/WALB) | LITF + LITB (or WALF + WALB) | Both halves included in the new `Locked for Review` batch even if only one was checked | Selecting only the front (or back) half auto-includes its pair. |
| 30 | Stale selection on Generate PPTX | (any produced fixture; batch contents change between page load and submit) | (unchanged) | (unchanged) | Submission returns the inline-refresh error (HTTP 409 `STALE_SELECTION`); zero batch mutation occurs. |
| 31 | `reconcile_shopify_history --dry-run` | (TBD fixture: order that drifted out of sync with Shopify before the four webhooks existed) | (unchanged) | (unchanged) | Read-only proposed-change report is produced; no order or component is modified. |
| 32 | `reconcile_shopify_history --apply` | (same fixture as scenario 31) | Same pull-out behavior as the matching live-webhook scenario (24, 25, or 26) | Same as the matching live-webhook scenario | Order and components transition identically to the equivalent live webhook path; already-terminal orders are left untouched. |
| 33 | `backfill_fulfilled_externally_pullout --apply` | (TBD fixture: order already `Fulfilled Externally` with unprinted components still assigned to a batch, predating the Feature C fix) | Unprinted components pulled from their `Open` batch | Removed from `Open` batch; component status `Canceled` | Order status is not written; running the command a second time is a no-op. |
| 34 | Customer-name exposure restriction | Order containing normal customer PII | N/A | N/A | Orders and Order Detail do not display customer name; Order Detail API response contains no `customer_name`; existing email and shipping-address behavior remains available; Packing Queue / packing-sheet output still receives the stored customer name (Decision #94). |
| 35 | Dashboard Active Batches and bounded panels | Dashboard data containing more than 30 attention items and more than 25 audit events | N/A | N/A | Production heading reads `ACTIVE BATCHES`; Group and Batch remain distinct; Batch values are sequence-only `#N`; timestamp heading is `Started`; Needs Attention is bounded to 30 eligible rows; Recent Activity is bounded to 25 entries; panel headings and `View all` controls remain outside their scroll regions (Decision #95). |
| 36 | Current Batches `All` filter | Batches covering all four lifecycle states | N/A | Open, Locked for Review, Printed, Archived | Selecting `All` removes the status restriction and displays eligible batches from all four lifecycle states in the same production-grouped Current Batches format; `Active Queue` and individual lifecycle filters remain available (Decision #96). |
| 37 | Needs Attention counted queue switcher | Needs Attention data containing Blocked, `NO_SKU`, Deferred, and webhook-failure records | N/A | N/A | The switcher exposes `Blocked`, `Missing SKU`, `Deferred`, and `Webhook Failures` with counts; only one queue occupies the workspace at a time; Missing SKU remains backed by stored code `NO_SKU`; Webhook Failures remains read-only (Decisions #88, #97). |
| 38 | Order Detail summary hierarchy | Normal imported order | Existing order components | Existing batch assignments | Order Detail summary shows Status, Order Date, Items, and Production Components; Customer and Sales Channel are absent; Financial Status and Fulfillment Status remain plain context; null Shopify fulfillment status displays `Unfulfilled` (Decision #98). |
| 39 | SKU Manager product-name and canonical-SKU search | Live catalog result set containing known product names and canonical SKUs | N/A | N/A | Case-insensitive substring search finds matches by product name and by any substring of the canonical SKU; search combines with existing SKU Manager filters rather than changing canonical SKU data (Decision #82). |
| 40 | Full Shopify product CSV export | Immutable full Shopify product CSV plus active canonical SKU assignments | N/A | N/A | Export returns the complete Shopify product CSV, not a reduced SKU-only file; every safely matched active canonical SKU is applied to its intended `Variant SKU` cell; retired canonical SKUs are excluded; no direct Shopify write occurs (Decision #99). |
| 41 | Repeated cumulative Shopify product CSV export | Same data as scenario 40, with previously exported active SKUs | N/A | N/A | Repeated exports continue to contain all active canonical assignments regardless of prior `exported_at`; adding one new active canonical assignment produces a later export containing all prior assignments plus the new one; existing first-success `exported_at` timestamps are preserved. |
| 42 | Shopify CSV non-SKU preservation | Full Shopify product CSV containing blank fields, Unicode, commas, quotes, multiline values, continuation rows, images, and unrelated product fields | N/A | N/A | Only intended `Variant SKU` target cells differ from the immutable master. All other parsed cells, row order, column order, continuation/image rows, and complex field content remain unchanged. |
| 43 | Shopify CSV fail-closed matching and integrity | Cases covering unavailable/malformed master, no variant match, ambiguous variant match, conflicting target, and post-patch integrity failure | N/A | N/A | Each unsafe case fails with the documented export error classification; no partial CSV is returned; the immutable master is unchanged; no never-before-exported SKU receives an export timestamp on failure. |
| 44 | Artwork Library Design sorting | Artwork result set spanning multiple pages | N/A | N/A | Sorting Design A–Z and Z–A is applied server-side across the complete matching result set before pagination; active sort direction is visible (Decision #100). |
| 45 | Artwork Library Updated sorting | Artwork result set spanning multiple pages with varied update timestamps | N/A | N/A | Sorting Updated newest-first and oldest-first is applied server-side across the complete matching result set before pagination; active sort direction is visible (Decision #100). |
| 46 | Batch Detail large-table behavior | Open batch containing 200+ eligible component rows | Existing components | Existing Open batch | Table header remains visible while scrolling; row rendering is virtualized; selection remains correct across scrolling, sorting, and display filtering; no proper subset shows `Generate PPTX (All Items)`; a proper subset shows `Generate PPTX (Selected Items)`; selecting all eligible items follows the full-batch branch (Decision #101). |
| 47 | Order Detail direct source/generated files | Order whose components have resolved artwork and whose related batches have generated files | Existing components | Existing batch assignments | Files and reprints directly exposes known source-artwork thumbnails/links and generated-file links without requiring navigation to Artwork Library or Batch Detail; existing reprint behavior remains available (Decision #102). |
| 48 | Order Detail aggregated lifecycle history | Order with order-level, component-level, and relevant batch-level audit events | Existing components | Existing batch assignments | History presents one order-specific most-recent-first timeline covering the order, its components, and relevant batches without requiring manual reconstruction in the global Audit Log; stored audit records are not rewritten (Decision #103). |
| 49 | Bulk Missing SKU proposal review | Multiple unresolved items with stored `NO_SKU` | Components remain missing until approval/reimport | None until recovery | Operator can select multiple Missing SKU items, generate proposals in one operation, review them together, approve or reject each, and approve/reject the reviewed set from one page; rejected proposals are not persisted; existing single-item Generate SKU remains available (Decision #104). |
| 50 | Bulk Missing SKU order re-import | Approved Missing SKU proposals spanning multiple items and at least two orders, including two items from one order | Newly resolvable missing components only | Normal active batches after normal validation | The distinct affected orders are re-imported; the same order is processed once even when multiple approved items belong to it; re-import remains idempotent; successful orders are not rolled back by another order's failure; per-order outcomes remain visible for unresolved cases (Decision #104). |
| 51 | Orders operational hierarchy and quick dates | Orders covering normal and blocked states plus reprintable/non-reprintable orders | N/A | N/A | Columns are `Order #`, `Order Date`, `Status`, `Items`, `Attention`, `Reprint`; Order # is visually strongest and remains server-side sortable; `Attention` is quiet for normal orders and shows concise Blocked counts when needed; `Today`, `Yesterday`, and `Last 7 Days` shortcuts work alongside custom dates; filters remain visually secondary to the table (Decision #105). |
| 52 | Orders inline reprint and current-page selection | Result page containing eligible and ineligible reprint orders | Replacement components only after final Flag Reprint action | Active Open batches | Reprint item selection expands directly beneath the affected order; it is not rendered at the bottom of the complete page; `Select items` is absent when no item is eligible; header selection selects/clears eligible orders on the current page and supports indeterminate state; only the order number is the detail navigation target (Decision #105). |
| 53 | Packing Queue presentation cleanup | Export range longer than 30 days plus past-export rows | N/A | N/A | The 30-day message is exactly `Export limit reached (30 days max). Exporting the first 30 days now. Please run another export for the remaining dates once this completes.`; the past-exports table does not display a redundant name that repeats Window Start/Window End; packing-sheet XLSX business rules remain unchanged (Decision #106). |
| 54 | Shared Status Guide and native link semantics | Applicable status-bearing screens plus representative navigation/action controls | N/A | N/A | Applicable status definitions are closed by default behind a `Status Guide`; opening it preserves existing definitions. Navigational elements support normal left-click plus middle-click, Cmd-click, Ctrl-click, and browser `Open Link in New Tab`; mutation controls remain buttons and do not gain link behavior (Decisions #107, #108). |
| 55 | Global Filter scopes Orders to selected Shopify order-date range | Orders spanning multiple Shopify order placement dates; Global Filter set on Dashboard to a range excluding some orders | N/A | N/A | Only orders whose `shopify_created_at` falls within the selected range appear in Orders; orders outside the range are absent; returning to Dashboard and clearing the Global Filter restores them. Date boundaries reuse the existing inclusive calendar-day semantics from the Orders date controls (Decision #110). |
| 56 | Global Filter scopes Batch Detail component visibility | Open batch containing components from orders inside and outside the selected date range | Existing components in a mixed-date Open batch | Underlying batch unchanged | Only components belonging to orders whose `shopify_created_at` falls within the range are visible on Batch Detail. Components outside the range are hidden but remain in the batch with their status unchanged. Clearing the Global Filter restores full visibility (Decision #110). |
| 57 | Global Filter generation boundary protects hidden components across all selection modes | Open batch containing eligible components inside and outside the active range; test both (1) selecting every visible filtered component and (2) selecting no individual component before Generate PPTX | Existing mixed-date batch | New `Locked for Review` subset batch contains only filtered-visible components; original Open batch retains hidden components | In both selection modes, when hidden eligible components exist, generation executes as subset generation using only the visible filtered eligible set. Hidden components are never included in the PPTX, remain untouched in the original `Open` batch, and are independently rejected from the generated set by backend enforcement (Decision #110). |
| 58 | Global Filter Dashboard Filtered Production Summary reconciles purchased units | Active range containing produced items, non-produced items, deferred `GRD` items, other known-SKU units not represented in filtered production, Missing SKU items, at least one line item with quantity greater than 1, and at least one bundle purchase | N/A | N/A | The Dashboard summary counts purchased units using line-item quantity and groups included units by the originating purchased item's product family, not by generated production components. A bundle counts once as the originating purchased unit regardless of how many components it generates. `Not included in production` contains every purchased unit that is neither included in filtered production nor Missing SKU, including non-produced items, deferred `GRD`, and any other known-SKU unbatched units. The totals reconcile exactly: `Included in filtered production + Not included in production + Missing SKU = Total items in date range`. No purchased unit is double-counted or silently dropped. Integration/System Status remains global, while order-associated Recent Activity follows the selected range (Decision #110). |
| 59 | Global Filter keeps Webhook Failures always visible | Needs Attention records across all four queues, with order-linked records inside and outside the active range | N/A | N/A | Blocked, Missing SKU, and Deferred queues are scoped to orders whose `shopify_created_at` falls within the active range. Webhook Failures remains fully visible regardless of the Global Filter range (Decision #110). |
| 60 | Missing SKU appears in Orders Attention without changing lifecycle | Orders set containing a clean order, an order with unresolved `NO_SKU`, and an order containing both Blocked components and unresolved `NO_SKU` items | Existing components where applicable; no fabricated component for the `NO_SKU` item | N/A | The clean order has an empty Attention cell. An order with one unresolved Missing SKU item displays a concise `Missing SKU 1` indicator using the design-system Danger treatment. The order lifecycle status does not change and `NO_SKU` remains an item-level validation failure. An order containing both Blocked and Missing SKU issues displays both indicators in the same Attention cell. No hover, tooltip, or expanded-detail behavior is required by this decision (Decision #111). |
| 61 | Global Filter scopes Current Batches without changing the real batch | Current Batches containing components from orders both inside and outside the selected range | Existing mixed-date batches | Underlying batches unchanged | Current Batches displays component contents, counts, and applicable aggregations using only components belonging to orders whose `shopify_created_at` falls within the active range. Components outside the range are hidden from the filtered view but remain in their real batches with their existing statuses and relationships unchanged (Decision #110). |
| 62 | Global Filter persists across affected screens and clears from Dashboard | Global Filter range selected on Dashboard, followed by navigation through Orders, Current Batches, Batch Detail, and Needs Attention | N/A | N/A | The Global Filter control is on Dashboard. After a range is selected there, navigating to Orders, Current Batches, Batch Detail, and Needs Attention preserves the exact same active range without resetting it. Returning to Dashboard and clearing the Global Filter restores full unfiltered visibility across all affected screens. No persistent global-header Global Filter control is required (Decision #110). |
| 63 | Global Filter active-range indicator appears and disappears correctly | Global Filter set to an active range while viewing Orders, Current Batches, and Needs Attention, including a request-error state on each; then cleared | N/A | N/A | Each of the three screens displays a persistent, read-only indicator stating a Global Filter is active and showing its date range, including while the screen is in an error state. The indicator disappears immediately when the filter is cleared. The Dashboard's Global Filter control remains the only place the range can be set or changed (Decision #113). |
| 64 | Order-number link treatment applies to every table with an Order column | Needs Attention Blocked, Missing SKU, and Deferred queues, and Batch Detail's component table, each containing at least one row | N/A | N/A | The leftmost Order-identifying column in each table renders the order number with a `#` prefix in the spice accent color, underlines on hover, and links directly to `/orders/{id}`, matching the existing Orders treatment (Decision #105). No table's sort, filter, or selection behavior changes, and no new navigation target beyond the existing Order Detail page is introduced (Decision #114). |
| 65 | SKU Manager master-catalog upload replaces the stored master and detects drift | A Shopify product newly added to the live catalog that is absent from the currently stored master catalog CSV; a validly formatted replacement Shopify product-export CSV; and separately, a malformed CSV missing a required schema column | Existing `offer_skus` rows unaffected | N/A | Before refreshing, SKU Manager surfaces a visible prompt that the master catalog needs refreshing, naming the drift. Uploading a valid replacement CSV replaces the stored master used by all subsequent `GET /api/skus/export.csv` runs, and the previous upload remains retained rather than deleted. Uploading a malformed CSV is rejected immediately at upload time with an actionable error, and does not replace the stored master. A subsequent export against the refreshed master succeeds for the previously drifted product (Decision #118). |

## MVP Acceptance Criteria

- All 62 test scenarios pass.
- The MVP success definition in `MVP_Scope_and_Roadmap.md` is met.
- Acceptance coverage includes both existing implemented behavior and owner-approved remaining MVP behavior; an unimplemented scenario is not considered passing until the corresponding implementation exists and satisfies its pass condition.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Sample_Data_and_Fixtures.md` | Describes fixture files referenced here. |
| `MVP_Scope_and_Roadmap.md` | Defines the MVP success conditions this test plan must cover. |
| `Decision_Log_and_Open_Questions.md` | Decisions #71, #82, #94–#108, and #110–#111 authorize the additional acceptance scenarios. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Owns the operator-facing screen behavior tested by the UI/UX scenarios. |
| `Technical_Architecture_and_API_Contract.md` | Owns implemented API and export contracts tested here. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Owns Missing SKU and reprint recovery behavior tested here. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Owns import/re-import behavior tested here. |
| All SOT documents | Test scenarios validate SOT behavior. |
