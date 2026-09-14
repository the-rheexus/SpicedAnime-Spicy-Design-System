import * as React from 'react';

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'inline';
  label?: string;
  /** Skeleton row count. */
  rows?: number;
  style?: React.CSSProperties;
}

/** Loading affordance — centered spinner, inline spinner, or shimmer skeletons. */
export function LoadingState(props: LoadingStateProps): JSX.Element;
