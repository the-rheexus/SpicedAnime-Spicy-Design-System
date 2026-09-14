/**
 * Shared zero-component batch treatment (P106 item 4).
 *
 * A batch with no components must not read as "complete". Wherever a batch's
 * readiness or component count is shown — Current Batches, the Dashboard
 * `ActiveBatchTable` — a zero-total batch renders through this component in the
 * neutral tone with its own label, never "0/0 ready" in the success tone.
 */
export function EmptyBatchLabel({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      style={{
        color: "var(--tone-neutral)",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        ...style,
      }}
    >
      no components
    </span>
  );
}
