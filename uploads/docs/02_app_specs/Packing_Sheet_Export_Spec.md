---
title: "Packing Sheet Export Spec"
version: "1.1"
status: "Pending Owner Verification"
last_verified: "2026-06-15"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Packing Sheet Exporter
  - Cloud File Storage
database_dependencies:
  - orders
  - order_items
  - production_components
  - production_batches
  - packing_exports
  - generated_files
core_lifecycle_states:
  - Locked for Review
  - Printed
  - Deferred MVP
---

# Packing Sheet Export Spec

## Output Format

- File type: XLSX
- One worksheet per export named "Packing Sheet"
- MVP: single sheet, no multi-tab structure

## Scope Rule

- The packing sheet covers all orders with at least one component in any batch that transitioned to `Locked for Review` or `Printed` in the current export window.
- The export window is defined by the operator at generation time (default: all batches since the last export).
- Orders with only non-produced items are included if they fall in the same window (criteria: order `created_at` is within the export window).

## Column Specification

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

## Sorting and Grouping

- Primary sort: Order Number ascending.
- One row per order (line items collapsed into the Items column).

## Family-Specific Display

- Produced items: appear in Items column with quantity; Production Groups column populated.
- Non-produced items (BAT, HOD, PIL, TAP, TOT): appear in Items column; Production Groups shows "Non-Produced"; Print Status shows "Not Applicable".
- `GRD` items: appear in Items column with note "Deferred — not yet produced"; Production Groups shows "Deferred"; Print Status shows "Not Applicable for MVP".

## File Naming and Path

- Pattern: `PACKING-SHEET-{YYYYMMDD}-{###}.xlsx`
- Example: `PACKING-SHEET-20260614-001.xlsx`
- Path: `SpicedAnime/packing_sheets/{YYYY-MM-DD}/`

## Generation Trigger

- Manual trigger via the Packing Queue screen.
- Operator selects the export window (default: all batches since last export).
- A Celery task generates the file using `openpyxl` and uploads to Google Drive.
- On completion, a Drive shareable URL is returned and stored in `packing_exports`.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the Google Drive output path. |
| `Order_Status_and_Batch_Lifecycle_SOT.md` | Defines the component statuses aggregated in Print Status. |
| `SKU_and_Internal_ID_Guide.md` | Defines the family classification driving family-specific display. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Celery task infrastructure. |
