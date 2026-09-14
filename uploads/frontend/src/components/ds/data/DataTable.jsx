import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Checkbox } from '../core/Checkbox.jsx';

/**
 * Operational data table. Columns config with optional custom render, sortable
 * headers, row hover, optional selection. Mono is used for numeric/ID columns.
 */
export function DataTable({
  columns = [], rows = [], rowKey = 'id', selectable = false,
  selected = [], onSelect, onRowClick, sortKey, sortDir = 'asc', onSort,
  emptyLabel = 'No rows', style, virtualize = false, virtualThreshold = 80,
  virtualRowHeight = 52, virtualOverscan = 6, scrollHeight = 576,
  renderExpandedRow, expandedRowKeys = [], ...rest
}) {
  const [hoverRow, setHoverRow] = React.useState(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollRef = React.useRef(null);
  const allSel = selectable && rows.length > 0 && selected.length === rows.length;
  const someSel = selectable && selected.length > 0 && !allSel;
  const shouldVirtualize = virtualize && rows.length >= virtualThreshold;
  const rowSignature = rows.map((row, index) => row[rowKey] ?? index).join(',');
  const visibleRowCount = Math.ceil(scrollHeight / virtualRowHeight);
  const firstVisibleIndex = Math.floor(scrollTop / virtualRowHeight);
  const windowStart = shouldVirtualize
    ? Math.max(0, firstVisibleIndex - virtualOverscan)
    : 0;
  const windowEnd = shouldVirtualize
    ? Math.min(rows.length, firstVisibleIndex + visibleRowCount + virtualOverscan)
    : rows.length;
  const renderedRows = rows.slice(windowStart, windowEnd);
  const expandable = typeof renderExpandedRow === 'function';
  const expandedKeySet = new Set(expandedRowKeys);
  const totalColSpan = columns.length + (selectable ? 1 : 0);
  const topSpacerHeight = windowStart * virtualRowHeight;
  const bottomSpacerHeight = (rows.length - windowEnd) * virtualRowHeight;

  React.useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [rowSignature]);

  const toggleAll = () => onSelect && onSelect(allSel ? [] : rows.map((r) => r[rowKey]));
  const toggleRow = (k) => {
    if (!onSelect) return;
    onSelect(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  };

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)', ...style }} {...rest}>
      <div
        ref={scrollRef}
        data-testid={shouldVirtualize ? 'virtualized-data-table-scroll' : undefined}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        style={shouldVirtualize ? { maxHeight: scrollHeight, overflowY: 'auto' } : undefined}
      >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
        <thead>
          <tr style={{ background: 'var(--ink-850)' }}>
            {selectable && (
              <th style={{ ...stickyThStyle, width: 44, paddingRight: 0 }}>
                <Checkbox checked={allSel} indeterminate={someSel} onChange={toggleAll} />
              </th>
            )}
            {columns.map((c) => {
              const active = sortKey === c.key;
              return (
                <th key={c.key} style={{ ...(shouldVirtualize ? stickyThStyle : thStyle), textAlign: c.align || 'left', cursor: c.sortable ? 'pointer' : 'default', width: c.width }}
                  onClick={() => c.sortable && onSort && onSort(c.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start', color: active ? 'var(--text-mid)' : undefined }}>
                    {c.header}
                    {c.sortable && <Icon name={active ? 'chevron-down' : 'chevrons-up-down'} size={12} style={{ opacity: active ? 1 : 0.4, transform: active && sortDir === 'asc' ? 'rotate(180deg)' : 'none' }} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-low)', fontSize: 13 }}>{emptyLabel}</td></tr>
          )}
          {shouldVirtualize && topSpacerHeight > 0 && (
            <tr aria-hidden="true">
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={spacerStyle}>
                <div style={{ height: topSpacerHeight }} />
              </td>
            </tr>
          )}
          {renderedRows.map((row, i) => {
            const k = row[rowKey] ?? (windowStart + i);
            const isSel = selected.includes(k);
            const isExpanded = expandable && expandedKeySet.has(k);
            return (
              <React.Fragment key={k}>
              <tr
                onMouseEnter={() => setHoverRow(k)} onMouseLeave={() => setHoverRow(null)}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  background: isSel ? 'var(--spice-tint)' : hoverRow === k ? 'var(--surface-hover)' : 'transparent',
                  borderTop: '1px solid var(--line)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  height: shouldVirtualize ? virtualRowHeight : undefined,
                  transition: 'background var(--dur-fast) var(--ease-out)',
                }}>
                {selectable && (
                  <td style={{ ...tdStyle, width: 44, paddingRight: 0 }} onClick={(e) => { e.stopPropagation(); toggleRow(k); }}>
                    <Checkbox checked={isSel} onChange={() => toggleRow(k)} />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} style={{
                    ...tdStyle, textAlign: c.align || 'left',
                    fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                    color: c.mono ? 'var(--text-hi)' : 'var(--text-mid)',
                    fontSize: c.mono ? 13 : 14,
                  }}>
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
              {isExpanded && (
                <tr data-testid="data-table-expanded-row" style={{ background: 'var(--surface-panel)' }}>
                  <td colSpan={totalColSpan} style={{ padding: 0, borderTop: '1px solid var(--line)' }}>
                    {renderExpandedRow(row)}
                  </td>
                </tr>
              )}
              </React.Fragment>
            );
          })}
          {shouldVirtualize && bottomSpacerHeight > 0 && (
            <tr aria-hidden="true">
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={spacerStyle}>
                <div style={{ height: bottomSpacerHeight }} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '13px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700,
  letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)',
  whiteSpace: 'nowrap', userSelect: 'none',
};
const stickyThStyle = {
  ...thStyle,
  background: 'var(--ink-850)',
  borderBottom: '1px solid var(--line)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};
const tdStyle = { padding: '13px 18px', verticalAlign: 'middle' };
const spacerStyle = { border: 0, height: 0, padding: 0 };
