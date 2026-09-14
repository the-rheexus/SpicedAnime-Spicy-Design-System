---
title: "Coding AI Context"
version: "1.4"
status: "Pending Owner Verification"
last_verified: "2026-08-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App

---

# Coding AI Context

## Project Summary

SpicedAnime is building a desktop-first fulfillment web app for a Shopify-based handmade product workflow. The app receives paid and unfulfilled Shopify orders, parses sellable SKUs, generates internal production components where required, looks up artwork in Google Drive, assigns printable components to production batches, and creates generated PPTX and XLSX outputs. The app also reconciles order state against Shopify after import: four live webhooks (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) keep the app's order status current with Shopify-side fulfillment, cancellation, and refund events, and a one-time operator-run management command reconciles orders that drifted before those webhooks existed. The database is the operational source of truth; generated print files and packing sheets are outputs from batch and order state. Coding AI assistants must treat the source-of-truth documents as authoritative and must not invent missing business behavior.

## Technical Stack

| Layer | Choice |
| :--- | :--- |
| Frontend framework | Next.js |
| Frontend language | TypeScript |
| Frontend library | React |
| Backend framework | Django |
| Backend API layer | Django REST Framework |
| Database | PostgreSQL |
| Background job worker | Celery + Redis |
| File storage | Google Drive (via Google Drive API) |
| PPTX generation library | `python-pptx` |
| XLSX generation library | `openpyxl` |
| Hosting platform | Railway (backend, PostgreSQL, Redis) + Vercel (frontend) |

## Source-of-Truth File Index

| File Path | Purpose |
| :--- | :--- |
| `docs/00_project/MVP_Scope_and_Roadmap.md` | Defines MVP scope, deferred features, phase gates, and MVP success criteria. |
| `docs/00_project/Decision_Log_and_Open_Questions.md` | Records owner-approved decisions and unresolved build blockers. |
| `docs/01_source_of_truth/End_to_End_Fulfillment_Workflow_SOT.md` | Defines the chronological fulfillment workflow from Shopify order intake through print and packing sheet generation. |
| `docs/01_source_of_truth/Order_Status_and_Batch_Lifecycle_SOT.md` | Defines canonical lifecycle states and transitions for orders, batches, components, and artwork assets. |
| `docs/01_source_of_truth/SKU_and_Internal_ID_Guide.md` | Defines Shopify offer SKU structure, design codes, family codes, option/config dictionaries, parser contract, and validation codes. |
| `docs/01_source_of_truth/Production_Component_Decomposition_Rules.md` | Defines how each produced family and configuration maps to internal production components. |
| `docs/01_source_of_truth/production_component_rules.yaml` | Machine-readable mirror of the production component decomposition rules. |
| `docs/01_source_of_truth/Product_Image_Transformation_Guidelines.md` | Defines per-product image transformation parameters and page capacities. |
| `docs/01_source_of_truth/PPTX_Generation_and_Layout_Engine_Spec.md` | Defines PPTX slide generation, layout grids, overflow behavior, file naming, and generation workflow. |
| `docs/01_source_of_truth/Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines Google Drive folder structure, artwork naming, generated output paths, and missing-artwork behavior. |
| `docs/02_app_specs/Shopify_Integration_and_Order_Import_Spec.md` | Defines Shopify webhook intake (including the four post-import reconciliation webhooks and the historical reconciliation command), order import algorithm, required line item fields, and the GRS series metafield lookup algorithm. |
| `docs/02_app_specs/Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines all validation failure codes (including `MISSING_SERIES_METAFIELD`), operational error codes (including `STALE_SELECTION` and `WEBHOOK_FAILURE`), and recovery procedures. |
| `docs/02_app_specs/Data_Model_and_Database_Schema.md` | Defines the full database schema including table field definitions, foreign key map, and index recommendations. Includes `webhook_receipts`. |
| `docs/02_app_specs/Technical_Architecture_and_API_Contract.md` | Defines the full API surface including the five webhook endpoints, selective-generation and thumbnail endpoints, and the historical reconciliation management command. |

## Naming Conventions

