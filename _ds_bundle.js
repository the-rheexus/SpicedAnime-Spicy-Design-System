/* @ds-bundle: {"format":4,"namespace":"SpicedAnimeSpicyDesignSystem_daab0d","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"SegmentedFilter","sourcePath":"components/core/SegmentedFilter.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"TONE_ICON","sourcePath":"components/core/StatusBadge.jsx"},{"name":"STATUS_MAP","sourcePath":"components/core/StatusBadge.jsx"},{"name":"DISPLAY_LABEL","sourcePath":"components/core/StatusBadge.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"BatchCard","sourcePath":"components/data/BatchCard.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"FilterBar","sourcePath":"components/data/FilterBar.jsx"},{"name":"MetricCard","sourcePath":"components/data/MetricCard.jsx"},{"name":"PairBracket","sourcePath":"components/data/PairBracket.jsx"},{"name":"SegmentedSku","sourcePath":"components/data/SegmentedSku.jsx"},{"name":"AGING_THRESHOLD_DAYS","sourcePath":"components/feedback/AgingFlag.jsx"},{"name":"AgingFlag","sourcePath":"components/feedback/AgingFlag.jsx"},{"name":"ConfirmModal","sourcePath":"components/feedback/ConfirmModal.jsx"},{"name":"DeferredPanel","sourcePath":"components/feedback/DeferredPanel.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"ErrorAlert","sourcePath":"components/feedback/ErrorAlert.jsx"},{"name":"LoadingState","sourcePath":"components/feedback/LoadingState.jsx"},{"name":"AppShell","sourcePath":"components/navigation/AppShell.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"95d1fce616dc","components/core/Button.jsx":"5dd3cb2d9a1d","components/core/Card.jsx":"2e36037fabc8","components/core/Checkbox.jsx":"9306dacc91ca","components/core/Icon.jsx":"259b626c20fc","components/core/IconButton.jsx":"3bc41277a110","components/core/Input.jsx":"8ffd4966da05","components/core/SegmentedFilter.jsx":"64081ea1ba32","components/core/Select.jsx":"731da159bab0","components/core/StatusBadge.jsx":"be92c541840f","components/data/BatchCard.jsx":"284655f09cae","components/data/DataTable.jsx":"d44f8011b9cc","components/data/FilterBar.jsx":"133aabc67863","components/data/MetricCard.jsx":"4d8036dffc89","components/data/PairBracket.jsx":"2f0fb79368b8","components/data/SegmentedSku.jsx":"9d65fc8859ef","components/feedback/AgingFlag.jsx":"e9ed1146b074","components/feedback/ConfirmModal.jsx":"5e7ea2e6e0cc","components/feedback/DeferredPanel.jsx":"11a33ce4d4db","components/feedback/EmptyState.jsx":"f0fa3fc870ab","components/feedback/ErrorAlert.jsx":"a7854e144dca","components/feedback/LoadingState.jsx":"2128205b73a8","components/navigation/AppShell.jsx":"4677492c99e4","components/navigation/Sidebar.jsx":"feee2b8bdab3","components/navigation/TopBar.jsx":"49939146ad69","ui_kits/fulfillment-app/ArtworkLibrary.jsx":"9508678886d6","ui_kits/fulfillment-app/ArtworkLibrary.standalone.jsx":"af92c2e2da6a","ui_kits/fulfillment-app/BatchDetail.jsx":"58b88f1c97f4","ui_kits/fulfillment-app/Dashboard.jsx":"068e3a0cb462","ui_kits/fulfillment-app/EventPrints.jsx":"452b1301b63e","ui_kits/fulfillment-app/NeedsAttention.jsx":"00d5f689100c","ui_kits/fulfillment-app/OrderDetail.jsx":"9b3fa8584c95","ui_kits/fulfillment-app/OrderDetail.standalone.jsx":"f072bbaa34f2","ui_kits/fulfillment-app/Orders.jsx":"d2b90fa9f45d","ui_kits/fulfillment-app/Sandbox.jsx":"6d956df239ea","ui_kits/fulfillment-app/shared.jsx":"a34a8d4391a8"},"inlinedExternals":[],"unexposedExports":[{"name":"calendarDaysSince","sourcePath":"components/feedback/AgingFlag.jsx"},{"name":"isAging","sourcePath":"components/feedback/AgingFlag.jsx"}]} */

(() => {

const __ds_ns = (window.SpicedAnimeSpicyDesignSystem_daab0d = window.SpicedAnimeSpicyDesignSystem_daab0d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  /* neutral maps to the shared --tone-neutral tokens (Decision #74 / P95 B1)
     so a plain neutral Badge and a StatusBadge neutral pill read identically. */
  neutral: {
    fg: 'var(--tone-neutral)',
    bg: 'var(--tone-neutral-bg)',
    bd: 'var(--tone-neutral-line)'
  },
  spice: {
    fg: 'var(--spice-400)',
    bg: 'var(--spice-tint)',
    bd: 'var(--line-spice)'
  },
  info: {
    fg: 'var(--tone-info)',
    bg: 'var(--tone-info-bg)',
    bd: 'var(--tone-info-line)'
  },
  success: {
    fg: 'var(--tone-success)',
    bg: 'var(--tone-success-bg)',
    bd: 'var(--tone-success-line)'
  },
  warning: {
    fg: 'var(--tone-warning)',
    bg: 'var(--tone-warning-bg)',
    bd: 'var(--tone-warning-line)'
  },
  danger: {
    fg: 'var(--tone-danger)',
    bg: 'var(--tone-danger-bg)',
    bd: 'var(--tone-danger-line)'
  }
};

/**
 * Small generic label/count chip. For workflow statuses use StatusBadge instead.
 */
function Badge({
  children,
  tone = 'neutral',
  solid = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 20,
      padding: '0 8px',
      background: solid ? t.fg : t.bg,
      color: solid ? 'var(--ink-900)' : t.fg,
      border: solid ? '1px solid transparent' : `1px solid ${t.bd}`,
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Link = React.forwardRef(function Link({
  href,
  children,
  ...p
}, ref) {
  return React.createElement('a', {
    href,
    ref,
    ...p
  }, children);
});
if (typeof document !== 'undefined' && !document.getElementById('sa-keyframes')) {
  const el = document.createElement('style');
  el.id = 'sa-keyframes';
  el.textContent = '@keyframes sa-spin{to{transform:rotate(360deg)}}@keyframes sa-pulse{0%,100%{opacity:.35}50%{opacity:1}}@keyframes sa-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}';
  document.head.appendChild(el);
}
const SIZES = {
  sm: {
    height: 30,
    padding: '0 12px',
    font: 11
  },
  md: {
    height: 38,
    padding: '0 16px',
    font: 12
  },
  lg: {
    height: 46,
    padding: '0 22px',
    font: 13
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--spice-500)',
    color: 'var(--text-on-spice)',
    border: '1px solid var(--spice-500)',
    '--hover-bg': 'var(--spice-600)',
    '--press-bg': 'var(--spice-700)'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-hi)',
    border: '1px solid var(--line-strong)',
    '--hover-bg': 'var(--surface-hover)',
    '--press-bg': 'var(--ink-700)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-mid)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--surface-hover)',
    '--press-bg': 'var(--ink-700)'
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-mid)',
    border: '1px solid var(--line)',
    '--hover-bg': 'var(--surface-hover)',
    '--press-bg': 'var(--ink-700)'
  },
  danger: {
    background: 'var(--tone-danger-bg)',
    color: 'var(--tone-danger)',
    border: '1px solid var(--tone-danger-line)',
    '--hover-bg': 'rgba(255,82,71,0.2)',
    '--press-bg': 'rgba(255,82,71,0.28)'
  }
};

/**
 * Primary action button for the fulfillment UI. Uppercase, tracked label.
 */
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  href,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.secondary;
  const [state, setState] = React.useState('idle');
  const bg = disabled ? 'var(--ink-700)' : state === 'press' ? v['--press-bg'] : state === 'hover' ? v['--hover-bg'] : v.background;
  const visualStyle = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.height,
    padding: s.padding,
    fontFamily: 'var(--font-sans)',
    fontSize: s.font,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    background: bg,
    color: disabled ? 'var(--text-faint)' : v.color,
    border: disabled ? '1px solid var(--line)' : v.border,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transform: state === 'press' && !disabled ? 'translateY(1px)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
    opacity: loading ? 0.7 : 1,
    ...style
  };
  const hoverHandlers = {
    onMouseEnter: () => setState('hover'),
    onMouseLeave: () => setState('idle'),
    onMouseDown: () => setState('press'),
    onMouseUp: () => setState('hover')
  };
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children, !loading && iconRight);

  // When `href` is set the control is navigation, not an action: render a real
  // anchor (Next.js Link) so left-click, middle-click, Cmd/Ctrl-click, and the
  // browser "Open Link in New Tab" context menu all work natively. Styling and
  // focus behavior are unchanged. A disabled navigation button falls back to a
  // non-interactive <button> so it cannot be followed.
  if (href && !disabled && !loading) {
    return /*#__PURE__*/React.createElement(Link, _extends({
      href: href,
      onClick: onClick
    }, hoverHandlers, {
      style: {
        ...visualStyle,
        textDecoration: 'none'
      }
    }, rest), inner);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    onClick: onClick
  }, hoverHandlers, {
    style: visualStyle
  }, rest), inner);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13,
      height: 13,
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'sa-spin 0.7s linear infinite'
    }
  });
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Generic surface card. Hairline border carries elevation; optional header row
 * with eyebrow label + action slot, optional spice top-rule accent.
 */
function Card({
  children,
  title,
  eyebrow,
  action,
  accent = false,
  padding = 24,
  interactive = false,
  onClick,
  style,
  bodyStyle,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      transition: 'border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out)',
      ...(interactive && hover ? {
        borderColor: 'var(--line-strong)',
        background: 'var(--surface-raised)'
      } : null),
      cursor: interactive ? 'pointer' : 'default',
      overflow: 'hidden',
      ...style
    }
  }, rest), accent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: 'var(--spice-500)'
    }
  }), (title || eyebrow || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      padding: `${padding}px ${padding}px 0`
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)',
      marginBottom: title ? 6 : 0
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)'
    }
  }, title)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Curated Lucide (ISC-licensed) icon paths used across the SpicedAnime fulfillment UI.
   Stroke icons, 24x24 viewBox, currentColor. Add more as needed. */
const PATHS = {
  // nav
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'shopping-cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'scroll-text': '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  // status — the six Decision #85 tone icons: circle / circle-dashed /
  // circle-check / triangle-alert / octagon-x / minus (one fixed icon per tone).
  circle: '<circle cx="12" cy="12" r="10"/>',
  'circle-dashed': '<path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/>',
  minus: '<path d="M5 12h14"/>',
  'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  loader: '<line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'octagon-x': '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  // actions / ui
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevrons-up-down': '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  'file-output': '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 7V4a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2h-3"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
};

/**
 * Inline SVG icon (Lucide set). Inherits color via currentColor.
 */
function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  color = 'currentColor',
  style,
  spin = false,
  ...rest
}) {
  const body = PATHS[name];
  if (!body) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    "data-icon": name,
    style: {
      flex: 'none',
      display: 'block',
      animation: spin ? 'sa-spin 0.9s linear infinite' : undefined,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: body
    }
  }, rest));
}
const ICON_NAMES = Object.keys(PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Square checkbox with sharp corners. Supports indeterminate (header select-all).
 */
function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
  style,
  ...rest
}) {
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-mid)',
      userSelect: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      if (disabled) return;
      e.preventDefault();
      onChange && onChange(!checked);
    },
    style: {
      width: 18,
      height: 18,
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: on ? 'var(--spice-500)' : 'var(--ink-850)',
      border: `1px solid ${on ? 'var(--spice-500)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-xs)',
      transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      color: 'var(--text-on-spice)'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 2,
      background: 'var(--text-on-spice)'
    }
  }) : checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 3
  }) : null), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 30,
  md: 36,
  lg: 42
};
const ICON = {
  sm: 15,
  md: 17,
  lg: 19
};

/**
 * Square icon-only button (toolbars, table row actions, top bar).
 */
function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  label,
  disabled = false,
  active = false,
  onClick,
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const base = variant === 'solid' ? {
    bg: 'var(--surface-control)',
    bd: 'var(--line-strong)',
    fg: 'var(--text-hi)'
  } : {
    bg: 'transparent',
    bd: 'transparent',
    fg: 'var(--text-mid)'
  };
  const bg = disabled ? 'transparent' : active ? 'var(--spice-tint)' : hover ? 'var(--surface-hover)' : base.bg;
  const fg = disabled ? 'var(--text-faint)' : active ? 'var(--spice-400)' : hover ? 'var(--text-hi)' : base.fg;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dim,
      height: dim,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      color: fg,
      border: `1px solid ${active ? 'var(--line-spice)' : base.bd}`,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: ICON[size] || ICON.md
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with optional uppercase label, leading icon, and error state.
 */
function Input({
  label,
  value,
  defaultValue,
  placeholder,
  onChange,
  iconLeft,
  type = 'text',
  disabled = false,
  error,
  hint,
  mono = false,
  fullWidth = true,
  style,
  inputStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const id = React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'block',
      marginBottom: 7,
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 38,
      padding: '0 12px',
      background: 'var(--ink-850)',
      border: `1px solid ${error ? 'var(--tone-danger-line)' : focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? '0 0 0 3px var(--spice-tint)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.5 : 1
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      color: focus ? 'var(--text-mid)' : 'var(--text-low)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 16
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-hi)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: mono ? 13 : 14,
      letterSpacing: mono ? '0.02em' : 0,
      ...inputStyle
    }
  }, rest))), (error || hint) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: error ? 'var(--tone-danger)' : 'var(--text-low)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedFilter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const HEIGHTS = {
  sm: 30,
  md: 36
};

/**
 * Exclusive-choice filter control (e.g. SKU status: All / Has SKU / No SKU).
 * One joined, hairline-divided group — visually distinct from `Button`
 * (which is always a standalone, individually-bordered action). Use this for
 * "narrow what I'm looking at" choices; use `Button` for "do something".
 */
function SegmentedFilter({
  options = [],
  value,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  const h = HEIGHTS[size] || HEIGHTS.md;
  const [hoverVal, setHoverVal] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "radiogroup",
    style: {
      display: 'inline-flex',
      height: h,
      border: '1px solid var(--line-strong)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      ...style
    }
  }, rest), options.map((opt, i) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const lbl = typeof opt === 'string' ? opt : opt.label;
    const count = typeof opt === 'object' ? opt.count : undefined;
    const active = value === val;
    const hovering = !active && hoverVal === val;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      role: "radio",
      "aria-checked": active,
      onClick: () => onChange && onChange(val),
      onMouseEnter: () => setHoverVal(val),
      onMouseLeave: () => setHoverVal(null),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: '100%',
        padding: '0 14px',
        background: active ? 'var(--spice-tint)' : hovering ? 'var(--surface-hover)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px var(--line-spice)' : 'none',
        border: 'none',
        borderRight: i < options.length - 1 ? '1px solid var(--line-strong)' : 'none',
        color: active ? 'var(--spice-400)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, active && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13
    }), lbl, count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 500,
        color: active ? 'var(--spice-400)' : 'var(--text-low)'
      }
    }, count));
  }));
}
Object.assign(__ds_scope, { SegmentedFilter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedFilter.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Native-backed select styled to match the system. Uppercase label optional.
 */
function Select({
  label,
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  fullWidth = true,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const id = React.useId();
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'block',
      marginBottom: 7,
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: 38,
      background: 'var(--ink-850)',
      border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? '0 0 0 3px var(--spice-tint)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      padding: '0 36px 0 12px',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), opts.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 11,
      color: 'var(--text-low)',
      pointerEvents: 'none',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* One fixed icon per tone (Decision #85). The icon is determined by the tone,
   never by the individual status, so a future status added to a tone inherits
   that tone's icon automatically. The `clock` icon (aging indicator) is the
   single documented exception and is NOT a status — see AgingIndicator. */
const TONE_ICON = {
  info: 'circle',
  progress: 'circle-dashed',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'octagon-x',
  neutral: 'minus'
};

/* Canonical status → tone. Colour is ALWAYS paired with the tone icon + label.
   No per-status icon: `Printed` and `Fulfilled Externally` both sit in `success`
   and therefore share `circle-check`; that is intentional, not a special case. */
const STATUS_MAP = {
  'Open': {
    tone: 'info'
  },
  'Queued': {
    tone: 'info'
  },
  'Queued for Production': {
    tone: 'info'
  },
  'In Production': {
    tone: 'progress'
  },
  'In Production (Needs Reprint)': {
    tone: 'warning'
  },
  'Being Packaged': {
    tone: 'progress'
  },
  'Locked for Review': {
    tone: 'warning'
  },
  'Reprint Needed': {
    tone: 'warning'
  },
  'Printed': {
    tone: 'success'
  },
  'Shipped': {
    tone: 'success'
  },
  'Ready': {
    tone: 'success'
  },
  'Available': {
    tone: 'success'
  },
  'Blocked': {
    tone: 'danger'
  },
  'Missing': {
    tone: 'danger'
  },
  /* Terminal order states reconciled from Shopify (P69). */
  'Fulfilled Externally': {
    tone: 'success'
  },
  'Canceled': {
    tone: 'neutral'
  },
  'Archived': {
    tone: 'neutral'
  },
  'Retired': {
    tone: 'neutral'
  },
  'Deferred MVP': {
    tone: 'neutral'
  },
  'Pending': {
    tone: 'info'
  },
  'Success': {
    tone: 'success'
  },
  'Failed': {
    tone: 'danger'
  }
};

/* Display-label overrides. The stored enum NEVER changes; only what the
   operator reads changes, and only in the specific context the decision names.
   Pass `context` to opt in — the default renders the raw canonical string.

     batches   Current Batches only: `Locked for Review` reads "PPT Generated"
               (Decision #44). Batch Detail, Dashboard and every Status Guide
               keep the raw string.
     component Component lists on Order Detail / Batch Detail: a component whose
               stored status is `Canceled` reads "Print Not Needed"
               (Decision #64). Order-level `Canceled` still reads "Canceled".
     reprint   A reprint whose replacement is not yet batched reads
               "Awaiting batch" (Decision #88a) — `Open` is reserved for
               batch status and is never used for a reprint. */
const DISPLAY_LABEL = {
  batches: {
    'Locked for Review': 'PPT Generated'
  },
  component: {
    'Canceled': 'Print Not Needed'
  },
  reprint: {
    'Open': 'Awaiting batch'
  }
};
const TONE = {
  info: {
    fg: 'var(--tone-info)',
    bg: 'var(--tone-info-bg)',
    bd: 'var(--tone-info-line)'
  },
  progress: {
    fg: 'var(--tone-progress)',
    bg: 'var(--tone-progress-bg)',
    bd: 'var(--tone-progress-line)'
  },
  success: {
    fg: 'var(--tone-success)',
    bg: 'var(--tone-success-bg)',
    bd: 'var(--tone-success-line)'
  },
  warning: {
    fg: 'var(--tone-warning)',
    bg: 'var(--tone-warning-bg)',
    bd: 'var(--tone-warning-line)'
  },
  danger: {
    fg: 'var(--tone-danger)',
    bg: 'var(--tone-danger-bg)',
    bd: 'var(--tone-danger-line)'
  },
  neutral: {
    fg: 'var(--tone-neutral)',
    bg: 'var(--tone-neutral-bg)',
    bd: 'var(--tone-neutral-line)'
  }
};
const SIZES = {
  sm: {
    h: 20,
    px: 7,
    fs: 10,
    icon: 11,
    gap: 4
  },
  md: {
    h: 24,
    px: 9,
    fs: 11,
    icon: 13,
    gap: 5
  },
  lg: {
    h: 30,
    px: 12,
    fs: 12,
    icon: 15,
    gap: 6
  }
};

/**
 * Color-coded status pill. Icon + label always shown together (never color alone).
 * The icon comes from the status's tone (Decision #85), not the status itself.
 */
function StatusBadge({
  status,
  label,
  context,
  size = 'md',
  dot = false,
  style,
  ...rest
}) {
  const meta = STATUS_MAP[status] || {
    tone: 'neutral'
  };
  const override = context && DISPLAY_LABEL[context] && DISPLAY_LABEL[context][status];
  const t = TONE[meta.tone] || TONE.neutral;
  const icon = TONE_ICON[meta.tone] || TONE_ICON.neutral;
  const s = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      height: s.h,
      padding: `0 ${s.px}px`,
      background: t.bg,
      color: t.fg,
      border: `1px solid ${t.bd}`,
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fs,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: s.icon - 6,
      height: s.icon - 6,
      borderRadius: '50%',
      background: t.fg,
      flex: 'none'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon,
    strokeWidth: 2.25
  }), label || override || status);
}
Object.assign(__ds_scope, { TONE_ICON, STATUS_MAP, DISPLAY_LABEL, StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/BatchCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Production batch card — the core object of the fulfillment app. Shows batch ID,
 * title, status, unit progress, key meta, and a primary action (Generate PPTX).
 */
function BatchCard({
  batchId,
  title,
  status = 'Open',
  statusLabel,
  statusContext,
  aging,
  units = 0,
  ordersCount,
  printed = 0,
  blocked = 0,
  due,
  onGenerate,
  onOpen,
  primaryLabel = 'Generate PPTX',
  singleAction = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pct = units ? Math.round(printed / units * 100) : 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: `1px solid ${hover ? 'var(--line-strong)' : 'var(--line)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      transition: 'border-color var(--dur-base) var(--ease-out)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--spice-400)',
      letterSpacing: '0.04em'
    }
  }, batchId), blocked > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--tone-danger)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "octagon-x",
    size: 12
  }), blocked)), /*#__PURE__*/React.createElement("h3", {
    onClick: onOpen,
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)',
      cursor: onOpen ? 'pointer' : 'default',
      lineHeight: 1.25
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'flex-end',
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status,
    label: statusLabel,
    context: statusContext
  }), aging)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, "Printed"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-mid)'
    }
  }, printed, " / ", units, " units")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--ink-850)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden',
      border: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      background: pct === 100 ? 'var(--tone-success)' : 'var(--spice-500)',
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      padding: '0 20px 18px',
      flexWrap: 'wrap'
    }
  }, ordersCount != null && /*#__PURE__*/React.createElement(Meta, {
    icon: "shopping-cart",
    label: "Orders",
    value: ordersCount
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: "boxes",
    label: "Units",
    value: units
  }), due && /*#__PURE__*/React.createElement(Meta, {
    icon: "clock",
    label: "Due",
    value: due
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      borderTop: '1px solid var(--line)',
      padding: 14,
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "md",
    fullWidth: true,
    onClick: onGenerate,
    iconLeft: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "file-output",
      size: 15
    })
  }, primaryLabel), !singleAction && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "md",
    onClick: onOpen
  }, "Open")));
}
function Meta({
  icon,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-hi)'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label)));
}
Object.assign(__ds_scope, { BatchCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BatchCard.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Operational data table. Columns config with optional custom render, sortable
 * headers, row hover, optional selection. Mono is used for numeric/ID columns.
 */
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  selectable = false,
  selected = [],
  onSelect,
  onRowClick,
  sortKey,
  sortDir = 'asc',
  onSort,
  emptyLabel = 'No rows',
  style,
  virtualize = false,
  virtualThreshold = 80,
  virtualRowHeight = 52,
  virtualOverscan = 6,
  scrollHeight = 576,
  renderExpandedRow,
  expandedRowKeys = [],
  selectableRowKeys,
  ...rest
}) {
  const [hoverRow, setHoverRow] = React.useState(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollRef = React.useRef(null);
  /* When `selectableRowKeys` is supplied, only those rows get a checkbox and
     the header checkbox reflects/toggles just them — rows that are not eligible
     for the bulk action (e.g. an order with no printed items to reprint) are
     never counted in the all/indeterminate state. */
  const eligible = selectableRowKeys ? rows.filter(r => selectableRowKeys.includes(r[rowKey])).map(r => r[rowKey]) : rows.map(r => r[rowKey]);
  const selectedEligible = selected.filter(k => eligible.includes(k));
  const allSel = selectable && eligible.length > 0 && selectedEligible.length === eligible.length;
  const someSel = selectable && selectedEligible.length > 0 && !allSel;
  const shouldVirtualize = virtualize && rows.length >= virtualThreshold;
  const rowSignature = rows.map((row, index) => row[rowKey] ?? index).join(',');
  const visibleRowCount = Math.ceil(scrollHeight / virtualRowHeight);
  const firstVisibleIndex = Math.floor(scrollTop / virtualRowHeight);
  const windowStart = shouldVirtualize ? Math.max(0, firstVisibleIndex - virtualOverscan) : 0;
  const windowEnd = shouldVirtualize ? Math.min(rows.length, firstVisibleIndex + visibleRowCount + virtualOverscan) : rows.length;
  const renderedRows = rows.slice(windowStart, windowEnd);
  const expandable = typeof renderExpandedRow === 'function';
  const expandedKeySet = new Set(expandedRowKeys);
  const totalColSpan = columns.length + (selectable ? 1 : 0);
  const topSpacerHeight = windowStart * virtualRowHeight;
  const bottomSpacerHeight = (rows.length - windowEnd) * virtualRowHeight;
  React.useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [rowSignature]);
  const toggleAll = () => onSelect && onSelect(allSel ? [] : eligible);
  const toggleRow = k => {
    if (!onSelect) return;
    onSelect(selected.includes(k) ? selected.filter(x => x !== k) : [...selected, k]);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: 'var(--surface-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    "data-testid": shouldVirtualize ? 'virtualized-data-table-scroll' : undefined,
    onScroll: event => setScrollTop(event.currentTarget.scrollTop),
    style: shouldVirtualize ? {
      maxHeight: scrollHeight,
      overflowY: 'auto'
    } : undefined
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--ink-850)'
    }
  }, selectable && /*#__PURE__*/React.createElement("th", {
    style: {
      ...stickyThStyle,
      width: 44,
      paddingRight: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: allSel,
    indeterminate: someSel,
    onChange: toggleAll
  })), columns.map(c => {
    const active = sortKey === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      style: {
        ...(shouldVirtualize ? stickyThStyle : thStyle),
        textAlign: c.align || 'left',
        cursor: c.sortable ? 'pointer' : 'default',
        width: c.width
      },
      onClick: () => c.sortable && onSort && onSort(c.key)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start',
        color: active ? 'var(--text-mid)' : undefined
      }
    }, c.header, c.sortable && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: active ? 'chevron-down' : 'chevrons-up-down',
      size: 12,
      style: {
        opacity: active ? 1 : 0.4,
        transform: active && sortDir === 'asc' ? 'rotate(180deg)' : 'none'
      }
    })));
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-low)',
      fontSize: 13
    }
  }, emptyLabel)), shouldVirtualize && topSpacerHeight > 0 && /*#__PURE__*/React.createElement("tr", {
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: spacerStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: topSpacerHeight
    }
  }))), renderedRows.map((row, i) => {
    const k = row[rowKey] ?? windowStart + i;
    const isSel = selected.includes(k);
    const isExpanded = expandable && expandedKeySet.has(k);
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: k
    }, /*#__PURE__*/React.createElement("tr", {
      onMouseEnter: () => setHoverRow(k),
      onMouseLeave: () => setHoverRow(null),
      onClick: () => onRowClick && onRowClick(row),
      style: {
        background: isSel ? 'var(--spice-tint)' : hoverRow === k ? 'var(--surface-hover)' : 'transparent',
        borderTop: '1px solid var(--line)',
        cursor: onRowClick ? 'pointer' : 'default',
        height: shouldVirtualize ? virtualRowHeight : undefined,
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, selectable && /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdStyle,
        width: 44,
        paddingRight: 0
      },
      onClick: e => {
        e.stopPropagation();
        if (eligible.includes(k)) toggleRow(k);
      }
    }, eligible.includes(k) && /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
      checked: isSel,
      onChange: () => toggleRow(k)
    })), columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        ...tdStyle,
        textAlign: c.align || 'left',
        fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
        color: c.mono ? 'var(--text-hi)' : 'var(--text-mid)',
        fontSize: c.mono ? 13 : 14
      }
    }, c.render ? c.render(row[c.key], row) : row[c.key]))), isExpanded && /*#__PURE__*/React.createElement("tr", {
      "data-testid": "data-table-expanded-row",
      style: {
        background: 'var(--surface-panel)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: totalColSpan,
      style: {
        padding: 0,
        borderTop: '1px solid var(--line)'
      }
    }, renderExpandedRow(row))));
  }), shouldVirtualize && bottomSpacerHeight > 0 && /*#__PURE__*/React.createElement("tr", {
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: spacerStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: bottomSpacerHeight
    }
  })))))));
}
const thStyle = {
  padding: '13px 18px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
  color: 'var(--text-low)',
  whiteSpace: 'nowrap',
  userSelect: 'none'
};
const stickyThStyle = {
  ...thStyle,
  background: 'var(--ink-850)',
  borderBottom: '1px solid var(--line)',
  position: 'sticky',
  top: 0,
  zIndex: 1
};
const tdStyle = {
  padding: '13px 18px',
  verticalAlign: 'middle'
};
const spacerStyle = {
  border: 0,
  height: 0,
  padding: 0
};
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/FilterBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toolbar row above tables/grids: search field, an exclusive-choice
 * `SegmentedFilter`, and a right-aligned action slot. Composes layout only —
 * drop Select/Button/Badge children in. Filters and actions are deliberately
 * different shapes (joined segmented group vs. standalone Button) so an
 * operator can tell "narrows the view" apart from "does something" at a
 * glance, not just by size.
 */
function FilterBar({
  searchValue,
  onSearch,
  searchPlaceholder = 'Search…',
  filters = [],
  activeFilter,
  onFilter,
  onClear,
  children,
  right,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [clearHover, setClearHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      padding: '14px 16px',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }, rest), onSearch !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 36,
      padding: '0 12px',
      background: 'var(--ink-850)',
      minWidth: 220,
      flex: '0 1 280px',
      border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 16,
    style: {
      color: 'var(--text-low)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: searchValue,
    placeholder: searchPlaceholder,
    onChange: e => onSearch && onSearch(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14
    }
  })), filters.length > 0 && /*#__PURE__*/React.createElement(__ds_scope.SegmentedFilter, {
    options: filters,
    value: activeFilter,
    onChange: onFilter
  }), children, onClear && /*#__PURE__*/React.createElement("button", {
    onClick: onClear,
    onMouseEnter: () => setClearHover(true),
    onMouseLeave: () => setClearHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 36,
      padding: '0 12px',
      background: clearHover ? 'var(--surface-hover)' : 'transparent',
      border: '1px solid transparent',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: clearHover ? 'var(--text-hi)' : 'var(--text-low)',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      transition: 'all var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13
  }), "Clear"), right && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, right));
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Link = React.forwardRef(function Link({
  href,
  children,
  ...p
}, ref) {
  return React.createElement('a', {
    href,
    ref,
    ...p
  }, children);
});
const TREND = {
  up: 'var(--tone-success)',
  down: 'var(--tone-danger)',
  flat: 'var(--text-low)'
};

/**
 * KPI / metric tile. Large mono figure, uppercase label, optional delta + icon.
 *
 * Pass `href` for a tile whose whole purpose is navigating to another app route:
 * it renders as a real anchor (Next.js Link) so middle-click, Cmd/Ctrl-click and
 * "Open Link in New Tab" work natively. `onClick` still works for non-navigation
 * tiles.
 */
function MetricCard({
  label,
  value,
  unit,
  delta,
  trend = 'flat',
  icon,
  accent = false,
  hint,
  onClick,
  href,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick || !!href;
  const Root = href ? Link : 'div';
  const rootProps = href ? {
    href,
    onClick
  } : {
    onClick
  };
  return /*#__PURE__*/React.createElement(Root, _extends({}, rootProps, {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: `1px solid ${hover && clickable ? 'var(--line-strong)' : 'var(--line)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      color: 'inherit',
      textDecoration: 'none',
      display: 'block',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'border-color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), accent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 3,
      background: 'var(--spice-500)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 36,
      fontWeight: 700,
      color: 'var(--text-hi)',
      letterSpacing: '-0.02em',
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-low)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, unit)), (delta || hint) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 12
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 600,
      color: TREND[trend]
    }
  }, trend !== 'flat' && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-up-right",
    size: 13,
    style: {
      transform: trend === 'down' ? 'rotate(90deg)' : 'none'
    }
  }), delta), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: 'var(--text-low)'
    }
  }, hint)));
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/data/PairBracket.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Left-edge grouping bracket + label for components that belong together
 * (Decision #86). Purely visual: it never alters selection logic, which stays
 * server-authoritative per the existing pair-keeping rule. It is not a status
 * and never replaces a status badge — a bracketed component still shows its own
 * status badge alongside the bracket.
 *
 * `variant`:
 *  - `"pair"` (default) — front/back pairs that move as a single unit
 *    (LITF/LITB, WALF/WALB). Solid bracket in the grouping accent
 *    (`--group-pair-line`) with a "PAIR" label (`--group-pair`).
 *  - `"shared-source"` — a component that only shares a *source artwork file*
 *    with another (for example TIN alongside a lighter pair) and does NOT move
 *    as a unit. Rendered deliberately distinct — a dashed rule and a
 *    "SHARED ART" label in the muted meta-text colour — so the two cases are
 *    never confused. Frontend_Color_System.md v1.1 documents no dedicated
 *    colour for this case; this uses existing non-status tokens
 *    (`--line-strong`, `--text-meta`) pending owner direction.
 */
function PairBracket({
  children,
  variant = 'pair',
  label,
  style,
  ...rest
}) {
  const isShared = variant === 'shared-source';
  const stroke = isShared ? 'dashed' : 'solid';
  const lineColor = isShared ? 'var(--line-strong)' : 'var(--group-pair-line)';
  const labelColor = isShared ? 'var(--text-meta)' : 'var(--group-pair)';
  const text = label ?? (isShared ? 'Shared art' : 'Pair');
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 8,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 'none',
      width: 9,
      borderLeft: `2px ${stroke} ${lineColor}`,
      borderTop: `2px ${stroke} ${lineColor}`,
      borderBottom: `2px ${stroke} ${lineColor}`,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: labelColor,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, text), children));
}
Object.assign(__ds_scope, { PairBracket });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PairBracket.jsx", error: String((e && e.message) || e) }); }

