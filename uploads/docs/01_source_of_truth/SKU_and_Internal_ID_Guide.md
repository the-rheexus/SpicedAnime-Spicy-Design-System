---
title: "SKU and Internal ID Guide"
version: "2.1"
status: "Pending Owner Verification"
last_verified: "2026-09-13"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - Shopify Admin API
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
database_dependencies:
  - offer_skus
  - designs
  - product_families
  - configuration_components
core_lifecycle_states:
  - Deferred MVP
---

# SKU and Internal ID Guide

## Purpose and Two-Layer Identification Model

This document defines the canonical Shopify offer SKU format, the design code system, internal database IDs, every option and config code dictionary, the parser contract, validation rules, and the migration strategy (canonical SKUs only; no alias infrastructure).

The SKU identifies the Shopify sellable variant. The database provides production intelligence, including production component generation, artwork lookup, print template selection, batch routing, and packing-sheet behavior.

## Canonical SKU Format

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

## Product Family Code Dictionary

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

## Design Codes and Internal Design IDs

Internal Design ID format:

- Seeded or manually created designs use sequential IDs:

```text
D000001
D000002
D000003
```

- Designs auto-created at order import time (Decision #36) use the format `AUTO{id}`, where `{id}` is the design row's database primary key (e.g., `AUTO4821`). Approved by Decision #37.
- Both formats are valid, permanent, and unique. Auto-created designs are never renumbered to the `D######` format.

Design Code rules:

- 4 to 10 characters (`DESIGN_CODE_MIN_LENGTH = 4` enforced by Decision #135)
- Uppercase letters and numbers only
- Must be unique
- Never changed after launch
- Collision handling: append numeric suffix (`CHARFRIE`, `CHARFRIE2`)

## SKU Auto-Generation Engine

Per Decision #68, the app can propose SKUs for Shopify products that have none, using the owner's naming standard (`SpicedAnime_SKU_Nomenclature_and_Code_Reference.docx`). This section documents that standard as implemented.

### Family Detection Precedence

`infer_family_from_text()` checks Shopify Type first, then a combined string of title, handle, tags, and product type, in this protected order (broad terms are checked last so they cannot capture a more specific product):

| Order | Family | Reason |
| :--- | :--- | :--- |
| 1 | `BAT` | Must be identified before generic tapestry. |
| 2 | `HOD` | Apparel wording is specific. |
| 3 | `PIL` | Pillow wording must not fall into tapestry. |
| 4 | `BOX` | Specific Stash Box wording; checked before `GRS` and `TRY` so a Stash Box title that also names a grinder or tray is not captured by a broader test (Decision #124). |
| 5 | `GRS` | Set semantics require grinder plus set and jar/tray context; checked before `TRY` so a "Grinder, Jar, Rolling Tray Set" title is not captured by the `TRY` rolling-tray keyword (Decision #124). |
| 6 | `TRY` | Checked before Tapestry because titles/tags may contain tapestry-related language. |
| 7 | `TOT` | Must be excluded from generic tapestry matching. |
| 8 | `TAP` | Generic tapestry fallback after BAT, pillow, tray, and tote checks. |
| 9 | `JAR` | Stash Jar / Spice Jar wording. |
| 10 | `WAL` | Wallet wording. |
| 11 | `ASH` | Ashtray wording. |
| 12 | `LIT` | Broad and intentionally checked last. |

A product matching no family in this list is skipped; no SKU is proposed.

### Design Code Proposal Algorithm

1. Check the design-code registry (see `designs.shopify_product_handle` in `Data_Model_and_Database_Schema.md`) for an existing locked code for this handle. If found, reuse it; a locked code is never changed by this engine.
2. Check known title overrides for established special cases.
3. Remove generic words from the remaining title. The complete list is `ANIME`, `MANGA`, `COVER`, `LIGHTER`, `TRAY`, `SET`, `BAG`, `DEFAULT`, `GRINDER`, `GRD`, `JAR`, `ROLLING`, `STASH`, `SPICE`, `ASHTRAY`, `ASH`, `WALLET`, `BOX`, `HOODIE`, `SWEATSHIRT`, `PILLOW`, `TAPESTRY`, `BLACK`, `ART`, and `TOTE` (Decision #124).
4. Join meaningful title words if the result is 4 to 10 characters; for longer names, combine a compact portion of the first two meaningful words. If title stripping leaves fewer than 4 characters, the engine will not propose an undersized code; it sets the proposed design code to the placeholder `DESIGN` and flags the proposal for manual review (Decision #135).
5. Sanitize to uppercase alphanumeric characters and truncate to 10 characters.
6. If the proposed code already exists in the registry under a different handle, append the first available numeric suffix (e.g., `GUTS2`, `TANJIFIRE3`) while staying within 10 characters.
7. Store the final assignment in the registry keyed by handle. Row order never determines the code; the handle-keyed registry is authoritative, and an approved code must not silently change.

### Per-Family Option and Config Mapping

Bundle/config detection reads each variant's Shopify option labels. Where the owner's standard defines a default, an unmapped or absent value resolves to that default and is flagged for review; where no default is defined, an unmapped value produces a placeholder (see Placeholder Behavior) and must never reach an approved upload.

| Family | Mapping Behavior | Default on Unknown/Absent |
| :--- | :--- | :--- |
| `LIT` | Color (`WHT`/`SIL`/`GLD`), flame (`BIC`/`TOR`), and bundle (`SOLO`/`LITTIN`/`TINONLY`) resolved from variant option text. | None; unrecognized color, flame, or bundle produces a placeholder plus an error. |
| `ASH` | Bundle resolved to `SOLO` or `ASHGRD` (either word order). | `SOLO`, with a warning requiring review. |
| `TRY`, `JAR` | Fixed `SOLO`; no coded variant. | Not applicable. |
| `WAL` | Bundle resolved to `WALFONLY` or `WALFB`; storefront "Basic" wording maps to `WALFONLY` (front-only printing) (Decision #124). | `WALFB`, with a warning requiring review. |
| `GRS` | Bundle inferred from component words (`GRINDER`/`GRD`, `JAR`, `TRAY`/`TRY`) to one of `GRDONLY`, `JARONLY`, `TRYONLY`, `GRDJAR`, `GRDTRY`, `JARTRY`, `GRDSET`. | None; missing or unrecognized data produces a placeholder plus an error. A variant that names a Lighter component produces a distinct `CONFIG` placeholder held for manual review, because no GRS configuration includes a Lighter; the Lighter is never silently dropped (Decision #124). |
| `BOX` | Bundle resolved to `SOLO`, `BOXGRD`, `BOXJAR`, `BOXLIT`, or `BOX4`; full-set, complete-set, four-piece / 4-piece wording, or any option text combining Grinder + Jar + Lighter maps to `BOX4` (Decisions #124, #133). Single-variant fallback matching normalizes whitespace and `Default Title` sentinels (Decision #133). | None; missing or unknown data produces a placeholder plus an error. |
| `BAT`, `TAP` | Size from named aliases or explicit `WIDTHxHEIGHT`. | `LRG` when no usable size is present. |
| `HOD` | Size as above; color from approved color words. | Color defaults to `BLK` when the export has only size variants (product-level discovery color is intentionally ignored). |
| `PIL` | Dimension and, when present, pack quantity (e.g., `18X18P2`). | `18X18` when no usable dimension is present. |
| `TOT` | Color from approved color words. | `BLK` when no usable option or color metafield is present. |

Approved color codes: `BLK`, `WHT`, `RED`, `BLU`, `GRN`, `PNK`, `PUR`, `YLW`, `GLD`, `SIL`, `GRY`, `BRN`, `MULTI`.

### Placeholder Behavior

An unmapped segment with no defined default (see table above), or a design code candidate shorter than 4 characters (Decision #135), produces a placeholder value (e.g., `DESIGN`, `COLOR`, `FLAME`, `CONFIG`, `SIZE`) plus a recorded error. A placeholder is a deliberate stop sign, useful in a draft log, and must never reach an approved upload or be auto-approved; it is rejected by `POST /api/skus/generate/accept/`.

### Variant Exclusions

Certain Shopify variant option values are excluded from SKU generation entirely (no SKU proposed for that variant). The current default exclusion is Aluminum Gold. Exclusions are configurable and must be reviewed before removal.

### Evidence Priority for Existing Assignments

When multiple sources could establish a handle's design code, priority is: (1) an approved verification record, (2) a final SKU output/log, (3) another approved record, (4) a consistent existing SKU already using that design segment, (5) a deterministic title-rule proposal requiring review before locking.

## Option Code Dictionaries

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

## Configuration Code Dictionary

| Config Code | Meaning | Generates Print Components? |
| :--- | :--- | :---: |
| `SOLO` | Main family product only | Family-dependent (see Decomposition Rules); the auto-generation engine's default for `ASH` when no bundle option is present is `SOLO` (see SKU Auto-Generation Engine) |
| `ASHGRD` | Ashtray + Grinder bundle | Yes |
| `LITTIN` | Lighter + Tin bundle | Yes |
| `TINONLY` | Lighter design, tin case only (no lighter) | Yes |
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

## Family-Specific SKU Formats

| Family | Format | Example |
| :--- | :--- | :--- |
| Ashtray | `ASH-<DESIGN>-<CONFIG>` | `ASH-CHARFRIE-SOLO` |
| Flip Lighter | `LIT-<DESIGN>-<COLOR>-<FLAME>-<CONFIG>` | `LIT-DESNAM-SIL-TOR-LITTIN` |
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

## Production Component Codes

Production Component Code Dictionary (pointer table; canonical version in Decomposition Rules):

| Component Code | Component | Source Artwork File (by originating family) |
| :--- | :--- | :--- |
| `ASH` | Ashtray print | `artwork/Ashtray/{DESIGN_CODE}.png` |
| `GRD` | Grinder print (component, not family) | `ASH` family (ASHGRD): `artwork/Ashtray/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/GRD.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/GRD.png` |
| `JAR` | Jar print | `JAR` family: `artwork/Stash Jar/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/JAR.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/JAR.png` |
| `TRY` | Tray print | `TRY` family: `artwork/Rolling Tray/{DESIGN_CODE}.png`; `GRS` family: `artwork/Grinder Sets/{SERIES}/{DESIGN_CODE}/TRY.png` |
| `LITF` | Lighter front (placement) | `LIT` family: `artwork/Flip Lighter/{DESIGN_CODE}.png`; `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/LIT.png` |
| `LITB` | Lighter back (placement) | `LIT` family: `artwork/Flip Lighter/{DESIGN_CODE}.png` (same file as LITF); `BOX` family: `artwork/Stash Box/{DESIGN_CODE}/LIT.png` (same file as LITF) |
| `TIN` | Tin print | `artwork/Flip Lighter/{DESIGN_CODE}.png` (shared with `LITF`/`LITB`; 90° rotation applied at generation) |
| `BOX` | Box print | `artwork/Stash Box/{DESIGN_CODE}/BOX.png` |
| `WALF` | Wallet front (placement) | `artwork/Wallet/{DESIGN_CODE}.png` |
| `WALB` | Wallet back (placement) | `artwork/Wallet/{DESIGN_CODE}.png` (same file as WALF) |

## Parser Contract

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

## Validation Rules and Failure Codes

Validation failure codes:

| Code | Trigger |
| :--- | :--- |
| `INVALID_CASE` | SKU contains lowercase letters. |
| `INVALID_CHARACTERS` | SKU contains disallowed characters. |
| `NO_SKU` | Shopify line item has no SKU (null or empty after normalization). |
| `DUPLICATE_SKU` | SKU already exists in `offer_skus`. |
| `UNKNOWN_FAMILY` | Family code is not in the dictionary. |
| `INVALID_FORMAT` | SKU does not match the family-specific pattern. |
| `UNKNOWN_CONFIG` | Config code not valid for this family. |
| `UNKNOWN_OPTION` | Option code not in the option dictionary. |
| `NO_COMPONENT_RULE` | No row in `configuration_components` for this family + config. |
| `MISSING_ARTWORK` | Expected artwork file not found at Google Drive path. |
| `MISSING_TEMPLATE` | No row in `print_templates` for the required component. |
| `FAMILY_DEFERRED_MVP` | SKU family is `GRD`; routes component to Deferred Items queue. Not an error condition; expected behavior. |

## Governance

Rules for creating, retiring, and renaming SKUs and designs:

- Never reuse retired SKUs.
- Case-only uniqueness is forbidden.
- Design codes are immutable after launch.
- New design code collisions are handled by appending a numeric suffix (`CHARFRIE`, `CHARFRIE2`).
- New family, option, or config codes must be added to the relevant dictionary before use.

## Namespace Clarification

- Family code `GRD` identifies the future Herb Grinder Shopify product family. Deferred for MVP.
- Component code `GRD` identifies the grinder image production component (2.35" diameter circle crop). Used in Grinder Sets and any future Herb Grinder solo products.
- These codes share a string value but live in different database tables (`product_families` vs internal component code enum) and are never confused at runtime because they appear in different contexts.

## Cross-References

| Related Document | Relationship |
| :--- | :--- |
| `Production_Component_Decomposition_Rules.md` | Defines what components each family + config combination generates. |
| `Data_Model_and_Database_Schema.md` | `product_families` table is the canonical storage for the family dictionary; this document is the prose source. |
| `Artwork_Library_File_Storage_and_Generated_Outputs_SOT.md` | Defines the artwork file path conventions referenced in the component table. |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | Defines what happens when a validation failure code fires. |