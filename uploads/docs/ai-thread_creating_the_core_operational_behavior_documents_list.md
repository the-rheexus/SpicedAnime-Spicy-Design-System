> From: https://claude.ai/chat/723ff72b-1ff8-4570-826a-cb78caee7abb

# you asked

message time: 2026-06-14 12:06:23

Prompt 1 — Conversation Ingestion and System Reconstruction
I am starting the Specification Phase for a fulfillment web app project. I want you to begin from the raw ChatGPT project conversation threads, not from any prior Core Operational Behavior Document List.
The attached files are conversation threads from the Exploration Phase. During that phase, we performed technical discovery, operational workflow auditing, feasibility analysis, and mapped how orders move from digital checkout into physical product substrates.
Your task in this first step is NOT to create the final document list yet.
Read the attached conversation threads and reconstruct the project from scratch.
Please produce:

1. A concise summary of what the web app is intended to do.
2. The full end-to-end operational workflow as understood from the conversations.
3. The major system domains involved, such as Shopify intake, SKU parsing, artwork mapping, production components, batching, print layout generation, packing sheets, status tracking, exceptions, and operator actions.
4. The key business rules that appear to be settled.
5. The areas where the conversations show uncertainty, contradiction, missing details, or unresolved decisions.
6. A list of assumptions you are making, clearly labeled as assumptions.
Important constraints:

* Do not invent missing rules.
* Do not rely on a prior final draft.
* Do not create the Core Operational Behavior Documents List yet.
* Do not merge anything yet.
* Treat the conversation threads as the primary source material.
* Separate confirmed rules from inferred rules.
* Flag anything that must be owner-approved before build.
Before proceeding to the next step, confirm whether you believe you understand the intended system well enough to design the documentation architecture.

---

# claude response

These are `.md` files, so I'll check size and read them directly.

379KB total. These are large. I'll read each in full since I need comprehensive understanding for the reconstruction task.

I now have a complete picture from all four files. The fourth file is a partial duplicate of content already seen in the first three — it's an earlier ChatGPT thread that branched before the decisions were resolved. All material is accounted for. Here is the full reconstruction.

---

## 1. What the web app is intended to do

SpicedAnime is an anime-themed Shopify storefront that sells handmade and customized physical products (lighters, grinders, wallets, ashtrays, tin cases, stash boxes, and non-produced items like tapestries and hoodies). The client, Josiah, currently handles production manually: he receives orders, manually pulls product artwork images, places them into a Word/PowerPoint document, prints and cuts the sheet, applies the printed image to the physical product, then packages and ships.

The web app is a **fulfillment operations system** that automates this process. It receives paid Shopify orders, maps them to the correct artwork files via a SKU system, groups print jobs by product type into production batches, generates a PPTX print file per batch, allows Josiah to confirm printing, and generates a combined packing/Excel sheet for packaging. It is a desktop-first web app with a cloud backend, always-on Shopify integration, and a stateful database. It is not a document tool.

---

## 2. Full end-to-end operational workflow

**Step 1 — Order ingestion.** A customer places and pays a Shopify order. The app receives this via Shopify webhook (trigger: paid + initially unfulfilled). A master order record is created with status `Queued for Production`.

**Step 2 — Order item decomposition.** Each Shopify line item is extracted. One line item can produce 1–4 internal print components depending on what was purchased (e.g., a stashbox set SKU produces components for a box, lighter front, lighter back, grinder, and jar).

**Step 3 — SKU parsing.** The app parses the Shopify variant SKU using product-family-specific rules. The SKU format is `<FAMILY>-<DESIGN>-<OPTIONS>-<CONFIG>`. The parser resolves the product family, design code, variant options (color, flame type), and the bundle/configuration code.

**Step 4 — Component generation.** The app looks up the config code in a `configuration_components` table to determine which production components must be created. Each component is an internal printable unit.

**Step 5 — Artwork lookup.** For each component, the app looks up the artwork file using the path pattern `artwork/{DESIGN_CODE}/{COMPONENT_CODE}.png` in cloud storage.

**Step 6 — Validation.** The app checks for: valid SKU, known design code, valid config, existing artwork file, and existing print template. Failed checks move items to a "Needs Attention" error queue without blocking valid items.

**Step 7 — Batch assignment.** Each component is routed to its production group's active/open batch. Production groups are separate per component type: Grinder/Jar/Tray, Lighter, Ashtray, Tin, Box, Wallet.

**Step 8 — Live batch accumulation.** Orders continue entering open batches over days or weeks. There is one active open batch per production group at any time.

**Step 9 — PPTX generation.** When Josiah is ready to print, he clicks "Generate PPTX" for a specific production group's batch. The app applies product-specific image transformations (brightness, contrast, saturation, crop shape, border, size) and lays out images onto slides using per-product page capacity rules. The batch transitions to `Locked for Review`. A new open batch is immediately created for that production group so incoming orders are not delayed.

**Step 10 — Physical print.** Josiah downloads and prints the PPTX manually from his browser. No silent/automatic print integration in MVP.

**Step 11 — Mark Printed.** After printing, Josiah clicks "Mark Printed." This atomically: marks the batch `Printed`, marks all included components as `Printed`, updates relevant order statuses to `In Production` (only for orders where all required produced components are now printed), archives generated files, and routes future orders to the new open batch.

**Step 12 — Packing sheet generation.** The app generates or exports a combined XLSX packing sheet covering all orders with components in the current print cycle. This sheet includes both produced and non-produced items (tapestries, hoodies, etc.) because one customer order may contain both.

**Step 13 — Post-print status progression.** Order statuses advance: `In Production` → `Being Packaged` (when label is generated) → `Shipped` (when carrier scans). The shipping/label step is deferred to a later phase.

---

## 3. Major system domains

**Shopify intake** — webhook receiver for paid/unfulfilled orders; field extraction; idempotency/deduplication; re-import behavior.

**SKU parsing** — product-family-specific parser; SKU alias support for legacy codes; validation with specific failure codes (UNKNOWN_FAMILY, MISSING_ARTWORK, etc.).

**Artwork mapping** — design code → component → cloud file path lookup; missing artwork detection; artwork library management UI.

**Production components** — internal printable units generated from SKU decomposition; separate from order items; linked to designs, templates, and batches.

**Production batches** — one active open batch per production group; batch lifecycle state machine (Open → Locked for Review → Printed → Archived); atomic batch close operation; batch naming with date ranges.

**Print layout generation** — PPTX output; product-specific image transformations (brightness, contrast, saturation, crop shape, border color, rotation, size, flip); per-product page capacity grids; rounded rectangle fills for lighters/tins; circle crops for grinders/jars/ashtrays.

**Packing sheet** — combined XLSX across all production groups; includes non-produced items; customer name, order number, sales channel, items, addresses, print/label/packed status columns.

**Status tracking** — order-level and component-level statuses; mixed-order status logic (order only advances to In Production when all required produced components are printed).

**Error dashboard / Needs Attention** — missing SKU, invalid SKU, missing artwork, missing template, missing component rule, partial batch with blocked items.

**Operator actions** — generate PPTX, mark printed, export packing sheet, upload artwork, map unknown SKUs, manage batch history.

---

## 4. Key business rules that appear to be settled

These were explicitly confirmed by Josiah in the conversations:

- Trigger: Shopify order is **paid and initially unfulfilled**.
- Initial order status: `Queued for Production`.
- Post-print order status: `In Production`.
- Batch approach: **separate active batches per production group**, not one combined batch.
- Print output format: **PPTX** for MVP (PDF deferred).
- Batch locking: clicking "Generate PPTX" locks the batch immediately; new orders go to a new open batch.
- Batch timing: **manual close/open** with automatic date range labels; no fixed weekly schedule.
- Packing sheet scope: **combined across all production groups**, including non-produced items.
- Partial batch printing: **allowed** — errors in some items do not block printing of valid items; the UI separates printable vs blocked items.
- No labels or order numbers on print sheets.
- Page size: 8.5" × 11", portrait, PowerPoint default margins.
- Canceled/refunded orders before print: **ignored for MVP**.
- Fulfillment status chain: `Queued for Production` → `In Production` → `Being Packaged` → `Shipped`.
- Mixed-order status logic: an order with a lighter and grinder stays `Queued for Production` until both the lighter batch and grinder batch are printed.
- Non-produced items (tapestries, hoodies, tote bags, pillow cases): appear on the packing sheet but do not generate print components.
- Artwork location: currently local; MVP recommendation is Google Drive staging with eventual migration to S3/R2/Supabase object storage.
- SKU format: `<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>` with three-letter family codes, replacing the original one-letter codes.
- Design codes: human-readable 4–10 character abbreviations; immutable internal design IDs (`D000001`) stored in the database.
- Artwork file path convention: `artwork/{DESIGN_CODE}/{COMPONENT_CODE}.png`.
- Front/back components (lighters, wallets): even if the same source image is used, separate component records are kept for layout placement purposes.

**Confirmed print template specs (fully settled):**