// components/data/SegmentedSku.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Renders a canonical SKU as adjacent per-segment chips with a copy control
 * that copies the full canonical string.
 *
 * The segments come from the backend SKU parser (`fulfillment/sku_parser.py`),
 * surfaced on the API as `family_code` / `design_code` / `options` /
 * `config_code` (see `OfferSku` and `OrderItem`). This component does not parse
 * the SKU itself and never splits the string on delimiters — callers pass the
 * already-parsed fields. Segment order follows SKU_and_Internal_ID_Guide.md:
 * `<FAMILY>-<DESIGN>-<OPTION...>-<CONFIG>`, where the option run is the parser's
 * `options` dict in insertion order (`{color, flame}` for LIT, `{size}` for
 * BAT/TAP/PIL, `{size, color}` for HOD, `{color}` for TOT).
 *
 * When no parsed fields are supplied it falls back to a single chip holding the
 * raw canonical string — still copyable, just not segmented.
 *
 * `tone` controls chip colour. A SKU is an identifier, never a status, so no
 * variant borrows a status tone or the spice accent:
 *   value — DEFAULT (approved 2026-09-04). Tonal ladder, family strongest →
 *           config faintest. Adds no hue, so it is safe anywhere, including
 *           inside a status-bearing row and in dense tables.
 *   none  — uniform grey chips. The pre-2026-09-04 treatment; kept for
 *           surfaces that must stay entirely neutral.
 *   role  — tonal family/config with two dedicated non-status hues for design
 *           (`--seg-design`) and option (`--seg-option`) segments. NOT adopted;
 *           available for a future surface that needs faster scanning.
 */

const SIZES = {
  sm: {
    h: 20,
    px: 6,
    fs: 10,
    gap: 4,
    icon: 12
  },
  md: {
    h: 24,
    px: 8,
    fs: 11,
    gap: 5,
    icon: 13
  }
};

/* Per-role chip skins. `none` keeps every chip identical. */
const CHIP_TONES = {
  none: {
    family: {
      bg: 'var(--surface-control)',
      fg: 'var(--text-body)',
      line: 'var(--line)',
      fw: 600
    },
    design: {
      bg: 'var(--surface-control)',
      fg: 'var(--text-body)',
      line: 'var(--line)',
      fw: 600
    },
    option: {
      bg: 'var(--surface-control)',
      fg: 'var(--text-body)',
      line: 'var(--line)',
      fw: 600
    },
    config: {
      bg: 'var(--surface-control)',
      fg: 'var(--text-body)',
      line: 'var(--line)',
      fw: 600
    }
  },
  value: {
    family: {
      bg: 'var(--ink-600)',
      fg: 'var(--text-hi)',
      line: 'var(--line-strong)',
      fw: 700
    },
    design: {
      bg: 'var(--surface-control)',
      fg: 'var(--text-hi)',
      line: 'var(--line)',
      fw: 600
    },
    option: {
      bg: 'var(--surface-raised)',
      fg: 'var(--text-mid)',
      line: 'var(--line)',
      fw: 600
    },
    config: {
      bg: 'var(--surface-panel)',
      fg: 'var(--text-low)',
      line: 'var(--line)',
      fw: 600
    }
  },
  role: {
    family: {
      bg: 'var(--ink-600)',
      fg: 'var(--text-hi)',
      line: 'var(--line-strong)',
      fw: 700
    },
    design: {
      bg: 'var(--seg-design-bg)',
      fg: 'var(--seg-design)',
      line: 'var(--seg-design-line)',
      fw: 700
    },
    option: {
      bg: 'var(--seg-option-bg)',
      fg: 'var(--seg-option)',
      line: 'var(--seg-option-line)',
      fw: 600
    },
    config: {
      bg: 'var(--surface-panel)',
      fg: 'var(--text-low)',
      line: 'var(--line)',
      fw: 600
    }
  }
};
function optionSegments(options) {
  if (!options || typeof options !== 'object') return [];
  return Object.values(options).filter(v => v !== null && v !== undefined && String(v).length > 0).map(String);
}

/* Tags each segment with its role so `tone` can skin them independently.
   Order follows SKU_and_Internal_ID_Guide.md and is never derived by splitting
   the SKU string. */
function roledSegments({
  familyCode,
  designCode,
  options,
  configCode
}) {
  const out = [];
  if (familyCode) out.push({
    value: String(familyCode),
    role: 'family'
  });
  if (designCode) out.push({
    value: String(designCode),
    role: 'design'
  });
  optionSegments(options).forEach(v => out.push({
    value: v,
    role: 'option'
  }));
  if (configCode) out.push({
    value: String(configCode),
    role: 'config'
  });
  return out;
}
async function writeClipboard(text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}
function SegmentedSku({
  sku,
  familyCode,
  designCode,
  options,
  configCode,
  size = 'md',
  tone = 'value',
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const skin = CHIP_TONES[tone] || CHIP_TONES.none;
  const [copied, setCopied] = React.useState(false);
  const parsed = roledSegments({
    familyCode,
    designCode,
    options,
    configCode
  });
  const segments = parsed.length > 0 ? parsed : sku ? [{
    value: String(sku),
    role: 'family'
  }] : [];
  const onCopy = React.useCallback(async () => {
    const ok = await writeClipboard(sku);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }, [sku]);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    role: "group",
    "aria-label": `SKU ${sku}`,
    style: {
      display: 'inline-flex',
      alignItems: 'stretch'
    }
  }, segments.map((seg, i) => {
    const c = skin[seg.role] || skin.family;
    return /*#__PURE__*/React.createElement("span", {
      key: `${seg.value}-${i}`,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        height: s.h,
        padding: `0 ${s.px}px`,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.line}`,
        borderLeftWidth: i === 0 ? 1 : 0,
        borderTopLeftRadius: i === 0 ? 'var(--radius-sm)' : 0,
        borderBottomLeftRadius: i === 0 ? 'var(--radius-sm)' : 0,
        borderTopRightRadius: i === segments.length - 1 ? 'var(--radius-sm)' : 0,
        borderBottomRightRadius: i === segments.length - 1 ? 'var(--radius-sm)' : 0,
        fontFamily: 'var(--font-mono)',
        fontSize: s.fs,
        fontWeight: c.fw,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap'
      }
    }, seg.value);
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCopy,
    "aria-label": copied ? `Copied ${sku}` : `Copy SKU ${sku}`,
    style: {
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: s.h,
      width: s.h,
      background: 'transparent',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      color: copied ? 'var(--tone-success)' : 'var(--text-meta)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: copied ? 'check' : 'copy',
    size: s.icon,
    strokeWidth: 2.25
  })));
}
Object.assign(__ds_scope, { SegmentedSku });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SegmentedSku.jsx", error: String((e && e.message) || e) }); }

// components/feedback/AgingFlag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Compact "{n}D" elapsed-time flag (Decisions #75 / #87).
 *
 * Shown once the anchor date is `thresholdDays` or more calendar days in the
 * past. It renders in the Warning tone (`--tone-warning`) with the `clock`
 * icon — the single documented icon exception to the one-icon-per-tone rule
 * (Decision #85), because it flags elapsed time, not a lifecycle state.
 *
 * It is NOT a status badge: it is never routed through StatusBadge, never
 * appears in a status key, and never participates in a status filter.
 *
 * The threshold and the anchor timestamp both come from props. Decision #75
 * leaves the anchor open; the consuming screen decides what date to pass
 * (`orders.created_at`, `production_batches.opened_at`, …) — this component
 * does not.
 */
const AGING_THRESHOLD_DAYS = 4;

/** Whole calendar days between `iso` and `now` (local time). `null` if unparseable. */
function calendarDaysSince(iso, now = new Date()) {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const thenMidnight = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor((nowMidnight - thenMidnight) / 86_400_000);
}
function isAging(iso, now, thresholdDays = AGING_THRESHOLD_DAYS) {
  const days = calendarDaysSince(iso, now);
  return days !== null && days >= thresholdDays;
}
function AgingFlag({
  sinceIso,
  now,
  thresholdDays = AGING_THRESHOLD_DAYS,
  style,
  ...rest
}) {
  const days = calendarDaysSince(sinceIso, now);
  if (days === null || days < thresholdDays) return null;
  const label = `Open ${days} day${days === 1 ? '' : 's'} — aging`;
  return /*#__PURE__*/React.createElement("span", _extends({
    title: label,
    "aria-label": label,
    style: {
      alignItems: 'center',
      color: 'var(--tone-warning)',
      display: 'inline-flex',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      gap: 3,
      letterSpacing: '0.06em',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 12,
    strokeWidth: 2.25
  }), `${days}D`);
}
Object.assign(__ds_scope, { AGING_THRESHOLD_DAYS, calendarDaysSince, isAging, AgingFlag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/AgingFlag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ConfirmModal.jsx
try { (() => {
"use client";

const {
  useEffect,
  useId,
  useRef
} = React;
const TONE_ICON = {
  default: 'info',
  danger: 'octagon-x',
  warning: 'triangle-alert'
};
const TONE_COLOR = {
  default: 'var(--spice-400)',
  danger: 'var(--tone-danger)',
  warning: 'var(--tone-warning)'
};
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centered confirmation dialog with scrim. The dialog owns keyboard focus for
 * its lifetime and returns it to the exact opener after close.
 */
function ConfirmModal({
  open = true,
  tone = 'default',
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false
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
    const onKeyDown = event => {
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
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: () => {
      if (!loading) onCancel();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.66)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      animation: 'sa-pulse 0s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: dialogRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
    "aria-describedby": children ? descriptionId : undefined,
    tabIndex: -1,
    onMouseDown: event => event.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 440,
      background: 'var(--surface-panel)',
      border: '1px solid var(--line-strong)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-pop)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: 3,
      background: TONE_COLOR[tone]
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 24px 0',
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 38,
      height: 38,
      flex: 'none',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ink-850)',
      border: '1px solid var(--line)',
      color: TONE_COLOR[tone]
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: TONE_ICON[tone],
    size: 19
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("h2", {
    id: titleId,
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    id: descriptionId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--text-mid)'
    }
  }, children))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      padding: 24,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    "data-confirm-modal-cancel": true,
    variant: "ghost",
    onClick: onCancel,
    disabled: loading
  }, cancelLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: tone === 'danger' ? 'danger' : 'primary',
    onClick: onConfirm,
    loading: loading,
    disabled: loading
  }, confirmLabel))));
}
Object.assign(__ds_scope, { ConfirmModal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ConfirmModal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/DeferredPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Deferred / MVP informational panel — marks a feature that's intentionally not
 * built yet. Muted, hatch-textured, with a clear "DEFERRED — MVP" tag so the
 * operator knows it's planned, not broken.
 *
 * Texture: hatch ALONE, deliberately. Diagonal stripes are disallowed here —
 * this panel's supporting copy is 13px and non-bold, which is exactly what the
 * stripe legibility rule protects. Dots carry prose; stripes go where type is
 * bold or absent (panel headers, empty states).
 *
 * The neutral status tone is confined to the badge pill; the container keeps a
 * plain `--line` border so status colour never becomes container chrome.
 */
function DeferredPanel({
  tag = 'Deferred — MVP',
  title,
  children,
  eta,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 22px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "tex-hatch",
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.6,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 22,
      padding: '0 9px',
      background: 'var(--tone-neutral-bg)',
      border: '1px solid var(--tone-neutral-line)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--tone-neutral)',
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 11
  }), " ", tag), eta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-low)'
    }
  }, "ETA ", eta)), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 7px',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: 'var(--text-mid)'
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      lineHeight: 1.55,
      color: 'var(--text-low)',
      maxWidth: 460
    }
  }, children)));
}
Object.assign(__ds_scope, { DeferredPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/DeferredPanel.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Empty state for zero-data views. Textured icon medallion, uppercase heading,
 * supporting line, and an optional action. Punk edge lives here.
 *
 * Texture: wide diagonal stripes layered over the halftone tile, in the
 * backdrop and inside the medallion. An empty state is an approved stripe
 * placement because its only type is bold and uppercase — the supporting line
 * sits on flat surface at 50% backdrop opacity.
 */
function EmptyState({
  icon = 'inbox',
  title,
  children,
  action,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: compact ? '36px 24px' : '64px 24px',
      border: '1px dashed var(--line-strong)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "tex-stripes-halftone",
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: 56,
      height: 56,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--ink-850)',
      backgroundImage: 'var(--tex-stripe-wide)',
      border: '1.5px solid var(--line-strong)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-low)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 26
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      position: 'relative',
      margin: '0 0 8px',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)'
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      position: 'relative',
      margin: '0 0 20px',
      maxWidth: 360,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      lineHeight: 1.55,
      color: 'var(--text-low)'
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ErrorAlert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  error: {
    fg: 'var(--tone-danger)',
    bg: 'var(--tone-danger-bg)',
    bd: 'var(--tone-danger-line)',
    icon: 'octagon-x'
  },
  warning: {
    fg: 'var(--tone-warning)',
    bg: 'var(--tone-warning-bg)',
    bd: 'var(--tone-warning-line)',
    icon: 'triangle-alert'
  },
  info: {
    fg: 'var(--tone-info)',
    bg: 'var(--tone-info-bg)',
    bd: 'var(--tone-info-line)',
    icon: 'info'
  },
  success: {
    fg: 'var(--tone-success)',
    bg: 'var(--tone-success-bg)',
    bd: 'var(--tone-success-line)',
    icon: 'circle-check'
  }
};

/**
 * Inline alert banner. Icon + title + body + optional action / dismiss.
 */
function ErrorAlert({
  tone = 'error',
  title,
  children,
  action,
  onDismiss,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.error;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "alert",
    style: {
      display: 'flex',
      gap: 13,
      padding: '14px 16px',
      background: t.bg,
      border: `1px solid ${t.bd}`,
      borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${t.fg}`,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.fg,
      flex: 'none',
      display: 'flex',
      paddingTop: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: t.fg,
      marginBottom: children ? 5 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--text-mid)'
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, action)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      flex: 'none',
      background: 'transparent',
      border: 'none',
      color: 'var(--text-low)',
      cursor: 'pointer',
      padding: 2,
      display: 'flex',
      height: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })));
}
Object.assign(__ds_scope, { ErrorAlert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ErrorAlert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/LoadingState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Resolved against the page, not the server root, so the mark loads from a
   design-system card, a UI kit, or the app itself. Override with `logoSrc`. */
const DEFAULT_LOGO = 'assets/spicedanime-logo-spinner.png';

/**
 * Loading affordance. variant="spinner" for a centered block; variant="skeleton"
 * for content placeholders (shimmer rows). Use skeletons for tables/cards.
 */
function LoadingState({
  variant = 'spinner',
  label = 'Loading…',
  rows = 3,
  logoSrc,
  style,
  ...rest
}) {
  if (variant === 'skeleton') {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement(SpinningLogo, {
      size: 18,
      logoSrc: logoSrc
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: 'var(--text-low)'
      }
    }, label)), Array.from({
      length: rows
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      width: i % 3 === 0 ? '100%' : i % 3 === 1 ? '78%' : '90%'
    })));
  }
  if (variant === 'inline') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-low)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement(SpinningLogo, {
      size: 16,
      logoSrc: logoSrc
    }), " ", label);
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: '56px 24px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(SpinningLogo, {
    size: 36,
    logoSrc: logoSrc
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label));
}
function SpinningLogo({
  size,
  logoSrc
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: logoSrc || DEFAULT_LOGO,
    alt: "",
    className: "sa-loading-logo",
    width: size,
    height: size,
    style: {
      display: 'block',
      flex: 'none'
    }
  });
}
function Shimmer({
  width = '100%'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      width,
      borderRadius: 'var(--radius-xs)',
      background: 'linear-gradient(90deg, var(--ink-800) 0px, var(--ink-700) 200px, var(--ink-800) 400px)',
      backgroundSize: '800px 100%',
      animation: 'sa-shimmer 1.3s linear infinite'
    }
  });
}
Object.assign(__ds_scope, { LoadingState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/LoadingState.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const Link = React.forwardRef(function Link({
  href,
  children,
  ...p
}, ref) {
  return React.createElement('a', {
    href,
    ref,
    ...p
  }, children);
});
const DEFAULT_NAV = [{
  key: 'dashboard',
  label: 'Dashboard',
  icon: 'layout-dashboard',
  href: '/'
}, {
  key: 'batches',
  label: 'Current Batches',
  icon: 'layers',
  badge: 12,
  href: '/batches'
}, {
  key: 'attention',
  label: 'Needs Attention',
  icon: 'triangle-alert',
  badge: 3,
  tone: 'danger',
  href: '/needs-attention'
}, {
  key: 'orders',
  label: 'Orders',
  icon: 'shopping-cart',
  href: '/orders'
}, {
  key: 'artwork',
  label: 'Artwork Library',
  icon: 'image',
  href: '/artwork'
}, {
  key: 'skus',
  label: 'SKU Manager',
  icon: 'tag',
  href: '/sku-manager'
}, {
  key: 'packing',
  label: 'Packing Queue',
  icon: 'boxes',
  href: '/packing'
}];
const DEFAULT_FOOTER = [{
  key: 'audit',
  label: 'Audit Log',
  icon: 'scroll-text',
  href: '/audit-log'
}, {
  key: 'settings',
  label: 'Settings',
  icon: 'settings',
  href: '/settings'
}];

/**
 * Left navigation rail. Logo header, grouped nav with active spice indicator,
 * optional counts, and a footer (settings/audit + operator identity).
 */
function Sidebar({
  active = 'dashboard',
  onNavigate,
  nav = DEFAULT_NAV,
  footerNav = DEFAULT_FOOTER,
  logoSrc = 'assets/spicedanime-icon.png',
  operator = 'Josiah',
  operatorRole = 'Operator',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      width: 'var(--sidebar-w)',
      flex: 'none',
      height: '100%',
      background: 'var(--surface-rail)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '0 18px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "SpicedAnime",
    width: 30,
    height: 30,
    style: {
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)'
    }
  }, "Spiced"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: 'var(--text-low)',
      marginTop: 2
    }
  }, "Fulfillment"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 8px 8px',
      fontFamily: 'var(--font-sans)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, "Operations"), nav.map(item => /*#__PURE__*/React.createElement(NavItem, {
    key: item.key,
    item: item,
    active: active === item.key,
    onNavigate: onNavigate
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      borderTop: '1px solid var(--line)'
    }
  }, footerNav.map(item => /*#__PURE__*/React.createElement(NavItem, {
    key: item.key,
    item: item,
    active: active === item.key,
    onNavigate: onNavigate
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 18px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      flex: 'none',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--spice-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--text-on-spice)'
    }
  }, operator.charAt(0)), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.25,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-hi)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, operator), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, operatorRole))));
}
function NavItem({
  item,
  active,
  onNavigate
}) {
  const [hover, setHover] = React.useState(false);
  // Primary-nav entries are navigation to another app route, so they render as
  // real links (Next.js Link): left-click navigates in place, and middle-click,
  // Cmd/Ctrl-click and "Open Link in New Tab" all work natively. `onNavigate`
  // is still called for a plain left-click so hosts that track navigation keep
  // working; a legacy caller that passes no `href` falls back to a button.
  const commonStyle = {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    height: 40,
    padding: '0 12px',
    marginBottom: 2,
    textAlign: 'left',
    background: active ? 'var(--spice-tint)' : hover ? 'var(--surface-hover)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: active ? 'var(--text-hi)' : hover ? 'var(--text-hi)' : 'var(--text-mid)',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
  };
  const hoverHandlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  };
  const accentRule = active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 9,
      bottom: 9,
      width: 3,
      background: 'var(--spice-500)',
      borderRadius: '0 2px 2px 0'
    }
  });
  if (item.href) {
    return /*#__PURE__*/React.createElement(Link, _extends({
      href: item.href,
      "aria-current": active ? 'page' : undefined,
      onClick: () => onNavigate && onNavigate(item.key)
    }, hoverHandlers, {
      style: commonStyle
    }), accentRule, /*#__PURE__*/React.createElement(NavItemBody, {
      item: item,
      active: active
    }));
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => onNavigate && onNavigate(item.key)
  }, hoverHandlers, {
    style: commonStyle
  }), accentRule, /*#__PURE__*/React.createElement(NavItemBody, {
    item: item,
    active: active
  }));
}
function NavItemBody({
  item,
  active
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: item.icon,
    size: 18,
    color: active ? 'var(--spice-400)' : 'currentColor'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, item.label), item.badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 20,
      height: 18,
      padding: '0 6px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      background: item.tone === 'danger' ? 'var(--tone-danger-bg)' : 'var(--ink-700)',
      color: item.tone === 'danger' ? 'var(--tone-danger)' : 'var(--text-mid)',
      border: `1px solid ${item.tone === 'danger' ? 'var(--tone-danger-line)' : 'var(--line)'}`
    }
  }, item.badge));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Top bar. Breadcrumb/title area on the left, global search + actions on the right.
 * Designed to pair with Sidebar; sits above the scrolling content.
 */
