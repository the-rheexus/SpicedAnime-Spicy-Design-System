import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  error:   { fg: 'var(--tone-danger)',  bg: 'var(--tone-danger-bg)',  bd: 'var(--tone-danger-line)',  icon: 'octagon-x' },
  warning: { fg: 'var(--tone-warning)', bg: 'var(--tone-warning-bg)', bd: 'var(--tone-warning-line)', icon: 'triangle-alert' },
  info:    { fg: 'var(--tone-info)',    bg: 'var(--tone-info-bg)',    bd: 'var(--tone-info-line)',    icon: 'info' },
  success: { fg: 'var(--tone-success)', bg: 'var(--tone-success-bg)', bd: 'var(--tone-success-line)', icon: 'circle-check' },
};

/**
 * Inline alert banner. Icon + title + body + optional action / dismiss.
 */
export function ErrorAlert({ tone = 'error', title, children, action, onDismiss, style, ...rest }) {
  const t = TONES[tone] || TONES.error;
  return (
    <div role="alert" style={{
      display: 'flex', gap: 13, padding: '14px 16px',
      background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${t.fg}`, ...style,
    }} {...rest}>
      <span style={{ color: t.fg, flex: 'none', display: 'flex', paddingTop: 1 }}><Icon name={t.icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.fg, marginBottom: children ? 5 : 0 }}>{title}</div>}
        {children && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-mid)' }}>{children}</div>}
        {action && <div style={{ marginTop: 12 }}>{action}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" style={{ flex: 'none', background: 'transparent', border: 'none', color: 'var(--text-low)', cursor: 'pointer', padding: 2, display: 'flex', height: 'fit-content' }}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
