import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Toolbar row above tables/grids: search field, filter pills, and a right-aligned
 * action slot. Composes layout only — drop Select/Button/Badge children in.
 */
export function FilterBar({
  searchValue, onSearch, searchPlaceholder = 'Search…',
  filters = [], activeFilter, onFilter, children, right, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '14px 16px', background: 'var(--surface-panel)',
      border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', ...style,
    }} {...rest}>
      {onSearch !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          background: 'var(--ink-850)', minWidth: 220, flex: '0 1 280px',
          border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--radius-md)',
        }}>
          <Icon name="search" size={16} style={{ color: 'var(--text-low)' }} />
          <input
            value={searchValue} placeholder={searchPlaceholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-hi)', fontFamily: 'var(--font-sans)', fontSize: 14 }}
          />
        </div>
      )}

      {filters.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map((f) => {
            const val = typeof f === 'string' ? f : f.value;
            const lbl = typeof f === 'string' ? f : f.label;
            const count = typeof f === 'object' ? f.count : undefined;
            const active = activeFilter === val;
            return (
              <button key={val} onClick={() => onFilter && onFilter(val)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px',
                  background: active ? 'var(--spice-tint)' : 'transparent',
                  color: active ? 'var(--spice-400)' : 'var(--text-mid)',
                  border: `1px solid ${active ? 'var(--line-spice)' : 'var(--line-strong)'}`,
                  borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}>
                {lbl}
                {count != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: active ? 'var(--spice-400)' : 'var(--text-low)' }}>{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {children}
      {right && <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}
