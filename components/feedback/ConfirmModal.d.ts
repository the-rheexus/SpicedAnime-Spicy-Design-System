import * as React from 'react';

export interface ConfirmModalProps {
  open?: boolean;
  tone?: 'default' | 'danger' | 'warning';
  title: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

/** Centered confirmation dialog with scrim, tone rule, and two actions. */
export function ConfirmModal(props: ConfirmModalProps): JSX.Element | null;
