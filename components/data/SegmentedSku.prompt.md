Renders a canonical SKU as adjacent per-segment chips with a copy control that copies the full canonical string.

```jsx
<SegmentedSku
  sku="LIT-DESNAM-SIL-TOR-LITTIN"
  familyCode="LIT"
  designCode="DESNAM"
  options={{ color: "SIL", flame: "TOR" }}
  configCode="LITTIN"
/>
```

The segments come from the **backend SKU parser** (`fulfillment/sku_parser.py`), surfaced on the API as `family_code` / `design_code` / `options` / `config_code` (see `OfferSku`, `OrderItem`). This component does not parse the SKU and never splits the string on delimiters — callers pass the already-parsed fields.

Segment order follows `SKU_and_Internal_ID_Guide.md`: `<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>`, where the option run is the parser's `options` dict in insertion order (`{color, flame}` for LIT, `{size}` for BAT/TAP/PIL, `{size, color}` for HOD, `{color}` for TOT).

With no parsed fields it falls back to a single chip holding the raw canonical string — still copyable, just not segmented. Sizes `sm | md`.

`tone` sets chip colour. A SKU is an **identifier, never a status**, so no variant borrows a status tone or the spice accent:

```jsx
<SegmentedSku {...parsed} />                {/* tone="value" — the default */}
<SegmentedSku {...parsed} tone="none" />    {/* uniform grey, for fully neutral surfaces */}
```

- **`value` — default, approved 2026-09-04.** Tonal ladder, family strongest → config faintest. Adds no hue at all, so it is safe everywhere: inside a row that already carries a status badge, and in dense tables.
- `none` — uniform grey chips. The previous treatment; reach for it only when a surface must stay entirely neutral.
- `role` — adds `--seg-design` teal and `--seg-option` sand. **Not adopted**; kept for a future surface that needs faster scanning than the tonal ladder gives.

All three sit side by side on the *SKU chip colour* card under **Exploration**.
