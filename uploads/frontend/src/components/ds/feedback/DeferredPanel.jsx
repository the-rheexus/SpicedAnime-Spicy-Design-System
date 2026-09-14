import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Deferred / MVP informational panel — marks a feature that's intentionally not
 * built yet. Muted, hatch-textured, with a clear "DEFERRED — MVP" tag so the
 * operator knows it's planned, not broken.
 */
export function DeferredPanel({ tag = 'Deferred — MVP', title, children, eta, style, ...rest }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--surface-card)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)', padding: '20px 22px', ...style,
    }} {...rest}>
      <span style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--tex-hatch)', backgroundRepeat: 'repeat', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 9px',
            background: 'var(--tone-neutral-bg)', border: '1px solid var(--tone-neutral-line)',
            borderRadius: 'var(--radius-sm)', color: 'var(--tone-neutral)',
            fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <Icon name="minus" size={11} /> {tag}
          </span>
          {eta && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-low)' }}>ETA {eta}</span>}
        </div>
        {title && <h3 style={{ margin: '0 0 7px', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>{title}</h3>}
        {children && <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.55, color: 'var(--text-low)', maxWidth: 460 }}>{children}</p>}
      </div>
    </div>
  );
}
