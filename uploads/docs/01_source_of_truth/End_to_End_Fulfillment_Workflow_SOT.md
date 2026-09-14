---
title: "End-to-End Fulfillment Workflow SOT"
version: "1.4"
status: "Pending Owner Verification"
last_verified: "2026-08-18"
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
  - webhook_receipts
core_lifecycle_states:
  - Queued for Production
  - In Production
  - Being Packaged
  - Shipped
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

# End-to-End Fulfillment Workflow SOT

## Workflow Overview

This document defines the master chronological fulfillment workflow for the SpicedAnime fulfillment web app, beginning when a paid and initially unfulfilled Shopify order is received and ending when production batches have generated PPTX print files, been physically printed, marked printed, and included in a combined packing sheet export. The workflow routes each Shopify line item through SKU parsing, production component generation, artwork lookup, validation, batch assignment, PPTX generation, and packing-sheet generation, while explicitly handling non-produced items, mixed orders, partial batch errors, and the deferred `GRD` Herb Grinder family.

Lifecycle state behavior is owned by `Order_Status_and_Batch_Lifecycle_SOT.md`. Packing sheet scope, columns, family-specific display, file naming, and export trigger behavior are owned by `Packing_Sheet_Export_Spec.md`.

## Step 1: Order Received

The workflow begins when Shopify sends an order that is paid and initially unfulfilled. The app creates a new order record with status `Queued for Production`.

This step references the Shopify webhook and import behavior defined in `Shopify_Integration_and_Order_Import_Spec.md`.

## Step 2: Order Item Extraction

The app extracts Shopify line items from the order and creates internal order item records. Each line item retains its Shopify SKU, quantity, product name, variant information, and link to the parent order.

Line item quantity is preserved for later quantity expansion during component generation.

## Step 3: SKU Parsing

The app invokes the SKU parser defined in `SKU_and_Internal_ID_Guide.md`.

The parser identifies:

- SKU family
- Design code
- Family-specific options
- Configuration code

If the family is `GRD`, the item follows the Deferred MVP Items branch.

If the family is one of the non-produced families listed in this document, the item follows the Non-Produced Orders branch.

## Step 4: Component Generation

For produced families, the app generates production components according to `Production_Component_Decomposition_Rules.md`.

Each generated component represents one printable production unit and is later routed to its batch group.

Production groups (separate active batches per group):

| Batch Group | Components Included |
| :--- | :--- |
| Ashtray | ASH |
| Lighter | LITF, LITB (front and back placements from one source file) |
| Tin | TIN |
| Box | BOX |
| Wallet | WALF, WALB (front and back placements from one source file) |
| Grinder/Jar/Tray | GRD (component code, grinder image), JAR, TRY |

## Step 5: Artwork Lookup

For each generated component, the app resolves the required artwork file using the file path conventions defined in `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`.

The lookup uses the parsed design code, the component code, and the originating family code. Family code is required because several component codes (`GRD`, `JAR`, `TRY`, `LITF`, `LITB`) resolve to different product-type folders depending on which family generated them.

For GRS-family components, the lookup additionally requires a series name. The series name is fetched from the Shopify product-level custom metafield `custom.series` using the `product_id` from the order line item. The full series-resolution algorithm is defined in `Shopify_Integration_and_Order_Import_Spec.md`. If the metafield is absent or the API call fails, the component is Blocked with failure code `MISSING_SERIES_METAFIELD`.

Lighter front/back placements and wallet front/back placements each use one source artwork file per design. Additional shared-source-file conditions (LITTIN and ASHGRD) are defined in `Production_Component_Decomposition_Rules.md`.

## Step 6: Validation

The app validates each generated component before batch assignment.

Validation includes checking for:

- Known SKU family
- Valid SKU format
- Known design code
- Valid configuration code
- Existing component rule
- Existing artwork file
- Existing print template

If validation fails, the component is routed to Needs Attention according to `Validation_Errors_Reprints_and_Recovery_SOT.md`.

Valid components continue to batch assignment.

## Step 7: Batch Assignment

Each valid produced component is routed to the active `Open` batch for its batch group.

There is one active `Open` batch per production group at any time. If no `Open` batch exists for a production group, the app creates one.

Component status and batch assignment transitions are governed by `Order_Status_and_Batch_Lifecycle_SOT.md`.

## Step 8: Live Accumulation

Open batches accumulate valid production components over time as paid and unfulfilled Shopify orders arrive.

New order intake continues while batches remain open. Components from different production groups are assigned to their respective active batches.

## Step 9: Generate PPTX

When the operator is ready to print a batch, the operator triggers Generate PPTX for an `Open` batch, either for every eligible component in the batch or for an operator-selected subset.

For a full-batch generation, this workflow step triggers the batch lock behavior defined in `Order_Status_and_Batch_Lifecycle_SOT.md`: the batch transitions from `Open` to `Locked for Review`, no new components are accepted into that locked batch, and a new `Open` batch is created for the same production group simultaneously.

For a selected-subset generation, a new `Locked for Review` batch is created holding only the selected (and front/back pair-expanded) components; the originating batch remains `Open` with the unselected remainder, and no second `Open` batch is created. A selection equal to every eligible component canonicalizes to the full-batch behavior above.

The PPTX output is generated according to `PPTX_Generation_and_Layout_Engine_Spec.md`.

## Step 10: Physical Print

The operator manually downloads or opens the generated PPTX file and physically prints it.

MVP does not include direct printer integration.

## Step 11: Mark Printed

After physically printing the batch, the operator marks the batch printed.

