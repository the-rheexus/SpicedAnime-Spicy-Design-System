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
 */

const SIZES = {
  sm: { h: 20, px: 6, fs: 10, gap: 4, icon: 12 },
  md: { h: 24, px: 8, fs: 11, gap: 5, icon: 13 },
};

function optionSegments(options) {
  if (!options || typeof options !== 'object') return [];
  return Object.values(options)
    .filter((v) => v !== null && v !== undefined && String(v).length > 0)
    .map(String);
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
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const [copied, setCopied] = React.useState(false);

  const parsed = [familyCode, designCode, ...optionSegments(options), configCode]
    .filter((v) => v !== null && v !== undefined && String(v).length > 0)
    .map(String);
  const segments = parsed.length > 0 ? parsed : [sku].filter(Boolean);

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
        {segments.map((seg, i) => (
          <span
            key={`${seg}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: s.h,
              padding: `0 ${s.px}px`,
              background: 'var(--surface-control)',
              color: 'var(--text-body)',
              border: '1px solid var(--line)',
              borderLeftWidth: i === 0 ? 1 : 0,
              borderTopLeftRadius: i === 0 ? 'var(--radius-sm)' : 0,
              borderBottomLeftRadius: i === 0 ? 'var(--radius-sm)' : 0,
              borderTopRightRadius: i === segments.length - 1 ? 'var(--radius-sm)' : 0,
              borderBottomRightRadius: i === segments.length - 1 ? 'var(--radius-sm)' : 0,
              fontFamily: 'var(--font-mono)',
              fontSize: s.fs,
              fontWeight: 600,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            {seg}
          </span>
        ))}
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
