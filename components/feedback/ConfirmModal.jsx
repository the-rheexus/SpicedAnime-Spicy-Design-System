"use client";

import React, { useEffect, useId, useRef } from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';

const TONE_ICON = { default: 'info', danger: 'octagon-x', warning: 'triangle-alert' };
const TONE_COLOR = { default: 'var(--spice-400)', danger: 'var(--tone-danger)', warning: 'var(--tone-warning)' };

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centered confirmation dialog with scrim. The dialog owns keyboard focus for
 * its lifetime and returns it to the exact opener after close.
 */
export function ConfirmModal({
  open = true, tone = 'default', title, children, confirmLabel = 'Confirm',
  cancelLabel = 'Cancel', onConfirm, onCancel, loading = false,
}) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusInitialAction = () => {
      const cancelAction = dialog?.querySelector('[data-confirm-modal-cancel]');
      // Cancel is always the least destructive enabled action.
      (cancelAction || dialog)?.focus();
    };
    focusInitialAction();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!loading) {
          event.preventDefault();
          onCancel();
        }
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE) || []);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;
  return (
    <div
      onMouseDown={() => { if (!loading) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.66)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'sa-pulse 0s',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? descriptionId : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, background: 'var(--surface-panel)',
          border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-pop)', overflow: 'hidden',
        }}
      >
        <span style={{ display: 'block', height: 3, background: TONE_COLOR[tone] }} />
        <div style={{ padding: '24px 24px 0', display: 'flex', gap: 14 }}>
          <span aria-hidden="true" style={{
            width: 38, height: 38, flex: 'none', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--ink-850)', border: '1px solid var(--line)', color: TONE_COLOR[tone],
          }}>
            <Icon name={TONE_ICON[tone]} size={19} />
          </span>
          <div style={{ paddingTop: 2 }}>
            <h2 id={titleId} style={{
              margin: '0 0 8px', fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 800,
              letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-hi)',
            }}>{title}</h2>
            <div id={descriptionId} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-mid)' }}>{children}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 24, marginTop: 8 }}>
          <Button data-confirm-modal-cancel variant="ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} disabled={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
