import React from 'react';
import { Icon } from './Icon.jsx';

/* One fixed icon per tone (Decision #85). The icon is determined by the tone,
   never by the individual status, so a future status added to a tone inherits
   that tone's icon automatically. The `clock` icon (aging indicator) is the
   single documented exception and is NOT a status — see AgingIndicator. */
export const TONE_ICON = {
  info:     'circle',
  progress: 'circle-dashed',
  success:  'circle-check',
  warning:  'triangle-alert',
  danger:   'octagon-x',
  neutral:  'minus',
};

/* Canonical status → tone. Colour is ALWAYS paired with the tone icon + label.
   No per-status icon: `Printed` and `Fulfilled Externally` both sit in `success`
   and therefore share `circle-check`; that is intentional, not a special case. */
export const STATUS_MAP = {
  'Open':                          { tone: 'info' },
  'Queued':                        { tone: 'info' },
  'Queued for Production':         { tone: 'info' },
  'In Production':                 { tone: 'progress' },
  'In Production (Needs Reprint)': { tone: 'warning' },
  'Being Packaged':                { tone: 'progress' },
  'Locked for Review':             { tone: 'warning' },
  'Reprint Needed':                { tone: 'warning' },
  'Printed':                       { tone: 'success' },
  'Shipped':                       { tone: 'success' },
  'Ready':                         { tone: 'success' },
  'Available':                     { tone: 'success' },
  'Blocked':                       { tone: 'danger' },
  'Missing':                       { tone: 'danger' },
  /* Terminal order states reconciled from Shopify (P69). */
  'Fulfilled Externally':          { tone: 'success' },
  'Canceled':                      { tone: 'neutral' },
  'Archived':                      { tone: 'neutral' },
  'Retired':                       { tone: 'neutral' },
  'Deferred MVP':                  { tone: 'neutral' },
  'Pending':                       { tone: 'info' },
  'Success':                       { tone: 'success' },
  'Failed':                        { tone: 'danger' },
};

const TONE = {
  info:     { fg: 'var(--tone-info)',     bg: 'var(--tone-info-bg)',     bd: 'var(--tone-info-line)' },
  progress: { fg: 'var(--tone-progress)', bg: 'var(--tone-progress-bg)', bd: 'var(--tone-progress-line)' },
  success:  { fg: 'var(--tone-success)',  bg: 'var(--tone-success-bg)',  bd: 'var(--tone-success-line)' },
  warning:  { fg: 'var(--tone-warning)',  bg: 'var(--tone-warning-bg)',  bd: 'var(--tone-warning-line)' },
  danger:   { fg: 'var(--tone-danger)',   bg: 'var(--tone-danger-bg)',   bd: 'var(--tone-danger-line)' },
  neutral:  { fg: 'var(--tone-neutral)',  bg: 'var(--tone-neutral-bg)',  bd: 'var(--tone-neutral-line)' },
};

const SIZES = {
  sm: { h: 20, px: 7, fs: 10, icon: 11, gap: 4 },
  md: { h: 24, px: 9, fs: 11, icon: 13, gap: 5 },
  lg: { h: 30, px: 12, fs: 12, icon: 15, gap: 6 },
};

/**
 * Color-coded status pill. Icon + label always shown together (never color alone).
 * The icon comes from the status's tone (Decision #85), not the status itself.
 */
export function StatusBadge({ status, label, size = 'md', dot = false, style, ...rest }) {
  const meta = STATUS_MAP[status] || { tone: 'neutral' };
  const t = TONE[meta.tone] || TONE.neutral;
  const icon = TONE_ICON[meta.tone] || TONE_ICON.neutral;
  const s = SIZES[size] || SIZES.md;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        height: s.h, padding: `0 ${s.px}px`,
        background: t.bg, color: t.fg,
        border: `1px solid ${t.bd}`, borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)', fontSize: s.fs, fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot
        ? <span style={{ width: s.icon - 6, height: s.icon - 6, borderRadius: '50%', background: t.fg, flex: 'none' }} />
        : <Icon name={icon} size={s.icon} strokeWidth={2.25} />}
      {label || status}
    </span>
  );
}