| Product | Shape | Size | Border | Adjustments | Per page |
|---|---|---|---|---|---|
| Grinder | Circle crop | 2.35" diameter | `#F2F2F2` | — | 12 |
| Jar | Circle crop | 2.55" diameter | `#FBE3D6` | 55% sharpness | 12 |
| Tray | Rectangle | 5.7" H × 4.05" W | — | — | TBD |
| Lighter | Rounded rect | 2.22" H × 1.42" W | `#FBE3D6` (white/gold), `#F2F2F2` (silver) | -15% brightness, +25% contrast, 200% saturation | 10 lighters (20 images) |
| Ashtray | Circle crop | 3.4" diameter | `#F2F2F2` | -25% brightness, +35% contrast, 300% saturation, flip horizontal | TBD |
| Tin | Rounded rect | 2.35" H × 3.75" W | `#FBE3D6` (white/gold), `#F2F2F2` (silver) | -15% brightness, +25% contrast, 250% saturation | 8 |
| Box | Rectangle | 4.1" H × 6" W | — | 35% sharpness, 130% saturation, -15% brightness | 2 |
| Wallet | Rectangle | 2.2" H × 2.5" W | `#FBE3D6` | 35% sharpness, -10% brightness, +20% contrast, 150% saturation | 4 wallets (8 images) |

---

## 5. Unresolved decisions, contradictions, and missing details

**Still unresolved as of the last conversation message:**

- **Tray page capacity.** The tray size (5.7" H × 4.05" W) is confirmed but the number of trays per page was never specified. This blocks the tray layout template.
- **Ashtray page capacity.** Same situation — size is confirmed, count per page is not.
- **Lighter and wallet front/back — same source file or separate files?** If they use the same source image, file naming stays simpler (`LITF.png` and `LITB.png` both point to the same file). If separate files are required, the artwork upload process and naming convention changes. This was flagged repeatedly but never resolved.
- **Exact SKU code dictionary.** The full dictionary of design codes, color codes, flame codes, config codes, and size codes was proposed but never formally approved by Josiah. The conversations show a recommended system but note it requires owner verification before implementation.
- **Artwork filename convention finalized?** The path pattern `artwork/{DESIGN_CODE}/{COMPONENT_CODE}.png` was proposed but whether Josiah has agreed to rename his existing local files to this convention is not confirmed.
- **How non-produced items are categorized in the SKU system.** The recommended `-NONE` config suffix was proposed but not confirmed by Josiah.
- **Whether PPTX should also auto-export PDF.** Deferred but not decided.
- **Exact Shopify API permissions and webhook subscription details.** Never specified — only the trigger event was confirmed.
- **Cloud storage provider.** Google Drive for staging was recommended for MVP; S3/R2/Supabase for production. No final selection confirmed.
- **Technical architecture choices.** Frontend framework, backend framework, database engine, and job worker were never specified. These are mentioned as a gap in the final document list review.
- **Whether the two existing documents (Product Image Transformation Guidelines.md and SKU and Internal ID Guide.md) have been approved by Josiah.** Both are marked "requires approval from store owner" or "pending owner verification" in their status fields.

**Contradictions or ambiguities in the source material:**

- The order status "Currently in Production" and "In Production" are used interchangeably across conversation turns. The conversations settled on `In Production` but the inconsistency exists in the source.
- The fourth file (`branch_platform_reccomendation_for_workflow.md`) is an earlier branch of the conversation that predates the resolution of the major gaps. It shows the same workflow walkthrough but without the decisions that were later confirmed. It does not add new information but confirms the decision thread happened in a separate ChatGPT branch.

---

## 6. Assumptions I am making (labeled as assumptions)

**Assumption A:** The three main conversation threads (files 1, 2, and 3) are three parallel ChatGPT threads working through the same project. Files 1 and 2 appear to be near-identical threads and files 3 and 4 are a subset/branch. The confirmed decisions that appear in all threads are treated as settled.

**Assumption B:** The "decisions document" that Josiah uploaded at `2026-06-11 21:10:35` containing the answers to the remaining gaps was read and incorporated by ChatGPT but its raw content is not in these conversation exports. I am relying on ChatGPT's incorporation of that document as accurate.

**Assumption C:** The existing documents `Product Image Transformation Guidelines.md` and `SKU and Internal ID Guide.md` are complete and accurate — their full content appears in the conversation threads as the ChatGPT-generated markdown. They are confirmed in scope but pending Josiah's approval signature.

**Assumption D:** Josiah has thousands of existing Shopify products without SKUs currently. The SKU migration must happen before the app can function. The timeline for this migration is not specified and I am not assuming it is complete.

**Assumption E:** The single operator (Josiah) handles production, printing, packaging, and shipping personally or with a very small team. Multi-role or multi-user access is deferred.

**Assumption F:** The project is pro bono, which influenced the recommendation to use Google Drive for MVP artwork staging rather than immediately committing to paid cloud storage.

---

## Confidence assessment and pre-condition for proceeding

I understand the system well enough to design the documentation architecture, with one important caveat: **the approved document list and the canonical doc folder structure were the explicit output of the final conversation turn**, and that list is well-defined. What is not yet available is the actual content of the two approved documents (they exist as markdown in the conversation threads but are not yet owner-verified), and several spec-level decisions (tray/ashtray page capacity, front/back file convention, technical stack choices) remain open.

Before you ask me to produce any spec documents, I need to confirm:

1. Are the image transformation specs (the full PPTX template parameters) considered owner-approved and final, or still pending Josiah's sign-off?
2. Do you want me to flag unresolved items inline within each document as I produce them, or should I produce a separate Decision Log first?

Once you confirm those two points, I can proceed directly to the documentation architecture and begin producing the spec set in the priority order the conversations established.

---

# you asked

message time: 2026-06-14 12:10:57

[text/markdown] Product Image Transformation Guidelines.md

[text/markdown] field-by-field_yaml_header_guide.md

[text/markdown] field_by_field_yaml_header_guide.md.md

Prompt 2 — Specification Architecture Design
Based only on the reconstructed system understanding from Step 1, design the ideal Core Operational Behavior Documents List from scratch.
The purpose of this list is to define every document needed before entering the Build & Test Phase. These documents will become the structural blueprints used by coding AI and developers.
Do not write the full contents of each document yet. Instead, design the document architecture.
For the Core Operational Behavior Documents List, propose:

1. The recommended directory structure.
2. Every required document filename.
3. The purpose of each document.
4. Whether each document requires owner approval.
5. Which system domain each document controls.
6. Which documents are source-of-truth documents versus derived implementation documents.
7. Which documents should contain hardcoded tables, enums, mappings, state machines, YAML, JSON, schemas, fixtures, or acceptance criteria.
8. Which documents must explicitly exclude other topics to prevent context bleed.
9. Any documents that should not exist because they would duplicate or confuse another document.
10. Any missing decisions that block the creation of a reliable document list.
Use a structure that is concrete enough for future AI assistants to generate the actual documents without guessing.
The final output should include a proposed documentation tree, followed by a table with these columns:
| Path | Document Name | Purpose | Approval Required? | Source Type | Must Include | Must Exclude |
Important constraints:

* Do not make the list abstract.
* Do not assume the author will remember to include enums, tables, or state machines later.
* If a document needs a status table, component mapping table, SKU enum, lifecycle diagram, or YAML spec, say so explicitly.
* Separate operational behavior documents from implementation documents, test documents, and runbooks.

---

# claude response

Here is the proposed documentation architecture for the SpicedAnime fulfillment web app.

Before the table: two things from the uploaded files I need to flag.

The `Product_Image_Transformation_Guidelines.md` has a YAML header issue — `database_dependencies` lists `offer_skus`, `sku_aliases`, `configuration_components`, and `designs`, but that document only specifies image transformation parameters. It does not read or write to those tables directly; the PPTX generation engine does. The YAML header guide (the second version, `field_by_field_yaml_header_guide_md.md`) has an expanded table list that includes `print_templates`, `batch_items`, `generated_files`, and `packing_exports` — which is more complete than the first version. I will use the expanded list as the canonical available options for the architecture below.

One open decision from Step 1 that must be surfaced before treating this list as final: tray page capacity, ashtray page capacity, and the lighter/wallet front-back file question are still unresolved. I have flagged those as blocking specific documents below.

---

## Proposed Documentation Tree

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
│   └── Technical_Architecture_and_API_Contract.md
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

---

## Document Architecture Table

