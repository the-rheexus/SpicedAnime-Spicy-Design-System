import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * Native-backed select styled to match the system. Uppercase label optional.
 */
export function Select({
  label, value, defaultValue, onChange, options = [], placeholder,
  disabled = false, fullWidth = true, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const id = React.useId();
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', ...style }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', marginBottom: 7, fontFamily: 'var(--font-sans)',
          fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase', color: 'var(--text-low)',
        }}>{label}</label>
      )}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        height: 38,
        background: 'var(--ink-850)',
        border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? '0 0 0 3px var(--spice-tint)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}>
        <select
          id={id} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
            width: '100%', height: '100%', border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--text-hi)',
            fontFamily: 'var(--font-sans)', fontSize: 14, padding: '0 36px 0 12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 11, color: 'var(--text-low)', pointerEvents: 'none', display: 'flex' }}>
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
    </div>
  );
}