This workflow step triggers the Mark Printed behavior defined in `Order_Status_and_Batch_Lifecycle_SOT.md`: the batch transitions from `Locked for Review` to `Printed`, all contained components transition from `Ready` to `Printed`, and the order-promotion check runs.

## Step 12: Packing Sheet Generation

The operator generates a combined packing sheet export according to `Packing_Sheet_Export_Spec.md`.

This workflow step triggers packing sheet export only. `Packing_Sheet_Export_Spec.md` owns the export scope, column specification, sorting and grouping, family-specific display, file naming and path, and generation trigger.

The packing sheet export includes:

- Orders with at least one component in any batch that transitioned to `Locked for Review` or `Printed` in the current export window.
- Orders with only non-produced items when the order `created_at` falls within the selected export window.
- Produced items, non-produced items, and deferred MVP items according to the family-specific display rules in `Packing_Sheet_Export_Spec.md`.

## Step 13: Status Progression

Order status progression follows the state machine defined in `Order_Status_and_Batch_Lifecycle_SOT.md`.

The core in-app fulfillment status chain is:

```text
Queued for Production -> In Production -> Being Packaged -> Shipped
```

`Being Packaged` and `Shipped` are Phase 3 states; no code path writes them in MVP.

An order transitions from `Queued for Production` to `In Production` only when all required produced components for that order have been printed.

Orders containing only non-produced items remain `Queued for Production` until shipping label generation in Phase 3 and skip print-batch wait behavior, as defined in `Order_Status_and_Batch_Lifecycle_SOT.md`.

Independent of the in-app print/pack chain above, an order at `Queued for Production` or `In Production` may also terminate via Shopify-side reconciliation (Decision #42): a `Fulfilled Externally` transition when Shopify reports the order fulfilled outside the app, or a `Canceled` transition when Shopify reports the order cancelled or refunded. Both transitions pull any `Queued` or `Ready` components for that order out of their `Open` batch. These transitions arrive via the four reconciliation webhooks defined in `Shopify_Integration_and_Order_Import_Spec.md`, or via the one-time `reconcile_shopify_history` command for orders that drifted before those webhooks existed; orders that reached `Fulfilled Externally` before the pull-out behavior existed were reconciled once via the one-time `backfill_fulfilled_externally_pullout` command. Both are terminal states outside the print/pack chain; an order that reaches either one does not continue toward `Being Packaged` or `Shipped`.

Shipping label and carrier scan behavior are deferred to later phases.

## Branch: Non-Produced Orders

Non-produced families skip component generation, artwork lookup for print components, batch assignment, PPTX generation, physical print, and mark-printed workflow steps.

Non-produced families that skip steps 4 through 11:

| Family Code | Family Name |
| :--- | :--- |
| BAT | Black Art Tapestry |
| HOD | Hoodie |
| PIL | Pillow Cover |
| TAP | Tapestry |
| TOT | Tote Bag |

These items remain eligible for packing sheet export according to the export-window rules in `Packing_Sheet_Export_Spec.md`.

Non-produced-only orders remain `Queued for Production` until shipping label generation in Phase 3 and skip print-batch wait behavior, as defined in `Order_Status_and_Batch_Lifecycle_SOT.md`.

## Branch: Mixed Orders

A mixed order contains both produced and non-produced items, or produced items assigned to multiple production groups.

Produced components follow the normal production workflow.

Non-produced items remain packing-sheet-only and display according to the family-specific display rules in `Packing_Sheet_Export_Spec.md`.

The order remains `Queued for Production` until every required produced component for that order has been printed. Once all required produced components are printed, the order transitions to `In Production` according to the mixed-order promotion rule in `Order_Status_and_Batch_Lifecycle_SOT.md`.

## Branch: Deferred MVP Items

The `GRD` family is valid in the SKU system but deferred for MVP. Items in this family are routed to the Deferred Items queue and do not block other items in the same order.

Deferred family that routes to Deferred Items queue:

| Family Code | Family Name | Reason |
| :--- | :--- | :--- |
| GRD | Herb Grinder | Not yet set up on Shopify; reserved for future. |

Deferred `GRD` components receive the `Deferred MVP` component status and are not assigned to any batch according to `Order_Status_and_Batch_Lifecycle_SOT.md`.

Deferred `GRD` items appear on the packing sheet according to `Packing_Sheet_Export_Spec.md`: Items Ordered includes the note "(Deferred not yet produced)", Production Groups shows "Deferred", Print Status shows "Not Applicable for MVP", and the Deferred Items column lists any `GRD` items for the order.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Owns the order, batch, component, and artwork lifecycle state machines triggered by this workflow, including batch lock behavior, selective-generation batch splitting, Mark Printed transitions, order-promotion logic, non-produced-only order behavior, deferred `GRD` component status, and the `Fulfilled Externally`/`Canceled` reconciliation branches. |
| `SKU_and_Internal_ID_Guide.md` | Defines SKU parsing called in Step 3. |
| `Production_Component_Decomposition_Rules.md` | Defines the rules invoked in Step 4. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines path lookup invoked in Step 5. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the GRS series metafield lookup invoked during Step 5 for GRS-family components, and the four reconciliation webhooks plus the historical reconciliation and backfill commands referenced in Step 13. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines error handling invoked in Step 6. |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Defines Step 9 output, for both full-batch and selective generation. |
| `Packing_Sheet_Export_Spec.md` | Owns Step 12 export behavior, including scope rule, export window, column specification, sorting and grouping, family-specific display for produced, non-produced, and deferred `GRD` items, generated XLSX naming, and generation trigger. |
| `Decision_Log_and_Open_Questions.md` | Decisions #42 and #43 authorize the reconciliation behavior referenced in Step 13. |
