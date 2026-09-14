import * as React from 'react';

export interface FilterPill { value: string; label: string; count?: number; }

export interface FilterBarProps {
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: (string | FilterPill)[];
  activeFilter?: string;
  onFilter?: (value: string) => void;
  /** Extra controls (Select, etc). */
  children?: React.ReactNode;
  /** Right-aligned action slot. */
  right?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Toolbar above tables: search + filter pills + right action slot. */
export function FilterBar(props: FilterBarProps): JSX.Element;
