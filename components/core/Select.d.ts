import * as React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

/** Styled native select with custom chevron. */
export function Select(props: SelectProps): JSX.Element;
