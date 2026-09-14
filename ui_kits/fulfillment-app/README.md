# UI Kit — SpicedAnime Fulfillment (operator console)

A click-through recreation of the internal fulfillment app, built against `Web_App_Screen_Inventory_and_UX_Flow.md` and `Decision_Log_and_Open_Questions.md` v2.19 (Decisions #1–#108). One product, one surface: the app *is* the whole product — there is no marketing site, no customer-facing view, no mobile app.

Open `index.html`. The sidebar carries the full navigation from Screen Inventory §4; every screen below is reachable from it.

| File | Screen | Route |
|---|---|---|
| `Dashboard.jsx` | Dashboard — four tiles (Open Batches, Needs Attention with hover breakdown, Queued, System Status), Active Batches table, bounded Recent Activity + Needs Attention preview | `/` |
| `Orders.jsx` | Orders — `Order #` sort cycle, multi-select status pills, date shortcuts, `Attention` column, inline reprint accordion, eligible-only header checkbox, Per page | `/orders` |
| `OrderDetail.jsx` | Order Detail — connected four-part summary with aging flag, four tabs (Production / Order items / Files and reprints / History), pair + shared-art brackets, live reprint flagging, lazily-loaded aggregated timeline | `/orders/{id}` |
| `BatchDetail.jsx` | Current Batches (`Batches`) and Batch Detail (`BatchDetail`) — grouped cards with the `All` lifecycle view; large component table with sticky header, virtualised rows, pair auto-include, colour column + pills, contextual generate action | `/batches`, `/batches/{id}` |
| `NeedsAttention.jsx` | Needs Attention — one counted queue switcher over Blocked / Missing SKU / Deferred / Webhook Failures, with the bulk SKU proposal review workspace | `/needs-attention` |
| `ArtworkLibrary.jsx` | Artwork Library — thumb column with component-code fallback, sortable Design/Updated, revalidate, Per page | `/artwork` |
| `EventPrints.jsx` | Event Prints — saved jobs, product-type browsing, page-layout preview with short-page indicator, run history | `/event-prints` |
| `Sandbox.jsx` | Sandbox — checkout across up to 7 order groups from the 14 fixed SKUs, test orders and batches, full reset | `/sandbox` |
| `index.html` | The shell plus in-file Settings and Packing Queue | `/settings`, `/packing` |
| `shared.jsx` | `ScreenSection`, `BoundedPanel`, `PageHeading`, `StatusGuide`, `QueueSwitcher`, `PerPage`, `SortHeader`, `FailureText`, the validation-label maps, and the synthetic row data |

## Spec details the kit deliberately gets right

- **Display-label overrides** are scoped, not global: `Locked for Review` reads "PPT Generated" on Current Batches cards only (#44); a component's `Canceled` reads "Print Not Needed" in component lists (#64). Status Guides always show the raw vocabulary.
- **Counts stay consistent.** The Needs Attention nav badge counts `Blocked` components only (3); the Dashboard tile shows the merged blocked + missing-SKU + deferred total (8). Webhook failures are reported separately and never enter the badge.
- **Contextual generation.** Batch Detail's primary action switches between `Generate PPTX (All Items)` and `Generate PPTX (Selected Items)`; selecting every eligible component canonicalizes back to all-items (#101).
- **Colour filtering is display-only** — it never changes selection state or the generated component set (#57), and the column/pills vanish for batches with no colour-variant components.
- **Failure codes** render as plain-language labels with the raw enum kept as muted secondary detail (#88c).
- **Selection is scoped.** Only reprint-eligible orders get a checkbox, and the header checkbox's checked/indeterminate state covers just those rows (#105).

## What is real and what is not

- **Real:** every component comes from `window.<Namespace>` — the compiled design system. No primitive is re-implemented here. Column sets, filter pill sets, section headings, button labels, operator copy and production-group names are lifted from the specs.
- **Abbreviated:** row counts. Six batches stand in for the full queue, eight orders for the order list, ten components for a 142-component batch. Copy is representative, not live.
- **Deliberately blank:** SKU Manager and Audit Log render a stated disclaimer rather than an invented design.
- **Invented in a documented shape:** Order Detail's source-artwork thumbnails and aggregated history payload. Decisions #102 and #103 are *Approved Pending Implementation* — no wire format exists yet — so thumbnails are placeholders and Drive links are inert.
- Interactions that work: navigation, order search / status pills / date shortcuts / sort cycle / reprint accordion, Order Detail tabs + reimport + component reprint flagging with pair expansion + lazy history load, batch lifecycle filters and grouping, component sort + selection with pair auto-include + colour filter, the lock / generate / preview / mark-printed modals, the Missing SKU bulk proposal review, artwork search / filter / sort / revalidate, Event Prints quantity + page preview, Sandbox checkout and reset.
