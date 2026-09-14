---
title: "Artwork Library File Storage and Generated Outputs SOT"
version: "2.3"
status: "Pending Owner Verification"
last_verified: "2026-09-07"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Artwork Library
  - PPTX Generation Engine
  - Packing Sheet Exporter
  - Cloud File Storage
database_dependencies:
  - artwork_assets
  - artwork_revalidation_runs
  - production_batches
  - packing_exports
  - generated_files
core_lifecycle_states:
  - Blocked
  - Available
  - Missing
  - Retired
---

# Artwork Library File Storage and Generated Outputs SOT

## Cloud Storage Platform

Google Drive is the cloud storage platform for all environments.

This document defines the Google Drive folder structure for source artwork, generated PPTX files, generated packing sheets, and batch archives. It is the single canonical source for all file paths, naming conventions, missing-artwork behavior, and artwork versioning rules.

## Top-Level Folder Structure

```text
SpicedAnime/
├── artwork/
│   ├── Ashtray/
│   │   └── {DESIGN_CODE}.png
│   ├── Flip Lighter/
│   │   └── {DESIGN_CODE}.png
│   ├── Grinder Sets/
│   │   └── {SERIES}/
│   │       └── {DESIGN_CODE}/
│   │           ├── GRD.png
│   │           ├── JAR.png
│   │           └── TRY.png
│   ├── Herb Grinder/
│   │   └── {DESIGN_CODE}.png
│   ├── Rolling Tray/
│   │   └── {DESIGN_CODE}.png
│   ├── Stash Box/
│   │   └── {DESIGN_CODE}/
│   │       ├── BOX.png
│   │       ├── GRD.png
│   │       ├── JAR.png
│   │       └── LIT.png
│   ├── Stash Jar/
│   │   └── {DESIGN_CODE}.png
│   └── Wallet/
│       └── {DESIGN_CODE}.png
├── batches/
│   └── {YYYY-MM-DD}/
│       ├── Lighter-BATCH-20260614-001.pptx
│       ├── Ashtray-BATCH-20260614-001.pptx
│       └── ...
├── packing_sheets/
│   └── {YYYY-MM-DD}/
│       └── PACKING-SHEET-20260614-001.xlsx
├── previews/
│   └── {YYYY-MM-DD}/
│       └── Lighter-PREVIEW-20260825-001.pptx
├── event_prints/
│   └── {YYYY-MM-DD}/
│       └── EVENT-LIGHTER-20260825-001.pptx
└── archives/
    └── {YYYY-MM-DD}/
        └── (archived batch files)
```

## Source Artwork Conventions

Source artwork is organized by product category first, then by design. Each product category has its own folder under `SpicedAnime/artwork/`. Two file-naming conventions apply depending on the product:

- Single-component product types (`Ashtray`, `Flip Lighter`, `Rolling Tray`, `Stash Jar`, `Wallet`, `Herb Grinder`) use `{DESIGN_CODE}.png` as the filename directly inside the product category folder.
- Multi-component product types (`Stash Box`) use `{DESIGN_CODE}/` as a design subfolder containing component-code-named files (`BOX.png`, `LIT.png`, `GRD.png`, `JAR.png`).
- Grinder Sets use an intermediate series level: `Grinder Sets/{SERIES}/{DESIGN_CODE}/` containing `GRD.png`, `JAR.png`, `TRY.png`.

Front/back placement rules:

- `LITF` and `LITB` both resolve to `artwork/Flip Lighter/{DESIGN_CODE}.png` for `LIT`-family orders.
- `WALF` and `WALB` both resolve to `artwork/Wallet/{DESIGN_CODE}.png`.
- For BOX-family orders, `LITF` and `LITB` both resolve to `artwork/Stash Box/{DESIGN_CODE}/LIT.png` instead.

Shared-source-file conditions:

