Action button for the fulfillment UI — uppercase, tracked, used for everything from `GENERATE PPTX` to row actions.

```jsx
<Button variant="primary" size="lg" iconLeft={<Icon name="file-output" />}>
  Generate PPTX
</Button>
<Button variant="secondary">Lock Batch</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger">Delete</Button>
```

Variants: `primary` (the one spice action per view), `secondary` (neutral control), `ghost` (low-emphasis / cancel), `outline`, `danger` (tinted red). Sizes `sm | md | lg`. Supports `iconLeft` / `iconRight`, `fullWidth`, `disabled`, `loading` (shows spinner). Reserve `primary` for the single most important action on a screen.
