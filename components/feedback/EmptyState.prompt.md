Zero-data state for empty tables, queues, and lists. Halftone-textured medallion gives the punk edge; keep copy terse and helpful.

```jsx
<EmptyState icon="layers" title="No open batches"
  action={<Button variant="primary" iconLeft={<Icon name="plus" size={14}/>}>New Batch</Button>}>
  New batches appear here once orders are grouped for production.
</EmptyState>
```

`compact` reduces vertical padding for in-card empties. Use a relevant icon (`inbox`, `layers`, `image`, `octagon-x` for "all clear").
