import * as React from 'react';

export type StatusName =
  | 'Open' | 'Locked for Review' | 'Printed' | 'Archived' | 'Queued for Production'
  | 'In Production' | 'Being Packaged' | 'Shipped' | 'Queued' | 'Ready' | 'Blocked'
  | 'In Production (Needs Reprint)'
  | 'Reprint Needed' | 'Deferred MVP' | 'Available' | 'Missing' | 'Retired'
  | 'Fulfilled Externally' | 'Canceled'
  | 'Pending' | 'Success' | 'Failed';

export interface StatusBadgeProps {
  status: StatusName;
  /** Override the rendered text without changing the tone/icon lookup or the underlying status value. */
  label?: string;
  /**
   * Opt into a documented display-label override for the context this badge is
   * rendered in. The stored enum value never changes.
   * - `batches` — Current Batches only: `Locked for Review` reads "PPT Generated" (Decision #44).
   * - `component` — component lists: `Canceled` reads "Print Not Needed" (Decision #64).
   * - `reprint` — an unbatched reprint replacement reads "Awaiting batch" (Decision #88).
   */
  context?: 'batches' | 'component' | 'reprint';
  size?: 'sm' | 'md' | 'lg';
  /** Use a solid dot instead of the status icon. */
  dot?: boolean;
  style?: React.CSSProperties;
}

/**
 * Canonical status pill — color + icon + label, never color alone.
 * @startingPoint section="Core" subtitle="Status badges for all fulfillment states" viewport="700x200"
 */
export type StatusTone = 'info' | 'progress' | 'success' | 'warning' | 'danger' | 'neutral';

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
/** Canonical status → its tone. The rendered icon is derived from the tone (Decision #85). */
export const STATUS_MAP: Record<StatusName, { tone: StatusTone }>;
/** The one fixed icon each tone renders (Decision #85). */
export const TONE_ICON: Record<StatusTone, string>;
/** Context-scoped display-label overrides (Decisions #44, #64, #88). Stored values are unaffected. */
export const DISPLAY_LABEL: Record<'batches' | 'component' | 'reprint', Record<string, string>>;
