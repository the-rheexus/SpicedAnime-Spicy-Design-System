import * as React from 'react';
import type { IconName } from './Icon';

export interface InputProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconLeft?: IconName;
  type?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  /** Monospace input (for IDs / SKUs / numbers). */
  mono?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

/** Text input with uppercase label, optional leading icon, error/hint. */
export function Input(props: InputProps): JSX.Element;
