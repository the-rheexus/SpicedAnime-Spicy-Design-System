import * as React from 'react';

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'inline';
  label?: string;
  /** Skeleton row count. */
  rows?: number;
  /** Path to the spinning brand mark. Resolved against the page; defaults to `assets/spicedanime-logo-spinner.png`. */
  logoSrc?: string;
  style?: React.CSSProperties;
}

/** Loading affordance — centered spinner, inline spinner, or shimmer skeletons. */
export function LoadingState(props: LoadingStateProps): JSX.Element;
