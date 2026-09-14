---
title: "SpicedAnime Fulfillment App: Core Operational Behavior Documents List"
version: "2.10"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - "Josh"
  - "Josiah"
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Shopify Admin API
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
  - batch_number_sequences
  - master_catalog_uploads
core_lifecycle_states:
  - Queued for Production
  - In Production
  - In Production (Needs Reprint)
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
---

# SpicedAnime Fulfillment App: Core Operational Behavior Documents List

This document is the master index for the specification phase of the SpicedAnime fulfillment web app. It defines every documentation file that must exist before the Build and Test phase begins, what each file must contain, and what each file must not contain. It does not contain the specifications themselves; each referenced file is its own deliverable.

## Documentation Tree

```
docs/
├── 00_project/
│   ├── MVP_Scope_and_Roadmap.md
│   ├── Decision_Log_and_Open_Questions.md
│   └── Coding_AI_Context.md
│
├── 01_source_of_truth/
│   ├── End_to_End_Fulfillment_Workflow_SOT.md
│   ├── Order_Status_and_Batch_Lifecycle_SOT.md
│   ├── SKU_and_Internal_ID_Guide.md
│   ├── Production_Component_Decomposition_Rules.md
│   ├── production_component_rules.yaml
│   ├── Product_Image_Transformation_Guidelines.md
│   ├── PPTX_Generation_and_Layout_Engine_Spec.md
│   └── Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md
│
├── 02_app_specs/
│   ├── Data_Model_and_Database_Schema.md
│   ├── Shopify_Integration_and_Order_Import_Spec.md
│   ├── Packing_Sheet_Export_Spec.md
│   ├── Web_App_Screen_Inventory_and_UX_Flow.md
│   ├── Validation_Errors_Reprints_and_Recovery_SOT.md
│   ├── Security_Access_and_Privacy_Spec.md
│   ├── Technical_Architecture_and_API_Contract.md
│   └── Frontend_Color_System.md
│
├── 03_testing/
│   ├── Test_Plan_and_Acceptance_Criteria.md
│   ├── Sample_Data_and_Fixtures.md
│   └── fixtures/
│       ├── shopify_order_single_ashtray.json
│       ├── shopify_order_lighter_tin.json
│       ├── shopify_order_stashbox_set.json
│       ├── shopify_order_mixed_products.json
│       ├── shopify_order_non_produced_only.json
│       ├── expected_components.csv
│       ├── expected_batch_assignments.csv
│       └── expected_packing_sheet_rows.csv
│
└── 04_operations/
    └── Deployment_and_Operations_Runbook.md
```

## Approval Status Key

| Status | Meaning |
| :--- | :--- |
| **Requires owner approval** | The store owner (Josiah) must review and sign off before the document is treated as authoritative. Coding AI must not implement against an unapproved document. |
| **Owner approval not required** | Developer-facing document. Authored and maintained by the technical collaborator. Owner may review but sign-off is not a build blocker. |

