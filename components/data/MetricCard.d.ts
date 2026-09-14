import * as React from 'react';
import type { IconName } from '../core/Icon';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: IconName;
  /** Spice left-rule accent for the hero metric. */
  accent?: boolean;
  hint?: string;
  onClick?: (e: React.MouseEvent) => void;
  /**
   * When set, the whole tile is a real navigation link (Next.js Link) to this
   * route, preserving native new-tab / modifier-click behavior.
   */
  href?: string;
  style?: React.CSSProperties;
}

/**
 * KPI tile — large mono figure, uppercase label, optional delta.
 * @startingPoint section="Data" subtitle="Metric / KPI tiles for the dashboard" viewport="700x180"
 */
export function MetricCard(props: MetricCardProps): JSX.Element;