| Path | Document Name | Purpose | Approval Required? | Source Type | Must Include | Must Exclude |
|---|---|---|---|---|---|---|
| `00_project/` | `MVP_Scope_and_Roadmap.md` | Defines what is in MVP versus deferred phases. Prevents scope creep. Establishes phase gates. | Yes — owner approval | Project control | Phase table (MVP / Phase 2 / Phase 3+) with explicit scope per phase; list of features explicitly deferred; success definition for MVP | Architecture decisions, database schema, business rules, image specs |
| `00_project/` | `Decision_Log_and_Open_Questions.md` | Tracks every owner-approved decision and every unresolved item that blocks a document or build step. The single source for what is settled vs open. | Yes — updated on owner approval | Project control | Two sections: Approved Decisions (immutable after sign-off) and Open Questions (each with a blocking document listed); tray page capacity, ashtray page capacity, and lighter/wallet front-back file question must appear here as blocking open items | Business rules, implementation details, specs of any kind |
| `00_project/` | `Coding_AI_Context.md` | Single-file orientation for any coding AI assistant entering the project. Maps where specs live, what not to invent, naming conventions, and project scope. | No | Project control | SOT file index with one-line purpose per doc; architecture summary (stack, DB, storage); "do not invent behavior — check SOT files first" rule; file naming conventions; list of open questions the AI must not resolve without owner input | Any business rules or specs; content that belongs in other docs |
| `01_source_of_truth/` | `End_to_End_Fulfillment_Workflow_SOT.md` | Master chronological narrative of the full workflow from paid Shopify order to printed batch and generated packing sheet. The reference all other SOT docs derive from. | Yes — owner approval | Source of truth | Numbered steps 1–13+ matching the operational sequence; status transitions at each step; explicit branch behavior for mixed orders, non-produced items, and partial batch errors; decision points requiring operator action | Database field definitions, image transform specs, PPTX layout rules, SKU format details (reference other docs; do not duplicate) |
| `01_source_of_truth/` | `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines all status enums and the state machine governing orders, batches, and print components. | Yes — owner approval | Source of truth | State machine diagram or equivalent table for each entity; enum tables for Order statuses (`Queued for Production`, `In Production`, `Being Packaged`, `Shipped`), Batch statuses (`Open`, `Locked for Review`, `Printed`, `Archived`), Component statuses (`Queued`, `Ready`, `Blocked`, `Printed`, `Reprint Needed`), Artwork statuses (`Available`, `Missing`, `Retired`); transition trigger table (what event causes each transition); mixed-order promotion logic (order only reaches `In Production` when all produced components are printed); non-produced item fast-path behavior | SKU format, image specs, workflow narrative (reference End-to-End doc) |
| `01_source_of_truth/` | `SKU_and_Internal_ID_Guide.md` | Defines the canonical Shopify offer SKU format, design code system, internal ID formats, option/config code dictionaries, and SKU alias handling. Already exists; needs YAML header correction per field guide. | Yes — owner approval | Source of truth | SKU pattern `<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>`; product family code enum table (ASH, GRD, JAR, TRY, LIT, TIN, BOX, WAL, TAP, TOT, HOD, PIL); color code enum (WHT, SIL, GLD); flame code enum (BIC, TOR); config code enum (SOLO, ASHGRD, LITTIN, GRDSET, BOX4, WALFB, NONE); design code rules; internal design ID format (`D######`); SKU alias table; parser contract with JSON input/output examples; validation failure code enum; CSV rollout rules | Image transformation parameters, database schema, batch lifecycle rules |
| `01_source_of_truth/` | `Production_Component_Decomposition_Rules.md` | Defines exactly which internal print components are generated from each SKU family + config combination. The rule table the app uses to turn one SKU into one or more printable units. | Yes — owner approval | Source of truth | Complete `configuration_components` mapping table with columns: Family, Config, Components Generated, Quantity per component; component code enum table (ASH, GRD, JAR, TRY, LITF, LITB, TIN, BOX, WALF, WALB); component-to-batch-group mapping table; note that this doc is the prose companion to `production_component_rules.yaml` and must stay in sync with it; front/back file question must be resolved before this doc is finalized | SKU format details (reference SKU guide), image specs, batch lifecycle |
| `01_source_of_truth/` | `production_component_rules.yaml` | Machine-readable version of the decomposition rules table. Importable by the app directly or usable as seed data for the `configuration_components` database table. | Yes — owner approval (same approval as decomposition doc) | Source of truth (machine-readable) | YAML structure with `family`, `config`, `components` array (each with `code` and `quantity`); must exactly mirror the table in `Production_Component_Decomposition_Rules.md`; version field in YAML | Prose, narrative, anything not machine-parseable |
| `01_source_of_truth/` | `Product_Image_Transformation_Guidelines.md` | Defines per-product image transformation parameters: shape, dimensions, border colors, color adjustments, page capacity, and images-per-SKU. Already exists; YAML header needs correction. | Yes — owner approval | Source of truth | Per-product spec blocks for all 8 product types; tray page capacity (currently missing — must be filled before approval); ashtray page capacity (currently missing — must be filled before approval); border color lookup by lighter/tin color variant; explicit note that margin behavior defers to PowerPoint defaults | PPTX slide generation logic, SKU parsing, batch rules, database schema |
| `01_source_of_truth/` | `PPTX_Generation_and_Layout_Engine_Spec.md` | Defines how the PPTX file is generated from a locked batch. Covers slide structure, grid layout, page overflow, image pairing for front/back products, text box placement, and file output. | Yes — owner approval | Source of truth | Slide size spec (8.5" × 11" portrait); per-product layout grid (rows × columns derived from items-per-page in transformation doc); page overflow rule; front/back image pairing rule for lighters and wallets; lighter color text box spec (placement, content); tin color text box spec; generated file naming pattern; editable vs non-editable PPTX decision; whether a PDF export is triggered at same time; note that this doc depends on `Product_Image_Transformation_Guidelines.md` for all per-image dimensions and adjustments | Image transformation parameters (reference only), SKU parsing, database schema, packing sheet logic |
| `01_source_of_truth/` | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the cloud storage structure for source artwork, generated PPTX files, packing sheets, and batch archives. Single source for all file paths, naming conventions, and storage behavior. | Yes — owner approval | Source of truth | Artwork folder structure (`artwork/{DESIGN_CODE}/{COMPONENT_CODE}.png`); cloud storage provider decision (MVP: Google Drive staging; production: S3/R2/Supabase — must be resolved before final approval); artwork versioning behavior; missing artwork behavior; generated PPTX path and naming pattern; packing sheet path and naming pattern; batch archive path; download filename formats | Image transformation parameters, SKU rules, database schema |
| `02_app_specs/` | `Data_Model_and_Database_Schema.md` | Defines all database tables, fields, types, constraints, relationships, and indexes. The primary implementation reference for backend database work. | No — developer document | Implementation spec | Full table definitions for: `orders`, `order_items`, `offer_skus`, `sku_aliases`, `designs`, `artwork_assets`, `production_components`, `production_batches`, `batch_items`, `print_templates`, `packing_exports`, `generated_files`, `audit_events`; field name, type, nullable, default, and constraint for each field; foreign key relationships; status enum values per table (must match `Order_Status_and_Batch_Lifecycle_SOT.md` exactly); index recommendations | Workflow narrative, image specs, business rules (reference SOT docs; do not restate them) |
| `02_app_specs/` | `Shopify_Integration_and_Order_Import_Spec.md` | Defines Shopify webhook setup, required API fields, deduplication logic, unknown SKU behavior, quantity handling, non-produced item handling, and what happens with canceled/refunded orders. | No — developer document | Implementation spec | Webhook trigger spec (paid + unfulfilled); required order fields list; required line item fields list; idempotency key strategy; deduplication rule; unknown/invalid SKU handling (route to Needs Attention, not to batch); quantity expansion rule (qty 2 of same SKU = 2 separate component records); non-produced item handling; canceled/refunded order behavior for MVP (store but ignore) and post-MVP plan; Shopify API permissions list; re-import behavior | Image specs, batch lifecycle, PPTX generation (reference SOT docs) |
| `02_app_specs/` | `Packing_Sheet_Export_Spec.md` | Defines the combined XLSX packing sheet: columns, data sources, sorting, scope, and file output. | No — developer document | Implementation spec | Complete column list with source field for each column (Order Number from `orders.order_number`, Customer Name from `orders.customer_name`, etc.); scope rule (combined across all production groups, includes non-produced items); sorting/grouping rule; which orders are included in a given export; row-per-order vs row-per-item decision; produced vs non-produced item display; batch date range column; label status, packed status, tracking status columns; file naming rule; XLSX vs CSV decision | Image specs, PPTX layout, SKU parsing, batch lifecycle rules |
| `02_app_specs/` | `Web_App_Screen_Inventory_and_UX_Flow.md` | Defines every screen in the MVP web app: name, URL path, primary operator action, visible data, and buttons/actions available on each screen. | No — developer document | Implementation spec | Screen inventory table with columns: Screen Name, URL, Purpose, Primary Data Displayed, Actions Available; navigation/routing diagram or table; operator action sequences (generate PPTX → confirm → mark printed sequence); Needs Attention screen error type table; Dashboard data summary; desktop-first layout assumption stated explicitly | Business rules, database schema, image specs |
| `02_app_specs/` | `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines every error state the app can enter, the user-facing message for each, and the recovery action. Also covers reprint behavior. | No — developer document | Implementation spec | Error type enum table (UNKNOWN_SKU, INVALID_SKU, MISSING_ARTWORK, MISSING_TEMPLATE, MISSING_COMPONENT_RULE, DUPLICATE_ORDER, FAILED_PPTX_GENERATION, FAILED_PACKING_EXPORT, BATCH_LOCKED_IN_ERROR, WEBHOOK_FAILURE); per-error: trigger condition, user-facing message, recovery action, whether it blocks batch or just flags item; reprint behavior (what creates a reprint component, how it enters a batch, whether it changes order status); partial batch print rule (errors in some items do not block others) | Workflow narrative, SKU format, database schema |
| `02_app_specs/` | `Security_Access_and_Privacy_Spec.md` | Defines authentication, Shopify credential handling, customer data handling, file access rules, audit log requirements, and future role-based access. | No — developer document | Implementation spec | Auth method for MVP (single admin login); Shopify API secret storage rule; customer PII fields list and storage/retention policy; file access control rule for generated PPTX/XLSX; audit event list (what user actions are logged); future role table (Owner/Admin, Production Operator, Packaging Operator, Viewer) marked as post-MVP | Business rules, image specs, workflow narrative |
| `02_app_specs/` | `Technical_Architecture_and_API_Contract.md` | Defines the chosen technical stack, API endpoint list, background job structure, file generation flow, environment variables, and deployment targets. | No — developer document | Implementation spec | Frontend framework; backend framework; database engine; cloud storage provider (must match `Artwork_Library...SOT.md`); background job worker; API endpoint table (method, path, description, request/response shape); generated file flow (who triggers, where file lands, how download URL is returned); environment variable list with descriptions; staging vs production environment definitions | Business rules, image transformation parameters, SKU format, database field definitions |
| `03_testing/` | `Test_Plan_and_Acceptance_Criteria.md` | Defines test scenarios and the expected result for each. Provides the coding AI with objective completion criteria. | No — developer document | Test spec | Test scenario table with columns: Scenario, Input (SKU or order shape), Expected Components Generated, Expected Batch Assignment, Expected Status, Pass Condition; must include: single ashtray, ashtray+grinder bundle, lighter+tin, stashbox set, mixed produced+non-produced order, non-produced-only order, unknown SKU, missing artwork, generate PPTX, mark printed, new order routing after print, packing sheet export | Business rules, implementation details |
| `03_testing/` | `Sample_Data_and_Fixtures.md` | Describes the fixture files in `fixtures/` and explains what each one tests. Index for the fixtures folder. | No — developer document | Test spec | File-by-file description of each fixture; what scenario it covers; which SOT document section it validates | Actual JSON/CSV content (that lives in the fixture files themselves) |
| `03_testing/fixtures/` | `shopify_order_single_ashtray.json` | Realistic Shopify webhook payload for a single ashtray order. | No | Test fixture | Valid Shopify order shape with paid+unfulfilled status; one line item with `ASH-CHARFRIE-SOLO` SKU; quantity 1 | Any non-Shopify-format data |
| `03_testing/fixtures/` | `shopify_order_lighter_tin.json` | Shopify webhook payload for a lighter + tin bundle. | No | Test fixture | One line item `LIT-DESNAM-SIL-TOR-LITTIN`; quantity 1; should generate LITF, LITB, TIN components | — |
| `03_testing/fixtures/` | `shopify_order_stashbox_set.json` | Shopify webhook payload for the stashbox set (maximum component count). | No | Test fixture | One line item `BOX-DESNAM-BOX4`; should generate BOX, LITF, LITB, GRD, JAR components across multiple batches | — |
| `03_testing/fixtures/` | `shopify_order_mixed_products.json` | Order containing both produced and non-produced items. | No | Test fixture | At minimum one produced SKU and one non-produced SKU (e.g., `HOD-DESNAM-XL-NONE`); order status should not reach `In Production` until all produced components are printed | — |
| `03_testing/fixtures/` | `shopify_order_non_produced_only.json` | Order containing only non-produced items. | No | Test fixture | Only non-produced SKUs; no print components should be generated; order should appear on packing sheet | — |
| `03_testing/fixtures/` | `expected_components.csv` | Expected output of the component generation step for each fixture order. | No | Test fixture | Columns: fixture_file, sku, component_code, batch_group, quantity; one row per expected component | — |
| `03_testing/fixtures/` | `expected_batch_assignments.csv` | Expected batch group assignment for each component in the fixture set. | No | Test fixture | Columns: component_code, batch_group | — |
| `03_testing/fixtures/` | `expected_packing_sheet_rows.csv` | Expected rows in the packing sheet for the mixed-order fixture. | No | Test fixture | Columns matching the packing sheet column spec; both produced and non-produced rows included | — |
| `04_operations/` | `Deployment_and_Operations_Runbook.md` | Defines how to set up local, staging, and production environments. Developer-facing only. | No — developer document | Runbook | Environment setup steps; environment variable list (reference `Technical_Architecture_and_API_Contract.md`); database migration command; Shopify webhook registration steps; cloud storage bucket setup; admin login setup; how to restart the background job worker; how to inspect failed jobs; backup procedure | Business rules, image specs, any SOT content |

---

## Documents that should NOT exist

Three proposed documents from the exploration phase are explicitly excluded to prevent duplication:

`Order_Import_and_Validation_Rules.md` — the import behavior belongs in `Shopify_Integration_and_Order_Import_Spec.md` and the validation error behavior belongs in `Validation_Errors_Reprints_and_Recovery_SOT.md`. A separate file for this would duplicate both.

`Production_Batch_Rules.md` — batch lifecycle is fully covered by `Order_Status_and_Batch_Lifecycle_SOT.md`. A separate batch rules file would cause the state machine to exist in two places and diverge over time.

`Reprint_and_Exception_Handling_SOT.md` as a standalone — reprint behavior is a subsection of `Validation_Errors_Reprints_and_Recovery_SOT.md`. It is not complex enough at MVP to warrant a separate document.

`Permissions_and_User_Roles.md` as a standalone — role definitions are a section inside `Security_Access_and_Privacy_Spec.md`. Splitting them creates a synchronization risk.

`File_Naming_and_Generated_Output_SOT.md` as a standalone — file naming and storage conventions are part of `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`. Splitting creates two places to update when paths change.

---

## Blocking open decisions (must be resolved before corresponding documents can be finalized)

| Open Decision | Blocking Document(s) | Notes |
|---|---|---|
| Tray page capacity | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` | Tray size is defined but count per page is not. |
| Ashtray page capacity | `Product_Image_Transformation_Guidelines.md`, `PPTX_Generation_and_Layout_Engine_Spec.md` | Same situation as tray. |
| Lighter and wallet front/back — same source file or separate files? | `Production_Component_Decomposition_Rules.md`, `production_component_rules.yaml`, `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | If same file, `LITF.png` and `LITB.png` point to the same asset. If separate, two distinct uploads are required per design. |
| Cloud storage provider for MVP | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`, `Technical_Architecture_and_API_Contract.md` | Google Drive for staging vs S3/R2/Supabase for production is recommended but not decided. |
| Technical stack (frontend framework, backend framework, database engine) | `Technical_Architecture_and_API_Contract.md`, `Data_Model_and_Database_Schema.md`, `Deployment_and_Operations_Runbook.md` | These three documents cannot be finalized without a stack decision. |
| SKU code dictionary owner approval | `SKU_and_Internal_ID_Guide.md`, all documents that reference component codes | The recommended system is complete but Josiah has not formally approved the new SKU format. |

