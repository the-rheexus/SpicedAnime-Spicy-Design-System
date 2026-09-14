---
title: "Web App Screen Inventory and UX Flow"
version: "1.20"
status: "Pending Owner Verification"
last_verified: "2026-09-02"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
  - PPTX Generation Engine
  - Packing Sheet Exporter
database_dependencies:
  - orders
  - order_items
  - production_components
  - production_batches
  - batch_items
  - artwork_assets
  - artwork_revalidation_runs
  - offer_skus
  - packing_exports
  - generated_files
  - audit_events
  - webhook_receipts
core_lifecycle_states:
  - Open
  - Locked for Review
  - Printed
  - In Production
  - Fulfilled Externally
  - Canceled
  - Blocked
  - Deferred MVP
---

# Web App Screen Inventory and UX Flow

Defines every screen in the SpicedAnime Fulfillment MVP web app: name, URL path, primary operator action, visible data, and buttons/actions available on each screen. Provides the coding AI with concrete UI routes and operator workflow sequences.

**Stack:** Next.js + React + TypeScript (frontend). Frontend communicates with the Django REST API backend over HTTPS.

**Scope:** This document covers screen structure and operator workflows only. Business rules live in the SOT documents. Database schema lives in `Data_Model_and_Database_Schema.md`. API endpoint details live in `Technical_Architecture_and_API_Contract.md`. Image transformation parameters live in `Product_Image_Transformation_Guidelines.md`.

---

## 1. Screen Inventory

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

---

## 2. Per-Screen Detail

### 2.1 Dashboard — `/`

**Primary Purpose:** Operator entry point. Surfaces the current state of all active production batches, items requiring attention, integration health, and recent system activity.

**Primary Data Displayed:**

| Data Element | Source |
| :--- | :--- |
| Count of active `Open` batches per production group | `production_batches` |
| Needs Attention total covering blocked components, Missing SKU items, and deferred items | Existing Dashboard and Needs Attention data |
| Needs Attention breakdown counts for blocked components, Missing SKU items, and deferred items | Existing Dashboard and Needs Attention data |
| Count of orders in `Queued for Production` | `orders` |
| Shopify, Google Drive, and Celery integration health | Existing Settings integration-status data |
| Recent system activity (last N audit events) | `audit_events` |

**Available Actions:**

| Action | Destination |
| :--- | :--- |
| Click the Open Batches tile | `/batches` |
| Click the Needs Attention tile | `/needs-attention` |
| Click the Queued tile | `/orders` |
| Click the System Status tile | `/settings` |
| Click a per-group Open Batches card | `/batches` pre-filtered to that production group |
| Click "View all" in the Needs Attention preview panel | `/needs-attention` |
| Use an inline resolution control in the Needs Attention preview panel | Existing corresponding Needs Attention action only |
| Navigate via nav links | `/batches`, `/orders`, `/needs-attention` |

