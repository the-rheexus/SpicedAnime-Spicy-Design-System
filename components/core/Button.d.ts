import * as React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. primary = the single spice action; secondary = hairline border, fills on hover; outline = faintest border, for the lowest-emphasis action; danger = destructive. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  /**
   * When set, the button is rendered as a real navigation link (Next.js Link)
   * with this href, preserving native new-tab / modifier-click behavior. Use
   * only for controls whose sole purpose is navigating to another app route;
   * mutation and workflow actions stay plain buttons.
   */
  href?: string;
  style?: React.CSSProperties;
}

/**
 * Action button. Uppercase tracked label, tight 5px radius.
 * @startingPoint section="Core" subtitle="Buttons — primary, secondary, ghost, danger" viewport="700x160"
 */
export function Button(props: ButtonProps): JSX.Element;
