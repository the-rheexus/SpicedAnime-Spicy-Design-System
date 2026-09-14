import * as React from 'react';
import type { StatusName } from '../core/StatusBadge';

export interface BatchCardProps {
  batchId: string;
  title: string;
  status?: StatusName;
  /** Override the rendered badge text without changing the underlying status value. */
  statusLabel?: string;
  /**
   * Routes the badge through a documented display-label override. Pass
   * `"batches"` on the Current Batches screen so `Locked for Review` renders
   * as "PPT Generated" (Decision #44). See StatusBadge's `context`.
   */
  statusContext?: 'batches' | 'component' | 'reprint';
  /**
   * Aging flag node, rendered beneath the status badge. It is a time signal,
   * not a lifecycle status, so it never replaces the badge (Decisions #75, #87).
   */
  aging?: React.ReactNode;
  units?: number;
  ordersCount?: number;
  printed?: number;
  blocked?: number;
  due?: string;
  primaryLabel?: string;
  onGenerate?: () => void;
  onOpen?: () => void;
  /** Hide the secondary "Open" button, leaving only the primary action. */
  singleAction?: boolean;
  style?: React.CSSProperties;
}

/**
 * Production batch card — core object of the app. Status, unit progress, Generate PPTX.
 * @startingPoint section="Data" subtitle="Production batch card with progress + actions" viewport="700x320"
 */
export function BatchCard(props: BatchCardProps): JSX.Element;
