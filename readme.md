# spicy-design — SpicedAnime Fulfillment Design System

The design system for the **SpicedAnime Fulfillment App**: the internal, single-operator production console that turns paid Shopify orders into print-ready physical product.

This is not a marketing surface. It is a focused operator console — dense where density helps (tables, queues), calm and unambiguous where decisions are made. Dark-only, desktop-first, used for repeated daily production runs in a workshop.

---

## Sources

Everything here was ported from material the brand owner supplied. Nothing was invented from memory.

| Source | What it gave us |
|---|---|
| `frontend/` (attached local codebase, Next.js app) | **Ground truth for code.** The live `ds/` component library (`frontend/src/components/ds/`), the token CSS (`frontend/src/app/ds-tokens/`), global resets (`frontend/src/app/globals.css`), the curated Lucide icon map, the validation-label map (`frontend/src/lib/validationLabels.ts`), and all product screens (`frontend/src/components/<screen>/`). |
| `uploads/Decision_Log_and_Open_Questions.md` (v2.19, 2026-09-02) | **Ground truth for behaviour.** Approved Decisions #1–#108. Every display-label override, status tone, icon rule, column set and screen structure in this system cites its decision number. No open questions remain as of 2026-09-02. |
| `uploads/Web_App_Screen_Inventory_and_UX_Flow.md` | **Ground truth for screens.** Per-screen data, columns, actions, operator action sequences, navigation structure, layout assumptions and shared display conventions. |
| `frontend/public/assets/` | The brand mark, the loading spinner mark, and the two texture tiles. Copied verbatim into `assets/`. |
| `p117-screenshots/Frontend_Color_System.md` | The owner-verified colour reference (v1.1, 2026-09-01, authors Josh + Josiah). Copied verbatim into `guidelines/Frontend_Color_System.md`. |
| `p117-screenshots/spicedwebapp-screens/*.png` | Screenshots of the running app — used only as a cross-check; every value came from code or the specs. |
| Product brief (chat) | Domain model, intended feel, operator context. |

Where the codebase and the specs disagreed, **the specs won** — they are the approved source of truth and the codebase is mid-implementation against them.

Referenced but **not** accessible to this system (documented so a reader with access can go deeper): `docs/01_source_of_truth/`, `docs/02_app_specs/` (including `Validation_Errors_Reprints_and_Recovery_SOT.md`, `Order_Status_and_Batch_Lifecycle_SOT.md`, `SKU_and_Internal_ID_Guide.md`, `Product_Image_Transformation_Guidelines.md`), and `fulfillment/sku_parser.py`.

---

## The product in one paragraph

SpicedAnime sells handmade anime-themed printed goods (ashtrays, lighters, grinders, stash boxes, wallets, tapestries, hoodies) through Shopify. This app ingests paid orders, decodes each SKU into the physical components that must be printed, resolves each component's artwork file in Google Drive, groups components into production batches by product type, generates the print-ready PPTX an operator sends to the printer, and produces the combined packing sheet. It keeps order status honest against Shopify via reconciliation webhooks. One operator. One login. Desktop.

**Domain vocabulary the UI speaks:** Order → Line item → **Production component** (one printable unit) → **Production batch** (one Open batch per production group at a time) → **Generated output** (PPTX + packing sheet XLSX). Product families are *produced* (ASH, LIT, TIN, BOX, WAL, GRS), *non-produced* (tapestry, hoodie, pillow cover, tote — packing sheet only), or *deferred* (`GRD` standalone grinder).

---

## CONTENT FUNDAMENTALS

**Voice: a machine reporting to its operator.** Terse, literal, present-tense. It never sells, never apologises, never celebrates. The operator already knows the domain — copy names things, it does not explain them.

### Casing is load-bearing

Casing carries hierarchy in this UI more than size does.

| Element | Casing | Example |
|---|---|---|
| Page title | ALL CAPS, `+0.04em` tracking | `NEEDS ATTENTION` |
| Section title (`h2`) | ALL CAPS, `+0.06em` | `ACTIVE BATCHES`, `BLOCKED COMPONENTS` |
| Eyebrow above a title | ALL CAPS, mono, spice-coloured, `+0.08em` | `Production`, `Exceptions`, `SKU recovery`, `Deferred MVP`, `Integration` |
| Button label | ALL CAPS, `+0.1em` | `GENERATE PPTX`, `MARK PRINTED`, `LOCK BATCH` |
| Status badge | ALL CAPS, `+0.07em` | `IN PRODUCTION`, `LOCKED FOR REVIEW` |
| Table column header | ALL CAPS, small, tracked | `Order Date`, `Design`, `Config` |
| Nav item | ALL CAPS, `+0.06em` | `CURRENT BATCHES` |
| Body / cell text | Sentence case | `Product family held for Deferred MVP.` |
| Empty-state title | ALL CAPS | `NO BLOCKED COMPONENTS`, `NO OPEN BATCHES` |

