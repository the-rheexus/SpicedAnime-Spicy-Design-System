Sharp-cornered checkbox for table row selection, filters, and forms. `indeterminate` is for the select-all header when some rows are picked.

```jsx
<Checkbox checked={sel} onChange={setSel} label="Lock after generating" />
<Checkbox indeterminate onChange={selectAll} />
```

`onChange` receives the next boolean. Checked state fills spice with a check glyph.
