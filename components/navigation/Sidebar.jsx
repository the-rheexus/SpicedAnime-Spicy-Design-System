import React from 'react';
import { Icon } from '../core/Icon.jsx';
const Link = React.forwardRef(function Link({ href, children, ...p }, ref) { return React.createElement('a', { href, ref, ...p }, children); });

const DEFAULT_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: '/' },
  { key: 'batches', label: 'Current Batches', icon: 'layers', badge: 12, href: '/batches' },
  { key: 'attention', label: 'Needs Attention', icon: 'triangle-alert', badge: 3, tone: 'danger', href: '/needs-attention' },
  { key: 'orders', label: 'Orders', icon: 'shopping-cart', href: '/orders' },
  { key: 'artwork', label: 'Artwork Library', icon: 'image', href: '/artwork' },
  { key: 'skus', label: 'SKU Manager', icon: 'tag', href: '/sku-manager' },
  { key: 'packing', label: 'Packing Queue', icon: 'boxes', href: '/packing' },
];
const DEFAULT_FOOTER = [
  { key: 'audit', label: 'Audit Log', icon: 'scroll-text', href: '/audit-log' },
  { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

/**
 * Left navigation rail. Logo header, grouped nav with active spice indicator,
 * optional counts, and a footer (settings/audit + operator identity).
 */
export function Sidebar({
  active = 'dashboard', onNavigate, nav = DEFAULT_NAV, footerNav = DEFAULT_FOOTER,
  logoSrc = 'assets/spicedanime-icon.png', operator = 'Josiah', operatorRole = 'Operator', style, ...rest
}) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)', flex: 'none', height: '100%',
      background: 'var(--surface-rail)', borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', ...style,
    }} {...rest}>
      {/* logo */}
      <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', gap: 11, padding: '0 18px', borderBottom: '1px solid var(--line)' }}>
        <img src={logoSrc} alt="SpicedAnime" width={30} height={30} style={{ display: 'block' }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-hi)' }}>Spiced</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-low)', marginTop: 2 }}>Fulfillment</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        <div style={{ padding: '0 8px 8px', fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Operations</div>
        {nav.map((item) => <NavItem key={item.key} item={item} active={active === item.key} onNavigate={onNavigate} />)}
      </nav>

      {/* footer nav */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)' }}>
        {footerNav.map((item) => <NavItem key={item.key} item={item} active={active === item.key} onNavigate={onNavigate} />)}
      </div>

      {/* operator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
        <span style={{
          width: 32, height: 32, flex: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--spice-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 800, color: 'var(--text-on-spice)',
        }}>{operator.charAt(0)}</span>
        <div style={{ lineHeight: 1.25, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{operator}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-low)' }}>{operatorRole}</div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onNavigate }) {
  const [hover, setHover] = React.useState(false);
  // Primary-nav entries are navigation to another app route, so they render as
  // real links (Next.js Link): left-click navigates in place, and middle-click,
  // Cmd/Ctrl-click and "Open Link in New Tab" all work natively. `onNavigate`
  // is still called for a plain left-click so hosts that track navigation keep
  // working; a legacy caller that passes no `href` falls back to a button.
  const commonStyle = {
    position: 'relative', width: '100%', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', gap: 11,
    height: 40, padding: '0 12px', marginBottom: 2, textAlign: 'left',
    background: active ? 'var(--spice-tint)' : hover ? 'var(--surface-hover)' : 'transparent',
    border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
    color: active ? 'var(--text-hi)' : hover ? 'var(--text-hi)' : 'var(--text-mid)',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
  };
  const hoverHandlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };
  const accentRule = active && <span style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, background: 'var(--spice-500)', borderRadius: '0 2px 2px 0' }} />;

  if (item.href) {
    return (
      <Link href={item.href} aria-current={active ? 'page' : undefined}
        onClick={() => onNavigate && onNavigate(item.key)}
        {...hoverHandlers} style={commonStyle}>
        {accentRule}
        <NavItemBody item={item} active={active} />
      </Link>
    );
  }

  return (
    <button onClick={() => onNavigate && onNavigate(item.key)}
      {...hoverHandlers} style={commonStyle}>
      {accentRule}
      <NavItemBody item={item} active={active} />
    </button>
  );
}

function NavItemBody({ item, active }) {
  return (
    <>
      {/* preserved from the original button body */}
      <Icon name={item.icon} size={18} color={active ? 'var(--spice-400)' : 'currentColor'} />
      <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item.label}</span>
      {item.badge != null && (
        <span style={{
          minWidth: 20, height: 18, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          background: item.tone === 'danger' ? 'var(--tone-danger-bg)' : 'var(--ink-700)',
          color: item.tone === 'danger' ? 'var(--tone-danger)' : 'var(--text-mid)',
          border: `1px solid ${item.tone === 'danger' ? 'var(--tone-danger-line)' : 'var(--line)'}`,
        }}>{item.badge}</span>
      )}
    </>
  );
}