function TopBar({
  title,
  breadcrumb,
  onSearch,
  searchPlaceholder = 'Search batches, orders, SKUs…',
  notifications = 0,
  actions,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      height: 'var(--topbar-h)',
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      background: 'var(--surface-panel)',
      borderBottom: '1px solid var(--line)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, breadcrumb && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2
    }
  }, breadcrumb.map((b, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 12,
    style: {
      color: 'var(--text-faint)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: i === breadcrumb.length - 1 ? 'var(--text-mid)' : 'var(--text-low)'
    }
  }, b)))), title && /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: 'var(--text-hi)',
      whiteSpace: 'nowrap'
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, onSearch !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 36,
      padding: '0 12px',
      width: 280,
      background: 'var(--ink-850)',
      border: `1px solid ${focus ? 'var(--line-spice)' : 'var(--line-strong)'}`,
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 16,
    style: {
      color: 'var(--text-low)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: searchPlaceholder,
    onChange: e => onSearch && onSearch(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "bell",
    label: "Notifications"
  }), notifications > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--spice-500)',
      color: 'var(--text-on-spice)',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      border: '2px solid var(--surface-panel)'
    }
  }, notifications)), actions));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppShell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Full application shell: fixed Sidebar + TopBar + scrolling content area.
 * Pass `sidebar` / `topBar` props to override defaults, or `sidebarProps` /
 * `topBarProps` to configure the built-in ones.
 */
