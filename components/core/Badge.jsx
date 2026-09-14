import React from 'react';

const TONES = {
  /* neutral maps to the shared --tone-neutral tokens (Decision #74 / P95 B1)
     so a plain neutral Badge and a StatusBadge neutral pill read identically. */
  neutral: { fg: 'var(--tone-neutral)',  bg: 'var(--tone-neutral-bg)',  bd: 'var(--tone-neutral-line)' },
  spice:   { fg: 'var(--spice-400)',    bg: 'var(--spice-tint)',       bd: 'var(--line-spice)' },
  info:    { fg: 'var(--tone-info)',    bg: 'var(--tone-info-bg)',     bd: 'var(--tone-info-line)' },
  success: { fg: 'var(--tone-success)', bg: 'var(--tone-success-bg)',  bd: 'var(--tone-success-line)' },
  warning: { fg: 'var(--tone-warning)', bg: 'var(--tone-warning-bg)',  bd: 'var(--tone-warning-line)' },
  danger:  { fg: 'var(--tone-danger)',  bg: 'var(--tone-danger-bg)',   bd: 'var(--tone-danger-line)' },
};

/**
 * Small generic label/count chip. For workflow statuses use StatusBadge instead.
 */
export function Badge({ children, tone = 'neutral', solid = false, style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: 20, padding: '0 8px',
        background: solid ? t.fg : t.bg,
        color: solid ? 'var(--ink-900)' : t.fg,
        border: solid ? '1px solid transparent' : `1px solid ${t.bd}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', lineHeight: 1, whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