- LITTIN orders: `LITF`, `LITB`, and `TIN` all resolve to the same `artwork/Flip Lighter/{DESIGN_CODE}.png` file. `TIN` receives a programmatic 90-degree rotation during PPTX generation.
- ASHGRD orders: `ASH` and `GRD` both resolve to the same `artwork/Ashtray/{DESIGN_CODE}.png` file. The `GRD` placement receives GRD transformation parameters (2.35" circle crop, `#F2F2F2` border).
- BOX-family LITF/LITB are isolated to the Stash Box folder and do not share files with standalone LIT-family orders.

GRS series resolution:

The `{SERIES}` segment in a Grinder Sets path is the exact value of the Shopify product-level custom metafield `custom.series`, retrieved via the Shopify Admin API using the `product_id` from the order line item. The folder name in Drive must match this metafield value exactly, including capitalization and spacing. If the metafield is absent or the API call fails, the GRS component is Blocked with failure code `MISSING_SERIES_METAFIELD`. No fallback path exists. The full lookup algorithm is specified in `Shopify_Integration_and_Order_Import_Spec.md`.

## Component-to-File Resolution

| Component Code | Originating Family | Source File Path |
| :--- | :--- | :--- |
| `ASH` | `ASH` | `SpicedAnime/artwork/Ashtray/{DESIGN_CODE}.png` |
| `GRD` | `ASH` (ASHGRD) | `SpicedAnime/artwork/Ashtray/{DESIGN_CODE}.png` (shared with `ASH`; GRD transform applied) |
| `GRD` | `GRS` | `SpicedAnime/artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/GRD.png` |
| `GRD` | `BOX` (BOXGRD, BOX4) | `SpicedAnime/artwork/Stash Box/{DESIGN_CODE}/GRD.png` |
| `JAR` | `JAR` | `SpicedAnime/artwork/Stash Jar/{DESIGN_CODE}.png` |
| `JAR` | `GRS` | `SpicedAnime/artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/JAR.png` |
| `JAR` | `BOX` (BOXJAR, BOX4) | `SpicedAnime/artwork/Stash Box/{DESIGN_CODE}/JAR.png` |
| `TRY` | `TRY` | `SpicedAnime/artwork/Rolling Tray/{DESIGN_CODE}.png` |
| `TRY` | `GRS` | `SpicedAnime/artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/TRY.png` |
| `LITF` | `LIT` | `SpicedAnime/artwork/Flip Lighter/{DESIGN_CODE}.png` |
| `LITB` | `LIT` | `SpicedAnime/artwork/Flip Lighter/{DESIGN_CODE}.png` (same file as LITF) |
| `LITF` | `BOX` (BOXLIT, BOX4) | `SpicedAnime/artwork/Stash Box/{DESIGN_CODE}/LIT.png` |
| `LITB` | `BOX` (BOXLIT, BOX4) | `SpicedAnime/artwork/Stash Box/{DESIGN_CODE}/LIT.png` (same file as LITF) |
| `TIN` | `LIT` (LITTIN) | `SpicedAnime/artwork/Flip Lighter/{DESIGN_CODE}.png` (shared with `LITF`/`LITB`; 90° rotation applied) |
| `BOX` | `BOX` | `SpicedAnime/artwork/Stash Box/{DESIGN_CODE}/BOX.png` |
| `WALF` | `WAL` | `SpicedAnime/artwork/Wallet/{DESIGN_CODE}.png` |
| `WALB` | `WAL` | `SpicedAnime/artwork/Wallet/{DESIGN_CODE}.png` (same file as WALF) |

## Missing Artwork Behavior

- If a required file is not present at the expected Drive path, the component transitions to `Blocked` status with failure code `MISSING_ARTWORK`.
- For GRS-family components, if the Shopify `custom.series` metafield is absent or the lookup call fails, the component transitions to `Blocked` with failure code `MISSING_SERIES_METAFIELD` instead. The expected Drive path cannot be constructed without the series value.
- The item appears on the Needs Attention screen with the appropriate failure message and the expected file path (or Shopify product reference, for `MISSING_SERIES_METAFIELD`).
- Other components in the same order continue processing normally.

## Artwork Revalidation and Reconciliation

Two entry points share one reconciliation service: the hourly periodic task and the operator-triggered "Revalidate Artwork" action on the Artwork Library screen. Both scan Drive and reconcile the database against what is actually present, never the reverse.

Scan scope:

- The scan traverses only the `artwork/` subtree under the configured Drive root. Sibling folders (`batches/`, `packing_sheets/`, `archives/`) are never enumerated.
- An absent `artwork/` folder is treated as a complete scan of zero files, not a failure.
- The scan completes in full, following pagination to the end, before any database write occurs. An incomplete or failed scan performs zero mutations.

File classification:

- A file at its exact canonical path (matching the Component-to-File Resolution table above, including case and the GRS `{SERIES}` folder) is a canonical match.
- A file whose basename matches a canonical artwork filename but sits outside its canonical location is classified as misplaced.
- Any other file is classified as unknown.
- A duplicate is two or more Drive files found at the exact same canonical path during a single scan. Duplicates are detected before anything is selected for that path; when a canonical path is duplicated, the asset or component that would resolve to it is left unresolved for that run rather than guessing which file is correct.
- Misplaced, duplicate, and unknown files are reported for operator review only. They are never consumed, and unknown files never create designs, artwork records, SKUs, or components.

Recovery scope:

- Only components `Blocked` with failure code `MISSING_ARTWORK` are eligible for recovery. `MISSING_SERIES_METAFIELD` components are never retried by this process; recovery for that code remains re-import only, per the Missing Artwork Behavior section above.
- A recovered component is assigned to the current `Open` batch for its production group. `Locked for Review`, `Printed`, and `Archived` batches are never targeted.

No reverse invalidation:

- This process only ever moves an asset from `Missing` toward `Available` and a component from `Blocked` toward `Ready`. It never performs the reverse: a file that has vanished from Drive since the last scan is reported, but the corresponding `artwork_assets` and `production_components` rows are left unchanged.
- Reverse transitions (`Available` -> `Missing`, `Ready` -> `Blocked`) are not implemented and require a separate approved decision before any future pass adds them.

## Artwork Versioning

- Replacing an artwork file in Drive overwrites the previous version.
- Drive's native version history is the audit trail. The app does not maintain a separate version table.
- TBD: requires owner approval if a stricter versioning policy is needed.

## Retired Artwork Handling

- An `artwork_assets` row with status `Retired` is not returned by lookups.
- The underlying Drive file may remain in place but is no longer referenced.

## Generated PPTX Output

Generated PPTX naming:

- Pattern: `{BATCH_GROUP}-BATCH-{YYYYMMDD}-{###}.pptx`
- Example: `Lighter-BATCH-20260614-001.pptx`
- Path: `SpicedAnime/batches/{YYYY-MM-DD}/`

Batch preview PPTX naming (Decision #72), distinct so a preview can never be mistaken for a locked-batch print file:

- Pattern: `{BATCH_GROUP}-PREVIEW-{YYYYMMDD}-{###}.pptx`
- Example: `Lighter-PREVIEW-20260825-001.pptx`
- Path: `SpicedAnime/previews/{YYYY-MM-DD}/`
- Not recorded in `generated_files`; returned as a Drive link only, since there is no batch-locking transition to attach it to.

Event Prints PPTX naming (Decision #73), distinct from both batch and preview output:

- Pattern: `EVENT-{PRODUCT}-{YYYYMMDD}-{###}.pptx`
- Example: `EVENT-LIGHTER-20260825-001.pptx`
- Path: `SpicedAnime/event_prints/{YYYY-MM-DD}/`
- Not recorded in `generated_files`; returned as a Drive link only, since there is no order or batch to attach it to.

**On `{###}` (Decision #115).** For batch output, `{###}` is `production_batches.batch_number` — permanently unique per production group and never reissued, even after the batch that held it is deleted. For preview and Event Prints output, `{###}` is a separate, independently allocated per-folder sequence number; it is not tied to `batch_number` and is not required to be globally unique.

## Generated Packing Sheet Output

Generated packing sheet naming:

- Pattern: `PACKING-SHEET-{YYYYMMDD}-{###}.xlsx`
- Example: `PACKING-SHEET-20260614-001.xlsx`
- Path: `SpicedAnime/packing_sheets/{YYYY-MM-DD}/`

## SKU Export Master Catalog Storage

The operator-uploaded Shopify product-export CSV that backs `GET /api/skus/export.csv` (Decision #118, superseding Decision #99's frozen single-file mechanism) is stored in Google Drive, consistent with this document's cloud storage platform (Decision #24).

- Every successful upload is retained, not overwritten; the most recent upload is the active master used by all subsequent SKU exports, and prior uploads remain available for reference.
- This storage location is distinct from `batches/`, `previews/`, `event_prints/`, and `packing_sheets/` above — it holds an operator-supplied input file, not an app-generated output.
- The exact top-level Drive path and file-naming convention are deferred to implementation and must be recorded here, and in `Technical_Architecture_and_API_Contract.md`'s Approved API Extensions Pending Implementation table, once defined.

## Batch Archive Path

- When a batch transitions to `Archived`, its generated files remain at their original paths.
- A pointer is recorded in the `production_batches` row; no physical file move is required.

## Google Drive Authentication

- Method: Google Cloud service account with delegated access to the `SpicedAnime/` root folder.
- Credentials: JSON key file stored as environment variable `GOOGLE_DRIVE_CREDENTIALS_JSON`.
- Required scope: `https://www.googleapis.com/auth/drive`.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Defines which components require which artwork files. |
| `Shopify_Integration_and_Order_Import_Spec.md` | Defines the GRS series metafield lookup algorithm that supplies `{SERIES}` for Grinder Sets paths. |
| `PPTX_Generation_and_Layout_Engine_Spec.md` | Consumes artwork files, applies the shared-source-file transforms (TIN rotation, ASHGRD GRD reshape), and writes generated PPTX outputs. |
| `Packing_Sheet_Export_Spec.md` | Writes generated XLSX outputs per this path convention. |
| `Technical_Architecture_and_API_Contract.md` | Defines the Google Drive API integration. |
| `Security_Access_and_Privacy_Spec.md` | Defines credential handling for the service account. |
