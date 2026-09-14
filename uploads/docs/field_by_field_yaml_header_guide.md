---
title: "SpicedAnime Fulfillment App: Field-by-Field YAML Header Guide"
version: "1.2"
status: "Approved Baseline"
last_verified: "2026-06-14"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
---

# Field-by-Field YAML Header Guide

Reference for completing the standard YAML frontmatter block in every SpicedAnime fulfillment app specification document. Every document in the `docs/` tree must include this header. Fill in only the fields that apply to the specific document; omit fields whose values would be an empty list.

---

## 1. title

**Format:** String enclosed in double quotes.

**Rule:** Use the exact document title as it appears in the documentation tree. Do not abbreviate.

**Examples:**

```yaml
title: "End-to-End Fulfillment Workflow"
title: "SKU and Internal ID Guide"
title: "Production Component Decomposition Rules"
```

---

## 2. version

**Format:** String in `"MAJOR.MINOR"` format.

**Rule:** Start every new document at `"1.0"`. Increment MINOR for content additions or clarifications. Increment MAJOR only when a previously approved rule changes meaning.

**Examples:**

```yaml
version: "1.0"
version: "1.2"
version: "2.0"
```

---

## 3. status

**Format:** String enclosed in double quotes. Must be one of the four allowed values below.

**Allowed values:**

| Value | Meaning |
| :--- | :--- |
| `"Draft"` | Work in progress; not ready for review. |
| `"Pending Owner Verification"` | Draft is complete and waiting for owner review. |
| `"Changes Requested"` | Owner reviewed and asked for revisions. |
| `"Approved Baseline"` | Locked. Changes require a version bump and re-approval. |

**Rule:** All documents begin as `"Pending Owner Verification"` when first sent to the owner. Only the owner can change a document to `"Approved Baseline"`. Coding AI must not implement against a document in any status other than `"Approved Baseline"` unless explicitly authorized.

**Example:**

```yaml
status: "Pending Owner Verification"
```

---

## 4. last_verified

**Format:** Date string in `YYYY-MM-DD` format.

**Rule:** Update this field every time the document is reviewed against the Decision Log, even if no content changes. This is the date a human confirmed the document still matches the approved decisions.

**Example:**

```yaml
last_verified: "2026-06-14"
```

---

## 5. owner

**Format:** String.

**Rule:** Always `"SpicedAnime"` for this project. Do not substitute Josiah's name; the owner is the business, not the individual.

**Example:**

```yaml
owner: "SpicedAnime"
```

---

## 6. authors

**Format:** YAML array (bulleted list).

**Rule:** List every person who contributed to writing or approving this document. Use first names only for internal documents.

**Example:**

```yaml
authors:
  - Josh
  - Josiah
```

---

## 7. primary_systems

**Format:** YAML array (bulleted list).

**Rule:** List only the functional modules or external platforms that the code or rules defined in this document actively interact with. Do not include systems that are merely referenced or described. If in doubt, ask: would a change to this document require a code change in that system? If yes, include it.

**Available values (select only those that apply):**

| Value | When to include |
| :--- | :--- |
| `Shopify Admin API` | Document defines or consumes Shopify order, SKU, or webhook behavior. |
| `SpicedAnime Fulfillment Web App` | Document defines app-level behavior, screens, or API endpoints. |
| `Artwork Library` | Document defines artwork file paths, naming, or lookup behavior. |
| `Production Batch Engine` | Document defines batch creation, locking, printing, or component routing behavior. |
| `PPTX Generation Engine` | Document defines PPTX layout, transformation, or generation behavior. |
| `Packing Sheet Exporter` | Document defines packing sheet columns, scope, or export behavior. |
| `Cloud File Storage` | Document defines Google Drive folder structure, file naming, or credential usage. |

**Example:**

```yaml
primary_systems:
  - Production Batch Engine
  - PPTX Generation Engine
```

---

## 8. database_dependencies

**Format:** YAML array (bulleted list).

**Rule:** List only the database tables that the code generated from this specification must directly read from, write to, or modify. Do not include tables that are only referenced in passing. If this is a Source of Truth document, list the tables that are seeded from or validated against this document.