| Convention Area | Rule |
| :--- | :--- |
| Specification files | Use the exact file paths and filenames defined in the Core Operational Behavior Documents List. |
| Markdown section names | Use the exact Required Section names from the master index for each document. |
| YAML frontmatter | Use the Field-by-Field YAML Header Guide and omit empty arrays. |
| Database tables | Use lowercase snake_case table names exactly as defined in the data model specification. |
| SKU family codes | Use uppercase three-letter family codes from `SKU_and_Internal_ID_Guide.md`. |
| Component codes | Use uppercase internal component codes from `Production_Component_Decomposition_Rules.md`. |
| Lifecycle states | Use exact string values from `Order_Status_and_Batch_Lifecycle_SOT.md`; do not paraphrase. |
| Generated output files | Use file naming patterns from `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` and `PPTX_Generation_and_Layout_Engine_Spec.md`. |
| Coding assistant passes | Use the AI Code Assistant CLI workflow pass naming convention `YY-MM-DD_P##_short-slug`. |

## Behavioral Rules for the AI

- Do not invent business rules. If a rule is not in an SOT document, stop and ask the owner.
- Do not implement the `GRD` (Herb Grinder) family. SKU validation must accept it but route components to the Deferred Items queue.
- Do not generate production components for families flagged `production_required: false`.
- Do not generate PPTX output for families flagged `print_document_required: false`.
- Do not modify SOT documents during code generation. If an SOT document is wrong or incomplete, flag it in the Decision Log.
- Do not assume artwork files use front/back separate filenames. Lighters and wallets use one source file per design, placed twice in the layout.
- Do not write to S3 or any cloud storage other than Google Drive.
- All file paths and folder names follow the conventions in `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`.
- The artwork resolver requires three inputs: design code, component code, and originating family code. Do not construct artwork paths using design code and component code alone. Several components (`GRD`, `JAR`, `TRY`, `LITF`, `LITB`) resolve to different product-type folders depending on which family generated them.
- For GRS-family components, retrieve the series name by calling `GET /admin/api/{SHOPIFY_API_VERSION}/products/{product_id}/metafields.json` using the `shopify_product_id` from the `order_items` record. Filter for `namespace: custom, key: series`. Use the metafield `value` as `{SERIES}` in the path `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/{COMPONENT_CODE}.png`. If the metafield is absent or the API call fails, block the component with `MISSING_SERIES_METAFIELD`. Do not implement any fallback path. Do not create a `ProductSeriesMapping` table.
- TIN components resolve to `artwork/Flip Lighter/{DESIGN_CODE}.png` (shared with `LITF`/`LITB`). Apply a 90-degree rotation programmatically during PPTX generation. Do not create or look for a Tin folder in Drive.
- GRD components from an ASHGRD config resolve to `artwork/Ashtray/{DESIGN_CODE}.png` (shared with `ASH`). Apply Grinder transform parameters (not Ashtray parameters) when generating the grinder print placement.
- All BOX-family components (`BOX`, `LITF`, `LITB`, `GRD`, `JAR`) resolve exclusively to `artwork/Stash Box/{DESIGN_CODE}/`. Do not look in the Flip Lighter or Grinder Sets folders for BOX-family components.
- Never persist a tracking number or tracking URL anywhere in the schema or codebase. Tracking is explicitly out of scope for this app (Decision #42); Shopify is the sole source of truth for tracking data.
- The reconciliation topic for refunds is `refunds/create`. `orders/refunded` is not a valid Shopify webhook topic; do not subscribe to it or reference it as if it exists.
- Idempotency for the four reconciliation webhooks (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`) keys on `X-Shopify-Webhook-Id`, not `shopify_order_id`. This is distinct from the pre-existing `orders/paid` idempotency strategy; do not conflate the two.
- `Being Packaged` and `Shipped` are declared order-status enum values reserved for Phase 3. No code path in MVP may write either value. Any code touching order status must respect the `MVP_VISIBLE_ORDER_STATUSES` allowlist rather than the full enum.
- PPTX component placement order is always derived from `component__id` ascending, regardless of the operator's screen sort order or the order in which components were selected. Do not let a UI sort parameter reach the layout engine.

## Decision Log Reference

The live state of approved project decisions is `docs/00_project/Decision_Log_and_Open_Questions.md`.

Coding AI assistants must consult the Decision Log before treating any rule as authoritative. If a required behavior is missing from the relevant source-of-truth document, the assistant must not infer the behavior from surrounding context; it must flag the missing rule for owner review through the Decision Log.