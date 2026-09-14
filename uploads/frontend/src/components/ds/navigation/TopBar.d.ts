import * as React from 'react';

export interface TopBarProps {
  title?: string;
  breadcrumb?: string[];
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  notifications?: number;
  /** Right-aligned action slot (e.g. primary Button). */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Top bar with title/breadcrumb, global search, notifications, action slot. */
export function TopBar(props: TopBarProps): JSX.Element;