---

# you asked

message time: 2026-06-14 13:00:13

The approved SKU structure still stands:

```text
<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>
```

The correction is that the SKU dictionary must include **all sold catalog families**, even if some families do not generate PPTX/PDF print documents. This aligns with the project spec: the SKU identifies the Shopify sellable variant, while the fulfillment app uses lookup tables to determine production components, artwork, print templates, batches, and packing-sheet behavior. 

The owner’s new item list does **not** invalidate the recommendation. It confirms the need for a `production_required` / `print_document_required` distinction because non-produced items still belong on the combined packing sheet but should not enter print batches. The uploaded workflow already states that non-produced items such as tapestries, hoodies, tote bags, and pillow cases appear on the packing sheet but do not generate print components. 

Shopify also supports this direction: Shopify states that each product/variant should have its own SKU, SKUs help fulfillment staff find and pack the right products, duplicate SKUs can create third-party integration and inventory-tracking issues, and line items expose the variant SKU field through the Admin API. ([Shopify Help Center][1]) ([Shopify][2])

One correction I would make: **do not use `GRD` for both “Grinder Sets” and “Herb Grinder.”** Use `GRS` for Grinder Sets and reserve `GRD` for Herb Grinder. That avoids a future collision.

## Copy/paste answer for Claude

````markdown
# Verification Request: SpicedAnime SKU Dictionary Update

Please verify and incorporate the following decision into the SpicedAnime fulfillment app specification.

## Context

The approved Shopify offer SKU structure remains:

`<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>`

This SKU identifies the sellable Shopify variant. It should not directly encode every production rule. The fulfillment app/database remains responsible for decomposing the SKU into production components, artwork lookups, print templates, batch routing, and packing-sheet behavior.

## New owner-provided catalog list

Complete list of items sold by SpicedAnime:

- Ashtray
- Black Art Tapestry
- Flip Lighter
- Grinder Sets
- Herb Grinder
- Hoodies
- Pillow Covers
- Rolling Tray
- Stash Box
- Stash Jar
- Tapestry
- Tote Bags
- Wallet

Owner notes:

- Herb grinders can be ignored for MVP because they are not set up on the site yet.
- Pillow covers, tote bags, tapestry, hoodies, and black art tapestry will not have PPTX/PDF document creation steps.
- A SKU system should still exist for all items, even if some families are not implemented immediately.

## Verified decision

This new information does not change the approved SKU structure.

It does require updating the family-code dictionary and adding explicit production behavior flags so the app knows which SKUs generate print components and which SKUs are packing-sheet-only.

The final SKU system should support two operational paths:

1. Produced items:
   - Generate production components.
   - Enter product-specific print batches.
   - Generate PPTX/PDF output where applicable.
   - Appear on the combined packing sheet.

