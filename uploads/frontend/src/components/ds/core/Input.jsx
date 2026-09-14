import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * Text input with optional uppercase label, leading icon, and error state.
 */
export function Input({
  label, value, defaultValue, placeholder, onChange, iconLeft, type = 'text',
  disabled = false, error, hint, mono = false, fullWidth = true, style, inputStyle, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const id = React.useId();
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
        display: 'flex', alignItems: 'center', gap: 8,
        height: 38, padding: '0 12px',
        background: 'var(--ink-850)',
        border: `1px solid ${error ? 'var(--tone-danger-line)' : focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? '0 0 0 3px var(--spice-tint)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}>
        {iconLeft && <span style={{ color: focus ? 'var(--text-mid)' : 'var(--text-low)', display: 'flex' }}><Icon name={iconLeft} size={16} /></span>}
        <input
          id={id} type={type} value={value} defaultValue={defaultValue}
          placeholder={placeholder} onChange={onChange} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--text-hi)',
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
            fontSize: mono ? 13 : 14, letterSpacing: mono ? '0.02em' : 0,
            ...inputStyle,
          }}
          {...rest}
        />
      </div>
      {(error || hint) && (
        <div style={{
          marginTop: 6, fontFamily: 'var(--font-sans)', fontSize: 12,
          color: error ? 'var(--tone-danger)' : 'var(--text-low)',
        }}>{error || hint}</div>
      )}
    </div>
  );
}
