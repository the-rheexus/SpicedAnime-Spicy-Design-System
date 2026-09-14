Inline alert banner for errors, warnings, and confirmations within a view (e.g. "PPTX generation failed", "3 items blocked").

```jsx
<ErrorAlert tone="error" title="PPTX generation failed"
  action={<Button variant="danger" size="sm" iconLeft={<Icon name="refresh-cw" size={13}/>}>Retry</Button>}>
  The print service timed out. Your batch is unchanged.
</ErrorAlert>
<ErrorAlert tone="warning" title="3 items blocked" onDismiss={...}>Missing artwork on 3 SKUs.</ErrorAlert>
```

Tones: error / warning / info / success. Keep messages specific and non-apologetic.
