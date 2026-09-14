import * as React from 'react';

export interface SegmentedSkuProps {
  /** Canonical SKU string — exactly what the copy control writes to the clipboard. */
  sku: string;
  /** Parsed family code from the backend SKU parser (e.g. `offer_sku.family_code`). */
  familyCode?: string | null;
  /** Parsed design code. */
  designCode?: string | null;
  /**
   * Parsed option codes as the backend parser returns them, in canonical
   * segment order (object insertion order): `{color, flame}` for LIT,
   * `{size}` for BAT/TAP/PIL, `{size, color}` for HOD, `{color}` for TOT.
   */
  options?: Record<string, unknown> | null;
  /** Parsed config code (e.g. `SOLO`, `LITTIN`, `WALFB`, `NONE`). */
  configCode?: string | null;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * Canonical SKU rendered as adjacent per-segment chips with a copy control.
 * Does not parse the SKU — callers pass the backend parser's fields.
 * @startingPoint section="Data" subtitle="Segmented SKU chips" viewport="560x120"
 */
export function SegmentedSku(props: SegmentedSkuProps): JSX.Element;
