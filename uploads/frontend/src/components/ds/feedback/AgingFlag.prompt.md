Compact "{n}D" elapsed-time flag (Decisions #75 / #87). Shows once the anchor date is `thresholdDays` (default 4) or more calendar days in the past.

```jsx
<AgingFlag sinceIso={order.created_at} />
<AgingFlag sinceIso={batch.opened_at} thresholdDays={4} />
```

Renders in the **Warning tone** (`--tone-warning`) with the `clock` icon — the single documented icon exception to the one-icon-per-tone rule, because it flags elapsed time, not a lifecycle state.

It is **not** a status badge: never routed through `StatusBadge`, never in a status key, never in a status filter. The threshold and the anchor timestamp both come from props — the consuming screen decides which date to pass (Decision #75 leaves the anchor open).

`calendarDaysSince(iso, now?)` and `isAging(iso, now?, thresholdDays?)` are exported for screens that need the same day-count logic without the visual.
