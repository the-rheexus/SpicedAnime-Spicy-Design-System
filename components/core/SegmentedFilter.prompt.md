# SegmentedFilter

**What it is:** A joined, hairline-divided group of mutually-exclusive filter
options — e.g. SKU status: `All` / `Has SKU` / `No SKU`. One outer border,
internal dividers between cells, no per-cell box. The active cell gets a
spice-tint fill, an inset spice ring, and a leading check glyph.

**When to use it:** Any "narrow what I'm looking at" choice with 2–5 mutually
exclusive options, typically inside a `FilterBar`. This is the filter half of
the filter/action distinction the system draws on purpose:

| | Reads as | Shape |
|---|---|---|
| `SegmentedFilter` | "choose one of these views" | one joined group, hairline dividers, no per-option border |
| `Button` | "do this thing now" | a standalone box, always individually bordered or filled |

Never use `Button` for a filter option and never use `SegmentedFilter` for an
action — the shape, not just the size, is what tells the operator which one
they're looking at.

**Usage:**
```jsx
<SegmentedFilter
  options={[{ value: 'all', label: 'All' }, { value: 'has', label: 'Has SKU' }, { value: 'no', label: 'No SKU' }]}
  value={status} onChange={setStatus}
/>
```

Composed automatically by `FilterBar`'s `filters` prop — reach for it directly
only when building a filter row outside `FilterBar`.
