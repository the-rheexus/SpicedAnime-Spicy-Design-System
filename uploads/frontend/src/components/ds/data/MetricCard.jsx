import React from 'react';
import Link from 'next/link';
import { Icon } from '../core/Icon.jsx';

const TREND = {
  up: 'var(--tone-success)', down: 'var(--tone-danger)', flat: 'var(--text-low)',
};

/**
 * KPI / metric tile. Large mono figure, uppercase label, optional delta + icon.
 *
 * Pass `href` for a tile whose whole purpose is navigating to another app route:
 * it renders as a real anchor (Next.js Link) so middle-click, Cmd/Ctrl-click and
 * "Open Link in New Tab" work natively. `onClick` still works for non-navigation
 * tiles.
 */
export function MetricCard({
  label, value, unit, delta, trend = 'flat', icon, accent = false, hint, onClick, href, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick || !!href;
  const Root = href ? Link : 'div';
  const rootProps = href
    ? { href, onClick }
    : { onClick };
  return (
    <Root
      {...rootProps}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: 'var(--surface-card)',
        border: `1px solid ${hover && clickable ? 'var(--line-strong)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)', padding: '20px 22px',
        boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        color: 'inherit', textDecoration: 'none', display: 'block',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color var(--dur-base) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {accent && <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--spice-500)' }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
          letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)',
        }}>{label}</span>
        {icon && <span style={{ color: 'var(--text-faint)', display: 'flex' }}><Icon name={icon} size={17} /></span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700,
          color: 'var(--text-hi)', letterSpacing: '-0.02em', lineHeight: 1,
        }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-low)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{unit}</span>}
      </div>
      {(delta || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          {delta && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: TREND[trend] }}>
              {trend !== 'flat' && <Icon name="arrow-up-right" size={13} style={{ transform: trend === 'down' ? 'rotate(90deg)' : 'none' }} />}
              {delta}
            </span>
          )}
          {hint && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-low)' }}>{hint}</span>}
        </div>
      )}
    </Root>
  );
}
