---
title: "Order Status and Batch Lifecycle SOT"
version: "1.7"
status: "Pending Owner Verification"
last_verified: "2026-09-05"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
  - Production Batch Engine
  - Artwork Library
database_dependencies:
  - orders
  - production_batches
  - production_components
  - artwork_assets
  - webhook_receipts
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
  - Deferred MVP
  - Canceled
  - Available
  - Missing
  - Retired
---

# Order Status and Batch Lifecycle SOT

## Order Lifecycle

| Status | Meaning | Terminal? |
| :--- | :--- | :---: |
| `Queued for Production` | Paid and unfulfilled Shopify order received; produced components not yet printed. | No |
| `In Production` | All required produced components for this order have been printed. | No |
| `In Production (Needs Reprint)` | At least one component in this order has been flagged `Reprint Needed`. Set whenever a reprint flag is applied to an `In Production` order; cleared back to `In Production` when the flagged component(s) reach `Printed` (Decision #71). | No |
| `Being Packaged` | Shipping label generated. Not reachable in MVP; Phase 3 feature. | No |
| `Shipped` | Carrier first acceptance scan. Not reachable in MVP; Phase 3 feature. | Yes |
| `Fulfilled Externally` | Order was marked fulfilled directly in Shopify, outside the app (Decision #42). | Yes |
| `Canceled` | Order was cancelled or refunded in Shopify (Decision #42). | Yes |

Mixed-order promotion rule: an order transitions from `Queued for Production` to `In Production` only when all required produced components for that order are `Printed`.

Reprint status rule (Decision #71): flagging one or more components for reprint on an `In Production` order transitions that order to `In Production (Needs Reprint)`. This never moves the order back to `Queued for Production`; the reprint status is additive to `In Production`, not a regression of it. When every component flagged `Reprint Needed` on that order reaches `Printed`, the order returns to plain `In Production`. An order already in `Queued for Production` is unaffected by a reprint flag (this case does not arise in MVP, since reprint only applies to already-`Printed` components).

`Being Packaged` and `Shipped` are declared for schema completeness (Phase 3) but no code path writes them in MVP. They do not appear in any operator-facing status filter, badge, or dashboard tile; the app enforces this via an explicit `MVP_VISIBLE_ORDER_STATUSES` allowlist rather than by omission, and Orders-list queries filter to that allowlist defensively so a manually inserted row in a dormant status cannot surface.

| Order Contents | After Lighter Batch Printed | After Grinder/Jar/Tray Batch Printed |
| :--- | :--- | :--- |
| Lighter only | `In Production` | (no change) |
| Lighter + Grinder Set | `Queued for Production` | `In Production` |
| Hoodie only | `Queued for Production` (no produced components) | (no change) |
| Lighter + Hoodie | `In Production` (only produced component is the lighter) | (no change) |

## Batch Lifecycle

| Status | Meaning |
| :--- | :--- |
| `Open` | Active batch accepting new components. One per production group at any time. |
| `Locked for Review` | PPTX generated; no new components accepted. |
| `Printed` | Operator confirmed physical print completed. |
| `Archived` | Historical record; read-only. |

Batch lock behavior has two forms, both preserving exactly one `Open` batch per production group at all times:

- **Full generation (no item selection).** When the operator clicks Generate PPTX with no items selected, the batch transitions from `Open` to `Locked for Review`, and a new `Open` batch is created for the same production group simultaneously. Unchanged from original behavior.
- **Selective generation (item selection).** When the operator selects a proper subset of the batch's `Ready` components and clicks Generate PPTX, a new batch is created with status `Locked for Review` for the same production group, holding only the selected components (with front/back pairs such as LITF/LITB and WALF/WALB automatically expanded to include both halves). The original batch remains `Open` and retains the unselected components; no second `Open` batch is created. Selecting every eligible component in a batch is equivalent to selecting none; the full-generation branch runs instead — **except when the Global Filter is active and the batch contains hidden eligible components outside the filtered range (Decision #110)**: in that case, selecting every visible filtered component remains subset generation and the hidden components stay untouched in the original `Open` batch. When Global Filter is active and hidden eligible components exist, generating with no individual component selection also means generate all eligible components in the visible filtered set, not the entire underlying batch. This executes as subset generation and leaves all hidden components untouched in the original `Open` batch. If selective PPTX generation fails, the subset's components are merged back into the group's `Open` batch and the failed batch record is deleted, preserving the one-`Open`-batch invariant.

**Sandbox batch exemption (Decision #47).** Batches where `is_sandbox = true` are exempt from both lock-behavior forms above. Clicking Generate PPTX on a sandbox batch does not transition the batch to `Locked for Review` and does not create a new `Open` batch; the sandbox batch remains `Open` and can be regenerated an unlimited number of times. This exemption applies only to batches created by the sandbox mechanism and never to real production batches.

## Component Lifecycle

| Status | Meaning |
| :--- | :--- |
| `Queued` | Generated from order item; not yet assigned to an Open batch. |
| `Ready` | Assigned to an Open batch and validated. |
| `Blocked` | Validation failed (missing artwork, missing template, etc.). Routed to Needs Attention. |
| `Printed` | Containing batch reached `Printed` status. |
| `Reprint Needed` | Operator flagged the component for reprint. |
| `Deferred MVP` | Component belongs to `GRD` family; held in Deferred Items queue. |
| `Canceled` | Component was pulled from its `Open` batch because the parent order was cancelled or refunded in Shopify, or because the parent order was fulfilled externally (Decision #42). |

Deferred state rule: a component in the `GRD` family transitions to `Deferred MVP` and is not assigned to any batch.

Component pull-out rule: when a parent order transitions to `Canceled` or to `Fulfilled Externally`, every component in that order with status `Queued` or `Ready` is removed from its `Open` batch and transitions to `Canceled`. Components already `Printed`, `Blocked`, `Reprint Needed`, or `Deferred MVP` are left untouched. Components sitting in a `Locked for Review`, `Printed`, or `Archived` batch are past the pull-out window.

## Artwork Lifecycle

| Status | Meaning |
| :--- | :--- |
| `Available` | File exists at expected Google Drive path. |
| `Missing` | Expected path is empty. Triggers `MISSING_ARTWORK` validation failure. |
| `Retired` | Asset is marked inactive; no new components reference it. |

## State Machine Diagram (text or visual)

Order lifecycle:

```text
Queued for Production -> In Production -> Being Packaged -> Shipped
                      \                \
                       \                +-> Fulfilled Externally
                        \                \
                         \                +-> In Production (Needs Reprint) -> In Production
                         +-> Canceled (from Queued for Production or In Production)
```

`Being Packaged` and `Shipped` are Phase 3 states, declared but unreachable in MVP.

Batch lifecycle:

```text
Open -> Locked for Review -> Printed -> Archived
```

A proper subset selected for PPTX generation splits into its own `Locked for Review` batch while the originating `Open` batch continues unchanged, per the Batch Lifecycle section above.

Component lifecycle:

```text
Queued -> Ready -> Printed
Queued -> Blocked
Ready -> Reprint Needed
Queued -> Deferred MVP
Queued -> Canceled
Ready -> Canceled
```

Artwork lifecycle:

```text
Available -> Retired
Missing -> Available
```

## Cross-Entity Transition Rules

| Trigger Event                                                          | Resulting Transitions                                                                                                                     |
| :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| Shopify webhook received (paid + unfulfilled)                          | New Order record created with status `Queued for Production`.                                                                             |
| Component generated for order                                          | Component status `Queued`.                                                                                                                |
| Component assigned to Open batch and validated                         | Component status `Ready`.                                                                                                                 |
| Component validation fails                                             | Component status `Blocked`.                                                                                                               |
| Component is in `GRD` family                                           | Component status `Deferred MVP`; not assigned to any batch.                                                                               |
| Operator clicks Generate PPTX on batch with no selection               | Batch transitions `Open` -> `Locked for Review`. New `Open` batch created for same production group.                                      |
| Operator clicks Generate PPTX on batch with a proper subset selected   | New `Locked for Review` batch created for the same production group holding only the selected (and pair-expanded) components. Originating batch remains `Open` with the remainder. No second `Open` batch created.               |
| Operator clicks Mark Printed                                           | Batch transitions `Locked for Review` -> `Printed`. All contained components transition `Ready` -> `Printed`. Order-promotion check runs. |
| Operator bulk-flags one or more order items for reprint (Orders screen or Order Detail) | Selected `Printed` component(s) transition to `Reprint Needed`; a paired front/back component (LITF/LITB, WALF/WALB) is flagged alongside its pair even if only one side was selected. A new `Queued` component is created for each and assigned to the current `Open` batch for its production group. The order transitions `In Production` -> `In Production (Needs Reprint)` (Decision #71). |
| All of an order's `Reprint Needed` components reach `Printed`                          | Order transitions `In Production (Needs Reprint)` -> `In Production` (Decision #71). |
| Order-promotion check: all produced components for order are `Printed` | Order transitions `Queued for Production` -> `In Production`.                                                                             |
| Order contains only non-produced items                                 | Order remains `Queued for Production` until shipping label is generated (Phase 3); skip print-batch wait.                                 |
| Shipping label generated (Phase 3)                                     | Order transitions `In Production` -> `Being Packaged`. Not reachable in MVP.                                                              |
| Carrier first scan (Phase 3)                                           | Order transitions `Being Packaged` -> `Shipped`. Not reachable in MVP.                                                                    |
| Batch reaches `Printed` and 30 days pass (or operator action)          | Batch transitions `Printed` -> `Archived`.                                                                                                |
| Shopify `orders/fulfilled` webhook received                            | Order in `Queued for Production` or `In Production` transitions to `Fulfilled Externally`. Components in that order with status `Queued` or `Ready` are pulled from their `Open` batch and transition to `Canceled`. Any other order state: audited no-op.          |
| Shopify `orders/cancelled` or `refunds/create` webhook received        | Order in `Queued for Production` or `In Production` transitions to `Canceled`. Components in that order with status `Queued` or `Ready` are pulled from their `Open` batch and transition to `Canceled`. Any other order state: audited no-op. |
| Shopify `orders/updated` webhook received                              | Order's shipping-address snapshot refreshed. Order status is never changed by this event.                                                 |
| `reconcile_shopify_history --apply` run by operator                    | Same transitions as the `orders/fulfilled` and `orders/cancelled`/`refunds/create` rows above, applied one time to orders that drifted before the live webhooks existed. Read-only in `--dry-run` mode. |
| `reset_locked_batches_p77 --apply` run by operator (one-time)          | Batch in `Locked for Review` (excluding `Printed`) transitions back to `Open`; `generated_file_url` cleared. Applied one time to align pre-P77 batches with the corrected image-transform specs (Decisions #48–#57). Read-only in `--dry-run` mode (Decision #59). |

## Cross-References

| Related Document                                 | Relationship                                                                           |
| :----------------------------------------------- | :------------------------------------------------------------------------------------- |
| `End_to_End_Fulfillment_Workflow_SOT.md`         | Workflow triggers these state transitions.                                             |
| `Data_Model_and_Database_Schema.md`              | Status enum values must be stored as exact string matches in DB columns.               |
| `Validation_Errors_Reprints_and_Recovery_SOT.md` | `Blocked` and `Reprint Needed` states are triggered by error conditions defined there. |
| `Shopify_Integration_and_Order_Import_Spec.md`   | Defines the webhook and historical-reconciliation triggers for `Fulfilled Externally` and `Canceled`. |
| `Decision_Log_and_Open_Questions.md`             | Decision #42 authorizes the `Fulfilled Externally`, `Canceled`, and selective-batch-generation behavior in this document. Decision #110 adds the Global Filter exception to the selective-generation canonicalization rule. |

```
```
