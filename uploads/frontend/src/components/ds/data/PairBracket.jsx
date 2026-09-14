import React from 'react';

/**
 * Left-edge grouping bracket + label for components that belong together
 * (Decision #86). Purely visual: it never alters selection logic, which stays
 * server-authoritative per the existing pair-keeping rule. It is not a status
 * and never replaces a status badge — a bracketed component still shows its own
 * status badge alongside the bracket.
 *
 * `variant`:
 *  - `"pair"` (default) — front/back pairs that move as a single unit
 *    (LITF/LITB, WALF/WALB). Solid bracket in the grouping accent
 *    (`--group-pair-line`) with a "PAIR" label (`--group-pair`).
 *  - `"shared-source"` — a component that only shares a *source artwork file*
 *    with another (for example TIN alongside a lighter pair) and does NOT move
 *    as a unit. Rendered deliberately distinct — a dashed rule and a
 *    "SHARED ART" label in the muted meta-text colour — so the two cases are
 *    never confused. Frontend_Color_System.md v1.1 documents no dedicated
 *    colour for this case; this uses existing non-status tokens
 *    (`--line-strong`, `--text-meta`) pending owner direction.
 */
export function PairBracket({ children, variant = 'pair', label, style, ...rest }) {
  const isShared = variant === 'shared-source';
  const stroke = isShared ? 'dashed' : 'solid';
  const lineColor = isShared ? 'var(--line-strong)' : 'var(--group-pair-line)';
  const labelColor = isShared ? 'var(--text-meta)' : 'var(--group-pair)';
  const text = label ?? (isShared ? 'Shared art' : 'Pair');

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, ...style }} {...rest}>
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 9,
          borderLeft: `2px ${stroke} ${lineColor}`,
          borderTop: `2px ${stroke} ${lineColor}`,
          borderBottom: `2px ${stroke} ${lineColor}`,
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <span
          style={{
            color: labelColor,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {text}
        </span>
        {children}
      </div>
    </div>
  );
}
