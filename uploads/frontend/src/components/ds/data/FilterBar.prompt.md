Toolbar that sits above tables and grids: a search field, a row of filter pills (with counts), inline controls, and a right-aligned action slot.

```jsx
<FilterBar
  searchValue={q} onSearch={setQ} searchPlaceholder="Search batches…"
  filters={[{value:'all',label:'All',count:42},{value:'open',label:'Open',count:12},{value:'blocked',label:'Blocked',count:3}]}
  activeFilter={f} onFilter={setF}
  right={<Button variant="primary" size="sm" iconLeft={<Icon name="plus" size={14}/>}>New Batch</Button>}
>
  <Select options={['Newest','Quantity']} fullWidth={false} />
</FilterBar>
```

Active pill uses the spice-tinted selected state. Omit `onSearch` to hide the search field.
