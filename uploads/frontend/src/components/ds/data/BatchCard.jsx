import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { StatusBadge } from '../core/StatusBadge.jsx';
import { Button } from '../core/Button.jsx';

/**
 * Production batch card — the core object of the fulfillment app. Shows batch ID,
 * title, status, unit progress, key meta, and a primary action (Generate PPTX).
 */
export function BatchCard({
  batchId, title, status = 'Open', statusLabel, units = 0, ordersCount, printed = 0,
  blocked = 0, due, onGenerate, onOpen, primaryLabel = 'Generate PPTX', singleAction = false, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pct = units ? Math.round((printed / units) * 100) : 0;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: 'var(--surface-card)',
        border: `1px solid ${hover ? 'var(--line-strong)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
        transition: 'border-color var(--dur-base) var(--ease-out)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', ...style,
      }}
      {...rest}
    >
      {/* header */}
      <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--spice-400)', letterSpacing: '0.04em' }}>{batchId}</span>
            {blocked > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--tone-danger)' }}>
                <Icon name="octagon-x" size={12} />{blocked}
              </span>
            )}
          </div>
          <h3 onClick={onOpen} style={{
            margin: 0, fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700,
            letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--text-hi)',
            cursor: onOpen ? 'pointer' : 'default', lineHeight: 1.25,
          }}>{title}</h3>
        </div>
        <StatusBadge status={status} label={statusLabel} />
      </div>

      {/* progress */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)' }}>Printed</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mid)' }}>{printed} / {units} units</span>
        </div>
        <div style={{ height: 6, background: 'var(--ink-850)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', border: '1px solid var(--line)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--tone-success)' : 'var(--spice-500)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
        </div>
      </div>

      {/* meta */}
      <div style={{ display: 'flex', gap: 20, padding: '0 20px 18px', flexWrap: 'wrap' }}>
        {ordersCount != null && <Meta icon="shopping-cart" label="Orders" value={ordersCount} />}
        <Meta icon="boxes" label="Units" value={units} />
        {due && <Meta icon="clock" label="Due" value={due} />}
      </div>

      {/* footer action */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: 14, display: 'flex', gap: 10 }}>
        <Button variant="primary" size="md" fullWidth onClick={onGenerate} iconLeft={<Icon name="file-output" size={15} />}>{primaryLabel}</Button>
        {!singleAction && <Button variant="outline" size="md" onClick={onOpen}>Open</Button>}
      </div>
    </div>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ color: 'var(--text-faint)', display: 'flex' }}><Icon name={icon} size={15} /></span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-hi)' }}>{value}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-low)' }}>{label}</span>
      </div>
    </div>
  );
}
