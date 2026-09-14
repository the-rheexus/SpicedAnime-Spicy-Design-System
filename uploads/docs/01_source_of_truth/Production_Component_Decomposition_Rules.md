---
title: "Production Component Decomposition Rules"
version: "1.3"
status: "Pending Owner Verification"
last_verified: "2026-08-25"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Artwork Library
  - Production Batch Engine
database_dependencies:
  - product_families
  - production_components
  - configuration_components
core_lifecycle_states:
  - Deferred MVP
---

# Production Component Decomposition Rules

Defines exactly which internal print components are generated from each SKU family + config combination. This is the rule table the app uses to turn one purchased SKU into one or more printable units. This document is the prose companion to `production_component_rules.yaml`, which must remain bit-for-bit consistent.

## Decomposition Rule Table

| Family | Config | Components Generated | Batch Group Routing |
| :--- | :--- | :--- | :--- |
| `ASH` | `SOLO` | `ASH` x1 | Ashtray |
| `ASH` | `ASHGRD` | `ASH` x1, `GRD` x1 | Ashtray + Grinder/Jar/Tray |
| `LIT` | `SOLO` | `LITF` x1, `LITB` x1 | Lighter |
| `LIT` | `LITTIN` | `LITF` x1, `LITB` x1, `TIN` x1 | Lighter + Tin |
| `LIT` | `TINONLY` | `TIN` x1 | Tin |
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

Quantity rule:

- A line item quantity of N produces N copies of each generated component. Example: an order line item `ASH-CHARFRIE-ASHGRD` with qty 3 generates three `ASH` components and three `GRD` components.

## Component Code Reference

| Component Code | Component | Source Artwork File (by originating family) |
| :--- | :--- | :--- |
| `ASH` | Ashtray print | `artwork/Ashtray/{DESIGN_CODE}.png` |
| `GRD` | Grinder print (component, not family) | `ASH` family (ASHGRD): `artwork/Ashtray/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/GRD.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/GRD.png` |
| `JAR` | Jar print | `JAR` family: `artwork/Stash Jar/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/JAR.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/JAR.png` |
| `TRY` | Tray print | `TRY` family: `artwork/Rolling Tray/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/TRY.png` |
| `LITF` | Lighter front (placement) | `LIT` family: `artwork/Flip Lighter/{DESIGN_CODE}.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/LIT.png` |
| `LITB` | Lighter back (placement) | `LIT` family: `artwork/Flip Lighter/{DESIGN_CODE}.png` (same file as LITF); `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/LIT.png` (same file as LITF) |
| `TIN` | Tin print | `artwork/Flip Lighter/{DESIGN_CODE}.png` (`LITTIN` shares this file with `LITF`/`LITB`; `TINONLY` produces `TIN` alone from the same file; 90° rotation applied at generation) |
| `BOX` | Box print | `artwork/Stash Box/{DESIGN_CODE}/BOX.png` |
| `WALF` | Wallet front (placement) | `artwork/Wallet/{DESIGN_CODE}.png` |
| `WALB` | Wallet back (placement) | `artwork/Wallet/{DESIGN_CODE}.png` (same file as WALF) |

## Non-Produced Family Exclusion

| Family | Config | Components Generated |
| :--- | :--- | :--- |
| `BAT` | `NONE` | (none) |
| `HOD` | `NONE` | (none) |
| `PIL` | `NONE` | (none) |
| `TAP` | `NONE` | (none) |
| `TOT` | `NONE` | (none) |

## Deferred MVP Behavior

| Family | All Configs | Components Generated | Status |
| :--- | :--- | :--- | :--- |
| `GRD` | (all) | Component record created with status `Deferred MVP`; not assigned to any batch | Deferred for MVP per Decision #18 |

## Front/Back Placement Rule

- `LITF` and `LITB` are separate component records (the layout engine needs two placements on the slide). For `LIT`-family orders, both resolve to `artwork/Flip Lighter/{DESIGN_CODE}.png`. For `BOX`-family orders (BOXLIT, BOX4), both resolve to `artwork/Stash Box/{DESIGN_CODE}/LIT.png` instead.
- `WALF` and `WALB` are separate component records; both resolve to `artwork/Wallet/{DESIGN_CODE}.png`.
- This rule applies to artwork lookup only. Component records remain distinct in the database for layout placement, quantity counting, and batch reporting.

## Shared-Source-File Configs

Three component configurations share a single source artwork file across multiple component placements. The shared file is fetched once; per-component transformation parameters are applied independently to each placement.

- **LITTIN orders.** `LITF`, `LITB`, and `TIN` all resolve to `artwork/Flip Lighter/{DESIGN_CODE}.png`. Lighter placements receive standard Lighter transform parameters; the TIN placement receives Tin transform parameters plus a programmatic 90-degree rotation applied during PPTX generation. The source file is stored upright in Drive.
- **ASHGRD orders.** `ASH` and `GRD` both resolve to `artwork/Ashtray/{DESIGN_CODE}.png`. The `ASH` placement receives Ashtray transform parameters. The `GRD` placement receives GRD transform parameters (2.45" circle crop, `#E8E8E8` border, and the Grinder color adjustments of -10% Brightness, +25% Contrast, 150% Saturation) per the Grinder row in `Product_Image_Transformation_Guidelines.md`, not Ashtray parameters.
- **BOX-family bundles.** All `BOX`-family components (`BOX`, `LITF`, `LITB`, `GRD`, `JAR` from BOXLIT, BOXGRD, BOXJAR, BOX4) resolve exclusively to `artwork/Stash Box/{DESIGN_CODE}/`. These files are isolated from standalone product folders; a Stash Box design may use artwork distinct from the standalone `LIT` or `GRS` versions of the same design code.

## YAML Sync Contract

`production_component_rules.yaml` is the machine-readable mirror of this document.

This document and `production_component_rules.yaml` must stay in sync. Any change here requires regenerating the YAML.
