---
title: "Frontend Color System"
version: "1.2"
status: "Pending Owner Verification"
last_verified: "2026-09-07"
owner: "SpicedAnime"
authors:
  - Josh
  - Josiah
primary_systems:
  - SpicedAnime Fulfillment Web App
---

# Frontend Color System

A mid-level reference for every color the SpicedAnime Fulfillment web app uses, so new or rebuilt features reuse colors that are already here — or, if a new color is genuinely needed, add one that stays in harmony.

**The system in one paragraph:** the app is dark-only — a warm, near-black charcoal foundation, a warm off-white text ramp, one vermilion "spice" brand accent for actions and focus, and a six-tone status palette. Color that carries meaning (status) is always paired with an icon and a text label, never used alone. Every value is a CSS custom property (`--token`) in `frontend/src/app/ds-tokens/` (`colors.css`, plus `effects.css` for the focus ring and shadows); components read tokens, they don't hard-code hex.

## Surfaces (backgrounds)

A warm-neutral charcoal ramp. Elevation is carried by stepping up this ramp plus a hairline border, not by heavy shadows.

| Token | Hex | Use for |
|---|---|---|
| `--surface-app` | `#0E0F12` | Page background |
| `--surface-rail` | `#131418` | Left navigation rail |
| `--surface-panel` | `#17191D` | Panels, modals, filter bars |
| `--surface-card` | `#1C1E23` | Cards, table containers |
| `--surface-raised` / `--surface-hover` | `#23262C` | Raised cards, hovered rows |
| `--surface-control` | `#2B2E35` | Input / select backgrounds |

Underlying ramp: `--ink-1000 #0A0B0D` → `--ink-600 #34373F` (eight steps). Prefer the semantic `--surface-*` aliases above.

## Text

Warm off-white, slightly cream — never pure grey.

| Token | Hex | Use for |
|---|---|---|
| `--text-heading` (`--text-hi`) | `#F4F2EC` | Headings, primary text |
| `--text-body` (`--text-mid`) | `#A9ADB5` | Body copy, secondary text |
| `--text-meta` (`--text-low`) | `#71757D` | Timestamps, counts, captions |
| `--text-disabled` (`--text-faint`) | `#4A4E55` | Disabled, placeholder |
| `--text-on-spice` | `#120A07` | Text on a solid spice fill |

## Borders & hairlines

Raw, low-opacity white — an edge, not a drawn line.

| Token | Value | Use for |
|---|---|---|
| `--line` | `rgba(255,255,255,0.08)` | Default hairline: card edges, dividers, table rules |
| `--line-soft` | `rgba(255,255,255,0.05)` | Faintest divider |
| `--line-strong` | `rgba(255,255,255,0.16)` | Emphasised edge, hovered card |
| `--line-spice` | `rgba(255,77,46,0.55)` | Border on a spice-accented element |

## Brand accent — Spice

One vermilion red-orange. The app's only accent: primary actions, links, active navigation, selected/active tabs and filter controls, focus, and the aging indicator. It is **not** a status color.

| Token | Hex | Use for |
|---|---|---|
| `--spice-400` | `#FF6B4F` | Links, active nav text, the aging indicator |
| `--spice-500` (`--action-primary`) | `#FF4D2E` | Primary button / primary action |
| `--spice-600` (`--action-primary-hover`) | `#E63916` | Primary action hover |
| `--spice-700` (`--action-primary-press`) | `#BE2C0F` | Primary action press |
| `--spice-tint` | `rgba(255,77,46,0.12)` | Tinted background of a selected / active chip |
| `--focus-ring` | `rgba(255,77,46,0.55)` | Focus outline (see `--ring` in `effects.css` for the full halo) |

(`--spice-300 #FF8A6E` exists for subtle highlights.)