Document lifecycle states (used in each file's own YAML header):

| State | Meaning |
| :--- | :--- |
| `Pending Owner Verification` | Draft is complete and waiting for review. |
| `Changes Requested` | Owner reviewed and asked for revisions. |
| `Approved Baseline` | Locked for the coding AI. Changes require version bump and re-approval. |

## Source-of-Truth Hierarchy

The seven document tiers, in precedence order from highest authority to lowest:

1. **Source of Truth (SOT)**. Authoritative business and operational rules. Owner-approved. All other documents must conform to these. Conflicts resolve in favor of the SOT.
2. **Machine-Readable Config**. A direct machine-parseable mirror of a specific SOT document. Must remain bit-for-bit consistent with its parent SOT. Currently: `production_component_rules.yaml`.
3. **Implementation Spec**. Developer-facing documents that translate SOT rules into database schema, API contracts, screen flows, and integration behavior. Must reference the relevant SOT for any business rule rather than restating it.
4. **Derived Spec**. Documents that combine multiple SOTs into a domain-specific operational view (for example, validation behavior derives from SKU rules, batch lifecycle, and workflow narrative).
5. **Test Spec**. Documents that define test scenarios and expected outputs based on SOT and Implementation Spec content.
6. **Test Fixture**. Concrete machine-readable inputs and expected outputs used by automated tests.
7. **Operations Runbook**. Setup, deployment, and maintenance instructions. Does not define behavior; only operates implementations.

If a non-SOT document contradicts an SOT, the SOT wins and the non-SOT document must be revised.

If two SOTs contradict each other, the inconsistency is escalated to the owner and added to the Decision Log before any code change is made.

---

# Document Specifications

---

## 00_project/

### `docs/00_project/MVP_Scope_and_Roadmap.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines what is included in MVP and what is deferred to later phases. Prevents scope creep during the build phase. Establishes phase gates and the success definition for the MVP.

**Thick Boundaries:**
- **Must Cover:** MVP feature scope, deferred features by phase, explicit MVP exclusions, MVP success criteria.
- **Must Consider:** Deferred Shopify product families (Herb Grinder), deferred output formats (PDF), deferred integrations (shipping labels, customer portal).
- **Explicitly Excludes:** Architecture decisions (belong in `Technical_Architecture_and_API_Contract.md`), database schema, business rules from SOT documents, image transformation specs.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Phase Overview | Table listing MVP, Phase 2, Phase 3, Phase 4, Phase 5 with one-sentence scope per phase. |
| MVP Feature Scope | Bulleted list of every feature included in the first build. |
| Deferred Features | Table of features explicitly deferred, with target phase. |
| Deferred Product Families | List of SKU families with `implementation_status` other than `MVP`. |
| MVP Success Definition | Objective criteria that mark MVP as complete. |

**Required Hardcoded Content**

Phase table:

| Phase | Scope |
| :--- | :--- |
| MVP | Shopify paid/unfulfilled order intake, SKU parsing, component generation, artwork lookup, production batches per produced family, PPTX generation (full-batch and operator-selected subsets), combined packing sheet export, mark printed workflow, Needs Attention recovery queues, Deferred Items queue for `GRD` family, Shopify fulfillment/cancellation/refund reconciliation (Decision #42), and one-time historical reconciliation tooling (Decision #43). Pulled forward from later phases per owner request (2026-08-25): SKU Manager rebuilt around a live Shopify catalog read and SKU auto-generation engine (Decisions #68, #69), a dedicated Missing SKU funnel on Needs Attention (Decisions #70, #88), bulk reprint tooling from Orders with `In Production (Needs Reprint)` (Decision #71), on-demand batch PPTX preview (Decision #72), and Event Prints (Decisions #73, #92). Owner-approved MVP additions and refinements on 2026-09-02 include customer-name exposure restricted outside Packing Queue (Decision #94), Dashboard Active Batches and bounded operational panels (Decision #95), the Current Batches `All` lifecycle view (Decision #96), actionable Needs Attention queues (Decision #97), the revised Order Detail summary hierarchy (Decision #98), cumulative full-Shopify-product CSV SKU export (Decision #99), server-side Artwork Library sorting (Decision #100), large-batch Batch Detail table UX (Decision #101), direct Order Detail file/artwork access (Decision #102), order-specific aggregated lifecycle history (Decision #103), bulk Missing SKU generation/review/approval/rejection plus bulk order reimport (Decision #104), the revised Orders operational/reprint workflow (Decision #105), Packing Queue presentation cleanup (Decision #106), collapsed Status Guides (Decision #107), and native new-tab-capable app navigation (Decision #108). Owner-approved additions on 2026-09-04 include Global Filter cross-screen date-range filtering controlled from Dashboard across Dashboard, Orders, Current Batches, Batch Detail, and Needs Attention, including a Filtered Production Summary counting purchased units by originating product family with complete reconciliation (Decision #110); and Orders Attention column surfacing Missing SKU indicators for affected orders using the design-system Danger treatment without changing order lifecycle status (Decision #111). Owner-approved refinements in Decisions #112 through #118: the Master Filter → Global Filter rename (Decision #112); a persistent Global Filter active-range indicator on Orders, Current Batches, and Needs Attention (Decision #113); the Order-number column link treatment extended to every table with an Order column (Decision #114); permanently unique, never-reissued batch numbers (Decision #115); the Orders reprint-picker auto-select-on-open plus a top-pinned Floating Bulk Flag Reprint control (Decision #116); the Needs Attention selected queue-tab moved to the app-wide spice-tint convention (Decision #117); and the SKU Manager Shopify master catalog moved to an operator-refreshable Google Drive upload with app-side drift detection, superseding Decision #99's immutable-master provision (Decision #118). Decision #119 confirms three already-shipped Global Filter implementation choices as-built. Decisions #120–#123 (2026-09-10): Grinder/Jar/Tray PPTX slides are grouped one product type per slide with the Grinder and Jar 4x3 grids locked and a per-slide product-type label (#120); Lighter/Tin PPTX slides are grouped by SKU color code (`WHT`/`SIL`/`GLD`), superseding Decision #57 (#121); the Orders `Attention` column becomes a server-side sort control mutually exclusive with the `Order #` sort (#122); and all four Needs Attention queues default most-recent-first with an `Order #` sort control, or `Received at` for Webhook Failures (#123). Decisions #124–#130 (2026-09-10/11): SKU Auto-Generation Engine corrections (#124), per-batch image adjustment overrides (#125/#126), SKU Manager sibling auto-proposals and Accept All Approvable (#127), whole-order re-import SKU preservation (#128), one-time canonical SKU remediation (#129), and table refinements (#130). Decisions #131–#136 (2026-09-11 through 2026-09-13): Switch-gated manual override for Brightness/Contrast with Pillow-baked Saturation/Sharpness (#131); 25 fixed sandbox SKUs covering all producing combinations, bundles, and lighter color variants (#132); single-variant fallback normalization and Stash Box promotion to `BOX4` (#133); Event Prints candidate deduplication to `LIT` family and multi-color lighter quantity selection (#134); SKU Manager product-grouped table hierarchy, split Filter Panel vs sticky Actions bar, "How to Read SKUs" disclosure guide, Smart SKU Editor modal, 4-character design code floor, whole-catalog sort, Collapse Mode, typed page input, Table CSV export, and Shopify type corrections (#135); and Lighter cover-crop image fit mode plus Event Prints compact active-product image adjustment overrides (#136). |
| Phase 2 | PDF export from PPTX, audit log UI. |
| Phase 3 | Shipping label integration (provider TBD by owner). |
| Phase 4 | Customer-facing order status portal. |
| Phase 5 | Analytics, forecasting, inventory tracking. |

Deferred Shopify product families for MVP:

| Family Code | Family Name | Reason | Target Phase |
| :--- | :--- | :--- | :--- |
| `GRD` | Herb Grinder | Not yet set up on the Shopify site; SKU dictionary entry reserved. | Post-MVP, owner-dependent |

Deferred features for MVP:

| Feature | Reason | Target Phase |
| :--- | :--- | :--- |
| PDF output | PPTX is the MVP output format. | Phase 2 |
| Direct printer integration | MVP prints manually from downloaded PPTX. | Post-MVP if needed |
| Shipping label generation | Provider not selected. | Phase 3 |
| Customer-facing status page | Depends on Shopify app proxy or storefront integration. | Phase 4 |
| Multi-user roles beyond single admin | One operator in MVP. | Post-MVP |

MVP Success Definition:

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

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `SKU_and_Internal_ID_Guide.md` | Source of family code definitions referenced by Deferred Product Families and the SKU-generation behavior used by SKU Manager and Missing SKU recovery. |
| `Technical_Architecture_and_API_Contract.md` | MVP scope constrains which APIs and integrations must be implemented, including SKU export, bulk recovery, Order Detail aggregation, and server-side sorting. |
| `Decision_Log_and_Open_Questions.md` | Phase and owner-approved feature decisions are recorded in the Decision Log, including Decisions #42–#43, #94–#108, and #110–#130. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines reconciliation, historical reconciliation, normal order reimport, and the reimport behavior reused by Missing SKU recovery. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines validation and recovery semantics used by Needs Attention, including `NO_SKU` recovery. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Defines the operator-facing screen structure and workflows for the MVP features listed here. |

---

### `docs/00_project/Decision_Log_and_Open_Questions.md`

**Approval Status:** Requires owner approval (Approved Decisions section is immutable after sign-off)

**Source Type:** Source of Truth (project control)

**Primary Purpose:**
Single canonical record of every owner-approved decision and every unresolved item that blocks a document or build step. Coding AI must consult this document before treating any rule as authoritative.

**Thick Boundaries:**
- **Must Cover:** All approved decisions from the Exploration Phase, the document each decision affects, and any remaining open items with their blocking impact.
- **Must Consider:** Decisions must include the date of approval and the originating conversation reference where available.
- **Explicitly Excludes:** Business rule definitions themselves (those live in the SOT documents that the decisions point to), implementation details, code-level decisions.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Approved Decisions | Table of every owner-confirmed decision with date and affected documents. |
| Open Questions | No open items remain; #2 and #3 were resolved by Decisions #37 and #38 on 2026-07-07. New questions use the table format `# | Question | Blocking Documents | Owner`. |
| Decision History | Chronological log of how prior open items were resolved. |

**Required Hardcoded Content**

Approved Decisions table:

| # | Decision | Resolution | Date | Affected Documents |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Build platform | Desktop-first web app with cloud backend. | 2026-06-11 | All |
| 2 | Shopify order trigger | Paid and initially unfulfilled. | 2026-06-11 | `Shopify_Integration_and_Order_Import_Spec.md` |
| 3 | Initial order status | `Queued for Production`. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 4 | Post-print order status | `In Production`. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 5 | Batch grouping | Separate active batches per production group. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md`, `End_to_End_Fulfillment_Workflow_SOT.md` |
| 6 | Print output format | PPTX for MVP. | 2026-06-11 | `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 7 | Batch locking behavior | Clicking Generate PPTX locks the batch; new orders go to a new open batch. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 8 | Batch timing | Manual close/open with automatic date-range labels. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 9 | Packing sheet scope | Combined across all production groups; includes non-produced items. | 2026-06-11 | `Packing_Sheet_Export_Spec.md` |
| 10 | Partial batch printing | Allowed; errors do not block valid items. | 2026-06-11 | `Validation_Errors_Reprints_and_Recovery_SOT.md` |
| 11 | Print sheet labels | No order numbers or labels on design sheets. | 2026-06-11 | `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 12 | Page size | 8.5" x 11" portrait, PowerPoint default margins. | 2026-06-11 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 13 | Canceled/refunded orders pre-print | Ignored for MVP; store IDs for later handling. | 2026-06-11 | `Shopify_Integration_and_Order_Import_Spec.md` |
| 14 | Full fulfillment status chain | `Queued for Production` -> `In Production` -> `Being Packaged` -> `Shipped`. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 15 | Mixed-order promotion | Order promotes to `In Production` only when all produced components are printed. | 2026-06-11 | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| 16 | SKU format | `<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>`. | 2026-06-11 | `SKU_and_Internal_ID_Guide.md` |
| 17 | SKU family dictionary | Three-letter family codes; full 13-family dictionary approved. | 2026-06-13 | `SKU_and_Internal_ID_Guide.md` |
| 18 | Grinder Sets vs Herb Grinder | `GRS` for Grinder Sets; `GRD` reserved for Herb Grinder (deferred for MVP). | 2026-06-13 | `SKU_and_Internal_ID_Guide.md` |
| 19 | Non-produced family handling | Five families (BAT, HOD, PIL, TAP, TOT) are packing-sheet-only with no print components. | 2026-06-13 | `SKU_and_Internal_ID_Guide.md`, `Packing_Sheet_Export_Spec.md` |
| 20 | Tray page capacity | 3 per page. | 2026-06-14 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 21 | Ashtray page capacity | 6 per page. | 2026-06-14 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 22 | Lighter front/back artwork | Same source file used for both placements. | 2026-06-14 | `Production_Component_Decomposition_Rules.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| 23 | Wallet front/back artwork | Same source file used for both placements. | 2026-06-14 | `Production_Component_Decomposition_Rules.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| 24 | Cloud storage provider | Google Drive for all environments (artwork, generated PPTX, packing sheets). | 2026-06-14 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Technical_Architecture_and_API_Contract.md` |
| 25 | Technical stack | Next.js + React + TypeScript (frontend), Django + Django REST Framework (backend), PostgreSQL (database). | 2026-06-14 | `Technical_Architecture_and_API_Contract.md`, `Data_Model_and_Database_Schema.md`, `Deployment_and_Operations_Runbook.md` |
| 26 | Background job worker | Celery + Redis. | 2026-06-14 | `Technical_Architecture_and_API_Contract.md`, `Deployment_and_Operations_Runbook.md` |
| 27 | SKU Manager API completeness | Add PATCH /api/skus/{id}/ and POST /api/skus/{id}/retire/ to the API endpoint table. Row count changes from 20 to 22. Master index updated accordingly. | 2026-06-15 | `Technical_Architecture_and_API_Contract.md`, `core_operational_behavior_documents_list.md` |
| 28 | Hosting platform | Railway for backend (Django + Celery), managed PostgreSQL, and managed Redis. Vercel for frontend (Next.js). | 2026-06-15 | `Technical_Architecture_and_API_Contract.md`, `Deployment_and_Operations_Runbook.md`, `MVP_Scope_and_Roadmap.md`, `Coding_AI_Context.md` |
| 29 | SKU migration strategy | Hard cutover. No legacy SKU alias infrastructure. Every Shopify variant must carry a canonical SKU before go-live. The `sku_aliases` table, the `POST /api/skus/{id}/alias/` endpoint, the Legacy SKU Alias Handling section of the SKU guide, the CSV Rollout Rules legacy alias references, and the SKU Manager alias UI are removed from MVP scope. | 2026-06-15 | `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md`, `Technical_Architecture_and_API_Contract.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `core_operational_behavior_documents_list.md` |
| 30 | BAT product_type exclusion | `BAT` (Black Art Tapestry) is intentionally excluded from the Shopify `product_type` mapping for MVP. BAT line items are identified by SKU family prefix only. `product_type` cross-checking is skipped for `BAT`; `product_type` mismatch audit warnings do not apply to `BAT` because it has no `product_type` mapping. No `product_type` value is assigned to `BAT`. | 2026-06-15 | `Shopify_Integration_and_Order_Import_Spec.md` |
| 31 | TIN canonical treatment | `TIN` is a production component code only, used by `LIT`/`LITTIN` print output; it is not a standalone Shopify SKU family for MVP. | 2026-06-18 | `SKU_and_Internal_ID_Guide.md`, `Production_Component_Decomposition_Rules.md`, `production_component_rules.yaml`, `Shopify_Integration_and_Order_Import_Spec.md`, backend parser/import/seed tests |
| 32 | GRS series resolution strategy | The series name for Grinder Set artwork paths is sourced exclusively from the Shopify product-level custom metafield `custom.series`, retrieved via `GET /admin/api/{SHOPIFY_API_VERSION}/products/{product_id}/metafields.json` using the `product_id` on the order line item. The metafield is product-level, so one call covers all variants of a given product. If the metafield is absent or the call fails, the GRS component is Blocked with failure code `MISSING_SERIES_METAFIELD`. No database fallback. No flat-path fallback. The `product_id` from the Shopify order line item must be captured into `order_items.shopify_product_id`. | 2026-06-24 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Production_Component_Decomposition_Rules.md`, `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md`, `Shopify_Integration_and_Order_Import_Spec.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Technical_Architecture_and_API_Contract.md`, `Coding_AI_Context.md`, `Deployment_and_Operations_Runbook.md` |
| 33 | TIN artwork source and rotation | TIN component resolves to the Flip Lighter folder, sharing the same source file as LITF and LITB for the same design: `artwork/Flip Lighter/{DESIGN_CODE}.png`. No separate Tin folder. The PPTX generation pipeline applies a 90-degree rotation to the fetched asset programmatically during generation; the file is stored upright in Drive. | 2026-06-24 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Production_Component_Decomposition_Rules.md`, `SKU_and_Internal_ID_Guide.md`, `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md`, `Coding_AI_Context.md` |
| 34 | GRD component source in ASHGRD bundles | GRD component generated by `ASH`-family `ASHGRD` config resolves to the Ashtray folder: `artwork/Ashtray/{DESIGN_CODE}.png`. No independent GRD file is required for this config. The image processing engine applies GRD transformation parameters (2.35" circle crop, `#F2F2F2` border) to the Ashtray source file during generation. | 2026-06-24 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Production_Component_Decomposition_Rules.md`, `SKU_and_Internal_ID_Guide.md`, `Coding_AI_Context.md` |
| 35 | BOX-family component artwork isolation | All components generated by `BOX`-family configurations (`BOX`, `LITF`, `LITB`, `GRD`, `JAR`) resolve exclusively to the Stash Box design subfolder: `artwork/Stash Box/{DESIGN_CODE}/`. BOX-config LITF and LITB do not look in the Flip Lighter folder. The resolver applies family-aware routing: when `family_code == 'BOX'`, all component paths are constructed from the Stash Box subfolder. | 2026-06-24 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Production_Component_Decomposition_Rules.md`, `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md`, `Coding_AI_Context.md` |
| 36 | Design record creation strategy | Design records are auto-created at order import time. `_resolve_design()` uses `get_or_create(design_code=design_code, defaults={'design_name': design_code, 'is_active': True})`. `UNKNOWN_DESIGN` is eliminated as a validation failure code. The `seed_designs` management command and `designs.yaml` fixture remain available to pre-populate `design_name` display labels but are not required for production intake. | 2026-06-27 | `Shopify_Integration_and_Order_Import_Spec.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md`, `Deployment_and_Operations_Runbook.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `core_operational_behavior_documents_list.md` |
| 37 | Internal design ID format for auto-created designs | `AUTO{id}` (e.g., `AUTO4821`), where `{id}` is the design row's primary key, is the accepted `internal_design_id` format for designs auto-created at order import time under Decision #36. Sequential `D######` IDs remain the format for seeded or manually created designs. Both formats are valid, permanent, and unique; auto-created designs are never renumbered. No backend change required. Resolves Open Question #2. | 2026-07-07 | `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md`, `core_operational_behavior_documents_list.md` |
| 38 | Settings screen scope for MVP | Settings (`/settings`) is read-only for MVP: integration status cards sourced exclusively from `GET /api/settings/integration-status/`. The "Update Shopify webhook secret" and "Update Drive credentials" write actions and the TBD batch-rule configuration row are removed from MVP scope. Credential rotation is performed via server-side environment variables per `Security_Access_and_Privacy_Spec.md`, not through the app. Accepts the P36/P39 as-built implementation. Resolves Open Question #3. | 2026-07-07 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `core_operational_behavior_documents_list.md` |
| 39 | P50/P50.1/P51 webhook payload rejection incident resolution | Between 2026-07-15 18:47 UTC and 2026-07-17 07:49 UTC, 130 webhook deliveries were rejected because the importer treated null `sku` on line items as order-fatal and required `customer.first_name` without fallback. P50 identified root cause, deployed item-level null-SKU handling and shipping-address name fallback, and verified the fix via the live webhook path. P50.1 reconciled the 16 affected orders and established that 5 remained eligible for replay. P51 replayed all 5 Group A (unfulfilled) orders successfully (orders 3026, 3029, 3030, 3031, 3032 created with 12 items and 8 components). The 8 Group B orders (3017, 3018, 3019, 3020, 3022, 3023, 3024, 3025) were fulfilled in Shopify during the incident window and remain absent from the app per the fulfillment guard; they are ineligible for replay unless explicitly re-approved. One order (3028) was recovered in P50. Two orders (3033, 3034) were already present. This resolves the production incident; see P50–P51 reports for full technical and reconciliation details. | 2026-07-17 | `Shopify_Integration_and_Order_Import_Spec.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md` |
| 40 | Packing-sheet output retention | Completed packing exports, including the packing-sheet PII they contain, are retained for exactly 30 calendar days from successful export finalization. The application defaults `PACKING_EXPORT_RETENTION_DAYS` to `30`; any configured value must be a positive integer and cannot silently alter the approved policy. This decision applies only to packing outputs, not order deletion, backups, Drive versions, legal holds, or customer requests. | 2026-07-23 | `Data_Model_and_Database_Schema.md`, `Security_Access_and_Privacy_Spec.md`, `Technical_Architecture_and_API_Contract.md`, `Deployment_and_Operations_Runbook.md` |
| 41 | P25 fresh Shopify registered-webhook delivery proof: owner acceptance and technical closure | On 2026-07-16, the owner accepted the then-missing fresh registered-webhook delivery proof as a post-MVP residual for MVP governance purposes; that acceptance did not supply technical evidence and formal Decision Log alignment was left outstanding (audit finding `DOC-004`). P66.2 (2026-07-27) proved the fresh staging webhook path end to end: a new paid, unfulfilled development-store order produced exactly one Shopify-classified HTTP POST to the deployed receiver, verified HMAC, one queued Celery task, one Redis `SUCCESS` result, and the full persisted Order/OrderItem/ProductionComponent/Artwork/BatchItem/Batch/audit-event graph — but the pass remained `PARTIAL` because the required official Shopify app-managed delivery record could not be retrieved through Shopify CLI app logs. P66.3 (2026-07-27) retrieved that official record from the Shopify Dev Dashboard and correlated it to the P66.2 event by app, shop, topic, HTTP 200, delivery time, attempt count, and Subscription ID fingerprint. The one apparent Subscription ID fingerprint mismatch was resolved as a SHA-256 input-normalization difference (jq's trailing-LF output vs. Python `.strip()`) on the same copied value, not a data discrepancy. P25 threshold A is satisfied as of P66.3. This closes `DOC-004` and formally records the 2026-07-16 owner acceptance. | 2026-08-12 | `Decision_Log_and_Open_Questions.md` |
| 42 | Shopify fulfillment lifecycle reconciliation (post-import status sync) | Expand Shopify webhook subscriptions beyond `orders/paid` to include `orders/updated`, `orders/fulfilled`, `orders/cancelled`, and `refunds/create` (the Shopify-supported topic; `orders/refunded` is not a valid Shopify topic and was never subscribed), so post-import status changes made in Shopify flow back into the app. A new order lifecycle state `Fulfilled Externally` is added to the Order Status enum for orders whose fulfillment occurs outside the app (e.g., Josiah marks the order fulfilled directly in Shopify). Transition rule: any order in `Queued for Production` or `In Production` that receives an `orders/fulfilled` event transitions to `Fulfilled Externally`. `orders/updated` refreshes the shipping-address snapshot on the existing order record without changing lifecycle state; tracking numbers and tracking URLs are explicitly out of scope for this app and are persisted nowhere. On `orders/cancelled` or `refunds/create`: any `production_components` for that order still in `Queued` or `Ready` status are pulled out of their `Open` batch (removed from the batch, component status set to `Canceled`); components already `Printed` remain as-is and are not re-batched; the order transitions to a terminal `Canceled` state. Idempotency for these four topics keys on the Shopify delivery id (`X-Shopify-Webhook-Id`), persisted in a new `webhook_receipts` table. Selective PPTX generation (companion feature, same directive): operators may select a subset of a batch's ready components for PPTX generation, leaving the remainder in the original Open batch; front/back pairs (LITF+LITB, WALF+WALB) auto-include both halves when only one is selected. No historical backfill is performed on deploy; orders that were fulfilled or cancelled in Shopify prior to this change remain in their current app state until reconciled manually by the owner via the one-time `reconcile_shopify_history` management command (Decision #43). Post-deploy verification of the four new topics is performed manually by the owner. Supersedes Decision #13. Implemented by P69 (2026-08-13). Amendment (Feature C, implemented by P70, 2026-08-13): the `orders/fulfilled` transition to `Fulfilled Externally` (both live, via the webhook, and historical, via `reconcile_shopify_history --apply`) now also runs the same component pull-out described above for `orders/cancelled`/`refunds/create`: any `production_components` for that order still in `Queued` or `Ready` status are removed from their `Open` batch and set to the existing `Canceled` component status, reusing that value rather than introducing a new one, since the order has already shipped outside the app and that pending production work is moot. This closes a gap in the original scope of this decision, discovered after `--apply` was run in production: `orders/fulfilled` originally wrote only the order status. A one-time management command, `backfill_fulfilled_externally_pullout`, applies the same pull-out retroactively to orders already `Fulfilled Externally` before the fix existed; run against production on 2026-08-14, it pulled out components on 136 of 266 `Fulfilled Externally` orders, is idempotent on repeat runs, never contacts Shopify, and never writes order status. Documented 2026-08-18. | 2026-08-13 | `Shopify_Integration_and_Order_Import_Spec.md`, `Order_Status_and_Batch_Lifecycle_SOT.md`, `End_to_End_Fulfillment_Workflow_SOT.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Data_Model_and_Database_Schema.md`, `Technical_Architecture_and_API_Contract.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md`, `Coding_AI_Context.md`, `core_operational_behavior_documents_list.md` |
| 43 | One-time historical Shopify reconciliation command | A management command, `reconcile_shopify_history`, provides operator-run (not automatic) reconciliation for orders that drifted out of sync with Shopify before Decision #42's four live webhooks existed. Supports `--dry-run` (read-only; reports proposed transitions and, for cancellations, the eligible-component count) and `--apply` (re-fetches Shopify fresh per order and applies the same transition and cancellation pull-out logic as the live webhooks). Scope is limited to orders in `Queued for Production` or `In Production`; already-terminal orders are never touched. Orders with ambiguous or self-contradictory Shopify status signals are reported and left untouched, never guessed. No automatic execution on deploy, startup, or schedule; this remains a manual, owner-invoked, one-time tool, consistent with Decision #42's "no historical backfill" rule. Implemented by P70 (2026-08-13). | 2026-08-13 | `Shopify_Integration_and_Order_Import_Spec.md`, `Order_Status_and_Batch_Lifecycle_SOT.md`, `Data_Model_and_Database_Schema.md`, `Technical_Architecture_and_API_Contract.md`, `core_operational_behavior_documents_list.md` |
| 44 | Batch status display-label override ("Locked for Review" → "PPT Generated" on Current Batches) | The Current Batches screen badge for `production_batches.status = 'Locked for Review'` displays "PPT Generated" instead of the raw enum string. This is a UI display-label override only: the underlying status value, the status-key legend on both `/batches` and `/batches/{id}`, the status filter toggle, and the Batch Detail and Dashboard badges are unchanged and continue to show "Locked for Review". Resolves Open Question #4. Implemented by P72 (2026-08-20). | 2026-08-20 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 45 | Lighter PPTX rotation rule for landscape source images | For Lighter (`LITF`/`LITB`) components, during PPTX image preprocessing, if the source artwork image is landscape (wider than tall) and the target slide shape is the documented Lighter portrait container (2.22" H x 1.42" W), rotate the image 90 degrees so it aligns with the shape's portrait orientation. Portrait-oriented source images are left unrotated. This applies per source image, not as a fixed unconditional rotation like Tin's (Decision #33), since Lighter source files vary in original orientation across designs. Confirmed by owner review of manual PowerPoint insertion output showing landscape images placed sideways into the Lighter shape. Rotation direction is determined during implementation by matching output against baseline comparison slide images. | 2026-08-20 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 46 | Test order restriction for live verification during implementation passes | When an implementation pass is explicitly authorized to perform live verification against production data (per the existing `AGENTS.md` rule requiring explicit authorization for any production/staging mutation), that verification is restricted exclusively to Shopify order numbers 3388, 1001, 1002, 1003, 1004, and 1005. These are designated test orders. A pass must not select real customer orders or components for live verification, even with authorization to run live, unless a specific pass's instructions explicitly name a different order and the owner has approved that exception for that pass only. | 2026-08-20 | `AGENTS.md` |
| 47 | Sandbox test-order mechanism for PPTX layout testing | A management command and a UI-triggered action create synthetic test orders directly in the database, bypassing Shopify import/webhooks entirely, so both Josh and Josiah can generate PPTX output for every producing product type without creating real Shopify orders. Synthetic orders use `order_number` values prefixed `TEST-` (e.g. `TEST-001`) and a synthetic unique `shopify_order_id` prefixed `SANDBOX-`. Every row created by this mechanism (`orders`, `production_components`, `production_batches`, `batch_items`) is flagged `is_sandbox = true`. Sandbox rows are excluded from the Dashboard, the main Orders list, the main Current Batches list, and packing-sheet export selection; they are visible and actionable only on a dedicated `/sandbox` screen. Sandbox rows are excluded from the Decision #40 30-day packing-export retention policy and are retained indefinitely until manually cleared by the operator. Sandbox batches are exempt from the Decision #7 lock-on-generate rule: clicking Generate PPTX on a sandbox batch does not transition it to `Locked for Review` and does not spawn a new `Open` batch; the same sandbox batch can be regenerated an unlimited number of times. This mechanism is authorized to run against the deployed Railway environment as well as local/dev, since sandbox rows are isolated from operational data per the exclusions above. | 2026-08-21 | `Order_Status_and_Batch_Lifecycle_SOT.md`, `Data_Model_and_Database_Schema.md`, `Sample_Data_and_Fixtures.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Security_Access_and_Privacy_Spec.md`, `AGENTS.md` |
| 48 | Lighter PPTX grid arrangement (resolves Open Question #7) | Per page, Lighter placements are arranged as 4 rows x 5 columns in two vertical blocks of 5 lighters each. Within each block, the top row is 5 fronts (LITF) for those 5 designs and the row directly below is the corresponding 5 backs (LITB), front and back stacked vertically per design rather than placed side by side. The pattern repeats for the second block of 5 designs in rows 3 to 4. Total 10 lighters, 20 placements per page. Supersedes the "5 rows of 2 lighters each, front+back side by side per lighter" description in `PPTX_Generation_and_Layout_Engine_Spec.md`. Confirmed by owner against `flip-lighters-template2.jpg` and `flip-lighters-example.jpg`. | 2026-08-21 | `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 49 | Lighter border weight and line style | The Lighter border (White/Gold `#FBE3D6`, Silver `#F2F2F2`) is drawn at 1pt weight, solid line. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md` |
| 50 | Tin image fit behavior | For Tin, the source image must not be cropped in any way. The full image is scaled to fit within the shape (contain/fit mode), not cropped to fill it (cover/crop mode). Shape and dimensions (2.35" H x 3.75" W, rectangle with rounded corners) are unchanged. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 51 | Tin and Wallet border weight and line style | Tin (White/Gold `#FBE3D6`, Silver `#F2F2F2`) and Wallet (`#FBE3D6`) borders are drawn at 1.5pt weight, solid line. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md` |
| 52 | Tin, Wallet, and Lighter image fit behavior | Tin, Wallet, and Lighter all use fit mode: the source image is scaled to fit fully within the shape and is never cropped. Extends Decision #50 (previously Tin-only) to Wallet and Lighter. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 53 | Tin and Lighter rounded corner radius | Tin and Lighter use a rounded rectangle shape where the corner radius is proportional to and dictated by the shape's own dimensions, not a fixed independent radius value. No separate radius parameter is required. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md` |
| 54 | Grinder, Ashtray, Jar, Box image fit behavior | Grinder, Ashtray, and Jar (circle crop) and Box (rectangle) all use crop-to-shape mode: the source image is cropped to fill the shape completely, opposite of the fit mode used by Tin, Wallet, and Lighter (Decision #52). | 2026-08-21 | `Product_Image_Transformation_Guidelines.md` |
| 55 | Grinder, Jar, and Ashtray border weight and line style | Grinder (`#F2F2F2`), Jar (`#FBE3D6`), and Ashtray (`#F2F2F2`) borders are drawn at 1.5pt weight, solid line. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md` |
| 56 | Wallet PPTX grid arrangement | Per page, Wallet placements are arranged as 4 rows x 2 columns. Each row is one wallet, with front (WALF) and back (WALB) placed side by side in that row's two columns. Four rows stack vertically for the 4 wallets per page (8 placements total). Corrects the "2 rows of 2 wallets each" description in `PPTX_Generation_and_Layout_Engine_Spec.md`; front+back side-by-side pairing within a wallet's row is unchanged. Confirmed by owner against the wallet layout screenshot. | 2026-08-21 | `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 57 | Border color assignment is per-component, mixing allowed within a page | Border color for Lighter and Tin (White/Gold vs. Silver) is resolved independently per component from that component's own order SKU color code (`WHT`, `SIL`, `GLD`), not fixed at the batch or page level. Batches group by production group only per `Order_Status_and_Batch_Lifecycle_SOT.md` and do not sub-group by color, so a single batch, and therefore a single generated PPTX page, may contain a mix of White/Gold-bordered and Silver-bordered components. This is a documentation clarification of existing behavior, not a system change. | 2026-08-21 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 58 | Sandbox checkout and reset redesign | Replaces the fixed-set auto-population and idempotent-repair "Reset sandbox data" behavior from Decision #47/P76 with a checkout model. The operator selects from the existing 14 fixed sandbox SKUs and a quantity per SKU (capped at 10 per item) to build a sandbox order; a single checkout submission may create up to 7 distinct sandbox orders (7 unique order numbers) at once, each independently composed. Created orders are `TEST-` prefixed with an auto-assigned sequential order number and flow through normal component generation and batch assignment like any other sandbox order. "Reset sandbox data" is redefined to fully clear all current sandbox rows (`orders`, `production_components`, `production_batches`, `batch_items`) rather than restoring a baseline set. Testing a SKU not among the existing 14 requires a separate pass to add it as a new fixed sandbox item, with artwork supplied by the owner; it is not selectable at checkout. Supersedes the fixed-set-recreation behavior described in Decision #47. | 2026-08-22 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Sample_Data_and_Fixtures.md` |
| 59 | One-time batch reset for P77 image-config correction | A one-time, operator-invoked management command transitions every batch currently in `Locked for Review` ("PPT Generated") status back to `Open` and clears its `generated_file_url`, across all production groups, so the next Generate PPTX click regenerates the file under the corrected specs (Decisions #48–#57). Batches already `Printed` are excluded and left untouched. This is a one-time historical cleanup tied to the P77 spec correction; it does not introduce a standing "undo a bad PPTX" feature. | 2026-08-22 | `Order_Status_and_Batch_Lifecycle_SOT.md`, `Technical_Architecture_and_API_Contract.md` |
| 60 | BOX-bundle Lighter colour SKU gap (root cause of P77 `color_code=None` PPTX crash) | Root-caused during P77: the `BOX-<DESIGN>-<CONFIG>` SKU format carries no colour segment at all, yet the `BOXLIT` and `BOX4` configs decompose into `LITF`/`LITB` components that require a resolved White/Gold vs. Silver border colour (`Product_Image_Transformation_Guidelines.md`). This caused a production PPTX generation crash (`color_code=None`; component 706/batch 9, and possibly component 1164/batch 22 — the second could not be confirmed without database access in the P77 session). Owner clarification (2026-08-22): the flip-lighter colour bundled into a Stash Box is currently fixed/preset per product and not a customer-selectable option — this is a genuine SKU-creation gap on the Shopify catalog side (the fixed colour was never encoded into the SKU), not a missing customer-input mechanism, and not a case where the app should invent a default. Interim fix (P77): a `validate_batch_color_codes` pre-flight check in `layout_engine.py` fails PPTX generation for an affected batch with one clear, actionable error instead of crashing mid-generation. Proposed (not yet implemented) resolution: extend the SKU format for the two lighter-bundling configs only (`BOXLIT`, `BOX4`) to `BOX-<DESIGN>-<COLOR>-<CONFIG>`, mirroring the existing `LIT`-family colour-segment convention — e.g. `BOX-DEMONSLAYER-WHT-BOXLIT`, `BOX-DEMONSLAYER-SIL-BOXLIT`, `BOX-DEMONSLAYER-GLD-BOXLIT`, `BOX-DEMONSLAYER-WHT-BOX4`, `BOX-DEMONSLAYER-SIL-BOX4`, `BOX-DEMONSLAYER-GLD-BOX4`; the colour-less 3-segment format remains correct for `SOLO`, `BOXGRD`, and `BOXJAR`, which never bundle a lighter. This pass does not change `sku_parser.py`, `SKU_and_Internal_ID_Guide.md`, or the decomposition rules to require the new form: doing so before the Shopify catalog's actual BOXLIT/BOX4 variant SKUs are updated to the 4-segment form would immediately break parsing for every currently-selling Stash-Box-with-Lighter product. A dedicated future pass should implement the parser/format change only after the Shopify catalog SKUs themselves are updated. Addendum (2026-08-22, same day): the owner confirmed every Stash Box bundle's Lighter colour is White. Implemented in P77: `_extract_color_code` in `layout_engine.py` now defaults a BOX-family `LITF`/`LITB` component to `WHT` whenever no other colour source resolves, so `BOXLIT`/`BOX4` batches generate a White-bordered Lighter automatically instead of tripping the `validate_batch_color_codes` pre-flight error — this is an owner-confirmed business rule implemented in code, not an invented default. The SKU-catalog gap described above is still factually true (`BOX-<DESIGN>-<CONFIG>` still carries no colour segment) and the proposed 4-segment extension remains a valid future improvement for traceability/auditability, but is no longer required to unblock generation. This closes the open question this decision recorded. | 2026-08-22 | `SKU_and_Internal_ID_Guide.md`, `Production_Component_Decomposition_Rules.md`, `Product_Image_Transformation_Guidelines.md` |
| 61 | One-time production remediation for pre-fix Fulfilled Externally orders | During P79, `manage.py backfill_fulfilled_externally_pullout --apply` was run against the production Railway database, owner-authorized in-session. It processed all 402 `Fulfilled Externally` orders; 90 had components still sitting in an `Open` batch from before the Decision #42 pull-out fix existed. All 90 were pulled out and transitioned to `Canceled`, consistent with the existing rule in `Order_Status_and_Batch_Lifecycle_SOT.md`. A post-apply sweep confirmed 0 `Fulfilled Externally` orders retained any pull-out-eligible components. No code change was made: `apply_orders_fulfilled`/`_pull_out_components` in `shopify_reconciliation.py` were already correct for current and future webhook deliveries; this closed a historical-data gap only, not a code defect. This mutation touched real production orders, outside the Decision #46 sandbox-only live-verification scope, and required the explicit owner-approved exception `AGENTS.md` requires for that case, obtained in-session before `--apply` was run. | 2026-08-22 | `Decision_Log_and_Open_Questions.md` |
| 62 | Image transformation parameters updated to the 2026-08-24 owner-confirmed spec | Per-product image transform values are updated to match the owner-confirmed `spicedanime-transformations-2026-08-24.md`. Border line weight becomes 0.75pt solid for every bordered product (Lighter, Tin, Wallet, Grinder, Jar, Ashtray), superseding the 1pt Lighter weight (Decision #49) and the 1.5pt weight for the others (Decisions #51, #55). The Silver/grey border color becomes `#E8E8E8` (from `#F2F2F2`) for Lighter Silver, Tin Silver, Grinder, and Ashtray, updating the color used in Decision #57's per-component resolution. Grinder diameter becomes 2.45" (from 2.35"); Jar diameter becomes 2.65" (from 2.55"); Box becomes 4.3" H x 6.25" W (from 4.1" H x 6" W). Grinder gains color adjustments of -10% Brightness, +25% Contrast, 150% Saturation (previously None), which the GRD-from-ASHGRD placement inherits. Box brightness becomes -10% (from -15%). White/Gold `#FBE3D6` borders (Lighter/Tin White/Gold, Jar, Wallet), all shape/crop modes (Decisions #50/#52/#54), proportional corner radius (Decision #53), grid arrangements (Decisions #48/#56), rotations (Decisions #33/#45), and the Ashtray Flip Horizontal are unchanged. This changes documented parameter values only; the Pillow preprocessing code that applies them is implemented in a separate build pass. | 2026-08-25 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md`, `Production_Component_Decomposition_Rules.md` |
| 63 | Dashboard and Current Batches navigation, plus table pagination consistency | On the Dashboard, the summary cards are clickable. **The four-card set defined by this decision (Open Batches → `/batches`, Blocked → `/needs-attention`, Deferred → `/needs-attention`, Queued → `/orders`) is superseded by Decision #93, which merges the Blocked and Deferred cards into a single Needs Attention card; the remaining card destinations are unchanged.** Each Dashboard per-group Open Batches card links to Current Batches pre-filtered to that production group, with the duplicate second button removed. On Current Batches, each card's duplicate open control is reduced to a single button opening Batch Detail (`/batches/{id}`); the top-of-card "Open" status pill is unchanged. The Current Batches production-group filter accepts a URL parameter for deep-linking. A "Per page" dropdown (20/50/100, reset to page 1) is added to the SKU Manager, Audit Log, and Artwork Library tables, matching Orders. Navigation and pagination change only; no data-model or lifecycle change. | 2026-08-25 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 64 | Component status display-label override ("Canceled" → "Print Not Needed") | Wherever a production component's status of `Canceled` is displayed (Order Detail and Batch Detail component lists and their status keys), the UI shows "Print Not Needed" instead of the raw enum string. Display-label override only, following Decision #44: the stored `production_components.status` value remains `Canceled`, the order-level `Canceled` status is unaffected and still displays "Canceled", and all queries, filters, and audit records continue to use the raw value. | 2026-08-25 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 65 | Wallet print dimensions corrected to 2.2" H x 3.5" W | The Wallet per-image dimensions are corrected from 2.2" H x 2.5" W to 2.2" H x 3.5" W. The 3.5" width was physically measured from the owner's reference PPTX during P78 and is the value the shipped rendering code has used since; the 2.5" figure in `Product_Image_Transformation_Guidelines.md`, also carried into the 2026-08-24 confirmed spec, was stale. This resolves the Wallet-width doc/code discrepancy flagged as an open item in the P83 report. Doc-only correction; no code change, as the shipped code already renders 3.5". All other Wallet parameters (border `#FBE3D6` 0.75pt solid, the color adjustments, 4 wallets / 8 placements, 4x2 grid) are unchanged. | 2026-08-25 | `Product_Image_Transformation_Guidelines.md` |
| 66 | TINONLY config: lighter design, tin case only | `TINONLY` is added as a valid `LIT`-family config. A `LIT-<DESIGN>-<COLOR>-<FLAME>-TINONLY` SKU decomposes to a single `TIN` component (no `LITF`/`LITB`), routed to the Tin batch group. The `TIN` resolves to the same `artwork/Flip Lighter/{DESIGN_CODE}.png` source used by LITTIN's TIN, with the same programmatic 90-degree rotation and Tin transform parameters at generation; color comes from the SKU's own color code. `TIN` remains a production component code only, not a standalone Shopify family (Decision #31 stands); a tin-only product is a `LIT`-family SKU, not a `Tin cases` product_type. Resolves the `UNKNOWN_CONFIG` failure on tin-only orders (e.g., 3432, 3447). | 2026-08-25 | `SKU_and_Internal_ID_Guide.md`, `Production_Component_Decomposition_Rules.md`, `production_component_rules.yaml`, `Shopify_Integration_and_Order_Import_Spec.md` |
| 67 | NO_SKU failure code for missing Shopify SKUs | A new item-level validation failure code `NO_SKU` is added for line items whose Shopify SKU is null or empty after normalization. Previously these were reported as `INVALID_CHARACTERS`, conflating malformed SKUs with absent ones; `INVALID_CHARACTERS` now covers disallowed characters only. `NO_SKU` is item-level and does not block other line items or reject the order; an order with only no-SKU items creates zero production components. It surfaces in the Needs Attention Errors section and is the code the later No-SKU funnel builds on. | 2026-08-25 | `SKU_and_Internal_ID_Guide.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Shopify_Integration_and_Order_Import_Spec.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 68 | SKU auto-generation engine and app-owned design-code registry | The app ports the owner's SKU naming standard (`SpicedAnime_SKU_Nomenclature_and_Code_Reference.docx`) as an internal engine: family inference from Shopify Type/title/handle/tags in the documented precedence order, a design-code proposal algorithm (generic-word stripping, 4–10 character join/truncate, numeric-suffix collision handling), and per-family option/config mapping with the documented defaults and placeholder behavior. The app becomes the master of the design-code registry going forward; the owner's `DESIGN_CODE_REGISTRY.csv` (511 entries) is loaded as the initial seed via `designs.shopify_product_handle`. A locked design code is never silently changed. The Aluminum Gold variant exclusion is preserved as a configurable exclusion. | 2026-08-25 | `SKU_and_Internal_ID_Guide.md`, `Data_Model_and_Database_Schema.md` |
| 69 | SKU Manager rebuilt around a live Shopify catalog read | SKU Manager reads the live Shopify product catalog (`GET /api/shopify/catalog/`) rather than only the hand-maintained `offer_skus` table, so every product is visible whether or not it has a SKU. Presented as one table with product-type and has-SKU/no-SKU/all filters, rather than separate tables per product type. SKU generation uses the engine from Decision #68; where a family's bundle/config is ambiguous, the operator is shown the full set of possibilities and picks (Option A), rather than the app writing a Shopify product-option field automatically (Option B, not adopted). New SKUs are pushed to Shopify only via a downloadable CSV in Shopify-import format (`GET /api/skus/export.csv`); the app never writes to Shopify directly. The export-composition details are superseded by Decision #99; the no-direct-Shopify-write rule remains unchanged. | 2026-08-25 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md` |
| 70 | No-SKU funnel on Needs Attention | Orders blocked with `NO_SKU` (Decision #67) were previously invisible outside the general Errors section. A dedicated No-SKU queue is added to Needs Attention, listing every such item with a Generate SKU action using the Decision #68 engine; accepted proposals save to `offer_skus`, then the affected order becomes eligible for the existing idempotent re-import. Decision #88 subsequently changes the operator-facing queue label to `Missing SKU` while the stored validation code remains `NO_SKU`. Decision #99 subsequently supersedes the pending-export-batch concept: every active canonical SKU participates in the cumulative full Shopify product CSV export. The Needs Attention navigation badge already counts these as `Blocked` components; no new badge logic is introduced. | 2026-08-25 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 71 | Bulk reprint from Orders screen with a new "In Production (Needs Reprint)" order status | The Orders screen gains multi-order, multi-item bulk reprint: the operator selects orders, expands to select specific `Printed` items (front/back pairs such as LITF/LITB and WALF/WALB are always flagged together even if only one side is selected), and flags them via a new `POST /api/orders/bulk-flag-reprint/` endpoint using the existing per-component reprint mechanics. This supersedes the prior rule that reprints never affect order status: flagging any component on an `In Production` order now transitions it to a new status, `In Production (Needs Reprint)`, which is additive (never a regression to `Queued for Production`). When every flagged component on that order reaches `Printed`, the order returns to plain `In Production`. Pulled forward from Phase 2 per owner request. | 2026-08-25 | `Order_Status_and_Batch_Lifecycle_SOT.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Data_Model_and_Database_Schema.md`, `Technical_Architecture_and_API_Contract.md`, `MVP_Scope_and_Roadmap.md` |
| 72 | Batch PPTX preview without locking | From an `Open` batch, the operator can generate a full production-quality PPTX preview of its current contents via `POST /api/batches/{id}/preview-pptx/`, reusing the same layout and preprocessing engine as normal generation. No batch/component mutation occurs: the batch does not lock, no new `Open` batch is created, and no component status changes. Output is named distinctly (`{BATCH_GROUP}-PREVIEW-{YYYYMMDD}-{###}.pptx`, `SpicedAnime/previews/`) and is not recorded in `generated_files`, since there is no batch transition to attach it to; it is returned as a Drive link only. Repeatable at any time while the batch is `Open`. Pulled forward from Phase 2 per owner request. | 2026-08-25 | `PPTX_Generation_and_Layout_Engine_Spec.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md` |
| 73 | Event Prints tab for on-demand convention/event printing | A new "Event Prints" screen (`/event-prints`) lets the operator browse producing products by type, select designs and quantities, and generate a production-quality PPTX with no Shopify order and no production batch, via `POST /api/event-prints/generate/`. Reuses the same layout/preprocessing engine as batch generation (Decision #72's non-batch generation path). Output is named `EVENT-{PRODUCT}-{YYYYMMDD}-{###}.pptx`, saved to `SpicedAnime/event_prints/`, and returned as a Drive link; it is not recorded in `generated_files` and is not listed or tracked in-app for later re-download, since the Drive file is the persistent record. Distinct from the Sandbox screen, which remains test-only output explicitly excluded from real-world use. | 2026-08-25 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `PPTX_Generation_and_Layout_Engine_Spec.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| 74 | Status badge color and tone remapping | Full per-screen status badge tone reassignment across the app (Dashboard, Orders, Order Detail, Current Batches, Batch Detail, Needs Attention, Artwork Library, SKU Manager, Packing Queue, Settings, Sandbox), replacing the prior ad hoc `STATUS_MAP` colors. Six-tone palette: Info/Blue `#6FA0F5`, Progress/Yellow `#E0A62E`, Success/Green `#4CBF74`, Warning/Amber `#F0803C`, Danger/Red `#F27351`, Neutral/Gray `#9AA0BE`. Background and border colors for each badge are brought into harmony with its assigned tone. Full per-status mapping recorded in `Frontend_Color_System.md`. No canonical lifecycle string is altered by this decision; presentation only. | 2026-08-27 | `Frontend_Color_System.md` |
| 75 | Order/batch aging indicator | Orders and batches display a visual aging flag once open 4 or more calendar days. Visual treatment confirmed 2026-09-01 by Decision #87: Warning/Amber tone (`--tone-warning`) with the `clock` icon, applied to both orders and batches. Supersedes the prior spice-accent treatment. Anchor timestamp remains to be confirmed during implementation. | 2026-08-27 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Frontend_Color_System.md` |
| 76 | Order Detail privacy fields unchanged | Customer name, email, and shipping address remain visible on Order Detail as currently implemented. No change to documented behavior. Superseded by Decision #94 with respect to customer-name exposure only. Email and shipping-address behavior remain unchanged. | 2026-08-27 | None |
| 77 | Packing verification deferred; future-features log established | Item-level packed-status tracking is deferred, not built in the near term. A running list of deferred/future feature ideas is maintained at the project root in `Future_Features_and_Deferred_Ideas.md`, created and maintained by the code agent rather than through the standard documentation workflow. | 2026-08-27 | `Future_Features_and_Deferred_Ideas.md` |
| 78 | Sandbox artwork filtering in Artwork Library | Sandbox-created artwork records are filtered out of the standard Artwork Library view, matching the existing sandbox exclusion pattern (Decisions #47, #58) already applied to `orders`, `production_components`, `production_batches`, and `batch_items`. Exact mechanism (schema field or join) to be confirmed during implementation and documented in a follow-up update to this table's Affected Documents. | 2026-08-27 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` (pending follow-up edit) |
| 79 | Default page size increased to 50 | The default "Per page" value on Orders, Artwork Library, SKU Manager, and Audit Log changes from 20 to 50. Supersedes the default-page-size portion of Decision #63 only; the 20/50/100 option set and the reset-to-page-1 behavior established by Decision #63 are unchanged. Current Batches is not affected by this decision, as it does not currently have the "Per page" control at all. | 2026-08-27 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 80 | "Fulfilled Externally" label unchanged | No abbreviation adopted for this status label. | 2026-08-27 | None |
| 81 | SKU Manager `has_sku` semantics corrected; P401GRD/P402GRD production remediation | `has_sku` on `GET /api/shopify/catalog/` now means the Shopify variant carries a non-blank SKU string (previously required a canonical active `offer_skus` match, which under-reported since that table is out of sync with the live catalog). This aligns the SKU Manager's HAS SKU/NO SKU filter, SKU column, and status badge on one definition; `offer_sku` remains the sole driver of Edit/Retire SKU actions. Separately, two leftover production test orders, P401GRD (id 476) and P402GRD (id 490), created 2026-07-03 with synthetic PII and never sandbox-flagged, were verified via the 3-check protocol and deleted along with their `order_items` and `Deferred MVP` `production_components` rows (6 rows total), with owner approval obtained in-session, consistent with the Decision #61 precedent for touching real production orders outside Decision #46's sandbox-only scope. | 2026-08-27 | `Technical_Architecture_and_API_Contract.md` |
| 82 | SKU Manager filter expanded to text search | The SKU Manager filter box performs a case-insensitive substring text match against product name and the canonical SKU string (matching any segment: family, design, option codes, config), in addition to the existing product-type exact filter and has-SKU/no-SKU/all pills. Additive; existing filters and pills unchanged. | 2026-08-28 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 83 | LIT-family option/config mapping corrections | Storefront wording "Classic Flame" resolves to option code `BIC` (alongside existing "bic"/"standard"); storefront wording "Tin Case Only" (and "tin only"/"tinonly") resolves to config code `TINONLY`, checked before the plain "tin" match so it never collides with "Lighter + Tin Case" (`LITTIN`); a bare "Stash Box"/"Box" variant option with no bundle words resolves to `SOLO`. Owner-confirmed 2026-08-28. Implemented by P101.2. | 2026-08-28 | `SKU_and_Internal_ID_Guide.md` |
| 84 | One-time design-handle backfill | A one-time `backfill_design_handles` management command (`--dry-run`/`--apply`) backfills `designs.shopify_product_handle` from existing `offer_skus` linkage and order-item history, so the handle-keyed design-code registry can match products that previously had no recorded handle. Owner-authorized 2026-08-28 as a one-time run only, not a standing feature. Implemented by P101.1/P101.2. | 2026-08-28 | None |
| 85 | Status badge icon standard | Each of the six Decision #74 status tones is paired with exactly one icon, used identically on every screen: Info `circle`, Progress `circle-dashed`, Success `circle-check`, Warning `triangle-alert`, Danger `octagon-x`, Neutral `minus`. The `clock` icon is the single documented exception, reserved for the aging indicator (Decision #87), which is a time flag rather than a lifecycle status. Prior ad hoc glyphs — including the exclamation mark on Danger badges, the roman numeral on deferred items, and the square and circle-slash variants on Neutral badges — are removed. Presentation only; no canonical status string or lifecycle value is altered. | 2026-09-01 | `Frontend_Color_System.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 86 | Grouping accent for paired components | A violet accent is added outside the six-tone status palette, used solely to mark components that move together as a unit — the front/back pairs LITF/LITB and WALF/WALB — via a bracket on the left edge of grouped rows, and for the accompanying "PAIR" label. Label/text `#D4ADF4`, bracket rule `#AD7BDB`. It is explicitly not a status color, carries no lifecycle meaning, and never replaces a status badge; a paired component still shows its own status badge. | 2026-09-01 | `Frontend_Color_System.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 87 | Aging indicator uses Warning tone, extended to batches | The 4-plus-day aging flag (Decision #75) renders in the Warning/Amber tone (`--tone-warning`) with the `clock` icon, superseding the spice-accent treatment previously recorded in `Frontend_Color_System.md`. Rationale: the spice accent also signals actions, links, and focus, so reusing it for aging risks reading as interactive. The flag applies to both orders and batches, superseding the "Not used on batches" limitation in the same section. Presentation only; the 4-calendar-day threshold from Decision #75 is unchanged. | 2026-09-01 | `Frontend_Color_System.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 88 | Operator-facing label corrections | Four interface label changes, all display-only: (a) the reprint-request state previously shown as "Open" is renamed "Awaiting batch", so "Open" refers only to batch status; (b) the Needs Attention section heading and navigation label "NO_SKU" become "Missing SKU", with the raw `NO_SKU` validation-failure code unchanged in storage and in `Validation_Errors_Reprints_and_Recovery_SOT.md`; (c) validation failure codes are rendered to the operator as plain-language descriptions rather than raw enum strings wherever a friendly equivalent exists, with the raw code retained as secondary detail; (d) the non-existent order status "Ready for Packing" is removed from all mockups and interface copy, since `In Production` already denotes that state per Decision #71. No canonical enum, stored value, or lifecycle string is altered by any part of this decision. | 2026-09-01 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md` |
| 89 | Redundant interface elements removed | Four removals, presentation only: the Priority column on Current Batches (duplicating the Exceptions and Oldest-order columns on the same row); the fulfillment-path column on the Order Detail order-items list (duplicating the section headings that already separate produced from packing-only items); the four summary count cards on Needs Attention; and the merger of the SKU Manager Validation and Dictionary columns into a single registry-status column. No data, filter, or action is removed by any of these. All four elements exist only in the UI mockups and were never documented in the screen inventory; this decision therefore drives mockup and implementation work, not a documentation edit. | 2026-09-01 | None |
| 90 | Dashboard attention preview panel and system status tile | The Dashboard gains a "Needs your attention" preview panel listing the highest-priority items — blocked first, then oldest first — with a "View all" control linking to `/needs-attention`. The panel is a read-only preview of the existing Needs Attention data; `/needs-attention` remains the authoritative screen for this content and the Decision #63 summary-card navigation to it is unchanged. Inline resolution controls appear on a preview row only where the corresponding action already exists on Needs Attention; no new action is introduced. The Dashboard also gains a System Status tile surfacing the Shopify, Google Drive, and Celery integration health already exposed on Settings (Decision #38). The Dashboard's batch table remains scoped to `Open` batches only, and its status key continues to display only `Open`. | 2026-09-01 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 91 | Order Detail tab structure | Order Detail is reorganized into four tabs — Production, Order items, Files and reprints, History — replacing the current single scrolling page. All content, data, and actions documented for this screen are preserved and redistributed across the tabs; nothing is added or removed by this decision. The reprint area reflects existing behavior only: flagging a component creates its replacement automatically per `Validation_Errors_Reprints_and_Recovery_SOT.md`, with no reason field and no manual batch-assignment step. | 2026-09-01 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 92 | Event Prints saved jobs, run history, and page preview | Event Prints gains three capabilities beyond the Decision #73 scope: (a) named, reusable saved jobs, each persisting an event name, date, location, and the selected designs, groups, and quantities; (b) an in-app run history recording each generation with its timestamp, job, production group, page count, item count, and the resulting Drive file link — superseding the prior rule that Event Prints runs are not listed or tracked in the app; (c) a page-layout preview showing how selected items will be placed across printed pages before generation, including a short-page indicator when the final page is partially filled. The preview is display-only and does not alter the PPTX layout engine. New persistence and endpoints are required; exact schema and API surface to be defined during implementation and recorded in the affected documents. | 2026-09-01 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Data_Model_and_Database_Schema.md`, `Technical_Architecture_and_API_Contract.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| 93 | Dashboard Needs Attention card replaces the separate Blocked and Deferred cards | The Dashboard's Blocked and Deferred summary cards are merged into a single card titled "Needs Attention", superseding the four-card set in Decision #63. Rationale: both cards navigated to the same destination (`/needs-attention`), so two cards conveyed one route and one concern. The merged card displays a single total across blocked components, missing-SKU items, and deferred items, and navigates to `/needs-attention`. On mouse hover it reveals a breakdown panel listing each contributing category with its own count — blocked components, missing SKU, and deferred items. The breakdown is informational: its rows are labels with counts, not separate navigation targets, and every figure it shows remains reachable by clicking the card itself, so no content depends on hover. Category labels in the breakdown follow Decision #88, so the missing-SKU row reads "Missing SKU" and never the raw `NO_SKU` code. With the System Status tile from Decision #90, the Dashboard therefore presents four tiles: Open Batches, Needs Attention, Queued, and System Status. Presentation and navigation only; no new status string, no counting-rule change, and no lifecycle or data-model change. The underlying counts continue to come from the existing Dashboard and Needs Attention data, and remain subject to the sandbox-exclusion rules in Decisions #47 and #58. | 2026-09-01 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 94 | Customer-name exposure restricted outside Packing Queue | Customer names remain stored and imported because Packing Queue output requires them, but customer name is not displayed on Orders or Order Detail. The Orders list does not expose it, and `GET /api/orders/{id}/` does not return `customer_name`. Email and shipping-address behavior on Order Detail remain unchanged. Packing-sheet customer-name behavior remains unchanged. This supersedes Decision #76 only with respect to customer-name exposure. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Security_Access_and_Privacy_Spec.md`, `MVP_Scope_and_Roadmap.md` |
| 95 | Dashboard Active Batches and bounded operational panels | The Dashboard production-list section heading is `ACTIVE BATCHES`, while each displayed batch continues to use the canonical `Open` lifecycle state. Group and Batch remain separate columns; Batch displays only the sequence number in `#N` form and never repeats the production-group name. The timestamp column is labeled `Started`. Recent Activity is a bounded scrollable feed capped at 25 entries and uses semantic activity icons. Needs Attention is a bounded scrollable preview capped at 30 eligible items after its existing filtering and priority ordering. Each panel keeps its heading and `View all` control outside the scrollable content region. Presentation only; no lifecycle, data-model, or batch-selection rule changes. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md` |
| 96 | Current Batches grouped layout and `All` lifecycle filter | Current Batches remains grouped by production group. Its status controls include `Active Queue`, individual lifecycle filters, and `All`. Selecting `All` removes the status constraint so `Open`, `Locked for Review`, `Printed`, and `Archived` batches are all eligible and are displayed in the same grouped Current Batches format. `All` replaces the prior `Include History` wording. No lifecycle value or batch data changes. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md` |
| 97 | Needs Attention actionable queue presentation | Needs Attention uses one counted queue switcher with `Blocked`, `Missing SKU`, `Deferred`, and `Webhook Failures`; only the selected queue occupies the main workspace. Blocked rows are visually grouped by affected order item, validation failure, and resolution and use the default columns `Order`, `Item / SKU`, `Components`, `Issue`, and `Resolution`, with family/config/design/raw-code/expected-path/component-ID details retained in an expandable `Technical details` disclosure. Missing SKU combines product name and variant options into one Item column with an explicit Action column. Deferred uses `Order`, `Item / SKU`, and `Reason`. Webhook Failures remains read-only. This is presentation and aggregation only and does not merge or delete underlying component records. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md` |
| 98 | Order Detail summary hierarchy | Order Detail displays a connected four-part summary immediately beneath the order number: Status, Order Date, Items, and Production Components. Customer name and Sales Channel are not displayed. Financial Status and Fulfillment Status remain visible as plain label/value context rather than status badges, and a null Shopify fulfillment status is displayed as `Unfulfilled`. Presentation only; stored values remain unchanged. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md` |
| 99 | SKU Manager export is a cumulative full Shopify product CSV | `GET /api/skus/export.csv` produces a fresh copy of the immutable full Shopify product CSV and applies every currently active canonical `offer_skus` assignment on every export, regardless of whether that SKU was exported previously. Repeated exports therefore remain cumulative: existing active assignments remain present and newly accepted assignments are added. Retired rows are excluded. A legacy `ids` query parameter does not narrow the operator-facing export. Only intended `Variant SKU` cells may change; all non-SKU cells are preserved. Unmatched, ambiguous, conflicting, or otherwise unsafe assignment conditions fail closed with no partial output. `offer_skus.exported_at` is retained only as the timestamp of first successful inclusion and never controls later export composition. Shopify import remains a Human-controlled manual step; the app never writes product SKUs directly to Shopify. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md`, `MVP_Scope_and_Roadmap.md` |
| 100 | Artwork Library sortable Design and Updated columns | Artwork Library supports server-side sorting across the complete matching result set, not only the current page. The Design header is a sort control whose first activation sorts A–Z and whose opposite direction sorts Z–A. The Updated header is a sort control whose first activation sorts newest first and whose opposite direction sorts oldest first. Active sort direction is visibly indicated in the header. Pagination and existing artwork actions remain unchanged. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `MVP_Scope_and_Roadmap.md` |
| 101 | Batch Detail large-table selection and scrolling UX | Batch Detail must remain usable with hundreds of component rows. The component table uses a sticky header and virtualized row rendering/scrolling so column context remains visible and large batches do not render hundreds of off-screen rows at once. Selection state is independent of virtualization, scrolling, sorting, and display filters. With no proper subset selected, the primary generation action reads `Generate PPTX (All Items)` and runs the existing full-batch branch. With a proper subset selected, the primary action reads `Generate PPTX (Selected Items)` and the existing live selected-item count remains visible. Existing pair expansion and the rule that selecting every eligible component canonicalizes to the full-batch branch remain unchanged. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md`, `MVP_Scope_and_Roadmap.md` |
| 102 | Order Detail Files and reprints provides direct file access | The Order Detail `Files and reprints` tab directly surfaces the files already known for that order instead of instructing the operator to navigate elsewhere. Relevant production components display available source-artwork thumbnails and/or direct links to their source artwork paths in Google Drive. Generated files associated with the order's batches and reprints are linked directly in the same tab. Existing reprint actions remain in this tab. The operator is not required to leave Order Detail merely to locate a known source or generated file. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `MVP_Scope_and_Roadmap.md` |
| 103 | Order Detail History aggregates the order's complete related lifecycle | The Order Detail `History` tab presents one order-specific timeline containing the order's own audit events plus component-level events belonging to that order and batch-level events relevant to batches containing that order's components. The operator is not required to leave Order Detail for the global Audit Log and manually reconstruct the order lifecycle. Events remain ordered most recent first and retain their existing audit records; this decision changes aggregation and presentation, not audit-event storage semantics. | 2026-09-02 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `MVP_Scope_and_Roadmap.md` |
| 104 | Missing SKU bulk generation, review, approval, rejection, and reimport | Needs Attention `Missing SKU` supports selecting multiple unresolved items and generating SKU proposals for them in one operation using the existing SKU Auto-Generation Engine. Generated proposals are collected into one review workspace before acceptance. Each proposal clearly displays the affected item and proposed canonical SKU and can be individually approved or rejected; the review workspace also supports approving or rejecting the reviewed set from one page without returning to each queue row. Rejected proposals are not persisted. Approved proposals are persisted through the existing canonical-SKU acceptance behavior. After approvals, one bulk reimport action reimports the distinct affected order IDs for the newly approved SKUs so eligible missing production components can be created without manually reimporting each order. Existing single-item Generate SKU behavior remains available. Shopify SKU application still occurs only through the manual cumulative CSV export from Decision #99. | 2026-09-02 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Shopify_Integration_and_Order_Import_Spec.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 105 | Orders operational table hierarchy and inline reprint UX | Orders uses the columns `Order #`, `Order Date`, `Status`, `Items`, `Attention`, and `Reprint`. `Order #` is the strongest visual identifier and remains the existing server-side sortable column. The permanent `Blocked` column is replaced by `Attention`; normal rows remain visually quiet and affected rows show a concise indicator such as `Blocked 2`. The filter area retains search, status filters, and date range but uses tighter spacing and lighter status-filter treatment so the table is visually primary. Date filtering adds `Today`, `Yesterday`, and `Last 7 Days` one-click shortcuts alongside the custom date range. Reprint item selection expands as an accordion directly beneath the affected order row rather than in a separate area at the bottom of the page. `Select items` is not shown when the order has no eligible reprint items. A header checkbox selects or clears selectable orders on the current result page and supports the indeterminate state. The row itself is not a navigation target; the order number is the detail link. Decision #71's underlying reprint mechanics and server-side Order # sorting remain unchanged. | 2026-09-02 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 106 | Packing Queue export-limit copy and history-table simplification | When an export range exceeds the 30-day maximum contiguous window, the operator-facing message reads: `Export limit reached (30 days max). Exporting the first 30 days now. Please run another export for the remaining dates once this completes.` The past-exports table does not display a redundant generated name such as `Packing Export (YYYY-MM-DD - YYYY-MM-DD)` when Window Start and Window End already present the same information. The start/end dates, file access, status, and other existing export information remain available. No packing-sheet scope or XLSX-generation rule changes. | 2026-09-02 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 107 | Status definitions are collapsed by default | Repeated always-visible definitions/status legends at the bottom of applicable screens are replaced by a shared `Status Guide` disclosure or equivalent compact info control. It is closed by default and opens on demand to show the same status definitions that were previously always visible. No status label, icon, tone, lifecycle value, or definition changes. Screens that intentionally have no finite status vocabulary continue to have no Status Guide. | 2026-09-02 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 108 | App navigation preserves native browser new-tab behavior | Any operator-facing element whose function is navigation to another app route uses native link semantics wherever possible. Left-click navigates in the current tab. Middle-click, Cmd-click on macOS, Ctrl-click on Windows/Linux, and the browser context-menu `Open Link in New Tab` behavior remain available. Mutation and action controls such as Generate PPTX, Mark Printed, Reimport, Approve, Reject, Upload, Replace, Retire, Revalidate, Reset, Checkout, Generate Print Sheet, and Export remain action buttons and do not become navigation links. When only a specific element is intended to navigate, only that element is the link; surrounding row whitespace does not become a link. | 2026-09-02 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 109 | Design system implementation replacement (built to Frontend_Color_System.md spec) | The `design-system/` folder and its frontend components/tokens are replaced by a new design-system implementation ("SpicedAnime — Spicy Design System"), authored using the project's existing core documents — including `Frontend_Color_System.md` — as its source spec. This is an implementation replacement, not a value change: it does not supersede Decisions #74, #85, #86, or #87, and the six-tone status palette, icon pairing, grouping accent, and aging-indicator tone remain as documented in `Frontend_Color_System.md` unless a specific deviation is separately confirmed. Owner-approved 2026-09-04. Implemented by P118. Any token- or component-level deviation discovered during implementation is to be reported and handled as a follow-up decision rather than assumed acceptable. | 2026-09-04 | `Frontend_Color_System.md` |
| 110 | Global Filter — cross-screen date-range filter | A Global Filter control on the Dashboard lets the operator choose a date range. When active, all order-, batch-, and Needs-Attention-derived Dashboard information is scoped to orders whose `shopify_created_at` falls within the range; Integration/System Status remains global because it reflects infrastructure health rather than order data, while order-associated Recent Activity events follow the date filter. Orders, Current Batches, Batch Detail component contents, and Needs Attention (Blocked, Missing SKU, Deferred queues) are similarly scoped. The Dashboard also shows a Filtered Production Summary counting purchased units (using line-item quantity, not production-component count) grouped by originating product family. The summary defines "Not included in production" as every purchased unit in the date range that is neither counted in "Included in filtered production" nor "Missing SKU" (covering non-produced families, deferred GRD items, and any other known-SKU purchased unit not represented in filtered production batches), guaranteeing the reconciliation equation: Included in filtered production + Not included in production + Missing SKU = Total items in date range. Batch generation from Batch Detail is bounded to visible filtered components only; hidden components are never silently included. Selecting every visible filtered component when hidden eligible components exist remains subset generation, never full-batch generation. Webhook Failures remain always visible regardless of the active filter range. The Global Filter range persists across navigation between Dashboard, Orders, Current Batches, Batch Detail, and Needs Attention until the operator changes or clears it. Date-range semantics reuse the existing inclusive calendar-day boundary from the Orders date controls (P116). Activating, changing, clearing, or navigating with Global Filter does not itself mutate orders, components, or batches; explicit operator actions performed while the filter is active, including PPTX generation, retain their normal lifecycle effects but are bounded to the filtered eligible component set. | 2026-09-04 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Order_Status_and_Batch_Lifecycle_SOT.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md` |
| 111 | Missing SKU orders must surface in Orders Attention column | Orders with unresolved `NO_SKU` items must display a Missing SKU indicator in the `Attention` column using the Danger treatment from the design system. The indicator uses the same concise format as Blocked (e.g. `Missing SKU 1`). Order lifecycle status is unchanged. `NO_SKU` remains an item-level validation failure code per Decision #67. An order with both Blocked components and Missing SKU items shows both indicators in the same Attention cell. This extends Decision #105's Attention column semantics. | 2026-09-04 | `MVP_Scope_and_Roadmap.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Technical_Architecture_and_API_Contract.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md` |
| 112 | Master Filter renamed to Global Filter | Decision #110's feature is renamed from "Master Filter" to "Global Filter" for all operator-facing text, this decision log, and future documentation. This is a naming change only — no scoping, persistence, or reconciliation behavior defined by Decision #110 changes. Existing code identifiers, internal variable/function names, and API parameter names are not required to be renamed by this decision; only user-facing labels and documentation must reflect "Global Filter" going forward. Prior passes and reports referring to "Master Filter" describe the same feature. | 2026-09-05 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `MVP_Scope_and_Roadmap.md`, `Technical_Architecture_and_API_Contract.md`, `Order_Status_and_Batch_Lifecycle_SOT.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md` |
| 113 | Global Filter active-range indicator on affected screens | Orders, Current Batches, and Needs Attention each display a small, persistent, read-only indicator whenever the Global Filter (Decision #110) is active, stating that a Global Filter is scoping the current view and showing the active date range. The indicator remains visible for as long as the filter is active and disappears when the filter is cleared. The Dashboard's Global Filter control remains the only place the range is set or changed. | 2026-09-05 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md` |
| 114 | Order-number column link treatment applies to every table with an Order column | The Order-number link treatment established for Orders by Decision #105 (`#` prefix, spice-accent color, underline on hover, direct link to Order Detail, centered) applies to the leftmost Order-identifying column in every table across the app that displays one, including but not limited to the Needs Attention queues (Blocked, Missing SKU, Deferred) and Batch Detail's component table. This is a presentation-consistency decision; it introduces no new navigation target beyond the existing Order Detail page and does not change any table's sort, filter, or selection behavior. | 2026-09-05 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md` |
| 115 | Batch numbers are permanently unique, never reissued | `production_batches.batch_number` is permanently unique per production group and is never reissued, even after the batch that held it is deleted. This closes a production defect — confirmed on batch id 37, which failed identically across multiple attempts — where number reuse after deletion caused deterministic Google Drive filename collisions under the `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx` pattern, since `{###}` binds to `batch_number`. A uniqueness database constraint was added following a pre-migration data audit of existing batch numbers. The resulting Drive name-collision failure is now raised as its own distinct exception rather than reported as a generic transient Drive fault, so the operator sees an accurate remedy (reconcile the existing Drive file; retrying cannot clear a name collision) instead of a false "retry" suggestion. Sandbox and real batches continue to share one per-group numbering sequence, unchanged from prior behavior. Reconciling batch 37's orphaned Drive file and auditing other `GeneratedFile` rows in a similarly at-risk state remain Human-controlled and outside this decision's scope. Owner-approved (Option A: permanent uniqueness). Implemented by P130.1. | 2026-09-06 | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Data_Model_and_Database_Schema.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md` |
| 116 | Orders reprint-picker auto-select and pinned Floating Bulk Flag Reprint control | Two Human-directed Orders-screen refinements from P121: (a) opening an order's reprint picker auto-selects every eligible component group via the existing eligible-only selection logic, unioning into any prior cross-order selection rather than replacing it; the operator may deselect individual groups before confirming, and re-opening a collapsed picker re-selects. Front/back pairs (LITF/LITB, WALF/WALB) remain one group per Decisions #71/#105. (b) A Floating Bulk Flag Reprint control is pinned to the top of the Orders table's scrolling region, not bottom-anchored, so it stays reachable while scrolling a long list without overlapping the page-bottom Status Guide (Decision #107). Presentation and interaction only; no change to `POST /api/orders/bulk-flag-reprint/` or Decision #71's lifecycle effects. | 2026-09-04 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 117 | Needs Attention selected-tab treatment follows the DS-wide spice-tint convention | The Needs Attention screen's selected queue-tab treatment moves from a pass-specific `--text-on-spice` rule that predates the Decision #109 design-system replacement to the same spice-tint selection treatment used everywhere else in the app (the DS `Sidebar`'s active nav item, `FilterBar`'s active pill, and the shared filter-control style behind Orders and the Global Filter). `--text-on-spice` remains correct only on a solid spice fill, which no other selected control in the app now uses; keeping the tab as the sole exception would itself be the drift. This is a follow-up decision under Decision #109's own provision that implementation-discovered deviations be decided rather than assumed acceptable. Presentation only; the tab's underlying `aria-selected` behavior is unchanged. Implemented by P127. | 2026-09-05 | `Frontend_Color_System.md` |
| 118 | SKU Manager Shopify master-catalog refresh model | Decision #99's "immutable master source" mechanism — a single static master catalog CSV frozen at capture time (`SpicedAnime_Shopify_Product_Catalog_2026-08-25.csv`) — is replaced. Products added to Shopify after the master's capture date have no row in a frozen file, so a canonical SKU generated for one (SKU Manager reads the live catalog per Decision #69 and permits generation against any current product) triggers `SHOPIFY_VARIANT_NOT_FOUND` and fails every pending export closed, not only that product's. The master catalog is now an operator-refreshable upload: Josiah/Josh download Shopify's own "Export products" CSV from Shopify Admin whenever the catalog changes and upload it to the app, which becomes the stored master for every subsequent export. The app independently detects catalog drift — any live-catalog product or variant absent from the current stored master — and surfaces a prompt on SKU Manager to refresh before an export can fail on it. Every successful upload is retained, not overwritten. A submitted master CSV is validated against the required Shopify schema columns at upload time, so a malformed file is rejected immediately rather than surfacing only on a later export. The uploaded master is stored in Google Drive, consistent with the storage provider established by Decision #24. All other provisions of Decision #99 — cumulative composition, variant matching by Handle/Product Title plus Option values, byte-for-byte preservation of non-SKU cells, the fail-closed integrity codes, the audit timestamp, and the human-controlled Shopify import boundary — are unchanged and now apply against the current stored master rather than the single frozen file. Supersedes only the "immutable master source" provision of Decision #99. | 2026-09-07 | `Technical_Architecture_and_API_Contract.md`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Web_App_Screen_Inventory_and_UX_Flow.md`, `Test_Plan_and_Acceptance_Criteria.md`, `core_operational_behavior_documents_list.md`, `MVP_Scope_and_Roadmap.md` |
| 119 | Global Filter implementation specifics confirmed as-built | Three implementation choices that P122/P123 shipped for Decision #110's Global Filter and flagged in their pass reports for owner confirmation are confirmed as-is, not changed: (a) "Included in filtered production" in the Dashboard Filtered Production Summary counts a purchased unit represented in any non-sandbox production batch regardless of that batch's lifecycle status (`Open`, `Locked for Review`, `Printed`, or `Archived`) — `Printed` batches are not excluded; (b) the active range persists in browser `sessionStorage` (key `spicedanime.master-filter`) and is intentionally dropped when the browser session ends — it is deliberately not `localStorage` and does not persist indefinitely or across devices; (c) while a range is active the Dashboard shows the backend-scoped `recent_activity` feed (scoped by the owning order's date) rather than the richer 25-event `GET /api/audit-log/` feed, because the audit-log endpoint filters by the event's own date, which Decision #110 does not — unfiltered Dashboard behavior is unchanged. The behavior is already live in production (P124); this decision records the owner's confirmation so the choices are traceable rather than left as open pass-report questions. No code change. | 2026-09-07 | `Technical_Architecture_and_API_Contract.md`, `core_operational_behavior_documents_list.md` |
| 120 | Grinder/Jar/Tray PPTX slide arrangement locked (one product type per slide) | For the `Grinder/Jar/Tray` batch group — the only batch group that bundles more than one product type — PPTX generation groups components by product type into contiguous single-type slide runs, in the order Grinder, then Jar, then Tray. A slide never mixes product types. Each product type's slides use that product's own per-product layout grid and per-page capacity from `Product_Image_Transformation_Guidelines.md` and `PPTX_Generation_and_Layout_Engine_Spec.md`: Grinder 4x3, Jar 4x3, Tray 3x1. The Grinder and Jar 4x3 grids, previously carried as "TBD requires owner approval", are locked by this decision; Tin's 4x2 "TBD" grid is not affected. Each slide carries a metadata text box naming its single product type — `Grinder`, `Jar`, or `Tray` — placed bottom-of-slide following the same convention as the Lighter/Tin color label. The existing "component ID order, oldest first" placement rule applies only within one product type's run. A partially filled final slide for a product type is expected and correct. Closes a production defect where the three product types were interleaved onto shared slides by raw component-ID order with no type separation. | 2026-09-10 | `PPTX_Generation_and_Layout_Engine_Spec.md`, `Product_Image_Transformation_Guidelines.md` |
| 121 | Lighter/Tin PPTX slides grouped by SKU color code, superseding Decision #57 | For Lighter and Tin — the only products whose border color varies per order — PPTX generation groups components by their SKU color code (`WHT`, `SIL`, `GLD`) into contiguous single-color slide runs during slide assembly; a slide never mixes color codes. `WHT` and `GLD` are grouped separately even though both resolve to the same White/Gold border color (`#FBE3D6`). This supersedes Decision #57's explicit allowance for a single page to mix White/Gold and Silver bordered components for these two products. Within each color run the existing per-product grid, the Lighter front/back pairing rule, the oldest-first placement rule, and the per-slide color metadata text box are unchanged; a partially filled final slide for a color code is expected and correct. Grinder, Jar, Ashtray, and Wallet are unaffected — each uses one fixed border color for every unit, so no per-order color variance and no grouping applies. Batches still group by production group only and do not sub-group by color (`Order_Status_and_Batch_Lifecycle_SOT.md`); the grouping in this decision happens during slide assembly, not batch assignment. | 2026-09-10 | `PPTX_Generation_and_Layout_Engine_Spec.md`, `Product_Image_Transformation_Guidelines.md` |
| 122 | Orders list sortable by Attention | The Orders screen `Attention` column header becomes a server-side sort control using the same three-state cycle already used by `Order #` (unsorted, then sorted, then reverse, then unsorted), ranking on a combined attention score of `blocked_count + missing_sku_count` (both already returned per order by `GET /api/orders/`). The first activation brings the highest-scoring orders to the top. Only one of `Order #` or `Attention` is an active sort at a time — activating one clears the other. Exact query-parameter name(s) and values are deferred to implementation, per the precedent set by Decision #100. | 2026-09-10 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `MVP_Scope_and_Roadmap.md`, `core_operational_behavior_documents_list.md` |
| 123 | Needs Attention queues default to most-recent-first with a sort control | Each of the four Needs Attention queues loads sorted most-recent-first by default, reversing the prior undocumented default order. The Blocked, Missing SKU, and Deferred queues, which have an `Order` column, gain an `Order #` sort control mirroring the Orders screen's three-state header sort (Decision #105) and default to descending (most recent order number first). The Webhook Failures queue, which has no `Order` column, defaults to `Received at` descending (most recently received first) and gains a sort control on that column. Sorting is server-side across the full result set. No queue's columns, filters, or actions change otherwise. | 2026-09-10 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `MVP_Scope_and_Roadmap.md`, `core_operational_behavior_documents_list.md` |
| 124 | SKU Auto-Generation Engine corrections | Five owner-approved corrections to the SKU Auto-Generation Engine (Decisions #68/#69), reconciled against the owner's SKU naming standard. (a) Family detection precedence becomes `BAT`, `HOD`, `PIL`, `BOX`, `GRS`, `TRY`, `TOT`, `TAP`, `JAR`, `WAL`, `ASH`, `LIT`, so a "Grinder, Jar, Rolling Tray Set" title is detected as `GRS` instead of being captured by the `TRY` rolling-tray keyword, while `BOX`'s specific Stash Box wording stays ahead of `GRS`. (b) Design-code proposal strips a complete generic-word list: `ANIME`, `MANGA`, `COVER`, `LIGHTER`, `TRAY`, `SET`, `BAG`, `DEFAULT`, `GRINDER`, `GRD`, `JAR`, `ROLLING`, `STASH`, `SPICE`, `ASHTRAY`, `ASH`, `WALLET`, `BOX`, `HOODIE`, `SWEATSHIRT`, `PILLOW`, `TAPESTRY`, `BLACK`, `ART`, `TOTE`. (c) A `GRS` variant naming a Lighter component produces a distinct `CONFIG` placeholder held for manual review, because no GRS configuration includes a Lighter; the engine no longer silently drops the Lighter to build `GRDTRY`. (d) `BOX` four-piece / 4-piece wording maps to `BOX4`, alongside full-set and complete-set wording. (e) `WAL` "Basic" wording maps to `WALFONLY` (front-only printing). Title overrides remain empty. Already-approved design codes are never changed by this decision. | 2026-09-10 | `SKU_and_Internal_ID_Guide.md` |
| 125 | Per-batch image adjustment overrides with product-type defaults | Brightness, contrast, saturation, and sharpness become operator-editable, and nothing else (no rotation, flip, crop mode, border, or dimensions). Controls are grouped by physical product piece present in the batch: Lighter Front and Lighter Back share one Lighter control; Wallet Front and Wallet Back share one Wallet control; Tin, Grinder, Jar, Rolling Tray, Ashtray, and Stash Box each have their own control. A Grinder/Jar/Tray bundle is treated as its three separate pieces. The existing per-product print-template adjustment values remain the product-type defaults and can be saved as new defaults for that product type. A batch may also store its own override, holding only the values the operator actually changed; any value not overridden uses the product-type default. A batch override always takes precedence over the product-type default, including after a later change to that default. Adjustments are editable only while a batch is `Open`; a `Locked for Review` or `Printed` batch shows its values read-only, and correcting one means starting a new batch — no reopen mechanism is introduced. Previously generated batches are not regenerated automatically. Sandbox batches (`is_sandbox = true`) get the same controls. Allowed ranges match PowerPoint's Format Picture pane: Brightness −100 to +100, Contrast −100 to +100, Saturation 0 to 400, and Sharpness −100 to +100. The adjustment preview is the existing Download Preview PPTX action (Decision #72), which runs the same generation path as Generate PPTX with no lock or status change; no separate in-app approximate preview is built. Exact endpoints, field names, and screen layout are documented once implemented. | 2026-09-11 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md`, `Data_Model_and_Database_Schema.md`, `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` |
| 126 | Image adjustments are applied via native PPTX picture corrections, not Pillow pixel-baking | Brightness, contrast, saturation, and sharpness adjustments (Decisions #62, #125) are applied as native PPTX/OOXML picture-correction properties on the picture as embedded in the PPTX file (e.g. `<a:lum>` for Brightness/Contrast, `<a:hsl>` or equivalent for Saturation, `<a:sharpenSoften>` for Sharpness), not by baking pixel changes into the image with Pillow `ImageEnhance` before embedding. Because the corrections are native PPTX properties, they remain visible in and further adjustable through PowerPoint's own Format Picture pane after the file is generated. The "PowerPoint's Format Picture pane" language in Decision #125 describes both the allowed numeric ranges and the implementation mechanism: the operator-facing ranges map to the same native picture-correction values PowerPoint itself exposes. The exact OOXML attribute set and value-mapping formula are defined during implementation. This corrects the version of this decision first recorded on 2026-09-11, which stated the opposite (Pillow pixel-baking) in error; that was never an approved change in direction. | 2026-09-11 | `PPTX_Generation_and_Layout_Engine_Spec.md`, `Product_Image_Transformation_Guidelines.md`, `Technical_Architecture_and_API_Contract.md` |
| 127 | SKU Manager auto-proposes sibling variant SKUs and adds Accept All Approvable | In the SKU Manager Create SKU dialog, after the operator individually accepts a proposal, the app checks for other no-SKU variants of the same Shopify product (same product handle) not already shown as proposals and asks whether to generate proposals for them (Generate / Skip). Generate calls the existing `POST /api/skus/generate/` engine and shows the results as ordinary proposal cards; Skip makes no request. An Accept All Approvable action accepts, one at a time through the existing accept path, every visible proposal that is approvable and is not excluded, not skipped for an unrecognized family, not a placeholder, and not a duplicate; other proposals stay visible and untouched. Batch acceptance does not trigger sibling prompts. No SKU is saved without an operator accept action. No engine, endpoint, or manual multi-select behavior changes; the Needs Attention Missing SKU flow is unchanged. | 2026-09-11 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `Technical_Architecture_and_API_Contract.md` |
| 128 | Whole-order re-import preserves an already-resolved SKU | When an order is re-imported and a line item's current Shopify SKU is blank, an order item that already holds a resolved SKU keeps that SKU instead of being reset to blank and `NO_SKU`. The blank-SKU canonical fallback (`offer_skus.shopify_product_title` / `offer_skus.shopify_option_values`) is attempted only when the order item's stored SKU is itself blank. A nonblank Shopify SKU remains authoritative and is used as before. No matching rule changes. Closes a defect where a later whole-order re-import silently reverted a previously resolved Missing SKU item (confirmed on order #3557). | 2026-09-11 | `Shopify_Integration_and_Order_Import_Spec.md`, `Validation_Errors_Reprints_and_Recovery_SOT.md` |
| 129 | One-time canonical SKU remediation for Decision #124-affected rows | Owner-authorized, one-time production remediation of canonical SKUs that the pre-Decision-#124 engine had generated incorrectly: the approved wrong `offer_skus` rows were retired (never deleted), corrected active replacements and their required design rows were created, and two affected unresolved order items (orders #3557 and #3646) were re-attached to their corrected canonical SKUs through the existing order-item reprocessing path, with obsolete blocked components canceled or removed as approved. Printed and already-exported history was preserved. This was a single remediation for the named rows only; it is not a standing recovery mechanism and sets no precedent for bypassing the Missing SKU duplicate check. | 2026-09-11 | `SKU_and_Internal_ID_Guide.md` |
| 130 | SKU Manager, Missing SKU, Orders, and Artwork Library table refinements | Human-directed refinements, as implemented: (a) Orders — the `Items` cell reveals an open indicator on hover; clicking it opens a popover listing each line item's product name and SKU, loaded on first open from the existing order-detail request and reused afterward; it stays open on mouse-out, closes on an outside click, a second trigger click, or Escape, and only one is open at a time. (b) Needs Attention Missing SKU — product name and variant show in separate `Product` and `Variant` columns; the `Order #` and `Variant` headers sort the currently loaded page (Order # ascending/descending, Variant A–Z/Z–A), one at a time. This page-level sort does not replace Decision #123's server-side default ordering. (c) SKU Manager — the Options and Registry status headers are renamed `Variant` and `Status`; the product-type filter becomes a dropdown of `All types` plus the twelve Shopify product types; typed spaces in the search box are preserved; the `Product` header sorts the currently loaded page A–Z/Z–A. (d) Artwork Library — the Design and Updated sort headers use the shared table sort-header treatment (whole header cell clickable, shared chevron indicator), with unchanged sort directions and server-side ordering, and the Updated cell shows the date on one line and the time below it. | 2026-09-11 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 131 | Switch-gated manual override for Brightness/Contrast; Saturation/Sharpness remain Pillow-baked with no native path | P137.1 testing (conducted to validate Decision #126) found that PowerPoint's only native mechanism for Saturation/Sharpness (the `a14:imgLayer` extension) does not visibly apply until an operator manually touches its corresponding slider inside PowerPoint, per picture — unlike `<a:lum>` (Brightness/Contrast), which renders immediately with no operator action. Owner-confirmed resolution, applied at the Decision #125 component-group granularity (one shared Brightness/Contrast/Saturation/Sharpness setting per physical-product group — e.g. Lighter, Wallet, Tin, Grinder, Jar, Rolling Tray, Ashtray, Stash Box — across the whole batch, not per individual image or order): Brightness and Contrast remain native-PPTX-by-default per Decision #126, each gaining an on/off switch in `AdjustmentsPanel`. Switch off: the native `<a:lum>` correction applies automatically and the value field is inert. Switch on: manual override is active, the native `<a:lum>` correction is suppressed for that setting on that group, and the value is instead applied by Pillow pixel-baking; leaving the value blank while the switch is on bakes a neutral (no-op) adjustment rather than falling through to the automatic correction. Saturation and Sharpness keep no switch and no native-mechanism mandate: blank means no adjustment is applied, any value bakes it in via Pillow — superseding Decision #126's native-mechanism requirement for these two settings only (Decision #126's `<a:lum>` mandate for Brightness/Contrast is unchanged). The interface must carry a note near Saturation/Sharpness stating that adjusting the picture directly in PowerPoint's own Format Picture pane gives a truer, live-adjustable result than the baked value, if further fine-tuning is wanted. The exact OOXML value-mapping formula for the override path and the switch's visual treatment are implementation details, the latter subject to design-system review. | 2026-09-12 | `PPTX_Generation_and_Layout_Engine_Spec.md`, `Product_Image_Transformation_Guidelines.md`, `Technical_Architecture_and_API_Contract.md`, `Data_Model_and_Database_Schema.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 132 | Fixed Sandbox SKU catalog expanded from 14 to 25 SKUs | The fixed sandbox SKU catalog (`SANDBOX_SKU_PLAN`) is expanded from 14 to 25 SKUs to provide complete testing coverage across all producing component combinations, bundles, and lighter color variants. Adds `TINONLY` (tin case without lighter), all Grinder/Jar/Tray bundle combinations (`GRDTRY`, `JARTRY`, `GRDJAR`, `GRDSET`), Stash Box bundle combinations (`BOXGRD`, `BOXJAR`, `BOXLIT`, `BOX4`), and explicit lighter color variants for White (`WHT`), Silver (`SIL`), and Gold (`GLD`) to enable comprehensive layout, color-grouping, and image-adjustment verification. Implemented in P136.2 and P136.3. | 2026-09-11 | `Technical_Architecture_and_API_Contract.md`, `Sample_Data_and_Fixtures.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 133 | Single-variant fallback matcher normalization and Stash Box promotion to BOX4 | Two corrections to the SKU auto-generation and canonical fallback matchers: (a) Single-variant fallback matcher normalizes option values by trimming leading/trailing whitespace and ignoring `Default Title` sentinels, ensuring clean canonical SKU resolution when Shopify exports omit variant option distinctions. (b) In the SKU Auto-Generation Engine, variant option text combining Grinder + Jar + Lighter promotes directly to `BOX4` (the 4-piece set configuration) regardless of whether "four-piece" wording is explicitly present. Implemented in P139 and P139.1. | 2026-09-12 | `SKU_and_Internal_ID_Guide.md` |
| 134 | Event Prints candidate deduplication, multi-color lighter selection, and quick clears | Enhancements to the Event Prints workflow (Decisions #73, #92): (a) Product candidate deduplication: candidates sharing a design code across lighter bundles deduplicate cleanly to the `LIT` family with canonical title resolution. (b) Independent multi-color lighter quantity selection: operators can independently specify quantities for White, Silver, and Gold lighter variants within the same job. (c) The page-layout preview displays color indicator chips and breaks down slide counts by color. (d) Quick clear controls allow clearing all quantities or clearing by section. Implemented in P140 and P140.1. | 2026-09-12 | `Web_App_Screen_Inventory_and_UX_Flow.md` |
| 135 | SKU Manager table hierarchy, filter/action separation, How-to-Read guide, and 4-char design floor | Comprehensive usability and integrity overhaul of SKU Manager (Decision #69): (a) Product-grouped table hierarchy (`SkuCatalogTable`): products are presented as parent rows with expandable/collapsible child variant rows, with an app-wide Collapse Mode toggle. (b) Split Filter Panel vs sticky Actions bar: filters (search, product type, status) are moved to a dedicated filter panel, while bulk actions (Create SKU, Export Table CSV, Export Master CSV, Master Catalog drift/upload) are pinned in a sticky actions bar. (c) Collapsible "How to Read SKUs" disclosure guide at the top of the table explaining canonical SKU anatomy and segments. (d) Smart SKU Editor modal (`SkuEditModal`) for canonical SKU creation/editing with live segment breakdown and validation. (e) 4-character design code floor (`DESIGN_CODE_MIN_LENGTH = 4`): the SKU engine rejects design codes under 4 characters, proposing a `DESIGN` placeholder stop sign instead. (f) Server-side whole-catalog sorting (`ordering`), typed page-number navigation input, and RFC-4180 Table CSV export of the currently filtered view. (g) Shopify product type corrections: mapping table and dropdown recognize `Stash Box` and `Pillow Covers`. Implemented in P141 and P141.1. | 2026-09-12 | `Web_App_Screen_Inventory_and_UX_Flow.md`, `SKU_and_Internal_ID_Guide.md`, `Technical_Architecture_and_API_Contract.md`, `Shopify_Integration_and_Order_Import_Spec.md` |
| 136 | Lighter PPTX cover-crop fit mode and Event Prints compact image adjustment overrides | Two generation and operator control refinements: (a) Lighter (`LITF`/`LITB`) image fit mode changed from contain-fit to cover-crop (`_resize_cover_crop`): images are scaled and cropped to fill the rounded-rectangle container while preserving aspect ratio, eliminating letterbox bars, while preserving the conditional 90-degree landscape rotation rule (Decision #45). (b) Event Prints active-product compact image adjustment overrides: adds `CompactAdjustmentsBar` to `/event-prints`, persisting per-job adjustment overrides in `EventPrintJob.adjustment_overrides` via `GET`/`PATCH /api/event-prints/jobs/{id}/adjustments/`, using the shared Design System `Switch` primitive for Brightness/Contrast manual overrides. Implemented in P142. | 2026-09-13 | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md`, `Technical_Architecture_and_API_Contract.md`, `Data_Model_and_Database_Schema.md`, `Web_App_Screen_Inventory_and_UX_Flow.md` |

Open Questions table:

Open Question #1 (confirm Shopify `product_type` string for `BAT`) was resolved by Decision #30 on 2026-06-15. Four gates surfaced during the 2026-06-24 artwork hierarchy gap analysis (GRS series resolution, TIN folder, GRD in ASHGRD bundles, BOX-family LITF/LITB isolation) were resolved by Decisions #32–#35 on the same date. Open Questions #2 (internal design ID format for auto-created designs) and #3 (Settings screen scope for MVP) were resolved by Decisions #37 and #38 on 2026-07-07. Decision #39 (2026-07-17) documents the P50/P50.1/P51 webhook payload rejection incident and its resolution. Decision #41 (2026-08-12) records the 2026-07-16 owner acceptance of the P25 fresh registered-webhook delivery residual and its subsequent technical closure by P66.2/P66.3 (2026-07-27), resolving audit finding `DOC-004`. Open Question #4 (batch status display-label override for Current Batches) was resolved by Decision #44 on 2026-08-20. Open Question #5 (Lighter rotation rule for landscape source images) was resolved by Decision #45 on 2026-08-20. Open Question #6 (test order restriction for live verification) was resolved by Decision #46 on 2026-08-20. Open Question #7 (Lighter PPTX grid arrangement) was resolved by Decision #48 on 2026-08-21. No open questions remain as of 2026-09-04.

New questions use the table format `# | Question | Blocking Documents | Owner`.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| All SOT and Implementation Spec documents | Every business rule must trace back to an Approved Decision row or be marked TBD pending owner approval. |

---

### `docs/00_project/Coding_AI_Context.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec (orientation)

**Primary Purpose:**
Single-file orientation for any coding AI assistant (Claude Code, Cursor, Codex, Windsurf) entering the project. Tells the AI where every spec lives, what conventions are non-negotiable, and what it must not invent.

**Thick Boundaries:**
- **Must Cover:** Project summary, current MVP scope reference, complete SOT file index with one-line purpose per doc, stack summary, naming conventions, "do not invent" rule, list of deferred behaviors the AI must not implement in MVP.
- **Must Consider:** This file is read by AI tools that may have stale knowledge; it should explicitly date-stamp the technical stack decisions and direct the AI to the Decision Log for current state.
- **Explicitly Excludes:** Any business rules (the AI should be sent to SOT documents instead), database schema, image transformation specs, screen flows.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Project Summary | Three to five sentence description of the SpicedAnime fulfillment app. |
| Technical Stack | Confirmed stack with version constraints if known. |
| Source-of-Truth File Index | Table listing every SOT file path with one-line purpose. |
| Naming Conventions | File, branch, table, and code conventions. |
| Behavioral Rules for the AI | List of explicit do-not-invent rules and deferred-behavior warnings. |
| Decision Log Reference | Pointer to `Decision_Log_and_Open_Questions.md` as the live state. |

**Required Hardcoded Content**

Technical stack reference:

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

Behavioral rules for the AI:

- Do not invent business rules. If a rule is not in an SOT document, stop and ask the owner.
- Do not implement the `GRD` (Herb Grinder) family. SKU validation must accept it but route components to the Deferred Items queue.
- Do not generate production components for families flagged `production_required: false`.
- Do not generate PPTX output for families flagged `print_document_required: false`.
- Do not modify SOT documents during code generation. If an SOT document is wrong or incomplete, flag it in the Decision Log.
- Do not assume artwork files use front/back separate filenames. Lighters and wallets use one source file per design, placed twice in the layout.
- Do not write to S3 or any cloud storage other than Google Drive.
- All file paths and folder names follow the conventions in `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`.
- Never persist a tracking number or tracking URL anywhere in the schema or codebase. Tracking is explicitly out of scope for this app (Decision #42).
- The reconciliation topic for refunds is `refunds/create`. `orders/refunded` is not a valid Shopify webhook topic; do not subscribe to it or reference it as if it exists.
- Idempotency for the four reconciliation webhooks keys on `X-Shopify-Webhook-Id`, not `shopify_order_id`. Do not conflate this with the pre-existing `orders/paid` idempotency strategy.
- `Being Packaged` and `Shipped` are declared order-status enum values reserved for Phase 3. No code path in MVP may write either value.
- PPTX component placement order is always derived from `component__id` ascending, regardless of screen sort order or selection order. Do not let a UI sort parameter reach the layout engine.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `00_project/Decision_Log_and_Open_Questions.md` | Live state of approved decisions. |
| All SOT documents | This file points AI at SOTs; it does not duplicate their content. |

---

## 01_source_of_truth/

### `docs/01_source_of_truth/End_to_End_Fulfillment_Workflow_SOT.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Master chronological narrative of the full workflow from paid Shopify order through printed batch and generated packing sheet. The reference all other SOT documents derive from. Defines branch behavior for non-produced items, mixed orders, and the deferred `GRD` family.

**Thick Boundaries:**
- **Must Cover:** Numbered workflow steps from paid Shopify order to packing-sheet export; status transitions per step; branch behavior for non-produced items, `GRD` family, partial batch errors, and mixed orders.
- **Must Consider:** Workflow narrative must reference (not duplicate) the state machine in `Order_Status_and_Batch_Lifecycle_SOT.md`, the SKU rules in `SKU_and_Internal_ID_Guide.md`, and the decomposition rules in `Production_Component_Decomposition_Rules.md`.
- **Explicitly Excludes:** Database field definitions, image transformation parameters, PPTX layout rules, SKU format details, packing sheet column definitions.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Workflow Overview | One-paragraph summary of the complete flow. |
| Step 1: Order Received | Shopify webhook trigger spec and initial order record creation. |
| Step 2: Order Item Extraction | Line item parsing and quantity expansion. |
| Step 3: SKU Parsing | Family-specific parser invocation. Branch for `GRD` family and non-produced families. |
| Step 4: Component Generation | Per-family decomposition. Reference to `Production_Component_Decomposition_Rules.md`. |
| Step 5: Artwork Lookup | Path resolution per component. |
| Step 6: Validation | Per-item validation; routing to Needs Attention or Deferred Items. |
| Step 7: Batch Assignment | Component routing to active batch by production group. |
| Step 8: Live Accumulation | Open batch behavior over time. |
| Step 9: Generate PPTX | Operator action that locks the batch. |
| Step 10: Physical Print | Manual print step. |
| Step 11: Mark Printed | Atomic batch close operation. |
| Step 12: Packing Sheet Generation | Combined export trigger. |
| Step 13: Status Progression | Order status transitions post-print. |
| Branch: Non-Produced Orders | Fast path through workflow. |
| Branch: Mixed Orders | Status hold until all required produced components are printed. |
| Branch: Deferred MVP Items | `GRD` family routing. |

**Required Hardcoded Content**

Production groups (separate active batches per group):

| Batch Group | Components Included |
| :--- | :--- |
| Ashtray | ASH |
| Lighter | LITF, LITB (front and back placements from one source file) |
| Tin | TIN |
| Box | BOX |
| Wallet | WALF, WALB (front and back placements from one source file) |
| Grinder/Jar/Tray | GRD (component code, grinder image), JAR, TRY |

Non-produced families that skip steps 4 through 11:

| Family Code | Family Name |
| :--- | :--- |
| BAT | Black Art Tapestry |
| HOD | Hoodie |
| PIL | Pillow Cover |
| TAP | Tapestry |
| TOT | Tote Bag |

Deferred family that routes to Deferred Items queue:

| Family Code | Family Name | Reason |
| :--- | :--- | :--- |
| GRD | Herb Grinder | Not yet set up on Shopify; reserved for future. |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | State machine that this workflow triggers. |
| `SKU_and_Internal_ID_Guide.md` | Defines SKU parsing called in Step 3. |
| `Production_Component_Decomposition_Rules.md` | Defines the rules invoked in Step 4. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines path lookup invoked in Step 5. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines error handling invoked in Step 6. |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Defines Step 9 output. |
| `Packing_Sheet_Export_Spec.md` | Defines Step 12 output. |

---

### `docs/01_source_of_truth/Order_Status_and_Batch_Lifecycle_SOT.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines every status enum and the state machine governing orders, production batches, print components, and artwork assets. Single canonical source for all lifecycle states used elsewhere in the system.

**Thick Boundaries:**
- **Must Cover:** All four state machines (Order, Batch, Component, Artwork); transition triggers; mixed-order promotion logic; non-produced item fast-path; deferred item state; batch lock behavior.
- **Must Consider:** Atomic transactions for Mark Printed; race conditions when orders arrive during batch lock; concurrent batch operations.
- **Explicitly Excludes:** SKU format, image transformation specs, workflow narrative (reference `End_to_End_Fulfillment_Workflow_SOT.md`), database field types (those live in `Data_Model_and_Database_Schema.md`).

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Order Lifecycle | Enum table, transitions, triggers, mixed-order promotion rule. |
| Batch Lifecycle | Enum table, transitions, triggers, atomic lock behavior. |
| Component Lifecycle | Enum table, transitions, deferred state. |
| Artwork Lifecycle | Enum table, transitions. |
| State Machine Diagram (text or visual) | All four lifecycles with arrows. |
| Cross-Entity Transition Rules | How a batch transition triggers component and order transitions. |

**Required Hardcoded Content**

Order Status enum:

| Status | Meaning | Terminal? |
| :--- | :--- | :---: |
| `Queued for Production` | Paid and unfulfilled Shopify order received; produced components not yet printed. | No |
| `In Production` | All required produced components for this order have been printed. | No |
| `In Production (Needs Reprint)` | At least one component in this order has been flagged `Reprint Needed`. Set whenever a reprint flag is applied to an `In Production` order; cleared back to `In Production` when the flagged component(s) reach `Printed` (Decision #71). | No |
| `Being Packaged` | Shipping label generated. Not reachable in MVP; Phase 3 feature. | No |
| `Shipped` | Carrier first acceptance scan. Not reachable in MVP; Phase 3 feature. | Yes |
| `Fulfilled Externally` | Order was marked fulfilled directly in Shopify, outside the app (Decision #42). | Yes |
| `Canceled` | Order was cancelled or refunded in Shopify (Decision #42). | Yes |

`Being Packaged` and `Shipped` are declared for schema completeness (Phase 3) but no code path writes them in MVP. They do not appear in any operator-facing status filter, badge, or dashboard tile; the app enforces this via an explicit `MVP_VISIBLE_ORDER_STATUSES` allowlist rather than by omission, and Orders-list queries filter to that allowlist defensively so a manually inserted row in a dormant status cannot surface.

Batch Status enum:

| Status | Meaning |
| :--- | :--- |
| `Open` | Active batch accepting new components. One per production group at any time. |
| `Locked for Review` | PPTX generated; no new components accepted. |
| `Printed` | Operator confirmed physical print completed. |
| `Archived` | Historical record; read-only. |

Batch lock behavior has two forms, both preserving exactly one `Open` batch per production group at all times:

- **Full generation (no item selection).** When the operator clicks Generate PPTX with no items selected, the batch transitions from `Open` to `Locked for Review`, and a new `Open` batch is created for the same production group simultaneously. Unchanged from original behavior.
- **Selective generation (item selection).** When the operator selects a proper subset of the batch's `Ready` components and clicks Generate PPTX, a new batch is created with status `Locked for Review` for the same production group, holding only the selected components (with front/back pairs such as LITF/LITB and WALF/WALB automatically expanded to include both halves). The original batch remains `Open` and retains the unselected components; no second `Open` batch is created. Selecting every eligible component in a batch is equivalent to selecting none; the full-generation branch runs instead. If selective PPTX generation fails, the subset's components are merged back into the group's `Open` batch and the failed batch record is deleted, preserving the one-`Open`-batch invariant.

**Sandbox batch exemption (Decision #47).** Batches where `is_sandbox = true` are exempt from both lock-behavior forms above. Clicking Generate PPTX on a sandbox batch does not transition the batch to `Locked for Review` and does not create a new `Open` batch; the sandbox batch remains `Open` and can be regenerated an unlimited number of times. This exemption applies only to batches created by the sandbox mechanism and never to real production batches.

Component Status enum:

| Status | Meaning |
| :--- | :--- |
| `Queued` | Generated from order item; not yet assigned to an Open batch. |
| `Ready` | Assigned to an Open batch and validated. |
| `Blocked` | Validation failed (missing artwork, missing template, etc.). Routed to Needs Attention. |
| `Printed` | Containing batch reached `Printed` status. |
| `Reprint Needed` | Operator flagged the component for reprint. |
| `Deferred MVP` | Component belongs to `GRD` family; held in Deferred Items queue. |
| `Canceled` | Component was pulled from its `Open` batch because the parent order was cancelled or refunded in Shopify, or because the parent order was fulfilled externally (Decision #42). |

Artwork Asset Status enum:

| Status | Meaning |
| :--- | :--- |
| `Available` | File exists at expected Google Drive path. |
| `Missing` | Expected path is empty. Triggers `MISSING_ARTWORK` validation failure. |
| `Retired` | Asset is marked inactive; no new components reference it. |

Cross-entity transition rules:

| Trigger Event | Resulting Transitions |
| :--- | :--- |
| Shopify webhook received (paid + unfulfilled) | New Order record created with status `Queued for Production`. |
| Component generated for order | Component status `Queued`. |
| Component assigned to Open batch and validated | Component status `Ready`. |
| Component validation fails | Component status `Blocked`. |
| Component is in `GRD` family | Component status `Deferred MVP`; not assigned to any batch. |
| Operator clicks Generate PPTX on batch with no selection | Batch transitions `Open` -> `Locked for Review`. New `Open` batch created for same production group. |
| Operator clicks Generate PPTX on batch with a proper subset selected | New `Locked for Review` batch created for the same production group holding only the selected (and pair-expanded) components. Originating batch remains `Open` with the remainder. No second `Open` batch created. |
| Operator clicks Mark Printed | Batch transitions `Locked for Review` -> `Printed`. All contained components transition `Ready` -> `Printed`. Order-promotion check runs. |
| Operator bulk-flags one or more order items for reprint (Orders screen or Order Detail) | Selected `Printed` component(s) transition to `Reprint Needed`; a paired front/back component (LITF/LITB, WALF/WALB) is flagged alongside its pair even if only one side was selected. A new `Queued` component is created for each and assigned to the current `Open` batch for its production group. The order transitions `In Production` -> `In Production (Needs Reprint)` (Decision #71). |
| All of an order's `Reprint Needed` components reach `Printed` | Order transitions `In Production (Needs Reprint)` -> `In Production` (Decision #71). |
| Order-promotion check: all produced components for order are `Printed` | Order transitions `Queued for Production` -> `In Production`. |
| Order contains only non-produced items | Order remains `Queued for Production` until shipping label is generated (Phase 3); skip print-batch wait. |
| Shipping label generated (Phase 3) | Order transitions `In Production` -> `Being Packaged`. Not reachable in MVP. |
| Carrier first scan (Phase 3) | Order transitions `Being Packaged` -> `Shipped`. Not reachable in MVP. |
| Batch reaches `Printed` and 30 days pass (or operator action) | Batch transitions `Printed` -> `Archived`. |
| Shopify `orders/fulfilled` webhook received | Order in `Queued for Production` or `In Production` transitions to `Fulfilled Externally`. Components in that order with status `Queued` or `Ready` are pulled from their `Open` batch and transition to `Canceled`. Any other order state: audited no-op. |
| Shopify `orders/cancelled` or `refunds/create` webhook received | Order in `Queued for Production` or `In Production` transitions to `Canceled`. Components in that order with status `Queued` or `Ready` are pulled from their `Open` batch and transition to `Canceled`. Any other order state: audited no-op. |
| Shopify `orders/updated` webhook received | Order's shipping-address snapshot refreshed. Order status is never changed by this event. |
| `reconcile_shopify_history --apply` run by operator | Same transitions as the `orders/fulfilled` and `orders/cancelled`/`refunds/create` rows above, applied one time to orders that drifted before the live webhooks existed. Read-only in `--dry-run` mode. |
| `reset_locked_batches_p77 --apply` run by operator (one-time) | Batch in `Locked for Review` (excluding `Printed`) transitions back to `Open`; `generated_file_url` cleared. Applied one time to align pre-P77 batches with the corrected image-transform specs (Decisions #48–#57). Read-only in `--dry-run` mode (Decision #59). |

Mixed-order promotion example:

| Order Contents | After Lighter Batch Printed | After Grinder/Jar/Tray Batch Printed |
| :--- | :--- | :--- |
| Lighter only | `In Production` | (no change) |
| Lighter + Grinder Set | `Queued for Production` | `In Production` |
| Hoodie only | `Queued for Production` (no produced components) | (no change) |
| Lighter + Hoodie | `In Production` (only produced component is the lighter) | (no change) |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `End_to_End_Fulfillment_Workflow_SOT.md` | Workflow triggers these state transitions. |
| `Data_Model_and_Database_Schema.md` | Status enum values must be stored as exact string matches in DB columns. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | `Blocked` and `Reprint Needed` states are triggered by error conditions defined there. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the webhook and historical-reconciliation triggers for `Fulfilled Externally` and `Canceled`. |
| `Decision_Log_and_Open_Questions.md` | Decision #42 authorizes the `Fulfilled Externally`, `Canceled`, and selective-batch-generation behavior in this document. |

---

### `docs/01_source_of_truth/SKU_and_Internal_ID_Guide.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines the canonical Shopify offer SKU format, the design code system, internal database IDs, every option and config code dictionary, the parser contract, validation rules, and the migration strategy (canonical SKUs only; no alias infrastructure). A revised version of the existing `SKU and Internal ID Guide.md` file with the YAML header corrected and the full 13-family dictionary applied.

**Thick Boundaries:**
- **Must Cover:** SKU pattern, character rules, length rules, family code dictionary, design code rules, internal ID formats, option code dictionaries (color, flame, size), config code dictionary, family-specific SKU formats, SKU decomposition rules pointer, parser input/output contract, validation failure codes.
- **Must Consider:** `GRD` (family) versus `GRD` (component) namespace clarification; non-produced family SKU format with `-NONE` config; production behavior flags table cross-references `Data_Model_and_Database_Schema.md`.
- **Explicitly Excludes:** Image transformation parameters, database table definitions, batch lifecycle rules, screen flows.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Purpose and Two-Layer Identification Model | SKU identifies sellable variant; database provides production intelligence. |
| Canonical SKU Format | Pattern, character rules, length rules. |
| Product Family Code Dictionary | All 13 families with production behavior flags. |
| Design Codes and Internal Design IDs | Format, immutability, collision handling. |
| Option Code Dictionaries | Color, flame, size code tables. |
| Configuration Code Dictionary | All config codes including `NONE`. |
| Family-Specific SKU Formats | Per-family SKU patterns with examples. |
| Production Component Codes | Internal component code dictionary (cross-reference to decomposition rules). |
| Parser Contract | Input/output JSON examples. |
| Validation Rules and Failure Codes | Enum of validation failure codes. |
| Governance | Rules for creating, retiring, and renaming SKUs and designs. |
| Namespace Clarification | Family code `GRD` vs component code `GRD`. |

**Required Hardcoded Content**

SKU pattern:

```text
<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>
```

SKU character rules:

| Rule | Requirement |
| :--- | :--- |
| Case | Uppercase only |
| Separator | Hyphen `-` only |
| Allowed characters | `A-Z`, `0-9`, `-` |
| Spaces | Not allowed |
| Special characters | Not allowed |
| Target length | 12 to 32 characters |
| Hard maximum | 50 characters |
| Reuse | Never reuse retired SKUs |
| Case-only uniqueness | Forbidden |

Product Family Code Dictionary (full 13 families, owner-approved 2026-06-13):

| Family Code | Family Name | implementation_status | production_required | print_document_required | packing_sheet_required | default_batch_group |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `ASH` | Ashtray | MVP | true | true | true | Ashtray |
| `BAT` | Black Art Tapestry | MVP | false | false | true | None |
| `LIT` | Flip Lighter | MVP | true | true | true | Lighter |
| `GRS` | Grinder Sets | MVP | true | true | true | Grinder/Jar/Tray |
| `GRD` | Herb Grinder | Ignored for MVP | false (MVP) | false (MVP) | true (when sold) | None (MVP) |
| `HOD` | Hoodie | MVP | false | false | true | None |
| `PIL` | Pillow Cover | MVP | false | false | true | None |
| `TRY` | Rolling Tray | MVP | true | true | true | Grinder/Jar/Tray |
| `BOX` | Stash Box | MVP | true | true | true | Box |
| `JAR` | Stash Jar | MVP | true | true | true | Grinder/Jar/Tray |
| `TAP` | Tapestry | MVP | false | false | true | None |
| `TOT` | Tote Bag | MVP | false | false | true | None |
| `WAL` | Wallet | MVP | true | true | true | Wallet |

Internal Design ID format:

```text
D000001
D000002
D000003
```

Design Code rules:

- 4 to 10 characters
- Uppercase letters and numbers only
- Must be unique
- Never changed after launch
- Collision handling: append numeric suffix (`CHARFRIE`, `CHARFRIE2`)

Option Code dictionaries:

Lighter color codes:

| Code | Meaning |
| :--- | :--- |
| `WHT` | White |
| `SIL` | Silver |
| `GLD` | Gold |

Lighter flame/type codes:

| Code | Meaning |
| :--- | :--- |
| `BIC` | Standard lighter |
| `TOR` | Torch lighter |

Tin color codes (same set as Lighter):

| Code | Meaning |
| :--- | :--- |
| `WHT` | White |
| `SIL` | Silver |
| `GLD` | Gold |

Size codes (for non-produced apparel and textiles):

| Code | Meaning |
| :--- | :--- |
| `SML` | Small |
| `MED` | Medium |
| `LRG` | Large |
| `XL` | Extra Large |
| `2XL` | 2XL |
| `3XL` | 3XL |

Configuration Code Dictionary:

| Config Code | Meaning | Generates Print Components? |
| :--- | :--- | :---: |
| `SOLO` | Main family product only | Family-dependent (see Decomposition Rules) |
| `ASHGRD` | Ashtray + Grinder bundle | Yes |
| `LITTIN` | Lighter + Tin bundle | Yes |
| `GRDONLY` | Grinder Sets — grinder only | Yes |
| `JARONLY` | Grinder Sets — jar only | Yes |
| `TRYONLY` | Grinder Sets — tray only | Yes |
| `GRDJAR` | Grinder Sets — grinder + jar | Yes |
| `GRDTRY` | Grinder Sets — grinder + tray | Yes |
| `JARTRY` | Grinder Sets — jar + tray | Yes |
| `GRDSET` | Grinder Sets bundle (grinder + jar + tray) | Yes |
| `BOXGRD` | Stash Box + Grinder bundle | Yes |
| `BOXJAR` | Stash Box + Jar bundle | Yes |
| `BOXLIT` | Stash Box + Lighter bundle | Yes |
| `BOX4` | Stashbox set (box + lighter + grinder + jar) | Yes |
| `WALFONLY` | Wallet front only | Yes |
| `WALFB` | Wallet front and back | Yes |
| `NONE` | No produced component; packing-sheet-only | No |

Family-Specific SKU Formats:

| Family | Format | Example |
| :--- | :--- | :--- |
| Ashtray | `ASH-<DESIGN>-<CONFIG>` | `ASH-CHARFRIE-SOLO` |
| Flip Lighter | `LIT-<DESIGN>-<COLOR>-<FLAME>-<CONFIG>` | `LIT-DESNAM-SIL-TOR-LITTIN` |
| Tin (sold inside LITTIN) | `TIN-<DESIGN>-<COLOR>-<CONFIG>` | `TIN-DESNAM-SIL-SOLO` |
| Stash Jar | `JAR-<DESIGN>-<CONFIG>` | `JAR-NARUTO-SOLO` |
| Rolling Tray | `TRY-<DESIGN>-<CONFIG>` | `TRY-ONEPIECE-SOLO` |
| Grinder Sets | `GRS-<DESIGN>-<CONFIG>` | `GRS-NARUTO-GRDSET` |
| Herb Grinder (future) | `GRD-<DESIGN>-<CONFIG>` | `GRD-BLEACH-SOLO` |
| Stash Box | `BOX-<DESIGN>-<CONFIG>` | `BOX-DEMONSLAYER-BOX4` |
| Wallet | `WAL-<DESIGN>-<CONFIG>` | `WAL-POKEMON-WALFB` |
| Black Art Tapestry | `BAT-<DESIGN>-<SIZE>-NONE` | `BAT-SAMURAI-LRG-NONE` |
| Tapestry | `TAP-<DESIGN>-<SIZE>-NONE` | `TAP-AKIRA-LRG-NONE` |
| Hoodie | `HOD-<DESIGN>-<SIZE>-<COLOR>-NONE` | `HOD-NARUTO-XL-BLK-NONE` |
| Pillow Cover | `PIL-<DESIGN>-<SIZE>-NONE` | `PIL-GHIBLI-18X18-NONE` |
| Tote Bag | `TOT-<DESIGN>-<COLOR>-NONE` | `TOT-EVA-BLK-NONE` |

Production Component Code Dictionary (pointer table; canonical version in Decomposition Rules):

| Component Code | Component | Source Artwork File |
| :--- | :--- | :--- |
| `ASH` | Ashtray print | `artwork/{DESIGN_CODE}/ASH.png` |
| `GRD` | Grinder print (component, not family) | `artwork/{DESIGN_CODE}/GRD.png` |
| `JAR` | Jar print | `artwork/{DESIGN_CODE}/JAR.png` |
| `TRY` | Tray print | `artwork/{DESIGN_CODE}/TRY.png` |
| `LITF` | Lighter front (placement) | `artwork/{DESIGN_CODE}/LIT.png` |
| `LITB` | Lighter back (placement) | `artwork/{DESIGN_CODE}/LIT.png` (same file as LITF) |
| `TIN` | Tin print | `artwork/{DESIGN_CODE}/TIN.png` |
| `BOX` | Box print | `artwork/{DESIGN_CODE}/BOX.png` |
| `WALF` | Wallet front (placement) | `artwork/{DESIGN_CODE}/WAL.png` |
| `WALB` | Wallet back (placement) | `artwork/{DESIGN_CODE}/WAL.png` (same file as WALF) |

Parser Contract examples:

Input:
```text
LIT-DESNAM-SIL-TOR-LITTIN
```

Output:
```json
{
  "family": "LIT",
  "design_code": "DESNAM",
  "options": {
    "color": "SIL",
    "flame": "TOR"
  },
  "config": "LITTIN"
}
```

Input:
```text
TAP-AKIRA-LRG-NONE
```

Output:
```json
{
  "family": "TAP",
  "design_code": "AKIRA",
  "options": {
    "size": "LRG"
  },
  "config": "NONE"
}
```

Validation failure codes:

| Code | Trigger |
| :--- | :--- |
| `INVALID_CASE` | SKU contains lowercase letters. |
| `INVALID_CHARACTERS` | SKU contains disallowed characters. |
| `DUPLICATE_SKU` | SKU already exists in `offer_skus`. |
| `UNKNOWN_FAMILY` | Family code is not in the dictionary. |
| `INVALID_FORMAT` | SKU does not match the family-specific pattern. |
| `UNKNOWN_CONFIG` | Config code not valid for this family. |
| `UNKNOWN_OPTION` | Option code not in the option dictionary. |
| `NO_COMPONENT_RULE` | No row in `configuration_components` for this family + config. |
| `MISSING_ARTWORK` | Expected artwork file not found at Google Drive path. |
| `MISSING_TEMPLATE` | No row in `print_templates` for the required component. |
| `FAMILY_DEFERRED_MVP` | SKU family is `GRD`; routes component to Deferred Items queue. Not an error condition; expected behavior. |

Namespace clarification:

- Family code `GRD` identifies the future Herb Grinder Shopify product family. Deferred for MVP.
- Component code `GRD` identifies the grinder image production component (2.35" diameter circle crop). Used in Grinder Sets and any future Herb Grinder solo products.
- These codes share a string value but live in different database tables (`product_families` vs internal component code enum) and are never confused at runtime because they appear in different contexts.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Defines what components each family + config combination generates. |
| `Data_Model_and_Database_Schema.md` | `product_families` table is the canonical storage for the family dictionary; this document is the prose source. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the artwork file path conventions referenced in the component table. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines what happens when a validation failure code fires. |

---

### `docs/01_source_of_truth/Production_Component_Decomposition_Rules.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines exactly which internal print components are generated from each SKU family + config combination. This is the rule table the app uses to turn one purchased SKU into one or more printable units. The prose companion to `production_component_rules.yaml`, which must remain bit-for-bit consistent.

**Thick Boundaries:**
- **Must Cover:** Complete `configuration_components` mapping for all produced families; explicit exclusion list for non-produced families; deferred-MVP behavior for `GRD` family; component quantity rules; same-source-file rule for lighter and wallet placements.
- **Must Consider:** This document and `production_component_rules.yaml` must stay in sync. Any change here requires regenerating the YAML.
- **Explicitly Excludes:** SKU format details (live in `SKU_and_Internal_ID_Guide.md`), image transformation parameters, batch lifecycle rules.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Decomposition Rule Table | Family + config -> components mapping for produced families. |
| Component Code Reference | Component code, batch group, source file convention. |
| Non-Produced Family Exclusion | Explicit zero-component table for non-produced families. |
| Deferred MVP Behavior | `GRD` family rules. |
| Front/Back Placement Rule | Single source file generates two placements for lighter and wallet. |
| YAML Sync Contract | Statement that the YAML config is authoritative for machine consumption. |

**Required Hardcoded Content**

Decomposition rules for produced families:

| Family | Config | Components Generated | Batch Group Routing |
| :--- | :--- | :--- | :--- |
| `ASH` | `SOLO` | `ASH` x1 | Ashtray |
| `ASH` | `ASHGRD` | `ASH` x1, `GRD` x1 | Ashtray + Grinder/Jar/Tray |
| `LIT` | `SOLO` | `LITF` x1, `LITB` x1 | Lighter |
| `LIT` | `LITTIN` | `LITF` x1, `LITB` x1, `TIN` x1 | Lighter + Tin |
| `JAR` | `SOLO` | `JAR` x1 | Grinder/Jar/Tray |
| `TRY` | `SOLO` | `TRY` x1 | Grinder/Jar/Tray |
| `GRS` | `GRDONLY` | `GRD` x1 | Grinder/Jar/Tray |
| `GRS` | `JARONLY` | `JAR` x1 | Grinder/Jar/Tray |
| `GRS` | `TRYONLY` | `TRY` x1 | Grinder/Jar/Tray |
| `GRS` | `GRDJAR` | `GRD` x1, `JAR` x1 | Grinder/Jar/Tray |
| `GRS` | `GRDTRY` | `GRD` x1, `TRY` x1 | Grinder/Jar/Tray |
| `GRS` | `JARTRY` | `JAR` x1, `TRY` x1 | Grinder/Jar/Tray |
| `GRS` | `GRDSET` | `GRD` x1, `JAR` x1, `TRY` x1 | Grinder/Jar/Tray |
| `BOX` | `SOLO` | `BOX` x1 | Box |
| `BOX` | `BOXGRD` | `BOX` x1, `GRD` x1 | Box + Grinder/Jar/Tray |
| `BOX` | `BOXJAR` | `BOX` x1, `JAR` x1 | Box + Grinder/Jar/Tray |
| `BOX` | `BOXLIT` | `BOX` x1, `LITF` x1, `LITB` x1 | Box + Lighter |
| `BOX` | `BOX4` | `BOX` x1, `LITF` x1, `LITB` x1, `GRD` x1, `JAR` x1 | Box + Lighter + Grinder/Jar/Tray |
| `WAL` | `WALFONLY` | `WALF` x1 | Wallet |
| `WAL` | `WALFB` | `WALF` x1, `WALB` x1 | Wallet |

Non-produced family exclusion (zero components generated; packing sheet only):

| Family | Config | Components Generated |
| :--- | :--- | :--- |
| `BAT` | `NONE` | (none) |
| `HOD` | `NONE` | (none) |
| `PIL` | `NONE` | (none) |
| `TAP` | `NONE` | (none) |
| `TOT` | `NONE` | (none) |

Deferred MVP family:

| Family | All Configs | Components Generated | Status |
| :--- | :--- | :--- | :--- |
| `GRD` | (all) | Component record created with status `Deferred MVP`; not assigned to any batch | Deferred for MVP per Decision #18 |

Front/back placement rule:

- `LITF` and `LITB` are separate component records (the layout engine needs two placements on the slide), but both resolve to the same source artwork file `artwork/{DESIGN_CODE}/LIT.png`.
- `WALF` and `WALB` are separate component records, both resolve to `artwork/{DESIGN_CODE}/WAL.png`.
- This rule applies to artwork lookup only. Component records remain distinct in the database for layout placement, quantity counting, and batch reporting.

Quantity rule:

- A line item quantity of N produces N copies of each generated component. Example: an order line item `ASH-CHARFRIE-ASHGRD` with qty 3 generates three `ASH` components and three `GRD` components.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `production_component_rules.yaml` | Machine-readable mirror. Must stay in sync. |
| `SKU_and_Internal_ID_Guide.md` | Defines the family and config codes used in this table. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the artwork file paths each component resolves to. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the batch groups components route into. |

---

### `docs/01_source_of_truth/production_component_rules.yaml`

**Approval Status:** Requires owner approval (linked to `Production_Component_Decomposition_Rules.md` approval)

**Source Type:** Machine-Readable Config

**Primary Purpose:**
Machine-parseable mirror of the decomposition rules table. Imported by the app at startup or used as seed data for the `configuration_components` database table. Must remain bit-for-bit consistent with `Production_Component_Decomposition_Rules.md`.

**Thick Boundaries:**
- **Must Cover:** Every family + config combination from the prose SOT; non-produced family entries with empty components arrays; deferred MVP flag on `GRD`.
- **Must Consider:** Schema must be stable. Any addition of a new field requires updating the prose SOT and the database migration in lockstep.
- **Explicitly Excludes:** Any narrative, comments beyond the version field, or rules not present in the parent SOT.

**Required Sections**

The file is YAML and does not use markdown sections. It must contain a top-level structure with `version`, `last_verified`, and a `families` array.

**Required Hardcoded Content**

YAML skeleton:

```yaml
version: "1.0"
last_verified: "2026-06-14"
status: "Pending Owner Verification"
source_document: "docs/01_source_of_truth/Production_Component_Decomposition_Rules.md"

families:
  - family_code: ASH
    family_name: Ashtray
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Ashtray
    configurations:
      - config_code: SOLO
        components:
          - { code: ASH, quantity: 1, batch_group: Ashtray }
      - config_code: ASHGRD
        components:
          - { code: ASH, quantity: 1, batch_group: Ashtray }
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }

  - family_code: BAT
    family_name: Black Art Tapestry
    implementation_status: MVP
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: NONE
        components: []

  - family_code: LIT
    family_name: Flip Lighter
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Lighter
    configurations:
      - config_code: SOLO
        components:
          - { code: LITF, quantity: 1, batch_group: Lighter }
          - { code: LITB, quantity: 1, batch_group: Lighter }
      - config_code: LITTIN
        components:
          - { code: LITF, quantity: 1, batch_group: Lighter }
          - { code: LITB, quantity: 1, batch_group: Lighter }
          - { code: TIN, quantity: 1, batch_group: Tin }

  - family_code: GRS
    family_name: Grinder Sets
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Grinder/Jar/Tray
    configurations:
      - config_code: GRDONLY
        components:
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: JARONLY
        components:
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: TRYONLY
        components:
          - { code: TRY, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: GRDJAR
        components:
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: GRDTRY
        components:
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: TRY, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: JARTRY
        components:
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: TRY, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: GRDSET
        components:
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: TRY, quantity: 1, batch_group: Grinder/Jar/Tray }

  - family_code: GRD
    family_name: Herb Grinder
    implementation_status: Ignored for MVP
    deferred_mvp: true
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: SOLO
        components: []

  - family_code: HOD
    family_name: Hoodie
    implementation_status: MVP
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: NONE
        components: []

  - family_code: PIL
    family_name: Pillow Cover
    implementation_status: MVP
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: NONE
        components: []

  - family_code: TRY
    family_name: Rolling Tray
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Grinder/Jar/Tray
    configurations:
      - config_code: SOLO
        components:
          - { code: TRY, quantity: 1, batch_group: Grinder/Jar/Tray }

  - family_code: BOX
    family_name: Stash Box
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Box
    configurations:
      - config_code: SOLO
        components:
          - { code: BOX, quantity: 1, batch_group: Box }
      - config_code: BOXGRD
        components:
          - { code: BOX, quantity: 1, batch_group: Box }
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: BOXJAR
        components:
          - { code: BOX, quantity: 1, batch_group: Box }
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }
      - config_code: BOXLIT
        components:
          - { code: BOX, quantity: 1, batch_group: Box }
          - { code: LITF, quantity: 1, batch_group: Lighter }
          - { code: LITB, quantity: 1, batch_group: Lighter }
      - config_code: BOX4
        components:
          - { code: BOX, quantity: 1, batch_group: Box }
          - { code: LITF, quantity: 1, batch_group: Lighter }
          - { code: LITB, quantity: 1, batch_group: Lighter }
          - { code: GRD, quantity: 1, batch_group: Grinder/Jar/Tray }
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }

  - family_code: JAR
    family_name: Stash Jar
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Grinder/Jar/Tray
    configurations:
      - config_code: SOLO
        components:
          - { code: JAR, quantity: 1, batch_group: Grinder/Jar/Tray }

  - family_code: TAP
    family_name: Tapestry
    implementation_status: MVP
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: NONE
        components: []

  - family_code: TOT
    family_name: Tote Bag
    implementation_status: MVP
    production_required: false
    print_document_required: false
    packing_sheet_required: true
    default_batch_group: None
    configurations:
      - config_code: NONE
        components: []

  - family_code: WAL
    family_name: Wallet
    implementation_status: MVP
    production_required: true
    print_document_required: true
    packing_sheet_required: true
    default_batch_group: Wallet
    configurations:
      - config_code: WALFONLY
        components:
          - { code: WALF, quantity: 1, batch_group: Wallet }
      - config_code: WALFB
        components:
          - { code: WALF, quantity: 1, batch_group: Wallet }
          - { code: WALB, quantity: 1, batch_group: Wallet }
```

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Parent SOT. This file must mirror it exactly. |
| `Data_Model_and_Database_Schema.md` | Seeds the `product_families` and `configuration_components` tables. |

---

### `docs/01_source_of_truth/Product_Image_Transformation_Guidelines.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines per-product image transformation parameters: crop shape, dimensions, border color, color adjustments, page capacity, images per SKU, and special handling (flip horizontal, text box metadata). Already exists; this revision must correct the YAML header and add the resolved tray and ashtray page capacities.

**Thick Boundaries:**
- **Must Cover:** Per-product spec blocks for all 8 produced product types (Ashtray, Grinder, Jar, Tray, Lighter, Tin, Box, Wallet); general print specifications; tray and ashtray per-page counts.
- **Must Consider:** YAML header `database_dependencies` must list only `print_templates` (this document drives that table; it does not directly touch SKU or order tables).
- **Explicitly Excludes:** PPTX slide generation logic (lives in `PPTX_Generation_and_Layout_Engine_Spec.md`), SKU parsing, batch rules, database schema, artwork file path conventions.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| General Print Specifications | Output format, paper size, orientation, margins. |
| Product Transformation Parameters | One subsection per product type. |
| Same-Source-File Note | Lighter and Wallet front/back placements use one source file. |

**Required Hardcoded Content**

General Print Specifications:

- Output Format: PPTX (PowerPoint)
- Page Layout: 8.5" x 11" paper, Portrait orientation
- Margins: Standard PowerPoint default margins

Per-product specs (all approved):

| # | Product | Shape | Dimensions | Border | Border Weight | Adjustments | Per Page | Images per SKU |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | Grinder | Circle crop | 2.45" diameter | `#E8E8E8` | 0.75pt solid | -10% Brightness, +25% Contrast, 150% Saturation | 12 | 1 |
| 2 | Jar | Circle crop | 2.65" diameter | `#FBE3D6` | 0.75pt solid | 55% Sharpness | 12 | 1 |
| 3 | Tray | (no crop) | 5.7" H x 4.05" W | None | N/A | None | 2 (intentionally overlapping diagonal composition per P136.4 reference deck) | 1 |
| 4 | Lighter | Cover crop to rectangle with rounded corners (radius proportional to shape size) (Decision #136) | 2.22" H x 1.42" W | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` | 0.75pt solid | -15% Brightness, +25% Contrast, 200% Saturation, Conditional 90° Rotation (applied programmatically during PPTX generation if the source image is landscape-oriented; portrait-oriented source images are left unrotated) | 10 lighters (20 image placements) | 2 (front and back, same source file) |
| 5 | Ashtray | Circle crop | 3.4" diameter | `#E8E8E8` | 0.75pt solid | -25% Brightness, +35% Contrast, 300% Saturation, Flip Horizontal | 6 | 1 |
| 6 | Tin | Rectangle with rounded corners (radius proportional to shape size) | 2.35" H x 3.75" W | White/Gold: `#FBE3D6`; Silver: `#E8E8E8` | 0.75pt solid | -15% Brightness, +25% Contrast, 250% Saturation, 90° Rotation (applied programmatically during PPTX generation) | 8 | 1 |
| 7 | Box | Rectangle | 4.3" H x 6.25" W | None | N/A | 35% Sharpness, 130% Saturation, -10% Brightness | 2 | 1 |
| 8 | Wallet | Rectangle | 2.2" H x 3.5" W | `#FBE3D6` | 0.75pt solid | 35% Sharpness, -10% Brightness, +20% Contrast, 150% Saturation | 4 wallets (8 image placements) | 2 (front and back, same source file) |

Per-product metadata text box rules:

| Product | Metadata Text Box |
| :--- | :--- |
| Lighter | Bottom text box indicating the lighter color (WHT, SIL, GLD). |
| Tin | Bottom text box indicating the tin color (WHT, SIL, GLD). |
| All others | None. |

Required YAML header correction:

```yaml
database_dependencies:
  - print_templates
primary_systems:
  - Production Batch Engine
  - PPTX Generation Engine
```

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Consumes these parameters when generating PPTX layouts. |
| `Production_Component_Decomposition_Rules.md` | The component codes routed to each batch group must match the per-product specs here. |
| `Data_Model_and_Database_Schema.md` | These parameters seed the `print_templates` table. |

---

### `docs/01_source_of_truth/PPTX_Generation_and_Layout_Engine_Spec.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines how the PPTX file is generated from a locked batch. Covers slide structure, per-product layout grids, page overflow rules, image pairing for front/back products, metadata text box placement, and file output naming. Translates the per-image specs in `Product_Image_Transformation_Guidelines.md` into slide-level generation behavior.

**Thick Boundaries:**
- **Must Cover:** Slide dimensions, per-product layout grids (rows x columns), page overflow, front/back placement rule for lighter and wallet, metadata text box specs, generated file naming, file storage location, editability decision, PDF export decision.
- **Must Consider:** Generation runs as a Celery task; must be idempotent so a regenerate request produces the same output. Generated files write to Google Drive via the Drive API.
- **Explicitly Excludes:** Per-image transformation parameters (those live in `Product_Image_Transformation_Guidelines.md`), SKU parsing, database schema, packing sheet logic.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Slide Specifications | Size, orientation, margins. |
| Per-Product Layout Grids | Row x column layout per product type. |
| Page Overflow Rule | What happens when component count exceeds per-page capacity. |
| Front/Back Placement | How lighter and wallet pairs are placed on a slide. |
| Metadata Text Boxes | Lighter and tin color text box specs. |
| Generated File Output | File naming, storage path, MIME type. |
| Generation Workflow | Trigger, idempotency, Celery task contract. |
| PDF Export | Deferred to Phase 2; not part of MVP. |

**Required Hardcoded Content**

Slide specifications:

| Setting | Value |
| :--- | :--- |
| Slide width | 8.5 inches |
| Slide height | 11 inches |
| Orientation | Portrait |
| Margins | PowerPoint default (left/right 1", top/bottom 1") |

Per-product layout grids (derived from per-page capacity in `Product_Image_Transformation_Guidelines.md`):

| Product | Per Page | Grid (rows x columns) | Notes |
| :--- | :---: | :--- | :--- |
| Grinder | 12 | 4 x 3 | TBD requires owner approval if a different grid is preferred. |
| Jar | 12 | 4 x 3 | TBD requires owner approval if a different grid is preferred. |
| Tray | 3 | 3 x 1 | At 5.7" H x 4.05" W on 8.5" x 11" portrait, 3 stacked vertically. |
| Lighter | 10 lighters (20 placements) | 4 rows x 5 columns, in two vertical blocks of 5 lighters each | Each block is a row of 5 fronts (LITF) directly above a row of 5 backs (LITB) for the same 5 designs, front and back stacked vertically per design rather than side by side. Per Decision #48. |
| Ashtray | 6 | 3 x 2 | At 3.4" diameter, 3 rows of 2 fits. |
| Tin | 8 | 4 x 2 | TBD requires owner approval if a different grid is preferred. |
| Box | 2 | 2 x 1 | At 4.3" H x 6.25" W, two stacked vertically. |
| Wallet | 4 wallets (8 placements) | 4 rows x 2 columns | Each row is one wallet, with front (WALF) and back (WALB) placed side by side in that row's two columns. Per Decision #56. |

Page overflow rule:

- If components in a batch exceed per-page capacity, generate additional slides of the same template until all components are placed.
- Components are placed in component ID order (oldest first) within a slide and across slides.

Front/back placement rule:

- For each lighter component pair (LITF + LITB from the same order item), the layout engine places both copies of the source artwork file side by side on the slide, applying the lighter transformation parameters to both.
- For each wallet component pair (WALF + WALB from the same order item), the layout engine places both copies of the source artwork file side by side on the slide, applying the wallet transformation parameters to both.
- The pairing is preserved on the same slide. If a pair would split across slides due to overflow, the entire pair moves to the next slide.

Metadata text box specs:

| Product | Text Box Content | Placement |
| :--- | :--- | :--- |
| Lighter | "Color: <COLOR>" (where COLOR is WHT, SIL, or GLD spelled out as White, Silver, or Gold) | Bottom of slide |
| Tin | "Color: <COLOR>" (same color codes as lighter) | Bottom of slide |

Generated file output:

| Property | Value |
| :--- | :--- |
| File naming pattern | `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx` |
| Example | `Lighter-BATCH-20260614-001.pptx` |
| Storage location | Google Drive, in batches folder per `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` |
| MIME type | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| Editability | The generated PPTX is editable by default. Operator may manually adjust before printing. |

Generation workflow:

- Trigger: operator clicks Generate PPTX on a batch in `Open` status.
- The batch transitions to `Locked for Review` synchronously.
- A new `Open` batch is created for the same production group synchronously.
- A Celery task is dispatched to generate the PPTX file.
- The task uses `python-pptx` to construct the file and uploads to Google Drive via `google-api-python-client`.
- On success, the batch's `generated_file_url` field is updated with the Drive shareable URL.
- On failure, the batch transitions back to `Open` and a `FAILED_PPTX_GENERATION` error is logged. The new `Open` batch created for the group remains in place; the original batch returns to `Open` status to allow retry.

PDF export:

- Deferred to Phase 2.
- Not implemented in MVP.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Product_Image_Transformation_Guidelines.md` | Source of per-image transformation parameters consumed by this engine. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Google Drive folder structure where generated PPTX files are stored. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the batch state transitions triggered by Generate PPTX. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Celery task infrastructure. |

---

### `docs/01_source_of_truth/Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`

**Approval Status:** Requires owner approval

**Source Type:** Source of Truth

**Primary Purpose:**
Defines the Google Drive folder structure for source artwork, generated PPTX files, generated packing sheets, and batch archives. Single canonical source for all file paths, naming conventions, missing-artwork behavior, and artwork versioning rules.

**Thick Boundaries:**
- **Must Cover:** Google Drive folder structure; artwork file naming conventions; component-to-file resolution; missing artwork behavior; artwork versioning; retired artwork handling; generated output paths; Google Drive auth method.
- **Must Consider:** Lighter and wallet use single source file per design (LITF/LITB both point to `LIT.png`; WALF/WALB both point to `WAL.png`).
- **Explicitly Excludes:** Image transformation parameters, SKU rules, database schema.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Cloud Storage Platform | Google Drive for all environments. |
| Top-Level Folder Structure | Drive folder hierarchy. |
| Source Artwork Conventions | Folder per design code, file per component family. |
| Component-to-File Resolution | Component code -> file path mapping. |
| Missing Artwork Behavior | Validation failure handling. |
| Artwork Versioning | Replacement rule and history. |
| Retired Artwork Handling | Status flag and lookup behavior. |
| Generated PPTX Output | Path and naming. |
| Generated Packing Sheet Output | Path and naming. |
| Batch Archive Path | Long-term storage location. |
| Google Drive Authentication | Auth method and credential storage. |

**Required Hardcoded Content**

Top-level Google Drive folder structure:

```text
SpicedAnime/
├── artwork/
│   ├── {DESIGN_CODE}/
│   │   ├── ASH.png
│   │   ├── GRD.png
│   │   ├── JAR.png
│   │   ├── TRY.png
│   │   ├── LIT.png
│   │   ├── TIN.png
│   │   ├── BOX.png
│   │   └── WAL.png
│   └── ...
├── batches/
│   └── {YYYY-MM-DD}/
│       ├── Lighter-BATCH-20260614-001.pptx
│       ├── Ashtray-BATCH-20260614-001.pptx
│       └── ...
├── packing_sheets/
│   └── {YYYY-MM-DD}/
│       └── PACKING-SHEET-20260614-001.xlsx
└── archives/
    └── {YYYY-MM-DD}/
        └── (archived batch files)
```

Component-to-file resolution table:

| Component Code | Source File Path |
| :--- | :--- |
| `ASH` | `SpicedAnime/artwork/{DESIGN_CODE}/ASH.png` |
| `GRD` | `SpicedAnime/artwork/{DESIGN_CODE}/GRD.png` |
| `JAR` | `SpicedAnime/artwork/{DESIGN_CODE}/JAR.png` |
| `TRY` | `SpicedAnime/artwork/{DESIGN_CODE}/TRY.png` |
| `LITF` | `SpicedAnime/artwork/{DESIGN_CODE}/LIT.png` |
| `LITB` | `SpicedAnime/artwork/{DESIGN_CODE}/LIT.png` |
| `TIN` | `SpicedAnime/artwork/{DESIGN_CODE}/TIN.png` |
| `BOX` | `SpicedAnime/artwork/{DESIGN_CODE}/BOX.png` |
| `WALF` | `SpicedAnime/artwork/{DESIGN_CODE}/WAL.png` |
| `WALB` | `SpicedAnime/artwork/{DESIGN_CODE}/WAL.png` |

Missing artwork behavior:

- If a required file is not present at the expected Drive path, the component transitions to `Blocked` status with failure code `MISSING_ARTWORK`.
- The item appears on the Needs Attention screen with a "Missing artwork" message and the expected file path.
- Other components in the same order continue processing normally.

Artwork versioning:

- Replacing an artwork file in Drive overwrites the previous version.
- Drive's native version history is the audit trail. The app does not maintain a separate version table.
- TBD: requires owner approval if a stricter versioning policy is needed.

Retired artwork handling:

- An `artwork_assets` row with status `Retired` is not returned by lookups.
- The underlying Drive file may remain in place but is no longer referenced.

Generated PPTX naming:

- Pattern: `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx`
- Example: `Lighter-BATCH-20260614-001.pptx`
- Path: `SpicedAnime/batches/{YYYY-MM-DD}/`

Generated packing sheet naming:

- Pattern: `PACKING-SHEET-{YYYYMMDD}-{###}.xlsx`
- Example: `PACKING-SHEET-20260614-001.xlsx`
- Path: `SpicedAnime/packing_sheets/{YYYY-MM-DD}/`

Batch archive path:

- When a batch transitions to `Archived`, its generated files remain at their original paths.
- A pointer is recorded in the `production_batches` row; no physical file move is required.

Google Drive authentication:

- Method: Google Cloud service account with delegated access to the `SpicedAnime/` root folder.
- Credentials: JSON key file stored as environment variable `GOOGLE_DRIVE_CREDENTIALS_JSON`.
- Required scope: `https://www.googleapis.com/auth/drive`.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Defines which components require which artwork files. |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Consumes artwork files and writes generated PPTX outputs. |
| `Packing_Sheet_Export_Spec.md` | Writes generated XLSX outputs per this path convention. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Google Drive API integration. |
| `Security_Access_and_Privacy_Spec.md` | Defines credential handling for the service account. |

---

## 02_app_specs/

### `docs/02_app_specs/Data_Model_and_Database_Schema.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines all PostgreSQL tables, fields, types, constraints, relationships, and indexes for the fulfillment app. The primary implementation reference for backend database work. Translates SOT business rules into concrete database structure.

**Thick Boundaries:**
- **Must Cover:** Full table definitions including `product_families`, status enum mappings, foreign keys, indexes, and Django model considerations.
- **Must Consider:** All status string values must match the SOT exactly. The `product_families` table is the canonical storage for the family dictionary; `production_component_rules.yaml` is the seed source.
- **Explicitly Excludes:** Workflow narrative, image specs, business rules (reference SOTs).

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Schema Overview | Entity relationship diagram or equivalent prose. |
| Table Definitions | One subsection per table with full field spec. |
| Foreign Key Map | Cross-table relationships. |
| Index Recommendations | Performance-critical indexes. |
| Status Enum Mapping | Cross-reference of status strings to their owning tables. |
| Django Model Notes | Any Django-specific considerations. |

**Required Hardcoded Content**

Full table list:

| Table | Purpose |
| :--- | :--- |
| `orders` | Shopify order-level records. |
| `order_items` | One row per Shopify line item per order. |
| `offer_skus` | Canonical Shopify offer SKU records. |
| `designs` | Design records with design IDs and codes. |
| `product_families` | The 13-family dictionary with production behavior flags. |
| `configuration_components` | Family + config to component code mapping (seeded from YAML). |
| `artwork_assets` | Source artwork file records with Drive paths and statuses. |
| `production_components` | Generated printable units from order items. |
| `production_batches` | Per-production-group batch records. |
| `batch_items` | Many-to-many join between batches and components. |
| `print_templates` | Per-product layout and transformation parameters (seeded from `Product_Image_Transformation_Guidelines.md`). |
| `packing_exports` | Generated XLSX records. |
| `generated_files` | All generated PPTX, XLSX, and other output files with Drive references. |
| `audit_events` | System action audit log. |
| `artwork_revalidation_runs` | Overlap-protection run records for manual and hourly Drive artwork revalidation scans. |
| `webhook_receipts` | Idempotency and safe-evidence records for the four Shopify reconciliation webhooks (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`). |

`product_families` table fields (the new table from Decision #17):

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `family_code` | varchar(3) | No | Primary key. Values from the 13-family dictionary. |
| `family_name` | varchar(64) | No | Human-readable name. |
| `is_sold` | boolean | No | Whether family exists in the Shopify catalog. |
| `is_site_active` | boolean | No | Whether family is currently active on the site. |
| `implementation_status` | varchar(32) | No | Enum: `MVP`, `Future`, `Ignored for MVP`. |
| `deferred_mvp` | boolean | No | Whether this family is valid but deferred from MVP production flow. |
| `production_required` | boolean | No | Whether SKU creates production components. |
| `print_document_required` | boolean | No | Whether SKU enters PPTX generation. |
| `packing_sheet_required` | boolean | No | Whether SKU appears on packing sheet. |
| `default_batch_group` | varchar(32) | Yes | Batch routing group name; null for non-produced. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

Full table field definitions for all 16 tables: TBD by developer based on the SOT documents. Each table must follow the field naming conventions in this document.

Status enum mapping (must match SOT exactly):

| Field | Owning Table | Allowed Values | Source |
| :--- | :--- | :--- | :--- |
| `orders.status` | orders | `Queued for Production`, `In Production`, `In Production (Needs Reprint)`, `Being Packaged`, `Shipped`, `Fulfilled Externally`, `Canceled` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `production_batches.status` | production_batches | `Open`, `Locked for Review`, `Printed`, `Archived` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `production_components.status` | production_components | `Queued`, `Ready`, `Blocked`, `Printed`, `Reprint Needed`, `Deferred MVP`, `Canceled` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `artwork_assets.status` | artwork_assets | `Available`, `Missing`, `Retired` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `product_families.implementation_status` | product_families | `MVP`, `Future`, `Ignored for MVP` | `SKU_and_Internal_ID_Guide.md` |
| `webhook_receipts.outcome` | webhook_receipts | `Processed`, `No-op`, `Failed` | This document (P69). |

Critical indexes:

| Table | Index | Reason |
| :--- | :--- | :--- |
| `orders` | `shopify_order_id` UNIQUE | Idempotent Shopify webhook handling. |
| `offer_skus` | `sku` UNIQUE | SKU lookup on order import. |
| `production_components` | `(status, batch_group)` | Open batch queries. |
| `production_batches` | `(production_group, status)` | Active batch lookup. |
| `batch_items` | `(batch_id, component_id)` UNIQUE | Many-to-many integrity. |
| `artwork_assets` | `(design_id, component_code, family_code)` UNIQUE | Artwork path lookup is family-aware. |
| `order_items` | `shopify_product_id` | Supports deduplication of GRS series metafield lookups within an order. |
| `artwork_revalidation_runs` | `active_lock` UNIQUE | Deterministic single-active-run overlap protection across web and worker processes. |
| `webhook_receipts` | `webhook_delivery_id` UNIQUE | Idempotent handling of the four reconciliation webhooks; duplicate deliveries detected via constraint violation. |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines status enum values. |
| `SKU_and_Internal_ID_Guide.md` | Defines family code dictionary stored in `product_families`. |
| `production_component_rules.yaml` | Seeds `product_families` and `configuration_components` tables. |
| `Product_Image_Transformation_Guidelines.md` | Seeds `print_templates` table. |
| `Technical_Architecture_and_API_Contract.md` | Confirms PostgreSQL as the database engine. |

---

### `docs/02_app_specs/Shopify_Integration_and_Order_Import_Spec.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines Shopify webhook setup, required API fields, deduplication logic, unknown SKU behavior, quantity handling, non-produced item handling, deferred-family (`GRD`) handling, and behavior for canceled or refunded orders. The complete implementation reference for the Shopify-to-app data pipeline.

**Thick Boundaries:**
- **Must Cover:** Webhook trigger configuration, API permission scopes, required order and line item fields, idempotency strategy, deduplication, unknown SKU routing, quantity expansion, non-produced family routing, `GRD` family routing, canceled/refunded order behavior, re-import behavior.
- **Must Consider:** Shopify line items expose the variant SKU field via Admin API. The app should treat the Shopify SKU as authoritative; if the SKU is unknown, route to Needs Attention; if the SKU's family is `GRD`, route to Deferred Items.
- **Explicitly Excludes:** Image specs, batch lifecycle, PPTX generation, packing sheet content.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Webhook Configuration | Subscribed events, endpoint, security. |
| API Permissions | Required Shopify API scopes. |
| Required Fields | Order-level and line-item-level fields. |
| Idempotency and Deduplication | Strategy for safe retries. |
| Order Import Algorithm | Step-by-step ingestion logic. |
| Quantity Handling | Component expansion per quantity. |
| Unknown SKU Handling | Routing and recovery. |
| Non-Produced Family Handling | Packing-sheet-only path. |
| Deferred Family (`GRD`) Handling | Deferred Items queue routing. |
| Canceled and Refunded Orders | MVP behavior (ignore) and post-MVP plan. |
| Re-Import Behavior | Manual or automatic re-import process. |

**Required Hardcoded Content**

Webhook configuration:

| Setting | Value |
| :--- | :--- |
| Subscribed events | `orders/paid`, `orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create` |
| Endpoints | `POST /api/webhooks/shopify/orders-paid/`, `orders-updated/`, `orders-fulfilled/`, `orders-cancelled/`, `refunds-create/` (Django routes) |
| Security | HMAC SHA-256 signature verification using `SHOPIFY_WEBHOOK_SECRET` on all five endpoints |
| Retry policy | Shopify default. `orders/paid` idempotent on `shopify_order_id`. The four reconciliation endpoints idempotent on `X-Shopify-Webhook-Id`. |

Required Shopify API scopes:

- `read_orders`
- `read_products`
- `read_inventory` (for future inventory features)

Required order fields:

| Shopify Field | App Field | Required? |
| :--- | :--- | :--- |
| `id` | `shopify_order_id` | Yes |
| `order_number` | `order_number` | Yes |
| `email` | `customer_email` | Yes |
| `customer.first_name`, `customer.last_name` | `customer_name` | Yes |
| `shipping_address` | `shipping_address` (JSON) | Yes |
| `financial_status` | (verify == "paid") | Yes |
| `fulfillment_status` | (verify == null or "unfulfilled") | Yes |
| `created_at` | `shopify_created_at` | Yes |
| `line_items` | (iterate to create `order_items`) | Yes |

Required line item fields:

| Shopify Field | App Field | Required? |
| :--- | :--- | :--- |
| `id` | `shopify_line_item_id` | Yes |
| `sku` | `sku` | Yes |
| `quantity` | `quantity` | Yes |
| `title` | `product_name` | Yes |
| `variant_title` | `variant_title` | Optional |

Idempotency strategy:

- Use `shopify_order_id` as the idempotency key.
- On duplicate webhook receipt, return 200 OK without creating duplicate records.

Order import algorithm:

1. Verify HMAC signature.
2. Look up `shopify_order_id`. If exists, return 200 OK.
3. Verify `financial_status == "paid"` and `fulfillment_status` is null or `"unfulfilled"`. If not, log and skip.
4. Create `orders` row with status `Queued for Production`.
5. For each line item:
   a. Create `order_items` row.
   b. Parse SKU. If invalid, mark item with `UNKNOWN_SKU` or appropriate validation failure code.
   c. Look up family in `product_families`.
   d. If family `production_required == false` (BAT, HOD, PIL, TAP, TOT): skip component generation; item appears on packing sheet only.
   e. If family is `GRD`: create component records with status `Deferred MVP`; route to Deferred Items queue; no batch assignment.
   f. Otherwise: look up `configuration_components` row for the family + config. Generate one component per row, expanded by line item quantity.
6. For each generated component: assign to the active `Open` batch for its batch group.
7. Trigger validation: missing artwork, missing template checks per component.
8. Commit transaction.

Quantity handling:

- Line item with `quantity = N` generates N copies of each component defined in the decomposition rule.
- Example: order line `ASH-CHARFRIE-ASHGRD` with quantity 3 generates 3 `ASH` components and 3 `GRD` components.

Unknown SKU handling:

- If SKU does not match the canonical SKU pattern: validation failure `INVALID_FORMAT`. Routed to Needs Attention.
- If SKU is well-formed but the config code has no matching row in `configuration_components`: validation failure `UNKNOWN_CONFIG`. Routed to Needs Attention.
- Design codes are auto-created on first import; a well-formed SKU with an unknown design code is never blocked for this reason.
- Other order items in the same order continue processing normally.

Non-produced family handling:

- Families with `production_required == false` (BAT, HOD, PIL, TAP, TOT) create only `order_items` records.
- No `production_components` rows are generated.
- The order appears on the next packing sheet export.
- Order status remains `Queued for Production` until shipping label is generated (Phase 3) or until any produced components in the same order are printed.

Deferred family (`GRD`) handling:

- Components are created with status `Deferred MVP` for traceability.
- They are not assigned to any batch.
- They appear in the Deferred Items section of the Needs Attention screen as expected behavior, not as an error.
- The rest of the order processes normally.

Canceled and refunded orders (per Decision #42, supersedes Decision #13):

- `orders/cancelled` and `refunds/create` are both subscribed and processed. Qualifying orders transition to `Canceled`; unprinted components (`Queued`/`Ready`) are pulled from their `Open` batch.
- Orders that were cancelled or refunded in Shopify before these webhooks went live are reconciled via the one-time `reconcile_shopify_history` command (Decision #43), run manually by the owner.

Re-import behavior:

- Re-import is idempotent: duplicate order items or already-existing production components are not created.
- A nonblank Shopify line-item SKU remains authoritative.
- When the Shopify line-item SKU is blank, re-import may resolve it through one safely linked active canonical `offer_skus` record using the documented Shopify product-title plus ordered option-value linkage.
- A safely resolved canonical SKU is persisted to the order item and normal parsing/component generation resumes; if no safe fallback exists, the item remains `NO_SKU`.
- Re-import does not reset existing component lifecycle states; it fills in only previously missing components that have become resolvable.
- Decision #104 adds bulk re-import of the distinct affected orders after Missing SKU proposal approval. Multiple approved Missing SKU items from one order result in one order re-import.
- Bulk processing preserves per-order independence: one order's failure does not roll back another successful order.
- Re-import changes fulfillment-app records only and does not write product SKUs to Shopify.
- Shopify SKU synchronization remains the separate Human-controlled cumulative full-product CSV workflow from Decision #99.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `End_to_End_Fulfillment_Workflow_SOT.md` | Steps 1-3 of the workflow are implemented per this spec. |
| `SKU_and_Internal_ID_Guide.md` | SKU parser invoked during import. |
| `Production_Component_Decomposition_Rules.md` | Component generation rules invoked during import. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Validation failure codes used here are defined there. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Django endpoint for the webhook. |

---

### `docs/02_app_specs/Packing_Sheet_Export_Spec.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines the combined XLSX packing sheet output: columns, data sources per column, scope rules, sorting, file output naming, and behavior for produced versus non-produced items and deferred `GRD` items.

**Thick Boundaries:**
- **Must Cover:** Complete column list with source field per column, scope rule (combined across production groups, includes non-produced items), sorting and grouping rules, file naming, file output path, generation trigger.
- **Must Consider:** Packing sheet includes all 13 families. `GRD` items appear with a "Deferred not yet produced" note. Non-produced items appear with empty production status fields.
- **Explicitly Excludes:** Image specs, PPTX layout, SKU parsing, batch lifecycle rules.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Output Format | XLSX (single sheet for MVP). |
| Scope Rule | Which orders are included in each export. |
| Column Specification | Per-column source and behavior. |
| Sorting and Grouping | Row order rules. |
| Family-Specific Display | Produced vs non-produced vs `GRD` row variations. |
| File Naming and Path | Generated file naming. |
| Generation Trigger | When the export runs. |

**Required Hardcoded Content**

Output format:

- File type: XLSX
- One worksheet per export named "Packing Sheet"
- MVP: single sheet, no multi-tab structure

Scope rule:

- The packing sheet covers all orders with at least one component in any batch that transitioned to `Locked for Review` or `Printed` in the current export window.
- The export window is defined by the operator at generation time (default: all batches since the last export).
- Orders with only non-produced items are included if they fall in the same window (criteria: order `created_at` is within the export window).

Column specification:

| Column | Source Field | Behavior |
| :--- | :--- | :--- |
| Order Number | `orders.order_number` | One row per order; collapse line items into the Items column. |
| Customer Name | `orders.customer_name` | |
| Sales Channel | `orders.sales_channel` | Default `Shopify`. |
| Email | `orders.customer_email` | |
| Shipping Name | `shipping_address.name` | |
| Shipping Address | `shipping_address` (concatenated) | Street, City, State, Zip, Country. |
| Items Ordered | `order_items` aggregated | Format: `Item Name x N, Item Name x N`. |
| Production Groups | `production_components.batch_group` aggregated | Comma-separated list of unique batch groups for this order. |
| Print Status | `production_components.status` aggregated | "Printed" if all produced components are printed; "Partial" if mixed; "Pending" if none; "Not Applicable" if no produced components. |
| Label Status | TBD requires owner approval (Phase 3) | Empty for MVP. |
| Packed Status | TBD requires owner approval | Empty for MVP unless tracked separately. |
| Tracking Status | TBD requires owner approval (Phase 3) | Empty for MVP. |
| Deferred Items | `production_components` where `status == 'Deferred MVP'` | Lists any `GRD` items for this order. |

Sorting and grouping:

- Primary sort: Order Number ascending.
- One row per order (line items collapsed into the Items column).

Family-specific display:

- Produced items: appear in Items column with quantity; Production Groups column populated.
- Non-produced items (BAT, HOD, PIL, TAP, TOT): appear in Items column; Production Groups shows "Non-Produced"; Print Status shows "Not Applicable".
- `GRD` items: appear in Items column with note "(Deferred not yet produced)"; Production Groups shows "Deferred"; Print Status shows "Not Applicable for MVP".

File naming and path:

- Pattern: `PACKING-SHEET-{YYYYMMDD}-{###}.xlsx`
- Example: `PACKING-SHEET-20260614-001.xlsx`
- Path: `SpicedAnime/packing_sheets/{YYYY-MM-DD}/`

Generation trigger:

- Manual trigger via the Packing Queue screen.
- Operator selects the export window (default: all batches since last export).
- A Celery task generates the file using `openpyxl` and uploads to Google Drive.
- On completion, a Drive shareable URL is returned and stored in `packing_exports`.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Google Drive output path. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the component statuses aggregated in Print Status. |
| `SKU_and_Internal_ID_Guide.md` | Defines the family classification driving family-specific display. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Celery task infrastructure. |

---

### `docs/02_app_specs/Web_App_Screen_Inventory_and_UX_Flow.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines every screen in the MVP web app: name, URL path, primary operator action, visible data, and buttons/actions available on each screen. Provides the coding AI with concrete UI routes and operator workflow sequences.

**Thick Boundaries:**
- **Must Cover:** Complete screen inventory; primary actions per screen; navigation flow; operator action sequences for Generate PPTX, Mark Printed, and Export Packing Sheet; Needs Attention screen structure including separate Deferred Items section.
- **Must Consider:** Desktop-first layout. Next.js + React + TypeScript frontend. Frontend communicates with Django REST API.
- **Explicitly Excludes:** Business rules, database schema, image specs, API endpoint details (those live in `Technical_Architecture_and_API_Contract.md`).

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Screen Inventory | Table of all MVP screens. |
| Per-Screen Detail | One subsection per screen with actions and data. |
| Operator Action Sequences | Generate PPTX, Mark Printed, Export Packing Sheet flows. |
| Navigation Structure | Top-level navigation. |
| Layout Assumptions | Desktop-first viewport. |
| Shared Display Conventions | Shared Status Guide, native navigation-link behavior, status/readiness display, aging, SKU, and pair-grouping conventions. |

**Required Hardcoded Content**

Screen inventory:

| Screen | URL Path | Purpose |
| :--- | :--- | :--- |
| Dashboard | `/` | Overview of active batches, pending items, recent activity. |
| Orders | `/orders` | Search, filter, inspect, and initiate eligible bulk reprints for Shopify orders. |
| Order Detail | `/orders/{id}` | Inspect order production, line items, source/generated files, reprints, and the order-specific lifecycle history. |
| Current Batches | `/batches` | View production batches grouped by production group, including active and historical lifecycle filters. |
| Batch Detail | `/batches/{id}` | Inspect large batch contents, select all or a subset for PPTX generation, preview/generate PPTX, mark printed, and sort/filter components. |
| Needs Attention | `/needs-attention` | Counted queues for Blocked, Missing SKU, Deferred, and read-only Webhook Failures, including individual and bulk Missing SKU recovery. |
| Artwork Library | `/artwork` | View, sort, upload, replace, retire, and revalidate design artwork. Thumbnails render the actual artwork image. |
| SKU Manager | `/sku-manager` | Search the live Shopify catalog, manage/generate canonical SKUs, and export the cumulative full Shopify product CSV. |
| Packing Queue | `/packing` | Trigger packing sheet export and view past exports with explicit export-window handling. |
| Settings | `/settings` | Read-only integration status: Shopify, Google Drive, Celery worker (Decision #38). |
| Audit Log | `/audit-log` | Recent system actions (optional for MVP). |
| Sandbox | `/sandbox` | Checkout up to 7 test orders at once from 14 fixed sandbox SKUs, generate and regenerate PPTX output, and fully reset sandbox data, without affecting real orders or batches (Decisions #47, #58). |
| Event Prints | `/event-prints` | Browse producing products by type and generate a real production-quality print PPTX on demand for conventions and events, with no Shopify order and no batch (Decision #73). |

Per-screen actions:

Per-screen actions are now distributed across Sections 2.1–2.13 of Web_App_Screen_Inventory_and_UX_Flow.md; no single consolidated table exists in the live document to mirror here.

Operator action sequences:

Generate PPTX (all items):

1. Operator navigates to `/batches/{id}` (Batch Detail) for an `Open` batch with no proper subset selected.
2. Operator clicks "Generate PPTX (All Items)".
3. Confirmation modal appears with batch summary.
4. On confirm: batch transitions to `Locked for Review`; new `Open` batch created for the production group; Celery task dispatched.
5. UI shows "Generation in progress".
6. On completion: download link is shown; batch detail refreshes with the generated file URL.

Generate PPTX (selected items):

1. Operator navigates to `/batches/{id}` (Batch Detail) for an `Open` batch and selects a proper subset of components via the row checkboxes (front/back pairs auto-include their sibling).
2. The primary generation action changes to "Generate PPTX (Selected Items)", and the operator clicks it.
3. Confirmation modal appears with the selected-item count.
4. On confirm: the server re-validates every selected component is still `Ready` and batch-resident. If any is stale, the request is rejected with `STALE_SELECTION` and no mutation occurs; the operator sees "Some selected items are no longer available: {list}. Refresh the page and try again."
5. If the selection equals every eligible component in the batch, the request canonicalizes to the all-items flow (Section 3.1).
6. Otherwise: a new `Locked for Review` batch is created holding only the selected components; the original batch remains `Open` with the remainder; Celery task dispatched against the new batch.
7. UI shows "Generation in progress".
8. On completion: download link is shown for the new batch; if generation fails, the selected components are merged back into the original `Open` batch and the failed batch record is deleted.

Mark Printed:

1. Operator views a batch in `Locked for Review` status.
2. After physical printing, operator clicks "Mark Printed".
3. Confirmation modal: "Confirm batch was physically printed?".
4. On confirm: batch transitions to `Printed`; all contained components transition to `Printed`; order promotion check runs; relevant orders may transition to `In Production`.

Export Packing Sheet:

1. Operator navigates to `/packing`.
2. Operator selects export window (default: since last export).
3. Operator clicks "Generate Packing Sheet".
4. Celery task generates XLSX; uploads to Drive.
5. Download link appears in the past exports list.

### 3.4 Checkout and Generate PPTX (Sandbox)

1. Operator navigates to `/sandbox`.
2. Operator sets quantities (0–10 each) against the 14 fixed sandbox SKUs, optionally across up to 7 order groups, and clicks "Checkout". Each order group is created as its own `TEST-` prefixed sandbox order with an auto-assigned sequential order number; components and batch assignment follow the normal flow.
3. Operator selects a sandbox batch and clicks "Generate PPTX".
4. Celery task builds the PPTX and uploads to Drive; the sandbox batch remains `Open` and is not locked.
5. Download link appears on the sandbox batch row. Operator may repeat step 3 an unlimited number of times against the same batch.
6. To start over, operator clicks "Reset sandbox data" on `/sandbox`; every sandbox row is cleared and the operator checks out again from step 2.

Layout assumptions:

- Desktop-first layout. Minimum supported viewport width: **1280px**.
- Mobile responsiveness is deferred to Phase 2 or later. The MVP is not required to render correctly on mobile or tablet viewports.
- The frontend is built with **Next.js + React + TypeScript**. The frontend communicates with the Django REST API backend over HTTPS.
- No in-browser print integration. The PPTX download link opens the file for manual printing by the operator from their browser or file system.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | UI status displays must match the canonical enum strings. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Needs Attention screen displays errors per error type table. |
| `Technical_Architecture_and_API_Contract.md` | Defines the API endpoints each screen calls. |

---

### `docs/02_app_specs/Validation_Errors_Reprints_and_Recovery_SOT.md`

**Approval Status:** Owner approval not required (but error message text may benefit from owner review)

**Source Type:** Derived Spec

**Primary Purpose:**
Defines every error state the app can enter, the user-facing message for each, the recovery action, and reprint behavior. Single source for error semantics across the system.

**Thick Boundaries:**
- **Must Cover:** Complete error type enum with trigger conditions, user-facing messages, recovery actions, blocking behavior; reprint trigger conditions and effects; partial batch printing behavior.
- **Must Consider:** `FAMILY_DEFERRED_MVP` is a non-error state but uses the same routing infrastructure. Errors block individual components, not entire batches, per Decision #10.
- **Explicitly Excludes:** Workflow narrative, SKU format details, database schema.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Error Type Catalog | Full enum with triggers, messages, recovery actions. |
| Missing SKU Recovery Workflow | Individual and bulk `NO_SKU` recovery, proposal approval/rejection, re-import, and Shopify catalog synchronization boundary. |
| Validation Failures vs Operational Errors | Distinction between SKU-level validation and runtime errors. |
| Partial Batch Printing Rule | How errors interact with batch generation. |
| Webhook Failure Surfacing | Read-only webhook-failure queue behavior. |
| Reprint Workflow | Trigger conditions and component/order lifecycle. |
| Deferred Items Handling | Non-error routing for `GRD` family. |

**Required Hardcoded Content**

Error type catalog:

| Code | Trigger | User-Facing Message | Recovery Action | Blocks Batch? |
| :--- | :--- | :--- | :--- | :---: |
| `INVALID_CASE` | SKU contains lowercase. | "SKU '{sku}' contains lowercase letters. SKUs must be uppercase." | Update SKU in Shopify and re-import. | No |
| `INVALID_CHARACTERS` | SKU contains disallowed characters. | "SKU '{sku}' contains disallowed characters." | Update SKU in Shopify and re-import. | No |
| `NO_SKU` | Shopify line item has no SKU and no safely linked accepted canonical SKU can resolve it. | "This item has no SKU. Generate or add a canonical SKU, approve it, then re-import the order." | Resolve individually or through the Missing SKU bulk workflow; approved SKUs may make the app order locally recoverable before manual Shopify CSV synchronization. | No |
| `DUPLICATE_SKU` | SKU already exists in `offer_skus`. | "SKU '{sku}' is duplicated in the catalog." | Resolve duplicate in Shopify; retire one record. | No |
| `UNKNOWN_FAMILY` | Family code not in `product_families`. | "SKU '{sku}' uses unknown family code '{family}'. Add to the SKU dictionary or correct the SKU." | Add family or correct SKU. | No |
| `INVALID_FORMAT` | SKU does not match family-specific pattern. | "SKU '{sku}' does not match the expected format for family '{family}'." | Correct SKU format. | No |
| `UNKNOWN_CONFIG` | Config code not valid for family. | "Config '{config}' is not valid for family '{family}'." | Correct SKU or add config rule. | No |
| `UNKNOWN_OPTION` | Option code (color, flame, size) not in dictionary. | "Option '{option}' is not recognized." | Add option code or correct SKU. | No |
| `NO_COMPONENT_RULE` | No row in `configuration_components` for family + config. | "No decomposition rule exists for '{family}-{config}'. Update decomposition rules." | Update `production_component_rules.yaml` and re-seed. | No |
| `MISSING_ARTWORK` | Expected artwork file not at Drive path. | "Artwork file missing: {expected_path}. Upload to continue." | Upload file to Drive at expected path. | No |
| `MISSING_TEMPLATE` | No `print_templates` row for component. | "Print template not configured for component '{code}'." | Add print template row. | No |
| `FAILED_PPTX_GENERATION` | PPTX generation task failed (full-batch or selected-subset). | "PPTX generation failed for batch {batch_id}. Check logs and retry." | Retry generation from Batch Detail. A failed subset merges back into the Open batch first. | Yes (locks rollback to Open) |
| `STALE_SELECTION` | Selected component(s) no longer `Ready` or no longer in the target batch. | "Some selected items are no longer available: {stale_component_labels}. Refresh the page and try again." | Refresh Batch Detail and re-select. No mutation occurs. | No |
| `FAILED_PACKING_EXPORT` | XLSX generation task failed. | "Packing sheet export failed. Check logs and retry." | Retry export. | No |
| `WEBHOOK_FAILURE` | Any of the five Shopify webhook endpoints failed HMAC verification, was missing a required delivery ID (the four reconciliation endpoints), or raised an unhandled exception. | (Logged only; surfaced read-only on the Needs Attention webhook-failures section.) | Investigate `webhook_receipts` and logs. Retried deliveries under the same delivery ID no-op. | No |
| `DUPLICATE_ORDER` | Same `shopify_order_id` received twice on `orders/paid`. | (Idempotent: returns 200 OK silently.) | None required. | No |
| `FAMILY_DEFERRED_MVP` | SKU family is `GRD`. | "This item's product family is not yet supported. It has been held in Deferred Items." | None required; expected behavior. | No |

Validation failures vs operational errors:

- Validation failures (anything from `INVALID_CASE` through `MISSING_TEMPLATE`) happen at order import or batch validation time. They block individual components, never entire batches.
- Operational errors (`FAILED_PPTX_GENERATION`, `FAILED_PACKING_EXPORT`, `WEBHOOK_FAILURE`, `STALE_SELECTION`) are runtime errors. `FAILED_PPTX_GENERATION` has a batch-level effect: the batch returns to `Open` (or the subset merges back) and the operator can retry. `STALE_SELECTION` and `WEBHOOK_FAILURE` have no batch- or component-level mutation.

Partial batch printing rule:

- A batch may contain a mix of `Ready` and `Blocked` components.
- Generate PPTX includes all `Ready` components.
- `Blocked` components remain in the next `Open` batch for the same group; they do not block the current generation.
- The Needs Attention screen surfaces all `Blocked` components for operator resolution.

Reprint workflow:

- Operator may flag a component from Batch Detail or Order Detail, or use the approved bulk reprint workflow from Orders.
- The component's status transitions to `Reprint Needed`.
- Front/back pairs are flagged together.
- A new component record is created with status `Queued` for each flagged component and assigned to the current `Open` batch.
- The original `Reprint Needed` component remains for traceability.
- On an `In Production` order, flagging a reprint transitions the order to `In Production (Needs Reprint)` (Decision #71).
- When every `Reprint Needed` component on that order reaches `Printed`, the order returns to `In Production`.
- Reprinted components appear on the next packing sheet export with a "Reprint" indicator. TBD requires owner approval for exact display.

Deferred Items handling:

- `FAMILY_DEFERRED_MVP` components appear on the Needs Attention screen in a separate "Deferred Items" section visually distinct from errors.
- The Deferred Items section is informational only; no action is required from the operator.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `SKU_and_Internal_ID_Guide.md` | Defines validation failure codes referenced here. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines component statuses affected by errors and reprints. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Needs Attention screen surfaces these errors and the Deferred Items section. |

---

### `docs/02_app_specs/Security_Access_and_Privacy_Spec.md`

**Approval Status:** Owner approval not required (recommend owner review for PII handling)

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines authentication, Shopify credential handling, Google Drive credential handling, customer PII handling, file access rules, audit log requirements, and the future role-based access model.

**Thick Boundaries:**
- **Must Cover:** MVP auth method, Shopify and Drive credential storage, customer PII fields and retention, file access rules, audit event list, future role table.
- **Must Consider:** MVP is single-user (Josiah). Multi-user roles are deferred but the data model should accommodate them.
- **Explicitly Excludes:** Business rules, image specs, workflow narrative.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Authentication | MVP auth method. |
| Credential Storage | Shopify and Drive credentials. |
| Customer PII Handling | Fields stored, retention, access. |
| File Access Rules | Drive permissions for generated files. |
| Integration Status Endpoint Safety | Field-level safety envelope for `GET /api/settings/integration-status/`, including the enumerated list of values never returned and the regression-test enforcement. |
| Audit Event List | Actions logged. |
| Future Roles (Post-MVP) | Role table. |

**Required Hardcoded Content**

Authentication (MVP):

- Single admin login.
- Django's built-in authentication.
- Owner (Josiah) is the only initial user.
- Password reset via email.

Credential storage:

| Credential | Storage Method | Environment Variable |
| :--- | :--- | :--- |
| Shopify webhook secret | Environment variable, server-side only | `SHOPIFY_WEBHOOK_SECRET` |
| Shopify client-credentials pair (preferred) | Environment variable, server-side only, on both the backend and Celery worker services | `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` |
| Shopify Admin API access token (legacy fallback) | Environment variable, server-side only | `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_API_KEY` |
| Google Drive service account JSON | Environment variable, server-side only | `GOOGLE_DRIVE_CREDENTIALS_JSON` |
| Django secret key | Environment variable | `SECRET_KEY` |
| Database connection string | Environment variable | `DATABASE_URL` |
| Redis URL (Celery broker) | Environment variable | `REDIS_URL` |

Customer PII fields:

| Field | Source | Retention | Operator-Facing Access |
| :--- | :--- | :--- | :--- |
| `orders.customer_name` | Shopify | Indefinite (until owner deletes order) | Required for Packing Queue / packing-sheet output. Not exposed on Orders or Order Detail. |
| `orders.customer_email` | Shopify | Indefinite | Admin only; existing Order Detail access is unchanged. |
| `orders.shipping_address` | Shopify | Indefinite | Admin only; existing Order Detail access is unchanged. |

Customer-name exposure boundary (Decision #94):

- `orders.customer_name` remains stored/imported for Packing Queue output.
- Orders and Order Detail do not display customer name.
- The Orders list API does not expose customer name.
- `GET /api/orders/{id}/` does not return `customer_name`.
- Packing Queue and packing-sheet generation continue using the stored value.
- Existing email and shipping-address behavior is unchanged.

Retention policy:

- MVP: Indefinite retention; owner manages deletion manually.
- Post-MVP: TBD requires owner approval if a formal retention policy is needed.
- Completed packing-sheet XLSX outputs retain their packing-sheet PII for exactly 30 calendar days from successful finalization; the Drive object is deleted before the database row is marked purged.
- Sandbox orders contain synthetic data and remain exempt from packing-sheet export/packing-sheet retention behavior.

File access rules:

- Generated PPTX and XLSX files are stored in the SpicedAnime Google Drive folder.
- Drive folder permissions are managed by the Drive owner (Josiah).
- The app's service account has write access to the SpicedAnime folder tree.
- Public sharing of generated files is disabled by default.

Audit event list:

| Event | Logged Fields |
| :--- | :--- |
| Order imported | `shopify_order_id`, timestamp, source IP |
| Component generated | `component_id`, `order_item_id`, `family`, `config` |
| Batch locked (Generate PPTX) | `batch_id`, user, timestamp |
| Batch printed (Mark Printed) | `batch_id`, user, timestamp |
| Packing sheet exported | `packing_export_id`, user, timestamp |
| Artwork uploaded | `artwork_asset_id`, user, timestamp, file path |
| SKU created or modified | `offer_sku_id`, user, change details |
| Component flagged for reprint | `component_id`, user, timestamp |
| Sandbox data reset | user, timestamp, count of orders/components created |
| Sandbox PPTX regenerated | `batch_id`, user, timestamp |
| Login attempt (success or failure) | user, IP, timestamp |

Future roles (Post-MVP):

| Role | Capabilities |
| :--- | :--- |
| Owner/Admin | Everything. |
| Production Operator | Generate batches, mark printed, view orders. |
| Packaging Operator | View packing queue, export packing sheets, mark packed. |
| Viewer | Read-only access. |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Technical_Architecture_and_API_Contract.md` | Defines the environment variable list. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines Drive credential usage. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines Shopify credential usage. |

---

### `docs/02_app_specs/Technical_Architecture_and_API_Contract.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines the chosen technical stack, complete API endpoint list, background job structure, file generation flow, environment variables, and deployment targets. The single technical reference for backend and frontend implementation.

**Thick Boundaries:**
- **Must Cover:** Confirmed stack with library versions where known; complete API endpoint table; Celery task list; file generation flow end-to-end; environment variable list; environment definitions (local, staging, production).
- **Must Consider:** Frontend (Next.js) and backend (Django) are separate processes; CORS configuration required. Celery requires Redis as broker and result backend.
- **Explicitly Excludes:** Business rules, image transformation parameters, SKU format, database field definitions.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Technical Stack | Confirmed choices per layer. |
| Architecture Overview | Component diagram or prose. |
| API Endpoint Table | Method, path, purpose, request/response shape per implemented endpoint. |
| Approved API Extensions Pending Implementation | Approved capabilities whose final wire contracts must be defined by their implementation passes. |
| Shopify Product CSV Export Contract | Immutable-master, eligibility, exact matching, preservation, fail-closed, and `exported_at` rules for the cumulative full Shopify product CSV. |
| Celery Task List | Background job names and triggers. |
| File Generation Flow | End-to-end from trigger to Drive upload. |
| Environment Variables | Complete list with descriptions. |
| Environment Definitions | Local, staging, production. |
| Deployment Targets | Approved hosting platforms per Decision #28. |

**Required Hardcoded Content**

Technical stack:

| Layer | Choice |
| :--- | :--- |
| Frontend framework | Next.js |
| Frontend language | TypeScript |
| Frontend library | React |
| Frontend-backend communication | REST (JSON) over HTTPS |
| Backend framework | Django |
| Backend API layer | Django REST Framework |
| Database | PostgreSQL |
| Background job worker | Celery |
| Celery broker | Redis |
| Celery result backend | Redis |
| File storage | Google Drive (via `google-api-python-client`) |
| PPTX generation library | `python-pptx` |
| XLSX generation library | `openpyxl` |
| Hosting platform | Railway (backend, PostgreSQL, Redis) + Vercel (frontend) |

Architecture overview:

- Browser (Next.js + React + TypeScript) calls the Django REST API over HTTPS.
- Django processes synchronous requests and dispatches background work to Celery.
- Celery workers consume a Redis-backed task queue. Redis serves as both broker and result backend.
- Celery tasks read from and write to PostgreSQL, and upload files to Google Drive via the Drive API.
- Shopify webhooks POST directly to a dedicated Django endpoint; that endpoint verifies the HMAC signature before any processing occurs.

API endpoint table:

| Method | Path | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/webhooks/shopify/orders-paid/` | Shopify paid order webhook receiver. Unchanged pre-existing behavior; no delivery-ID requirement. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-updated/` | Shopify order-updated reconciliation webhook receiver. Refreshes shipping-address snapshot only. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-fulfilled/` | Shopify order-fulfilled reconciliation webhook receiver. Transitions qualifying orders to `Fulfilled Externally` and runs the same component pull-out as cancellation (Decision #42, Feature C amendment). Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-cancelled/` | Shopify order-cancelled reconciliation webhook receiver. Transitions qualifying orders to `Canceled` and runs cancellation component pull-out. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/refunds-create/` | Shopify refund-created reconciliation webhook receiver (the supported topic; `orders/refunded` does not exist as a Shopify topic). Same transition and pull-out behavior as `orders-cancelled/`. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `GET` | `/api/auth/csrf/` | CSRF token bootstrap for the frontend session flow. Sets the CSRF cookie; returns no secret values. | None |
| `GET` | `/api/auth/session/` | Returns the authentication state of the current session for frontend session checks. | None |
| `GET` | `/api/orders/` | List orders with filters. Defensively filtered to the MVP-visible order-status allowlist, which includes `In Production (Needs Reprint)` (Decision #71); `Being Packaged` and `Shipped` never appear, including via an explicit `?status=` query. | Session |
| `GET` | `/api/orders/{id}/` | Get order detail. The response does not include `customer_name` (Decision #94). | Session |
| `POST` | `/api/orders/{id}/reimport/` | Manually re-import order from Shopify. | Session |
| `GET` | `/api/batches/` | List production batches with the existing filtering contract. When no status restriction is supplied, all eligible batch lifecycle states may be returned; this supports the Current Batches `All` view (Decision #96). | Session |
| `GET` | `/api/batches/{id}/` | Get batch detail. | Session |
| `POST` | `/api/batches/{id}/generate-pptx/` | Trigger PPTX generation. Accepts an optional `component_ids` array in the request body. Absent, `null`, or empty runs the existing full-batch flow. A non-empty proper subset splits the selected (and pair-expanded) components into a new `Locked for Review` batch, leaving the remainder in the original `Open` batch. A subset that equals every eligible component canonicalizes to the full-batch flow. An ineligible selection returns HTTP 409 with `error_code: "STALE_SELECTION"`. | Session |
| `POST` | `/api/batches/{id}/mark-printed/` | Mark batch printed. | Session |
| `POST` | `/api/batches/{id}/preview-pptx/` | Generates a full production-quality PPTX preview of the batch's current contents with no batch/component mutation (Decision #72). Returns a Drive link; the file is not recorded in `generated_files`. Batch must be `Open`. | Session |
| `POST` | `/api/components/{id}/flag-reprint/` | Flag a component for reprint. | Session |
| `POST` | `/api/orders/bulk-flag-reprint/` | Flag reprint for a set of components across one or more orders in a single request. Accepts an array of `component_ids`; each is expanded to include its front/back pair (LITF/LITB, WALF/WALB) if applicable. Uses the same per-component mechanics as `/api/components/{id}/flag-reprint/` and additionally transitions each affected order to `In Production (Needs Reprint)` (Decision #71). | Session |
| `GET` | `/api/needs-attention/` | List Blocked and Deferred items, plus a read-only webhook-failures section (see Webhook Failure Surfacing in `Validation_Errors_Reprints_and_Recovery_SOT.md`). `badge_count` covers only Blocked/Deferred items; webhook failures are reported separately as `webhook_failure_count`. | Session |
| `GET` | `/api/artwork/` | List artwork assets. | Session |
| `POST` | `/api/artwork/upload/` | Upload an artwork file. | Session |
| `POST` | `/api/artwork/{id}/retire/` | Retire an artwork asset. | Session |
| `POST` | `/api/artwork/revalidate/` | Trigger a manual read-only Drive artwork subtree scan and reconciliation run. Dispatches a Celery task and returns its task ID; if a scan is already active, returns the existing task ID with `reused: true` (HTTP 202). Returns HTTP 503 if Google Drive is not configured or Celery is unreachable. | Session |
| `GET` | `/api/artwork/{id}/thumbnail/` | Streams the asset's Drive image bytes through the app's own authenticated session, with `Cache-Control: private, max-age=300`. Returns HTTP 404 if the Drive file is unknown or gone, HTTP 502 on any other Drive operation failure, HTTP 503 if Drive is not configured. Used by the Artwork Library screen's Thumb column. | Session |
| `GET` | `/api/skus/` | List canonical SKUs. Supports optional query params `search` (case-insensitive substring match against SKU and design code) and `is_active` (`true` or `false`). | Session |
| `POST` | `/api/skus/` | Create canonical SKU. `is_active` is optional on create and defaults to `true` when omitted. | Session |
| `PATCH` | `/api/skus/{id}/` | Update canonical SKU fields. | Session |
| `POST` | `/api/skus/{id}/retire/` | Retire a canonical SKU. | Session |
| `GET` | `/api/shopify/catalog/` | Live, read-only listing of the Shopify product catalog (products and variants), each flagged with whether it has a matching `offer_skus` row. Supports optional query params `product_type` and `has_sku` (`true` or `false`). Used by the rebuilt SKU Manager (Decision #69); the app never writes to this endpoint's underlying Shopify data. | Session |
| `POST` | `/api/skus/generate/` | Runs the SKU Auto-Generation Engine (`SKU_and_Internal_ID_Guide.md`) against one or more Shopify products/variants. Returns, per variant, the proposed SKU, design code, and any placeholder/warning flags; for families with more than one possible bundle/config value, returns the full set of possibilities rather than a single guess (Decision #69, Option A). Does not write to `offer_skus`; a separate save action does. | Session |
| `GET` | `/api/skus/export.csv` | Downloads a fresh cumulative full Shopify product CSV. Every currently active canonical SKU is considered on every export regardless of prior `exported_at`; safely matched values are applied only to intended `Variant SKU` cells; retired rows are excluded; non-SKU cells are preserved; unsafe matching/integrity conditions fail closed; Shopify import remains Human-controlled and the app never writes product SKUs directly to Shopify (Decision #99). | Session |
| `POST` | `/api/packing/export/` | Trigger packing sheet export. | Session |
| `GET` | `/api/packing/exports/` | List past exports. | Session |
| `GET` | `/api/dashboard/` | Dashboard summary metrics. | Session |
| `GET` | `/api/tasks/{task_id}/` | Read-only Celery task status polling via `AsyncResult`. Used by the Generate PPTX and packing export flows through the shared `useTaskPolling` frontend hook. | Session |
| `GET` | `/api/audit-log/` | Audit event timeline. Supports optional query params `action` (exact match against the audit action string), `created_at_after` and `created_at_before` (ISO 8601 datetime; invalid values are ignored, never 500), plus the preserved `entity_type` and `entity_id` filters. | Session |
| `GET` | `/api/settings/integration-status/` | Read-only integration health signals for Shopify, Google Drive, and Celery. Returns booleans, ISO timestamps or null, and one safe metadata string (`shopify.api_version`) only. Never returns secret values. | Session |
| `GET` | `/api/event-prints/products/` | Lists producing products/designs browsable by product type, for the Event Prints screen (Decision #73). Sourced from the design-code registry (Decision #68). | Session |
| `POST` | `/api/event-prints/generate/` | Builds a production-quality PPTX from an operator-selected set of designs and quantities, with no Shopify order and no production batch created (Decision #73). Returns a Drive link; the file is not recorded in `generated_files`. | Session |
| `GET` | `/api/sandbox/skus/` | List the 14 fixed sandbox SKUs available for checkout. | Session |
| `POST` | `/api/sandbox/checkout/` | Create up to 7 sandbox orders in one request. Body is a list of up to 7 order groups, each a list of `{sku, quantity}` entries drawn from the 14 fixed sandbox SKUs with quantity capped at 10 per entry. Each order group becomes one new `TEST-` prefixed sandbox order with an auto-assigned sequential order number, flowing through normal component generation and batch assignment (Decision #58). | Session |
| `POST` | `/api/sandbox/reset/` | Fully clear all sandbox rows (`orders`, `production_components`, `production_batches`, `batch_items`). Does not recreate any orders (Decision #58). | Session |
| `GET` | `/api/sandbox/batches/` | List sandbox batches (`is_sandbox = true`) and their components. | Session |
| `POST` | `/api/sandbox/batches/{id}/generate-pptx/` | Regenerate PPTX for a sandbox batch. Unlike `/api/batches/{id}/generate-pptx/`, the batch remains `Open`; no lock transition and no new batch is created (Decision #47). Returns HTTP 404 if the batch is not flagged `is_sandbox`. | Session |

Celery task list:

| Task | Trigger | Purpose |
| :--- | :--- | :--- |
| `generate_pptx_for_batch` | `POST /api/batches/{id}/generate-pptx/`, or `POST /api/sandbox/batches/{id}/generate-pptx/` for sandbox batches | Build PPTX file and upload to Drive. Applies the LITTIN rotation, ASHGRD GRD transform, and BOX-family routing branches during image preprocessing. When triggered against a sandbox batch, the batch-lock step is skipped per Decision #47. |
| `generate_packing_sheet` | `POST /api/packing/export/` | Build XLSX file and upload to Drive. |
| `process_shopify_order` | Shopify webhook receive | Run order import algorithm asynchronously. For GRS-family line items, makes a secondary Shopify Admin API call to `GET /products/{product_id}/metafields.json` to retrieve `custom.series`. Blocks the component with `MISSING_SERIES_METAFIELD` if the metafield is absent or the call fails. |
| `validate_artwork_availability` | Periodic (hourly) | Thin wrapper delegating to the shared `reconcile_artwork_from_drive()` service: runs one paginated read-only scan of the Drive `artwork/` subtree and promotes `Blocked` components with `MISSING_ARTWORK` whose canonical artwork is now present. Does not re-attempt series resolution for `MISSING_SERIES_METAFIELD` components; recovery is via re-import. Artwork-upload recovery calls the same underlying promotion helper directly rather than dispatching this task. |
| `reconcile_artwork` | `POST /api/artwork/revalidate/` | Manual on-demand run of the same shared `reconcile_artwork_from_drive()` service used by the hourly task. Overlap-protected by a database run record (`ArtworkRevalidationRun.active_lock`); a second dispatch while a run is active reuses the existing task ID instead of starting a new scan. |

Management commands:

| Command | Trigger | Purpose |
| :--- | :--- | :--- |
| `reconcile_shopify_history` | Manual, operator-invoked only (`python manage.py reconcile_shopify_history --dry-run` or `--apply`) | One-time historical reconciliation for orders that drifted out of sync with Shopify before the four reconciliation webhooks existed. Read-only in `--dry-run`; re-fetches Shopify and applies transitions in `--apply`. Not a Celery task; not scheduled; not run on deploy or startup. |
| `backfill_fulfilled_externally_pullout` | Manual, operator-invoked only (`python manage.py backfill_fulfilled_externally_pullout --dry-run` or `--apply`) | One-time backfill of the Feature C component pull-out (Decision #42 amendment) for orders already `Fulfilled Externally` before that fix existed. Never contacts Shopify; never changes order status; touches only `production_components`/`batch_items`. Idempotent. Not a Celery task; not scheduled; not run on deploy or startup. |
| `checkout_sandbox_orders` | Manual, operator-invoked, or triggered via `POST /api/sandbox/checkout/` from the Sandbox screen | Creates up to 7 new `is_sandbox = true` test orders from the 14 fixed sandbox SKUs per checkout submission, quantity capped at 10 per SKU per order (Decision #58). Never contacts Shopify. Not idempotent by design: each checkout creates new orders rather than repairing an existing set. Not a Celery task; not scheduled; not run on deploy or startup. |
| `reset_sandbox_data` | Manual, operator-invoked, or triggered via `POST /api/sandbox/reset/` from the Sandbox screen | Fully deletes all `is_sandbox = true` rows across `orders`, `production_components`, `production_batches`, and `batch_items` (Decision #58). Does not recreate any orders. Never contacts Shopify. Not a Celery task; not scheduled; not run on deploy or startup. |
| `reset_locked_batches_p77` | Manual, operator-invoked only (`python manage.py reset_locked_batches_p77 --dry-run` or `--apply`), one-time use | Transitions every batch in `Locked for Review` status (excluding `Printed`) back to `Open` and clears `generated_file_url`, across all production groups, so existing batches regenerate under the Decisions #48–#57 corrected image-transform specs (Decision #59). Read-only in `--dry-run`. Not a Celery task; not scheduled; not run on deploy or startup. |

File generation flow:

1. Operator action triggers a Django endpoint.
2. Endpoint validates the request, updates the database synchronously, and dispatches a Celery task.
3. Endpoint returns immediately with the dispatched task ID.
4. Celery worker picks up the task and constructs the file in memory or a temporary directory.
5. Worker uploads file to Google Drive via service account credentials.
6. Worker updates the `generated_files` row with the Drive shareable URL.
7. Frontend polls for task completion. (Phase 2: replace polling with WebSocket subscription.)

Environment variables:

| Variable | Description |
| :--- | :--- |
| `SHOPIFY_WEBHOOK_SECRET` | HMAC verification secret for Shopify webhooks. Independent of outbound Admin authentication. |
| `SHOPIFY_CLIENT_ID` | Shopify custom app client ID. Paired with `SHOPIFY_CLIENT_SECRET` for client-credentials Admin authentication (preferred). Required on both the Railway backend service and the Celery worker service. |
| `SHOPIFY_CLIENT_SECRET` | Shopify custom app client secret. Paired with `SHOPIFY_CLIENT_ID`. Exchanged for a short-lived OAuth token; never logged, persisted, or exposed via any API response. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Legacy static Shopify Admin API access token. Used only when `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` are not both set. |
| `SHOPIFY_API_KEY` | Legacy Shopify Admin API credential. Fallback only, used when neither the client-credentials pair nor `SHOPIFY_ADMIN_ACCESS_TOKEN` is set. |
| `SHOPIFY_API_VERSION` | Shopify Admin API version string for outbound calls (e.g., `2026-04`). Used to construct the metafields endpoint URL for GRS series resolution. |
| `SHOPIFY_STORE_DOMAIN` | Store domain (e.g., `spicedanime.myshopify.com`). Also used to construct the client-credentials OAuth token endpoint. |
| `GOOGLE_DRIVE_CREDENTIALS_JSON` | Service account JSON key for the Drive API. |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Drive folder ID of the `SpicedAnime/` root. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis connection string (Celery broker and result backend). |
| `PACKING_EXPORT_RETENTION_DAYS` | Approved packing-sheet output retention duration. Defaults to `30`; a configured value must be a positive integer and does not authorize a policy change. |
| `SECRET_KEY` | Django secret key. |
| `DEBUG` | Boolean; must be `false` in production. |
| `ALLOWED_HOSTS` | Comma-separated list of allowed host headers. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins. |

Environment definitions:

| Environment | Purpose |
| :--- | :--- |
| Local | Developer workstation. |
| Staging | Pre-production verification with test Shopify store. |
| Production | Live SpicedAnime store. |

Deployment targets (approved per Decision #28):

| Component | Status | Platform |
| :--- | :--- | :--- |
| Backend (Django + Celery) | Approved Baseline | Railway |
| Frontend (Next.js) | Approved Baseline | Vercel |
| Database (PostgreSQL) | Approved Baseline | Railway managed PostgreSQL |
| Redis | Approved Baseline | Railway managed Redis |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Data_Model_and_Database_Schema.md` | Defines PostgreSQL schema implemented by this stack. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines webhook endpoint behavior. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines Drive integration. |
| `Deployment_and_Operations_Runbook.md` | Operates this architecture. |
| `Security_Access_and_Privacy_Spec.md` | Defines credential handling for env vars. |

---

### `docs/02_app_specs/Frontend_Color_System.md`

**Approval Status:** Owner approval not required

**Source Type:** Implementation Spec

**Primary Purpose:**
Defines every color the web app uses — surface ramp, text ramp, the spice brand accent, the six-tone status palette with its fixed per-tone icon, the aging indicator, and the pair grouping accent — plus the rule for adding a new color in harmony. The single reference a developer consults before choosing any color or status icon, so new and rebuilt screens reuse what already exists rather than introducing one-off hexes.

**Thick Boundaries:**
- **Must Cover:** Every design token and its hex; the six status tones with their tokens, hexes, and fixed icons (Decisions #74, #85); the aging indicator treatment (Decisions #75, #87); the pair grouping accent (Decision #86); contrast targets; the procedure for adding or changing a color.
- **Must Consider:** Dark-only app. WCAG AA (4.5:1) as the contrast target for text and icons on card surfaces. Color that carries meaning is always paired with an icon and a text label, never used alone. Values live as CSS custom properties in `frontend/src/app/ds-tokens/`; components read tokens rather than hard-coding hexes.
- **Explicitly Excludes:** Which status appears on which screen (that is `Web_App_Screen_Inventory_and_UX_Flow.md`); canonical lifecycle enum strings (those are `Order_Status_and_Batch_Lifecycle_SOT.md`); component layout, spacing, and typography; business rules of any kind.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Surfaces | The background ramp and its semantic aliases. |
| Text | The text ramp and its semantic aliases. |
| Lines | Border and divider tokens. |
| Brand accent — Spice | The single action/focus accent and its steps. |
| Status tones | The six tones with token, hex, icon, and meaning; the one-icon-per-tone rule. |
| Aging indicator | Tone, icon, threshold, and the screens it appears on. |
| Grouping accent — Pairs | The violet pair accent and its non-status scope. |
| Adding or changing a color | The reuse-first procedure and harmony criteria. |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Decision_Log_and_Open_Questions.md` | Decisions #74, #75, #85, #86, and #87 are the authority for the palette, the icon standard, the aging treatment, and the grouping accent. |
| `Web_App_Screen_Inventory_and_UX_Flow.md` | Assigns which status vocabulary each screen renders; this document defines how each of those statuses looks. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Owns the canonical status strings this document assigns tones and icons to. A tone or icon assignment never alters a canonical string. |

---

## 03_testing/

### `docs/03_testing/Test_Plan_and_Acceptance_Criteria.md`

**Approval Status:** Owner approval not required

**Source Type:** Test Spec

**Primary Purpose:**
Defines test scenarios and the expected result for each. Provides the coding AI with objective completion criteria for MVP. Each test scenario maps to one or more SOT or Implementation Spec documents.

**Thick Boundaries:**
- **Must Cover:** Test scenarios for every produced family, every non-produced family, the deferred `GRD` family, mixed orders, batch lifecycle actions, error conditions, and packing sheet export.
- **Must Consider:** Test scenarios reference fixture files in `fixtures/` for concrete inputs.
- **Explicitly Excludes:** Business rules, implementation details.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Test Scenario Table | Scenario, fixture, expected outputs, pass condition. |
| MVP Acceptance Criteria | Objective definition of MVP completeness. |

**Required Hardcoded Content**

Test scenario table:

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
| 18 | Lighter single-file placement | Lighter order | LITF, LITB | Lighter batch | PPTX shows two placements of the lighter source artwork for each lighter, with the front directly above the back in the same column per Decision #48. |
| 19 | Wallet single-file placement | Wallet order | WALF, WALB | Wallet batch | PPTX shows two placements of `artwork/Wallet/{DESIGN_CODE}.png` side by side per wallet. |
| 20 | Reprint flag | (any printed component on an `In Production` order) | New component created with status `Queued` | Active Open batch | Original component becomes `Reprint Needed`; replacement appears in the active batch; applicable front/back pair is included; order transitions to `In Production (Needs Reprint)` and returns to `In Production` after all flagged replacements print (Decision #71). |
| 21 | GRS order with `custom.series` metafield set | (TBD GRS fixture) | 1x GRD, 1x JAR, 1x TRY | Grinder/Jar/Tray batch | Components are `Ready`; source paths resolve through the exact metafield series. |
| 22 | GRS order with missing `custom.series` metafield | (TBD GRS fixture without metafield) | 1x GRD, 1x JAR, 1x TRY | Not assigned | Components are `Blocked` with `MISSING_SERIES_METAFIELD`; unrelated items continue. |
| 23 | `orders/updated` webhook received | (TBD changed-address fixture) | No new components | Unchanged | Shipping-address snapshot refreshes; order lifecycle status does not change. |
| 24 | `orders/fulfilled` webhook received, qualifying order | (TBD fixture) | Existing unprinted components pulled out | Removed from Open batch; component status `Canceled` | Order transitions to `Fulfilled Externally`; already-final/non-pullout states remain untouched. |
| 25 | `orders/cancelled` webhook received, qualifying order | (TBD fixture) | Existing unprinted components pulled out | Removed from Open batch; component status `Canceled` | Order transitions to `Canceled`; printed components remain untouched. |
| 26 | `refunds/create` webhook received, qualifying order | (TBD fixture) | Same as cancellation | Same as cancellation | Same transition and pull-out behavior as `orders/cancelled`. |
| 27 | Duplicate reconciliation webhook delivery | Repeated delivery ID | Unchanged | Unchanged | Duplicate returns success/no-op and does not repeat mutations. |
| 28 | Selective PPTX generation, proper subset | Produced fixture with 2+ eligible components | Existing components | New Locked batch + original Open remainder | Exactly one Open batch remains; selected subset moves to new Locked batch. |
| 29 | Selective generation with partial front/back selection | Lighter or Wallet | Pair included | New Locked batch | Selecting one half auto-includes its sibling. |
| 30 | Stale selection on Generate PPTX | Changed batch contents between load/submit | Unchanged | Unchanged | `STALE_SELECTION`; zero mutation. |
| 31 | `reconcile_shopify_history --dry-run` | Drifted order | Unchanged | Unchanged | Proposed changes only; no mutation. |
| 32 | `reconcile_shopify_history --apply` | Same as 31 | Matching live-webhook behavior | Matching live-webhook behavior | Applies equivalent reconciliation; terminal orders untouched. |
| 33 | `backfill_fulfilled_externally_pullout --apply` | Pre-fix fulfilled order | Unprinted components pulled out | Removed; status `Canceled` | Order status unchanged; second run no-op. |
| 34 | Customer-name exposure restriction | Normal PII order | N/A | N/A | Orders/Order Detail omit customer name and Order Detail API omits `customer_name`; Packing Queue still receives stored name. |
| 35 | Dashboard Active Batches and bounded panels | Large dashboard datasets | N/A | N/A | Active Batches hierarchy, 30-item Needs Attention bound, 25-event activity bound, fixed panel headers. |
| 36 | Current Batches `All` filter | All four batch states | N/A | All four lifecycle states | `All` shows Open, Locked for Review, Printed, Archived in grouped format. |
| 37 | Needs Attention counted queue switcher | Four queue data types | N/A | N/A | Blocked, Missing SKU, Deferred, Webhook Failures switch independently; webhook failures read-only. |
| 38 | Order Detail summary hierarchy | Normal order | Existing | Existing | Status, Order Date, Items, Production Components summary; no Customer/Sales Channel; null fulfillment displays Unfulfilled. |
| 39 | SKU Manager product-name and canonical-SKU search | Known catalog values | N/A | N/A | Case-insensitive substring search works by name and canonical SKU and combines with existing filters. |
| 40 | Full Shopify product CSV export | Full master + active canonical SKUs | N/A | N/A | Complete master returned with active canonical SKUs applied; retired excluded; no direct Shopify write. |
| 41 | Repeated cumulative Shopify export | Previously exported active SKUs + new SKU | N/A | N/A | Prior active SKUs remain on repeat export; new SKU joins them; first-success timestamps preserved. |
| 42 | Shopify CSV non-SKU preservation | Complex full master | N/A | N/A | Only intended Variant SKU cells differ; all other parsed cells/order/structure unchanged. |
| 43 | Shopify CSV fail-closed conditions | Missing/ambiguous/conflicting/malformed/integrity cases | N/A | N/A | No partial file or timestamp mutation on failure. |
| 44 | Artwork Library Design sorting | Multipage artwork data | N/A | N/A | Full matching result set sorts A–Z/Z–A before pagination. |
| 45 | Artwork Library Updated sorting | Multipage artwork timestamps | N/A | N/A | Full matching result set sorts newest/oldest before pagination. |
| 46 | Batch Detail large-table behavior | 200+ row batch | Existing | Existing | Sticky header, virtualization, stable selection, contextual All/Selected generation. |
| 47 | Order Detail direct files | Order with artwork/generated outputs | Existing | Existing | Known source/generated files available directly in Files and reprints. |
| 48 | Order Detail aggregated history | Related order/component/batch events | Existing | Existing | One most-recent-first order-specific timeline covers all relevant events. |
| 49 | Bulk Missing SKU proposal review | Multiple `NO_SKU` items | Missing until recovery | None | Bulk generation and one-page approve/reject review; rejected proposals not persisted. |
| 50 | Bulk Missing SKU order re-import | Approved proposals across orders | Newly resolvable components | Normal batches | Distinct orders processed once; idempotent; per-order failures independent. |
| 51 | Orders hierarchy and quick dates | Mixed order states | N/A | N/A | Approved columns, Attention behavior, Order # hierarchy, quick dates, compact filters. |
| 52 | Orders inline reprint/current-page selection | Eligible/ineligible orders | Replacement components on action | Active Open batches | Inline accordion; hide impossible Select items; current-page select-all; order-number-only navigation. |
| 53 | Packing Queue presentation cleanup | >30-day range + export history | N/A | N/A | Exact approved 30-day message; no redundant export-name/date-range duplication. |
| 54 | Status Guide and native link semantics | Applicable screens/navigation | N/A | N/A | Status Guide closed by default; navigation supports middle/modifier/new-tab behavior; mutation controls remain buttons. |

MVP acceptance criteria:

- All 54 test scenarios pass.
- The MVP success definition in `MVP_Scope_and_Roadmap.md` is met.
- An owner-approved scenario covering remaining implementation is not considered passing until the corresponding implementation exists and satisfies its pass condition.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Sample_Data_and_Fixtures.md` | Describes fixture files referenced here. |
| All SOT documents | Test scenarios validate SOT behavior. |

---

### `docs/03_testing/Sample_Data_and_Fixtures.md`

**Approval Status:** Owner approval not required

**Source Type:** Test Spec

**Primary Purpose:**
Index of every fixture file in `fixtures/`. Describes what each fixture tests, what scenario it covers, and which SOT document section it validates.

**Thick Boundaries:**
- **Must Cover:** File-by-file description of each fixture; scenario coverage; SOT validation target.
- **Must Consider:** Fixtures must use the canonical SKU dictionary (not legacy formats).
- **Explicitly Excludes:** Actual JSON/CSV content (that lives in the fixture files themselves).

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Fixture File Index | Table listing each fixture and its purpose. |
| Schema Notes | Brief note on Shopify webhook payload shape for JSON fixtures. |
| Usage in Tests | How fixtures are loaded by the test suite. |

**Required Hardcoded Content**

Fixture file index:

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

Schema notes:

- JSON fixtures follow the Shopify Admin API order payload shape.
- Each fixture must include `financial_status: "paid"` and `fulfillment_status: null` to pass the import guard.
- Each fixture must include at least one valid `shipping_address`.

Usage in tests:

- Backend tests load JSON fixtures, POST them to the webhook endpoint with a valid HMAC signature, then assert against the expected CSV outputs.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenarios reference these fixtures. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Webhook payload shape source. |

---

### `docs/03_testing/fixtures/shopify_order_single_ashtray.json`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Realistic Shopify webhook payload for a single ashtray order. Smallest valid input case.

**Thick Boundaries:**
- **Must Cover:** Valid Shopify order shape; paid + unfulfilled status; one line item with `ASH-CHARFRIE-SOLO` SKU; quantity 1.
- **Must Consider:** Customer name and shipping address are required.
- **Explicitly Excludes:** Multiple line items, non-produced items, bundles.

**Required Hardcoded Content**

JSON schema must include at minimum:

```json
{
  "id": <Shopify order ID>,
  "order_number": <int>,
  "email": "<email>",
  "financial_status": "paid",
  "fulfillment_status": null,
  "created_at": "<ISO 8601>",
  "customer": { "first_name": "<>", "last_name": "<>" },
  "shipping_address": { "name": "<>", "address1": "<>", "city": "<>", "province": "<>", "zip": "<>", "country": "<>" },
  "line_items": [
    { "id": <int>, "sku": "ASH-CHARFRIE-SOLO", "quantity": 1, "title": "Charizard & Friends Ashtray", "variant_title": "Ashtray only" }
  ]
}
```

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenario 1. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Payload conforms to required fields. |

---

### `docs/03_testing/fixtures/shopify_order_lighter_tin.json`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Lighter + tin bundle to validate `LIT-...-LITTIN` decomposition into LITF, LITB, and TIN components, including the same-source-file rule for lighter front and back.

**Required Hardcoded Content**

Must include:

- `line_items[0].sku == "LIT-DESNAM-SIL-TOR-LITTIN"`
- Quantity 1
- Same payload shape as fixture 1

Expected component output:

- 1x LITF, source file `artwork/DESNAM/LIT.png`
- 1x LITB, source file `artwork/DESNAM/LIT.png`
- 1x TIN, source file `artwork/DESNAM/TIN.png`

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenario 3, 18. |

---

### `docs/03_testing/fixtures/shopify_order_stashbox_set.json`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Maximum-complexity bundle (BOX4 config) generating 5 components across 3 batch groups.

**Required Hardcoded Content**

Must include:

- `line_items[0].sku == "BOX-DESNAM-BOX4"`
- Quantity 1

Expected component output:

- 1x BOX, 1x LITF, 1x LITB, 1x GRD, 1x JAR
- LITF and LITB both reference `artwork/DESNAM/LIT.png`

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenario 4. |

---

### `docs/03_testing/fixtures/shopify_order_mixed_products.json`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Order containing both produced and non-produced items to validate mixed-order behavior.

**Required Hardcoded Content**

Must include at least:

- One produced SKU (e.g., `LIT-DESNAM-SIL-TOR-SOLO`)
- One non-produced SKU (e.g., `TAP-AKIRA-LRG-NONE`)

Expected output:

- Produced components generated for the lighter.
- No components generated for the tapestry.
- Order appears on packing sheet with both items listed.
- Order remains `Queued for Production` until the lighter batch is printed.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenarios 5, 13, 14. |

---

### `docs/03_testing/fixtures/shopify_order_non_produced_only.json`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Order containing only non-produced items.

**Required Hardcoded Content**

Must include at least one line item with a non-produced family code (BAT, HOD, PIL, TAP, or TOT) and `-NONE` config.

Example: `line_items[0].sku == "HOD-NARUTO-XL-BLK-NONE"`

Expected output:

- No production components generated.
- Order appears on packing sheet.
- Order status remains `Queued for Production`.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Scenario 6. |

---

### `docs/03_testing/fixtures/expected_components.csv`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Tabular expected output of the component generation step for each fixture order. Used by the test suite to assert correctness.

**Required Hardcoded Content**

CSV columns:

| Column | Type | Notes |
| :--- | :--- | :--- |
| `fixture_file` | string | Source fixture filename. |
| `sku` | string | SKU that generated this component. |
| `component_code` | string | Generated component code (ASH, LITF, LITB, etc.). |
| `quantity` | integer | Number of this component generated. |
| `batch_group` | string | Routed batch group. |
| `artwork_file` | string | Expected source artwork path. |
| `status` | string | Expected initial status (`Queued`, `Ready`, `Blocked`, `Deferred MVP`). |

Must include rows for every fixture. Lighter rows must show LITF and LITB both pointing to the same `LIT.png` file.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | Assertions reference this file. |

---

### `docs/03_testing/fixtures/expected_batch_assignments.csv`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Expected batch group assignment per component code.

**Required Hardcoded Content**

CSV columns:

| Column | Type |
| :--- | :--- |
| `component_code` | string |
| `batch_group` | string |

Required rows:

| component_code | batch_group |
| :--- | :--- |
| `ASH` | Ashtray |
| `GRD` | Grinder/Jar/Tray |
| `JAR` | Grinder/Jar/Tray |
| `TRY` | Grinder/Jar/Tray |
| `LITF` | Lighter |
| `LITB` | Lighter |
| `TIN` | Tin |
| `BOX` | Box |
| `WALF` | Wallet |
| `WALB` | Wallet |

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Source of truth for these assignments. |

---

### `docs/03_testing/fixtures/expected_packing_sheet_rows.csv`

**Approval Status:** Owner approval not required

**Source Type:** Test Fixture

**Primary Purpose:**
Expected packing sheet rows for the mixed-order fixture.

**Required Hardcoded Content**

CSV columns must mirror the column spec in `Packing_Sheet_Export_Spec.md`:

| Column |
| :--- |
| `order_number` |
| `customer_name` |
| `sales_channel` |
| `email` |
| `shipping_name` |
| `shipping_address` |
| `items_ordered` |
| `production_groups` |
| `print_status` |
| `label_status` |
| `packed_status` |
| `tracking_status` |
| `deferred_items` |

Must include rows from `shopify_order_mixed_products.json` showing both produced and non-produced items in the `items_ordered` column.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Packing_Sheet_Export_Spec.md` | Column spec source. |

---

## 04_operations/

### `docs/04_operations/Deployment_and_Operations_Runbook.md`

**Approval Status:** Owner approval not required

**Source Type:** Operations Runbook

**Primary Purpose:**
Defines how to set up local, staging, and production environments. Includes Django, Next.js, PostgreSQL, Redis, Celery, and Google Drive setup steps. Includes safe deployment, backup, and recovery procedures.

**Thick Boundaries:**
- **Must Cover:** Environment setup commands, env var checklist, database migration steps, Shopify webhook registration, Google Drive setup, Celery worker startup, deployment process, backup procedure, log inspection.
- **Must Consider:** Stack-specific commands for Next.js (`npm install`, `npm run dev`, `npm run build`) and Django (`python manage.py migrate`, `python manage.py runserver`); Celery (`celery -A <project> worker`).
- **Explicitly Excludes:** Business rules, image specs, any SOT content.

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| Local Development Setup | Step-by-step setup on Apple Silicon. |
| Staging Environment Setup | Pre-production verification environment. |
| Production Environment Setup | Live deployment. |
| Environment Variables Checklist | Per `Technical_Architecture_and_API_Contract.md`. |
| Database Migration | Django migration commands. |
| Shopify Webhook Registration | API or admin steps. |
| Google Drive Setup | Service account creation, folder structure, permissions. |
| Celery Worker Setup | Starting and supervising Celery + Redis. |
| Deployment Process | Safe deploy steps with rollback. |
| Backup Procedure | Database and Drive backup. |
| Log Inspection | How to find and read application logs. |

**Required Hardcoded Content**

Local development setup (Apple Silicon M3, macOS, pyenv-managed Python 3.12.8):

```text
# Backend
cd backend
pyenv local 3.12.8
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_product_families  # custom command to load YAML
python manage.py runserver

# Background worker (separate terminal)
celery -A spicedanime worker -l info

# Frontend (separate terminal)
cd frontend
nvm use 26
npm install
npm run dev
```

Database migration:

```text
python manage.py makemigrations
python manage.py migrate
python manage.py seed_product_families
python manage.py seed_configuration_components
python manage.py seed_print_templates
```

Shopify webhook registration:

- Via Shopify Admin: Settings -> Notifications -> Webhooks.
- Event: `Order paid`.
- Format: JSON.
- URL: `https://<production-domain>/api/webhooks/shopify/orders-paid/`.

Google Drive setup:

1. Create a Google Cloud project.
2. Enable Google Drive API.
3. Create a service account with `https://www.googleapis.com/auth/drive` scope.
4. Generate and download a JSON key.
5. Create the `SpicedAnime/` root folder in Drive.
6. Share the folder with the service account email (Editor access).
7. Note the folder ID and set as `GOOGLE_DRIVE_ROOT_FOLDER_ID`.
8. Store the JSON key contents in `GOOGLE_DRIVE_CREDENTIALS_JSON`.

Celery worker setup (development):

```text
celery -A spicedanime worker -l info
celery -A spicedanime beat -l info  # if periodic tasks are added
```

Celery worker setup (production):

- The Celery worker runs as a dedicated Railway service with the start command `celery -A spicedanime worker -l info`.
- Railway provides auto-restart on crash and log capture by default.
- Redeploy the worker after every backend deploy to load updated task definitions; Railway does this automatically on push to backend `main`.

Deployment process:

- `git push`-driven. Railway redeploys backend + Celery worker on push to `main`; Vercel redeploys the frontend on push to `main`.
- Pre-deploy: migrations committed; Railway/Vercel env vars match `Technical_Architecture_and_API_Contract.md`; local tests pass.
- Post-deploy: Railway backend health check 200; Vercel status `Ready`; test Shopify webhook returns 200; confirm Celery activity in Railway logs.
- Rollback: Railway deployment rollback (backend/worker) or Vercel instant rollback (frontend); for schema regressions `git revert` the migration and re-run the migration sequence.

Backup procedure:

- Database: nightly `pg_dump` to encrypted storage. Retention 30 days.
- Drive: native Drive version history serves as primary backup. TBD requires owner approval if additional backup is needed.

Log inspection:

- Django logs: standard output captured by hosting platform.
- Celery logs: standard output captured by hosting platform.
- Failed task inspection: `celery -A spicedanime events` or platform-native task viewer.

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `Technical_Architecture_and_API_Contract.md` | Defines the stack this runbook operates. |
| `Security_Access_and_Privacy_Spec.md` | Defines credential handling referenced in env var checklist. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Drive folder structure created during setup. |

---

# End of Document
