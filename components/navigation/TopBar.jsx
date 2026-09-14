import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

/**
 * Top bar. Breadcrumb/title area on the left, global search + actions on the right.
 * Designed to pair with Sidebar; sits above the scrolling content.
 */
export function TopBar({
  title, breadcrumb, onSearch, searchPlaceholder = 'Search batches, orders, SKUs…',
  notifications = 0, actions, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return (
    <header style={{
      height: 'var(--topbar-h)', flex: 'none', display: 'flex', alignItems: 'center',
      gap: 16, padding: '0 24px', background: 'var(--surface-panel)',
      borderBottom: '1px solid var(--line)', ...style,
    }} {...rest}>
      <div style={{ minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={12} style={{ color: 'var(--text-faint)' }} />}
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === breadcrumb.length - 1 ? 'var(--text-mid)' : 'var(--text-low)' }}>{b}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        {title && <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-hi)', whiteSpace: 'nowrap' }}>{title}</h1>}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {onSearch !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', width: 280,
            background: 'var(--ink-850)',
            border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
            borderRadius: 'var(--radius-md)',
          }}>
            <Icon name="search" size={16} style={{ color: 'var(--text-low)' }} />
            <input placeholder={searchPlaceholder} onChange={(e) => onSearch && onSearch(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-hi)', fontFamily: 'var(--font-sans)', fontSize: 13 }} />
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <IconButton icon="bell" label="Notifications" />
          {notifications > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--spice-500)', color: 'var(--text-on-spice)', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, border: '2px solid var(--surface-panel)' }}>{notifications}</span>
          )}
        </div>
        {actions}
      </div>
    </header>
  );
}
