import React from 'react';
import { Icon } from './Icon.jsx';

const HEIGHTS = { sm: 30, md: 36 };

/**
 * Exclusive-choice filter control (e.g. SKU status: All / Has SKU / No SKU).
 * One joined, hairline-divided group — visually distinct from `Button`
 * (which is always a standalone, individually-bordered action). Use this for
 * "narrow what I'm looking at" choices; use `Button` for "do something".
 */
export function SegmentedFilter({ options = [], value, onChange, size = 'md', style, ...rest }) {
  const h = HEIGHTS[size] || HEIGHTS.md;
  const [hoverVal, setHoverVal] = React.useState(null);
  return (
    <div
      role="radiogroup"
      style={{
        display: 'inline-flex', height: h,
        border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', ...style,
      }}
      {...rest}
    >
      {options.map((opt, i) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const lbl = typeof opt === 'string' ? opt : opt.label;
        const count = typeof opt === 'object' ? opt.count : undefined;
        const active = value === val;
        const hovering = !active && hoverVal === val;
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange && onChange(val)}
            onMouseEnter={() => setHoverVal(val)}
            onMouseLeave={() => setHoverVal(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: '100%', padding: '0 14px',
              background: active ? 'var(--spice-tint)' : hovering ? 'var(--surface-hover)' : 'transparent',
              boxShadow: active ? 'inset 0 0 0 1px var(--line-spice)' : 'none',
              border: 'none',
              borderRight: i < options.length - 1 ? '1px solid var(--line-strong)' : 'none',
              color: active ? 'var(--spice-400)' : 'var(--text-mid)',
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)',
            }}
          >
            {active && <Icon name="check" size={13} />}
            {lbl}
            {count != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: active ? 'var(--spice-400)' : 'var(--text-low)' }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
