Confirmation dialog for destructive or consequential actions (lock batch, delete, archive). Scrim + blur, tone rule, uppercase title, two actions.

```jsx
<ConfirmModal
  open={open} tone="warning"
  title="Lock batch for review?"
  confirmLabel="Lock Batch" onConfirm={...} onCancel={...}
>
  Locked batches can't accept new items until unlocked.
</ConfirmModal>
```

`tone` = default (spice) / warning / danger (red confirm button). Keep body copy one or two sentences, direct and specific.