2. Non-produced / packing-only items:
   - Do not generate production components.
   - Do not enter print batches.
   - Do not generate PPTX/PDF output.
   - Still appear on the combined packing sheet.

## Revised family-code dictionary

Use the following family codes:

| Family Code | Product Family | MVP Behavior |
|---|---|---|
| `ASH` | Ashtray | Produced item; print document required |
| `BAT` | Black Art Tapestry | Non-produced / packing-sheet-only |
| `LIT` | Flip Lighter | Produced item; print document required |
| `GRS` | Grinder Sets | Produced bundle/set; print document required |
| `GRD` | Herb Grinder | Future produced item; SKU-ready but ignored for MVP |
| `HOD` | Hoodie | Non-produced / packing-sheet-only |
| `PIL` | Pillow Cover | Non-produced / packing-sheet-only |
| `TRY` | Rolling Tray | Produced item; print document required |
| `BOX` | Stash Box | Produced item; print document required |
| `JAR` | Stash Jar | Produced item; print document required |
| `TAP` | Tapestry | Non-produced / packing-sheet-only |
| `TOT` | Tote Bag | Non-produced / packing-sheet-only |
| `WAL` | Wallet | Produced item; print document required |

Important correction: use `GRS` for Grinder Sets and reserve `GRD` for Herb Grinder. Do not use `GRD` for both.

## Required database behavior fields

Add or confirm these fields in the SKU/product-family source-of-truth and database model:

| Field | Purpose |
|---|---|
| `family_code` | Three-letter SKU family code |
| `family_name` | Human-readable product family name |
| `is_sold` | Whether this family exists in the Shopify catalog |
| `is_site_active` | Whether this family is currently active on the site |
| `implementation_status` | `MVP`, `Future`, or `Ignored for MVP` |
| `production_required` | Whether the SKU creates production components |
| `print_document_required` | Whether the SKU enters PPTX/PDF generation |
| `packing_sheet_required` | Whether the SKU appears on the packing sheet |
| `default_batch_group` | Batch routing group, or `None` for non-produced items |

## Recommended production behavior table

| Product Family | production_required | print_document_required | packing_sheet_required | default_batch_group |
|---|---:|---:|---:|---|
| Ashtray | true | true | true | `Ashtray` |
| Black Art Tapestry | false | false | true | `None` |
| Flip Lighter | true | true | true | `Lighter` |
| Grinder Sets | true | true | true | `Grinder/Jar/Tray` |
| Herb Grinder | false for MVP; true later | false for MVP; true later | true if sold | `None` for MVP |
| Hoodie | false | false | true | `None` |
| Pillow Cover | false | false | true | `None` |
| Rolling Tray | true | true | true | `Tray` |
| Stash Box | true | true | true | `Box` |
| Stash Jar | true | true | true | `Jar` |
| Tapestry | false | false | true | `None` |
| Tote Bag | false | false | true | `None` |
| Wallet | true | true | true | `Wallet` |

## Example SKUs

Produced items:

