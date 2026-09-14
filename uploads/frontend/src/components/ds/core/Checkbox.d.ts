import * as React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Sharp-cornered checkbox; supports indeterminate for select-all headers. */
export function Checkbox(props: CheckboxProps): JSX.Element;
