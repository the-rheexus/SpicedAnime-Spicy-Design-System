import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Compact "{n}D" elapsed-time flag (Decisions #75 / #87).
 *
 * Shown once the anchor date is `thresholdDays` or more calendar days in the
 * past. It renders in the Warning tone (`--tone-warning`) with the `clock`
 * icon — the single documented icon exception to the one-icon-per-tone rule
 * (Decision #85), because it flags elapsed time, not a lifecycle state.
 *
 * It is NOT a status badge: it is never routed through StatusBadge, never
 * appears in a status key, and never participates in a status filter.
 *
 * The threshold and the anchor timestamp both come from props. Decision #75
 * leaves the anchor open; the consuming screen decides what date to pass
 * (`orders.created_at`, `production_batches.opened_at`, …) — this component
 * does not.
 */
export const AGING_THRESHOLD_DAYS = 4;

/** Whole calendar days between `iso` and `now` (local time). `null` if unparseable. */
export function calendarDaysSince(iso, now = new Date()) {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const thenMidnight = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor((nowMidnight - thenMidnight) / 86_400_000);
}

export function isAging(iso, now, thresholdDays = AGING_THRESHOLD_DAYS) {
  const days = calendarDaysSince(iso, now);
  return days !== null && days >= thresholdDays;
}

export function AgingFlag({ sinceIso, now, thresholdDays = AGING_THRESHOLD_DAYS, style, ...rest }) {
  const days = calendarDaysSince(sinceIso, now);
  if (days === null || days < thresholdDays) return null;

  const label = `Open ${days} day${days === 1 ? '' : 's'} — aging`;
  return (
    <span
      title={label}
      aria-label={label}
      style={{
        alignItems: 'center',
        color: 'var(--tone-warning)',
        display: 'inline-flex',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 700,
        gap: 3,
        letterSpacing: '0.06em',
        ...style,
      }}
      {...rest}
    >
      <Icon name="clock" size={12} strokeWidth={2.25} />
      {`${days}D`}
    </span>
  );
}
