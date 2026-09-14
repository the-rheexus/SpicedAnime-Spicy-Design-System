Marks a feature that's intentionally not built for MVP — so the operator knows it's planned, not broken. Muted, hatch-textured, with a `DEFERRED — MVP` tag.

```jsx
<DeferredPanel title="Bulk reprint" eta="v1.2">
  Selecting multiple batches for a single reprint run is planned for a later release.
</DeferredPanel>
```

Use in place of a real control where a post-MVP feature would live. Keep the tone matter-of-fact.

**Texture:** hatch alone. Do not add a diagonal stripe layer here — the supporting copy is 13px and non-bold, which the stripe legibility rule protects. Stripes belong where type is bold or absent (panel headers, empty states); dots carry prose. The neutral status tone stays in the badge pill, never on the container border.