**Selected/active control convention (Decision #117).** Every selected or active interactive control in the app — the DS `Sidebar`'s active nav item, `FilterBar`'s active pill, the shared filter-control style behind Orders and the Global Filter, and Needs Attention's selected queue tab — uses this same spice-tint treatment (`--spice-tint` background with spice-accent text/border). `--text-on-spice` is reserved for text sitting on a **solid** spice fill and is not used on a spice-tint selection background.

## Status tones (Decision #74)

Six tones. The base hex is the **label color** (icon + text); each also has a matching `-bg` (background tint, `0.13` alpha) and `-line` (border, `0.42` alpha) so a badge stays in harmony with its tone. Badge labels are all-caps everywhere.

The hexes below are the P95 palette: the tones Decision #74 approved, revised twice in the same session at the owner's direction — first lifted for **WCAG AA (4.5:1)**, then re-saturated so the badges read vivid rather than pastel. The six hues keep the same relationship to one another.

| Tone | Token | Hex | Icon | Meaning |
|---|---|---|---|---|
| Info / Blue | `--tone-info` | `#6FA0F5` | `circle` | Open, Queued, Pending, reachable |
| Progress / Yellow | `--tone-progress` | `#E0A62E` | `circle-dashed` | In Production — work underway |
| Success / Green | `--tone-success` | `#4CBF74` | `circle-check` | Printed, Ready, Available, Fulfilled Externally, Connected |
| Warning / Amber | `--tone-warning` | `#F0803C` | `triangle-alert` | Locked for Review, Reprint Needed, Needs Reprint |
| Danger / Red | `--tone-danger` | `#F27351` | `octagon-x` | Blocked, Missing, Failed, Not Connected |
| Neutral / Gray | `--tone-neutral` | `#9AA0BE` | `minus` | Canceled, Archived, Retired, Deferred MVP |

**One icon per tone (Decision #85).** Each tone above uses exactly one icon on every screen. The `clock` icon used by the aging indicator is the single documented exception — it flags elapsed time, not a lifecycle state. Ad hoc glyphs previously in use, including an exclamation mark on Danger badges, a roman numeral on deferred items, and square or circle-slash variants on Neutral badges, are retired.

Success covers two distinct states — `Printed` and `Fulfilled Externally` — that share the `circle-check` icon. This is intentional: both are terminal states where nothing further is owed. Screen context and the label distinguish them.

**Contrast:** on cards and detail headers the label sits at ~6–7:1; in a non-hovered table row ~5–6:1. The one exception is a status badge inside a table row **while that row is hovered** — there Warning and Danger sit at ~4.4:1, a hair under the 4.5:1 AA line. The owner accepted this: badges always pair color with an icon and a text label, so meaning never depends on color alone, and the non-hover state is well clear.

The full per-screen / per-status assignment lives in `frontend/src/components/ds/core/StatusBadge.jsx` (`STATUS_MAP`) and `frontend/src/lib/statusKeys.ts` — every screen shows a status-key legend for the labels it can render. SKU Manager's three chips are plain `Badge` chips (not lifecycle pills): "Active" — Success tone, `circle-check` icon; "No SKU" — Danger tone (a no-SKU product's order items are blocked), `octagon-x` icon; "Retired" — Neutral tone, no icon.

_Superseded (provenance only, not in code): Decision #74's approved hexes were Info `#89B4F8`, Progress `#B8822B`, Success `#3C7A45`, Warning `#C45A2A`, Danger `#C83A32`, Neutral `#4F536F`; the intermediate AA-lift (before re-saturation) was Info `#7FA8EE`, Progress `#D6A23F`, Success `#5FB877`, Warning `#E68450`, Danger `#EF7E72`._

## Aging indicator (Decisions #75, #87)

A small "{n}D" flag with the `clock` icon appears once an order or batch has been open 4+ calendar days. It uses the **Warning tone** (`--tone-warning`), per Decision #87.

Applies to the Orders screen (list and detail), Order Detail, Current Batches, and the Dashboard batch table.

_Superseded (provenance only, not in code): this flag originally used the spice accent (`--spice-400`) and was scoped to orders only. Decision #87 (2026-09-01) moved it to the Warning tone, because the spice accent also signals actions, links, and focus, so reusing it for aging risked reading as interactive; the same decision extended the flag to batches._

## Grouping accent — Pairs (Decision #86)

One violet, used solely to mark components that move together as a unit: the front/back pairs LITF/LITB and WALF/WALB. It renders as a bracket on the left edge of the grouped rows plus a "PAIR" label.

| Token | Hex | Use for |
|---|---|---|
| `--group-pair` | `#D4ADF4` | "PAIR" label text |
| `--group-pair-line` | `#AD7BDB` | Bracket rule on grouped rows |

Like the spice accent, this is **not** a status color. It carries no lifecycle meaning and never replaces a status badge — a paired component still shows its own status badge alongside the bracket.

## Adding or changing a color

1. **Reuse first.** Almost every need is covered by a surface step, a text step, the spice accent, the pair grouping accent, or a status tone. Use the semantic alias (`--surface-*`, `--text-*`, `--action-*`, `--tone-*`, `--group-*`), not a raw hex.
2. **If a new color is truly needed, keep it in harmony:** warm-neutral or a clearly separate hue, medium saturation, and light enough to clear **WCAG AA (4.5:1)** as text/icon on `--surface-card` (`#1C1E23`) — the status tones sit at ~6–7:1, aim for that band.
3. **Don't overload the accent.** Spice means "action / focus". Status meaning comes only from the six tones, and only with an icon + label.
4. Add the token to `ds-tokens/colors.css` with a comment, and record it here.
