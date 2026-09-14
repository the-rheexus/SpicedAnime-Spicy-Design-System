import * as React from 'react';
import type { IconName } from './Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Accessible label / tooltip. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Square icon-only button for toolbars, row actions, top bar. */
export function IconButton(props: IconButtonProps): JSX.Element;
