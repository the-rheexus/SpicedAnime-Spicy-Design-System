The central object of the fulfillment app. Shows batch ID, title, status, printed/units progress bar, meta, and the primary `GENERATE PPTX` action.

```jsx
<BatchCard
  batchId="BATCH-0428" title="One Piece Tapestries"
  status="In Production" units={142} printed={96} ordersCount={38} blocked={2}
  due="Jun 21" onGenerate={...} onOpen={...}
/>
```

The progress bar turns green at 100%. `blocked` shows a red count near the ID. Generate PPTX is the primary action by design — it's the operator's most important daily action.