function AppShell({
  active,
  onNavigate,
  sidebarProps = {},
  topBarProps = {},
  sidebar,
  topBar,
  children,
  contentMax = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: 'var(--surface-app)',
      ...style
    }
  }, rest), sidebar || /*#__PURE__*/React.createElement(__ds_scope.Sidebar, _extends({
    active: active,
    onNavigate: onNavigate
  }, sidebarProps)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, topBar || /*#__PURE__*/React.createElement(__ds_scope.TopBar, topBarProps), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: 'var(--surface-app)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--content-pad)',
      maxWidth: contentMax ? 'var(--content-max)' : 'none',
      margin: contentMax ? '0 auto' : undefined
    }
  }, children))));
}
Object.assign(__ds_scope, { AppShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/ArtworkLibrary.jsx
try { (() => {
const {
  StatusBadge,
  Button,
  Icon,
  Input,
  Select,
  Badge,
  EmptyState,
  LoadingState,
  DataTable
} = window.SpicedAnimeSpicyDesignSystem_daab0d;
function ArtworkLibrary() {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  /* Server-side sorting across the complete matching result set, not just the
     current page. Design: A–Z then Z–A. Updated: newest then oldest (#100). */
  const [sort, setSort] = React.useState({
    key: 'updated',
    dir: 'desc'
  });
  const [perPage, setPerPage] = React.useState(50);
  const [revalidating, setRevalidating] = React.useState(false);
  const toggleSort = key => setSort(s => s.key === key ? {
    key,
    dir: s.dir === 'asc' ? 'desc' : 'asc'
  } : {
    key,
    dir: key === 'design' ? 'asc' : 'desc'
  });
  let rows = ARTWORK.filter(a => {
    if (q && !(a.design + a.name).toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'all') return true;
    return a.status.toLowerCase() === filter;
  });
  rows = [...rows].sort((a, b) => {
    const mult = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'design') return a.design.localeCompare(b.design) * mult;
    return (new Date(a.updated) - new Date(b.updated)) * mult;
  });
  const counts = {
    all: ARTWORK.length,
    available: ARTWORK.filter(a => a.status === 'Available').length,
    missing: ARTWORK.filter(a => a.status === 'Missing').length,
    retired: ARTWORK.filter(a => a.status === 'Retired').length
  };
  const columns = [
  /* Thumb column: the real image is fetched for Available assets; any other
     status (or a failed fetch) falls back to the component-code label. */
  {
    key: 'thumb',
    header: 'Thumb',
    width: 74,
    render: (_v, row) => /*#__PURE__*/React.createElement("div", {
      style: {
        alignItems: 'center',
        background: 'var(--surface-raised)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        height: 46,
        justifyContent: 'center',
        width: 46
      }
    }, row.status === 'Available' ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "image",
      size: 18
    })) : /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-faint)',
        fontSize: 9
      }
    }, row.component))
  }, {
    key: 'design',
    width: 120,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Design",
      active: sort.key === 'design',
      dir: sort.dir,
      onClick: () => toggleSort('design')
    }),
    render: v => /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-hi)',
        fontSize: 13,
        fontWeight: 700
      }
    }, v)
  }, {
    key: 'name',
    header: 'Name'
  }, {
    key: 'component',
    header: 'Component',
    mono: true,
    width: 110
  }, {
    key: 'path',
    header: 'File path',
    render: (_v, row) => /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-low)',
        fontSize: 11
      }
    }, "artwork/", row.family, "/", row.design, ".png")
  }, {
    key: 'status',
    header: 'Status',
    width: 140,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      size: "sm"
    })
  }, {
    key: 'updated',
    width: 140,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Updated",
      active: sort.key === 'updated',
      dir: sort.dir,
      onClick: () => toggleSort('updated')
    }),
    render: v => /*#__PURE__*/React.createElement(Muted, null, v)
  }, {
    key: 'actions',
    header: '',
    align: 'right',
    width: 210,
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline"
    }, "Replace"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost"
    }, "Retire"))
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Assets",
    title: "Artwork Library",
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 15
      })
    }, "Upload artwork")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      padding: '13px 16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search design code or name\u2026",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    style: {
      minWidth: 250
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [['all', 'All'], ['available', 'Available'], ['missing', 'Missing'], ['retired', 'Retired']].map(([k, label]) => {
    const on = k === filter;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      type: "button",
      onClick: () => setFilter(k),
      style: {
        alignItems: 'center',
        cursor: 'pointer',
        display: 'inline-flex',
        gap: 7,
        height: 30,
        padding: '0 11px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--spice-tint)' : 'transparent',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, label, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        opacity: 0.75
      }
    }, counts[k]));
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    disabled: revalidating,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 13,
      spin: revalidating
    }),
    onClick: () => {
      setRevalidating(true);
      setTimeout(() => setRevalidating(false), 1400);
    }
  }, revalidating ? 'Revalidating…' : 'Revalidate artwork')), revalidating ? /*#__PURE__*/React.createElement(LoadingState, {
    variant: "skeleton",
    rows: 4,
    label: "Scanning Drive artwork subtree",
    logoSrc: "../../assets/spicedanime-logo-spinner.png"
  }) : rows.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "image",
    title: "NO ARTWORK MATCHES"
  }, "Adjust the search or clear the filter to see the full library.") : /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: rows,
    rowKey: "id",
    emptyLabel: "No artwork matches"
  }), /*#__PURE__*/React.createElement(PerPage, {
    value: perPage,
    onChange: setPerPage,
    total: rows.length
  }), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Artwork asset',
      entries: [{
        status: 'Available',
        meaning: 'Resolved in Drive and usable by the print pipeline.'
      }, {
        status: 'Missing',
        meaning: 'No file found at the expected Drive path.'
      }, {
        status: 'Retired',
        meaning: 'Withdrawn from use. The file remains in Drive but is no longer returned by lookups.'
      }]
    }]
  }));
}
Object.assign(window, {
  ArtworkLibrary
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/ArtworkLibrary.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/ArtworkLibrary.standalone.jsx
try { (() => {
const {
  StatusBadge,
  Button,
  Icon,
  Input,
  Select,
  Badge,
  EmptyState,
  LoadingState,
  DataTable
} = window.SpicedAnimeSpicyDesignSystem_daab0d;
function ArtworkLibrary() {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  /* Server-side sorting across the complete matching result set, not just the
     current page. Design: A–Z then Z–A. Updated: newest then oldest (#100). */
  const [sort, setSort] = React.useState({
    key: 'updated',
    dir: 'desc'
  });
  const [perPage, setPerPage] = React.useState(50);
  const [revalidating, setRevalidating] = React.useState(false);
  const toggleSort = key => setSort(s => s.key === key ? {
    key,
    dir: s.dir === 'asc' ? 'desc' : 'asc'
  } : {
    key,
    dir: key === 'design' ? 'asc' : 'desc'
  });
  let rows = ARTWORK.filter(a => {
    if (q && !(a.design + a.name).toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'all') return true;
    return a.status.toLowerCase() === filter;
  });
  rows = [...rows].sort((a, b) => {
    const mult = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'design') return a.design.localeCompare(b.design) * mult;
    return (new Date(a.updated) - new Date(b.updated)) * mult;
  });
  const counts = {
    all: ARTWORK.length,
    available: ARTWORK.filter(a => a.status === 'Available').length,
    missing: ARTWORK.filter(a => a.status === 'Missing').length,
    retired: ARTWORK.filter(a => a.status === 'Retired').length
  };
  const columns = [
  /* Thumb column: the real image is fetched for Available assets; any other
     status (or a failed fetch) falls back to the component-code label. */
  {
    key: 'thumb',
    header: 'Thumb',
    width: 74,
    render: (_v, row) => /*#__PURE__*/React.createElement("div", {
      style: {
        alignItems: 'center',
        background: 'var(--surface-raised)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        height: 46,
        justifyContent: 'center',
        width: 46
      }
    }, row.status === 'Available' ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "image",
      size: 18
    })) : /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-faint)',
        fontSize: 9
      }
    }, row.component))
  }, {
    key: 'design',
    width: 120,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Design",
      active: sort.key === 'design',
      dir: sort.dir,
      onClick: () => toggleSort('design')
    }),
    render: v => /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-hi)',
        fontSize: 13,
        fontWeight: 700
      }
    }, v)
  }, {
    key: 'name',
    header: 'Name'
  }, {
    key: 'component',
    header: 'Component',
    mono: true,
    width: 110
  }, {
    key: 'path',
    header: 'File path',
    render: (_v, row) => /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-low)',
        fontSize: 11
      }
    }, "artwork/", row.family, "/", row.design, ".png")
  }, {
    key: 'status',
    header: 'Status',
    width: 140,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      size: "sm"
    })
  }, {
    key: 'updated',
    width: 140,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Updated",
      active: sort.key === 'updated',
      dir: sort.dir,
      onClick: () => toggleSort('updated')
    }),
    render: v => /*#__PURE__*/React.createElement(Muted, null, v)
  }, {
    key: 'actions',
    header: '',
    align: 'right',
    width: 210,
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline"
    }, "Replace"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost"
    }, "Retire"))
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Assets",
    title: "Artwork Library",
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 15
      })
    }, "Upload artwork")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      padding: '13px 16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search design code or name\u2026",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    style: {
      minWidth: 250
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, [['all', 'All'], ['available', 'Available'], ['missing', 'Missing'], ['retired', 'Retired']].map(([k, label]) => {
    const on = k === filter;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      type: "button",
      onClick: () => setFilter(k),
      style: {
        alignItems: 'center',
        cursor: 'pointer',
        display: 'inline-flex',
        gap: 7,
        height: 30,
        padding: '0 11px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--spice-tint)' : 'transparent',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, label, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        opacity: 0.75
      }
    }, counts[k]));
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    disabled: revalidating,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 13,
      spin: revalidating
    }),
    onClick: () => {
      setRevalidating(true);
      setTimeout(() => setRevalidating(false), 1400);
    }
  }, revalidating ? 'Revalidating…' : 'Revalidate artwork')), revalidating ? /*#__PURE__*/React.createElement(LoadingState, {
    variant: "skeleton",
    rows: 4,
    label: "Scanning Drive artwork subtree",
    logoSrc: window.__resources.spinnerLogo
  }) : rows.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "image",
    title: "NO ARTWORK MATCHES"
  }, "Adjust the search or clear the filter to see the full library.") : /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: rows,
    rowKey: "id",
    emptyLabel: "No artwork matches"
  }), /*#__PURE__*/React.createElement(PerPage, {
    value: perPage,
    onChange: setPerPage,
    total: rows.length
  }), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Artwork asset',
      entries: [{
        status: 'Available',
        meaning: 'Resolved in Drive and usable by the print pipeline.'
      }, {
        status: 'Missing',
        meaning: 'No file found at the expected Drive path.'
      }, {
        status: 'Retired',
        meaning: 'Withdrawn from use. The file remains in Drive but is no longer returned by lookups.'
      }]
    }]
  }));
}
Object.assign(window, {
  ArtworkLibrary
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/ArtworkLibrary.standalone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/BatchDetail.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  AgingFlag,
  Button,
  Icon,
  Checkbox,
  ConfirmModal,
  BatchCard,
  SegmentedSku,
  Badge,
  ErrorAlert,
  Select
} = window.SpicedAnimeSpicyDesignSystem_daab0d;
const COLORS = ['All Colors', 'White/Gold', 'Silver'];
function BatchDetail({
  go
}) {
  const [selected, setSelected] = React.useState([]);
  const [sortDir, setSortDir] = React.useState(null);
  const [color, setColor] = React.useState('All Colors');
  const [confirm, setConfirm] = React.useState(null);
  const [state, setState] = React.useState('Open');

  /* Selecting one half of a front/back pair auto-includes its sibling
     (LITF/LITB, WALF/WALB — Decision #42 / Section 2.5). */
  const withPairs = keys => {
    const out = new Set(keys);
    keys.forEach(k => {
      const row = BATCH_COMPONENTS.find(c => c.id === k);
      if (!row || !row.pair) return;
      BATCH_COMPONENTS.filter(c => c.design_code === row.design_code && c.order_number === row.order_number && c.config_code === row.config_code).forEach(c => out.add(c.id));
    });
    return [...out];
  };
  const eligible = BATCH_COMPONENTS.filter(c => c.status === 'Ready').map(c => c.id);

  /* Color filtering is display-only: it never changes selection state or the
     generated component set (Decision #57 / Section 2.5). */
  let rows = color === 'All Colors' ? BATCH_COMPONENTS : BATCH_COMPONENTS.filter(c => c.color === color);
  if (sortDir) rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.order_number.localeCompare(b.order_number) : b.order_number.localeCompare(a.order_number));
  const selectedEligible = selected.filter(k => eligible.includes(k));
  /* A proper subset drives the contextual label; selecting everything eligible
     canonicalizes back to the all-items branch (Decision #101). */
  const isProperSubset = selectedEligible.length > 0 && selectedEligible.length < eligible.length;
  const hasColorVariants = BATCH_COMPONENTS.some(c => ['LITF', 'LITB', 'TIN'].includes(c.component_code));
  const ready = BATCH_COMPONENTS.filter(c => c.status === 'Ready').length;
  const blocked = BATCH_COMPONENTS.filter(c => c.status === 'Blocked').length;
  const columns = [{
    key: 'design_code',
    header: 'Design',
    mono: true,
    width: 110
  }, {
    key: 'component_code',
    header: 'Component',
    width: 140,
    render: (v, row) => /*#__PURE__*/React.createElement("span", {
      style: {
        alignItems: 'center',
        display: 'inline-flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, null, v), row.pair && /*#__PURE__*/React.createElement("span", {
      style: {
        borderLeft: '2px solid var(--group-pair-line)',
        color: 'var(--group-pair)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.14em',
        paddingLeft: 6
      }
    }, "PAIR"))
  }, {
    key: 'order_number',
    width: 120,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Order",
      active: !!sortDir,
      dir: sortDir,
      onClick: () => setSortDir(d => d === null ? 'asc' : d === 'asc' ? 'desc' : null)
    }),
    render: v => /*#__PURE__*/React.createElement("a", {
      href: `#orders/${v.replace('#', '')}`,
      onClick: e => {
        e.preventDefault();
        go('orderDetail');
      }
    }, /*#__PURE__*/React.createElement(Mono, null, v))
  }, {
    key: 'order_date',
    header: 'Order Date',
    width: 130,
    render: v => /*#__PURE__*/React.createElement(Muted, null, v)
  }, ...(hasColorVariants ? [{
    key: 'color',
    header: 'Color',
    width: 120,
    render: v => /*#__PURE__*/React.createElement("span", {
      style: {
        alignItems: 'center',
        display: 'inline-flex',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: v === 'Silver' ? '#E8E8E8' : '#FBE3D6',
        border: '1px solid var(--line-strong)',
        borderRadius: 2,
        height: 11,
        width: 11
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-mid)',
        fontSize: 12
      }
    }, v))
  }] : []), /* Component lists render `Canceled` as "Print Not Needed" (Decision #64). */
  {
    key: 'status',
    header: 'Status',
    width: 165,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      context: "component",
      size: "sm"
    })
  }, {
    key: 'failure',
    header: 'Failure',
    width: 180,
    render: v => v ? /*#__PURE__*/React.createElement(FailureText, {
      code: v
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "#batches",
    onClick: e => {
      e.preventDefault();
      go('batches');
    },
    style: {
      alignItems: 'center',
      color: 'var(--text-mid)',
      display: 'inline-flex',
      fontSize: 11,
      fontWeight: 700,
      gap: 6,
      letterSpacing: '0.1em',
      marginBottom: 14,
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 13,
    style: {
      transform: 'rotate(180deg)'
    }
  }), "Current Batches"), /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Batch",
    title: "Lighter #8",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "image",
        size: 14
      }),
      disabled: state !== 'Open',
      onClick: () => setConfirm('preview')
    }, "Download Preview PPTX"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "printer",
        size: 14
      }),
      disabled: state !== 'Locked for Review',
      onClick: () => setConfirm('print')
    }, "Mark Printed"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "file-output",
        size: 15
      }),
      disabled: state !== 'Open',
      onClick: () => setConfirm('generate')
    }, isProperSubset ? 'Generate PPTX (Selected Items)' : 'Generate PPTX (All Items)'))
  })), blocked > 0 && /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: "warning",
    title: `${blocked} components blocked`,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      onClick: () => go('needsAttention')
    }, "Review")
  }, "Blocked components are excluded from the generated PPTX. The rest of the batch is unaffected."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--card-gap)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))'
    }
  }, [['Production group', 'Lighter'], ['State', state], ['Components', String(BATCH_COMPONENTS.length)], ['Ready / Blocked', `${ready}/${blocked}`], ['Created', 'Aug 29, 2026']].map(([label, value]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, label === 'State' ? /*#__PURE__*/React.createElement(StatusBadge, {
    status: value,
    size: "sm"
  }) : /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-hi)',
      fontSize: 19,
      fontWeight: 700
    }
  }, value))))), hasColorVariants && /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      marginRight: 4,
      textTransform: 'uppercase'
    }
  }, "Color"), COLORS.map(c => {
    const on = c === color;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      type: "button",
      onClick: () => setColor(c),
      style: {
        cursor: 'pointer',
        height: 28,
        padding: '0 11px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--spice-tint)' : 'transparent',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, c);
  })), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Contents",
    title: "COMPONENTS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: rows,
    rowKey: "id",
    selectable: true,
    selected: selected,
    onSelect: keys => setSelected(withPairs(keys)),
    selectableRowKeys: eligible,
    virtualize: true,
    scrollHeight: 420,
    emptyLabel: "No components match this color filter"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 14,
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-hi)',
      fontSize: 12
    }
  }, selectedEligible.length, " of ", eligible.length, " items selected"), color !== 'All Colors' && /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "Color filter is display-only \u2014 selection and the generated set are unaffected."), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => setSelected([])
  }, "Clear"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setSelected(eligible)
  }, "Select all eligible")), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Component',
      entries: [{
        status: 'Queued',
        meaning: 'Decoded, waiting on artwork resolution.'
      }, {
        status: 'Ready',
        meaning: 'Artwork resolved. Eligible for this print run.'
      }, {
        status: 'Printed',
        meaning: 'Included in a printed batch. Terminal.'
      }, {
        status: 'Blocked',
        meaning: 'Artwork or metafield could not be resolved. Excluded from generation.'
      }, {
        status: 'Canceled',
        meaning: 'Pulled from the batch because the order was cancelled or refunded. Shown in the component list as "Print Not Needed".'
      }]
    }]
  }), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'generate',
    title: isProperSubset ? `Generate PPTX for ${selectedEligible.length} selected components?` : `Generate PPTX for all ${eligible.length} ready components?`,
    confirmLabel: isProperSubset ? 'Generate PPTX (Selected Items)' : 'Generate PPTX (All Items)',
    onConfirm: () => {
      setState('Locked for Review');
      setConfirm(null);
    },
    onCancel: () => setConfirm(null)
  }, isProperSubset ? 'A new Locked for Review batch is created holding only the selected and pair-expanded components. This batch stays Open with the remainder.' : 'This batch locks for review and a fresh batch opens for Lighter. Blocked components are excluded.'), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'preview',
    title: "Download preview PPTX?",
    confirmLabel: "Download Preview",
    onConfirm: () => setConfirm(null),
    onCancel: () => setConfirm(null)
  }, "Builds a full production-quality file from the batch's current contents and returns a Drive link. No lock, no new batch, no component status change. Repeatable."), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'print',
    title: "Mark batch printed?",
    confirmLabel: "Mark Printed",
    onConfirm: () => {
      setState('Printed');
      setConfirm(null);
    },
    onCancel: () => setConfirm(null)
  }, "Components move to Printed. Orders whose required components are all printed advance to In Production."));
}
const LIFECYCLE_FILTERS = ['Active Queue', 'Open', 'Locked for Review', 'Printed', 'Archived', 'All'];
function Batches({
  go
}) {
  const [filter, setFilter] = React.useState('Active Queue');
  const [group, setGroup] = React.useState('All Production Groups');
  const all = [...BATCH_ROWS, ...BATCH_HISTORY];
  let rows = all;
  if (filter === 'Active Queue') rows = all.filter(b => b.state === 'Open' || b.state === 'Locked for Review');else if (filter !== 'All') rows = all.filter(b => b.state === filter);
  if (group !== 'All Production Groups') rows = rows.filter(b => b.group === group);

  /* Grouped by production group (Decision #96). */
  const groups = [...new Set(rows.map(b => b.group))];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Operations",
    title: "Current Batches"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      padding: '13px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, LIFECYCLE_FILTERS.map(f => {
    const on = f === filter;
    return /*#__PURE__*/React.createElement("button", {
      key: f,
      type: "button",
      onClick: () => setFilter(f),
      style: {
        cursor: 'pointer',
        height: 30,
        padding: '0 12px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--spice-tint)' : 'transparent',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, f);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Select, {
    options: ['All Production Groups', 'Ashtray', 'Lighter', 'Tin', 'Grinder/Jar/Tray', 'Box', 'Wallet'],
    value: group,
    onChange: e => setGroup(e.target.value)
  })), groups.length === 0 && /*#__PURE__*/React.createElement(EmptyStateShim, null), groups.map(g => /*#__PURE__*/React.createElement(ScreenSection, {
    key: g,
    eyebrow: "Production group",
    title: g.toUpperCase()
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: rows.filter(b => b.group === g),
    onRowClick: () => go('batchDetail'),
    columns: [{
      key: 'seq',
      header: 'Batch',
      mono: true,
      width: 90,
      render: (v, row) => /*#__PURE__*/React.createElement("a", {
        href: `#batches/${row.id}`
      }, /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 13,
          fontWeight: 700
        }
      }, v))
    },
    /* `Locked for Review` reads "PPT Generated" on THIS screen only
       (Decision #44) — Batch Detail, Dashboard and every Status
       Guide keep the raw string. */
    {
      key: 'state',
      header: 'State',
      width: 165,
      render: v => /*#__PURE__*/React.createElement(StatusBadge, {
        status: v,
        context: "batches",
        size: "sm"
      })
    }, {
      key: 'ready',
      header: 'Ready',
      width: 150,
      render: (_v, row) => row.total === 0 ? /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontFamily: 'var(--font-mono)'
        }
      }, "Empty batch") : /*#__PURE__*/React.createElement("span", {
        style: {
          color: row.ready === row.total ? 'var(--tone-success)' : 'var(--tone-warning)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700
        }
      }, row.ready, "/", row.total, " ready")
    }, {
      key: 'blocked',
      header: 'Blocked',
      width: 130,
      render: v => v === 0 ? /*#__PURE__*/React.createElement(Muted, null, "0") : /*#__PURE__*/React.createElement(StatusBadge, {
        status: "Blocked",
        label: `Blocked ${v}`,
        size: "sm"
      })
    }, {
      key: 'age',
      header: 'Oldest age',
      width: 120,
      render: (_v, row) => row.aging ? /*#__PURE__*/React.createElement(AgingFlag, {
        sinceIso: row.iso
      }) : /*#__PURE__*/React.createElement(Muted, null, row.age, "d")
    }, {
      key: 'started',
      header: 'Started',
      width: 130,
      render: v => /*#__PURE__*/React.createElement(Muted, null, v)
    }, {
      key: 'action',
      header: '',
      align: 'right',
      width: 130,
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        onClick: e => {
          e.stopPropagation();
          go('batchDetail');
        }
      }, "Open Batch")
    }],
    emptyLabel: "No batches in this group"
  }))), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Batch',
      entries: [{
        status: 'Open',
        meaning: 'Accepting components. Exactly one Open batch per production group.'
      }, {
        status: 'Locked for Review',
        meaning: 'PPTX generated, awaiting print. Shown in the State column above as "PPT Generated".'
      }, {
        status: 'Printed',
        meaning: 'Physically printed and marked done.'
      }, {
        status: 'Archived',
        meaning: 'Closed out. Terminal.'
      }]
    }]
  }));
}
function EmptyStateShim() {
  const {
    EmptyState
  } = window.SpicedAnimeSpicyDesignSystem_daab0d;
  return /*#__PURE__*/React.createElement(EmptyState, {
    icon: "layers",
    title: "NO BATCHES IN THIS VIEW"
  }, "Change the lifecycle filter or production group to see other batches.");
}
Object.assign(window, {
  BatchDetail,
  Batches
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/BatchDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/Dashboard.jsx
try { (() => {
const {
  MetricCard,
  DataTable,
  StatusBadge,
  AgingFlag,
  Button,
  Icon,
  EmptyState
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Needs Attention tile (Decision #93): one merged total, with a hover-revealed
   informational breakdown. The breakdown rows are labels with counts, NOT
   navigation targets — every figure stays reachable by clicking the tile, so
   nothing depends on hover. */
function NeedsAttentionTile({
  go,
  blocked,
  missingSku,
  deferred
}) {
  const [hover, setHover] = React.useState(false);
  const total = blocked + missingSku + deferred;
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Needs attention",
    value: String(total),
    icon: "triangle-alert",
    hint: "blocked \xB7 missing SKU \xB7 deferred",
    onClick: () => go('needsAttention')
  }), hover && /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      zIndex: 20,
      background: 'var(--surface-raised)',
      border: '1px solid var(--line-strong)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-pop)',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, [['Blocked components', blocked, 'danger'], ['Missing SKU', missingSku, 'danger'], ['Deferred items', deferred, 'neutral']].map(([label, count, tone]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 10,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      color: 'var(--text-mid)',
      display: 'inline-flex',
      fontSize: 12,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: `var(--tone-${tone})`,
      borderRadius: '50%',
      flex: 'none',
      height: 6,
      width: 6
    }
  }), label), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13,
      fontWeight: 700
    }
  }, count)))));
}
function SystemStatusTile({
  go
}) {
  const rows = [['Shopify', true], ['Google Drive', true], ['Celery worker', false]];
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => go('settings'),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      padding: '20px 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, "System status"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, rows.map(([name, ok]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 10,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-mid)',
      fontSize: 12
    }
  }, name), /*#__PURE__*/React.createElement(StatusBadge, {
    status: ok ? 'Available' : 'Failed',
    label: ok ? 'Connected' : 'Not connected',
    size: "sm"
  })))));
}
function Dashboard({
  go
}) {
  /* Group and Batch stay separate columns; Batch shows only `#N` and never
     repeats the group name; the timestamp column is `Started` (Decision #95). */
  const columns = [{
    key: 'group',
    header: 'Group',
    width: 190,
    render: v => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-hi)',
        fontWeight: 700,
        whiteSpace: 'nowrap'
      }
    }, v)
  }, {
    key: 'seq',
    header: 'Batch',
    mono: true,
    width: 76
  }, {
    key: 'state',
    header: 'State',
    width: 130,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      size: "sm"
    })
  }, {
    key: 'ready',
    header: 'Ready',
    width: 150,
    render: (_v, row) => row.total === 0 ? /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, "Empty batch") : /*#__PURE__*/React.createElement("span", {
      style: {
        color: row.ready === row.total ? 'var(--tone-success)' : 'var(--tone-warning)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700
      }
    }, row.ready, "/", row.total, " ready")
  }, {
    key: 'blocked',
    header: 'Blocked',
    width: 130,
    render: v => v === 0 ? /*#__PURE__*/React.createElement(Muted, null, "0") : /*#__PURE__*/React.createElement(StatusBadge, {
      status: "Blocked",
      label: `Blocked ${v}`,
      size: "sm"
    })
  }, {
    key: 'age',
    header: 'Oldest age',
    width: 120,
    render: (_v, row) => row.aging ? /*#__PURE__*/React.createElement(AgingFlag, {
      sinceIso: row.iso
    }) : /*#__PURE__*/React.createElement(Muted, null, row.age, "d")
  }, {
    key: 'started',
    header: 'Started',
    width: 130,
    render: v => /*#__PURE__*/React.createElement(Muted, null, v)
  }, {
    key: 'action',
    header: '',
    align: 'right',
    width: 100,
    render: () => /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      onClick: () => go('batchDetail')
    }, "Open")
  }];
  const blocked = BLOCKED.length,
    missingSku = NO_SKU.length,
    deferred = DEFERRED.length;

  /* Preview rows: blocked first, then oldest first (Decision #90). */
  const preview = [...BLOCKED.map(b => ({
    id: `b${b.id}`,
    kind: 'Blocked',
    tone: 'danger',
    order: b.order,
    text: failureLabel(b.code),
    action: 'Revalidate'
  })), ...NO_SKU.map(n => ({
    id: `n${n.id}`,
    kind: 'Missing SKU',
    tone: 'danger',
    order: n.order,
    text: n.item,
    action: 'Generate SKU'
  })), ...DEFERRED.map(d => ({
    id: `d${d.id}`,
    kind: 'Deferred',
    tone: 'neutral',
    order: d.order,
    text: d.item,
    action: null
  }))];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'grid',
      gap: 'var(--card-gap)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Open batches",
    value: "6",
    icon: "layers",
    accent: true,
    hint: "active groups",
    onClick: () => go('batches')
  }), /*#__PURE__*/React.createElement(NeedsAttentionTile, {
    go: go,
    blocked: blocked,
    missingSku: missingSku,
    deferred: deferred
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Queued",
    value: "24",
    icon: "shopping-cart",
    hint: "orders",
    onClick: () => go('orders')
  }), /*#__PURE__*/React.createElement(SystemStatusTile, {
    go: go
  })), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Production",
    title: "ACTIVE BATCHES"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: BATCH_ROWS,
    rowKey: "id",
    emptyLabel: "No open batches"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'start',
      display: 'grid',
      gap: 'var(--space-6)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
    }
  }, /*#__PURE__*/React.createElement(BoundedPanel, {
    eyebrow: "Audit",
    title: "RECENT ACTIVITY",
    cap: 25,
    onViewAll: () => go('audit')
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("tbody", null, ACTIVITY.map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id,
    style: {
      borderBottom: '1px solid var(--line-soft)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 0 11px 18px',
      width: 30
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: e.icon,
    size: 15
  }))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 10px',
      width: 76
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: e.actor === 'Operator' ? 'var(--spice-400)' : 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }
  }, e.actor)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 0'
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-hi)',
      fontSize: 12
    }
  }, e.action)), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--text-mid)',
      fontSize: 12,
      padding: '11px 12px'
    }
  }, e.object), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--text-low)',
      fontSize: 11,
      padding: '11px 18px',
      textAlign: 'right',
      whiteSpace: 'nowrap'
    }
  }, e.when)))))), /*#__PURE__*/React.createElement(BoundedPanel, {
    eyebrow: "Exceptions",
    title: "NEEDS YOUR ATTENTION",
    tone: "danger",
    cap: 30,
    onViewAll: () => go('needsAttention')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, preview.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      alignItems: 'center',
      borderBottom: '1px solid var(--line-soft)',
      display: 'flex',
      gap: 12,
      padding: '12px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: `var(--tone-${p.tone})`,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.tone === 'danger' ? 'octagon-x' : 'minus',
    size: 15
  })), /*#__PURE__*/React.createElement("a", {
    href: `#orders/${p.order.replace('#', '')}`
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 12
    }
  }, p.order)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      width: 84
    }
  }, p.kind), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-mid)',
      flex: 1,
      fontSize: 12,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, p.text), p.action && /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => go('needsAttention')
  }, p.action)))))), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Batch',
      entries: [{
        status: 'Open',
        meaning: 'Accepting components. Exactly one Open batch per production group.'
      }]
    }]
  }));
}
Object.assign(window, {
  Dashboard,
  SystemStatusTile,
  NeedsAttentionTile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/EventPrints.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  Button,
  Icon,
  Input,
  Card,
  Badge,
  EmptyState,
  ConfirmModal,
  SegmentedFilter,
  IconButton,
  Select
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Event Prints exists for on-site convention printing: pick any product the
   catalog can produce — no Shopify order required — set quantities, and run
   the same PPTX engine used for real batches. */
const PRODUCT_TYPES = ['Lighter', 'Tin', 'Wallet', 'Ashtray', 'Box', 'Grinder/Jar/Tray'];
/* Slots per printed page, per production group (Decision #48 for Lighter). */
const PER_PAGE = {
  Lighter: 10,
  Tin: 8,
  Wallet: 4,
  Ashtray: 6,
  Box: 3,
  'Grinder/Jar/Tray': 3
};
const DESIGNS = [{
  design: 'DESNAM',
  name: 'Naruto — Sage',
  type: 'Lighter'
}, {
  design: 'DESGOK',
  name: 'Goku — Ultra',
  type: 'Lighter'
}, {
  design: 'DESLUF',
  name: 'Luffy — Gear 5',
  type: 'Lighter'
}, {
  design: 'DESZOR',
  name: 'Zoro — Three Sword',
  type: 'Lighter'
}, {
  design: 'DESNEZ',
  name: 'Nezuko — Bamboo',
  type: 'Lighter'
}, {
  design: 'DESGOJ',
  name: 'Gojo — Infinity',
  type: 'Tin'
}, {
  design: 'DESITA',
  name: 'Itachi — Crow',
  type: 'Tin'
}, {
  design: 'DESDEK',
  name: 'Deku — One For All',
  type: 'Tin'
}, {
  design: 'DESTAN',
  name: 'Tanjiro — Water',
  type: 'Wallet'
}, {
  design: 'DESSAS',
  name: 'Sasuke — Susanoo',
  type: 'Wallet'
}, {
  design: 'DESACE',
  name: 'Ace — Flame Fist',
  type: 'Ashtray'
}, {
  design: 'DESKAT',
  name: 'Kakashi — Sharingan',
  type: 'Ashtray'
}, {
  design: 'DESSAN',
  name: 'Sanji — Diable Jambe',
  type: 'Box'
}, {
  design: 'DESERE',
  name: 'Eren — Titan',
  type: 'Box'
}, {
  design: 'DESLEV',
  name: 'Levi — Ackerman',
  type: 'Grinder/Jar/Tray'
}, {
  design: 'DESTOD',
  name: 'Todoroki — Half-Cold',
  type: 'Grinder/Jar/Tray'
}];
const EVENT_JOBS = [{
  id: 1,
  name: 'Anime Expo 2026',
  date: '2026-07-04',
  location: 'Los Angeles, CA'
}, {
  id: 2,
  name: 'Comic-Con Booth 412',
  date: '2026-09-19',
  location: 'San Diego, CA'
}];
const EVENT_RUNS = [{
  id: 1,
  at: '2026-07-02 18:20',
  job: 'Anime Expo 2026',
  group: 'Lighter',
  pages: 4,
  items: 40,
  file: 'EVENT-LIGHTER-20260702-001.pptx'
}, {
  id: 2,
  at: '2026-07-02 18:20',
  job: 'Anime Expo 2026',
  group: 'Ashtray',
  pages: 2,
  items: 12,
  file: 'EVENT-ASHTRAY-20260702-001.pptx'
}, {
  id: 3,
  at: '2026-06-28 09:04',
  job: 'Anime Expo 2026',
  group: 'Tin',
  pages: 1,
  items: 16,
  file: 'EVENT-TIN-20260628-001.pptx'
}];
function Metric({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: 'var(--text-hi)',
      lineHeight: 1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--text-low)'
    }
  }, label));
}
function DesignRow({
  d,
  qty,
  onQty,
  expanded,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--line-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '11px 4px'
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13,
      fontWeight: 700,
      width: 86,
      flex: 'none'
    }
  }, d.design), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-mid)',
      flex: 1,
      fontSize: 12,
      minWidth: 0
    }
  }, d.name), /*#__PURE__*/React.createElement(IconButton, {
    icon: "image",
    size: "sm",
    variant: expanded ? 'solid' : 'ghost',
    active: expanded,
    label: "Adjust image",
    onClick: onToggle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "minus",
    size: "sm",
    label: "Decrease",
    onClick: () => onQty(qty - 1)
  }), /*#__PURE__*/React.createElement(Mono, {
    style: {
      width: 26,
      textAlign: 'center',
      fontSize: 13,
      color: qty > 0 ? 'var(--text-hi)' : 'var(--text-faint)'
    }
  }, qty), /*#__PURE__*/React.createElement(IconButton, {
    icon: "plus",
    size: "sm",
    label: "Increase",
    onClick: () => onQty(qty + 1)
  }))), expanded && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      borderRadius: 'var(--radius-sm)',
      margin: '0 4px 14px',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Brightness",
    mono: true,
    defaultValue: "-15"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Contrast",
    mono: true,
    defaultValue: "25"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Saturation",
    mono: true,
    defaultValue: "200"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Sharpness",
    mono: true,
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost"
  }, "Reset"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary"
  }, "Save Adjustment"))));
}
function GroupPreview({
  g
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--line-soft)',
      padding: '14px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, g.type), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-low)',
      fontSize: 11
    }
  }, g.units, " units \xB7 ", g.pages, " page", g.pages === 1 ? '' : 's')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10
    }
  }, g.items.map(d => /*#__PURE__*/React.createElement(Badge, {
    key: d.design
  }, d.design, " \xD7", d.qty))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, Array.from({
    length: g.pages
  }).map((_, i) => {
    const last = i === g.pages - 1 && g.lastFill !== 0;
    const fill = last ? g.lastFill : g.perPage;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontSize: 11
      }
    }, "Page ", i + 1, " \xB7 ", fill, "/", g.perPage), /*#__PURE__*/React.createElement(Badge, {
      tone: last ? 'warning' : 'success'
    }, last ? 'Partial' : 'Full'));
  })));
}
function EventPrints() {
  const [job, setJob] = React.useState(EVENT_JOBS[0]);
  const [type, setType] = React.useState('Lighter');
  const [search, setSearch] = React.useState('');
  const [qty, setQty] = React.useState({
    DESNAM: 10,
    DESGOK: 10,
    DESACE: 6
  });
  const [expanded, setExpanded] = React.useState(null);
  const [dirty, setDirty] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);
  const setQuantity = (design, n) => {
    setQty(s => ({
      ...s,
      [design]: Math.max(0, n)
    }));
    setDirty(true);
  };
  const q = design => Number.isFinite(Number(qty[design])) ? qty[design] : 0;
  const typeOptions = PRODUCT_TYPES.map(t => {
    const units = DESIGNS.filter(d => d.type === t).reduce((a, d) => a + q(d.design), 0);
    return {
      value: t,
      label: t,
      count: units > 0 ? units : undefined
    };
  });
  const visibleDesigns = DESIGNS.filter(d => d.type === type && (!search || d.design.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase())));
  const selectedByType = PRODUCT_TYPES.map(t => {
    const items = DESIGNS.filter(d => d.type === t && q(d.design) > 0).map(d => ({
      ...d,
      qty: q(d.design)
    }));
    const units = items.reduce((a, d) => a + d.qty, 0);
    const perPage = PER_PAGE[t] || 3;
    const pages = Math.ceil(units / perPage) || 0;
    const lastFill = units % perPage;
    return {
      type: t,
      items,
      units,
      pages,
      lastFill,
      perPage
    };
  }).filter(g => g.units > 0);
  const totalUnits = selectedByType.reduce((a, g) => a + g.units, 0);
  const totalGroups = selectedByType.length;
  const totalPages = selectedByType.reduce((a, g) => a + g.pages, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Events",
    title: "Event Prints",
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "x",
        size: 13
      }),
      onClick: () => {
        setQty({});
        setDirty(true);
      }
    }, "Clear All Items")
  }), /*#__PURE__*/React.createElement(Card, {
    bodyStyle: {
      display: 'flex',
      gap: 20,
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 1 280px',
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Saved job",
    fullWidth: true,
    value: String(job.id),
    onChange: e => setJob(EVENT_JOBS.find(j => String(j.id) === e.target.value)),
    options: EVENT_JOBS.map(j => ({
      value: String(j.id),
      label: `${j.name} — ${j.location}`
    }))
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Event name",
    defaultValue: job.name,
    style: {
      flex: '1 1 180px'
    }
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Event date",
    type: "date",
    defaultValue: job.date,
    style: {
      flex: '0 1 160px'
    }
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Location",
    defaultValue: job.location,
    style: {
      flex: '1 1 180px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Save Job"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline"
  }, "Delete Job"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
      gap: 'var(--space-6)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Browse by product type",
    title: "Select Products",
    bodyStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SegmentedFilter, {
    options: typeOptions,
    value: type,
    onChange: t => {
      setType(t);
      setExpanded(null);
    }
  }), /*#__PURE__*/React.createElement(Input, {
    iconLeft: "search",
    placeholder: "Search designs\u2026",
    value: search,
    onChange: e => setSearch(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 460,
      overflowY: 'auto'
    }
  }, visibleDesigns.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "search",
    title: "NO DESIGNS MATCH",
    compact: true
  }, "Try a different search or product type.") : visibleDesigns.map(d => /*#__PURE__*/React.createElement(DesignRow, {
    key: d.design,
    d: d,
    qty: q(d.design),
    onQty: n => setQuantity(d.design, n),
    expanded: expanded === d.design,
    onToggle: () => setExpanded(expanded === d.design ? null : d.design)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    accent: true,
    eyebrow: "One PPTX per production group",
    title: "Generate",
    bodyStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Units",
    value: totalUnits
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Groups",
    value: totalGroups
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Pages",
    value: totalPages
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: totalUnits === 0,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "file-output",
      size: 15
    }),
    onClick: () => setConfirm(true)
  }, "Generate Print Sheet"), dirty && totalUnits > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      color: 'var(--tone-info)',
      display: 'flex',
      fontSize: 11,
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle",
    size: 13
  }), "Unsaved changes \u2014 save the job before generating.")), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Display only",
    title: "Current Selection",
    bodyStyle: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 340,
      overflowY: 'auto'
    }
  }, selectedByType.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "file-output",
    title: "NOTHING SELECTED",
    compact: true
  }, "Set a quantity on at least one design to preview its page layout.")) : selectedByType.map(g => /*#__PURE__*/React.createElement(GroupPreview, {
    key: g.type,
    g: g
  })))), /*#__PURE__*/React.createElement("details", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      color: 'var(--text-mid)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14
  }), "Run History"), /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 11,
      color: 'var(--text-faint)'
    }
  }, EVENT_RUNS.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: EVENT_RUNS,
    columns: [{
      key: 'at',
      header: 'Generated',
      mono: true,
      width: 150
    }, {
      key: 'group',
      header: 'Group',
      width: 140
    }, {
      key: 'pages',
      header: 'Pages',
      align: 'right',
      mono: true,
      width: 70
    }, {
      key: 'items',
      header: 'Items',
      align: 'right',
      mono: true,
      width: 70
    }, {
      key: 'file',
      header: 'File',
      render: v => /*#__PURE__*/React.createElement("a", {
        href: "#drive"
      }, /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 11
        }
      }, v))
    }],
    emptyLabel: "No generations yet"
  }))))), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm,
    title: `Generate ${totalGroups} print sheet${totalGroups === 1 ? '' : 's'} for ${totalUnits} items?`,
    confirmLabel: "Generate Print Sheet",
    onConfirm: () => setConfirm(false),
    onCancel: () => setConfirm(false)
  }, "One file is produced per production group in the selection, saved to Drive and recorded in run history. No order and no batch are created."));
}
Object.assign(window, {
  EventPrints
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/EventPrints.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/NeedsAttention.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  Button,
  Icon,
  EmptyState,
  DeferredPanel,
  ErrorAlert,
  Badge,
  Checkbox,
  Card
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Expandable "Technical details" disclosure (Decision #97): keeps family,
   config, design code, the raw validation code, the expected Drive path and
   component IDs available without cluttering the operator workspace. */
function TechnicalDetails({
  detail,
  code
}) {
  return /*#__PURE__*/React.createElement("details", {
    className: "status-guide",
    style: {
      background: 'var(--ink-850)',
      borderTop: '1px solid var(--line-soft)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-guide-chevron",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 12
  })), "Technical details"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '10px 24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      padding: '4px 16px 16px 34px'
    }
  }, [['Family', detail.family_code], ['Config', detail.config_code], ['Design', detail.design_code], ['Raw code', code], ['Expected path', detail.expected_path], ['Component IDs', detail.component_ids]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase'
    }
  }, k), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-mid)',
      fontSize: 11,
      wordBreak: 'break-all'
    }
  }, v)))));
}
function BlockedQueue() {
  const [resolved, setResolved] = React.useState([]);
  const rows = BLOCKED.filter(b => !resolved.includes(b.id));
  if (rows.length === 0) {
    return /*#__PURE__*/React.createElement(EmptyState, {
      icon: "circle-check",
      title: "NO BLOCKED COMPONENTS"
    }, "Components appear here when artwork or a required metafield can't be resolved.");
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, rows.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20,
      gridTemplateColumns: '90px minmax(0,1.6fr) 150px minmax(0,1fr) minmax(0,1.4fr)',
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Order"), /*#__PURE__*/React.createElement("a", {
    href: `#orders/${b.order.replace('#', '')}`
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, b.order))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Item / SKU"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13
    }
  }, b.item), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-low)',
      fontSize: 11
    }
  }, b.sku)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Components"), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-mid)',
      fontSize: 12
    }
  }, b.components)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Issue"), /*#__PURE__*/React.createElement(FailureText, {
    code: b.code
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 6
    }
  }, "Resolution"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-mid)',
      fontSize: 12,
      marginBottom: 10
    }
  }, failureResolution(b.code)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, b.code === 'MISSING_ARTWORK' ? /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 13
    }),
    onClick: () => setResolved(r => [...r, b.id])
  }, "Re-upload artwork") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "tag",
      size: 13
    }),
    onClick: () => setResolved(r => [...r, b.id])
  }, "Fix SKU mapping")))), /*#__PURE__*/React.createElement(TechnicalDetails, {
    detail: b.detail,
    code: b.code
  }))));
}

