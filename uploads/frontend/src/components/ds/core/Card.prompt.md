Generic surface card — the base container for everything in the content area. Hairline border + faint shadow give elevation on the dark base.

```jsx
<Card eyebrow="Production" title="Open Batches" action={<Button size="sm">View all</Button>}>
  …content…
</Card>
<Card accent interactive onClick={...}>…</Card>
```

`eyebrow` = uppercase tracked label above the title. `accent` adds a spice top-rule. `interactive` enables hover elevation for clickable cards. Override `padding` (default 24) for dense content.
