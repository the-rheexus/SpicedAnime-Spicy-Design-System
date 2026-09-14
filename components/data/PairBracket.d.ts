import * as React from 'react';

export interface PairBracketProps {
  children?: React.ReactNode;
  /**
   * `"pair"` — front/back pairs that move as a unit (LITF/LITB, WALF/WALB).
   * `"shared-source"` — only shares a source artwork file with another
   * component (e.g. TIN), rendered visually distinct so the cases aren't confused.
   */
  variant?: 'pair' | 'shared-source';
  /** Override the label text (defaults: "Pair" / "Shared art"). */
  label?: string;
  style?: React.CSSProperties;
}

/**
 * Left-edge grouping bracket + label for paired / shared-source components
 * (Decision #86). Purely visual — selection stays server-authoritative.
 * @startingPoint section="Data" subtitle="Pair grouping bracket" viewport="480x200"
 */
export function PairBracket(props: PairBracketProps): JSX.Element;
