import * as React from 'react';

export interface SegmentedFilterOption { value: string; label: string; count?: number; }

export interface SegmentedFilterProps {
  options: (string | SegmentedFilterOption)[];
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * Joined, hairline-divided exclusive-choice control. The active option gets a
 * spice tint fill, an inset spice ring, and a check glyph. Reserved for
 * "narrow the view" filters — never for actions, which stay `Button`.
 * @startingPoint section="Core" subtitle="SegmentedFilter — exclusive filter choice" viewport="480x80"
 */
export function SegmentedFilter(props: SegmentedFilterProps): JSX.Element;
