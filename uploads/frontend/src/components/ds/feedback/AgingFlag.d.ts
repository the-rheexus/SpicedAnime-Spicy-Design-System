import * as React from 'react';

export const AGING_THRESHOLD_DAYS: number;

/** Whole calendar days between `iso` and `now` (local time). `null` if unparseable. */
export function calendarDaysSince(iso?: string | null, now?: Date): number | null;

/** True once `iso` is `thresholdDays` (default 4) or more calendar days in the past. */
export function isAging(iso?: string | null, now?: Date, thresholdDays?: number): boolean;

export interface AgingFlagProps {
  /** Anchor timestamp. The consuming screen decides which date this is (Decision #75). */
  sinceIso?: string | null;
  /** Override "now" (tests). */
  now?: Date;
  /** Calendar-day threshold at or beyond which the flag shows. Defaults to 4. */
  thresholdDays?: number;
  style?: React.CSSProperties;
}

/**
 * Compact "{n}D" elapsed-time flag in the Warning tone with the `clock` icon
 * (Decisions #75 / #87). Not a status badge.
 * @startingPoint section="Feedback" subtitle="Elapsed-time aging flag" viewport="400x120"
 */
export function AgingFlag(props: AgingFlagProps): JSX.Element | null;