Canonical lifecycle strings are the exception: they are stored and written in **Title Case** (`Queued for Production`, `Locked for Review`, `Deferred MVP`, `Fulfilled Externally`) and only *rendered* uppercase by the badge. Never re-word a status string — the string is a contract with the backend.

### Display-label overrides

Three places rename a status **for the operator only**. The stored enum, every query, every filter and every audit record keep the raw value, and the Status Guide always lists the raw vocabulary. Route these through `StatusBadge`'s `context` prop rather than hand-writing labels:

| Stored value | Reads as | Where — and only there | Decision |
|---|---|---|---|
| `Locked for Review` | PPT Generated | Current Batches cards. Batch Detail, Dashboard and all Status Guides keep the raw string. | #44 |
| `Canceled` (component) | Print Not Needed | Component lists on Order Detail and Batch Detail. An order-level `Canceled` still reads "Canceled". | #64 |
| `Open` (reprint) | Awaiting batch | A reprint replacement not yet assigned to a batch. `Open` is reserved for batch status. | #88 |

Two more label rules: the Needs Attention queue reads **Missing SKU** while the stored validation code stays `NO_SKU` (#88), and validation failure codes render as plain-language descriptions with the raw code kept as secondary detail (#88c) — `MISSING_ARTWORK` shows as "Missing artwork" above a muted `MISSING_ARTWORK`. The label table is owned by `Validation_Errors_Reprints_and_Recovery_SOT.md`; the kit transcribes it in `ui_kits/fulfillment-app/shared.jsx`. There is no status called "Ready for Packing" — it was removed from all copy (#88d).

### Person

Mostly **impersonal**. The subject is the work, not the operator: "3 items blocked", "Batch locked for review". Second person appears only when a consequence lands on the operator's own action: *"Your batch is unchanged."*, *"Locked batches can't accept new items until unlocked."* First person is never used. There is no "we".

### Sentence shape

- **Object first, verb second, no articles** in labels and headers: `Missing artwork`, `Oldest age`, `Printed in batch`, `Delivery ID`.
- **Errors state the fact and then the blast radius**, in that order, without apology:
  `PPTX generation failed` / *"The print service timed out. Your batch is unchanged."*
- **Empty states name the absence, then say what makes it fill:**
  `NO OPEN BATCHES` / *"Production groups appear here once orders are assigned to open batches."*
- **Confirmations ask a direct question and name the consequence:**
  `Lock batch for review?` / *"Locked batches can't accept new items until unlocked."*
- **Deferred features are stated as planned, not broken:** *"Selecting multiple batches for a single reprint run is planned for a later release."*
- One or two sentences. Never three.

### Buttons are verb + object

`GENERATE PPTX`, `MARK PRINTED`, `LOCK BATCH`, `APPROVE ALL APPROVABLE PENDING`, `REFRESH MISSING SKU QUEUE`, `NEXT MISSING SKU`. Never bare `OK`, `Submit`, `Yes`. `CANCEL` is the one allowed bare verb, always as a `ghost` button.

One button label is **contextual**: Batch Detail's primary action reads `GENERATE PPTX (ALL ITEMS)` with no proper subset selected and `GENERATE PPTX (SELECTED ITEMS)` once one is, because the two run different branches (#101). Selecting every eligible component canonicalizes back to the all-items branch.

### Numbers, IDs and time

Anything countable, comparable, or copy-pasteable is **JetBrains Mono**: order numbers (`#1007`), batch sequences (`#2`), SKUs (`LIT-DESNAM-SIL-TOR-LITTIN`), family/design/config codes, quantities, counts, delivery IDs, failure codes, timestamps. Prose is never mono; mono is never prose.

Ratios are written `96/142 ready`. Ages are written `7D` (aging flag) or `3d` (below threshold). Relative time is used for recency (`4h ago`), absolute for the record (`2026-07-22 00:00`). A value that genuinely could not be loaded renders `—`, never a fabricated `0` — and a real zero renders `0` in muted text, not as a success state.

### Emoji, exclamation marks, ad hoc glyphs

**Never.** No emoji anywhere. No exclamation marks. Decision #85 explicitly retired the ad hoc glyphs that had crept in — an exclamation mark on Danger badges, a roman numeral on deferred items, square and circle-slash Neutral variants. Meaning comes from the tone icon + the text label, nothing else.

### The one place the brand gets loud

Product and design names are the only anime-flavoured copy in the app, and they arrive from Shopify verbatim: `One Piece Tapestries`, `ASHGRD-NARUTO-01-FULL`. The system never editorialises them. The punk energy lives in the *typography, texture and the spice accent* — not in the words.

---

## VISUAL FOUNDATIONS

**Anime punk, run through a production console.** Warm near-black, cream text, one vermilion accent used like a stencil spray, halftone and hatch textures borrowed from print, uppercase tracked grotesque, tight corners. It should read as *printed matter operating a printer* — not as generic dark-mode SaaS.

### Colour

Full reference: `guidelines/Frontend_Color_System.md`. In brief:

- **Surfaces** step up a warm charcoal ramp: `--surface-app #0E0F12` → `--surface-rail #131418` → `--surface-panel #17191D` → `--surface-card #1C1E23` → `--surface-raised #23262C` → `--surface-control #2B2E35`. Elevation is a ramp step **plus a hairline**, never a heavy shadow.
- **Text** is warm off-white, never neutral grey: `--text-hi #F4F2EC` → `--text-mid #A9ADB5` → `--text-low #71757D` → `--text-faint #4A4E55`.
- **One accent — Spice** (`--spice-500 #FF4D2E`, link/active `--spice-400 #FF6B4F`). It means *action, link, focus, active nav*, and nothing else. **Never** a status.
- **Six status tones**, each locked to exactly one icon: Info `#6FA0F5` · Progress `#E0A62E` · Success `#4CBF74` · Warning `#F0803C` · Danger `#F27351` · Neutral `#9AA0BE`. Each has a `-bg` at `0.13` alpha and a `-line` at `0.42` alpha. **Status colour is used for nothing but status.**
- **One grouping accent — Pair violet** (`--group-pair #D4ADF4`, rule `--group-pair-line #AD7BDB`), used solely for front/back component pairs. Also not a status.
- **Two identifier hues — SKU segments** (`--seg-design #5FB3B3` teal, `--seg-option #C0A97C` sand). These back the **unadopted** `tone="role"` chip variant only; the shipped chip treatment is the tonal ladder, which spends no hue. A SKU is an identifier, not a state, so segment chips may never borrow a status tone or the accent. See *SKU chip colour* below.

Colour never carries meaning alone: every status is colour **+ icon + text label**, and every screen exposes a "Status Guide" legend for the states it can render.

### Type

**Archivo** for everything UI — general text, labels, and uppercase headers. **JetBrains Mono** for operational/data text: SKUs, batch IDs, counts, timestamps. Both confirmed by the brand owner (2026-09-04) as the intended faces, not substitutes.

Sizes: `--fs-display 40` · `--fs-h1 26` · `--fs-h2 20` · `--fs-h3 16` · `--fs-body 14` · `--fs-sm 13` · `--fs-xs 12` · `--fs-label 11` · `--fs-metric 38`. Weights run to `900`; page titles are `800`, buttons and labels `700`.

The signature move is **tracking, inverted by scale**: display type tightens (`--ls-display -0.02em`) while small type opens up (`--ls-label 0.14em`, `--ls-label-wide 0.2em`). A 10px uppercase eyebrow at `0.14em` next to a 36px mono metric is the house look.

### Spacing & layout

4px grid, `--space-1` (4) → `--space-20` (80). Frame: `--sidebar-w 248px` (collapsed `64px`), `--topbar-h 64px`, `--content-max 1440px`, `--content-pad 32px`, `--card-pad 24px`, `--card-gap 20px`.

Fixed elements: the sidebar rail and top bar are fixed, the content column scrolls. Large tables get **sticky headers** and virtualised rows; selection survives sort and filter. Bounded panels (Recent Activity, Needs Attention preview) cap their scroll area with the heading and "View all" pinned *outside* it. Body has a `min-width: 1280px` — this app does not pretend to be responsive.

### Corners, borders, cards

Corners are deliberately tight to avoid the soft-SaaS look: `--radius-xs 2` · `--radius-sm 3` · `--radius-md 5` (the default for controls *and* cards) · `--radius-lg 8` · `--radius-pill 999` (reserved for count bubbles only).

Borders are raw low-opacity white, an edge rather than a drawn line: `--line rgba(255,255,255,.08)`, `--line-soft .05`, `--line-strong .16`, plus `--line-spice`. Widths: `--border-hair 1px`, `--border-raw 1.5px`.

**A card is:** `--surface-card` fill, 1px `--line` border, `--radius-md`, `--shadow-card`, 24px padding. Optional `accent` adds a 3px spice rule (top on `Card`, left on `MetricCard`) for the one hero element in a view. A panel with a header uses `--ink-850` for the header strip and a 1px divider. Hovering an interactive card lifts the border to `--line-strong` — it does not change fill or scale.

**Cards are not a list layout here.** Current Batches renders each production group as a **table**, not a card grid — the operator is comparing rows. `BatchCard` remains an approved treatment in the system (and is worth reaching for on a future summary or mobile surface) but it is not what the batches screen ships.

### SKU chip colour

A canonical SKU renders through `SegmentedSku` as adjacent per-segment chips: `<FAMILY>-<DESIGN>-<OPTION…>-<CONFIG>`. Chips are **never** parsed from the string — callers pass the backend parser's fields. `tone` sets the colour treatment:

- **`value` — the default, approved 2026-09-04.** Tonal ladder, family strongest → config faintest. Spends no hue at all, so it is safe everywhere: beside a status badge, inside dense tables, anywhere the six status tones and pair violet are already in play.
- **`none`** — uniform grey. The previous treatment; reach for it only when a surface must stay entirely neutral.
- **`role`** — adds `--seg-design` teal and `--seg-option` sand. **Not adopted**, kept for a future surface that needs faster scanning than the tonal ladder gives.

All three sit side by side, in isolation and inside a status-bearing table row, on the *SKU chip colour* card under **Exploration**.

### Shadows

Structural and low, since a dark UI reads elevation from the ramp: `--shadow-sm 0 1px 2px rgba(0,0,0,.4)`; `--shadow-card` pairs a `1px inset` white highlight at `.03` with `0 6px 18px rgba(0,0,0,.38)`; `--shadow-pop` is the modal version (`0 18px 48px rgba(0,0,0,.55)`); `--shadow-spice` is a spice ring + glow, used sparingly. There is no elevation-1-to-5 ladder.

### Motion

**Fast and mechanical — a production tool, not a toy.** `--dur-fast 110ms` · `--dur-base 170ms` · `--dur-slow 240ms`, on `--ease-out cubic-bezier(.2,.7,.3,1)` or `--ease-standard cubic-bezier(.4,0,.2,1)`. Only three keyframes exist: `sa-spin` (loaders, the rotating logo mark), `sa-pulse`, `sa-shimmer` (skeleton rows). No bounce, no spring, no page transitions, no entrance animation. `prefers-reduced-motion` kills the spinning logo.

### Interaction states

- **Hover:** background steps *up* the ramp (`transparent → --surface-hover`, `--surface-control → --ink-600`), or the border firms to `--line-strong`. Spice buttons darken to `--spice-600`. Opacity is never used for hover.
- **Press:** darker again (`--spice-700`, `--ink-650`) plus `transform: translateY(1px)` — a physical key-press, no scale.
- **Focus:** `--ring` = a 2px app-coloured gap then a 4px `rgba(255,77,46,.55)` halo. Always spice, always visible.
- **Active/selected:** `--spice-tint` fill plus, for nav, a 3px spice rule on the left edge.
- **Disabled:** `--ink-700` fill, `--text-faint` label, `--line` border, `not-allowed` cursor. Loading drops to `0.7` opacity and swaps the icon for a spinner.

### Texture, transparency and blur

Two real PNG tiles do the original punk work: `--tex-halftone` (`assets/halftone-tile.png`) on empty-state medallions, and `--tex-hatch` (`assets/hatch-tile.png`) on deferred/held panels.

**Diagonal stripes** extend that vocabulary as pure CSS repeating gradients — no asset request, and they tint and layer freely. Every stripe token shares one **135° axis** (`--stripe-angle`); mixing angles reads as an accident, so the axis is never overridden.

**Approved placements (2026-09-04): panel headers and empty states.**

> **The legibility rule.** Stripes may never sit behind small text or text that is not bold. They are cleared to sit behind bold uppercase type — panel-header titles, eyebrows, empty-state headings — or behind nothing at all. Never behind table data, body copy, muted captions, or metric sub-labels: the stripe edge competes with light letterforms at small sizes. On a striped panel header the stripes stop at the header; the rows below sit on flat surface.

| Token | Where it belongs |
|---|---|
| `--tex-stripe-medium` (2px / 10px, 5% white) | **Panel headers — the default.** Section strips, rails |
| `--tex-stripe-wide` (6px / 18px, 4%) | **Empty states** and their icon medallions |
| `--tex-stripe-hazard` (8px / 16px, 5.5%) | The loudest fill — reads as "parked". **No approved placement yet:** every held panel in the product carries body copy, which the rule disallows. Text-free areas only |
| `--tex-stripe-fine` (1px / 6px, 3.5%) | Large areas carrying **no text** |
| `--tex-stripe-triple` (3 strokes, then a 76px gap) | The three-stripe **band motif** — a mark, not a fill. *Proposal, not adopted* |
| `--tex-stripe-spice` (spice-tinted, 13%) | Decorative emphasis only. Never on a status surface, never dense enough to read as Danger or Warning |

`--tex-stripe-triple` is a mark, not a texture — one per region, clipped to a leading block or masked so it decays into the surface, never tiled edge to edge.

**The dot tiles stay in play, and they own the held panel.** `--tex-halftone` and `--tex-hatch` remain fully supported. `EmptyState` layers `wide` stripes *over* halftone (`var(--tex-stripe-wide), var(--tex-halftone)`) since its only type is bold and uppercase. `DeferredPanel` keeps **hatch alone** — its 13px non-bold body copy is exactly what the legibility rule protects, so stripes are disallowed there. That split is the model: stripes where type is bold or absent, dots where prose lives.

Textures layer via a comma-separated `background-image`, stripes listed first so they sit above the dot tile. Two layers is the ceiling; three reads as noise. Whichever tile is used, texture is **strategic** — it marks a region as a header, an absence, or a hold, and never becomes wallpaper.

> **Use the classes, not the tokens, for the two PNG tiles.** `tokens/base.css` ships `.tex-halftone`, `.tex-hatch`, `.tex-stripes-halftone` and `.tex-stripes-hatch`. A relative `url()` inside a *custom property* is resolved against the **using document**, not the stylesheet that declared it, so `background-image: var(--tex-halftone)` silently 404s on any page below the project root. Inside a normal rule the URL resolves against the stylesheet, so the classes work at any depth. The stripe tokens are exempt — repeating gradients contain no `url()`.

Transparency is structural, not decorative: borders, status tints and stripe alpha are the only routine uses. **Blur appears in exactly one place** — the modal scrim behind `ConfirmModal`. There are no glass panels, no gradient washes, no full-bleed hero imagery. The only true gradient (outside the stripe engine) is the skeleton shimmer sweep.

### Imagery

The only real imagery is **artwork thumbnails** in the Artwork Library — customer-facing anime print art, high-saturation and warm, rendered inside a hairline card on the charcoal base with no filter or overlay. The app adds no photography, no illustration, no stock. Where a picture is missing, the placeholder is an `image` icon on `--surface-raised`, never a broken frame.

---

## ICONOGRAPHY

**One system: Lucide** (ISC-licensed), stroke style, 24×24 viewBox, `stroke-width: 2` (`2.25` inside status badges), round caps and joins, `currentColor`.

They are **not** loaded from a CDN and they are **not** loose SVG files. The set is curated: the exact Lucide inner-SVG paths for ~45 icons are inlined in the `PATHS` map inside `components/core/Icon.jsx`, exported as `ICON_NAMES`, and rendered through the `<Icon>` component. To add an icon, paste its Lucide inner SVG into that map — never render a raw `<svg>` in a screen, never use emoji, never use a Unicode character as a glyph.

**One icon per status tone (Decision #85)** — the icon is chosen by the tone, not the individual status, so a new status inherits its tone's icon automatically:

| Tone | Icon | Covers |
|---|---|---|
| Info | `circle` | Open, Queued, Queued for Production, Pending |
| Progress | `circle-dashed` | In Production, Being Packaged |
| Success | `circle-check` | Printed, Ready, Available, Shipped, Fulfilled Externally |
| Warning | `triangle-alert` | Locked for Review, Reprint Needed, In Production (Needs Reprint) |
| Danger | `octagon-x` | Blocked, Missing, Failed |
| Neutral | `minus` | Canceled, Archived, Retired, Deferred MVP |

The single documented exception is **`clock`**, used by the aging flag — it marks elapsed time, not a lifecycle state.

Navigation icons are fixed per route: `layout-dashboard` Dashboard · `layers` Current Batches · `triangle-alert` Needs Attention · `shopping-cart` Orders · `image` Artwork Library · `tag` SKU Manager · `boxes` Packing Queue · `scroll-text` Audit Log · `settings` Settings. Action icons: `file-output` generate PPTX · `printer` mark printed · `lock` lock batch · `download` export · `refresh-cw` retry/sync · `search` · `filter` · `plus` · `x` · `copy` · `more-horizontal` · `chevron-down` / `chevron-right` / `chevrons-up-down` for sort and disclosure.

### Brand assets (`assets/`)

| File | What it is |
|---|---|
| `spicedanime-icon.png` | The circular `SPICED ★ ANIME` mark, cream on transparent. Sidebar header (30px), thumbnail, anywhere a logo goes. |
| `spicedanime-icon-dark.png` | Dark variant for light backgrounds. |
| `spicedanime-logo-spinner.png` | The mark used as the rotating loading indicator (`.sa-loading-logo`). |
| `halftone-tile.png` | Repeating halftone print texture — empty-state medallions. |
| `hatch-tile.png` | Repeating hatch texture — deferred / held panels. |

There is **no wordmark file** in the supplied sources. Where a wordmark is needed, the app sets the name in type: `SPICED` at 14px/900/`0.18em` over `FULFILLMENT` at 8px/700/`0.28em`, both uppercase. No logo was drawn or reconstructed for this system.

---

## Index

### Root
- `styles.css` — the single entry point consumers link. `@import` lines only.
- `readme.md` — this file.
- `SKILL.md` — Agent Skills front-matter wrapper.
- `thumbnail.html` — homepage tile.

### `tokens/`
`fonts.css` (webfont loading) · `colors.css` (surfaces, text, spice, six status tones, pair accent) · `typography.css` (families, weights, sizes, line-heights, tracking) · `spacing.css` (4px grid + layout frame) · `effects.css` (radii, borders, shadows, focus ring, motion, texture + diagonal-stripe engine, SKU segment hues) · `base.css` (resets, scrollbars, keyframes, Status Guide disclosure, **texture utility classes**).

### `guidelines/`
`Frontend_Color_System.md` — the owner-verified colour reference, verbatim, including superseded palettes kept for provenance.
Foundation specimen cards live in `guidelines/cards/` and render in the **Design System** tab under *Colors*, *Type*, *Spacing*, *Effects*, *Brand*, and *Exploration*.

**Exploration** holds proposals awaiting a decision rather than settled rules — currently the three-stripe band motif, layered textures, and the SKU chip colour comparison. Everything in that group is a candidate; nothing in it is binding until picked. Settled stripe rules live under *Effects*.

### `components/`

**`core/`** — `Badge` · `Button` · `Card` · `Checkbox` · `Icon` · `IconButton` · `Input` · `SegmentedFilter` · `Select` · `StatusBadge`

`SegmentedFilter` (added 2026-09-13) draws the filter/action line explicitly: it is one joined, hairline-divided group with an inset-spice-ring + check on the active option — never a standalone bordered box — so an exclusive-choice filter (SKU status, date range) can't be mistaken for a `Button` at a glance, independent of size. `FilterBar`'s `filters` prop now composes it directly; a bare pill filter is retired. `FilterBar` also grew `onClear`, a muted icon+label control (no border, brightens on hover) for "reset all filters," kept distinct from `Button`'s `ghost` variant, which stays for standalone actions like `CANCEL`. Alongside this, `Button`'s `secondary` and `outline` variants were lightened — both go transparent at rest and fill in only on hover — so the button ladder reads primary (filled) → secondary (hairline border) → outline (faint border) → ghost (no border) instead of secondary presenting as an always-filled gray box.

**`data/`** — `BatchCard` · `DataTable` · `FilterBar` · `MetricCard` · `PairBracket` · `SegmentedSku`

Three props were added to existing components so the spec could be met without inventing new families — `StatusBadge.context` (display-label overrides, #44/#64/#88), `DataTable.selectableRowKeys` (header checkbox covers only rows eligible for the bulk action, #105), and `BatchCard.statusContext` + `BatchCard.aging` (#44, #87). No component family was added.

**`feedback/`** — `AgingFlag` · `ConfirmModal` · `DeferredPanel` · `EmptyState` · `ErrorAlert` · `LoadingState`

**`navigation/`** — `AppShell` · `Sidebar` · `TopBar`

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (what it is, when to use it, a usage example). Every directory has one `@dsCard` HTML showing its variants and states.

This inventory is exactly the inventory `frontend/src/components/ds/` defines — 24 components, no additions. There are no `Tabs`, `Toast`, `Tooltip`, `Avatar`, `Switch`, or `Radio` primitives because the product does not have them.

### `ui_kits/fulfillment-app/`
High-fidelity click-through recreation of the operator console, built against the Screen Inventory and Decision Log: `index.html` plus `shared.jsx`, `Dashboard.jsx`, `Orders.jsx`, `OrderDetail.jsx`, `BatchDetail.jsx` (Current Batches + Batch Detail), `NeedsAttention.jsx`, `ArtworkLibrary.jsx`, `EventPrints.jsx`, `Sandbox.jsx`. One product, one surface — the app is the whole product. See `ui_kits/fulfillment-app/README.md`.

### Recurring patterns the system standardises

| Pattern | Rule | Decision |
|---|---|---|
| Status badge | Six tones, one fixed icon each, always colour + icon + label | #74, #85 |
| Status Guide | Collapsed disclosure per screen, raw vocabulary only; screens with no finite vocabulary have none | #107 |
| Aging flag | `{n}D` + `clock` in Warning tone at 4+ calendar days; never a status, never in a filter | #75, #87 |
| Pair grouping | Violet bracket + `PAIR` on LITF/LITB and WALF/WALB; not a status, never replaces a badge | #86 |
| Counted queue switcher | Needs Attention: one switcher, only the selected queue in the workspace | #97 |
| Bounded panels | Recent Activity caps at 25, Needs Attention preview at 30; heading + `View all` outside the scroll region | #95 |
| Large tables | Sticky header, virtualised rows, selection independent of sort/filter/virtualisation | #101 |
| Bulk workflows | Select many → generate proposals → one-page review → approve/reject → bulk reimport | #104 |
| Per page | 20/50/100, default 50, resets to page 1 | #63, #79 |
| Native links | Navigation uses real `<a>`; actions stay buttons; row whitespace never navigates | #108 |
| Sandbox exclusion | `is_sandbox` rows invisible on Dashboard, Orders, Current Batches and packing selection | #47, #58 |

---

## Caveats

- **Fonts are self-hosted.** Archivo (400–900 + italic) and JetBrains Mono (400/500/700) ship as `.woff2` binaries in `assets/fonts/` with `@font-face` rules in `tokens/fonts.css`; the compiler reports both families and nothing reaches a third-party CDN at runtime. Both are OFL-licensed.
- **The three-stripe band motif is still a proposal** — built and comparable under *Exploration*, not adopted. Same for the layered dot-plus-stripe combinations.
- **The two SKU segment hues are my choice, not yours.** Teal and sand back the unadopted `role` variant; if the brand has real secondary colours they should replace these.
- **No wordmark asset exists** in the sources; the name is set in type wherever a wordmark would go.
- **Order Detail's data is synthetic.** The four-tab screen (Production / Order items / Files and reprints / History) is built to Decisions #91, #98, #102 and #103 and transcribed from `OrderDetailScreen.tsx`, but #102 and #103 are *Approved Pending Implementation* — no wire format exists yet for source-artwork thumbnails or the aggregated timeline. Artwork thumbnails are placeholders, Drive links are inert, and the history payload is invented in the documented shape.
- **SKU Manager and Audit Log** are stated as not recreated in the kit rather than approximated.
- `Frontend_Color_System.md` is marked *Pending Owner Verification* at v1.1. The `shared-source` variant of `PairBracket` has no dedicated colour token and currently reuses non-status tokens pending owner direction.
- Backend-owned strings (canonical statuses, family/design/config codes, failure codes) are reproduced from the specs and the frontend; the authoritative definitions live in `docs/01_source_of_truth/` and `docs/02_app_specs/`, which were not attached.
