Small mono chip for counts, tags, and metadata (e.g. `142 UNITS`, `NEW`, item counts on nav). For workflow statuses, use `StatusBadge` — not this.

```jsx
<Badge>142 units</Badge>
<Badge tone="spice">New</Badge>
<Badge tone="danger" solid>3</Badge>
```

Tones: neutral / spice / info / success / warning / danger. `solid` for a filled count bubble (e.g. nav notification counts).
