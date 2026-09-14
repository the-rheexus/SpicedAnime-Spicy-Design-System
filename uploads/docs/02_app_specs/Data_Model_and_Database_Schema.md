---
title: "Data Model and Database Schema"
version: "1.15"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
database_dependencies:
  - orders
  - order_items
  - offer_skus
  - designs
  - artwork_assets
  - artwork_revalidation_runs
  - product_families
  - configuration_components
  - production_components
  - production_batches
  - batch_items
  - print_templates
  - packing_exports
  - generated_files
  - audit_events
  - webhook_receipts
  - master_catalog_uploads
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
  - Available
  - Missing
  - Retired
---

# Data Model and Database Schema

## Schema Overview

This document defines the PostgreSQL data model for the SpicedAnime fulfillment web app. It translates the approved Source of Truth documents into concrete database tables, fields, types, constraints, relationships, indexes, and Django model considerations.

The database stores Shopify order records, parsed order items, canonical SKU data, design records, artwork records, production components, production batches, generated files, packing exports, and audit events.

The source-of-truth hierarchy is:

1. Source of Truth documents define business behavior.
2. This document defines database structure that supports that behavior.
3. Django models must preserve exact enum strings from the SOT documents.
4. Seed data for `product_families` and `configuration_components` comes from `production_component_rules.yaml`.
5. Seed data for `print_templates` comes from `Product_Image_Transformation_Guidelines.md`.

Entity relationship summary:

```text
orders
  └── order_items
        ├── offer_skus
        ├── designs
        └── production_components
              ├── artwork_assets
              ├── print_templates
              └── batch_items
                    └── production_batches

product_families
  ├── offer_skus
  └── configuration_components

designs
  ├── offer_skus
  └── artwork_assets

production_batches
  ├── batch_items
  └── generated_files

packing_exports
  └── generated_files

audit_events
  └── records system and operator actions
```