/* Missing SKU queue with single + bulk recovery (Decision #104): select many →
   generate proposals → one-page review → approve/reject → bulk reimport. */
function MissingSkuQueue() {
  const [selected, setSelected] = React.useState([]);
  const [review, setReview] = React.useState(null);
  const [decisions, setDecisions] = React.useState({});
  const [approvedCount, setApprovedCount] = React.useState(0);
  const openReview = ids => {
    setReview(ids);
    setDecisions({});
  };
  const decide = (id, verdict) => setDecisions(d => ({
    ...d,
    [id]: verdict
  }));
  if (review) {
    const items = NO_SKU.filter(n => review.includes(n.id));
    const approved = items.filter(n => decisions[n.id] === 'approve').length;
    const rejected = items.filter(n => decisions[n.id] === 'reject').length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        alignItems: 'center',
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "chevron-right",
        size: 13,
        style: {
          transform: 'rotate(180deg)'
        }
      }),
      onClick: () => setReview(null)
    }, "Back to queue"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-low)',
        fontSize: 12
      }
    }, approved, " approved \xB7 ", rejected, " rejected \xB7 ", items.length - approved - rejected, " pending")), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "SKU recovery",
      title: "REVIEW PROPOSALS"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, items.map(n => {
      const v = decisions[n.id];
      return /*#__PURE__*/React.createElement("div", {
        key: n.id,
        style: {
          alignItems: 'center',
          borderBottom: '1px solid var(--line-soft)',
          display: 'grid',
          gap: 18,
          gridTemplateColumns: '90px minmax(0,1fr) minmax(0,1fr) 190px',
          padding: '14px 0'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 13
        }
      }, n.order), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-hi)',
          fontSize: 13
        }
      }, n.item), /*#__PURE__*/React.createElement(Mono, {
        style: {
          color: 'var(--text-low)',
          fontSize: 11
        }
      }, n.line_item)), /*#__PURE__*/React.createElement(Mono, {
        style: {
          color: v === 'reject' ? 'var(--text-faint)' : 'var(--tone-success)',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: v === 'reject' ? 'line-through' : 'none'
        }
      }, n.proposal), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end'
        }
      }, v ? /*#__PURE__*/React.createElement(StatusBadge, {
        status: v === 'approve' ? 'Success' : 'Canceled',
        label: v === 'approve' ? 'Approved' : 'Rejected',
        size: "sm"
      }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        onClick: () => decide(n.id, 'approve')
      }, "Approve"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        onClick: () => decide(n.id, 'reject')
      }, "Reject"))));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      onClick: () => setDecisions(Object.fromEntries(items.map(n => [n.id, 'approve'])))
    }, "Approve all"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => setDecisions(Object.fromEntries(items.map(n => [n.id, 'reject'])))
    }, "Reject all"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: approved === 0,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 13
      }),
      onClick: () => {
        setApprovedCount(approved);
        setReview(null);
        setSelected([]);
      }
    }, "Apply and reimport ", approved > 0 ? `(${approved})` : '')), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-low)',
        fontSize: 11,
        margin: '12px 0 0'
      }
    }, "Rejected proposals are discarded and never persisted. Approved proposals save to the canonical SKU dictionary and join the cumulative Shopify CSV export.")));
  }
  const allIds = NO_SKU.map(n => n.id);
  const headerChecked = selected.length === allIds.length && allIds.length > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, approvedCount > 0 && /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: "success",
    title: `${approvedCount} SKUs applied`
  }, "The affected orders were reimported from Shopify and their missing production components created."), /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: NO_SKU,
    selectable: true,
    selected: selected,
    onSelect: setSelected,
    columns: [{
      key: 'order',
      header: 'Order',
      mono: true,
      width: 100,
      render: v => /*#__PURE__*/React.createElement("a", {
        href: `#orders/${v.replace('#', '')}`
      }, /*#__PURE__*/React.createElement(Mono, null, v))
    }, {
      key: 'item',
      header: 'Item'
    }, {
      key: 'line_item',
      header: 'Line Item',
      mono: true,
      width: 120
    }, {
      key: 'action',
      header: 'Action',
      align: 'right',
      width: 170,
      render: (_v, row) => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        onClick: e => {
          e.stopPropagation();
          openReview([row.id]);
        }
      }, "Generate SKU")
    }],
    emptyLabel: "No items with a missing SKU"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 12,
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: headerChecked,
    indeterminate: selected.length > 0 && !headerChecked,
    onChange: on => setSelected(on ? allIds : []),
    label: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, "Select all")
  }), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-low)',
      fontSize: 12
    }
  }, selected.length, " selected"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    disabled: selected.length === 0,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "tag",
      size: 13
    }),
    onClick: () => openReview(selected)
  }, "Generate proposals")));
}
function NeedsAttention() {
  const [queue, setQueue] = React.useState('blocked');
  const queues = [{
    key: 'blocked',
    label: 'Blocked',
    count: BLOCKED.length
  }, {
    key: 'missing',
    label: 'Missing SKU',
    count: NO_SKU.length
  }, {
    key: 'deferred',
    label: 'Deferred',
    count: DEFERRED.length
  }, {
    key: 'webhooks',
    label: 'Webhook Failures',
    count: WEBHOOKS.length
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Operations",
    title: "Needs Attention"
  }), /*#__PURE__*/React.createElement(QueueSwitcher, {
    queues: queues,
    active: queue,
    onChange: setQueue
  }), queue === 'blocked' && /*#__PURE__*/React.createElement(BlockedQueue, null), queue === 'missing' && /*#__PURE__*/React.createElement(MissingSkuQueue, null), queue === 'deferred' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: DEFERRED,
    columns: [{
      key: 'order',
      header: 'Order',
      mono: true,
      width: 100,
      render: v => /*#__PURE__*/React.createElement("a", {
        href: `#orders/${v.replace('#', '')}`
      }, /*#__PURE__*/React.createElement(Mono, null, v))
    }, {
      key: 'item',
      header: 'Item / SKU',
      render: (v, row) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-hi)',
          fontSize: 13
        }
      }, v), /*#__PURE__*/React.createElement(Mono, {
        style: {
          color: 'var(--text-low)',
          fontSize: 11
        }
      }, row.sku))
    }, {
      key: 'reason',
      header: 'Reason',
      render: (_v, row) => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-mid)',
          fontSize: 12
        }
      }, failureLabel(row.code))
    }],
    emptyLabel: "No deferred items"
  }), /*#__PURE__*/React.createElement(DeferredPanel, {
    title: "Standalone grinder production",
    eta: "post-MVP"
  }, "GRD line items parse to a valid SKU but route here rather than into a print batch. They never block the rest of an order. This queue is informational and read-only.")), queue === 'webhooks' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: WEBHOOKS,
    columns: [{
      key: 'topic',
      header: 'Topic',
      mono: true,
      width: 180
    }, {
      key: 'order_ref',
      header: 'Shopify order reference',
      mono: true,
      width: 200
    }, {
      key: 'failure_summary',
      header: 'Failure summary',
      render: v => /*#__PURE__*/React.createElement(FailureText, {
        code: v
      })
    }, {
      key: 'received_at',
      header: 'Received at',
      mono: true,
      width: 170,
      render: v => /*#__PURE__*/React.createElement(Muted, null, v)
    }],
    emptyLabel: "No webhook processing failures"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-low)',
      fontSize: 11,
      margin: 0
    }
  }, "Read-only. Failed webhook deliveries are reported separately and do not contribute to the Needs Attention navigation badge.")), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Component',
      entries: [{
        status: 'Blocked',
        meaning: 'Artwork or a required metafield could not be resolved. Counted in the navigation badge, including items blocked with NO_SKU.'
      }, {
        status: 'Deferred MVP',
        meaning: 'A supported SKU held out of production for a later phase. Never blocks the rest of an order.'
      }]
    }]
  }));
}
Object.assign(window, {
  NeedsAttention,
  BlockedQueue,
  MissingSkuQueue,
  TechnicalDetails
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/NeedsAttention.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/OrderDetail.jsx
try { (() => {
const {
  Card,
  DataTable,
  StatusBadge,
  AgingFlag,
  Button,
  Icon,
  Badge,
  ErrorAlert,
  ConfirmModal,
  PairBracket,
  SegmentedSku,
  LoadingState
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Order Detail — Decisions #91 (four tabs), #98 (connected four-part summary),
   #102 (direct source-artwork / generated-file access), #103 (one aggregated
   order + component + relevant-batch timeline). Transcribed from
   `frontend/src/components/orders/OrderDetailScreen.tsx`.

   Families that are never produced are listed separately (§2.3). */
const NON_PRODUCED_FAMILIES = ['BAT', 'HOD', 'PIL', 'TAP', 'TOT'];
/* Front/back pairs that move as one unit (Decision #86). */
const PAIR_COMPONENT_CODES = ['LITF', 'LITB', 'WALF', 'WALB'];
/* Terminal order states never show the aging flag. */
const AGING_SUPPRESSED_STATUSES = ['Fulfilled Externally', 'Canceled'];
const TABS = [{
  id: 'production',
  label: 'Production'
}, {
  id: 'items',
  label: 'Order items'
}, {
  id: 'files',
  label: 'Files and reprints'
}, {
  id: 'history',
  label: 'History'
}];

/* Order #1034 — carries an active reprint flag, so it renders
   `In Production (Needs Reprint)` (Decision #71) and is 7 calendar days old,
   past the 4-day aging threshold (Decisions #75, #87). */
const ORDER = {
  id: 1034,
  order_number: '#1034',
  status: 'In Production (Needs Reprint)',
  shopify_created_at: 'Aug 27, 2026 09:14',
  financial_status: 'paid',
  fulfillment_status: null,
  iso: daysAgoIso(7)
};
const ITEMS = [{
  id: 1,
  product_name: 'Naruto Flip Lighter + Tin Case',
  sku: 'LIT-DESNAM-SIL-TOR-LITTIN',
  family_code: 'LIT',
  design_code: 'DESNAM',
  options: {
    color: 'SIL',
    flame: 'TOR'
  },
  config_code: 'LITTIN',
  variant_title: 'Silver / Torch',
  quantity: 1,
  failure: null
}, {
  id: 2,
  product_name: 'Naruto Ashtray',
  sku: 'ASH-DESNAM-CLR-SOLO',
  family_code: 'ASH',
  design_code: 'DESNAM',
  options: {
    color: 'CLR'
  },
  config_code: 'SOLO',
  variant_title: 'Clear',
  quantity: 2,
  failure: null
}, {
  id: 3,
  product_name: 'Sanji Stash Box — Large',
  sku: 'BOX-DESSAN-BOX4',
  family_code: 'BOX',
  design_code: 'DESSAN',
  options: null,
  config_code: 'BOX4',
  variant_title: 'Large / Black',
  quantity: 1,
  failure: null
}, {
  id: 4,
  product_name: 'Nezuko Tapestry — 40x60',
  sku: 'TAP-DESNEZ-LRG-SOLO',
  family_code: 'TAP',
  design_code: 'DESNEZ',
  options: {
    size: 'LRG'
  },
  config_code: 'SOLO',
  variant_title: '40x60',
  quantity: 1,
  failure: null
}, {
  id: 5,
  product_name: 'Herb Grinder — Nezuko',
  sku: 'GRD-DESNEZ-BLK-SOLO',
  family_code: 'GRD',
  design_code: 'DESNEZ',
  options: {
    color: 'BLK'
  },
  config_code: 'SOLO',
  variant_title: 'Black',
  quantity: 1,
  failure: 'FAMILY_DEFERRED_MVP'
}];

/* One component row per produced unit. `order_item_id` ties a replacement back
   to the original it was created for; `artwork` carries the Drive source
   (Decision #102). */
const COMPONENTS = [{
  id: 1181,
  order_item_id: 1,
  component_code: 'LITF',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Reprint Needed',
  failure: null,
  batch_id: 7,
  batch_label: 'Lighter #7',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Flip Lighter/Front/DESNAM.png',
    drive: true
  }
}, {
  id: 1182,
  order_item_id: 1,
  component_code: 'LITB',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Reprint Needed',
  failure: null,
  batch_id: 7,
  batch_label: 'Lighter #7',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Flip Lighter/Back/DESNAM.png',
    drive: true
  }
}, {
  id: 1207,
  order_item_id: 1,
  component_code: 'LITF',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Queued',
  failure: null,
  batch_id: 8,
  batch_label: 'Lighter #8',
  artwork: null
}, {
  id: 1208,
  order_item_id: 1,
  component_code: 'LITB',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Queued',
  failure: null,
  batch_id: 8,
  batch_label: 'Lighter #8',
  artwork: null
}, {
  id: 1183,
  order_item_id: 1,
  component_code: 'TIN',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Tin',
  status: 'Printed',
  failure: null,
  batch_id: 4,
  batch_label: 'Tin #4',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Tin Case/DESNAM.png',
    drive: true
  }
}, {
  id: 1184,
  order_item_id: 2,
  component_code: 'ASH',
  family_code: 'ASH',
  design_code: 'DESNAM',
  config_code: 'SOLO',
  batch_group: 'Ashtray',
  status: 'Ready',
  failure: null,
  batch_id: 12,
  batch_label: 'Ashtray #12',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Ashtray/DESNAM.png',
    drive: true
  }
}, {
  id: 1185,
  order_item_id: 2,
  component_code: 'ASH',
  family_code: 'ASH',
  design_code: 'DESNAM',
  config_code: 'SOLO',
  batch_group: 'Ashtray',
  status: 'Ready',
  failure: null,
  batch_id: 12,
  batch_label: 'Ashtray #12',
  artwork: null
}, {
  id: 1186,
  order_item_id: 3,
  component_code: 'BOX',
  family_code: 'BOX',
  design_code: 'DESSAN',
  config_code: 'BOX4',
  batch_group: 'Box',
  status: 'Blocked',
  failure: 'MISSING_ARTWORK',
  batch_id: null,
  batch_label: null,
  artwork: {
    design_code: 'DESSAN',
    status: 'Missing',
    source_file_path: 'artwork/Stash Box/DESSAN.png',
    drive: false
  }
}, {
  id: 1187,
  order_item_id: 5,
  component_code: 'GRD',
  family_code: 'GRD',
  design_code: 'DESNEZ',
  config_code: 'SOLO',
  batch_group: '—',
  status: 'Deferred MVP',
  failure: 'FAMILY_DEFERRED_MVP',
  batch_id: null,
  batch_label: null,
  artwork: null
}];
const GENERATED_FILES = [{
  id: 1,
  file_name: 'LIGHTER-07-20260829.pptx',
  file_type: 'PPTX',
  batch_id: 7,
  batch_label: 'Lighter #7',
  created_at: 'Aug 29, 2026 14:02',
  drive: true
}, {
  id: 2,
  file_name: 'TIN-04-20260828.pptx',
  file_type: 'PPTX',
  batch_id: 4,
  batch_label: 'Tin #4',
  created_at: 'Aug 28, 2026 10:40',
  drive: true
}, {
  id: 3,
  file_name: 'LIGHTER-07-20260829-preview.pptx',
  file_type: 'PPTX (preview)',
  batch_id: 7,
  batch_label: 'Lighter #7',
  created_at: 'Aug 29, 2026 11:17',
  drive: false
}];

/* Decision #103: order events, component events for this order's components,
   and batch events for batches holding them — one timeline, newest first. */
const HISTORY = [{
  id: 40,
  when: 'Sep 3, 2026 08:22',
  actor: 'Operator',
  action: 'component_reprint_flagged',
  object: 'Component 1181 · LITF'
}, {
  id: 39,
  when: 'Sep 3, 2026 08:22',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1207 · LITF'
}, {
  id: 38,
  when: 'Sep 3, 2026 08:22',
  actor: 'System',
  action: 'order_status_changed',
  object: 'Order #1034'
}, {
  id: 37,
  when: 'Sep 1, 2026 16:05',
  actor: 'Operator',
  action: 'batch_marked_printed',
  object: 'Batch Tin #4'
}, {
  id: 36,
  when: 'Aug 29, 2026 14:02',
  actor: 'Operator',
  action: 'pptx_generated',
  object: 'Batch Lighter #7'
}, {
  id: 35,
  when: 'Aug 29, 2026 09:51',
  actor: 'System',
  action: 'component_blocked',
  object: 'Component 1186 · BOX'
}, {
  id: 34,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1181 · LITF'
}, {
  id: 33,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'order_imported',
  object: 'Order #1034'
}];
const HISTORY_OLDER = [{
  id: 32,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1187 · GRD'
}, {
  id: 31,
  when: 'Aug 27, 2026 09:15',
  actor: 'System',
  action: 'sku_parsed',
  object: 'Order item 4 · TAP-DESNEZ-LRG-SOLO'
}, {
  id: 30,
  when: 'Aug 27, 2026 09:14',
  actor: 'System',
  action: 'webhook_received',
  object: 'orders/paid · #1034'
}];
function SummaryCell({
  icon,
  label,
  divider,
  emphasis,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: divider ? '1px solid var(--line)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      minHeight: 112,
      padding: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      color: 'var(--text-low)',
      display: 'inline-flex',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      gap: 'var(--space-2)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      background: 'var(--spice-tint)',
      border: '1px solid var(--line-spice)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--spice-400)',
      display: 'inline-flex',
      height: 28,
      justifyContent: 'center',
      width: 28
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    strokeWidth: 2
  })), label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-hi)',
      fontFamily: emphasis ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: emphasis ? 24 : 16,
      fontWeight: 700,
      lineHeight: 1.2
    }
  }, children));
}

/* Financial and Fulfillment status stay plain label/value context — never
   status badges (§2.3). */