**Available values (select only those that apply):**

| Table | When to include |
| :--- | :--- |
| `orders` | Document defines order-level fields, statuses, or lifecycle transitions. |
| `order_items` | Document defines line-item parsing, quantity handling, or item-level validation. |
| `offer_skus` | Document defines the canonical Shopify SKU dictionary. |
| `sku_aliases` | Document defines legacy SKU to canonical SKU mapping. |
| `designs` | Document defines design codes, design IDs, or design library behavior. |
| `artwork_assets` | Document defines artwork file records, statuses, or path resolution. |
| `product_families` | Document defines the 13-family dictionary and production behavior flags. |
| `production_components` | Document defines component generation, status, or batch assignment. |
| `production_batches` | Document defines batch creation, locking, or lifecycle. |
| `batch_items` | Document defines the many-to-many join between batches and components. |
| `configuration_components` | Document defines the family + config to component code mapping. |
| `print_templates` | Document defines per-product image transformation or layout parameters. |
| `packing_exports` | Document defines packing sheet generation or export records. |
| `generated_files` | Document defines generated PPTX, XLSX, or other output file records. |
| `audit_events` | Document defines actions that must be written to the audit log. |

**Example:**

```yaml
database_dependencies:
  - offer_skus
  - sku_aliases
  - designs
  - product_families
  - configuration_components
```

---

## 9. core_lifecycle_states

**Format:** YAML array (bulleted list).

**Rule:** List only the lifecycle state values that the rules in this document define, transition, or evaluate. Do not include states that are only mentioned in passing. Exact string values must be used; do not paraphrase.

**Available values by state machine:**

**Order states:**

| Value | State Machine |
| :--- | :--- |
| `Queued for Production` | Order |
| `In Production` | Order |
| `Being Packaged` | Order |
| `Shipped` | Order |

**Batch states:**

| Value | State Machine |
| :--- | :--- |
| `Open` | Production Batch |
| `Locked for Review` | Production Batch |
| `Printed` | Production Batch |
| `Archived` | Production Batch |

**Component states:**

| Value | State Machine |
| :--- | :--- |
| `Queued` | Production Component |
| `Ready` | Production Component |
| `Blocked` | Production Component |
| `Printed` | Production Component |
| `Reprint Needed` | Production Component |
| `Deferred MVP` | Production Component |

**Artwork states:**

| Value | State Machine |
| :--- | :--- |
| `Available` | Artwork Asset |
| `Missing` | Artwork Asset |
| `Retired` | Artwork Asset |

**Example (for a batch lifecycle document):**

```yaml
core_lifecycle_states:
  - Open
  - Locked for Review
  - Printed
  - Archived
```

---

## Complete YAML Header Example

The following is a correctly completed header for `SKU_and_Internal_ID_Guide.md`:

```yaml
---
title: "SKU and Internal ID Guide"
version: "1.0"
status: "Pending Owner Verification"
last_verified: "2026-06-14"
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
  - sku_aliases
  - designs
  - product_families
  - configuration_components
core_lifecycle_states:
  - Deferred MVP
---
```

Note that `core_lifecycle_states` for the SKU guide includes only `Deferred MVP` because the SKU guide defines the `FAMILY_DEFERRED_MVP` validation code that triggers that component state. It does not define order or batch states; those belong in `Order_Status_and_Batch_Lifecycle_SOT.md`.

---

## Quick Checklist Before Submitting a Document

1. `title` matches the exact filename stem from the documentation tree.
2. `version` starts at `"1.0"` unless this is a revision.
3. `status` is `"Pending Owner Verification"` unless the owner has explicitly approved it.
4. `last_verified` is today's date.
5. `primary_systems` contains only systems this document actively governs.
6. `database_dependencies` contains only tables this document's rules read from or write to.
7. `core_lifecycle_states` contains only states this document defines or transitions (exact string match from the available values list above).
8. No fields have empty arrays. Omit a field entirely rather than leaving it as `field: []`.
