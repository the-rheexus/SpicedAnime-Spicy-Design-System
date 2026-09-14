Loading affordance. Use `skeleton` shimmer rows for tables/cards (preferred — preserves layout), `spinner` for a full block, `inline` next to a label or in a button area.

```jsx
<LoadingState variant="skeleton" rows={5} />
<LoadingState label="Generating PPTX…" />
<LoadingState variant="inline" label="Syncing orders…" />
```

Prefer skeletons over spinners when the shape of the content is known, so the layout doesn't jump.

All three variants show the rotating SpicedAnime mark. Its path resolves against the page, not the server root, so pass `logoSrc` when the page isn't served from the project root:

```jsx
<LoadingState variant="skeleton" rows={3} logoSrc="../../assets/spicedanime-logo-spinner.png" />
```
