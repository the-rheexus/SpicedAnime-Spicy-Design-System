Inline SVG icon from the Lucide set — stroke style, inherits text/tone color via `currentColor`. Use everywhere an icon is needed; never hand-draw SVG or use emoji.

```jsx
<Icon name="file-output" size={18} />
<Icon name="loader" spin />
<span style={{ color: 'var(--tone-danger)' }}><Icon name="octagon-x" size={16} /></span>
```

Status-icon mapping is fixed (see readme ICONOGRAPHY). `spin` animates (use for `loader` / `refresh-cw`). To add an icon, paste its Lucide inner-SVG into the `PATHS` map in `Icon.jsx`.
