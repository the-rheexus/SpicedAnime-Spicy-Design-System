import * as React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: 'neutral' | 'spice' | 'info' | 'success' | 'warning' | 'danger';
  /** Filled instead of tinted. */
  solid?: boolean;
  style?: React.CSSProperties;
}

/** Small mono count/label chip. Use StatusBadge for workflow statuses. */
export function Badge(props: BadgeProps): JSX.Element;