```text
ASH-CHARFRIE-SOLO
LIT-GOJO-SIL-TOR-LITTIN
GRS-NARUTO-GRDSET
TRY-ONEPIECE-SOLO
BOX-DEMONSLAYER-BOX4
JAR-SAILMOON-SOLO
WAL-POKEMON-WALFB
````

Non-produced / packing-sheet-only items:

```text
BAT-SAMURAI-LRG-NONE
TAP-AKIRA-LRG-NONE
HOD-NARUTO-XL-BLK-NONE
PIL-GHIBLI-18X18-NONE
TOT-EVA-BLK-NONE
```

Future / not implemented in MVP:

```text
GRD-BLEACH-SOLO
```

## Final implementation instruction

Do not treat every SKU as a print job.

The parser should first identify the SKU as a valid Shopify offer SKU. Then the database should determine whether that SKU:

1. Generates production components.
2. Enters a product-specific batch.
3. Requires PPTX/PDF output.
4. Appears only on the packing sheet.
5. Is valid but deferred from MVP implementation.

This preserves the approved SKU format while preventing non-produced items such as hoodies, tapestries, black art tapestries, tote bags, and pillow covers from being incorrectly routed into print-document generation.

Complete list of items sold by SpicedAnime
 * Ashtray
 * Black Art Tapestry
 * Flip Lighter
 * Grinder Sets
 * Herb Grinder
 * Hoodies
 * Pillow Covers
 * Rolling Tray
 * Stash Box
 * Stash Jar
 * Tapestry
 * Tote Bags
 * Wallet
 Note from owner: 
- Herb grinders can be ignored - They are not set up on the site yet
- Pillow covers, tire bags, tapestry, hoodies, and black art tapestry won’t have the pp/pdf document creations steps
- A SKU system should be at least in place for all items though they may not be implemented immediately
Open Decision Answers
1. Trays - 3 images per page
2. Ashtrays - 6 images per page
3. Lighters - the same image file
4. Cloud Storage - Google Drive
5. Technical Stack - Use Next.js + React + TypeScript for the frontend, Django + Django REST Framework for the backend, and PostgreSQL for the database; this stack is verified as realistic and appropriate for a Shopify-driven fulfillment operations app that needs durable order state, SKU/component batching, PPTX/XLSX generation, error handling, and future shipping/status expansion.
6. SKU Formal Approval - The approved SKU structure still stands

---

# claude response

Reading the document in context carefully before proceeding.

The document already contains a complete, well-structured Claude-ready update block. I'll treat it as the authoritative owner input alongside the inline answers.

Here is the full update to the documentation architecture incorporating all six resolved decisions.

---

## Decision Log Update — All Open Items Now Resolved

| Decision | Resolution |
|---|---|
| Tray page capacity | 3 images per page |
| Ashtray page capacity | 6 images per page |
| Lighter front/back — same file or separate? | Same image file for both placements |
| Wallet front/back — same file or separate? | Assumed same (consistent with lighter resolution; flag in Decision Log for explicit confirmation) |
| Cloud storage provider | Google Drive (MVP and production — no S3/R2/Supabase migration planned at this time) |
| Technical stack | Next.js + React + TypeScript (frontend), Django + Django REST Framework (backend), PostgreSQL (database) |
| SKU structure formal approval | Approved; `GRS` for Grinder Sets, `GRD` reserved for Herb Grinder (future/ignored for MVP) |
| Full product catalog | 13 families confirmed; Herb Grinder deferred; 5 families are non-produced/packing-sheet-only |

---

## Revised and Complete Documentation Architecture

All changes from the prior architecture are marked. No document from the prior list is removed; several are updated in scope.

### Updated Documentation Tree

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
│   └── Technical_Architecture_and_API_Contract.md
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

The directory structure is unchanged. All updates are content-scope changes within existing documents.

---

## Full Updated Document Table

Changes from the prior version are noted in the Must Include column with **[UPDATED]** or **[NEW]**.

| Path | Document Name | Purpose | Approval Required? | Source Type | Must Include | Must Exclude |
|---|---|---|---|---|---|---|
| `00_project/` | `MVP_Scope_and_Roadmap.md` | Defines what is in MVP versus deferred phases. | Yes | Project control | Phase table; **[UPDATED]** Herb Grinder (`GRD`) explicitly listed as deferred/ignored for MVP; non-produced families (BAT, HOD, PIL, TAP, TOT) listed as packing-sheet-only with no print implementation; explicit statement that GDrive is the storage platform for MVP (no S3 migration planned) | Architecture decisions, database schema, business rules, image specs |
| `00_project/` | `Decision_Log_and_Open_Questions.md` | Tracks every owner-approved decision and every unresolved item. | Yes | Project control | **[UPDATED]** All six previously open decisions now recorded as approved and closed: tray=3/page, ashtray=6/page, lighter/wallet front-back=same file, storage=Google Drive, stack=Next.js/Django/PostgreSQL, SKU approved; **[NEW]** one remaining open item: wallet front/back same-file assumption must be explicitly confirmed by owner; Decision Log must note `GRS` vs `GRD` distinction and the rationale | Business rules, implementation details, specs |
| `00_project/` | `Coding_AI_Context.md` | Single-file orientation for any coding AI assistant. | No | Project control | **[UPDATED]** Stack summary: Next.js + React + TypeScript, Django + DRF, PostgreSQL, Google Drive API; note that `GRD` (Herb Grinder) is a valid future SKU family but must not be implemented in MVP; note that non-produced families route to packing sheet only and must not enter print batch logic | Any business rules or specs; content that belongs in other docs |
| `01_source_of_truth/` | `End_to_End_Fulfillment_Workflow_SOT.md` | Master chronological workflow narrative. | Yes | Source of truth | **[UPDATED]** Explicit branch at step 3 for non-produced items: these items create no production components and go directly to packing sheet queue; explicit branch for `GRD` family: reject at import with `FAMILY_DEFERRED_MVP` status rather than routing to Needs Attention; all resolved decisions reflected in workflow narrative | Database field definitions, image transform specs, SKU format details |
| `01_source_of_truth/` | `Order_Status_and_Batch_Lifecycle_SOT.md` | All status enums and the state machine. | Yes | Source of truth | **[UPDATED]** Non-produced-only order fast-path: order skips `Queued for Production` batch wait and advances to `Being Packaged` after packing sheet is generated (or stays `In Production` — this fast-path behavior must be confirmed by owner; add as minor open item); `FAMILY_DEFERRED_MVP` as a component-level status for GRD items; all enum tables unchanged otherwise | SKU format, image specs, workflow narrative |
| `01_source_of_truth/` | `SKU_and_Internal_ID_Guide.md` | Canonical Shopify offer SKU format, design codes, internal IDs, option/config dictionaries, alias handling. Already exists; needs YAML header correction. | Yes | Source of truth | **[UPDATED]** Full revised family-code dictionary with all 13 families; production behavior flags table (`production_required`, `print_document_required`, `packing_sheet_required`, `default_batch_group`, `implementation_status`) as a reference table (database canonical version lives in `Data_Model_and_Database_Schema.md`); **[UPDATED]** `GRS` for Grinder Sets, `GRD` reserved for Herb Grinder — rationale documented; **[UPDATED]** non-produced SKU format examples (BAT, TAP, HOD, PIL, TOT with `-NONE` config); **[UPDATED]** `FAMILY_DEFERRED_MVP` as a validation failure code for GRD at import time; **[NEW]** wallet front/back same-file assumption noted as pending explicit owner confirmation | Image transformation parameters, database schema, batch lifecycle rules |
| `01_source_of_truth/` | `Production_Component_Decomposition_Rules.md` | Which print components are generated per SKU family + config. | Yes | Source of truth | **[UPDATED]** Complete `configuration_components` mapping table covering all produced families only (ASH, LIT, GRS, TRY, BOX, JAR, WAL); **[UPDATED]** explicit exclusion table for non-produced families (BAT, HOD, PIL, TAP, TOT) stating these families produce zero components; **[NEW]** `GRD` row in exclusion table marked `DEFERRED_MVP — no components generated until explicitly enabled`; **[UPDATED]** lighter front/back: both `LITF` and `LITB` component codes exist and are placed separately in the layout, but both resolve to the same source artwork file (`artwork/{DESIGN_CODE}/LITF.png` used for both — or a single canonical file; see Artwork SOT); same rule for wallet; **[UPDATED]** `GRS` (Grinder Sets) now covers the grinder/jar/tray bundle — update all references from `GRD` to `GRS` for this config | SKU format details, image specs, batch lifecycle |
| `01_source_of_truth/` | `production_component_rules.yaml` | Machine-readable decomposition rules. | Yes | Source of truth | **[UPDATED]** All `GRD` config entries renamed to `GRS` for Grinder Sets; **[NEW]** `deferred_mvp: true` flag on the `GRD` family entry; non-produced families listed with `production_required: false` and empty `components` array; **[NEW]** `implementation_status` field per family entry | Prose, narrative |
| `01_source_of_truth/` | `Product_Image_Transformation_Guidelines.md` | Per-product image transformation parameters. Already exists; YAML header needs correction. | Yes | Source of truth | **[UPDATED]** Tray: add `Layout: 3 units per page`; **[UPDATED]** Ashtray: add `Layout: 6 units per page`; **[UPDATED]** Lighter: add explicit note `Front and Back images use the same source file; two placements are generated from one artwork asset`; **[NEW]** same note for Wallet; **[UPDATED]** YAML header correction: remove `offer_skus`, `sku_aliases`, `configuration_components`, `designs` from `database_dependencies` — this doc drives the `print_templates` table only; corrected `database_dependencies` should list `print_templates` only; `primary_systems` should list `Production Batch Engine` and `PPTX Generation Engine` only | PPTX slide generation logic, SKU parsing, batch rules, database schema |
| `01_source_of_truth/` | `PPTX_Generation_and_Layout_Engine_Spec.md` | How PPTX is generated from a locked batch. | Yes | Source of truth | **[UPDATED]** Tray layout grid: 3 per page, derive row/column from page dimensions and tray size (5.7" H × 4.05" W on 8.5" × 11" portrait — likely 1 column × 3 rows); **[UPDATED]** Ashtray layout grid: 6 per page (likely 2 columns × 3 rows at 3.4" diameter); **[UPDATED]** lighter front/back pairing rule: both placements pull from the same source file; the layout engine places two copies of the same image on the slide per lighter; wallet same rule; **[UPDATED]** `GRS` batch group replaces any prior `GRD` references for grinder set PPTX generation; file storage: generated PPTX written to Google Drive (not S3); Google Drive API used for file write | Image transformation parameters (reference only), SKU parsing, database schema, packing sheet logic |
| `01_source_of_truth/` | `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Cloud storage structure for artwork, PPTX, packing sheets, archives. | Yes | Source of truth | **[UPDATED]** Cloud storage platform: Google Drive for all environments (MVP and production); Google Drive folder structure spec; **[UPDATED]** lighter front/back: single canonical artwork file per design (e.g., `artwork/{DESIGN_CODE}/LIT.png`); layout engine creates two placements from this one file; no separate LITF.png and LITB.png required unless artwork differs; same rule for wallet; **[UPDATED]** artwork path convention adjusted if single-file: `artwork/{DESIGN_CODE}/{COMPONENT_FAMILY}.png` (e.g., `artwork/CHARFRIE/LIT.png`, `artwork/CHARFRIE/ASH.png`); component codes `LITF`/`LITB` remain internal placement codes, not file names; **[NEW]** Google Drive folder structure outline (e.g., `SpicedAnime/artwork/`, `SpicedAnime/batches/`, `SpicedAnime/packing_sheets/`); Google Drive API auth method | Image transformation parameters, SKU rules, database schema |
| `02_app_specs/` | `Data_Model_and_Database_Schema.md` | All database tables, fields, types, constraints. Primary backend reference. | No | Implementation spec | **[UPDATED]** `product_families` table: fields `family_code`, `family_name`, `is_sold`, `is_site_active`, `implementation_status` (enum: `MVP`, `Future`, `Ignored for MVP`), `production_required` (bool), `print_document_required` (bool), `packing_sheet_required` (bool), `default_batch_group` (nullable string); **[UPDATED]** all `GRD`-as-grinder-set references updated to `GRS`; `GRD` row present in `product_families` with `implementation_status = 'Ignored for MVP'` and `production_required = false`; **[UPDATED]** database: PostgreSQL; stack note in header; Google Drive file references stored as Drive file IDs or shareable URLs, not S3 keys | Workflow narrative, image specs, business rules |
| `02_app_specs/` | `Shopify_Integration_and_Order_Import_Spec.md` | Shopify webhook setup, order import, validation, edge cases. | No | Implementation spec | **[UPDATED]** `GRD` family handling: at import, if a line item SKU resolves to the `GRD` family, mark the component with status `FAMILY_DEFERRED_MVP` and route to a dedicated "Deferred Items" section of the Needs Attention screen — do not route to print batch, do not block the rest of the order; **[UPDATED]** non-produced family handling: items with `production_required = false` create no production components; they are recorded as order items and appear on packing sheet only; **[UPDATED]** complete list of non-produced families to check at import: BAT, HOD, PIL, TAP, TOT | Image specs, batch lifecycle, PPTX generation |
| `02_app_specs/` | `Packing_Sheet_Export_Spec.md` | Combined XLSX packing sheet definition. | No | Implementation spec | **[UPDATED]** All 13 product families included on packing sheet (produced and non-produced); **[UPDATED]** `GRD` items appear on packing sheet with a "Deferred — not yet produced" note in the status column; non-produced items (BAT, HOD, PIL, TAP, TOT) appear with no production status column populated | Image specs, PPTX layout, SKU parsing, batch lifecycle rules |
| `02_app_specs/` | `Web_App_Screen_Inventory_and_UX_Flow.md` | Every screen in the MVP app. | No | Implementation spec | **[UPDATED]** Needs Attention screen: must show separate sections for (1) items with missing SKU/artwork/template errors and (2) items with `FAMILY_DEFERRED_MVP` status (`GRD` family); the two sections must be visually distinct because `FAMILY_DEFERRED_MVP` is expected and not an error; **[UPDATED]** stack note in header: Next.js + React + TypeScript | Business rules, database schema, image specs |
| `02_app_specs/` | `Validation_Errors_Reprints_and_Recovery_SOT.md` | Every error state, user-facing messages, and recovery actions. | No | Implementation spec | **[UPDATED]** `FAMILY_DEFERRED_MVP` added to error type enum: trigger = SKU family is `GRD`; user-facing message = "This item's product family is not yet supported. It has been held in Deferred Items."; recovery action = none required; does not block batch; **[UPDATED]** non-produced family routing: not an error state; these items silently pass to packing sheet only | Workflow narrative, SKU format, database schema |
| `02_app_specs/` | `Security_Access_and_Privacy_Spec.md` | Auth, credential handling, customer data, audit log. | No | Implementation spec | **[UPDATED]** Google Drive API credentials handling: service account or OAuth token storage method; Drive file permissions (who can access generated PPTX and packing sheets); no S3 credential handling required | Business rules, image specs, workflow narrative |
| `02_app_specs/` | `Technical_Architecture_and_API_Contract.md` | Tech stack, API endpoints, job structure, file generation flow, env vars. | No | Implementation spec | **[NEW]** Confirmed stack: Next.js + React + TypeScript (frontend), Django + Django REST Framework (backend), PostgreSQL (database), Google Drive API (file storage for artwork, generated PPTX, generated packing sheets); **[NEW]** Python library for PPTX generation: `python-pptx`; **[NEW]** Python library for XLSX generation: `openpyxl` or `xlsxwriter`; **[NEW]** Google Drive integration: `google-api-python-client`; background job worker: to be specified (likely Celery + Redis, or Django-Q, or a simple synchronous approach for MVP — must be decided before this doc is finalized); **[NEW]** env var list must include: `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_API_KEY`, `SHOPIFY_STORE_DOMAIN`, `GOOGLE_DRIVE_CREDENTIALS_JSON`, `GOOGLE_DRIVE_ARTWORK_FOLDER_ID`, `GOOGLE_DRIVE_BATCHES_FOLDER_ID`, `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` | Business rules, image transformation parameters, SKU format, database field definitions |
| `03_testing/` | `Test_Plan_and_Acceptance_Criteria.md` | Test scenarios and expected results. | No | Test spec | **[UPDATED]** Add test case: `GRD` SKU in an order → component marked `FAMILY_DEFERRED_MVP`, rest of order processes normally; **[UPDATED]** Add test case: non-produced-only order (e.g., `TAP-AKIRA-LRG-NONE`) → no print components generated, order appears on packing sheet; **[UPDATED]** Add test case: lighter order → confirm single source file used for both front and back placements in generated PPTX; **[UPDATED]** Tray test: confirm 3 per page layout; **[UPDATED]** Ashtray test: confirm 6 per page layout | Business rules, implementation details |
| `03_testing/` | `Sample_Data_and_Fixtures.md` | Index of fixture files. | No | Test spec | No content changes; fixture file list unchanged | Actual JSON/CSV content |
| `03_testing/fixtures/` | `shopify_order_single_ashtray.json` | Single ashtray order. | No | Test fixture | No changes | — |
| `03_testing/fixtures/` | `shopify_order_lighter_tin.json` | Lighter + tin bundle. | No | Test fixture | **[UPDATED]** use `LIT-DESNAM-SIL-TOR-LITTIN`; fixture must confirm single source file produces two layout placements | — |
| `03_testing/fixtures/` | `shopify_order_stashbox_set.json` | Stashbox set (maximum component count). | No | Test fixture | **[UPDATED]** confirm `BOX-DESNAM-BOX4` generates BOX, LIT (×2 placements from one file), GRS components; note `GRS` replaces prior `GRD` references | — |
| `03_testing/fixtures/` | `shopify_order_mixed_products.json` | Produced + non-produced items in one order. | No | Test fixture | **[UPDATED]** include at least one non-produced SKU (e.g., `TAP-AKIRA-LRG-NONE`) and one produced SKU; verify non-produced item appears on packing sheet with no production component | — |
| `03_testing/fixtures/` | `shopify_order_non_produced_only.json` | Non-produced items only. | No | Test fixture | No changes to concept; **[UPDATED]** use correct non-produced family codes (BAT, HOD, PIL, TAP, or TOT) | — |
| `03_testing/fixtures/` | `expected_components.csv` | Expected component generation output per fixture. | No | Test fixture | **[UPDATED]** lighter rows: show two component records (LITF, LITB) both with same `artwork_file` reference; `GRD` family rows absent; `GRS` used for grinder set components | — |
| `03_testing/fixtures/` | `expected_batch_assignments.csv` | Expected batch group per component. | No | Test fixture | **[UPDATED]** `GRS` → `Grinder/Jar/Tray` batch group (not `GRD`) | — |
| `03_testing/fixtures/` | `expected_packing_sheet_rows.csv` | Expected packing sheet rows for mixed-order fixture. | No | Test fixture | **[UPDATED]** include non-produced row with no `batch_group` or `print_status` value | — |
| `04_operations/` | `Deployment_and_Operations_Runbook.md` | Environment setup and operations. | No | Runbook | **[UPDATED]** stack-specific setup: Django project setup commands, Next.js build commands, PostgreSQL setup; **[UPDATED]** Google Drive setup: service account creation, folder structure creation, sharing permissions, credentials JSON storage; **[NEW]** env var list matching `Technical_Architecture_and_API_Contract.md`; background job worker setup (pending stack decision) | Business rules, image specs, any SOT content |

