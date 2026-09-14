import React from 'react';

/* Resolved against the page, not the server root, so the mark loads from a
   design-system card, a UI kit, or the app itself. Override with `logoSrc`. */
const DEFAULT_LOGO = 'assets/spicedanime-logo-spinner.png';

/**
 * Loading affordance. variant="spinner" for a centered block; variant="skeleton"
 * for content placeholders (shimmer rows). Use skeletons for tables/cards.
 */
export function LoadingState({ variant = 'spinner', label = 'Loading…', rows = 3, logoSrc, style, ...rest }) {
  if (variant === 'skeleton') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }} {...rest}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <SpinningLogo size={18} logoSrc={logoSrc} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)' }}>{label}</span>
        </div>
        {Array.from({ length: rows }).map((_, i) => <Shimmer key={i} width={i % 3 === 0 ? '100%' : i % 3 === 1 ? '78%' : '90%'} />)}
      </div>
    );
  }
  if (variant === 'inline') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-low)', fontFamily: 'var(--font-sans)', fontSize: 13, ...style }} {...rest}>
        <SpinningLogo size={16} logoSrc={logoSrc} /> {label}
      </span>
    );
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '56px 24px', ...style,
    }} {...rest}>
      <SpinningLogo size={36} logoSrc={logoSrc} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)' }}>{label}</span>
    </div>
  );
}

function SpinningLogo({ size, logoSrc }) {
  return (
    <img
      src={logoSrc || DEFAULT_LOGO}
      alt=""
      className="sa-loading-logo"
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none' }}
    />
  );
}

function Shimmer({ width = '100%' }) {
  return (
    <div style={{
      height: 14, width, borderRadius: 'var(--radius-xs)',
      background: 'linear-gradient(90deg, var(--ink-800) 0px, var(--ink-700) 200px, var(--ink-800) 400px)',
      backgroundSize: '800px 100%', animation: 'sa-shimmer 1.3s linear infinite',
    }} />
  );
}
