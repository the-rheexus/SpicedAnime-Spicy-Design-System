import React from 'react';
import { Icon } from '../core/Icon.jsx';

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
  sm: { h: 20, px: 6, fs: 10, gap: 4, icon: 12 },
  md: { h: 24, px: 8, fs: 11, gap: 5, icon: 13 },
};

/* Per-role chip skins. `none` keeps every chip identical. */
const CHIP_TONES = {
  none: {
    family: { bg: 'var(--surface-control)', fg: 'var(--text-body)', line: 'var(--line)', fw: 600 },
    design: { bg: 'var(--surface-control)', fg: 'var(--text-body)', line: 'var(--line)', fw: 600 },
    option: { bg: 'var(--surface-control)', fg: 'var(--text-body)', line: 'var(--line)', fw: 600 },
    config: { bg: 'var(--surface-control)', fg: 'var(--text-body)', line: 'var(--line)', fw: 600 },
  },
  value: {
    family: { bg: 'var(--ink-600)', fg: 'var(--text-hi)', line: 'var(--line-strong)', fw: 700 },
    design: { bg: 'var(--surface-control)', fg: 'var(--text-hi)', line: 'var(--line)', fw: 600 },
    option: { bg: 'var(--surface-raised)', fg: 'var(--text-mid)', line: 'var(--line)', fw: 600 },
    config: { bg: 'var(--surface-panel)', fg: 'var(--text-low)', line: 'var(--line)', fw: 600 },
  },
  role: {
    family: { bg: 'var(--ink-600)', fg: 'var(--text-hi)', line: 'var(--line-strong)', fw: 700 },
    design: { bg: 'var(--seg-design-bg)', fg: 'var(--seg-design)', line: 'var(--seg-design-line)', fw: 700 },
    option: { bg: 'var(--seg-option-bg)', fg: 'var(--seg-option)', line: 'var(--seg-option-line)', fw: 600 },
    config: { bg: 'var(--surface-panel)', fg: 'var(--text-low)', line: 'var(--line)', fw: 600 },
  },
};

function optionSegments(options) {
  if (!options || typeof options !== 'object') return [];
  return Object.values(options)
    .filter((v) => v !== null && v !== undefined && String(v).length > 0)
    .map(String);
}

/* Tags each segment with its role so `tone` can skin them independently.
   Order follows SKU_and_Internal_ID_Guide.md and is never derived by splitting
   the SKU string. */
function roledSegments({ familyCode, designCode, options, configCode }) {
  const out = [];
  if (familyCode) out.push({ value: String(familyCode), role: 'family' });
  if (designCode) out.push({ value: String(designCode), role: 'design' });
  optionSegments(options).forEach((v) => out.push({ value: v, role: 'option' }));
  if (configCode) out.push({ value: String(configCode), role: 'config' });
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

export function SegmentedSku({
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

  const parsed = roledSegments({ familyCode, designCode, options, configCode });
  const segments = parsed.length > 0
    ? parsed
    : (sku ? [{ value: String(sku), role: 'family' }] : []);

  const onCopy = React.useCallback(async () => {
    const ok = await writeClipboard(sku);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }, [sku]);

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, ...style }}
      {...rest}
    >
      <span
        role="group"
        aria-label={`SKU ${sku}`}
        style={{ display: 'inline-flex', alignItems: 'stretch' }}
      >
        {segments.map((seg, i) => {
          const c = skin[seg.role] || skin.family;
          return (
            <span
              key={`${seg.value}-${i}`}
              style={{
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
                whiteSpace: 'nowrap',
              }}
            >
              {seg.value}
            </span>
          );
        })}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? `Copied ${sku}` : `Copy SKU ${sku}`}
        style={{
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
          cursor: 'pointer',
        }}
      >
        <Icon name={copied ? 'check' : 'copy'} size={s.icon} strokeWidth={2.25} />
      </button>
    </span>
  );
}
