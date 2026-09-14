import React from 'react';
import Link from 'next/link';

if (typeof document !== 'undefined' && !document.getElementById('sa-keyframes')) {
  const el = document.createElement('style');
  el.id = 'sa-keyframes';
  el.textContent = '@keyframes sa-spin{to{transform:rotate(360deg)}}@keyframes sa-pulse{0%,100%{opacity:.35}50%{opacity:1}}@keyframes sa-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}';
  document.head.appendChild(el);
}

const SIZES = {
  sm: { height: 30, padding: '0 12px', font: 11 },
  md: { height: 38, padding: '0 16px', font: 12 },
  lg: { height: 46, padding: '0 22px', font: 13 },
};

const VARIANTS = {
  primary: {
    background: 'var(--spice-500)', color: 'var(--text-on-spice)',
    border: '1px solid var(--spice-500)',
    '--hover-bg': 'var(--spice-600)', '--press-bg': 'var(--spice-700)',
  },
  secondary: {
    background: 'var(--surface-control)', color: 'var(--text-hi)',
    border: '1px solid var(--line-strong)',
    '--hover-bg': 'var(--ink-600)', '--press-bg': 'var(--ink-650)',
  },
  ghost: {
    background: 'transparent', color: 'var(--text-mid)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--surface-hover)', '--press-bg': 'var(--ink-700)',
  },
  outline: {
    background: 'transparent', color: 'var(--text-hi)',
    border: '1px solid var(--line-strong)',
    '--hover-bg': 'var(--surface-hover)', '--press-bg': 'var(--ink-700)',
  },
  danger: {
    background: 'var(--tone-danger-bg)', color: 'var(--tone-danger)',
    border: '1px solid var(--tone-danger-line)',
    '--hover-bg': 'rgba(255,82,71,0.2)', '--press-bg': 'rgba(255,82,71,0.28)',
  },
};

/**
 * Primary action button for the fulfillment UI. Uppercase, tracked label.
 */
export function Button({
  children, variant = 'secondary', size = 'md',
  iconLeft, iconRight, fullWidth = false, disabled = false, loading = false,
  onClick, type = 'button', href, style, ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.secondary;
  const [state, setState] = React.useState('idle');
  const bg = disabled ? 'var(--ink-700)'
    : state === 'press' ? v['--press-bg']
    : state === 'hover' ? v['--hover-bg']
    : v.background;

  const visualStyle = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    height: s.height, padding: s.padding,
    fontFamily: 'var(--font-sans)', fontSize: s.font,
    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    background: bg,
    color: disabled ? 'var(--text-faint)' : v.color,
    border: disabled ? '1px solid var(--line)' : v.border,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transform: state === 'press' && !disabled ? 'translateY(1px)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
    opacity: loading ? 0.7 : 1,
    ...style,
  };

  const hoverHandlers = {
    onMouseEnter: () => setState('hover'),
    onMouseLeave: () => setState('idle'),
    onMouseDown: () => setState('press'),
    onMouseUp: () => setState('hover'),
  };

  const inner = (
    <>
      {loading && <Spinner />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );

  // When `href` is set the control is navigation, not an action: render a real
  // anchor (Next.js Link) so left-click, middle-click, Cmd/Ctrl-click, and the
  // browser "Open Link in New Tab" context menu all work natively. Styling and
  // focus behavior are unchanged. A disabled navigation button falls back to a
  // non-interactive <button> so it cannot be followed.
  if (href && !disabled && !loading) {
    return (
      <Link
        href={href}
        onClick={onClick}
        {...hoverHandlers}
        style={{ ...visualStyle, textDecoration: 'none' }}
        {...rest}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      {...hoverHandlers}
      style={visualStyle}
      {...rest}
    >
      {inner}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 13, height: 13, borderRadius: '50%',
      border: '2px solid currentColor', borderTopColor: 'transparent',
      display: 'inline-block', animation: 'sa-spin 0.7s linear infinite',
    }} />
  );
}
