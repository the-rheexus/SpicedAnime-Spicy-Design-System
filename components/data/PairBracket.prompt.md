Left-edge grouping bracket + label for components that belong together (Decision #86).

```jsx
<PairBracket>
  {/* LITF row */}
  {/* LITB row */}
</PairBracket>

<PairBracket variant="shared-source">
  {/* TIN row — shares a source artwork file with a lighter pair */}
</PairBracket>
```

`variant="pair"` (default): front/back pairs that move as a single unit (LITF/LITB, WALF/WALB). Solid bracket in the grouping accent (`--group-pair-line`) with a "PAIR" label (`--group-pair`).

`variant="shared-source"`: a component that only shares a *source artwork file* with another and does **not** move as a unit. Rendered deliberately distinct — dashed rule, "SHARED ART" label, muted meta-text colour — so the two cases are never confused. Frontend_Color_System.md v1.1 defines no dedicated colour for this case; it uses existing non-status tokens pending owner direction.

Purely visual — it never alters selection, which stays server-authoritative. Not a status: a bracketed component still shows its own status badge.
