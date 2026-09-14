import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { SegmentedFilter } from '../core/SegmentedFilter.jsx';

/**
 * Toolbar row above tables/grids: search field, an exclusive-choice
 * `SegmentedFilter`, and a right-aligned action slot. Composes layout only —
 * drop Select/Button/Badge children in. Filters and actions are deliberately
 * different shapes (joined segmented group vs. standalone Button) so an
 * operator can tell "narrows the view" apart from "does something" at a
 * glance, not just by size.
 */
export function FilterBar({
  searchValue, onSearch, searchPlaceholder = 'Search…',
  filters = [], activeFilter, onFilter, onClear, children, right, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [clearHover, setClearHover] = React.useState(false);
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
        <SegmentedFilter options={filters} value={activeFilter} onChange={onFilter} />
      )}

      {children}

      {onClear && (
        <button onClick={onClear}
          onMouseEnter={() => setClearHover(true)} onMouseLeave={() => setClearHover(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px',
            background: clearHover ? 'var(--surface-hover)' : 'transparent',
            border: '1px solid transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            color: clearHover ? 'var(--text-hi)' : 'var(--text-low)',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all var(--dur-fast) var(--ease-out)',
          }}>
          <Icon name="x" size={13} />
          Clear
        </button>
      )}

      {right && <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}
