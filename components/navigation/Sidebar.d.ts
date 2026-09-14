import * as React from 'react';
import type { IconName } from '../core/Icon';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
  tone?: 'danger';
  /**
   * App route this entry navigates to. When set the entry renders as a real
   * link (Next.js Link) with native new-tab / modifier-click behavior; without
   * it the entry falls back to a button driven by `onNavigate`.
   */
  href?: string;
}

export interface SidebarProps {
  active?: string;
  onNavigate?: (key: string) => void;
  nav?: NavItem[];
  footerNav?: NavItem[];
  /** Path to the white SpicedAnime badge logo. */
  logoSrc?: string;
  operator?: string;
  operatorRole?: string;
  style?: React.CSSProperties;
}

/** Left navigation rail with logo, active spice indicator, counts, operator identity. */
export function Sidebar(props: SidebarProps): JSX.Element;