## Table Definitions

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
| `batch_number_sequences` | Per-production-group batch-number ledger: the high-water mark of every batch number ever issued for a group, so a number is never reissued after its batch is deleted (Decision #115). |
| `print_templates` | Per-product layout and transformation parameters (seeded from `Product_Image_Transformation_Guidelines.md`). |
| `packing_exports` | Generated XLSX records. |
| `generated_files` | All generated PPTX, XLSX, and other output files with Drive references. |
| `audit_events` | System action audit log. |
| `artwork_revalidation_runs` | Overlap-protection run records for manual and hourly Drive artwork revalidation scans. |
| `webhook_receipts` | Idempotency and safe-evidence records for the four Shopify reconciliation webhooks (`orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`). |
| `event_print_jobs` | Named, reusable event print jobs, saved design/group/quantity selections, and compact image adjustment overrides (Decisions #92, #136). |
| `event_print_runs` | One record per Event Prints generation, linking a job to its produced file (Decision #92). |
| `master_catalog_uploads` | Uploaded Shopify master catalog product export CSV records stored in Google Drive, retaining full upload history, active master pointer, and catalog drift metadata (Decision #118, P136.1, migration `0016`). |

Full table field definitions for all 19 tables: TBD by developer based on the SOT documents. Each table must follow the field naming conventions in this document.

`event_print_jobs`, `event_print_runs`, and `master_catalog_uploads` are registered here with their field definitions governed by their respective decisions. None of these tables carries a lifecycle status, and none participates in the order, batch, or component state machines.

**`event_print_jobs` must persist:** the event name, event date, location, the job's selected designs with their production group and quantity for each, and `adjustment_overrides` (jsonb, nullable) storing active-product image adjustment overrides and switch states (Decisions #92, #136). A job may exist without ever having been generated.

**`master_catalog_uploads` must persist:** original uploaded filename, Google Drive file ID, row count, active status (`is_active = true` for the active master CSV used by export), upload timestamp, and uploading operator (Decision #118, P136.1, migration `0016`).

**`event_print_runs` must persist:** the generation timestamp, the originating job, the production group, the page count, the item count, and a reference to the produced file. Event Prints creates no Shopify order and no production batch, so a run record references neither.

Neither table is a sandbox table and neither carries an `is_sandbox` flag; Event Prints operates outside the order and batch model entirely.

### `orders`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `shopify_order_id` | varchar(128) | No | Unique Shopify order ID. Used for idempotent webhook handling. |
| `order_number` | varchar(64) | No | Human-readable Shopify order number. |
| `sales_channel` | varchar(64) | No | Default `Shopify`. |
| `customer_email` | varchar(255) | No | Customer email from Shopify. |
| `customer_name` | varchar(255) | No | Customer first and last name. |
| `shipping_address` | jsonb | No | Full Shopify shipping address JSON. |
| `financial_status` | varchar(64) | No | Shopify financial status captured at import. |
| `fulfillment_status` | varchar(64) | Yes | Shopify fulfillment status captured at import. |
| `status` | varchar(32) | No | Must match Order Status enum exactly. |
| `shopify_created_at` | timestamp | No | Original Shopify order creation timestamp. |
| `created_at` | timestamp | No | App record creation timestamp. |
| `updated_at` | timestamp | No | App record update timestamp. |
| `is_sandbox` | boolean | No | Default `false`. `true` for synthetic test orders created by the sandbox mechanism (Decision #47); excluded from Dashboard, Orders list, and packing-sheet export selection. |

### `order_items`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `order_id` | bigint | No | Foreign key to `orders.id`. |
| `shopify_line_item_id` | varchar(128) | No | Shopify line item ID. |
| `shopify_product_id` | varchar(128) | Yes | Shopify product ID from the line item. Required for GRS-family series metafield lookup. Nullable for backward compatibility with pre-existing rows; populated for all new line items. |
| `shopify_variant_id` | varchar(128) | Yes | Shopify variant ID from the line item. Captured for traceability; not used in series resolution. |
| `sku` | varchar(50) | No | SKU from Shopify line item. |
| `canonical_sku_id` | bigint | Yes | Foreign key to `offer_skus.id`. Resolved directly from the parsed SKU string. |
| `product_name` | varchar(255) | No | Shopify line item title. |
| `variant_title` | varchar(255) | Yes | Shopify variant title. |
| `quantity` | integer | No | Shopify quantity. |
| `family_code` | varchar(3) | Yes | Parsed family code. |
| `design_code` | varchar(10) | Yes | Parsed design code. |
| `config_code` | varchar(32) | Yes | Parsed config code. |
| `options` | jsonb | Yes | Parsed SKU option values. |
| `validation_failure_code` | varchar(64) | Yes | Validation failure code if import or parsing fails. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `offer_skus`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `sku` | varchar(50) | No | Unique canonical Shopify offer SKU. |
| `family_code` | varchar(3) | No | Foreign key to `product_families.family_code`. |
| `design_id` | bigint | No | Foreign key to `designs.id`. |
| `design_code` | varchar(10) | No | Denormalized design code for lookup and display. |
| `config_code` | varchar(32) | No | Configuration code from SKU. |
| `options` | jsonb | Yes | SKU option values such as color, flame, or size. |
| `is_active` | boolean | No | Whether this SKU is active for new imports. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `designs`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `internal_design_id` | varchar(16) | No | Stable internal design ID. Sequential `D000001` format for seeded or manually created designs; `AUTO{id}` (e.g., `AUTO4821`) for designs auto-created at order import (Decision #37). |
| `design_code` | varchar(10) | No | Unique immutable design code. |
| `design_name` | varchar(255) | No | Human-readable design name. |
| `shopify_product_handle` | varchar(255) | Yes | Shopify product handle this design code is locked to. Unique when present. This is the app-owned design-code registry key (Decision #68); seeded from the owner's `DESIGN_CODE_REGISTRY.csv`. Null for designs with no known Shopify handle (e.g., pre-Shopify or manually created designs). |
| `registry_source` | varchar(32) | Yes | Provenance of the design code assignment (e.g., `EXISTING_SKU`, `APPROVED_VERIFY`, `PROPOSED_TITLE_RULE`). Null if not sourced from the registry seed. |
| `registry_notes` | text | Yes | Free-text notes carried from the registry seed, if any (e.g., "Consistent valid design segment found in existing lighter SKUs."). |
| `is_active` | boolean | No | Whether the design is active for new SKUs. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `product_families`

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

### `configuration_components`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `family_code` | varchar(3) | No | Foreign key to `product_families.family_code`. |
| `config_code` | varchar(32) | No | Config code from SKU. |
| `component_code` | varchar(16) | No | Internal production component code. |
| `quantity` | integer | No | Quantity of this component generated per order item quantity unit. |
| `batch_group` | varchar(32) | No | Production batch group routing. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `artwork_assets`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `design_id` | bigint | No | Foreign key to `designs.id`. |
| `design_code` | varchar(10) | No | Denormalized design code for path lookup. |
| `component_code` | varchar(16) | No | Component code or placement code. |
| `family_code` | varchar(3) | No | Foreign key to `product_families.family_code`. Required because several component codes (`GRD`, `JAR`, `TRY`, `LITF`, `LITB`) resolve to different product-type folders depending on originating family. Logical uniqueness key is `(design_id, component_code, family_code)`. |
| `source_file_path` | varchar(512) | No | Expected Google Drive path. For GRS-family rows, includes the resolved series name. |
| `drive_file_id` | varchar(255) | Yes | Google Drive file ID when available. |
| `drive_share_url` | varchar(1024) | Yes | Google Drive shareable URL when available. |
| `status` | varchar(32) | No | Must match Artwork Asset Status enum exactly. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `production_components`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `order_item_id` | bigint | No | Foreign key to `order_items.id`. |
| `order_id` | bigint | No | Foreign key to `orders.id`. |
| `component_code` | varchar(16) | No | Internal production component code. |
| `family_code` | varchar(3) | No | Family code from parsed SKU. |
| `design_id` | bigint | Yes | Foreign key to `designs.id`. |
| `design_code` | varchar(10) | Yes | Denormalized design code. |
| `config_code` | varchar(32) | Yes | Config code that generated this component. |
| `batch_group` | varchar(32) | Yes | Production group. Null for deferred MVP or non-batched components. |
| `artwork_asset_id` | bigint | Yes | Foreign key to `artwork_assets.id`. |
| `print_template_id` | bigint | Yes | Foreign key to `print_templates.id`. |
| `status` | varchar(32) | No | Must match Component Status enum exactly, including the `Canceled` value used when a component is pulled from its `Open` batch because the parent order was cancelled, refunded, or fulfilled externally in Shopify. |
| `validation_failure_code` | varchar(64) | Yes | Validation failure code if blocked or deferred. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |
| `is_sandbox` | boolean | No | Default `false`. Denormalized from the parent order for query performance; `true` for components generated by the sandbox mechanism (Decision #47). |

### `production_batches`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `production_group` | varchar(32) | No | Production group name. |
| `batch_number` | integer | No | Sequence number, permanently unique per production group; never reissued even after the batch that held it is deleted (Decision #115). |
| `batch_label` | varchar(128) | No | Human-readable batch label. |
| `status` | varchar(32) | No | Must match Batch Status enum exactly. |
| `opened_at` | timestamp | No | Batch opening timestamp. |
| `locked_at` | timestamp | Yes | Timestamp when Generate PPTX locks the batch. |
| `printed_at` | timestamp | Yes | Timestamp when operator marks printed. |
| `archived_at` | timestamp | Yes | Timestamp when archived. |
| `generated_file_url` | varchar(1024) | Yes | Drive shareable URL for generated PPTX. |
| `source_open_batch_id` | bigint | Yes | Self-referential foreign key to `production_batches.id`. Set only on a batch created by selective PPTX generation (a proper-subset request); identifies the `Open` batch it was split from, so an asynchronous PPTX-generation failure can merge the subset's items back into the correct originating batch. Null for all batches created by full (no-selection) generation. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |
| `adjustment_overrides` | jsonb | Yes | Sparse per-component-code batch adjustment overrides (Decisions #125, #131). `null` until an operator sets at least one value. Structure: `{"ASH": {"brightness": -30, "brightness_manual_override": true}, "GRD": {"saturation": 120}}`. Stores the four editable keys (`brightness`, `contrast`, `saturation`, `sharpness`) alongside boolean manual override switches (`brightness_manual_override`, `contrast_manual_override`); non-editable template keys are never written. When all overrides are cleared the field collapses back to `null`. |
| `is_sandbox` | boolean | No | Default `false`. `true` for batches created by the sandbox mechanism (Decision #47); exempt from the Decision #7 lock-on-generate rule per `Order_Status_and_Batch_Lifecycle_SOT.md`. |

### `batch_number_sequences`

Introduced by Decision #115 (P130.1). One row per production group. Field definitions are recorded here at the level the migration fixed them:

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `production_group` | varchar(32) | No | Production group name. Unique — exactly one ledger row per group. |
| `last_batch_number` | integer | No | The highest `batch_number` ever issued for this group, including numbers whose batch has since been deleted. The batch-number allocator takes a row-level lock on this row, increments this value, and returns it, so allocation is serialized and a number is never reissued. A group with no ledger row yet seeds one from `MAX(production_batches.batch_number)` for that group on first use and never consults that maximum again. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

Sandbox and real batches draw from the same per-group ledger (Decision #115); it is not partitioned by `is_sandbox`.

### `batch_items`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `batch_id` | bigint | No | Foreign key to `production_batches.id`. |
| `component_id` | bigint | No | Foreign key to `production_components.id`. |
| `created_at` | timestamp | No | |
| `is_sandbox` | boolean | No | Default `false`. Denormalized from the parent batch; `true` for join rows created by the sandbox mechanism (Decision #47). |

### `print_templates`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `component_code` | varchar(16) | No | Component code this template applies to. |
| `product_name` | varchar(64) | No | Human-readable product/template name. |
| `shape` | varchar(64) | No | Shape from Product Image Transformation Guidelines. |
| `width_inches` | numeric(6,3) | Yes | Width in inches when defined. |
| `height_inches` | numeric(6,3) | Yes | Height in inches when defined. |
| `diameter_inches` | numeric(6,3) | Yes | Diameter in inches for circle crops. |
| `border_color` | varchar(32) | Yes | Border color or rule reference. |
| `adjustments` | jsonb | Yes | Per-product transformation values. Contains the four operator-editable keys (`brightness`, `contrast`, `saturation`, `sharpness`) stored as integers (0 = neutral for brightness/contrast/sharpness; 100 = neutral for saturation) plus non-editable keys such as `flip_horizontal`. This row is the product-type default; batch-level overrides are stored separately in `production_batches.adjustment_overrides`. Decision #125. |
| `per_page` | integer | No | Number of products or units per page. |
| `images_per_sku` | integer | No | Number of image placements per SKU. |
| `grid_rows` | integer | Yes | PPTX layout rows when defined. |
| `grid_columns` | integer | Yes | PPTX layout columns when defined. |
| `metadata_text_box_required` | boolean | No | Whether a metadata text box is required. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `packing_exports`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `export_label` | varchar(128) | No | Human-readable packing export label. |
| `export_window_start` | timestamp | Yes | Operator-selected export window start. |
| `export_window_end` | timestamp | Yes | Operator-selected export window end. |
| `status` | varchar(32) | No | Export generation status. |
| `generated_file_id` | bigint | Yes | Foreign key to `generated_files.id`. |
| `drive_share_url` | varchar(1024) | Yes | Drive shareable URL for XLSX. |
| `completed_at` | timestamp | Yes | Successful finalization timestamp; historical rows without a truthful completion time remain legacy/unknown. |
| `retention_state` | varchar(32) | No | `Scheduled`, `Purging`, `Purged`, `Failed`, or `Legacy/Unknown`. |
| `retention_expires_at` | timestamp | Yes | `completed_at + 30 calendar days` for completed packing exports only. |
| `purge_started_at`, `purged_at` | timestamp | Yes | Truthful Drive-first purge lifecycle timestamps. |
| `purge_attempt_count`, `purge_error_class` | integer, varchar(128) | No / Yes | Bounded retry state; error class only, never raw Drive response. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `generated_files`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `file_type` | varchar(32) | No | Generated file type such as `PPTX` or `XLSX`. |
| `file_name` | varchar(255) | No | Generated file name. |
| `mime_type` | varchar(255) | No | File MIME type. |
| `storage_path` | varchar(512) | No | Google Drive path. |
| `drive_file_id` | varchar(255) | Yes | Google Drive file ID. |
| `drive_share_url` | varchar(1024) | Yes | Google Drive shareable URL. |
| `production_batch_id` | bigint | Yes | Foreign key to `production_batches.id` for batch outputs. |
| `packing_export_id` | bigint | Yes | Foreign key to `packing_exports.id` for packing outputs. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### `audit_events`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `actor_type` | varchar(32) | No | Operator, system, webhook, or background worker. |
| `actor_id` | varchar(128) | Yes | User ID or system identifier when available. |
| `action` | varchar(128) | No | Action name. |
| `entity_type` | varchar(64) | No | Entity type affected by the event. |
| `entity_id` | varchar(128) | Yes | Entity ID affected by the event. |
| `metadata` | jsonb | Yes | Event details. |
| `created_at` | timestamp | No | |

### `artwork_revalidation_runs`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `trigger` | varchar(16) | No | Run origin string, e.g. the hourly periodic task or a manual operator request. |
| `state` | varchar(16) | No | One of `Pending`, `Running`, `Success`, `Failed`. Defaults to `Pending`. |
| `task_id` | varchar(255) | Yes | Celery task ID for the dispatched scan. |
| `requested_by` | varchar(128) | Yes | Operator or system identifier that requested the run. Null for the hourly trigger. |
| `active_lock` | boolean | Yes | `True` while the run is `Pending` or `Running`; set to `NULL` once the run reaches a terminal state (`Success` or `Failed`). A unique constraint on this field enforces that at most one run is active at a time. |
| `summary` | jsonb | Yes | Reconciliation counts (checked, found, resolved, missing, misplaced, duplicate, unknown) once the run completes. |
| `failure_reason` | varchar(128) | Yes | Short failure classification when `state` is `Failed`. |
| `started_at` | timestamp | Yes | Scan start time. |
| `finished_at` | timestamp | Yes | Scan completion time. |
| `created_at` | timestamp | No | Row creation timestamp. |
| `updated_at` | timestamp | No | Row update timestamp. |

### `webhook_receipts`

| Field | Type | Nullable | Notes |
| :--- | :--- | :---: | :--- |
| `id` | bigserial | No | Primary key. |
| `webhook_delivery_id` | varchar(255) | No | Value of `X-Shopify-Webhook-Id`. Unique constraint enforces idempotency; a duplicate delivery is detected via `IntegrityError` on insert, not a pre-check read. |
| `webhook_event_id` | varchar(255) | Yes | Value of `X-Shopify-Event-Id`, stored for correlation only. Never used for deduplication; distinct topics may share an event ID. |
| `topic` | varchar(64) | No | One of `orders/updated`, `orders/fulfilled`, `orders/cancelled`, `refunds/create`. `orders/paid` does not write to this table. |
| `shopify_order_reference` | varchar(128) | Yes | Safe (non-PII) Shopify order reference from the payload, for correlation. |
| `outcome` | varchar(16) | No | One of `Processed`, `No-op`, `Failed`. |
| `state_mutated` | boolean | No | Whether this delivery caused a database write beyond the receipt row itself. |
| `failure_summary` | varchar(255) | Yes | Classification-only string of the form `topic:ExceptionType` when `outcome = 'Failed'`. Never a raw exception message, stack trace, or payload fragment. |
| `received_at` | timestamp | No | Receipt timestamp. |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

This table deliberately never stores: raw request headers, raw request bodies, credentials, tracking numbers, tracking URLs, or customer PII (email, name, address). This is enforced by a model-walking test that asserts no field name on any model in the app contains "tracking", and by a dedicated test that posts a payload containing an email, a street address, a tracking number, and a tracking URL and asserts none of the four appear in the persisted receipt.

## Foreign Key Map

| From Table | Field | To Table | Field | Relationship |
| :--- | :--- | :--- | :--- | :--- |
| `order_items` | `order_id` | `orders` | `id` | Each order has many order items. |
| `order_items` | `canonical_sku_id` | `offer_skus` | `id` | Each order item may resolve to one canonical SKU. |
| `offer_skus` | `family_code` | `product_families` | `family_code` | Each SKU belongs to one product family. |
| `offer_skus` | `design_id` | `designs` | `id` | Each SKU belongs to one design. |
| `configuration_components` | `family_code` | `product_families` | `family_code` | Component rules are scoped by family. |
| `artwork_assets` | `design_id` | `designs` | `id` | Each artwork asset belongs to one design. |
| `artwork_assets` | `family_code` | `product_families` | `family_code` | Artwork path resolution depends on originating family. |
| `production_components` | `order_item_id` | `order_items` | `id` | Each component is generated from one order item. |
| `production_components` | `order_id` | `orders` | `id` | Each component belongs to one order. |
| `production_components` | `design_id` | `designs` | `id` | Each component may resolve to one design. |
| `production_components` | `artwork_asset_id` | `artwork_assets` | `id` | Each component may resolve to one artwork asset. |
| `production_components` | `print_template_id` | `print_templates` | `id` | Each component may resolve to one print template. |
| `batch_items` | `batch_id` | `production_batches` | `id` | Join from batch to component. |
| `batch_items` | `component_id` | `production_components` | `id` | Join from component to batch. |
| `packing_exports` | `generated_file_id` | `generated_files` | `id` | Each packing export may have one generated XLSX file. |
| `packing_export_orders` | `packing_export_id`, `order_id` | `packing_exports`, `orders` | `id` | Immutable order membership captured during successful export finalization. |
| `generated_files` | `production_batch_id` | `production_batches` | `id` | Generated PPTX files may belong to a batch. |
| `generated_files` | `packing_export_id` | `packing_exports` | `id` | Generated XLSX files may belong to a packing export. |

## Index Recommendations

Critical indexes:

| Table | Index | Reason |
| :--- | :--- | :--- |
| `orders` | `shopify_order_id` UNIQUE | Idempotent Shopify webhook handling. |
| `offer_skus` | `sku` UNIQUE | SKU lookup on order import. |
| `production_components` | `(status, batch_group)` | Open batch queries. |
| `production_batches` | `(production_group, status)` | Active batch lookup. |
| `production_batches` | `(production_group, batch_number)` UNIQUE | Enforces permanent, never-reissued batch numbers per production group; guarantees the guarantee even for any writer that bypasses the allocator (Decision #115). |
| `batch_items` | `(batch_id, component_id)` UNIQUE | Many-to-many integrity. |
| `artwork_assets` | `(design_id, component_code, family_code)` UNIQUE | Artwork path lookup is family-aware. |
| `order_items` | `shopify_product_id` | Supports deduplication of GRS series metafield lookups within an order. |
| `artwork_revalidation_runs` | `active_lock` UNIQUE | Deterministic single-active-run overlap protection across web and worker processes. |
| `webhook_receipts` | `webhook_delivery_id` UNIQUE | Idempotent handling of the four reconciliation webhooks; duplicate deliveries detected via constraint violation. |

Additional recommended indexes:

| Table | Index | Reason |
| :--- | :--- | :--- |
| `orders` | `order_number` | Operator search by Shopify order number. |
| `order_items` | `(order_id, shopify_line_item_id)` UNIQUE | Prevent duplicate line item imports per order. |
| `offer_skus` | `(family_code, design_code, config_code)` | SKU manager filtering and parser lookup. |
| `designs` | `internal_design_id` UNIQUE | Stable design ID lookup. |
| `designs` | `design_code` UNIQUE | Design-code lookup during SKU parsing. |
| `designs` | `shopify_product_handle` UNIQUE (partial, where not null) | Registry lookup by Shopify handle (Decision #68). |
| `product_families` | `family_code` UNIQUE | Product family lookup. |
| `configuration_components` | `(family_code, config_code, component_code)` UNIQUE | Prevent duplicate component mappings. |
| `production_components` | `order_id` | Order detail component lookup. |
| `production_batches` | `(status, opened_at)` | Batch dashboard filtering. |
| `production_batches` | `source_open_batch_id` | Failure-recovery lookup for subset-generation batches. |
| `generated_files` | `production_batch_id` | Batch output lookup. |
| `generated_files` | `packing_export_id` | Packing export output lookup. |
| `audit_events` | `(entity_type, entity_id)` | Entity audit history lookup. |
| `audit_events` | `created_at` | Audit log timeline sorting. |
| `artwork_revalidation_runs` | `(state, created_at)` | Run history and status lookups. |
| `webhook_receipts` | `(topic, received_at)` | Needs Attention webhook-failures section and audit lookups. |
| `webhook_receipts` | `webhook_event_id` | Correlation lookup (non-unique). |

## Status Enum Mapping

Status enum mapping (must match SOT exactly):

| Field | Owning Table | Allowed Values | Source |
| :--- | :--- | :--- | :--- |
| `orders.status` | orders | `Queued for Production`, `In Production`, `In Production (Needs Reprint)`, `Being Packaged`, `Shipped`, `Fulfilled Externally`, `Canceled` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `production_batches.status` | production_batches | `Open`, `Locked for Review`, `Printed`, `Archived` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `production_components.status` | production_components | `Queued`, `Ready`, `Blocked`, `Printed`, `Reprint Needed`, `Deferred MVP`, `Canceled` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `artwork_assets.status` | artwork_assets | `Available`, `Missing`, `Retired` | `Order_Status_and_Batch_Lifecycle_SOT.md` |
| `product_families.implementation_status` | product_families | `MVP`, `Future`, `Ignored for MVP` | `SKU_and_Internal_ID_Guide.md` |
| `webhook_receipts.outcome` | webhook_receipts | `Processed`, `No-op`, `Failed` | This document (P69). |

`Being Packaged` and `Shipped` are declared enum values with no live write path in MVP (Phase 3, see `Order_Status_and_Batch_Lifecycle_SOT.md`); application code enforces an explicit visible-status allowlist rather than relying on the enum definition alone.

Implementation rule:

- Store enum values as exact strings.
- Do not abbreviate enum values.
- Do not replace enum values with integer codes.
- Do not introduce additional enum values without updating the owning SOT document first.

## Django Model Notes

Django implementation must use PostgreSQL as the database engine.

Django model naming conventions:

| Database Table | Django Model |
| :--- | :--- |
| `orders` | `Order` |
| `order_items` | `OrderItem` |
| `offer_skus` | `OfferSku` |
| `designs` | `Design` |
| `product_families` | `ProductFamily` |
| `configuration_components` | `ConfigurationComponent` |
| `artwork_assets` | `ArtworkAsset` |
| `production_components` | `ProductionComponent` |
| `production_batches` | `ProductionBatch` |
| `batch_items` | `BatchItem` |
| `print_templates` | `PrintTemplate` |
| `packing_exports` | `PackingExport` |
| `generated_files` | `GeneratedFile` |
| `audit_events` | `AuditEvent` |
| `artwork_revalidation_runs` | `ArtworkRevalidationRun` |
| `webhook_receipts` | `WebhookReceipt` |
| `batch_number_sequences` | `BatchNumberSequence` |

Django field rules:

- Use `BigAutoField` for surrogate primary keys unless the table defines a natural primary key.
- Use `CharField` for SOT enum strings.
- Use `JSONField` for Shopify payload fragments, parsed SKU options, shipping address data, and event metadata.
- Use `DecimalField` for inch measurements in `print_templates`.
- Use `DateTimeField` for all timestamp fields.
- Use `BooleanField` for behavior flags.
- Use `ForeignKey` for one-to-many relationships.
- Use an explicit `BatchItem` model instead of an implicit Django many-to-many field so the join table can enforce integrity and support future audit behavior.

Status enum implementation:

- Django `TextChoices` may be used for exact SOT strings.
- The database value must be the exact display string from the SOT.
- Admin labels may match the stored value.
- Migrations must not rename statuses unless the owning SOT has been versioned and re-approved.

Seed data rules:

- `product_families` and `configuration_components` are seeded from `production_component_rules.yaml`.
- `print_templates` are seeded from `Product_Image_Transformation_Guidelines.md`.
- `designs` rows are auto-created at order import time via `get_or_create` on `design_code`. Pre-seeding via `seed_designs` is optional and used only to populate `design_name` display labels before orders arrive for a new design code.
- Seed operations must be idempotent.
- Seed operations must update changed rows without creating duplicates.

Generated file storage rules:

- Generated file records store Google Drive file IDs, shareable URLs, MIME types, and logical storage paths.
- The database stores file references, not raw file bytes.
- PPTX files are associated with `production_batches`.
- XLSX packing sheets are associated with `packing_exports`.

Cross-References:

| Related Document | Relationship |
| :--- | :--- |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines status enum values. |
| `SKU_and_Internal_ID_Guide.md` | Defines family code dictionary stored in `product_families`. |
| `production_component_rules.yaml` | Seeds `product_families` and `configuration_components` tables. |
| `Product_Image_Transformation_Guidelines.md` | Seeds `print_templates` table. |
| `Technical_Architecture_and_API_Contract.md` | Confirms PostgreSQL as the database engine; defines the endpoints that write `webhook_receipts`. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the reconciliation behavior that populates `webhook_receipts`. |
| `Decision_Log_and_Open_Questions.md` | Decision #42 authorizes the `webhook_receipts` table and the new status enum values. |
