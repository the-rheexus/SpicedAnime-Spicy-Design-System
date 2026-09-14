The central object of the fulfillment app. Shows batch ID, title, status, printed/units progress bar, meta, and the primary `GENERATE PPTX` action.

```jsx
<BatchCard
  batchId="BATCH-0428" title="One Piece Tapestries"
  status="In Production" units={142} printed={96} ordersCount={38} blocked={2}
  due="Jun 21" onGenerate={...} onOpen={...}
/>
```

The progress bar turns green at 100%. `blocked` shows a red count near the ID. Generate PPTX is the primary action by design — it's the operator's most important daily action.

On Current Batches, pass `statusContext="batches"` so a `Locked for Review` batch reads "PPT Generated" (Decision #44), `aging` for the 4-plus-day flag, and a single open control per Decision #63:

```jsx
<BatchCard
  batchId="LIGHTER #8" title="Lighter batch" status="Locked for Review" statusContext="batches"
  aging={<AgingFlag sinceIso={batch.opened_at} />}
  units={142} printed={96} blocked={2}
  primaryLabel="Open Batch" onGenerate={openBatchDetail} singleAction
/>
```
