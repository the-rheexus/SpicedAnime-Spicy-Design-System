The status system. Renders any canonical fulfillment status as a color-coded pill with its tone's fixed icon + uppercase label — color is never used alone.

```jsx
<StatusBadge status="Open" />
<StatusBadge status="In Production" />
<StatusBadge status="Blocked" size="lg" />
<StatusBadge status="Printed" dot />
```

Every status is mapped to one of six tones (info / progress / success / warning / danger / neutral) in `STATUS_MAP`. The icon is determined by the **tone**, not the status (Decision #85): `TONE_ICON` = info `circle`, progress `circle-dashed`, success `circle-check`, warning `triangle-alert`, danger `octagon-x`, neutral `minus`. A new status added to a tone inherits that tone's icon automatically; `Printed` and `Fulfilled Externally` both sit in `success` and therefore share `circle-check`.

Sizes `sm | md | lg`. `dot` swaps the icon for a solid dot in dense tables. `label` overrides the rendered text only (not the tone/icon lookup or the stored status). Always pass an exact status string from the canonical list.

The aging flag (`AgingFlag`) is **not** a status and is never routed through this component.
