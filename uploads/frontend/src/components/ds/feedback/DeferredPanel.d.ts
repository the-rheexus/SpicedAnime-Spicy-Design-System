import * as React from 'react';

export interface DeferredPanelProps {
  tag?: string;
  title?: string;
  children?: React.ReactNode;
  /** Optional planned date / release. */
  eta?: string;
  style?: React.CSSProperties;
}

/** Informational panel marking a deferred / post-MVP feature (planned, not broken). */
export function DeferredPanel(props: DeferredPanelProps): JSX.Element;
