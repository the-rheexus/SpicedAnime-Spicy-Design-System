import React from 'react';

/**
 * Generic surface card. Hairline border carries elevation; optional header row
 * with eyebrow label + action slot, optional spice top-rule accent.
 */
export function Card({
  children, title, eyebrow, action, accent = false, padding = 24,
  interactive = false, onClick, style, bodyStyle, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <section
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--surface-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out)',
        ...(interactive && hover ? { borderColor: 'var(--line-strong)', background: 'var(--surface-raised)' } : null),
        cursor: interactive ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {accent && (
        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--spice-500)' }} />
      )}
      {(title || eyebrow || action) && (
        <header style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, padding: `${padding}px ${padding}px 0`,
        }}>
          <div>
            {eyebrow && (
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
                color: 'var(--text-low)', marginBottom: title ? 6 : 0,
              }}>{eyebrow}</div>
            )}
            {title && (
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
                letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-hi)',
              }}>{title}</h3>
            )}
          </div>
          {action && <div style={{ flex: 'none' }}>{action}</div>}
        </header>
      )}
      <div style={{ padding, ...bodyStyle }}>{children}</div>
    </section>
  );
}
