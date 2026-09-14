import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  /** Spice top-rule accent. */
  accent?: boolean;
  padding?: number;
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

/** Generic charcoal surface card with optional header + spice accent rule. */
export function Card(props: CardProps): JSX.Element;
