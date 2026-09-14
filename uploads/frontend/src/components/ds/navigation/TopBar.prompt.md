Top bar that pairs with the Sidebar — page title / breadcrumb on the left, global search, notifications, and a primary action slot on the right.

```jsx
<TopBar
  breadcrumb={['Operations','Current Batches']} title="Current Batches"
  onSearch={...} notifications={3}
  actions={<Button variant="primary" iconLeft={<Icon name="plus" size={15}/>}>New Batch</Button>}
/>
```

Omit `onSearch` to hide search. The notification dot uses spice. Title is uppercase by design.
