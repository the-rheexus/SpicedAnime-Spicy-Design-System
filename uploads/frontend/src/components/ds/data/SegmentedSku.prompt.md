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
