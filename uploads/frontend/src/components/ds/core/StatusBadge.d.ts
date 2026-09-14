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
