Styled native `<select>` with a custom chevron, matching Input. Use for short option sets (filters, status pickers, sort).

```jsx
<Select label="Status" options={['All', 'Open', 'In Production', 'Blocked']} />
<Select options={[{value:'date',label:'Newest'},{value:'qty',label:'Quantity'}]} defaultValue="date" />
```

`options` accepts plain strings or `{value,label}` objects. For very long lists prefer a search field.
