import React from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

/**
 * Full application shell: fixed Sidebar + TopBar + scrolling content area.
 * Pass `sidebar` / `topBar` props to override defaults, or `sidebarProps` /
 * `topBarProps` to configure the built-in ones.
 */
export function AppShell({
  active, onNavigate, sidebarProps = {}, topBarProps = {},
  sidebar, topBar, children, contentMax = false, style, ...rest
}) {
  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%', overflow: 'hidden',
      background: 'var(--surface-app)', ...style,
    }} {...rest}>
      {sidebar || <Sidebar active={active} onNavigate={onNavigate} {...sidebarProps} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {topBar || <TopBar {...topBarProps} />}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-app)' }}>
          <div style={{
            padding: 'var(--content-pad)',
            maxWidth: contentMax ? 'var(--content-max)' : 'none',
            margin: contentMax ? '0 auto' : undefined,
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
