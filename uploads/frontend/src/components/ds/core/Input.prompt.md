Text input with uppercase tracked label, optional leading icon, focus ring in spice, and error/hint text.

```jsx
<Input label="Batch name" placeholder="e.g. One Piece tapestries" />
<Input label="Search" iconLeft="search" placeholder="Search SKUs…" />
<Input label="SKU" mono error="Already exists" defaultValue="SA-TAP-01" />
```

`mono` switches to JetBrains Mono for IDs/SKUs/numbers. `error` turns the border red and shows the message; `hint` shows muted helper text.
