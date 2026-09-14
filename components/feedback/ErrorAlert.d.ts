import * as React from 'react';

export interface ErrorAlertProps {
  tone?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

/** Inline alert banner with tone icon, left rule, optional action / dismiss. */
export function ErrorAlert(props: ErrorAlertProps): JSX.Element;