**Dashboard tile set (Decision #93).** The Dashboard presents four tiles: Open Batches, Needs Attention, Queued, and System Status. This supersedes the Decision #63 four-card set of Open Batches, Blocked, Deferred, and Queued. The Blocked and Deferred cards are merged into the single Needs Attention tile because both concerns route to `/needs-attention`.

The Needs Attention tile displays the existing combined attention total covering blocked components, Missing SKU items, and deferred items. On mouse hover, it reveals an informational breakdown showing the count for each contributing category: blocked components, Missing SKU, and deferred items. The breakdown rows are labels with counts, not separate navigation targets. Clicking the tile itself navigates to `/needs-attention`. The label "Missing SKU" is used in the interface instead of the raw `NO_SKU` code per Decision #88. Decision #93 changes presentation and navigation only; it introduces no new status string, counting rule, lifecycle behavior, or data-model behavior. Existing sandbox-exclusion rules remain unchanged.

Each per-group Open Batches card carries a single button that opens Current Batches pre-filtered to that production group; the duplicate second button remains removed per the unaffected provisions of Decision #63.

**Needs Attention preview panel (Decision #90).** The Dashboard renders a preview panel listing the highest-priority attention items, ordered blocked first and then oldest first, with a "View all" control linking to `/needs-attention`. The panel draws on the same data as the Needs Attention screen, which remains the authoritative screen for this content. A preview row shows an inline resolution control only where that action already exists on Needs Attention; no new operator action is introduced.

**System Status tile (Decision #90).** The System Status tile surfaces the Shopify, Google Drive, and Celery integration health already exposed read-only on Settings (Decision #38) and links to `/settings`. It renders the same connected / not-connected vocabulary and introduces no new status string.

**Aging flag (Decisions #75, #87).** Batch rows display the aging flag once the batch has been open 4 or more calendar days, using the Warning tone and `clock` icon defined in `Frontend_Color_System.md`.

**Active Batches production section (Decision #95).** The production-list section heading is `ACTIVE BATCHES`. This heading describes the operator-facing purpose of the panel and does not rename the canonical lifecycle state: every row remains an `Open` batch. Group and Batch remain separate columns. Group displays the production-group name, while Batch displays only the sequence number in `#N` form and never repeats the group name. The timestamp column is labeled `Started`.

**Bounded operational panels (Decision #95).** Recent Activity is a bounded scrollable feed capped at 25 entries. Needs Attention is a bounded scrollable preview capped at 30 eligible items after its existing filtering and priority ordering. Recent Activity uses semantic activity icons. Each panel keeps its section heading and `View all` control outside the scrollable content region so those controls remain visible while the operator scrolls.

A collapsed `Status Guide` displays only `Open`, since this screen's batch list can only ever show `Open` batches. The Needs Attention tile and preview panel do not widen the Dashboard batch-status vocabulary, and the System Status tile renders integration health rather than a lifecycle status. The Status Guide is closed by default per Decision #107.

---

### 2.2 Orders — `/orders`

**Primary Purpose:** Search, filter, browse, and initiate eligible bulk reprints for Shopify orders ingested by the system.

**Primary Data Displayed:**

- Primary table columns, in order: `Order #`, `Order Date`, `Status`, `Items`, `Attention`, `Reprint`. Customer name is not displayed on Orders (Decision #94).
- `Order #` is the strongest visual identifier in each row. Its header remains a clickable sort control cycling unsorted → ascending → descending → unsorted, with a chevron indicator. Sorting is applied server-side across the full result set, not just the current page.
- Multi-select filterable by order status: the operator toggles one or more status pills on or off, narrowing the list to their union (e.g. `Queued for Production` and `In Production` selected together). The filter list is derived from the MVP-visible order-status allowlist: `Queued for Production`, `In Production`, `Fulfilled Externally`, `Canceled`, and `In Production (Needs Reprint)` (Decision #71). `Being Packaged` and `Shipped` are Phase 3 states, declared but not reachable in MVP, and are excluded from this filter list and from the underlying query, so a manually inserted row in either state cannot surface even via a direct filtered URL.
- Date filtering includes one-click `Today`, `Yesterday`, and `Last 7 Days` shortcuts alongside the custom date range.
- `Attention` replaces the permanent `Blocked` column. It remains visually quiet when there is nothing to resolve and shows a concise indicator such as `Blocked 2` when an order has blocked components. `Blocked` remains the underlying component status represented by this screen.
- Row-level checkboxes allow the operator to select eligible orders for bulk reprint. A header checkbox selects or clears selectable orders on the current result page and displays an indeterminate state when only part of that page is selected.
- Reprint item selection expands as an accordion directly beneath the affected order row. Expanding an eligible order reveals its `Printed` items in place rather than in a detached area below the full order list. Paired front/back items, LITF/LITB and WALF/WALB, remain shown and selected together.
- `Select items` is not displayed for an order that has no eligible reprint items.
- The filter area retains search, status filtering, and custom date range but uses tighter spacing and lighter status-filter treatment so the order table remains the visually primary object.
- Server-side pagination. Default page size is 50 orders (Decision #79). A "Per page" dropdown at the bottom of the list lets the operator switch between 20, 50, and 100 orders per page; changing the page size resets the list to page 1.
- A collapsed `Status Guide` displays the order statuses shown on this screen, including `In Production (Needs Reprint)` (Decision #71), paired with `Blocked`, the component status represented by the `Attention` column. The Status Guide is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Search | Filter orders by order number. Customer name is not an operator-facing Orders search field (Decision #94). |
| Filter by status | Toggle one or more status pills to narrow the list to their union (e.g. both `Queued for Production` and `In Production` at once). |
| Filter by date | Use `Today`, `Yesterday`, `Last 7 Days`, or the custom date range to narrow the list. |
| Sort by Order # | Cycles the list through unsorted, ascending, and descending order by order number, sorted server-side across all matching results. |
| Change page size | Select 20, 50, or 100 orders per page from the "Per page" dropdown; resets to page 1. |
| Open Order Detail | The order number is the row's detail link to `/orders/{id}`. Surrounding row whitespace does not navigate. The link follows the native-link behavior in Decision #108. |
| Select reprint items | Expands the eligible order inline and displays its reprintable `Printed` items directly beneath that order row. |
| Bulk Flag Reprint | For the selected orders and items, flags each selected `Printed` component (and its front/back pair, if any) as `Reprint Needed`, creates a new `Queued` component for each in the current `Open` batch, and transitions each affected order to `In Production (Needs Reprint)` (Decision #71). Uses the same underlying mechanics as the existing per-component reprint action. |

---

### 2.3 Order Detail — `/orders/{id}`

**Primary Purpose:** Inspect a single order's production state, Shopify line items, generated components, source/generated files, reprints, and complete order-specific lifecycle history.

**Primary Data Displayed:**

- Order number plus a connected four-part summary showing Status, Order Date, Items, and Production Components (Decision #98).
- Customer name and Sales Channel are not displayed. Customer name is not returned by the Order Detail API (Decision #94). Existing email and shipping-address behavior is unchanged.
- Financial Status and Fulfillment Status remain visible as plain label/value context rather than status badges. A null Shopify fulfillment status is displayed as `Unfulfilled`.
- Current order status may display `Fulfilled Externally` or `Canceled` for an order reconciled from Shopify or the historical reconciliation command, or `In Production (Needs Reprint)` for an order with an active reprint flag (Decision #71).
- Table of line items: SKU, product family, quantity.
- Table of generated production components: component code, design code, component status, assigned batch ID. A component whose stored status is `Canceled` is displayed with the label "Print Not Needed" (display-label override, Decision #64); this occurs for a component pulled from its batch due to order cancellation.
- Non-produced items listed separately (families BAT, HOD, PIL, TAP, TOT).
- Deferred items listed separately (`GRD` family, status `Deferred MVP`).
- A collapsed `Status Guide` displays the full order and component status vocabulary this screen can render, including `Canceled`. A production component with stored status `Canceled` is shown as "Print Not Needed" (Decision #64, display-label override only; stored value remains `Canceled`); the order-level `Canceled` status continues to display as "Canceled". The Status Guide is closed by default per Decision #107.
- The aging flag appears in the order header once the order has been open 4 or more calendar days, using the Warning tone and `clock` icon defined in `Frontend_Color_System.md` (Decisions #75, #87).

**Tab structure (Decisions #91, #102, #103).** This screen is organized into four tabs. Decision #91 established the four-tab structure. Decisions #102 and #103 expand the Files and reprints and History tabs so known order-specific information is available directly without forcing the operator to navigate to other screens.

| Tab | Contents |
| :--- | :--- |
| Production | The generated production components table, batch assignments, component statuses, and per-component actions. |
| Order items | The Shopify line items table, with non-produced items (BAT, HOD, PIL, TAP, TOT) and deferred `GRD`-family items in their own separately headed sections as already required above. |
| Files and reprints | Directly displays source artwork relevant to this order's production components, using available thumbnails and/or direct links to the source-artwork paths in Google Drive, together with generated output files associated with the order's batches/reprints and the existing reprint records/actions. The operator is not instructed to navigate to Artwork Library or Batch Detail merely to locate a known file. |
| History | One order-specific timeline containing the order's own audit events, component-level events for components belonging to the order, and relevant batch-level events for batches containing the order's components, most recent first. |

The reprint content in the Files and reprints tab preserves the existing mechanics: flagging a component transitions it to `Reprint Needed` and creates its replacement automatically per `Validation_Errors_Reprints_and_Recovery_SOT.md`. There is no reason field and no manual batch-assignment step. A reprint whose replacement component has not yet been assigned to a batch displays as "Awaiting batch" (Decision #88); "Open" is reserved for batch status and is never used for a reprint.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| View components | Displayed inline; no navigation required. |
| See batch assignments | Links to `/batches/{id}` for each assigned batch. The link follows Decision #108 native-link behavior. |
| Open source artwork | Opens the directly linked Google Drive source artwork associated with the relevant component. |
| Open generated file | Opens the directly linked generated output associated with this order's batches or reprints. |
| Manually re-import | Triggers idempotent re-import of this order from Shopify. Does not duplicate existing records; fills in missing components if the SKU dictionary has been updated. |
| Flag component for reprint | Transitions a `Printed` component to `Reprint Needed` (and its front/back pair, if any); a new component record is created for each and assigned to the current `Open` batch. If the order was `In Production`, it transitions to `In Production (Needs Reprint)` (Decision #71). |

---

### 2.4 Current Batches — `/batches`

**Primary Purpose:** View production batches grouped by production group, with controls for the active queue, individual lifecycle states, and the complete batch set.

**Primary Data Displayed:**

- One row per batch: batch ID, production group name, batch status, component count, date created.
- Batches grouped by production group: Lighter, Tin, Grinder/Jar/Tray, Ashtray, Box, Wallet.
- Status controls include `Active Queue`, the individual lifecycle states, and `All`. `Active Queue` is the active-production view. Selecting `All` removes the status constraint so `Open`, `Locked for Review`, `Printed`, and `Archived` batches are all eligible and render in the same grouped format (Decision #96).
- A collapsed `Status Guide` displays `Open`, `Locked for Review`, `Printed`, and `Archived`, since the screen's lifecycle filters can genuinely surface all four. The batch card badge displays "PPT Generated" in place of the raw `Locked for Review` string; this is a display-label override on this screen only. The underlying `production_batches.status` value, the Status Guide definition, the status filters, and every other screen continue to use the raw `Locked for Review` lifecycle value. The Status Guide is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Open Batch | A single link/control per card opens Batch Detail at `/batches/{id}`. Any duplicate second open control remains removed (Decision #63). Navigational batch links follow Decision #108 native-link behavior. |
| Filter by status | Choose `Active Queue`, an individual lifecycle state, or `All`. Selecting `All` clears the status constraint and can surface `Open`, `Locked for Review`, `Printed`, and `Archived` together (Decision #96). |
| Filter by production group | The production-group filter accepts a URL parameter so the Dashboard can deep-link into a single group (Decision #63). |

Batch rows display the aging flag once a batch has been open 4 or more calendar days, using the Warning tone and `clock` icon defined in `Frontend_Color_System.md` (Decisions #75, #87). The flag is a time signal, not a lifecycle status; it does not appear in this screen's Status Guide and does not affect the status filter.

---

### 2.5 Batch Detail — `/batches/{id}`

**Primary Purpose:** Inspect a single batch, optionally select a subset of its components, trigger PPTX generation (full or selected), confirm physical printing, and sort/filter the component list while remaining usable for batches containing hundreds of rows.

**Primary Data Displayed:**

- Batch ID, production group, status, date created, date locked, date printed.
- Component list: a leading checkbox column, design code, component code, order number, order date, component status. The Order column header is a clickable sort control cycling unsorted → ascending → descending → unsorted, with a chevron indicator; screen sort order does not affect PPTX component placement order (component-ID order is unchanged). The order date column is display-only and carries no sort control of its own.
- For batches containing at least one component with a resolved border color (White/Gold/Silver per Decision #57 — currently `LITF`, `LITB`, `TIN`), a Color column is shown in the component list and a row of single-select Color filter pills (plus an "All Colors" option) appears above the table, narrowing the displayed rows to one selected color at a time. The column and filter are both omitted entirely for batches with no color-variant components. The displayed color is derived from the same resolution logic PPTX generation uses. Filtering by color is display-only and does not affect selection state, pair-keeping selection logic, or the Generate PPTX component set.
- A header checkbox for select-all / select-none, and a live "X of Y items selected" count.
- The component table uses a sticky header so column labels remain visible while scrolling deep into large batches (Decision #101).
- Component rows use virtualized rendering/scrolling for large batches. Selection state, pair auto-inclusion, sorting, color filtering, and the generated component set remain correct regardless of which rows are currently mounted or visible in the viewport (Decision #101).
- Count of `Ready` components included in generation vs. `Blocked` components excluded.
- Preview thumbnails (post-generation, of the locked/generated file).
- Download link for generated PPTX file (post-generation).
- A collapsed `Status Guide` displays the full component status vocabulary this screen can render, including `Canceled`, which is shown with the label "Print Not Needed" per Decision #64. The Status Guide is closed by default per Decision #107.

**Available Actions:**

| Action | Availability | Behavior |
| :--- | :--- | :--- |
| Generate PPTX (All Items) | Batch is `Open`; no proper subset is selected | This is the primary generation action when no proper subset is selected. Selecting every eligible item canonicalizes to this same full-batch branch. See Operator Action Sequence in Section 3.1. |
| Generate PPTX (Selected Items) | Batch is `Open`; a proper subset is selected | The primary generation action changes contextually to the selected-items label while the live selected-item count remains visible. A new `Locked for Review` batch is created holding only the selected and pair-expanded components; the original batch stays `Open` with the remainder. See Operator Action Sequence in Section 3.1a. |
| Download Preview PPTX | Batch is `Open` | Generates the full production-quality PPTX for the batch's current contents and returns a Drive link, with no lock transition, no new batch, and no component status change (Decision #72). Repeatable; reflects the batch's contents at the moment it is clicked. |
| Mark Printed | Batch is `Locked for Review` | See Operator Action Sequence in Section 3.2. |
| View preview thumbnails | Post-generation | Display slide preview images inline. |
| Download generated file | Post-generation | Direct download of the PPTX from Google Drive. |
| Sort by Order | Any batch state | Cycles the component list through unsorted, ascending, and descending order by order number. Selection state and PPTX placement order are unaffected by sort. |
| Filter by color | Batch contains at least one color-variant component | Narrows the displayed component list to one selected color at a time, or clears back to All Colors. Does not affect selection state or the Generate PPTX component set. |

Selecting one half of a front/back pair (LITF/LITB or WALF/WALB from the same order item) automatically includes the sibling component in the selection.

---

### 2.6 Needs Attention — `/needs-attention`

**Primary Purpose:** Surface all components that could not be routed to a normal production batch, plus a read-only record of failed Shopify webhook deliveries, organized into four counted queues using a single queue switcher (Decisions #97, #104).

**Queue switcher and workspace behavior (Decision #97).** Needs Attention provides one counted queue switcher with `Blocked`, `Missing SKU`, `Deferred`, and `Webhook Failures`. Only the selected queue occupies the main workspace at a time; this replaces the stacked multi-section layout. The navigation badge continues to count `Blocked` components (including `NO_SKU`).

#### Queue 1: Blocked

Contains production components with status `Blocked`. Rows are visually grouped by affected order item, validation failure, and resolution so the operator can resolve the root cause rather than inspecting repetitive component rows.

**Default columns:** `Order`, `Item / SKU`, `Components`, `Issue`, `Resolution`.

- `Order` links to the order via Decision #108 native link behavior.
- `Item / SKU` identifies the affected line item.
- `Components` identifies the count and component codes affected.
- `Issue` displays the plain-language failure description per Decision #88 and `Validation_Errors_Reprints_and_Recovery_SOT.md`.
- `Resolution` provides the inline action or clear recovery guidance.
- Technical details disclosure: An expandable row disclosure retains family, config, design code, raw validation error code, expected Drive path, and component IDs for engineering or deep troubleshooting without cluttering the primary operator workspace.

**Available Actions per Blocked Item:**

| Action | Behavior |
| :--- | :--- |
| Re-upload artwork | Opens artwork upload flow for the missing file; resolves `MISSING_ARTWORK` errors. |
| Fix SKU mapping | Navigates to `/sku-manager` to create or correct the canonical SKU. |

#### Queue 2: Missing SKU

Contains items blocked with validation failure code `NO_SKU` (Decisions #67, #70, #88). The queue label reads `Missing SKU` while the stored validation code remains `NO_SKU`.

**Workspace presentation:** The table combines product name and variant options into one `Item` column, alongside `Order`, `Line Item`, and an explicit `Action` column.

**Individual and bulk recovery (Decision #104):**

- Single-item generation: The operator can click `Generate SKU` on any row to generate and review a proposal for that item immediately.
- Multi-item selection and proposal generation: Row checkboxes and a select-all control let the operator select multiple unresolved items and generate proposals in bulk.
- One-page review workspace: Generated proposals are collected into a dedicated review workspace showing each affected item and its proposed canonical SKU. Proposals may be approved or rejected individually, or approved/rejected as a reviewed set from one page.
- Rejected proposals are discarded and not persisted.
- Approved proposals are saved to `offer_skus` through the existing canonical-SKU persistence logic and become eligible for the cumulative full-Shopify-product CSV export (Decision #99).
- Bulk order reimport: After approving one or more proposals, a single bulk reimport action reimports the distinct affected order IDs from Shopify, creating the missing production components without manually reimporting orders one by one.

#### Queue 3: Deferred

Contains production components with status `Deferred MVP` (`GRD` family). This queue is informational and expected.

**Columns:** `Order`, `Item / SKU`, `Reason`.

**Available Actions:** None. The Deferred queue is read-only.

#### Queue 4: Webhook Failures

Contains all `webhook_receipts` rows with `outcome = 'Failed'`. Informational and read-only; not counted in the navigation badge.

**Columns:** `Topic`, `Shopify order reference`, `Failure summary`, `Received at`.

**Available Actions:** None.

A collapsed `Status Guide` explains `Blocked` and `Deferred MVP`. It is closed by default per Decision #107.

---

### 2.7 Artwork Library — `/artwork`

**Primary Purpose:** Browse, sort, upload, replace, retire, and revalidate design artwork files.

**Primary Data Displayed:**

- Grid or list of all artwork assets: design code, component code, file path, status (`Available`, `Missing`, `Retired`), last updated date.
- Thumb column: for assets with `status: Available`, the actual artwork image is fetched via `GET /api/artwork/{id}/thumbnail/` and rendered. For any other status, or if the fetch fails, the existing component-code fallback label is shown instead.
- Sort controls on Design and Updated (Decision #100). The Design header is a clickable sort control whose first click sorts A–Z and whose second click sorts Z–A. The Updated header is a clickable sort control whose first click sorts newest first and whose second click sorts oldest first. Sorting is executed server-side across the full matching result set, not only the current page. The active sort column and direction are visibly indicated in the table header.
- Server-side pagination. Default page size is 50, matching the Orders screen (Decisions #63, #79). A "Per page" dropdown (20, 50, 100) at the bottom of the list lets the operator change it; changing the page size resets to page 1.
- A collapsed `Status Guide` displays the artwork asset status vocabulary (`Available`, `Missing`, `Retired`). It is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Sort by Design | Cycles through A–Z and Z–A across the full matching result set (Decision #100). |
| Sort by Updated | Cycles through newest first and oldest first across the full matching result set (Decision #100). |
| Upload | Add a new artwork file to the library. Creates or updates an `artwork_assets` record. |
| Replace | Overwrite an existing file at the same Drive path. Updates the `artwork_assets` record. Does not create a new record; Drive native version history serves as audit trail. |
| Retire | Sets the `artwork_assets` status to `Retired`. File remains in Drive but is no longer returned by lookups. |
| Revalidate Artwork | Triggers a manual read-only scan of the Drive `artwork/` subtree via `POST /api/artwork/revalidate/`. The button disables while running and guards against duplicate submission. On success, displays checked / found / resolved / missing / misplaced / duplicate / unknown counts with bounded root-relative path samples and refreshes the artwork list. On an incomplete scan, Drive configuration/authentication failure, worker unavailability, or task failure, displays a distinct terminal message for each case; an incomplete scan explicitly does not refresh the list. All states are announced through an accessible status region. |
| Change page size | Select 20, 50, or 100 per page from the "Per page" dropdown; resets to page 1. |

---

### 2.8 SKU Manager — `/sku-manager`

**Primary Purpose:** Show the live Shopify product catalog alongside the canonical SKU dictionary, generate SKUs for products that have none, and repeatedly export a cumulative full Shopify product CSV for manual Shopify import (Decisions #69, #99).

**Primary Data Displayed:**

- One table combining the live Shopify catalog (`GET /api/shopify/catalog/`) with matching `offer_skus` rows: product name, product type, variant options (shown in a single "Options" column), current SKU if one exists, and active status.
- Filter controls: a text search box performing a case-insensitive substring match against product name and any segment of the canonical SKU (family, design, option codes, config) (Decision #82), a product-type exact filter, and a has-SKU / no-SKU / all filter. Filtering calls the backend; client-side filtering is not used.
- Server-side pagination. Default page size is 50 (Decisions #63, #79). A "Per page" dropdown (20, 50, 100) at the bottom of the list lets the operator change it; changing the page size resets to page 1.
- A collapsed `Status Guide` displays the `is_active` flag vocabulary rendered on this screen (`Active`, `Retired`). It is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Create SKU (single or bulk select) | Select one or more products with no SKU, then call `POST /api/skus/generate/`. For each selected product, the engine proposes a SKU and design code; for families where the bundle/config is ambiguous, the operator is shown the full set of possibilities and picks one or more. Accepted proposals are saved to `offer_skus` and immediately participate in the cumulative CSV export. |
| Edit canonical SKU | Update fields on an existing `offer_skus` row. |
| Retire canonical SKU | Set active flag to false on an `offer_skus` row. Retired rows are excluded from export. |
| Export SKUs to CSV | Downloads `GET /api/skus/export.csv`. Each download produces a fresh copy of the immutable master full Shopify product CSV and applies every active canonical `offer_skus` assignment cumulatively, preserving all non-SKU source cells and failing closed on ambiguity or conflicts (Decision #99). Manual upload to Shopify remains a human step; the app never writes to Shopify directly. |
| Change page size | Select 20, 50, or 100 per page from the "Per page" dropdown; resets to page 1. |

---

### 2.9 Packing Queue — `/packing`

**Primary Purpose:** Trigger combined XLSX packing sheet exports, enforce contiguous export limits, and access past export files.

**Primary Data Displayed:**

- Export window selector (default: since last export). If the operator selects a date range greater than the 30-day maximum contiguous export window, the export is clamped to the first 30 days and the interface displays: `Export limit reached (30 days max). Exporting the first 30 days now. Please run another export for the remaining dates once this completes.` (Decision #106).
- Table of past packing sheet exports: export date, export window start/end, file link, status. The past-exports table does not display a redundant generated export name such as `Packing Export (YYYY-MM-DD - YYYY-MM-DD)` when the window start and window end columns already present that information (Decision #106).
- Customer names remain present in the generated XLSX packing sheet and in packing-queue context where fulfillment requires them (Decision #94).
- A collapsed `Status Guide` displays the export job status vocabulary. It is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Trigger export | See Operator Action Sequence in Section 3.3. |
| Download past XLSX | Direct download of a previously generated packing sheet from Google Drive. |

---

### 2.10 Settings — `/settings`

**Primary Purpose:** Read-only visibility into system integration health: Shopify, Google Drive, and Celery worker status (Decision #38). Credential rotation is performed via server-side environment variables per `Security_Access_and_Privacy_Spec.md`, not through the app.

**Primary Data Displayed:**

- Shopify integration status card sourced from `GET /api/settings/integration-status/`: `shopify.connected` (boolean), `shopify.last_webhook_at` (ISO timestamp or `null`), `shopify.api_version` (string or `null`).
- Google Drive integration status card sourced from `GET /api/settings/integration-status/`: `drive.root_folder_configured` (boolean), `drive.last_export_at` (ISO timestamp or `null`).
- Celery worker status card sourced from `GET /api/settings/integration-status/`: `celery.worker_reachable` (boolean).

All Settings data comes exclusively from `GET /api/settings/integration-status/`. The screen never renders secret values (store domain, access tokens, webhook secret, Drive credentials JSON, or Drive folder ID); the endpoint contract guarantees these are never returned.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| View system status | Read-only panel; no action required. Settings has no write actions for MVP (Decision #38). |

A collapsed `Status Guide` displays the integration-health vocabulary rendered on this screen (connected/not connected, reachable/not reachable). It is closed by default per Decision #107.

---

### 2.11 Audit Log — `/audit-log`

**Primary Purpose:** Read-only timeline of all system actions. Optional for MVP.

**Primary Data Displayed:**

- Chronological list of `audit_events` records: timestamp, event type, actor, affected object (order ID, batch ID, component ID), description.
- Filter controls call `GET /api/audit-log/` with the backend query params `action` (exact match against the audit action string), `created_at_after` and `created_at_before` (ISO 8601 datetime; invalid values are ignored, never 500), plus the preserved `entity_type` and `entity_id` filters. Client-side filtering is not used.
- Server-side pagination. Default page size is 50 (Decisions #63, #79). A "Per page" dropdown (20, 50, 100) at the bottom of the list lets the operator change it; changing the page size resets to page 1.
- This screen deliberately has no `Status Guide`: it renders free-text action/entity descriptions, not a finite status vocabulary (Decision #107).

**Available Actions:** Change page size (select 20, 50, or 100 per page from the "Per page" dropdown; resets to page 1). Otherwise read-only.

---

### 2.12 Sandbox — `/sandbox`

**Primary Purpose:** Checkout synthetic test orders on demand from a fixed catalog of 14 sandbox SKUs, then generate and repeatedly regenerate PPTX output for every producing product type, without creating real Shopify orders or affecting real batches (Decisions #47, #58).

**Primary Data Displayed:**

- Checkout form: the 14 fixed sandbox SKUs, each with a quantity selector (0–10). Up to 7 order groups can be composed in a single checkout submission, each becoming its own sandbox order.
- Table of sandbox batches (`is_sandbox = true`), grouped by production group, mirroring the Current Batches layout: batch ID, production group name, component count, date created.
- Table of sandbox test orders (`is_sandbox = true`): order number (`TEST-` prefixed), SKU, component codes generated.
- A collapsed `Status Guide` displays only `Open`, since sandbox batches never leave `Open` status. It is closed by default per Decision #107.

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Checkout | Operator selects quantities (0–10 each) from the 14 fixed sandbox SKUs across up to 7 order groups and submits. Each order group becomes one new `TEST-` prefixed sandbox order with an auto-assigned sequential order number, flowing through normal component generation and batch assignment. |
| Reset sandbox data | Fully clears all current sandbox rows (`orders`, `production_components`, `production_batches`, `batch_items`). Does not recreate any orders; the operator checks out whatever is needed next. |
| Generate PPTX (sandbox batch) | Regenerates the PPTX for a sandbox batch in place. The batch remains `Open`; no lock transition; no new batch created. Unlimited repeat use. |

Testing a SKU outside the fixed 14 requires a separate pass to add it as a new sandbox item, with artwork supplied by the owner; it cannot be entered freely at checkout.

Sandbox rows never appear on the Dashboard, the Orders screen, the Current Batches screen, or in packing-sheet export selection.

---

### 2.13 Event Prints — `/event-prints`

**Primary Purpose:** Generate a real, production-quality print PPTX for producing products on demand, for conventions and in-person events, with no Shopify order and no production batch (Decision #73).

**Primary Data Displayed:**

- A list of saved event jobs, each showing its event name, event date, location, production-group count, sheet count, item count, and the timestamp of its most recent generation (Decision #92). A job that has never been generated displays "Never" rather than a timestamp.
- Products browsed by product type (Lighter, Grinder/Jar/Tray, Ashtray, Tin, Box, Wallet), with type as the primary navigation so a specific product can be found quickly.
- Within a type, a list of available designs (from the design-code registry, Decision #68) to select from, each with a quantity input.
- A page-layout preview showing how the current selection will be placed across printed pages, one preview per production group, including an indicator when the final page of a group is only partially filled (Decision #92). The preview is display-only and does not alter the PPTX layout engine or its output.
- A run history listing each past generation with its timestamp, job, production group, page count, item count, and the resulting Drive file link (Decision #92).
- No `Status Guide`: this screen has no lifecycle states to display (Decision #107).

**Available Actions:**

| Action | Behavior |
| :--- | :--- |
| Create or open a saved job | Creates a new named event job, or opens an existing one for editing. A job persists its event name, date, location, and its selected designs, production groups, and quantities (Decision #92). |
| Select products and quantities | Operator picks one or more designs across one or more product types and sets a quantity for each. |
| Generate Print Sheet | Builds the full production-quality PPTX for the current selection using the same layout and preprocessing engine as batch generation (Decision #72's Non-Batch Generation path), with no order and no batch created. Returns a Drive link to the saved file (`EVENT-{PRODUCT}-{YYYYMMDD}-{###}.pptx`, per `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`). One file is produced per production group in the selection. Each generation writes a run-history record (Decision #92). |

Saved jobs and run history require persistence and endpoints beyond the Decision #73 scope. The exact schema and API surface are to be defined during implementation and recorded in `Data_Model_and_Database_Schema.md` and `Technical_Architecture_and_API_Contract.md`; this section is not authoritative for either.

_Superseded (provenance only): this section previously stated that Event Prints runs are not listed or tracked for later re-download within the app, with the Drive file as the only persistent record. Decision #92 (2026-09-01) supersedes that rule._

---

## 3. Operator Action Sequences

### 3.1 Generate PPTX (All Items)

1. Operator navigates to `/batches/{id}` (Batch Detail) for an `Open` batch with no items selected.
2. Operator clicks "Generate PPTX (All Items)" (Decision #101).
3. Confirmation modal appears with batch summary.
4. On confirm: batch transitions to `Locked for Review`; new `Open` batch created for the production group; Celery task dispatched.
5. UI shows "Generation in progress".
6. On completion: download link is shown; batch detail refreshes with the generated file URL.

---

### 3.1a Generate PPTX (Selected Items)

1. Operator navigates to `/batches/{id}` (Batch Detail) for an `Open` batch and selects one or more components via the row checkboxes (front/back pairs auto-include their sibling).
2. Operator clicks "Generate PPTX (Selected Items)" (Decision #101).
3. Confirmation modal appears with the selected-item count.
4. On confirm: the server re-validates every selected component is still `Ready` and batch-resident. If any is stale, the request is rejected with `STALE_SELECTION` and no mutation occurs; the operator sees "Some selected items are no longer available: {list}. Refresh the page and try again."
5. If the selection equals every eligible component in the batch, the request canonicalizes to the all-items flow (Section 3.1).
6. Otherwise: a new `Locked for Review` batch is created holding only the selected components; the original batch remains `Open` with the remainder; Celery task dispatched against the new batch.
7. UI shows "Generation in progress".
8. On completion: download link is shown for the new batch; if generation fails, the selected components are merged back into the original `Open` batch and the failed batch record is deleted.

---

### 3.2 Mark Printed

1. Operator views a batch in `Locked for Review` status.
2. After physical printing, operator clicks "Mark Printed".
3. Confirmation modal: "Confirm batch was physically printed?".
4. On confirm: batch transitions to `Printed`; all contained components transition to `Printed`; order promotion check runs; relevant orders may transition to `In Production`.

---

### 3.3 Export Packing Sheet

1. Operator navigates to `/packing`.
2. Operator selects export window (default: since last export).
3. Operator clicks "Generate Packing Sheet".
4. Celery task generates XLSX; uploads to Drive.
5. Download link appears in the past exports list.

---

### 3.4 Checkout and Generate PPTX (Sandbox)

1. Operator navigates to `/sandbox`.
2. Operator sets quantities (0–10 each) against the 14 fixed sandbox SKUs, optionally across up to 7 order groups, and clicks "Checkout". Each order group is created as its own `TEST-` prefixed sandbox order with an auto-assigned sequential order number; components and batch assignment follow the normal flow.
3. Operator selects a sandbox batch and clicks "Generate PPTX".
4. Celery task builds the PPTX and uploads to Drive; the sandbox batch remains `Open` and is not locked.
5. Download link appears on the sandbox batch row. Operator may repeat step 3 an unlimited number of times against the same batch.
6. To start over, operator clicks "Reset sandbox data" on `/sandbox`; every sandbox row is cleared and the operator checks out again from step 2.

---

## 4. Navigation Structure

The persistent top-level navigation is a sidebar or top bar rendered on all screens. It contains the following links:

| Nav Item | URL | Notes |
| :--- | :--- | :--- |
| Dashboard | `/` | Always visible. |
| Orders | `/orders` | Top-level; Order Detail is a child route. Preserves native new-tab behavior (Decision #108). |
| Current Batches | `/batches` | Top-level; Batch Detail is a child route. Preserves native new-tab behavior (Decision #108). |
| Needs Attention | `/needs-attention` | Displays a badge with the count of `Blocked` components when non-zero, which includes components blocked with `NO_SKU` (Decisions #70, #97). Failed webhook deliveries are reported as a separate `webhook_failure_count` and do not contribute to this badge. |
| Artwork Library | `/artwork` | |
| SKU Manager | `/sku-manager` | |
| Packing Queue | `/packing` | |
| Settings | `/settings` | |
| Audit Log | `/audit-log` | Optional for MVP. |
| Sandbox | `/sandbox` | Isolated from real orders/batches (Decision #47). |
| Event Prints | `/event-prints` | On-demand convention and event print generation (Decisions #73, #92). |

**Child routes** (not in top-level navigation, accessible by clicking into a parent screen):

| Route | Parent Screen |
| :--- | :--- |
| `/orders/{id}` | Orders. Detail link on `Order #` uses native link behavior (Decision #108). |
| `/batches/{id}` | Current Batches. Detail link on batch open control uses native link behavior (Decision #108). |

---

## 5. Layout Assumptions

- Desktop-first layout. Minimum supported viewport width: **1280px**.
- Mobile responsiveness is deferred to Phase 2 or later. The MVP is not required to render correctly on mobile or tablet viewports.
- The frontend is built with **Next.js + React + TypeScript**. The frontend communicates with the Django REST API backend over HTTPS.
- No in-browser print integration. The PPTX download link opens the file for manual printing by the operator from their browser or file system.

---

## 6. Shared Display Conventions

Presentation patterns used on more than one screen. All are display-only: none alters a canonical status string, a stored value, or any business rule. Color and icon values are defined in `Frontend_Color_System.md`, not here.

**Status badges (Decisions #74, #85).** Every status badge pairs one of the six status tones with that tone's single fixed icon and an all-caps text label. Meaning is never carried by color alone. One icon per tone, used identically on every screen; the `clock` icon of the aging indicator is the only exception, because it flags elapsed time rather than a lifecycle state.

**Aging flag (Decisions #75, #87).** A compact "{n}D" flag with the `clock` icon in the Warning tone, shown once an order or batch has been open 4 or more calendar days. It appears on Orders, Order Detail, Current Batches, and the Dashboard batch table. It is not a lifecycle status: it never appears in a status key, and it never participates in a status filter.

**Lifecycle and readiness shown separately.** Where a component's batch-container state and its own validation state are both meaningful — principally Order Detail and Batch Detail — they render as two adjacent badges rather than one merged badge. Lifecycle answers where the component sits (not batched, in an open batch, locked for review, printed); readiness answers whether it can proceed (ready, blocked, deferred). The two vocabularies are distinct and are keyed separately.

**Segmented SKU display.** A canonical SKU renders as its parsed segments in separate adjacent chips (family, design, then the family's option and config segments) rather than as one undivided string, with a control to copy the full canonical string. Segment order and composition follow `SKU_and_Internal_ID_Guide.md`; this convention changes only how the SKU is displayed, never how it is parsed, stored, or generated. Used on Order Detail and SKU Manager.

**Pair grouping (Decision #86).** Components that move together as a unit — the front/back pairs LITF/LITB and WALF/WALB — are marked with a bracket along the left edge of the grouped rows and a "PAIR" label, in the violet grouping accent. This is a visual grouping only and carries no lifecycle meaning; each component in the pair still shows its own status badges. Where selection is available, selecting either half selects both, per the pair-keeping rule already defined in Section 2.5. A component that merely shares a source artwork file with another component, such as `TIN` alongside a lighter pair, is visually distinguished from a true pair and is not selected alongside it.

**Operator-facing labels (Decision #88).** Raw enum strings and internal codes are not shown as primary interface text where a plain-language equivalent exists; the raw value is retained as secondary detail where it aids support. This applies to validation failure codes and to the "Missing SKU" section label. Every such case is a display-label override: the stored value and the canonical string are unchanged, and the mapping is owned by the document that defines the code, not by this one.

**Collapsed status guides (Decision #107).** Where a screen documents a finite status or health vocabulary, definitions are rendered inside a collapsed `Status Guide` disclosure or equivalent compact info control that is closed by default and opens on demand. Screens that intentionally lack a finite status vocabulary (Audit Log, Event Prints) have no Status Guide.

**Native link semantics (Decision #108).** Elements whose purpose is navigation use native link semantics: left-click navigates in place, middle-click and modifier-clicks open in a new tab, and browser context menus retain new-tab options. Operational and mutation actions (such as generating PPTX, marking printed, reimporting, approving/rejecting proposals, uploading/replacing/retiring artwork, or exporting sheets) remain explicit buttons and do not become links.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | UI status displays must match the canonical enum strings defined there, including `Fulfilled Externally`, `Canceled`, and the MVP-visible allowlist. Exception: the Current Batches badge for `Locked for Review` displays "PPT Generated" per Decision #44; this is a scoped display-label override, not a change to the canonical enum string, which remains authoritative everywhere else. The Sandbox screen's batch-lock exemption for `is_sandbox = true` batches is defined there per Decision #47. A second scoped display-label override shows a `Canceled` production component as "Print Not Needed" per Decision #64; the stored component status remains `Canceled`. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Needs Attention screen Errors and webhook-failures sections display error types, messages, and recovery actions per the error type catalog defined there. |
| `Technical_Architecture_and_API_Contract.md` | Defines the API endpoints each screen calls, including the selective-generation, thumbnail, and four reconciliation-webhook endpoints. Screen actions must map to endpoints defined in that document. The Event Prints saved-job and run-history endpoints (Decision #92) are to be defined there. |
| `Frontend_Color_System.md` | Defines the tone, icon, and accent values behind every badge, aging flag, and pair bracket described in Section 6. This document assigns which status vocabulary each screen renders; that document defines how each one looks. |
| `SKU_and_Internal_ID_Guide.md` | Owns SKU segment order and composition, which the segmented SKU display convention in Section 6 renders without altering. |
| `Data_Model_and_Database_Schema.md` | The Event Prints saved-job and run-history tables (Decision #92) are to be defined there. |