import * as React from 'react';
import type { IconName } from '../core/Icon';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}

/**
 * Zero-data state with halftone-textured medallion + optional action.
 * @startingPoint section="Feedback" subtitle="Empty / zero-data states" viewport="700x340"
 */
export function EmptyState(props: EmptyStateProps): JSX.Element;
