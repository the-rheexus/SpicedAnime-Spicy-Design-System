---
title: "Technical Architecture and API Contract"
version: "1.6"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Shopify Admin API
  - PPTX Generation Engine
  - Packing Sheet Exporter
  - Cloud File Storage
  - Artwork Library
database_dependencies:
  - orders
  - order_items
  - offer_skus
  - artwork_assets
  - artwork_revalidation_runs
  - production_components
  - production_batches
  - batch_items
  - packing_exports
  - generated_files
  - audit_events
  - webhook_receipts
core_lifecycle_states:
  - Open
  - Locked for Review
  - Printed
  - Queued
  - Ready
  - Reprint Needed
  - Canceled
---

# Technical Architecture and API Contract

Single technical reference for backend and frontend implementation. Defines the confirmed stack, complete API surface, background job structure, file generation flow, environment variables, and environment definitions. Does not contain business rules, image transformation parameters, SKU format definitions, or database field definitions.

---

## Technical Stack

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

---

## Architecture Overview

The frontend (Next.js + React + TypeScript) and the backend (Django + Django REST Framework) run as separate processes. All communication between them is REST JSON over HTTPS. CORS configuration is required on the Django side to permit requests from the frontend origin.

- Browser (Next.js + React + TypeScript) calls the Django REST API over HTTPS.
- Django processes synchronous requests and dispatches background work to Celery.
- Celery workers consume a Redis-backed task queue. Redis serves as both broker and result backend.
- Celery tasks read from and write to PostgreSQL, and upload files to Google Drive via the Drive API.
- Shopify webhooks POST directly to a dedicated Django endpoint; that endpoint verifies the HMAC signature before any processing occurs.

---

## API Endpoint Table

All session-authenticated endpoints require an active Django session cookie. The Shopify webhook endpoint uses HMAC signature verification in place of session auth.