---

## One Remaining Open Item

The wallet front/back same-file assumption was resolved for lighters by the owner explicitly but was not addressed for wallets in the same message. I am treating it as the same rule (one source file, two placements) consistent with the lighter decision, but this should be confirmed and recorded in the Decision Log before `Production_Component_Decomposition_Rules.md` and `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` are marked approved.

## One Remaining Technical Decision

The background job worker (Celery + Redis, Django-Q, or synchronous MVP approach) is not yet specified. This blocks the `Technical_Architecture_and_API_Contract.md` and `Deployment_and_Operations_Runbook.md` from being finalized. It does not block any SOT documents. Recommend deciding this before document generation begins for `02_app_specs/`.

---

# you asked

message time: 2026-06-14 13:09:00

1. Wallet - the same image file
2. Background Job - Use Celery + Redis

---

Prompt 3 — Generate the Core Operational Behavior Documents List
Now generate the complete `core_operational_behavior_documents_list.md` using the approved architecture from Step 2.
This document is not the full specification set. It is the master index that defines what specification files must exist, what each file must contain, and what each file must not contain.
For every file entry, use this exact structure:

```markdown
### `[path/to/file.md]`

**Approval Status:** [Requires owner approval / Owner approval not required]

**Source Type:** [Source of Truth / Derived Spec / Implementation Spec / Test Spec / Operations Runbook / Machine-Readable Config]

**Primary Purpose:**  
[One to three sentences explaining exactly what this document controls.]

**Thick Boundaries:**  
- **Must Cover:** [Specific content this document must define.]
- **Must Consider:** [Important edge cases, dependencies, or cross-document alignment issues.]
- **Explicitly Excludes:** [Topics this file must not define.]

**Required Sections**

| Section | Required Content |
| :--- | :--- |
| [Section name] | [Specific required content] |

**Required Hardcoded Content**

[Write the actual required tables, enums, state names, component mappings, YAML skeletons, fixture schemas, API endpoint tables, lifecycle rules, or validation matrices that this document must include. Do not describe these abstractly. If the exact value is unknown, write `TBD — requires owner approval` rather than inventing it.]

**Cross-References**

| Related Document | Relationship |
| :--- | :--- |
| `[path/to/other-file.md]` | [How this document depends on or constrains the other document.] |

```

Global requirements:

* Use Markdown.
* Include a top-level YAML frontmatter block for the master list.
* Include a documentation tree.
* Include an approval status key.
* Include a source-of-truth hierarchy.
* Include every required file from the approved architecture.
* Do not leave vague placeholders like “include relevant enums.”
* Write the specific enums, tables, mappings, or schemas wherever they are known from the conversation threads.
* Use `TBD — requires owner approval` where the conversation threads do not provide enough information.
* Do not invent business rules to fill gaps.
* Do not redefine the same rule in multiple places unless one file is clearly marked as source-of-truth and the other is derived from it.

---

# claude response

Thinking

I'm planning to generate the master index document that consolidates all the resolved decisions and documentation architecture, incorporating the final answers about the wallet image file and Celery + Redis for background jobs. That's roughly 21 documents to create, though fixtures might be counted separately. Since this is a substantial deliverable—likely over 1500 lines—I should create it as a file rather than paste it inline. Let me check what skill I need for markdown file creation before proceeding. I need to be careful about Josh's stated preferences — he explicitly wants no em-dashes in his writing, and I've been using them. Hyphens are fine, but em-dashes need to be removed from this response. I need to draft the actual content for each documentation file, including the real tables, enums, schemas, and decision logs that will make this a genuinely useful reference rather than just a template. This is going to be substantial, so I'll structure it as a file and work through each section methodically. Continuing through the source of truth documents—the production component rules YAML configuration, product image transformation specs with updated page counts for trays and ashtrays, the PPTX generation and layout engine spec covering slide dimensions and file naming conventions, and the artwork library file structure.

Now I'm mapping out the app specifications, starting with Google Drive folder organization and file naming conventions, the database schema including the new product families table, Shopify webhook integration with field mappings and handling for non-produced items, the packing sheet export with its full column definitions, and the web app screen inventory with navigation paths and user actions.

Continuing through the specs, I'm documenting the validation error codes and recovery procedures, authentication methods and PII handling for security, the complete technical stack with environment variables and API endpoints, test scenarios and acceptance criteria, sample data fixtures, and finally the deployment and operations runbook with setup instructions.

Now I need to be careful about formatting constraints - avoiding em-dashes, emojis, and keeping things concise while making sure the required hardcoded content is substantial rather than invented. I should use TBD only when genuinely uncertain about values. For the master list's YAML frontmatter, I'm thinking through the key fields like title, version, status, last verified date, owner, authors, primary systems, database dependencies, and core lifecycle states. The master list itself isn't really a source of truth document in the traditional sense.

Since this is an index document, I should list all database tables and primary systems since it references everything across the organization. The current date is 2026-06-14, so that's what I'll use for last_verified. I'll follow the markdown template the user provided exactly, using headers and tables as specified. For the approval status key, I need to define what "Requires owner approval" means - essentially that the owner needs to sign off before content is considered final.

