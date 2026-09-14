import React from 'react';
import { Icon } from './Icon.jsx';

const SIZES = { sm: 30, md: 36, lg: 42 };
const ICON = { sm: 15, md: 17, lg: 19 };

/**
 * Square icon-only button (toolbars, table row actions, top bar).
 */
export function IconButton({
  icon, size = 'md', variant = 'ghost', label, disabled = false,
  active = false, onClick, style, ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const base = variant === 'solid'
    ? { bg: 'var(--surface-control)', bd: 'var(--line-strong)', fg: 'var(--text-hi)' }
    : { bg: 'transparent', bd: 'transparent', fg: 'var(--text-mid)' };
  const bg = disabled ? 'transparent'
    : active ? 'var(--spice-tint)'
    : hover ? 'var(--surface-hover)'
    : base.bg;
  const fg = disabled ? 'var(--text-faint)'
    : active ? 'var(--spice-400)'
    : hover ? 'var(--text-hi)'
    : base.fg;
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: dim, height: dim, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', background: bg, color: fg,
        border: `1px solid ${active ? 'var(--line-spice)' : base.bd}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={ICON[size] || ICON.md} />
    </button>
  );
}
