import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Empty state for zero-data views. Halftone-textured icon medallion, uppercase
 * heading, supporting line, and an optional action. Punk edge lives here.
 */
export function EmptyState({ icon = 'inbox', title, children, action, compact = false, style, ...rest }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: compact ? '36px 24px' : '64px 24px',
      border: '1px dashed var(--line-strong)', borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)', position: 'relative', overflow: 'hidden', ...style,
    }} {...rest}>
      <span style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--tex-halftone)', backgroundRepeat: 'repeat', opacity: 0.5, pointerEvents: 'none' }} />
      <span style={{
        position: 'relative', width: 56, height: 56, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ink-850)', border: '1.5px solid var(--line-strong)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-low)',
      }}>
        <Icon name={icon} size={26} />
      </span>
      <h3 style={{
        position: 'relative', margin: '0 0 8px', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 800,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hi)',
      }}>{title}</h3>
      {children && (
        <p style={{ position: 'relative', margin: '0 0 20px', maxWidth: 360, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.55, color: 'var(--text-low)' }}>{children}</p>
      )}
      {action && <div style={{ position: 'relative' }}>{action}</div>}
    </div>
  );
}
