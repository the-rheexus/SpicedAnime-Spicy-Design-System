---
title: "MVP Scope and Roadmap"
version: "1.12"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
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
  - Railway (backend, PostgreSQL, Redis)
  - Vercel (frontend)
---

# MVP Scope and Roadmap

## Phase Overview

| Phase | Scope |
| :--- | :--- |
| MVP | Shopify paid/unfulfilled order intake, SKU parsing, component generation, artwork lookup, production batches per produced family, PPTX generation (full-batch and operator-selected subsets), combined packing sheet export, mark printed workflow, Needs Attention recovery queues, Deferred Items queue for `GRD` family, Shopify fulfillment/cancellation/refund reconciliation (Decision #42), and one-time historical reconciliation tooling (Decision #43). Pulled forward from later phases per owner request (2026-08-25): SKU Manager rebuilt around a live Shopify catalog read and SKU auto-generation engine (Decisions #68, #69), a dedicated Missing SKU funnel on Needs Attention (Decisions #70, #88), bulk reprint tooling from Orders with `In Production (Needs Reprint)` (Decision #71), on-demand batch PPTX preview (Decision #72), and Event Prints (Decisions #73, #92). Owner-approved MVP additions and refinements on 2026-09-02 include customer-name exposure restricted outside Packing Queue (Decision #94), Dashboard Active Batches and bounded operational panels (Decision #95), the Current Batches `All` lifecycle view (Decision #96), actionable Needs Attention queues (Decision #97), the revised Order Detail summary hierarchy (Decision #98), cumulative full-Shopify-product CSV SKU export (Decision #99), server-side Artwork Library sorting (Decision #100), large-batch Batch Detail table UX (Decision #101), direct Order Detail file/artwork access (Decision #102), order-specific aggregated lifecycle history (Decision #103), bulk Missing SKU generation/review/approval/rejection plus bulk order reimport (Decision #104), the revised Orders operational/reprint workflow (Decision #105), Packing Queue presentation cleanup (Decision #106), collapsed Status Guides (Decision #107), and native new-tab-capable app navigation (Decision #108). Owner-approved additions on 2026-09-04: Global Filter cross-screen date-range filtering on Dashboard, Orders, Current Batches, Batch Detail, and Needs Attention, including a Filtered Production Summary counting purchased units by originating product family with complete reconciliation (Decision #110); and Orders Attention column surfacing Missing SKU indicators for affected orders using the Danger treatment (Decision #111). Owner-approved refinements in Decisions #112 through #118: the Master Filter → Global Filter rename (Decision #112); a persistent Global Filter active-range indicator on Orders, Current Batches, and Needs Attention (Decision #113); the Order-number column link treatment extended to every table with an Order column (Decision #114); permanently unique, never-reissued batch numbers (Decision #115); the Orders reprint-picker auto-select-on-open plus a top-pinned Floating Bulk Flag Reprint control (Decision #116); the Needs Attention selected queue-tab moved to the app-wide spice-tint convention (Decision #117); and the SKU Manager Shopify master catalog moved to an operator-refreshable Google Drive upload with app-side drift detection, superseding Decision #99's immutable-master provision (Decision #118). Decision #119 confirms three already-shipped Global Filter implementation choices as-built. Decisions #120–#123 (2026-09-10): Grinder/Jar/Tray PPTX slides are grouped one product type per slide with the Grinder and Jar 4x3 grids locked and a per-slide product-type label (#120); Lighter/Tin PPTX slides are grouped by SKU color code (`WHT`/`SIL`/`GLD`), superseding Decision #57 (#121); the Orders `Attention` column becomes a server-side sort control mutually exclusive with the `Order #` sort (#122); and all four Needs Attention queues default most-recent-first with an `Order #` sort control, or `Received at` for Webhook Failures (#123). Decisions #124–#130 (2026-09-10/11): SKU Auto-Generation Engine corrections (#124), per-batch image adjustment overrides (#125/#126), SKU Manager sibling auto-proposals and Accept All Approvable (#127), whole-order re-import SKU preservation (#128), one-time canonical SKU remediation (#129), and table refinements (#130). Decisions #131–#136 (2026-09-11 through 2026-09-13): Switch-gated manual override for Brightness/Contrast with Pillow-baked Saturation/Sharpness (#131); 25 fixed sandbox SKUs covering all producing combinations, bundles, and lighter color variants (#132); single-variant fallback normalization and Stash Box promotion to `BOX4` (#133); Event Prints candidate deduplication to `LIT` family and multi-color lighter quantity selection (#134); SKU Manager product-grouped table hierarchy, split Filter Panel vs sticky Actions bar, "How to Read SKUs" disclosure guide, Smart SKU Editor modal, 4-character design code floor, whole-catalog sort, Collapse Mode, typed page input, Table CSV export, and Shopify type corrections (#135); and Lighter cover-crop image fit mode plus Event Prints compact active-product image adjustment overrides (#136). |
| Phase 2 | PDF export from PPTX, audit log UI. |
| Phase 3 | Shipping label integration (provider TBD by owner). |
| Phase 4 | Customer-facing order status portal. |
| Phase 5 | Analytics, forecasting, inventory tracking. |

## MVP Feature Scope

- Shopify paid/unfulfilled order intake.
- SKU parsing.
- Component generation.
- Artwork lookup.
- Production batches per produced family.
- PPTX generation, including operator-selected subset generation with automatic front/back pair inclusion.
- Large-batch Batch Detail table UX with explicit All-vs-Selected generation state, sticky table headers, and virtualized scrolling while preserving selection state (Decision #101).
- Combined packing sheet XLSX export (one row per qualifying order across produced and non-produced families).
- Packing Queue export-window handling and past-export access, including the approved 30-day-limit copy and removal of redundant export-name presentation (Decision #106).
- Mark printed workflow.
- Needs Attention with counted Blocked, Missing SKU, Deferred, and Webhook Failures queues, each defaulting to most-recent-first with an `Order #` sort control (or `Received at` for Webhook Failures) (Decisions #97, #123).
- Missing SKU single-item recovery plus bulk SKU proposal generation, one-page review, approve/reject handling, and bulk reimport of distinct affected orders after SKU approval (Decision #104).
- Deferred Items queue for `GRD` family.
- SKU Manager backed by the live Shopify catalog, including product-name/canonical-SKU substring search (Decision #82), SKU auto-generation, canonical-SKU management, and cumulative full-Shopify-product CSV export for manual Shopify import, composed against an operator-refreshable Shopify master catalog that is uploaded to the app, stored in Google Drive, retained per upload, validated on upload, and monitored for drift against the live catalog (Decisions #99, #118).
- Artwork Library browsing, thumbnails, artwork management/revalidation, pagination, and server-side Design/Updated sorting across the full result set (Decision #100).
- Orders search/status/date filtering, server-side Order # sorting, a server-side Attention-column sort mutually exclusive with the Order # sort, bulk reprint, current-page select-all, quick date shortcuts, inline per-order reprint expansion with auto-select-on-open and a top-pinned Floating Bulk Flag Reprint control, and Attention-column presentation (Decisions #105, #116, #122).
- Order Detail four-tab workflow with direct source-artwork/generated-file access and a single aggregated order/component/relevant-batch history timeline (Decisions #91, #102, #103).
- Customer-name exposure restricted from Orders and Order Detail while retaining the stored/imported value required by Packing Queue output (Decision #94).
- Dashboard operational overview including Active Batches presentation and bounded Needs Attention/Recent Activity panels (Decision #95).
- Current Batches grouped production view with `Active Queue`, individual lifecycle filters, and an `All` filter covering every batch lifecycle state (Decision #96).
- Shared collapsed `Status Guide` disclosure wherever a finite status vocabulary is documented for a screen (Decision #107).
- Native app-route link semantics supporting left-click, middle-click, modifier-click, and browser context-menu new-tab behavior for navigation (Decision #108).
- Shopify post-import fulfillment/cancellation/refund reconciliation via four live webhooks (Decision #42).
- One-time, operator-run historical reconciliation for orders that drifted before the live webhooks existed (Decision #43).
- On-demand batch PPTX preview without locking (Decision #72).
- Image adjustments per batch and product type: Brightness/Contrast native `<a:lum>` default with switch-gated manual override to Pillow pixel-baking, and Pillow-baked Saturation/Sharpness (Decisions #125, #126, #131).
- Event Prints for on-demand production-quality event/convention printing, including saved jobs, run history, page-layout preview, candidate deduplication to `LIT` family, independent multi-color lighter quantity selection, preview color chips, quick clears, and active-product compact image adjustment overrides (Decisions #73, #92, #134, #136).
- Global Filter cross-screen date-range filtering: scopes Dashboard (order/batch/attention data), Orders, Current Batches, Batch Detail, and Needs Attention to orders within a selected date range; Dashboard shows a Filtered Production Summary counting purchased units by originating product family reconciling Included in filtered production, Not included in production (non-produced, deferred GRD, and other unbatched units), and Missing SKU; generation is bounded to visible filtered components; Webhook Failures remain always visible; reuses inclusive calendar-day semantics from Orders date controls; and while the filter is active, Orders, Current Batches, and Needs Attention each show a persistent read-only active-range indicator (Decisions #110, #112, #113).
- Orders Attention column surfaces Missing SKU indicators for orders with unresolved `NO_SKU` items, using the design-system Danger treatment (Decision #111).

## Deferred Features

| Feature | Reason | Target Phase |
| :--- | :--- | :--- |
| PDF output | PPTX is the MVP output format. | Phase 2 |
| Direct printer integration | MVP prints manually from downloaded PPTX. | Post-MVP if needed |
| Shipping label generation | Provider not selected. | Phase 3 |
| Customer-facing status page | Depends on Shopify app proxy or storefront integration. | Phase 4 |
| Multi-user roles beyond single admin | One operator in MVP. | Post-MVP |

## Deferred Product Families

| Family Code | Family Name | Reason | Target Phase |
| :--- | :--- | :--- | :--- |
| `GRD` | Herb Grinder | Live and sold on Shopify; production decomposition, PPTX generation, and packing sheet support not yet implemented. | Post-MVP, owner-dependent |

## MVP Success Definition

- A paid Shopify order with valid SKUs becomes one or more production components automatically.
- The operator can generate a PPTX for any single produced batch group, or for an operator-selected subset of that batch, and download it.
- Batch Detail remains usable for batches containing hundreds of rows: column headers remain visible while scrolling, row rendering is virtualized, and selection remains correct across scrolling, sorting, and display filtering.
- The operator can mark a batch printed and confirm that new orders route to a fresh open batch.
- The operator can export a combined packing sheet covering produced and non-produced items in the current cycle.
- The operator can search the live Shopify catalog by product name or canonical SKU, generate canonical SKUs, refresh the stored Shopify master catalog by uploading a fresh Shopify product export (with the app flagging catalog drift when the master is stale), and repeatedly download a complete Shopify product CSV containing every current active canonical SKU assignment while preserving all non-SKU source cells.
- The operator can select multiple Missing SKU items, generate proposals, review all proposals on one page, approve or reject them, and bulk reimport the distinct affected orders after approval.
- The operator can sort Artwork Library by Design or Updated across the full matching result set.
- The operator can open a single Order Detail page and directly access that order's known source artwork, generated files, reprint information, and combined order/component/relevant-batch lifecycle history without manually reconstructing the same information from other screens.
- Orders exposes quick date filters and keeps reprint item selection directly beneath the affected order rather than in a detached bottom-of-page area.
- Items with the `GRD` family appear in a Deferred Items queue and do not block other orders.
- App navigation preserves native browser link behavior, including middle-click and modifier-click opening app destinations in a new tab.
- An order fulfilled, cancelled, or refunded directly in Shopify after import is reflected in the app's order status without manual intervention.
- The operator can run a one-time reconciliation to bring pre-existing drifted orders into alignment with current Shopify status.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `SKU_and_Internal_ID_Guide.md` | Source of family code definitions referenced by Deferred Product Families and the SKU-generation behavior used by SKU Manager and Missing SKU recovery. |
| `Technical_Architecture_and_API_Contract.md` | MVP scope constrains which APIs and integrations must be implemented, including SKU export, bulk recovery, Order Detail aggregation, and server-side sorting. |
| `Decision_Log_and_Open_Questions.md` | Phase and owner-approved feature decisions are recorded in the Decision Log, including Decisions #42–#43, #94–#108, #110–#125, and #127–#136. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines reconciliation, historical reconciliation, normal order reimport, and the reimport behavior reused by Missing SKU recovery. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines validation and recovery semantics used by Needs Attention, including `NO_SKU` recovery. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Defines the operator-facing screen structure and workflows for the MVP features listed here. |