| Method | Path | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/webhooks/shopify/orders-paid/` | Shopify paid order webhook receiver. Unchanged pre-existing behavior; no delivery-ID requirement. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-updated/` | Shopify order-updated reconciliation webhook receiver. Refreshes shipping-address snapshot only. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-fulfilled/` | Shopify order-fulfilled reconciliation webhook receiver. Transitions qualifying orders to `Fulfilled Externally` and runs the same component pull-out as cancellation (Decision #42, Feature C amendment). Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/orders-cancelled/` | Shopify order-cancelled reconciliation webhook receiver. Transitions qualifying orders to `Canceled` and runs cancellation component pull-out. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `POST` | `/api/webhooks/shopify/refunds-create/` | Shopify refund-created reconciliation webhook receiver (the supported topic; `orders/refunded` does not exist as a Shopify topic). Same transition and pull-out behavior as `orders-cancelled/`. Requires `X-Shopify-Webhook-Id`. | HMAC signature |
| `GET` | `/api/auth/csrf/` | CSRF token bootstrap for the frontend session flow. Sets the CSRF cookie; returns no secret values. | None |
| `GET` | `/api/auth/session/` | Returns the authentication state of the current session for frontend session checks. | None |
| `GET` | `/api/orders/` | List orders with filters. Accepts optional Global Filter date range query parameters scoping returned orders to orders whose `shopify_created_at` falls within the selected range (Decision #110); empty selection returns all orders. Date-range semantics reuse the existing inclusive calendar-day boundary from the Orders date controls. Defensively filtered to the MVP-visible order-status allowlist, which includes `In Production (Needs Reprint)` (Decision #71); `Being Packaged` and `Shipped` never appear, including via an explicit `?status=` query. Each list row carries four correlated-subquery count fields (the `GET /api/orders/{id}/` detail payload is unchanged): `blocked_count` (integer — the order's `production_components` whose `status` is exactly `Blocked`); `has_blocked` (boolean — an `Exists` on the same predicate, so `has_blocked == (blocked_count > 0)` always holds); `reprint_eligible_count` (integer — the order's `production_components` whose `status` is exactly `Printed`, the same predicate the reprint action enforces; informational only — `POST /api/orders/bulk-flag-reprint/` still re-locks and re-validates and may reject stale eligibility, including the front/back-pair-unavailable case this count does not model); and `missing_sku_count` (integer, `0` when the order has no unresolved Missing SKU items — the count of the order's `order_items` whose `validation_failure_code` is exactly `NO_SKU`). All four are evaluated in the single list `SELECT` before pagination and add no JOIN, so `item_count` is not inflated and the list endpoint stays at two queries. `blocked_count` / `has_blocked` / `reprint_eligible_count` power Decision #105's Attention and Reprint columns (delivered by P116); `missing_sku_count` powers the Decision #111 Danger-styled `Missing SKU N` Attention indicator, shown in the same cell as `Blocked N` when both apply. Accepting a SKU and re-importing clears `validation_failure_code`, so `missing_sku_count` falls to zero with no separate resolved flag. The list also supports an optional server-side sort on a combined attention score (`blocked_count + missing_sku_count`), mutually exclusive with the existing `Order #` sort; exact query-parameter name(s) and values are deferred to implementation per the Decision #100 precedent (Decision #122). | Session |
| `GET` | `/api/orders/{id}/` | Get order detail. Customer name is not returned in this payload (Decision #94). Order-specific direct file/artwork access (Decision #102) and aggregated lifecycle history (Decision #103) are approved requirements whose technical response payload structures and/or supporting endpoints remain deferred to implementation. | Session |
| `POST` | `/api/orders/{id}/reimport/` | Manually re-import order from Shopify. | Session |
| `GET` | `/api/batches/` | List production batches grouped by production group, supporting active-queue, individual lifecycle, and `All` views (Decision #96). Accepts optional Global Filter date range query parameters scoping component counts and status aggregations (Decision #110); empty selection returns all batches. | Session |
| `GET` | `/api/batches/{id}/` | Get batch detail. Accepts optional Global Filter date range query parameters; components outside the range are hidden from the batch view, and component selection, pair-keeping, and generation eligibility apply only to the filtered set (Decision #110). | Session |
| `POST` | `/api/batches/{id}/generate-pptx/` | Trigger PPTX generation. Accepts an optional `component_ids` array in the request body. When the Global Filter is active and hides eligible components, absent, `null`, or empty `component_ids` executes as subset generation for the filtered eligible components only (Decision #110); selecting all visible components also executes as subset generation. The server independently verifies that no components hidden by the filter are included in the generated batch. An ineligible selection returns HTTP 409 with `error_code: "STALE_SELECTION"`. When no filter is active, absent, `null`, or empty runs the full-batch flow, and a selection equaling every eligible component canonicalizes to full-batch generation. | Session |
| `POST` | `/api/batches/{id}/mark-printed/` | Mark batch printed. | Session |
| `POST` | `/api/batches/{id}/preview-pptx/` | Generates a full production-quality PPTX preview of the batch's current contents with no batch/component mutation (Decision #72). Returns a Drive link; the file is not recorded in `generated_files`. Batch must be `Open`. | Session |
| `POST` | `/api/components/{id}/flag-reprint/` | Flag a component for reprint. | Session |
| `POST` | `/api/orders/bulk-flag-reprint/` | Flag reprint for a set of components across one or more orders in a single request. Accepts an array of `component_ids`; each is expanded to include its front/back pair (LITF/LITB, WALF/WALB) if applicable. Uses the same per-component mechanics as `/api/components/{id}/flag-reprint/` and additionally transitions each affected order to `In Production (Needs Reprint)` (Decision #71). | Session |
| `GET` | `/api/needs-attention/` | Return records for the four Needs Attention queues: `Blocked`, `Missing SKU`, `Deferred`, and read-only `Webhook Failures` (Decision #97). Accepts optional Global Filter date range query parameters scoping `Blocked`, `Missing SKU`, and `Deferred` records (Decision #110); `Webhook Failures` is never scoped and returns all records regardless of filter state. Single-item SKU generation and approval use existing SKU endpoints; while bulk proposal generation, set review, and bulk re-import are approved by Decision #104, the exact additional API surface for that workflow is deferred to implementation. `badge_count` covers actionable items (`Blocked` and `NO_SKU`); webhook failures are reported separately as `webhook_failure_count`. Each queue is returned sorted most-recent-first by default and accepts an optional server-side sort — by order number for the `Blocked`, `Missing SKU`, and `Deferred` queues, and by received time for `Webhook Failures`; exact query-parameter name(s) and values are deferred to implementation (Decision #123). | Session |
| `GET` | `/api/artwork/` | List artwork assets. Decision #100 requires server-side Design A–Z/Z–A and Updated newest/oldest sorting across the full matching result set. The exact sorting query-parameter names and values are deferred to implementation. | Session |
| `POST` | `/api/artwork/upload/` | Upload an artwork file. | Session |
| `POST` | `/api/artwork/{id}/retire/` | Retire an artwork asset. | Session |
| `POST` | `/api/artwork/revalidate/` | Trigger a manual read-only Drive artwork subtree scan and reconciliation run. Dispatches a Celery task and returns its task ID; if a scan is already active, returns the existing task ID with `reused: true` (HTTP 202). Returns HTTP 503 if Google Drive is not configured or Celery is unreachable. | Session |
| `GET` | `/api/artwork/{id}/thumbnail/` | Streams the asset's Drive image bytes through the app's own authenticated session, with `Cache-Control: private, max-age=300`. Returns HTTP 404 if the Drive file is unknown or gone, HTTP 502 on any other Drive operation failure, HTTP 503 if Drive is not configured. Used by the Artwork Library screen's Thumb column. | Session |
| `GET` | `/api/skus/` | List canonical SKUs. Supports optional query params `search` (case-insensitive substring match against SKU and design code), `is_active` (`true` or `false`), and `ordering` (server-side whole-catalog sort, e.g. `product_title`, `-created_at`, Decision #135). | Session |
| `POST` | `/api/skus/` | Create canonical SKU. `is_active` is optional on create and defaults to `true` when omitted. | Session |
| `PATCH` | `/api/skus/{id}/` | Update canonical SKU fields. | Session |
| `POST` | `/api/skus/{id}/retire/` | Retire a canonical SKU. | Session |
| `GET` | `/api/shopify/catalog/` | Live, read-only listing of the Shopify product catalog (products and variants). `has_sku` reflects whether the Shopify variant itself carries a non-blank SKU string, independent of any `offer_skus` match (Decision #81). A separate `offer_sku` field is populated only on a canonical active `offer_skus` match and is the sole driver of the SKU Manager's Edit/Retire SKU actions. Supports optional query params `product_type` and `has_sku` (`true` or `false`). Decision #82 additionally requires backend case-insensitive substring search against product name and the canonical SKU string; the exact search query-parameter name is deferred to implementation. Used by the rebuilt SKU Manager (Decision #69); the app never writes to this endpoint's underlying Shopify data. | Session |
| `POST` | `/api/skus/generate/` | Runs the SKU Auto-Generation Engine (`SKU_and_Internal_ID_Guide.md`) against one or more Shopify products/variants. Returns, per variant, the proposed SKU, design code, and any placeholder/warning flags; for families with more than one possible bundle/config value, returns the full set of possibilities rather than a single guess (Decision #69, Option A). Proposes `DESIGN` placeholder if design candidate is under 4 characters (Decision #135). Does not write to `offer_skus`; a separate save action does. Reused by the Needs Attention Missing SKU flow. | Session |
| `POST` | `/api/skus/generate/accept/` | Accepts one proposal returned by `POST /api/skus/generate/`. Creates the backing `designs` row first when the proposal introduced a new design code, then saves the SKU to `offer_skus` as `POST /api/skus/` does, capturing the Shopify product linkage used by the blank-SKU re-import fallback. A placeholder SKU is always rejected. Called once per proposal by the individual Accept action and by SKU Manager's Accept All Approvable (Decision #127). | Session |
| `GET` | `/api/skus/export.csv` | Downloads the cumulative full Shopify product CSV for manual Shopify import, applying all active canonical SKUs to the immutable master (Decision #99). See detailed contract below. | Session |
| `POST` | `/api/packing/export/` | Trigger packing sheet export. | Session |
| `GET` | `/api/packing/exports/` | List past exports. | Session |
| `GET` | `/api/dashboard/` | Dashboard summary metrics. Accepts optional Global Filter date range query parameters; when active, order-, batch-, and Needs-Attention-derived data are scoped to orders whose `shopify_created_at` falls within the selected range, and order-associated Recent Activity events follow the same date scope (Decision #110). The response includes a Filtered Production Summary based on purchased units using line-item quantity, not production-component count. Its accounting must reconcile `Included in filtered production + Not included in production + Missing SKU = Total items in date range`; the exact response payload structure is deferred to implementation. Integration/System Status remains global and is never filtered. | Session |
| `GET` | `/api/tasks/{task_id}/` | Read-only Celery task status polling via `AsyncResult`. Used by the Generate PPTX and packing export flows through the shared `useTaskPolling` frontend hook. | Session |
| `GET` | `/api/audit-log/` | Audit event timeline. Supports optional query params `action` (exact match against the audit action string), `created_at_after` and `created_at_before` (ISO 8601 datetime; invalid values are ignored, never 500), plus the preserved `entity_type` and `entity_id` filters. | Session |
| `GET` | `/api/settings/integration-status/` | Read-only integration health signals for Shopify, Google Drive, and Celery. Returns booleans, ISO timestamps or null, and one safe metadata string (`shopify.api_version`) only. Never returns secret values. | Session |
| `GET` | `/api/event-prints/products/` | Lists producing products/designs browsable by product type, for the Event Prints screen (Decision #73). Sourced from the design-code registry (Decision #68). | Session |
| `POST` | `/api/event-prints/generate/` | Builds a production-quality PPTX from an operator-selected set of designs and quantities, with no Shopify order and no production batch created (Decision #73). Returns a Drive link; the file is not recorded in `generated_files`. Each generation writes an `event_print_runs` record (Decision #92). One file is produced per production group in the selection. | Session |
| — | Event Prints saved jobs and run history | **TBD — Decision #92.** Endpoints are required to create, list, read, update, and delete `event_print_jobs`, and to list `event_print_runs` filtered by job. The exact paths, methods, and payload shapes are deferred to implementation and must be recorded in this table once defined. All such endpoints are Session-authenticated and operate only on Event Prints data; none touches orders, batches, or components. | Session |
| `GET` | `/api/sandbox/skus/` | List the 25 fixed sandbox SKUs available for checkout (Decision #132). | Session |
| `POST` | `/api/sandbox/checkout/` | Create up to 7 sandbox orders in one request. Body is a list of up to 7 order groups, each a list of `{sku, quantity}` entries drawn from the 25 fixed sandbox SKUs with quantity capped at 10 per entry. Each order group becomes one new `TEST-` prefixed sandbox order with an auto-assigned sequential order number, flowing through normal component generation and batch assignment (Decisions #58, #132). | Session |
| `POST` | `/api/sandbox/reset/` | Fully clear all sandbox rows (`orders`, `production_components`, `production_batches`, `batch_items`). Does not recreate any orders (Decision #58). | Session |
| `GET` | `/api/sandbox/batches/` | List sandbox batches (`is_sandbox = true`) and their components. | Session |
| `POST` | `/api/sandbox/batches/{id}/generate-pptx/` | Regenerate PPTX for a sandbox batch. Unlike `/api/batches/{id}/generate-pptx/`, the batch remains `Open`; no lock transition and no new batch is created (Decision #47). Returns HTTP 404 if the batch is not flagged `is_sandbox`. | Session |
| `GET` | `/api/batches/{id}/adjustments/` | Read the image adjustment state for a batch. Returns `batch_id`, `status`, and a `groups` array. Each entry in `groups` contains: `group`, `label`, `component_codes`, `ranges`, `defaults`, `overrides`, `effective`, `brightness_manual_override` (bool), `contrast_manual_override` (bool), and `editable` (`true` when `batch.status == "Open"`). Decisions #125, #131. Works for real and sandbox batches. | Session |
| `PATCH` | `/api/batches/{id}/adjustments/` | Write or clear image adjustment overrides for one control group on this batch. Accepts `brightness`, `contrast`, `saturation`, `sharpness`, `brightness_manual_override` (bool), and `contrast_manual_override` (bool). Writes across every component code in the group. Batch not `Open` returns 409. Decisions #125, #131. | Session |
| `PATCH` | `/api/print-templates/adjustments/` | Update the product-type default adjustments for one control group. Request body: `{"group": "<group key or label>", "values": {"<key>": <integer>, …}}`. `null` values are rejected. Decisions #125, #131. Not reachable from the Settings screen (Decision #38). | Session |
| `GET` | `/api/skus/master-catalog/` | Returns status of the uploaded Shopify master catalog CSV, including filename, upload timestamp, row count, active status, and drift information comparing master against live catalog (Decision #118, P136.1). | Session |
| `POST` | `/api/skus/master-catalog/` | Accepts multipart replacement Shopify product-export CSV, validates required Shopify schema columns, uploads to Google Drive, records in `master_catalog_uploads`, and sets as active master for exports (Decision #118, P136.1). | Session |
| `GET` | `/api/event-prints/jobs/{id}/adjustments/` | Read active-product image adjustment state for an Event Print job. Returns active group adjustments, effective values, defaults, overrides, and switch states (Decision #136, P142). | Session |
| `PATCH` | `/api/event-prints/jobs/{id}/adjustments/` | Write or clear active-product image adjustment overrides for an Event Print job, updating `EventPrintJob.adjustment_overrides` (Decision #136, P142). | Session |

## Approved API Extensions Pending Implementation

Decisions #100, #102, #103, #104, #118, #122, and #123 establish approved behavioral requirements whose technical wire representations have not yet been defined by an implementation pass. To keep the core specifications strictly aligned with code and prevent speculative drift, the following technical details are explicitly deferred to implementation:

| Decision | Scope | Status | Deferred Technical Details |
| :--- | :--- | :--- | :--- |
| #100 | Artwork Library full-result sorting | Approved | Exact query-parameter names and allowed values for Design A–Z/Z–A and Updated newest/oldest sorting. |
| #102 | Order Detail direct file access | Approved | Serializer field names and/or sub-resource endpoints delivering source artwork Drive paths, thumbnails, and generated file links within `GET /api/orders/{id}/`. |
| #103 | Order Detail aggregated history | Approved | Endpoint path, parameters, and payload structure for combining order, component, and relevant-batch audit events into one order-specific timeline. |
| #104 | Bulk Missing SKU recovery and re-import | Approved | Endpoint paths, request bodies, and response payloads for multi-item proposal generation, set review/approval/rejection, and bulk re-import of distinct affected orders. |
| #118 | SKU Manager master-catalog upload and drift detection | Approved | Endpoint path, method, and payload/response shape for the master-catalog upload endpoint (see API Endpoint Table); the technical surface exposing catalog drift to SKU Manager; and the exact Google Drive storage path/naming convention for uploaded masters (see `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md`), are deferred to implementation. |
| #122 | Orders list sortable by Attention | Approved | Exact query-parameter name(s) and values for the combined-attention-score (`blocked_count + missing_sku_count`) server-side sort on `GET /api/orders/`, and its mutual exclusion with the `Order #` sort. |
| #123 | Needs Attention queue sorting | Approved | Exact query-parameter name(s) and values for the per-queue most-recent-first default and sort control on `GET /api/needs-attention/` (order number for Blocked/Missing SKU/Deferred; received time for Webhook Failures). |

## Image Adjustment API Contract

This section records the technical details for the per-batch image adjustment API (Decision #125), as implemented by P134/P135/P136.

**Control groups.** Eight groups map physical product pieces to component codes: `lighter` → `[LITF, LITB]`; `wallet` → `[WALF, WALB]`; `tin` → `[TIN]`; `grinder` → `[GRD]`; `jar` → `[JAR]`; `rolling_tray` → `[TRY]`; `ashtray` → `[ASH]`; `stash_box` → `[BOX]`. Group resolution is case- and whitespace-insensitive against both the key and the label. `GET` and `PATCH` only surface the groups whose component codes are actually present in the batch; a group whose codes are absent is silently omitted from the response.

**Stored units and mechanisms (Decisions #125, #126, #131).** Adjustment values are stored in the same integer units used by `PrintTemplate.adjustments`: Brightness, Contrast, and Sharpness as integers where 0 = neutral; Saturation as an integer where 100 = neutral. At generation time:
- **Brightness and Contrast:** Applied as native PPTX/OOXML `<a:lum>` properties by default (Decision #126). If `brightness_manual_override` or `contrast_manual_override` is set to `true`, the native `<a:lum>` tag is omitted and the adjustment is baked into the image pixels using Pillow `ImageEnhance` (Decision #131).
- **Saturation and Sharpness:** Applied via Pillow `ImageEnhance` pixel-baking during preprocessing, superseding Decision #126's native requirement for these two properties (Decision #131).
The ranges `brightness: [-100, 100]`, `contrast: [-100, 100]`, `saturation: [0, 400]`, `sharpness: [-100, 100]` are enforced server-side on both write endpoints.

**Batch override sparseness.** `ProductionBatch.adjustment_overrides` is nullable JSON. It is `null` until an operator changes at least one key. Each component code in the batch stores only the keys the operator explicitly set; keys absent from the override fall through to the product-type default. Clearing every key on a component code removes its entry; if all entries are removed, `adjustment_overrides` collapses back to `null`.

**Override precedence.** The resolver applies the product-type default from `PrintTemplate.adjustments`, then overlays only the keys present in `ProductionBatch.adjustment_overrides` for the component being rendered. A batch override always beats the product-type default, including after the default is later changed. Non-editable template keys (`flip_horizontal`, border values, etc.) are never read or written by the adjustment API.

**Editability.** `PATCH /api/batches/{id}/adjustments/` returns HTTP 409 when `batch.status != "Open"`. `PATCH /api/print-templates/adjustments/` is always available (it edits defaults, not a batch). The `editable` flag in `GET /api/batches/{id}/adjustments/` responses is `true` only when `batch.status == "Open"`.

**Audit events.** Both write endpoints emit an audit event via the existing `emit_audit_event` mechanism. Batch override: `entity_type='ProductionBatch'`, `entity_id=str(batch.id)`, `metadata={'group': <key>, 'old_values': {...}, 'new_values': {...}}`. Product-type default: `entity_type='PrintTemplate'`, `entity_id=<group key>` (e.g. `'ashtray'`), same metadata shape.

**Error codes (both write endpoints):**

| Status | Trigger |
| :--- | :--- |
| 400 | Malformed body (`group` missing, `values` missing/empty/wrong type) |
| 400 | Unknown adjustment key in `values` |
| 400 | Out-of-range integer value for its key |
| 400 | Unknown `group` |
| 400 | `group` not present in this batch's components (batch endpoint only) |
| 400 | `null` value (template endpoint only — defaults cannot be cleared) |
| 400 | A code in the group has no `PrintTemplate` row (template endpoint only) |
| 404 | Batch does not exist (batch endpoint only) |
| 409 | Batch is not `Open` (batch endpoint only) |
| 403 | Unauthenticated request |

## Global Filter Parameter Contract

This section completes the technical details Decision #110 deferred, as implemented across P122 (backend) and P123 (frontend), verified working in production by P124, with the three choices P122/P123 flagged for owner review confirmed as-built by Decision #119.

- **Persistence mechanism.** Client-side only: a module-level shared store (`frontend/src/lib/masterFilter.ts`) that every Global-Filter-aware screen reads via `useSyncExternalStore`. The backend is stateless with respect to the filter.
- **Reload durability.** The active range is written to `sessionStorage` under the key `spicedanime.master-filter`, as `{"after":"YYYY-MM-DD","before":"YYYY-MM-DD"}`. It survives a hard reload and a new tab in the same browser session; it is deliberately `sessionStorage` and not `localStorage`, so it is not shared across browsers or devices and is dropped when the browser session ends (Decision #119). It is also cleared when the operator clears the range.
- **Stored value format.** Bare `YYYY-MM-DD` calendar dates. The Decision #110 inclusive-day widening (reusing the Orders date controls' semantics, P116) is applied server-side at request time, not in storage. An open bound contributes no query parameter.
- **Transport / URL parameters.** No new URL query parameter was introduced. Orders is the only screen that carries the range in its URL, using its pre-existing `created_at_after` / `created_at_before` parameters, unchanged in name, format, and meaning; every other affected endpoint (`GET /api/batches/`, `GET /api/batches/{id}/`, `GET /api/needs-attention/`, `GET /api/dashboard/`) accepts the same two parameter names in its own request. Orders reconciles with the shared store once on mount: an already-active range rewrites Orders' URL to match it; with no active range, dates already in Orders' URL are adopted into the shared store (deep link). Invalid or unparseable values are ignored and treated as absent (HTTP 200, never 4xx/5xx), matching the long-standing `GET /api/audit-log/` behavior for these two parameter names.
- **`POST /api/batches/{id}/generate-pptx/` boundary.** The active range travels in the request body under the same two parameter names and is re-resolved against the database inside the generation action; the client's `component_ids` selection never itself defines the eligible boundary.
- **`GET /api/dashboard/` Filtered Production Summary payload.** Computes three mutually exclusive buckets over purchased units (`OrderItem.quantity`, never production-component count), in this precedence: Missing SKU (unresolved `NO_SKU`) → Included in filtered production (represented in **any** non-sandbox production batch, regardless of that batch's lifecycle status — `Printed` batches are not excluded, per Decision #119) → Not included in production (the remainder, computed as total − included − missing SKU rather than enumerated, so the reconciliation equation holds by construction). Sandbox rows never contribute (Decision #47).
- **Recent Activity while filtered.** The Dashboard uses `GET /api/dashboard/`'s own already-scoped `recent_activity` rather than its usual richer `GET /api/audit-log/` feed while a range is active, because the audit-log endpoint's date parameters filter by the event's own date while Decision #110 scopes by the owning order's date (confirmed by Decision #119). Unfiltered Dashboard behavior is unchanged.
- **`GET /api/needs-attention/` scoping.** `errors` (Blocked), `no_sku` (Missing SKU), and `deferred` are scoped through the owning order's date. `webhook_failures` is never scoped by the range, since a webhook failure may correspond to an import that produced no order row at all.
- **Non-mutation.** Activating, changing, or clearing the range performs no request and no mutation of any kind; it writes only to the client-side store.

## Shopify Product CSV Export Contract

`GET /api/skus/export.csv` generates a downloadable CSV formatted for direct import into Shopify Admin. This contract implements Decision #99, as amended by Decision #118:

### Cumulative composition
- Every `offer_skus` row with `is_active = true` participates in every export, regardless of whether it has been exported before.
- Newly accepted canonical SKUs are added; existing active assignments remain present.
- Inactive/retired rows (`is_active = false`) are excluded.
- The legacy `ids` query does not narrow the operator-facing export.

### Operator-refreshable master source (Decision #118)
- Every export begins from a fresh copy of the current stored master catalog CSV — an operator-uploaded copy of Shopify's own "Export products" file, stored in Google Drive per Decision #24 — never from a previously generated application export.
- The master is refreshed by upload, not automatically: Josiah/Josh download a fresh product export directly from Shopify Admin whenever the catalog changes and upload it, replacing the stored master used by every subsequent export. Every successful upload is retained rather than overwritten.
- A submitted master CSV is validated against the required Shopify schema columns at upload time (see `MALFORMED_SHOPIFY_MASTER_CSV` below), so a malformed file is rejected immediately rather than surfacing only on a later export.
- The app independently detects catalog drift — any product or variant visible on the live Shopify catalog read (`GET /api/shopify/catalog/`, Decision #69) that is absent from the current stored master — and surfaces it on the SKU Manager screen so a refresh happens before an export can fail on it. The exact drift-detection technical surface is deferred to implementation (see Approved API Extensions Pending Implementation).

### Variant matching and cell preservation
- Active canonical assignments are matched to the master catalog by Shopify Product Handle (or Product Title) plus Variant Option values.
- Only intended variant SKU cells (`Variant SKU`) may be modified.
- All non-SKU rows, headers, handle definitions, descriptions, pricing, inventory fields, and image associations from the master CSV are preserved byte-for-byte or character-for-character.

### Fail-closed integrity rules
The export must fail closed with an HTTP 4xx/5xx response and an actionable error payload — producing no partial or corrupted CSV — if any of the following conditions occurs:
1. `SHOPIFY_MASTER_CSV_UNAVAILABLE`: The stored master catalog CSV cannot be read from Google Drive, or no master has ever been uploaded.
2. `MALFORMED_SHOPIFY_MASTER_CSV`: Master CSV missing required Shopify schema columns (`Handle`, `Title`, `Option1 Value`, `Variant SKU`, etc.).
3. `SHOPIFY_VARIANT_NOT_FOUND`: An active canonical SKU matches no row in the master catalog.
4. `SHOPIFY_VARIANT_AMBIGUOUS`: Linkage attributes resolve to multiple distinct variants in the master catalog.
5. `SHOPIFY_VARIANT_SKU_CONFLICT`: Multiple active canonical SKUs claim the same variant row.
6. `SHOPIFY_CSV_INTEGRITY_FAILURE`: Pre-stream row count or non-SKU cell comparison detects corruption or column shifting.

### Audit timestamp and write boundary
- `offer_skus.exported_at` records the timestamp of first successful inclusion in an export. A non-null timestamp never removes an active canonical SKU from later exports.
- The application never calls the Shopify Admin API to mutate product or variant SKUs directly; file import into Shopify Admin remains a human-controlled operational step.

## Integration Status Endpoint

`GET /api/settings/integration-status/` returns a JSON object with three top-level keys: `shopify`, `drive`, and `celery`. Each key contains only the fields listed below. No other fields are added under any circumstances.

| Path | Type | Semantics |
| :--- | :--- | :--- |
| `shopify.connected` | boolean | `true` only if `SHOPIFY_STORE_DOMAIN`, an access token (`SHOPIFY_ADMIN_ACCESS_TOKEN` or `SHOPIFY_API_KEY`), `SHOPIFY_API_VERSION`, and `SHOPIFY_WEBHOOK_SECRET` are all present in the environment. Does not perform a live Shopify Admin API call; presence-only check. |
| `shopify.last_webhook_at` | ISO 8601 datetime string or `null` | Timestamp of the most recent `AuditEvent` with `action='order_imported'`. In MVP the Shopify webhook is the only order-import path, so this is equivalent to the last webhook receipt time. |
| `shopify.api_version` | string or `null` | Value of the configured `SHOPIFY_API_VERSION` environment variable. Safe to expose. |
| `drive.root_folder_configured` | boolean | `true` if `GOOGLE_DRIVE_ROOT_FOLDER_ID` is present in the environment. The folder ID value itself is never returned. |
| `drive.last_export_at` | ISO 8601 datetime string or `null` | Timestamp of the latest `PackingExport` row with `status='Success'`. |
| `celery.worker_reachable` | boolean | Result of a bounded (1.0s timeout) `celery.control.inspect().ping()`. Any exception (no broker, no worker, network error) degrades to `false`. Never dispatches a task. |

Authentication: session-authenticated. Anonymous requests return HTTP 403.

Safety invariant (enforced by `test_no_secret_values_present_in_response`): the raw JSON response body never contains the configured Shopify store domain, Shopify access token, Shopify webhook secret, or Google Drive folder ID values. Any future field addition must preserve this invariant.

---

## Celery Task List

| Task | Trigger | Purpose |
| :--- | :--- | :--- |
| `generate_pptx_for_batch` | `POST /api/batches/{id}/generate-pptx/`, or `POST /api/sandbox/batches/{id}/generate-pptx/` for sandbox batches | Build PPTX file and upload to Drive. Applies the LITTIN rotation, ASHGRD GRD transform, and BOX-family routing branches during image preprocessing. When triggered against a sandbox batch, the batch-lock step is skipped per Decision #47. |
| `generate_packing_sheet` | `POST /api/packing/export/` | Build XLSX file and upload to Drive. |
| `process_shopify_order` | Shopify webhook receive | Run order import algorithm asynchronously. For GRS-family line items, makes a secondary Shopify Admin API call to `GET /products/{product_id}/metafields.json` to retrieve `custom.series`. Blocks the component with `MISSING_SERIES_METAFIELD` if the metafield is absent or the call fails. |
| `validate_artwork_availability` | Periodic (hourly) | Thin wrapper delegating to the shared `reconcile_artwork_from_drive()` service: runs one paginated read-only scan of the Drive `artwork/` subtree and promotes `Blocked` components with `MISSING_ARTWORK` whose canonical artwork is now present. Does not re-attempt series resolution for `MISSING_SERIES_METAFIELD` components; recovery is via re-import. Artwork-upload recovery calls the same underlying promotion helper directly rather than dispatching this task. |
| `reconcile_artwork` | `POST /api/artwork/revalidate/` | Manual on-demand run of the same shared `reconcile_artwork_from_drive()` service used by the hourly task. Overlap-protected by a database run record (`ArtworkRevalidationRun.active_lock`); a second dispatch while a run is active reuses the existing task ID instead of starting a new scan. |

---

## Management Commands

| Command | Trigger | Purpose |
| :--- | :--- | :--- |
| `reconcile_shopify_history` | Manual, operator-invoked only (`python manage.py reconcile_shopify_history --dry-run` or `--apply`) | One-time historical reconciliation for orders that drifted out of sync with Shopify before the four reconciliation webhooks existed. Read-only in `--dry-run`; re-fetches Shopify and applies transitions in `--apply`. Not a Celery task; not scheduled; not run on deploy or startup. |
| `backfill_fulfilled_externally_pullout` | Manual, operator-invoked only (`python manage.py backfill_fulfilled_externally_pullout --dry-run` or `--apply`) | One-time backfill of the Feature C component pull-out (Decision #42 amendment) for orders already `Fulfilled Externally` before that fix existed. Never contacts Shopify; never changes order status; touches only `production_components`/`batch_items`. Idempotent. Not a Celery task; not scheduled; not run on deploy or startup. |
| `checkout_sandbox_orders` | Manual, operator-invoked, or triggered via `POST /api/sandbox/checkout/` from the Sandbox screen | Creates up to 7 new `is_sandbox = true` test orders from the 25 fixed sandbox SKUs per checkout submission, quantity capped at 10 per SKU per order (Decisions #58, #132). Never contacts Shopify. Not idempotent by design: each checkout creates new orders rather than repairing an existing set. Not a Celery task; not scheduled; not run on deploy or startup. |
| `reset_sandbox_data` | Manual, operator-invoked, or triggered via `POST /api/sandbox/reset/` from the Sandbox screen | Fully deletes all `is_sandbox = true` rows across `orders`, `production_components`, `production_batches`, and `batch_items` (Decision #58). Does not recreate any orders. Never contacts Shopify. Not a Celery task; not scheduled; not run on deploy or startup. |
| `reset_locked_batches_p77` | Manual, operator-invoked only (`python manage.py reset_locked_batches_p77 --dry-run` or `--apply`), one-time use | Transitions every batch in `Locked for Review` status (excluding `Printed`) back to `Open` and clears `generated_file_url`, across all production groups, so existing batches regenerate under the Decisions #48–#57 corrected image-transform specs (Decision #59). Read-only in `--dry-run`. Not a Celery task; not scheduled; not run on deploy or startup. |

---

## File Generation Flow

Applies to both `generate_pptx_for_batch` and `generate_packing_sheet`. The Django endpoint and the Celery task are always separate; the endpoint never performs file construction synchronously.

1. Operator action triggers a Django endpoint.
2. Endpoint validates the request, updates the database synchronously, and dispatches a Celery task.
3. Endpoint returns immediately with the dispatched task ID.
4. Celery worker picks up the task and constructs the file in memory or a temporary directory.
5. Worker uploads the file to Google Drive via the service account credentials.
6. Worker updates the `generated_files` row with the Drive shareable URL.
7. Frontend polls for task completion. (Phase 2: replace polling with WebSocket subscription.)

---

## Environment Variables

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

---

## Environment Definitions

| Environment | Purpose |
| :--- | :--- |
| Local | Developer workstation. |
| Staging | Pre-production verification with test Shopify store. |
| Production | Live SpicedAnime store. |

---

## Deployment Targets

Hosting platform approved per Decision #28.

| Component | Status | Platform |
| :--- | :--- | :--- |
| Backend (Django + Celery) | Approved Baseline | Railway |
| Frontend (Next.js) | Approved Baseline | Vercel |
| Database (PostgreSQL) | Approved Baseline | Railway managed PostgreSQL |
| Redis | Approved Baseline | Railway managed Redis |

---

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Data_Model_and_Database_Schema.md` | Defines the PostgreSQL schema implemented by this stack, including `webhook_receipts`. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the behavior of all five webhook endpoints, the historical reconciliation command, and the fulfilled-externally backfill command. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Drive folder structure and credential usage; the thumbnail endpoint reuses this credential configuration. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the order/component states and selective-batch-generation behavior these endpoints implement. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines `STALE_SELECTION` and `WEBHOOK_FAILURE` error semantics for these endpoints. |
| `Deployment_and_Operations_Runbook.md` | Operates this architecture; consumes the environment variable list defined here. |
| `Security_Access_and_Privacy_Spec.md` | Defines credential handling rules referenced by the environment variable list. |