Writing the index document now... I'm organizing the file structure now: YAML frontmatter at the top, followed by the title and intro, then the documentation tree and approval status key. After that I'll lay out the source-of-truth hierarchy and work through each directory section with its file entries, covering the project files, source of truth docs, app specs, testing materials, and operations documentation.

Now I'm reviewing the SKU family configurations and need to clarify what components map to each bundle — specifically the ASHGRD configuration, since it combines an ashtray with a grinder, but I need to determine which type of grinder it actually refers to given the distinction between the grinder sets and the individual herb grinder. So the GRD component code refers to the Herb Grinder, which the owner said to ignore for MVP, but the Image Transformation Guidelines already define specific dimensions for grinders (2.35" diameter, 12 per page). There's a real conflict here between what was previously approved and what the owner wants deferred, especially since the old product bundles like the ashtray + grinder were actual products being sold.

Looking back at the original transcript, I see that a Grinder Set is a sellable product that breaks down into component images—a grinder image, jar image, and tray image. The question is whether that "grinder" component is the same as the standalone Herb Grinder product the owner wants to ignore, or if it's a separate component used only within bundles.

The owner's clarification resolves this: use `GRS` for Grinder Sets and `GRD` exclusively for the standalone Herb Grinder product. This means the grinder component inside Grinder Sets needs its own distinct code to avoid the naming conflict. The owner was clear that `GRD` shouldn't be used for both Grinder Sets and Herb Grinder in the family code system, so I need to switch to `GRS` for Grinder Sets. The component code system can keep using `GRD` for the grinder image since it's a separate domain, though renaming it there too might help avoid confusion across tables. one is. I'm weighing whether to keep the component code GRD as-is with clear documentation in tables, or rename it to avoid confusion. Since the Herb Grinder family is deferred for MVP anyway, the naming conflict is theoretical right now — component GRD just refers to the grinder image element, and when the standalone product eventually launches, it would use a different family code.

Actually, this resolves cleanly: the family code GRD (for Herb Grinder) would naturally produce a GRD component, just like how ASH family produces an ASH component. So I can keep component codes unchanged, use the new family dictionary at the family level (GRS for Grinder Sets, GRD reserved for future Herb Grinder), and satisfy the owner's constraint about not using GRD for both — they're distinct in their respective domains.

Now I'm ready to write this up carefully, making sure to distinguish between family and component codes, and I'm also noticing the wallet situation mirrors the lighter approach: one source file with two component placements for front and back positioning.

For the artwork file structure, I'm settling on using the family code as the filename rather than duplicating files, so each design gets a single PNG per product family—like `artwork/{DESIGN_CODE}/LIT.png` for both lighter placements and `artwork/{DESIGN_CODE}/WAL.png` for wallet placements. I'll keep my explanations concise and get the file created.

Both decisions logged. The Decision Log now has zero open items and the Technical Architecture document is fully unblocked. Generating the master list as a deliverable file.

---

# claude response

Thinking

The user resent the same prompt, likely because they didn't see my previous response or want me to verify the file. I'll move the file to the outputs folder and present it to them.

The file was created during the prior turn. Copying to outputs and presenting now.

2,640 lines. Covers all 26 documents in the approved architecture (3 project files, 8 SOT files, 7 app specs, 2 test docs + 8 fixtures, 1 runbook).

Notes on what's in versus what's deferred:

- All 26 approved decisions are reflected in the Decision Log section and propagated into every affected file's Required Hardcoded Content. No open items remain in the Decision Log table.
- The full 13-family SKU dictionary, the complete decomposition rules, the full `production_component_rules.yaml` skeleton, the full Image Transformation table, the full API endpoint table, the full Celery task list, the env var checklist, and the 20-scenario test plan are all hardcoded.
- Items marked `TBD requires owner approval` are restricted to: hosting platform choice, deployment commands once platform is chosen, PPTX grid layouts for Grinder/Jar/Tin (which have approved per-page counts but no owner-specified row/column arrangement), reprint display format on packing sheet, and retention policy beyond MVP. None of these block document generation; they're hooks for owner sign-off later.
- Component code `GRD` (grinder image) versus family code `GRD` (Herb Grinder, deferred) is explicitly disambiguated in the SKU Guide's Namespace Clarification section.

Ready for Prompt 4.

---

# you asked

message time: 2026-06-14 13:27:23

With all the information we have gathered in this chat conversation, list the documents we can confidently create now.

---

# claude response

Based on the Decision Log (all 26 decisions closed) and the content hardcoded in the master list, here is the breakdown:

---

## Documents Confidently Creatable Now

These documents have all required content defined in the conversation threads and the master list. No owner input is needed before writing them.

### 00_project/

| File | Reason |
| :--- | :--- |
| `Decision_Log_and_Open_Questions.md` | All 26 decisions are fully documented with dates and affected documents. The open questions table is empty. |
| `Coding_AI_Context.md` | Stack, conventions, SOT index, and behavioral rules for the AI are all confirmed. |

`MVP_Scope_and_Roadmap.md` is close but the hosting platform TBDs (deployment targets) prevent the runbook-adjacent sections from being final. The scope itself is fully writable; flag the hosting section.

---

### 01_source_of_truth/

| File | Reason |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | All four enums, all state machine transitions, cross-entity rules, and mixed-order logic are fully specified. |
| `SKU_and_Internal_ID_Guide.md` | 13-family dictionary, all option/config code tables, parser contract, validation failure codes, namespace clarification, and family behavior flags are complete. |
| `Production_Component_Decomposition_Rules.md` | Full decomposition table for all 13 families, same-source-file rule for lighter and wallet, quantity rule, and deferred-MVP behavior are all locked. |
| `production_component_rules.yaml` | Complete YAML skeleton is hardcoded in the master list. This is a direct write. |
| `Product_Image_Transformation_Guidelines.md` | All 8 product specs are resolved: dimensions, shapes, borders, adjustments, per-page counts (tray=3, ashtray=6), and same-source-file notes. YAML header correction is documented. |

`End_to_End_Fulfillment_Workflow_SOT.md` is writable but references the packing sheet and batch lifecycle behavior; write it after the two files above so cross-references are accurate.

`Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` is writable for structure, paths, component-to-file mapping, and auth method. One soft TBD remains (stricter versioning policy) but it does not block writing the document.

---

### 02_app_specs/

| File | Reason |
| :--- | :--- |
| `Shopify_Integration_and_Order_Import_Spec.md` | Webhook trigger, required fields, idempotency, import algorithm, non-produced routing, GRD routing, and canceled-order behavior are all defined. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Full 16-row error catalog with triggers, messages, recovery actions, and blocking behavior is hardcoded. Reprint workflow is defined. One minor TBD (reprint packing sheet display format) does not block writing. |
| `Security_Access_and_Privacy_Spec.md` | Auth method, credential storage, PII fields, Drive permissions, audit event list, and future role table are all defined. Retention policy TBD is minor and does not block writing. |
| `Technical_Architecture_and_API_Contract.md` | Full stack, complete API endpoint table, Celery task list, file generation flow, and env var list are defined. Only the hosting platform choice is TBD, which affects two rows in the deployment targets table. |

`Data_Model_and_Database_Schema.md` has the `product_families` table, status enum mapping, index list, and full table inventory defined. Field-level definitions for the other 14 tables are marked as developer-authored. Writable now with those sections flagged for developer completion.

`Packing_Sheet_Export_Spec.md` and `Web_App_Screen_Inventory_and_UX_Flow.md` are writable; minor TBDs (label/packed/tracking status columns) are already marked as empty-for-MVP placeholders in the master list.

---

### 03_testing/

| File | Reason |
| :--- | :--- |
| `Test_Plan_and_Acceptance_Criteria.md` | All 20 scenarios with fixtures, expected outputs, and pass conditions are defined. |
| `Sample_Data_and_Fixtures.md` | Fixture file index, schema notes, and usage section are complete. |
| `fixtures/expected_batch_assignments.csv` | All 10 component-to-batch-group mappings are hardcoded. This is a direct write. |
| All 5 JSON fixture files | Payload shapes and required SKUs are specified in the master list. Content is formulaic against the Shopify Admin API payload shape. |
| `fixtures/expected_components.csv` | Columns and required rows (including LITF/LITB same-file rows) are specified. |
| `fixtures/expected_packing_sheet_rows.csv` | Columns mirror the packing sheet spec; content derives from the mixed-order fixture. |

---

### 04_operations/

`Deployment_and_Operations_Runbook.md` is writable for local dev setup, database migration, Shopify webhook registration, Google Drive setup, and Celery setup. The production deployment section has TBDs pending the hosting platform decision but can be written with placeholders.

---

## Summary

**Confidently writable now (no owner input needed):** 24 of 26 documents, including all fixtures.

**Blocked or partially blocked:**
- Hosting platform decision (affects deployment targets in `Technical_Architecture_and_API_Contract.md` and production section of `Deployment_and_Operations_Runbook.md`). All other sections of both docs are writable.
- `MVP_Scope_and_Roadmap.md` hosting-related rows (two table cells). The scope content itself is fully writable.

None of the 26 documents need to wait entirely. Every document can be written now with TBD placeholders in the two deployment-target cells.