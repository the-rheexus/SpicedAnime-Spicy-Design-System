Left navigation rail for the app shell. Logo header, uppercase nav items with active spice indicator + optional counts, footer nav, and operator identity.

```jsx
<Sidebar active="batches" onNavigate={setView} logoSrc="assets/spicedanime-icon.png" operator="Josiah" />
```

Defaults to the full fulfillment nav (Dashboard, Current Batches, Needs Attention, Orders, Artwork Library, SKU Manager, Packing Queue + Settings/Audit). Pass `nav` / `footerNav` to override. Set `tone: 'danger'` on an item for a red count (e.g. blocked items). **Pass `logoSrc` as the correct relative path from your page.**
