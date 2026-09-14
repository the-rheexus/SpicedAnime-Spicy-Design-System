import * as React from 'react';

export type IconName =
  | 'layout-dashboard' | 'layers' | 'triangle-alert' | 'shopping-cart' | 'image'
  | 'tag' | 'boxes' | 'settings' | 'scroll-text' | 'circle' | 'circle-dashed' | 'minus'
  | 'circle-dot' | 'lock' | 'printer'
  | 'archive' | 'clock' | 'loader' | 'package' | 'truck' | 'circle-check' | 'octagon-x'
  | 'rotate-ccw' | 'pause' | 'check' | 'circle-alert' | 'ban' | 'search' | 'copy' | 'bell'
  | 'plus' | 'chevron-down' | 'chevron-right' | 'chevrons-up-down' | 'file-output'
  | 'filter' | 'x' | 'more-horizontal' | 'download' | 'inbox' | 'refresh-cw' | 'info'
  | 'arrow-up-right' | 'arrow-right';

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  spin?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Inline Lucide-style stroke icon; inherits color via currentColor. */
export function Icon(props: IconProps): JSX.Element | null;
export const ICON_NAMES: string[];
