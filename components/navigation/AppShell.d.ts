import * as React from 'react';
import type { SidebarProps } from './Sidebar';
import type { TopBarProps } from './TopBar';

export interface AppShellProps {
  active?: string;
  onNavigate?: (key: string) => void;
  sidebarProps?: Partial<SidebarProps>;
  topBarProps?: Partial<TopBarProps>;
  /** Fully custom sidebar / top bar nodes (override built-ins). */
  sidebar?: React.ReactNode;
  topBar?: React.ReactNode;
  children?: React.ReactNode;
  /** Constrain content to --content-max and center it. */
  contentMax?: boolean;
  style?: React.CSSProperties;
}

/**
 * Application shell — fixed Sidebar + TopBar + scrolling content.
 * @startingPoint section="Navigation" subtitle="Full app shell (sidebar + top bar + content)" viewport="1280x800"
 */
export function AppShell(props: AppShellProps): JSX.Element;