function PlainStatus({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      color: 'var(--text-low)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("dd", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 14,
      fontWeight: 600,
      margin: 0,
      textTransform: 'capitalize'
    }
  }, value || '—'));
}
function BatchLink({
  id,
  label
}) {
  if (!id) return /*#__PURE__*/React.createElement(Muted, null, "\u2014");
  return /*#__PURE__*/React.createElement("a", {
    href: `#batches/${id}`
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 12
    }
  }, label || `#${id}`));
}
function OrderDetail({
  go
}) {
  const [tab, setTab] = React.useState('production');
  const [components, setComponents] = React.useState(COMPONENTS);
  const [confirm, setConfirm] = React.useState(null);
  const [reprintTarget, setReprintTarget] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const [history, setHistory] = React.useState(null);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyExpanded, setHistoryExpanded] = React.useState(false);

  /* Decision #103: the aggregated timeline is fetched lazily, the first time
     the History tab opens. `historyLoading` is deliberately NOT a dependency —
     the effect sets it, so depending on it would let the re-run's cleanup
     cancel its own pending timer. `setHistory(null)` after a reprint re-arms
     this and refetches. */
  React.useEffect(() => {
    if (tab !== 'history' || history) return;
    setHistoryLoading(true);
    const t = window.setTimeout(() => {
      setHistory(HISTORY);
      setHistoryLoading(false);
    }, 700);
    return () => window.clearTimeout(t);
  }, [tab, history]);
  const hasLighterPair = components.some(c => c.component_code === 'LITF' || c.component_code === 'LITB');

  /* A bracketed component still shows its own status badge — the bracket is a
     grouping cue, never a status (Decision #86). TIN only shares a source
     artwork file with the lighter pair, so it gets the distinct
     `shared-source` treatment. */
  const relationshipCell = c => {
    const inner = /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-hi)',
        fontWeight: 700
      }
    }, c.component_code);
    if (PAIR_COMPONENT_CODES.includes(c.component_code)) return /*#__PURE__*/React.createElement(PairBracket, {
      variant: "pair"
    }, inner);
    if (c.component_code === 'TIN' && hasLighterPair) return /*#__PURE__*/React.createElement(PairBracket, {
      variant: "shared-source"
    }, inner);
    return inner;
  };
  const flagReprint = () => {
    const target = reprintTarget;
    if (!target) return;
    /* Flagging transitions the component to Reprint Needed and queues its
       replacement automatically; front/back pairs are flagged together. There
       is no reason field and no manual batch assignment. */
    const group = PAIR_COMPONENT_CODES.includes(target.component_code) ? components.filter(c => c.order_item_id === target.order_item_id && PAIR_COMPONENT_CODES.includes(c.component_code) && c.status === 'Printed') : [target];
    const nextId = Math.max(...components.map(c => c.id)) + 1;
    const replacements = group.map((c, i) => ({
      ...c,
      id: nextId + i,
      status: 'Queued',
      batch_id: null,
      batch_label: null,
      artwork: null
    }));
    setComponents([...components.map(c => group.some(g => g.id === c.id) ? {
      ...c,
      status: 'Reprint Needed'
    } : c), ...replacements]);
    setReprintTarget(null);
    setNotice({
      tone: 'success',
      title: 'Reprint flagged',
      body: `${group.map(c => c.component_code).join(', ')} marked Reprint Needed. ${group.length} replacement component${group.length > 1 ? 's' : ''} queued for the current Open batch.`
    });
    setHistory(null);
  };
  const componentColumns = [{
    key: 'component_code',
    header: 'Relationship / Component',
    width: 175,
    render: (_v, c) => relationshipCell(c)
  }, {
    key: 'family_code',
    header: 'Family',
    mono: true,
    width: 85
  }, {
    key: 'design_code',
    header: 'Design',
    mono: true,
    width: 110
  }, {
    key: 'config_code',
    header: 'Config',
    mono: true,
    width: 105
  }, {
    key: 'batch_group',
    header: 'Batch Group',
    width: 120,
    render: v => /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontSize: 12
      }
    }, v)
  },
  /* Component lists render a stored `Canceled` as "Print Not Needed"
     (Decision #64) — the Status Guide keeps the raw string. */
  {
    key: 'status',
    header: 'Status',
    width: 165,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      context: "component",
      size: "sm"
    })
  }, {
    key: 'failure',
    header: 'Failure',
    width: 175,
    render: v => v ? /*#__PURE__*/React.createElement(FailureText, {
      code: v
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }, {
    key: 'batch_id',
    header: 'Batch',
    width: 115,
    render: (_v, c) => /*#__PURE__*/React.createElement(BatchLink, {
      id: c.batch_id,
      label: c.batch_label
    })
  }, {
    key: 'recovery',
    header: 'Recovery',
    align: 'right',
    width: 130,
    render: (_v, c) => c.status === 'Printed' ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      onClick: () => setReprintTarget(c)
    }, "Flag Reprint") : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }];
  const itemColumns = [{
    key: 'product_name',
    header: 'Product'
  }, {
    key: 'sku',
    header: 'SKU',
    width: 330,
    render: (_v, it) => /*#__PURE__*/React.createElement(SegmentedSku, {
      sku: it.sku,
      familyCode: it.family_code,
      designCode: it.design_code,
      options: it.options,
      configCode: it.config_code,
      size: "sm"
    })
  }, {
    key: 'variant_title',
    header: 'Variant',
    width: 150,
    render: v => /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontSize: 12
      }
    }, v)
  }, {
    key: 'quantity',
    header: 'Qty',
    align: 'right',
    width: 70,
    mono: true
  }, {
    key: 'failure',
    header: 'Failure',
    width: 175,
    render: v => v ? /*#__PURE__*/React.createElement(FailureText, {
      code: v
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }];
  const producedItems = ITEMS.filter(i => !NON_PRODUCED_FAMILIES.includes(i.family_code));
  const nonProducedItems = ITEMS.filter(i => NON_PRODUCED_FAMILIES.includes(i.family_code));
  const producedComponents = components.filter(c => c.status !== 'Deferred MVP');
  const deferredComponents = components.filter(c => c.status === 'Deferred MVP');
  const reprintOriginals = components.filter(c => c.status === 'Reprint Needed');
  const artworkComponents = components.filter(c => c.artwork);
  const agingSuppressed = AGING_SUPPRESSED_STATUSES.includes(ORDER.status);
  const replacementFor = original => components.find(c => c.id !== original.id && c.order_item_id === original.order_item_id && c.component_code === original.component_code && c.status !== 'Reprint Needed');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "#orders",
    onClick: e => {
      e.preventDefault();
      go && go('orders');
    },
    style: {
      alignItems: 'center',
      color: 'var(--text-mid)',
      display: 'inline-flex',
      fontSize: 11,
      fontWeight: 700,
      gap: 6,
      letterSpacing: '0.1em',
      marginBottom: 14,
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 13,
    style: {
      transform: 'rotate(180deg)'
    }
  }), "Orders"), /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Order Detail",
    title: `Order ${ORDER.order_number}`,
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 15
      }),
      onClick: () => setConfirm('reimport')
    }, "Reimport")
  })), /*#__PURE__*/React.createElement("div", {
    "aria-label": "Order summary",
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "circle-dashed",
    label: "Status",
    divider: true
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: ORDER.status,
    size: "sm"
  }), !agingSuppressed && /*#__PURE__*/React.createElement(AgingFlag, {
    sinceIso: ORDER.iso
  }))), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "clock",
    label: "Order Date",
    divider: true
  }, ORDER.shopify_created_at), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "shopping-cart",
    label: "# of Items",
    divider: true,
    emphasis: true
  }, ITEMS.length), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "boxes",
    label: "# of Components",
    emphasis: true
  }, components.length)), /*#__PURE__*/React.createElement("dl", {
    style: {
      alignItems: 'center',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-8)',
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(PlainStatus, {
    label: "Financial Status",
    value: ORDER.financial_status
  }), /*#__PURE__*/React.createElement(PlainStatus, {
    label: "Fulfillment Status",
    value: ORDER.fulfillment_status || 'Unfulfilled'
  })), notice && /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: notice.tone,
    title: notice.title,
    onDismiss: () => setNotice(null)
  }, notice.body), /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Order detail sections",
    style: {
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      gap: 'var(--space-5)',
      overflowX: 'auto'
    }
  }, TABS.map(t => {
    const on = t.id === tab;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => setTab(t.id),
      style: {
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${on ? 'var(--spice-500)' : 'transparent'}`,
        color: on ? 'var(--text-hi)' : 'var(--text-low)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: 'var(--space-3) var(--space-1)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }
    }, t.label);
  })), tab === 'production' && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Generated",
    title: "PRODUCTION COMPONENTS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: componentColumns,
    rows: producedComponents,
    rowKey: "id",
    emptyLabel: "No production components"
  }), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "Flagging a printed component transitions it to Reprint Needed and queues its replacement in the current Open batch automatically. Front/back pairs are flagged together.")), tab === 'items' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Shopify",
    title: "ORDER ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: itemColumns,
    rows: producedItems,
    rowKey: "id",
    emptyLabel: "No order items"
  })), nonProducedItems.length > 0 && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Not produced",
    title: "NON-PRODUCED ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: itemColumns,
    rows: nonProducedItems,
    rowKey: "id",
    emptyLabel: "No non-produced items"
  }), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "These families are shipped but never printed. They appear in the packing export and generate no production components.")), deferredComponents.length > 0 && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Deferred MVP",
    title: "DEFERRED ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: componentColumns,
    rows: deferredComponents,
    rowKey: "id",
    emptyLabel: "No deferred items"
  }))), tab === 'files' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Recovery",
    title: "REPRINTS"
  }, reprintOriginals.length === 0 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-mid)',
      margin: 0
    }
  }, "No components on this order have been flagged for reprint.")) : /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: reprintOriginals,
    columns: [{
      key: 'component_code',
      header: 'Component',
      width: 175,
      render: (_v, c) => relationshipCell(c)
    }, {
      key: 'design_code',
      header: 'Design',
      mono: true,
      width: 115
    }, {
      key: 'batch_id',
      header: 'Printed in batch',
      width: 150,
      render: (_v, c) => /*#__PURE__*/React.createElement(BatchLink, {
        id: c.batch_id,
        label: c.batch_label
      })
    },
    /* A replacement not yet assigned to a batch reads
       "Awaiting batch" — `Open` is reserved for batch status
       and is never used for a reprint (Decision #88). */
    {
      key: 'replacement',
      header: 'Replacement',
      width: 165,
      render: (_v, c) => {
        const r = replacementFor(c);
        if (r && r.batch_id) return /*#__PURE__*/React.createElement(BatchLink, {
          id: r.batch_id,
          label: r.batch_label
        });
        if (r) return /*#__PURE__*/React.createElement(Badge, {
          tone: "neutral"
        }, "Awaiting batch");
        return /*#__PURE__*/React.createElement(Muted, null, "\u2014");
      }
    }, {
      key: 'status',
      header: 'State',
      width: 165,
      render: v => /*#__PURE__*/React.createElement(StatusBadge, {
        status: v,
        context: "component",
        size: "sm"
      })
    }],
    emptyLabel: "No reprints"
  })), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Drive",
    title: "SOURCE ARTWORK"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--card-gap)',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))'
    }
  }, artworkComponents.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      alignItems: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: c.artwork.drive ? 'tex-halftone' : undefined,
    style: {
      alignItems: 'center',
      backgroundColor: 'var(--ink-850)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-faint)',
      display: 'flex',
      flex: 'none',
      height: 88,
      justifyContent: 'center',
      width: 88
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.artwork.drive ? 'image' : 'octagon-x',
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13
    }
  }, c.component_code, " \xB7 ", c.design_code), /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      display: 'inline-flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: c.artwork.status,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-low)',
      fontSize: 11,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.artwork.source_file_path), c.artwork.drive ? /*#__PURE__*/React.createElement("a", {
    href: "#drive",
    style: {
      fontSize: 12
    }
  }, "Open source artwork in Drive") : /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "No Drive link available")))))), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Drive",
    title: "GENERATED FILES"
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: GENERATED_FILES,
    columns: [{
      key: 'file_name',
      header: 'File',
      render: v => /*#__PURE__*/React.createElement(Mono, {
        style: {
          color: 'var(--text-hi)',
          fontSize: 12
        }
      }, v)
    }, {
      key: 'file_type',
      header: 'Type',
      width: 145,
      render: v => /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 12
        }
      }, v)
    }, {
      key: 'batch_id',
      header: 'Batch',
      width: 140,
      render: (_v, f) => /*#__PURE__*/React.createElement(BatchLink, {
        id: f.batch_id,
        label: f.batch_label
      })
    }, {
      key: 'created_at',
      header: 'Created',
      mono: true,
      width: 175
    }, {
      key: 'drive',
      header: 'Drive',
      align: 'right',
      width: 190,
      render: v => v ? /*#__PURE__*/React.createElement("a", {
        href: "#drive",
        style: {
          fontSize: 12
        }
      }, "Open in Drive") : /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 11
        }
      }, "No Drive link available")
    }],
    emptyLabel: "No generated files are known for this order."
  }))), tab === 'history' && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Lifecycle",
    title: "HISTORY"
  }, historyLoading && !history && /*#__PURE__*/React.createElement(LoadingState, {
    variant: "skeleton",
    rows: 4,
    label: "Loading order history",
    logoSrc: "../../assets/spicedanime-logo-spinner.png"
  }), history && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: historyExpanded ? [...history, ...HISTORY_OLDER] : history,
    columns: [{
      key: 'when',
      header: 'When',
      mono: true,
      width: 185
    }, {
      key: 'actor',
      header: 'Actor',
      width: 120,
      render: v => /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 12
        }
      }, v)
    }, {
      key: 'action',
      header: 'Action',
      mono: true
    }, {
      key: 'object',
      header: 'Object',
      width: 260,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-mid)',
          fontSize: 12
        }
      }, v)
    }],
    emptyLabel: "No recorded lifecycle history for this order"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 14
    }
  }, !historyExpanded && /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setHistoryExpanded(true)
  }, "Load more history"), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "One timeline: this order's events, its components' events, and events for the batches holding them \u2014 newest first.")))), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Order Detail status key",
    groups: [{
      title: 'Order',
      entries: [{
        status: 'Queued for Production',
        meaning: 'Imported and decoded, components not yet all printed.'
      }, {
        status: 'In Production',
        meaning: 'Components printed; order moving toward packing.'
      }, {
        status: 'In Production (Needs Reprint)',
        meaning: 'An active reprint flag exists on at least one component.'
      }, {
        status: 'Fulfilled Externally',
        meaning: 'Reconciled from Shopify as fulfilled outside the app. Terminal.'
      }, {
        status: 'Canceled',
        meaning: 'Cancelled or refunded in Shopify. Terminal.'
      }]
    }, {
      title: 'Component',
      entries: [{
        status: 'Queued',
        meaning: 'Decoded, waiting on artwork resolution.'
      }, {
        status: 'Ready',
        meaning: 'Artwork resolved. Eligible for the next print run.'
      }, {
        status: 'Printed',
        meaning: 'Included in a printed batch.'
      }, {
        status: 'Blocked',
        meaning: 'Artwork or metafield could not be resolved. Excluded from generation.'
      }, {
        status: 'Reprint Needed',
        meaning: 'Flagged for reprint; a replacement component has been created.'
      }, {
        status: 'Deferred MVP',
        meaning: 'Family deferred out of MVP scope. No action required.'
      }, {
        status: 'Canceled',
        meaning: 'Pulled from its batch because the order was cancelled. Shown in component lists as "Print Not Needed".'
      }]
    }]
  }), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'reimport',
    tone: "warning",
    title: "Reimport this order?",
    confirmLabel: "Reimport",
    cancelLabel: "Cancel",
    onConfirm: () => {
      setConfirm(null);
      setNotice({
        tone: 'success',
        title: 'Reimport complete',
        body: 'Items processed: 5. Components created: 0. No duplicate records were made.'
      });
    },
    onCancel: () => setConfirm(null)
  }, "This re-processes the order against current SKU and component rules. It will not duplicate existing order items or components, and fills in missing components if the SKU dictionary has been updated."), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: !!reprintTarget,
    tone: "warning",
    title: "Flag this component for reprint?",
    confirmLabel: "Flag Reprint",
    cancelLabel: "Cancel",
    onConfirm: flagReprint,
    onCancel: () => setReprintTarget(null)
  }, reprintTarget ? `${reprintTarget.component_code} will be marked Reprint Needed and a replacement will be queued in the current Open batch. There is no reason field and no manual batch assignment.` : null));
}
Object.assign(window, {
  OrderDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/OrderDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/OrderDetail.standalone.jsx
try { (() => {
const {
  Card,
  DataTable,
  StatusBadge,
  AgingFlag,
  Button,
  Icon,
  Badge,
  ErrorAlert,
  ConfirmModal,
  PairBracket,
  SegmentedSku,
  LoadingState
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Order Detail — Decisions #91 (four tabs), #98 (connected four-part summary),
   #102 (direct source-artwork / generated-file access), #103 (one aggregated
   order + component + relevant-batch timeline). Transcribed from
   `frontend/src/components/orders/OrderDetailScreen.tsx`.

   Families that are never produced are listed separately (§2.3). */
const NON_PRODUCED_FAMILIES = ['BAT', 'HOD', 'PIL', 'TAP', 'TOT'];
/* Front/back pairs that move as one unit (Decision #86). */
const PAIR_COMPONENT_CODES = ['LITF', 'LITB', 'WALF', 'WALB'];
/* Terminal order states never show the aging flag. */
const AGING_SUPPRESSED_STATUSES = ['Fulfilled Externally', 'Canceled'];
const TABS = [{
  id: 'production',
  label: 'Production'
}, {
  id: 'items',
  label: 'Order items'
}, {
  id: 'files',
  label: 'Files and reprints'
}, {
  id: 'history',
  label: 'History'
}];

/* Order #1034 — carries an active reprint flag, so it renders
   `In Production (Needs Reprint)` (Decision #71) and is 7 calendar days old,
   past the 4-day aging threshold (Decisions #75, #87). */
const ORDER = {
  id: 1034,
  order_number: '#1034',
  status: 'In Production (Needs Reprint)',
  shopify_created_at: 'Aug 27, 2026 09:14',
  financial_status: 'paid',
  fulfillment_status: null,
  iso: daysAgoIso(7)
};
const ITEMS = [{
  id: 1,
  product_name: 'Naruto Flip Lighter + Tin Case',
  sku: 'LIT-DESNAM-SIL-TOR-LITTIN',
  family_code: 'LIT',
  design_code: 'DESNAM',
  options: {
    color: 'SIL',
    flame: 'TOR'
  },
  config_code: 'LITTIN',
  variant_title: 'Silver / Torch',
  quantity: 1,
  failure: null
}, {
  id: 2,
  product_name: 'Naruto Ashtray',
  sku: 'ASH-DESNAM-CLR-SOLO',
  family_code: 'ASH',
  design_code: 'DESNAM',
  options: {
    color: 'CLR'
  },
  config_code: 'SOLO',
  variant_title: 'Clear',
  quantity: 2,
  failure: null
}, {
  id: 3,
  product_name: 'Sanji Stash Box — Large',
  sku: 'BOX-DESSAN-BOX4',
  family_code: 'BOX',
  design_code: 'DESSAN',
  options: null,
  config_code: 'BOX4',
  variant_title: 'Large / Black',
  quantity: 1,
  failure: null
}, {
  id: 4,
  product_name: 'Nezuko Tapestry — 40x60',
  sku: 'TAP-DESNEZ-LRG-SOLO',
  family_code: 'TAP',
  design_code: 'DESNEZ',
  options: {
    size: 'LRG'
  },
  config_code: 'SOLO',
  variant_title: '40x60',
  quantity: 1,
  failure: null
}, {
  id: 5,
  product_name: 'Herb Grinder — Nezuko',
  sku: 'GRD-DESNEZ-BLK-SOLO',
  family_code: 'GRD',
  design_code: 'DESNEZ',
  options: {
    color: 'BLK'
  },
  config_code: 'SOLO',
  variant_title: 'Black',
  quantity: 1,
  failure: 'FAMILY_DEFERRED_MVP'
}];

/* One component row per produced unit. `order_item_id` ties a replacement back
   to the original it was created for; `artwork` carries the Drive source
   (Decision #102). */
const COMPONENTS = [{
  id: 1181,
  order_item_id: 1,
  component_code: 'LITF',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Reprint Needed',
  failure: null,
  batch_id: 7,
  batch_label: 'Lighter #7',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Flip Lighter/Front/DESNAM.png',
    drive: true
  }
}, {
  id: 1182,
  order_item_id: 1,
  component_code: 'LITB',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Reprint Needed',
  failure: null,
  batch_id: 7,
  batch_label: 'Lighter #7',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Flip Lighter/Back/DESNAM.png',
    drive: true
  }
}, {
  id: 1207,
  order_item_id: 1,
  component_code: 'LITF',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Queued',
  failure: null,
  batch_id: 8,
  batch_label: 'Lighter #8',
  artwork: null
}, {
  id: 1208,
  order_item_id: 1,
  component_code: 'LITB',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Lighter',
  status: 'Queued',
  failure: null,
  batch_id: 8,
  batch_label: 'Lighter #8',
  artwork: null
}, {
  id: 1183,
  order_item_id: 1,
  component_code: 'TIN',
  family_code: 'LIT',
  design_code: 'DESNAM',
  config_code: 'LITTIN',
  batch_group: 'Tin',
  status: 'Printed',
  failure: null,
  batch_id: 4,
  batch_label: 'Tin #4',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Tin Case/DESNAM.png',
    drive: true
  }
}, {
  id: 1184,
  order_item_id: 2,
  component_code: 'ASH',
  family_code: 'ASH',
  design_code: 'DESNAM',
  config_code: 'SOLO',
  batch_group: 'Ashtray',
  status: 'Ready',
  failure: null,
  batch_id: 12,
  batch_label: 'Ashtray #12',
  artwork: {
    design_code: 'DESNAM',
    status: 'Available',
    source_file_path: 'artwork/Ashtray/DESNAM.png',
    drive: true
  }
}, {
  id: 1185,
  order_item_id: 2,
  component_code: 'ASH',
  family_code: 'ASH',
  design_code: 'DESNAM',
  config_code: 'SOLO',
  batch_group: 'Ashtray',
  status: 'Ready',
  failure: null,
  batch_id: 12,
  batch_label: 'Ashtray #12',
  artwork: null
}, {
  id: 1186,
  order_item_id: 3,
  component_code: 'BOX',
  family_code: 'BOX',
  design_code: 'DESSAN',
  config_code: 'BOX4',
  batch_group: 'Box',
  status: 'Blocked',
  failure: 'MISSING_ARTWORK',
  batch_id: null,
  batch_label: null,
  artwork: {
    design_code: 'DESSAN',
    status: 'Missing',
    source_file_path: 'artwork/Stash Box/DESSAN.png',
    drive: false
  }
}, {
  id: 1187,
  order_item_id: 5,
  component_code: 'GRD',
  family_code: 'GRD',
  design_code: 'DESNEZ',
  config_code: 'SOLO',
  batch_group: '—',
  status: 'Deferred MVP',
  failure: 'FAMILY_DEFERRED_MVP',
  batch_id: null,
  batch_label: null,
  artwork: null
}];
const GENERATED_FILES = [{
  id: 1,
  file_name: 'LIGHTER-07-20260829.pptx',
  file_type: 'PPTX',
  batch_id: 7,
  batch_label: 'Lighter #7',
  created_at: 'Aug 29, 2026 14:02',
  drive: true
}, {
  id: 2,
  file_name: 'TIN-04-20260828.pptx',
  file_type: 'PPTX',
  batch_id: 4,
  batch_label: 'Tin #4',
  created_at: 'Aug 28, 2026 10:40',
  drive: true
}, {
  id: 3,
  file_name: 'LIGHTER-07-20260829-preview.pptx',
  file_type: 'PPTX (preview)',
  batch_id: 7,
  batch_label: 'Lighter #7',
  created_at: 'Aug 29, 2026 11:17',
  drive: false
}];

/* Decision #103: order events, component events for this order's components,
   and batch events for batches holding them — one timeline, newest first. */
const HISTORY = [{
  id: 40,
  when: 'Sep 3, 2026 08:22',
  actor: 'Operator',
  action: 'component_reprint_flagged',
  object: 'Component 1181 · LITF'
}, {
  id: 39,
  when: 'Sep 3, 2026 08:22',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1207 · LITF'
}, {
  id: 38,
  when: 'Sep 3, 2026 08:22',
  actor: 'System',
  action: 'order_status_changed',
  object: 'Order #1034'
}, {
  id: 37,
  when: 'Sep 1, 2026 16:05',
  actor: 'Operator',
  action: 'batch_marked_printed',
  object: 'Batch Tin #4'
}, {
  id: 36,
  when: 'Aug 29, 2026 14:02',
  actor: 'Operator',
  action: 'pptx_generated',
  object: 'Batch Lighter #7'
}, {
  id: 35,
  when: 'Aug 29, 2026 09:51',
  actor: 'System',
  action: 'component_blocked',
  object: 'Component 1186 · BOX'
}, {
  id: 34,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1181 · LITF'
}, {
  id: 33,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'order_imported',
  object: 'Order #1034'
}];
const HISTORY_OLDER = [{
  id: 32,
  when: 'Aug 27, 2026 09:16',
  actor: 'System',
  action: 'component_created',
  object: 'Component 1187 · GRD'
}, {
  id: 31,
  when: 'Aug 27, 2026 09:15',
  actor: 'System',
  action: 'sku_parsed',
  object: 'Order item 4 · TAP-DESNEZ-LRG-SOLO'
}, {
  id: 30,
  when: 'Aug 27, 2026 09:14',
  actor: 'System',
  action: 'webhook_received',
  object: 'orders/paid · #1034'
}];
function SummaryCell({
  icon,
  label,
  divider,
  emphasis,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: divider ? '1px solid var(--line)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      minHeight: 112,
      padding: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      color: 'var(--text-low)',
      display: 'inline-flex',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      gap: 'var(--space-2)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      background: 'var(--spice-tint)',
      border: '1px solid var(--line-spice)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--spice-400)',
      display: 'inline-flex',
      height: 28,
      justifyContent: 'center',
      width: 28
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    strokeWidth: 2
  })), label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-hi)',
      fontFamily: emphasis ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: emphasis ? 24 : 16,
      fontWeight: 700,
      lineHeight: 1.2
    }
  }, children));
}

/* Financial and Fulfillment status stay plain label/value context — never
   status badges (§2.3). */
function PlainStatus({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      color: 'var(--text-low)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("dd", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 14,
      fontWeight: 600,
      margin: 0,
      textTransform: 'capitalize'
    }
  }, value || '—'));
}
function BatchLink({
  id,
  label
}) {
  if (!id) return /*#__PURE__*/React.createElement(Muted, null, "\u2014");
  return /*#__PURE__*/React.createElement("a", {
    href: `#batches/${id}`
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 12
    }
  }, label || `#${id}`));
}
function OrderDetail({
  go
}) {
  const [tab, setTab] = React.useState('production');
  const [components, setComponents] = React.useState(COMPONENTS);
  const [confirm, setConfirm] = React.useState(null);
  const [reprintTarget, setReprintTarget] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const [history, setHistory] = React.useState(null);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyExpanded, setHistoryExpanded] = React.useState(false);

  /* Decision #103: the aggregated timeline is fetched lazily, the first time
     the History tab opens. `historyLoading` is deliberately NOT a dependency —
     the effect sets it, so depending on it would let the re-run's cleanup
     cancel its own pending timer. `setHistory(null)` after a reprint re-arms
     this and refetches. */
  React.useEffect(() => {
    if (tab !== 'history' || history) return;
    setHistoryLoading(true);
    const t = window.setTimeout(() => {
      setHistory(HISTORY);
      setHistoryLoading(false);
    }, 700);
    return () => window.clearTimeout(t);
  }, [tab, history]);
  const hasLighterPair = components.some(c => c.component_code === 'LITF' || c.component_code === 'LITB');

  /* A bracketed component still shows its own status badge — the bracket is a
     grouping cue, never a status (Decision #86). TIN only shares a source
     artwork file with the lighter pair, so it gets the distinct
     `shared-source` treatment. */
  const relationshipCell = c => {
    const inner = /*#__PURE__*/React.createElement(Mono, {
      style: {
        color: 'var(--text-hi)',
        fontWeight: 700
      }
    }, c.component_code);
    if (PAIR_COMPONENT_CODES.includes(c.component_code)) return /*#__PURE__*/React.createElement(PairBracket, {
      variant: "pair"
    }, inner);
    if (c.component_code === 'TIN' && hasLighterPair) return /*#__PURE__*/React.createElement(PairBracket, {
      variant: "shared-source"
    }, inner);
    return inner;
  };
  const flagReprint = () => {
    const target = reprintTarget;
    if (!target) return;
    /* Flagging transitions the component to Reprint Needed and queues its
       replacement automatically; front/back pairs are flagged together. There
       is no reason field and no manual batch assignment. */
    const group = PAIR_COMPONENT_CODES.includes(target.component_code) ? components.filter(c => c.order_item_id === target.order_item_id && PAIR_COMPONENT_CODES.includes(c.component_code) && c.status === 'Printed') : [target];
    const nextId = Math.max(...components.map(c => c.id)) + 1;
    const replacements = group.map((c, i) => ({
      ...c,
      id: nextId + i,
      status: 'Queued',
      batch_id: null,
      batch_label: null,
      artwork: null
    }));
    setComponents([...components.map(c => group.some(g => g.id === c.id) ? {
      ...c,
      status: 'Reprint Needed'
    } : c), ...replacements]);
    setReprintTarget(null);
    setNotice({
      tone: 'success',
      title: 'Reprint flagged',
      body: `${group.map(c => c.component_code).join(', ')} marked Reprint Needed. ${group.length} replacement component${group.length > 1 ? 's' : ''} queued for the current Open batch.`
    });
    setHistory(null);
  };
  const componentColumns = [{
    key: 'component_code',
    header: 'Relationship / Component',
    width: 175,
    render: (_v, c) => relationshipCell(c)
  }, {
    key: 'family_code',
    header: 'Family',
    mono: true,
    width: 85
  }, {
    key: 'design_code',
    header: 'Design',
    mono: true,
    width: 110
  }, {
    key: 'config_code',
    header: 'Config',
    mono: true,
    width: 105
  }, {
    key: 'batch_group',
    header: 'Batch Group',
    width: 120,
    render: v => /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontSize: 12
      }
    }, v)
  },
  /* Component lists render a stored `Canceled` as "Print Not Needed"
     (Decision #64) — the Status Guide keeps the raw string. */
  {
    key: 'status',
    header: 'Status',
    width: 165,
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      context: "component",
      size: "sm"
    })
  }, {
    key: 'failure',
    header: 'Failure',
    width: 175,
    render: v => v ? /*#__PURE__*/React.createElement(FailureText, {
      code: v
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }, {
    key: 'batch_id',
    header: 'Batch',
    width: 115,
    render: (_v, c) => /*#__PURE__*/React.createElement(BatchLink, {
      id: c.batch_id,
      label: c.batch_label
    })
  }, {
    key: 'recovery',
    header: 'Recovery',
    align: 'right',
    width: 130,
    render: (_v, c) => c.status === 'Printed' ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      onClick: () => setReprintTarget(c)
    }, "Flag Reprint") : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }];
  const itemColumns = [{
    key: 'product_name',
    header: 'Product'
  }, {
    key: 'sku',
    header: 'SKU',
    width: 330,
    render: (_v, it) => /*#__PURE__*/React.createElement(SegmentedSku, {
      sku: it.sku,
      familyCode: it.family_code,
      designCode: it.design_code,
      options: it.options,
      configCode: it.config_code,
      size: "sm"
    })
  }, {
    key: 'variant_title',
    header: 'Variant',
    width: 150,
    render: v => /*#__PURE__*/React.createElement(Muted, {
      style: {
        fontSize: 12
      }
    }, v)
  }, {
    key: 'quantity',
    header: 'Qty',
    align: 'right',
    width: 70,
    mono: true
  }, {
    key: 'failure',
    header: 'Failure',
    width: 175,
    render: v => v ? /*#__PURE__*/React.createElement(FailureText, {
      code: v
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }];
  const producedItems = ITEMS.filter(i => !NON_PRODUCED_FAMILIES.includes(i.family_code));
  const nonProducedItems = ITEMS.filter(i => NON_PRODUCED_FAMILIES.includes(i.family_code));
  const producedComponents = components.filter(c => c.status !== 'Deferred MVP');
  const deferredComponents = components.filter(c => c.status === 'Deferred MVP');
  const reprintOriginals = components.filter(c => c.status === 'Reprint Needed');
  const artworkComponents = components.filter(c => c.artwork);
  const agingSuppressed = AGING_SUPPRESSED_STATUSES.includes(ORDER.status);
  const replacementFor = original => components.find(c => c.id !== original.id && c.order_item_id === original.order_item_id && c.component_code === original.component_code && c.status !== 'Reprint Needed');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "#orders",
    onClick: e => {
      e.preventDefault();
      go && go('orders');
    },
    style: {
      alignItems: 'center',
      color: 'var(--text-mid)',
      display: 'inline-flex',
      fontSize: 11,
      fontWeight: 700,
      gap: 6,
      letterSpacing: '0.1em',
      marginBottom: 14,
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 13,
    style: {
      transform: 'rotate(180deg)'
    }
  }), "Orders"), /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Order Detail",
    title: `Order ${ORDER.order_number}`,
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 15
      }),
      onClick: () => setConfirm('reimport')
    }, "Reimport")
  })), /*#__PURE__*/React.createElement("div", {
    "aria-label": "Order summary",
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "circle-dashed",
    label: "Status",
    divider: true
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: ORDER.status,
    size: "sm"
  }), !agingSuppressed && /*#__PURE__*/React.createElement(AgingFlag, {
    sinceIso: ORDER.iso
  }))), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "clock",
    label: "Order Date",
    divider: true
  }, ORDER.shopify_created_at), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "shopping-cart",
    label: "# of Items",
    divider: true,
    emphasis: true
  }, ITEMS.length), /*#__PURE__*/React.createElement(SummaryCell, {
    icon: "boxes",
    label: "# of Components",
    emphasis: true
  }, components.length)), /*#__PURE__*/React.createElement("dl", {
    style: {
      alignItems: 'center',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-8)',
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(PlainStatus, {
    label: "Financial Status",
    value: ORDER.financial_status
  }), /*#__PURE__*/React.createElement(PlainStatus, {
    label: "Fulfillment Status",
    value: ORDER.fulfillment_status || 'Unfulfilled'
  })), notice && /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: notice.tone,
    title: notice.title,
    onDismiss: () => setNotice(null)
  }, notice.body), /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Order detail sections",
    style: {
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      gap: 'var(--space-5)',
      overflowX: 'auto'
    }
  }, TABS.map(t => {
    const on = t.id === tab;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => setTab(t.id),
      style: {
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${on ? 'var(--spice-500)' : 'transparent'}`,
        color: on ? 'var(--text-hi)' : 'var(--text-low)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: 'var(--space-3) var(--space-1)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }
    }, t.label);
  })), tab === 'production' && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Generated",
    title: "PRODUCTION COMPONENTS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: componentColumns,
    rows: producedComponents,
    rowKey: "id",
    emptyLabel: "No production components"
  }), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "Flagging a printed component transitions it to Reprint Needed and queues its replacement in the current Open batch automatically. Front/back pairs are flagged together.")), tab === 'items' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Shopify",
    title: "ORDER ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: itemColumns,
    rows: producedItems,
    rowKey: "id",
    emptyLabel: "No order items"
  })), nonProducedItems.length > 0 && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Not produced",
    title: "NON-PRODUCED ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: itemColumns,
    rows: nonProducedItems,
    rowKey: "id",
    emptyLabel: "No non-produced items"
  }), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "These families are shipped but never printed. They appear in the packing export and generate no production components.")), deferredComponents.length > 0 && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Deferred MVP",
    title: "DEFERRED ITEMS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: componentColumns,
    rows: deferredComponents,
    rowKey: "id",
    emptyLabel: "No deferred items"
  }))), tab === 'files' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Recovery",
    title: "REPRINTS"
  }, reprintOriginals.length === 0 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-mid)',
      margin: 0
    }
  }, "No components on this order have been flagged for reprint.")) : /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: reprintOriginals,
    columns: [{
      key: 'component_code',
      header: 'Component',
      width: 175,
      render: (_v, c) => relationshipCell(c)
    }, {
      key: 'design_code',
      header: 'Design',
      mono: true,
      width: 115
    }, {
      key: 'batch_id',
      header: 'Printed in batch',
      width: 150,
      render: (_v, c) => /*#__PURE__*/React.createElement(BatchLink, {
        id: c.batch_id,
        label: c.batch_label
      })
    },
    /* A replacement not yet assigned to a batch reads
       "Awaiting batch" — `Open` is reserved for batch status
       and is never used for a reprint (Decision #88). */
    {
      key: 'replacement',
      header: 'Replacement',
      width: 165,
      render: (_v, c) => {
        const r = replacementFor(c);
        if (r && r.batch_id) return /*#__PURE__*/React.createElement(BatchLink, {
          id: r.batch_id,
          label: r.batch_label
        });
        if (r) return /*#__PURE__*/React.createElement(Badge, {
          tone: "neutral"
        }, "Awaiting batch");
        return /*#__PURE__*/React.createElement(Muted, null, "\u2014");
      }
    }, {
      key: 'status',
      header: 'State',
      width: 165,
      render: v => /*#__PURE__*/React.createElement(StatusBadge, {
        status: v,
        context: "component",
        size: "sm"
      })
    }],
    emptyLabel: "No reprints"
  })), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Drive",
    title: "SOURCE ARTWORK"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--card-gap)',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))'
    }
  }, artworkComponents.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      alignItems: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: c.artwork.drive ? 'tex-halftone' : undefined,
    style: {
      alignItems: 'center',
      backgroundColor: 'var(--ink-850)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-faint)',
      display: 'flex',
      flex: 'none',
      height: 88,
      justifyContent: 'center',
      width: 88
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.artwork.drive ? 'image' : 'octagon-x',
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-hi)',
      fontSize: 13
    }
  }, c.component_code, " \xB7 ", c.design_code), /*#__PURE__*/React.createElement("span", {
    style: {
      alignItems: 'center',
      display: 'inline-flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: c.artwork.status,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-low)',
      fontSize: 11,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.artwork.source_file_path), c.artwork.drive ? /*#__PURE__*/React.createElement("a", {
    href: "#drive",
    style: {
      fontSize: 12
    }
  }, "Open source artwork in Drive") : /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "No Drive link available")))))), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Drive",
    title: "GENERATED FILES"
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: GENERATED_FILES,
    columns: [{
      key: 'file_name',
      header: 'File',
      render: v => /*#__PURE__*/React.createElement(Mono, {
        style: {
          color: 'var(--text-hi)',
          fontSize: 12
        }
      }, v)
    }, {
      key: 'file_type',
      header: 'Type',
      width: 145,
      render: v => /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 12
        }
      }, v)
    }, {
      key: 'batch_id',
      header: 'Batch',
      width: 140,
      render: (_v, f) => /*#__PURE__*/React.createElement(BatchLink, {
        id: f.batch_id,
        label: f.batch_label
      })
    }, {
      key: 'created_at',
      header: 'Created',
      mono: true,
      width: 175
    }, {
      key: 'drive',
      header: 'Drive',
      align: 'right',
      width: 190,
      render: v => v ? /*#__PURE__*/React.createElement("a", {
        href: "#drive",
        style: {
          fontSize: 12
        }
      }, "Open in Drive") : /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 11
        }
      }, "No Drive link available")
    }],
    emptyLabel: "No generated files are known for this order."
  }))), tab === 'history' && /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Lifecycle",
    title: "HISTORY"
  }, historyLoading && !history && /*#__PURE__*/React.createElement(LoadingState, {
    variant: "skeleton",
    rows: 4,
    label: "Loading order history",
    logoSrc: window.__resources.spinnerLogo
  }), history && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: historyExpanded ? [...history, ...HISTORY_OLDER] : history,
    columns: [{
      key: 'when',
      header: 'When',
      mono: true,
      width: 185
    }, {
      key: 'actor',
      header: 'Actor',
      width: 120,
      render: v => /*#__PURE__*/React.createElement(Muted, {
        style: {
          fontSize: 12
        }
      }, v)
    }, {
      key: 'action',
      header: 'Action',
      mono: true
    }, {
      key: 'object',
      header: 'Object',
      width: 260,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-mid)',
          fontSize: 12
        }
      }, v)
    }],
    emptyLabel: "No recorded lifecycle history for this order"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 14
    }
  }, !historyExpanded && /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setHistoryExpanded(true)
  }, "Load more history"), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, "One timeline: this order's events, its components' events, and events for the batches holding them \u2014 newest first.")))), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Order Detail status key",
    groups: [{
      title: 'Order',
      entries: [{
        status: 'Queued for Production',
        meaning: 'Imported and decoded, components not yet all printed.'
      }, {
        status: 'In Production',
        meaning: 'Components printed; order moving toward packing.'
      }, {
        status: 'In Production (Needs Reprint)',
        meaning: 'An active reprint flag exists on at least one component.'
      }, {
        status: 'Fulfilled Externally',
        meaning: 'Reconciled from Shopify as fulfilled outside the app. Terminal.'
      }, {
        status: 'Canceled',
        meaning: 'Cancelled or refunded in Shopify. Terminal.'
      }]
    }, {
      title: 'Component',
      entries: [{
        status: 'Queued',
        meaning: 'Decoded, waiting on artwork resolution.'
      }, {
        status: 'Ready',
        meaning: 'Artwork resolved. Eligible for the next print run.'
      }, {
        status: 'Printed',
        meaning: 'Included in a printed batch.'
      }, {
        status: 'Blocked',
        meaning: 'Artwork or metafield could not be resolved. Excluded from generation.'
      }, {
        status: 'Reprint Needed',
        meaning: 'Flagged for reprint; a replacement component has been created.'
      }, {
        status: 'Deferred MVP',
        meaning: 'Family deferred out of MVP scope. No action required.'
      }, {
        status: 'Canceled',
        meaning: 'Pulled from its batch because the order was cancelled. Shown in component lists as "Print Not Needed".'
      }]
    }]
  }), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'reimport',
    tone: "warning",
    title: "Reimport this order?",
    confirmLabel: "Reimport",
    cancelLabel: "Cancel",
    onConfirm: () => {
      setConfirm(null);
      setNotice({
        tone: 'success',
        title: 'Reimport complete',
        body: 'Items processed: 5. Components created: 0. No duplicate records were made.'
      });
    },
    onCancel: () => setConfirm(null)
  }, "This re-processes the order against current SKU and component rules. It will not duplicate existing order items or components, and fills in missing components if the SKU dictionary has been updated."), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: !!reprintTarget,
    tone: "warning",
    title: "Flag this component for reprint?",
    confirmLabel: "Flag Reprint",
    cancelLabel: "Cancel",
    onConfirm: flagReprint,
    onCancel: () => setReprintTarget(null)
  }, reprintTarget ? `${reprintTarget.component_code} will be marked Reprint Needed and a replacement will be queued in the current Open batch. There is no reason field and no manual batch assignment.` : null));
}
Object.assign(window, {
  OrderDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/OrderDetail.standalone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/Orders.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  AgingFlag,
  Button,
  Icon,
  Select,
  Input,
  Checkbox,
  Badge,
  SegmentedSku
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Multi-select status pills: the list narrows to the UNION of active pills
   (Decision #105). Deliberately lighter than the table so the table stays
   the visually primary object. */
function StatusPills({
  options,
  active,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, options.map(o => {
    const on = active.includes(o);
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      onClick: () => onToggle(o),
      style: {
        cursor: 'pointer',
        height: 26,
        padding: '0 10px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--spice-tint)' : 'transparent',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-low)',
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
      }
    }, o);
  }));
}
function Orders({
  go
}) {
  const [q, setQ] = React.useState('');
  const [statuses, setStatuses] = React.useState([]);
  const [dateRange, setDateRange] = React.useState('Last 7 Days');
  const [sortDir, setSortDir] = React.useState(null); // null → asc → desc → null
  const [selected, setSelected] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);
  const [perPage, setPerPage] = React.useState(50);
  const toggleStatus = s => setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const cycleSort = () => setSortDir(d => d === null ? 'asc' : d === 'asc' ? 'desc' : null);
  let rows = ORDER_ROWS.filter(r => {
    if (q && !r.order_number.includes(q)) return false;
    if (statuses.length && !statuses.includes(r.status)) return false;
    return true;
  });
  if (sortDir) {
    rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.id - b.id : b.id - a.id);
  }
  const selectableIds = rows.filter(r => r.reprintable).map(r => r.id);
  const toggleExpand = id => setExpanded(p => p.includes(id) ? p.filter(k => k !== id) : [...p, id]);
  const columns = [
  /* `Order #` is the strongest identifier and the row's only detail link —
     surrounding row whitespace does not navigate (Decisions #105, #108). */
  {
    key: 'order_number',
    width: 110,
    header: /*#__PURE__*/React.createElement(SortHeader, {
      label: "Order #",
      active: !!sortDir,
      dir: sortDir,
      onClick: cycleSort
    }),
    render: (v, row) => /*#__PURE__*/React.createElement("a", {
      href: `#orders/${row.id}`,
      onClick: e => {
        e.preventDefault();
        go && go('orderDetail');
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 13,
        fontWeight: 700
      }
    }, v))
  }, {
    key: 'created_at',
    header: 'Order Date',
    width: 165,
    render: (v, row) => /*#__PURE__*/React.createElement("span", {
      style: {
        alignItems: 'center',
        display: 'inline-flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Muted, null, v), /*#__PURE__*/React.createElement(AgingFlag, {
      sinceIso: row.iso
    }))
  }, {
    key: 'status',
    header: 'Status',
    render: v => /*#__PURE__*/React.createElement(StatusBadge, {
      status: v,
      size: "sm"
    })
  }, {
    key: 'item_count',
    header: 'Items',
    align: 'right',
    mono: true,
    width: 70
  },
  /* `Attention` replaces the permanent Blocked column: quiet when there is
     nothing to resolve, concise (`Blocked 2`) when there is (Decision #105). */
  {
    key: 'blocked',
    header: 'Attention',
    width: 140,
    render: v => v > 0 ? /*#__PURE__*/React.createElement(StatusBadge, {
      status: "Blocked",
      label: `Blocked ${v}`,
      size: "sm"
    }) : /*#__PURE__*/React.createElement(Muted, null, "\u2014")
  }, {
    key: 'reprint',
    header: 'Reprint',
    width: 140,
    align: 'right',
    render: (_v, row) => row.reprintable ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: e => {
        e.stopPropagation();
        toggleExpand(row.id);
      },
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "chevron-down",
        size: 13,
        style: {
          transform: expanded.includes(row.id) ? 'rotate(180deg)' : 'none'
        }
      })
    }, "Select items") : null
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Operations",
    title: "Orders",
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: selected.length === 0,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "rotate-ccw",
        size: 14
      })
    }, "Bulk flag reprint ", selected.length > 0 ? `(${selected.length})` : '')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '13px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search order number\u2026",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    style: {
      minWidth: 240
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['Today', 'Yesterday', 'Last 7 Days'].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    type: "button",
    onClick: () => setDateRange(d),
    style: {
      cursor: 'pointer',
      height: 30,
      padding: '0 11px',
      borderRadius: 'var(--radius-sm)',
      background: dateRange === d ? 'var(--surface-control)' : 'transparent',
      border: `1px solid ${dateRange === d ? 'var(--line-strong)' : 'var(--line)'}`,
      color: dateRange === d ? 'var(--text-hi)' : 'var(--text-mid)',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em'
    }
  }, d))), /*#__PURE__*/React.createElement(Select, {
    options: ['Custom range…', 'All time'],
    defaultValue: "Custom range\u2026"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 13
    })
  }, "Export CSV")), /*#__PURE__*/React.createElement(StatusPills, {
    options: ORDER_STATUS_FILTERS,
    active: statuses,
    onToggle: toggleStatus
  })), /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: rows,
    rowKey: "id",
    selectable: true,
    selected: selected,
    onSelect: setSelected,
    selectableRowKeys: selectableIds,
    emptyLabel: "No orders match this filter",
    expandedRowKeys: expanded,
    renderExpandedRow: row => /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--ink-850)',
        padding: '16px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-low)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: 12
      }
    }, "Printed items eligible for reprint \xB7 order ", row.order_number), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        alignItems: 'center',
        display: 'flex',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: true,
      label: /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 12
        }
      }, "LITF + LITB")
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        borderLeft: '2px solid var(--group-pair-line)',
        color: 'var(--group-pair)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.14em',
        paddingLeft: 6
      }
    }, "PAIR"), /*#__PURE__*/React.createElement(SegmentedSku, {
      sku: "LIT-DESNAM-SIL-TOR-LITTIN",
      familyCode: "LIT",
      designCode: "DESNAM",
      options: {
        color: 'SIL',
        flame: 'TOR'
      },
      configCode: "LITTIN",
      size: "sm"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        alignItems: 'center',
        display: 'flex',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 12
        }
      }, "ASH")
    }), /*#__PURE__*/React.createElement(SegmentedSku, {
      sku: "ASH-DESGOK-CLR-SOLO",
      familyCode: "ASH",
      designCode: "DESGOK",
      options: {
        color: 'CLR'
      },
      configCode: "SOLO",
      size: "sm"
    }))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-low)',
        fontSize: 11,
        margin: '14px 0 0'
      }
    }, "Flagging creates a replacement component in the current open batch and moves this order to In Production (Needs Reprint)."))
  }), /*#__PURE__*/React.createElement(PerPage, {
    value: perPage,
    onChange: setPerPage,
    total: rows.length
  }), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Order',
      entries: [{
        status: 'Queued for Production',
        meaning: 'Imported and decoded. Components are accumulating in open batches.'
      }, {
        status: 'In Production',
        meaning: 'Every required component for this order has been printed.'
      }, {
        status: 'In Production (Needs Reprint)',
        meaning: 'A printed component was flagged for reprint. Returns to In Production once every flagged component is printed again.'
      }, {
        status: 'Fulfilled Externally',
        meaning: 'Fulfilled in Shopify outside this app. Terminal.'
      }, {
        status: 'Canceled',
        meaning: 'Cancelled or refunded in Shopify. Unprinted components pulled from their batch. Terminal.'
      }]
    }, {
      title: 'Component',
      entries: [{
        status: 'Blocked',
        meaning: 'The component status represented by the Attention column.'
      }]
    }]
  }));
}
Object.assign(window, {
  Orders,
  StatusPills
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/Orders.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/Sandbox.jsx
try { (() => {
const {
  DataTable,
  StatusBadge,
  Button,
  Icon,
  Card,
  Badge,
  EmptyState,
  ConfirmModal,
  ErrorAlert
} = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* The 14 fixed sandbox SKUs. Testing anything outside this set needs a separate
   pass to add it as a new fixed item, with artwork supplied by the owner — it
   cannot be entered freely at checkout (Decision #58). */
const SANDBOX_SKUS = ['LIT-DESNAM-SIL-TOR-LITTIN', 'LIT-DESNAM-WHT-BIC-SOLO', 'LIT-DESGOK-GLD-TOR-TINONLY', 'ASH-DESNAM-CLR-SOLO', 'ASH-DESGOK-CLR-ASHGRD', 'TIN-DESNEZ-SIL-SOLO', 'BOX-DESZOR-BOXLIT', 'BOX-DESZOR-BOX4', 'BOX-DESSAN-BOXJAR', 'WAL-DESGOJ-BRN-SOLO', 'WAL-DESZOR-BLK-SOLO', 'GRS-DESGOJ-BLK-GRSFULL', 'GRS-DESNEZ-SIL-GRSJAR', 'GRD-DESNEZ-BLK-SOLO'];
const SANDBOX_ORDERS = [{
  id: 1,
  order_number: 'TEST-004',
  sku: 'LIT-DESNAM-SIL-TOR-LITTIN',
  components: 'LITF, LITB, TIN'
}, {
  id: 2,
  order_number: 'TEST-003',
  sku: 'ASH-DESGOK-CLR-ASHGRD',
  components: 'ASH, GRD'
}, {
  id: 3,
  order_number: 'TEST-002',
  sku: 'BOX-DESZOR-BOXLIT',
  components: 'BOX, LITF, LITB'
}, {
  id: 4,
  order_number: 'TEST-001',
  sku: 'WAL-DESGOJ-BRN-SOLO',
  components: 'WALF, WALB'
}];
const SANDBOX_BATCHES = [{
  id: 1,
  group: 'Lighter',
  seq: '#S3',
  components: 6,
  created: 'Sep 2, 2026'
}, {
  id: 2,
  group: 'Ashtray',
  seq: '#S2',
  components: 2,
  created: 'Sep 2, 2026'
}, {
  id: 3,
  group: 'Box',
  seq: '#S2',
  components: 3,
  created: 'Sep 1, 2026'
}, {
  id: 4,
  group: 'Wallet',
  seq: '#S1',
  components: 2,
  created: 'Sep 1, 2026'
}];
function Sandbox() {
  /* Up to 7 order groups per checkout submission; quantity capped at 10 per
     item (Decision #58). */
  const [groups, setGroups] = React.useState([{
    id: 1,
    qty: {}
  }]);
  const [confirm, setConfirm] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const setQty = (gid, sku, n) => setGroups(gs => gs.map(g => g.id === gid ? {
    ...g,
    qty: {
      ...g.qty,
      [sku]: Math.min(10, Math.max(0, n))
    }
  } : g));
  const addGroup = () => setGroups(gs => gs.length >= 7 ? gs : [...gs, {
    id: Math.max(...gs.map(g => g.id)) + 1,
    qty: {}
  }]);
  const removeGroup = gid => setGroups(gs => gs.length === 1 ? gs : gs.filter(g => g.id !== gid));
  const groupTotal = g => Object.values(g.qty).reduce((a, b) => a + b, 0);
  const totalItems = groups.reduce((sum, g) => sum + groupTotal(g), 0);
  const ordersToCreate = groups.filter(g => groupTotal(g) > 0).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(PageHeading, {
    eyebrow: "Testing",
    title: "Sandbox",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 14
      }),
      onClick: () => setConfirm('reset')
    }, "Reset sandbox data"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: ordersToCreate === 0,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "shopping-cart",
        size: 15
      }),
      onClick: () => setConfirm('checkout')
    }, "Checkout ", ordersToCreate > 0 ? `(${ordersToCreate})` : ''))
  }), notice && /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: "success",
    title: notice,
    onDismiss: () => setNotice(null)
  }, "Sandbox rows are invisible on the Dashboard, Orders, Current Batches, and packing-sheet selection."), /*#__PURE__*/React.createElement(ErrorAlert, {
    tone: "info",
    title: "Isolated from real data"
  }, "Sandbox orders are ", /*#__PURE__*/React.createElement(Mono, null, "TEST-"), " prefixed and never reach Shopify. Their batches are exempt from the lock-on-generate rule, so the same batch can be regenerated without limit."), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Checkout",
    title: "COMPOSE SANDBOX ORDERS"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, groups.map((g, i) => /*#__PURE__*/React.createElement(Card, {
    key: g.id,
    eyebrow: `Order group ${i + 1} of ${groups.length}`,
    title: `${groupTotal(g)} ITEMS`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '8px 18px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
    }
  }, SANDBOX_SKUS.map(sku => /*#__PURE__*/React.createElement("div", {
    key: sku,
    style: {
      alignItems: 'center',
      borderBottom: '1px solid var(--line-soft)',
      display: 'flex',
      gap: 12,
      padding: '7px 0'
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: (g.qty[sku] || 0) > 0 ? 'var(--text-hi)' : 'var(--text-mid)',
      flex: 1,
      fontSize: 11,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, sku), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => setQty(g.id, sku, (g.qty[sku] || 0) - 1)
  }, "\u2212"), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: (g.qty[sku] || 0) > 0 ? 'var(--text-hi)' : 'var(--text-faint)',
      fontSize: 12,
      textAlign: 'center',
      width: 26
    }
  }, g.qty[sku] || 0), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    disabled: (g.qty[sku] || 0) >= 10,
    onClick: () => setQty(g.id, sku, (g.qty[sku] || 0) + 1)
  }, "+"))))), groups.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => removeGroup(g.id)
  }, "Remove this order group")))), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    disabled: groups.length >= 7,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 13
    }),
    onClick: addGroup
  }, "Add order group"), /*#__PURE__*/React.createElement(Muted, {
    style: {
      fontSize: 11
    }
  }, groups.length, " of 7 order groups \xB7 ", totalItems, " items \xB7 max 10 per item")))), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Sandbox",
    title: "TEST ORDERS"
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: SANDBOX_ORDERS,
    columns: [{
      key: 'order_number',
      header: 'Order',
      mono: true,
      width: 130
    }, {
      key: 'sku',
      header: 'SKU',
      mono: true
    }, {
      key: 'components',
      header: 'Components generated',
      mono: true,
      width: 230
    }],
    emptyLabel: "No sandbox orders \u2014 check some out above"
  })), /*#__PURE__*/React.createElement(ScreenSection, {
    eyebrow: "Sandbox",
    title: "TEST BATCHES"
  }, /*#__PURE__*/React.createElement(DataTable, {
    rowKey: "id",
    rows: SANDBOX_BATCHES,
    columns: [{
      key: 'group',
      header: 'Group',
      width: 190,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-hi)',
          fontWeight: 700
        }
      }, v)
    }, {
      key: 'seq',
      header: 'Batch',
      mono: true,
      width: 90
    }, {
      key: 'state',
      header: 'State',
      width: 120,
      render: () => /*#__PURE__*/React.createElement(StatusBadge, {
        status: "Open",
        size: "sm"
      })
    }, {
      key: 'components',
      header: 'Components',
      align: 'right',
      mono: true,
      width: 120
    }, {
      key: 'created',
      header: 'Created',
      width: 140,
      render: v => /*#__PURE__*/React.createElement(Muted, null, v)
    }, {
      key: 'action',
      header: '',
      align: 'right',
      width: 170,
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        iconLeft: /*#__PURE__*/React.createElement(Icon, {
          name: "file-output",
          size: 13
        })
      }, "Generate PPTX")
    }],
    emptyLabel: "No sandbox batches"
  })), /*#__PURE__*/React.createElement(StatusGuide, {
    label: "Status guide",
    groups: [{
      title: 'Batch',
      entries: [{
        status: 'Open',
        meaning: 'Sandbox batches never leave Open — generating a PPTX does not lock them or spawn a new batch.'
      }]
    }]
  }), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'checkout',
    title: `Create ${ordersToCreate} sandbox order${ordersToCreate === 1 ? '' : 's'}?`,
    confirmLabel: "Checkout",
    onConfirm: () => {
      setNotice(`${ordersToCreate} sandbox orders created`);
      setGroups([{
        id: 1,
        qty: {}
      }]);
      setConfirm(null);
    },
    onCancel: () => setConfirm(null)
  }, "Each order group becomes one TEST- prefixed order with a sequential number, flowing through normal component generation and batch assignment."), /*#__PURE__*/React.createElement(ConfirmModal, {
    open: confirm === 'reset',
    tone: "danger",
    title: "Reset all sandbox data?",
    confirmLabel: "Reset sandbox data",
    onConfirm: () => {
      setNotice('Sandbox data cleared');
      setConfirm(null);
    },
    onCancel: () => setConfirm(null)
  }, "Fully clears every sandbox order, component, batch and batch item. Nothing is recreated \u2014 check out whatever you need next. Real data is untouched."));
}
Object.assign(window, {
  Sandbox
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/Sandbox.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fulfillment-app/shared.jsx
try { (() => {
const DS = window.SpicedAnimeSpicyDesignSystem_daab0d;
const {
  Button,
  Icon,
  StatusBadge,
  Badge,
  Card,
  Select,
  Checkbox
} = DS;

/* Operator-facing short labels for validation failure codes (Decision #88c).
   Transcribed from `frontend/src/lib/validationLabels.ts`, which is itself a
   transcription of `Validation_Errors_Reprints_and_Recovery_SOT.md`
   ("Operator-Facing Short Labels"). Display-only: the stored
   `validation_failure_code` is unchanged and stays visible as secondary detail. */
const VALIDATION_FAILURE_SHORT_LABELS = {
  INVALID_CASE: 'Lowercase in SKU',
  INVALID_CHARACTERS: 'Invalid characters in SKU',
  NO_SKU: 'Missing SKU',
  DUPLICATE_SKU: 'Duplicate SKU',
  UNKNOWN_FAMILY: 'Unknown family code',
  INVALID_FORMAT: 'Invalid SKU format',
  UNKNOWN_CONFIG: 'Invalid config for family',
  UNKNOWN_OPTION: 'Unrecognized option code',
  NO_COMPONENT_RULE: 'No decomposition rule',
  MISSING_ARTWORK: 'Missing artwork',
  MISSING_SERIES_METAFIELD: 'Missing series metafield',
  MISSING_TEMPLATE: 'Missing print template',
  FAILED_PPTX_GENERATION: 'Print file generation failed',
  STALE_SELECTION: 'Selection out of date',
  FAILED_PACKING_EXPORT: 'Packing export failed',
  WEBHOOK_FAILURE: 'Webhook delivery failed',
  DUPLICATE_ORDER: 'Duplicate order',
  FAMILY_DEFERRED_MVP: 'Deferred product family'
};
const VALIDATION_FAILURE_RESOLUTIONS = {
  MISSING_ARTWORK: 'Upload artwork to Drive at the expected path, then revalidate artwork.',
  MISSING_SERIES_METAFIELD: 'Set Series in Shopify and re-import.',
  NO_SKU: 'Add or generate a SKU, then re-import.',
  UNKNOWN_CONFIG: 'Correct the SKU or add the config rule.',
  FAMILY_DEFERRED_MVP: 'No action is required; this is expected behavior.',
  WEBHOOK_FAILURE: 'Investigate the webhook receipt and application logs.'
};
const failureLabel = code => VALIDATION_FAILURE_SHORT_LABELS[code] || code;
const failureResolution = code => VALIDATION_FAILURE_RESOLUTIONS[code];
function ScreenSection({
  eyebrow,
  title,
  viewAll,
  onViewAll,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'end',
      display: 'flex',
      gap: 16,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--spice-400)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.06em',
      margin: '6px 0 0',
      textTransform: 'uppercase'
    }
  }, title)), viewAll && /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onViewAll && onViewAll();
    },
    style: {
      color: 'var(--text-mid)',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: '6px 0',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, "View all")), children);
}

