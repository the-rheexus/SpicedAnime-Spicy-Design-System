import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * Square checkbox with sharp corners. Supports indeterminate (header select-all).
 */
export function Checkbox({ checked = false, indeterminate = false, onChange, label, disabled = false, style, ...rest }) {
  const on = checked || indeterminate;
  return (
    <label
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-mid)',
        userSelect: 'none', ...style,
      }}
      {...rest}
    >
      <span
        onClick={(e) => { if (disabled) return; e.preventDefault(); onChange && onChange(!checked); }}
        style={{
          width: 18, height: 18, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: on ? 'var(--spice-500)' : 'var(--ink-850)',
          border: `1px solid ${on ? 'var(--spice-500)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--radius-xs)',
          transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
          color: 'var(--text-on-spice)',
        }}
      >
        {indeterminate
          ? <span style={{ width: 9, height: 2, background: 'var(--text-on-spice)' }} />
          : checked ? <Icon name="check" size={13} strokeWidth={3} /> : null}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
