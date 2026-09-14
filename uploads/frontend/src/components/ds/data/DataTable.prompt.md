Operational data table for Orders, SKU Manager, Packing Queue, Audit Log. Column-config driven with custom cell render (drop a `StatusBadge` into a cell), sortable headers, and optional row selection.

```jsx
<DataTable
  selectable selected={sel} onSelect={setSel}
  sortKey="qty" sortDir="desc" onSort={setSort}
  columns={[
    { key:'id', header:'Order', mono:true, sortable:true },
    { key:'sku', header:'SKU', mono:true },
    { key:'qty', header:'Qty', align:'right', mono:true, sortable:true },
    { key:'status', header:'Status', render:(v)=> <StatusBadge status={v} size="sm" /> },
  ]}
  rows={orders}
  onRowClick={openOrder}
/>
```

Use `mono:true` for IDs/SKUs/numbers, `align:'right'` for numeric columns, and `render` to embed components. `emptyLabel` shows when `rows` is empty (or use the `EmptyState` component above the table).