/* Bounded panel (Decision #95): the heading and `View all` sit OUTSIDE the
   scrollable region so they stay visible while the operator scrolls.
   Recent Activity caps at 25 entries; the Needs Attention preview at 30. */
function BoundedPanel({
  eyebrow,
  title,
  tone = 'neutral',
  onViewAll,
  maxHeight = 260,
  cap,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-card)',
      border: `1px solid ${tone === 'danger' ? 'var(--tone-danger-line)' : 'var(--line)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      alignItems: 'end',
      backgroundColor: 'var(--ink-850)',
      backgroundImage: 'var(--tex-stripe-medium)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      gap: 16,
      justifyContent: 'space-between',
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--spice-400)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.06em',
      margin: '4px 0 0',
      textTransform: 'uppercase'
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 12
    }
  }, cap && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10
    }
  }, "capped at ", cap), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onViewAll && onViewAll();
    },
    style: {
      color: 'var(--text-mid)',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.1em',
      padding: '6px 0',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, "View all"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight,
      overflowY: 'auto'
    }
  }, children));
}
function PageHeading({
  eyebrow,
  title,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--spice-400)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: 'var(--text-hi)',
      fontFamily: 'var(--font-sans)',
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '0.04em',
      margin: '6px 0 0',
      textTransform: 'uppercase'
    }
  }, title)), right);
}

/* Status Guide (Decision #107): closed by default, opens on demand, and always
   lists the RAW canonical vocabulary — display-label overrides never apply here. */
function StatusGuide({
  label = 'Status guide',
  groups = []
}) {
  return /*#__PURE__*/React.createElement("details", {
    className: "status-guide",
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 16px',
      color: 'var(--text-mid)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-guide-chevron",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14
  })), label), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '16px'
    }
  }, groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: 10
    }
  }, g.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, g.entries.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.status,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 190,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: e.status,
    size: "sm"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-mid)',
      fontSize: 12
    }
  }, e.meaning))))))));
}

/* One counted queue switcher (Decision #97). Only the selected queue occupies
   the workspace — this replaced the stacked sections AND the four summary
   count cards that Decision #89 removed. */
function QueueSwitcher({
  queues,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, queues.map(q => {
    const on = q.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: q.key,
      type: "button",
      onClick: () => onChange(q.key),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        height: 34,
        padding: '0 14px',
        borderRadius: 'var(--radius-md)',
        background: on ? 'var(--spice-tint)' : 'var(--surface-control)',
        border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
        color: on ? 'var(--spice-300)' : 'var(--text-mid)',
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
      }
    }, q.label, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 700,
        minWidth: 20,
        height: 18,
        padding: '0 5px',
        borderRadius: 'var(--radius-pill)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: on ? 'var(--spice-500)' : 'var(--ink-700)',
        color: on ? 'var(--text-on-spice)' : 'var(--text-mid)'
      }
    }, q.count));
  }));
}

/* Server-side pagination control. Default 50; options 20/50/100; changing the
   size resets to page 1 (Decisions #63, #79). */
function PerPage({
  value = 50,
  onChange,
  total,
  page = 1
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 14,
      justifyContent: 'space-between',
      padding: '4px 2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, "Page ", page, total != null ? ` · ${total} results` : ''), /*#__PURE__*/React.createElement("label", {
    style: {
      alignItems: 'center',
      display: 'flex',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, "Per page"), /*#__PURE__*/React.createElement(Select, {
    options: ['20', '50', '100'],
    value: String(value),
    onChange: e => onChange && onChange(Number(e.target.value))
  })));
}

/* Sort control for a table header (Decisions #100, #101, #105).
   Order # and Order cycle unsorted → asc → desc → unsorted; Artwork's Design
   and Updated headers toggle between their two directions. */
function SortHeader({
  label,
  active,
  dir,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      color: active ? 'var(--text-hi)' : 'var(--text-low)',
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, label, !active ? /*#__PURE__*/React.createElement(Icon, {
    name: "chevrons-up-down",
    size: 12
  }) : /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 12,
    style: {
      transform: dir === 'asc' ? 'rotate(180deg)' : 'none'
    }
  }));
}
function Muted({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-low)',
      ...style
    }
  }, children);
}
function Mono({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      ...style
    }
  }, children);
}

/* Plain-language failure description with the raw code retained as secondary
   detail (Decision #88c). */
function FailureText({
  code
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--tone-danger)',
      fontSize: 12,
      fontWeight: 600
    }
  }, failureLabel(code)), /*#__PURE__*/React.createElement(Mono, {
    style: {
      color: 'var(--text-faint)',
      fontSize: 10
    }
  }, code));
}
const daysAgoIso = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

/* ---- Synthetic operator data. Shapes follow the real API payloads. ---- */
const BATCH_ROWS = [{
  id: 1,
  group: 'Ashtray',
  seq: '#12',
  ready: 38,
  total: 38,
  blocked: 0,
  age: 7,
  aging: true,
  iso: daysAgoIso(7),
  started: '2h ago',
  state: 'Open'
}, {
  id: 2,
  group: 'Lighter',
  seq: '#8',
  ready: 96,
  total: 142,
  blocked: 2,
  age: 3,
  aging: false,
  iso: daysAgoIso(3),
  started: '5h ago',
  state: 'Open'
}, {
  id: 3,
  group: 'Tin',
  seq: '#4',
  ready: 12,
  total: 20,
  blocked: 0,
  age: 1,
  aging: false,
  iso: daysAgoIso(1),
  started: '1d ago',
  state: 'Open'
}, {
  id: 4,
  group: 'Grinder/Jar/Tray',
  seq: '#3',
  ready: 0,
  total: 0,
  blocked: 0,
  age: 0,
  aging: false,
  iso: daysAgoIso(0),
  started: '4h ago',
  state: 'Open'
}, {
  id: 5,
  group: 'Box',
  seq: '#6',
  ready: 22,
  total: 27,
  blocked: 1,
  age: 5,
  aging: true,
  iso: daysAgoIso(5),
  started: '3d ago',
  state: 'Open'
}, {
  id: 6,
  group: 'Wallet',
  seq: '#2',
  ready: 8,
  total: 14,
  blocked: 0,
  age: 2,
  aging: false,
  iso: daysAgoIso(2),
  started: '9h ago',
  state: 'Open'
}];

/* Current Batches can surface all four lifecycle states under the `All` filter
   (Decision #96), so its dataset carries locked/printed/archived rows too. */
const BATCH_HISTORY = [{
  id: 7,
  group: 'Lighter',
  seq: '#7',
  ready: 120,
  total: 120,
  blocked: 0,
  age: 2,
  aging: false,
  iso: daysAgoIso(2),
  started: '2d ago',
  state: 'Locked for Review'
}, {
  id: 8,
  group: 'Ashtray',
  seq: '#11',
  ready: 44,
  total: 44,
  blocked: 0,
  age: 3,
  aging: false,
  iso: daysAgoIso(3),
  started: '3d ago',
  state: 'Locked for Review'
}, {
  id: 9,
  group: 'Tin',
  seq: '#3',
  ready: 30,
  total: 30,
  blocked: 0,
  age: 6,
  aging: true,
  iso: daysAgoIso(6),
  started: '6d ago',
  state: 'Printed'
}, {
  id: 10,
  group: 'Box',
  seq: '#5',
  ready: 18,
  total: 18,
  blocked: 0,
  age: 9,
  aging: true,
  iso: daysAgoIso(9),
  started: '9d ago',
  state: 'Archived'
}];
const ORDER_ROWS = [{
  id: 1041,
  order_number: '#1041',
  created_at: 'Sep 3, 2026',
  status: 'Queued for Production',
  item_count: 3,
  blocked: 0,
  age: 0,
  iso: daysAgoIso(0),
  reprintable: false
}, {
  id: 1040,
  order_number: '#1040',
  created_at: 'Sep 2, 2026',
  status: 'In Production',
  item_count: 1,
  blocked: 0,
  age: 1,
  iso: daysAgoIso(1),
  reprintable: true
}, {
  id: 1039,
  order_number: '#1039',
  created_at: 'Sep 1, 2026',
  status: 'Queued for Production',
  item_count: 5,
  blocked: 2,
  age: 2,
  iso: daysAgoIso(2),
  reprintable: false
}, {
  id: 1038,
  order_number: '#1038',
  created_at: 'Aug 30, 2026',
  status: 'In Production',
  item_count: 2,
  blocked: 0,
  age: 4,
  iso: daysAgoIso(4),
  reprintable: true
}, {
  id: 1037,
  order_number: '#1037',
  created_at: 'Aug 29, 2026',
  status: 'Fulfilled Externally',
  item_count: 1,
  blocked: 0,
  age: 5,
  iso: daysAgoIso(5),
  reprintable: false
}, {
  id: 1036,
  order_number: '#1036',
  created_at: 'Aug 28, 2026',
  status: 'Queued for Production',
  item_count: 4,
  blocked: 1,
  age: 6,
  iso: daysAgoIso(6),
  reprintable: false
}, {
  id: 1035,
  order_number: '#1035',
  created_at: 'Aug 28, 2026',
  status: 'Canceled',
  item_count: 2,
  blocked: 0,
  age: 6,
  iso: daysAgoIso(6),
  reprintable: false
}, {
  id: 1034,
  order_number: '#1034',
  created_at: 'Aug 27, 2026',
  status: 'In Production (Needs Reprint)',
  item_count: 3,
  blocked: 0,
  age: 7,
  iso: daysAgoIso(7),
  reprintable: true
}];
const ORDER_STATUS_FILTERS = ['Queued for Production', 'In Production', 'In Production (Needs Reprint)', 'Fulfilled Externally', 'Canceled'];
const ACTIVITY = [{
  id: 9,
  actor: 'Operator',
  action: 'batch_marked_printed',
  object: 'Batch Ashtray #11',
  when: '18m ago',
  icon: 'printer'
}, {
  id: 8,
  actor: 'System',
  action: 'order_imported',
  object: 'Order #1041',
  when: '42m ago',
  icon: 'shopping-cart'
}, {
  id: 7,
  actor: 'Operator',
  action: 'pptx_generated',
  object: 'Batch Lighter #7',
  when: '1h ago',
  icon: 'file-output'
}, {
  id: 6,
  actor: 'System',
  action: 'component_blocked',
  object: 'LITF · DESNAM',
  when: '2h ago',
  icon: 'octagon-x'
}, {
  id: 5,
  actor: 'System',
  action: 'order_reconciled',
  object: 'Order #1037',
  when: '3h ago',
  icon: 'refresh-cw'
}, {
  id: 4,
  actor: 'Operator',
  action: 'artwork_replaced',
  object: 'ASH · NARUTO-01',
  when: '5h ago',
  icon: 'image'
}, {
  id: 3,
  actor: 'System',
  action: 'webhook_failed',
  object: 'orders/paid',
  when: '6h ago',
  icon: 'triangle-alert'
}];

/* Batch Detail component list. `color` drives the Color column and pills, shown
   only for batches with colour-variant components (LITF/LITB/TIN, Decision #57). */
const BATCH_COMPONENTS = [{
  id: 1,
  design_code: 'DESNAM',
  component_code: 'LITF',
  family_code: 'LIT',
  config_code: 'LITTIN',
  order_number: '#1039',
  order_date: 'Sep 1, 2026',
  color: 'Silver',
  status: 'Ready',
  failure: null,
  pair: 'start'
}, {
  id: 2,
  design_code: 'DESNAM',
  component_code: 'LITB',
  family_code: 'LIT',
  config_code: 'LITTIN',
  order_number: '#1039',
  order_date: 'Sep 1, 2026',
  color: 'Silver',
  status: 'Ready',
  failure: null,
  pair: 'end'
}, {
  id: 3,
  design_code: 'DESGOK',
  component_code: 'LITF',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1038',
  order_date: 'Sep 1, 2026',
  color: 'White/Gold',
  status: 'Ready',
  failure: null,
  pair: 'start'
}, {
  id: 4,
  design_code: 'DESGOK',
  component_code: 'LITB',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1038',
  order_date: 'Sep 1, 2026',
  color: 'White/Gold',
  status: 'Ready',
  failure: null,
  pair: 'end'
}, {
  id: 5,
  design_code: 'DESLUF',
  component_code: 'LITF',
  family_code: 'LIT',
  config_code: 'LITTIN',
  order_number: '#1036',
  order_date: 'Aug 31, 2026',
  color: 'White/Gold',
  status: 'Blocked',
  failure: 'MISSING_ARTWORK',
  pair: 'start'
}, {
  id: 6,
  design_code: 'DESLUF',
  component_code: 'LITB',
  family_code: 'LIT',
  config_code: 'LITTIN',
  order_number: '#1036',
  order_date: 'Aug 31, 2026',
  color: 'White/Gold',
  status: 'Blocked',
  failure: 'MISSING_ARTWORK',
  pair: 'end'
}, {
  id: 7,
  design_code: 'DESZOR',
  component_code: 'LITF',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1031',
  order_date: 'Aug 30, 2026',
  color: 'Silver',
  status: 'Printed',
  failure: null,
  pair: 'start'
}, {
  id: 8,
  design_code: 'DESZOR',
  component_code: 'LITB',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1031',
  order_date: 'Aug 30, 2026',
  color: 'Silver',
  status: 'Printed',
  failure: null,
  pair: 'end'
}, {
  id: 9,
  design_code: 'DESNEZ',
  component_code: 'LITF',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1029',
  order_date: 'Aug 29, 2026',
  color: 'Silver',
  status: 'Canceled',
  failure: null,
  pair: 'start'
}, {
  id: 10,
  design_code: 'DESNEZ',
  component_code: 'LITB',
  family_code: 'LIT',
  config_code: 'SOLO',
  order_number: '#1029',
  order_date: 'Aug 29, 2026',
  color: 'Silver',
  status: 'Canceled',
  failure: null,
  pair: 'end'
}];

/* Blocked queue rows are grouped by affected order item + failure + resolution
   (Decision #97), not one row per component. */
const BLOCKED = [{
  id: 1,
  order: '#1036',
  item: 'Luffy Flip Lighter + Tin Case',
  sku: 'LIT-DESLUF-GLD-TOR-LITTIN',
  components: '2 · LITF, LITB',
  code: 'MISSING_ARTWORK',
  detail: {
    family_code: 'LIT',
    config_code: 'LITTIN',
    design_code: 'DESLUF',
    expected_path: 'artwork/Flip Lighter/DESLUF.png',
    component_ids: '1187, 1188'
  }
}, {
  id: 2,
  order: '#1036',
  item: 'Gojo Grinder Set — 3 Piece',
  sku: 'GRS-DESGOJ-BLK-GRSFULL',
  components: '1 · GRS',
  code: 'MISSING_SERIES_METAFIELD',
  detail: {
    family_code: 'GRS',
    config_code: 'GRSFULL',
    design_code: 'DESGOJ',
    expected_path: 'artwork/Grinder Sets/{series}/DESGOJ.png',
    component_ids: '1191'
  }
}, {
  id: 3,
  order: '#1031',
  item: 'Naruto Ashtray',
  sku: 'ASH-DESNAM-CLR-SOLO',
  components: '1 · ASH',
  code: 'MISSING_ARTWORK',
  detail: {
    family_code: 'ASH',
    config_code: 'SOLO',
    design_code: 'DESNAM',
    expected_path: 'artwork/Ashtray/DESNAM.png',
    component_ids: '1164'
  }
}];

/* Missing SKU queue (stored code stays NO_SKU; label reads "Missing SKU"). */
const NO_SKU = [{
  id: 1,
  order: '#1036',
  item: 'Sanji Stash Box — Large / Black',
  line_item: 'LI-4471',
  proposal: 'BOX-DESSAN-BOX4'
}, {
  id: 2,
  order: '#1029',
  item: 'Zoro Wallet — Bifold / Brown',
  line_item: 'LI-4402',
  proposal: 'WAL-DESZOR-BRN-SOLO'
}, {
  id: 3,
  order: '#1027',
  item: 'Nezuko Tapestry — 40x60',
  line_item: 'LI-4388',
  proposal: 'TAP-DESNEZ-LRG-SOLO'
}];
const DEFERRED = [{
  id: 1,
  order: '#1034',
  item: 'Herb Grinder — Nezuko',
  sku: 'GRD-DESNEZ-BLK-SOLO',
  code: 'FAMILY_DEFERRED_MVP'
}, {
  id: 2,
  order: '#1028',
  item: 'Herb Grinder — Gojo',
  sku: 'GRD-DESGOJ-SIL-SOLO',
  code: 'FAMILY_DEFERRED_MVP'
}];
const WEBHOOKS = [{
  id: 1,
  topic: 'orders/paid',
  order_ref: '#1042',
  failure_summary: 'SKU_PARSE_ERROR',
  received_at: '2026-09-03 06:12'
}, {
  id: 2,
  topic: 'orders/fulfilled',
  order_ref: '—',
  failure_summary: 'ORDER_NOT_FOUND',
  received_at: '2026-09-02 21:44'
}];
const ARTWORK = [{
  id: 1,
  design: 'DESNAM',
  component: 'ASH',
  family: 'ASH',
  name: 'Naruto — Sage',
  status: 'Available',
  updated: 'Sep 1, 2026'
}, {
  id: 2,
  design: 'DESGOK',
  component: 'LITF',
  family: 'LIT',
  name: 'Goku — Ultra',
  status: 'Available',
  updated: 'Aug 30, 2026'
}, {
  id: 3,
  design: 'DESLUF',
  component: 'LITF',
  family: 'LIT',
  name: 'Luffy — Gear 5',
  status: 'Missing',
  updated: 'Aug 28, 2026'
}, {
  id: 4,
  design: 'DESZOR',
  component: 'BOX',
  family: 'BOX',
  name: 'Zoro — Three Sword',
  status: 'Available',
  updated: 'Aug 27, 2026'
}, {
  id: 5,
  design: 'DESNEZ',
  component: 'TIN',
  family: 'LIT',
  name: 'Nezuko — Bamboo',
  status: 'Available',
  updated: 'Aug 26, 2026'
}, {
  id: 6,
  design: 'DESGOJ',
  component: 'WALF',
  family: 'WAL',
  name: 'Gojo — Infinity',
  status: 'Retired',
  updated: 'Aug 20, 2026'
}];
Object.assign(window, {
  DS,
  ScreenSection,
  BoundedPanel,
  PageHeading,
  StatusGuide,
  QueueSwitcher,
  PerPage,
  SortHeader,
  Muted,
  Mono,
  FailureText,
  failureLabel,
  failureResolution,
  VALIDATION_FAILURE_SHORT_LABELS,
  VALIDATION_FAILURE_RESOLUTIONS,
  daysAgoIso,
  BATCH_ROWS,
  BATCH_HISTORY,
  ORDER_ROWS,
  ORDER_STATUS_FILTERS,
  ACTIVITY,
  BATCH_COMPONENTS,
  BLOCKED,
  NO_SKU,
  DEFERRED,
  WEBHOOKS,
  ARTWORK
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fulfillment-app/shared.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedFilter = __ds_scope.SegmentedFilter;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TONE_ICON = __ds_scope.TONE_ICON;

__ds_ns.STATUS_MAP = __ds_scope.STATUS_MAP;

__ds_ns.DISPLAY_LABEL = __ds_scope.DISPLAY_LABEL;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.BatchCard = __ds_scope.BatchCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.PairBracket = __ds_scope.PairBracket;

__ds_ns.SegmentedSku = __ds_scope.SegmentedSku;

__ds_ns.AGING_THRESHOLD_DAYS = __ds_scope.AGING_THRESHOLD_DAYS;

__ds_ns.AgingFlag = __ds_scope.AgingFlag;

__ds_ns.ConfirmModal = __ds_scope.ConfirmModal;

__ds_ns.DeferredPanel = __ds_scope.DeferredPanel;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ErrorAlert = __ds_scope.ErrorAlert;

__ds_ns.LoadingState = __ds_scope.LoadingState;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
