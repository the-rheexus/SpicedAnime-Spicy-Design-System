const DS = window.SpicedAnimeSpicyDesignSystem_daab0d;
const { Button, Icon, StatusBadge, Badge, Card, Select, Checkbox } = DS;

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
  FAMILY_DEFERRED_MVP: 'Deferred product family',
};

const VALIDATION_FAILURE_RESOLUTIONS = {
  MISSING_ARTWORK: 'Upload artwork to Drive at the expected path, then revalidate artwork.',
  MISSING_SERIES_METAFIELD: 'Set Series in Shopify and re-import.',
  NO_SKU: 'Add or generate a SKU, then re-import.',
  UNKNOWN_CONFIG: 'Correct the SKU or add the config rule.',
  FAMILY_DEFERRED_MVP: 'No action is required; this is expected behavior.',
  WEBHOOK_FAILURE: 'Investigate the webhook receipt and application logs.',
};

const failureLabel = (code) => VALIDATION_FAILURE_SHORT_LABELS[code] || code;
const failureResolution = (code) => VALIDATION_FAILURE_RESOLUTIONS[code];

function ScreenSection({ eyebrow, title, viewAll, onViewAll, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ alignItems: 'end', display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--spice-400)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</div>
          <h2 style={{ color: 'var(--text-hi)', fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', margin: '6px 0 0', textTransform: 'uppercase' }}>{title}</h2>
        </div>
        {viewAll && <a href="#" onClick={(e) => { e.preventDefault(); onViewAll && onViewAll(); }} style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 0', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>View all</a>}
      </div>
      {children}
    </section>
  );
}

/* Bounded panel (Decision #95): the heading and `View all` sit OUTSIDE the
   scrollable region so they stay visible while the operator scrolls.
   Recent Activity caps at 25 entries; the Needs Attention preview at 30. */
function BoundedPanel({ eyebrow, title, tone = 'neutral', onViewAll, maxHeight = 260, cap, children }) {
  return (
    <section style={{ background: 'var(--surface-card)', border: `1px solid ${tone === 'danger' ? 'var(--tone-danger-line)' : 'var(--line)'}`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      <header style={{ alignItems: 'end', backgroundColor: 'var(--ink-850)', backgroundImage: 'var(--tex-stripe-medium)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 16, justifyContent: 'space-between', padding: '14px 18px' }}>
        <div>
          <div style={{ color: 'var(--spice-400)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</div>
          <h2 style={{ color: 'var(--text-hi)', fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', margin: '4px 0 0', textTransform: 'uppercase' }}>{title}</h2>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          {cap && <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>capped at {cap}</span>}
          <a href="#" onClick={(e) => { e.preventDefault(); onViewAll && onViewAll(); }} style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 0', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>View all</a>
        </div>
      </header>
      <div style={{ maxHeight, overflowY: 'auto' }}>{children}</div>
    </section>
  );
}

function PageHeading({ eyebrow, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ color: 'var(--spice-400)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</div>
        <h1 style={{ color: 'var(--text-hi)', fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 800, letterSpacing: '0.04em', margin: '6px 0 0', textTransform: 'uppercase' }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

/* Status Guide (Decision #107): closed by default, opens on demand, and always
   lists the RAW canonical vocabulary — display-label overrides never apply here. */
function StatusGuide({ label = 'Status guide', groups = [] }) {
  return (
    <details className="status-guide" style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
      <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', color: 'var(--text-mid)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span className="status-guide-chevron" style={{ display: 'flex' }}><Icon name="chevron-right" size={14} /></span>
        {label}
      </summary>
      <div style={{ borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
        {groups.map((g) => (
          <div key={g.title}>
            <div style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{g.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.entries.map((e) => (
                <div key={e.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 190, flex: 'none' }}><StatusBadge status={e.status} size="sm" /></span>
                  <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>{e.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

/* One counted queue switcher (Decision #97). Only the selected queue occupies
   the workspace — this replaced the stacked sections AND the four summary
   count cards that Decision #89 removed. */
function QueueSwitcher({ queues, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {queues.map((q) => {
        const on = q.key === active;
        return (
          <button
            key={q.key} type="button" onClick={() => onChange(q.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer',
              height: 34, padding: '0 14px', borderRadius: 'var(--radius-md)',
              background: on ? 'var(--spice-tint)' : 'var(--surface-control)',
              border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
              color: on ? 'var(--spice-300)' : 'var(--text-mid)',
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
            }}
          >
            {q.label}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              minWidth: 20, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: on ? 'var(--spice-500)' : 'var(--ink-700)',
              color: on ? 'var(--text-on-spice)' : 'var(--text-mid)',
            }}>{q.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Server-side pagination control. Default 50; options 20/50/100; changing the
   size resets to page 1 (Decisions #63, #79). */
function PerPage({ value = 50, onChange, total, page = 1 }) {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 14, justifyContent: 'space-between', padding: '4px 2px' }}>
      <span style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        Page {page}{total != null ? ` · ${total} results` : ''}
      </span>
      <label style={{ alignItems: 'center', display: 'flex', gap: 9 }}>
        <span style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Per page</span>
        <Select
          options={['20', '50', '100']} value={String(value)}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}

/* Sort control for a table header (Decisions #100, #101, #105).
   Order # and Order cycle unsorted → asc → desc → unsorted; Artwork's Design
   and Updated headers toggle between their two directions. */
function SortHeader({ label, active, dir, onClick }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
        background: 'none', border: 'none', padding: 0,
        color: active ? 'var(--text-hi)' : 'var(--text-low)',
        fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}
    >
      {label}
      {!active
        ? <Icon name="chevrons-up-down" size={12} />
        : <Icon name="chevron-down" size={12} style={{ transform: dir === 'asc' ? 'rotate(180deg)' : 'none' }} />}
    </button>
  );
}

function Muted({ children, style }) { return <span style={{ color: 'var(--text-low)', ...style }}>{children}</span>; }
function Mono({ children, style }) { return <span style={{ fontFamily: 'var(--font-mono)', ...style }}>{children}</span>; }

/* Plain-language failure description with the raw code retained as secondary
   detail (Decision #88c). */
function FailureText({ code }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: 'var(--tone-danger)', fontSize: 12, fontWeight: 600 }}>{failureLabel(code)}</span>
      <Mono style={{ color: 'var(--text-faint)', fontSize: 10 }}>{code}</Mono>
    </span>
  );
}

const daysAgoIso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };

/* ---- Synthetic operator data. Shapes follow the real API payloads. ---- */
const BATCH_ROWS = [
  { id: 1, group: 'Ashtray', seq: '#12', ready: 38, total: 38, blocked: 0, age: 7, aging: true, iso: daysAgoIso(7), started: '2h ago', state: 'Open' },
  { id: 2, group: 'Lighter', seq: '#8', ready: 96, total: 142, blocked: 2, age: 3, aging: false, iso: daysAgoIso(3), started: '5h ago', state: 'Open' },
  { id: 3, group: 'Tin', seq: '#4', ready: 12, total: 20, blocked: 0, age: 1, aging: false, iso: daysAgoIso(1), started: '1d ago', state: 'Open' },
  { id: 4, group: 'Grinder/Jar/Tray', seq: '#3', ready: 0, total: 0, blocked: 0, age: 0, aging: false, iso: daysAgoIso(0), started: '4h ago', state: 'Open' },
  { id: 5, group: 'Box', seq: '#6', ready: 22, total: 27, blocked: 1, age: 5, aging: true, iso: daysAgoIso(5), started: '3d ago', state: 'Open' },
  { id: 6, group: 'Wallet', seq: '#2', ready: 8, total: 14, blocked: 0, age: 2, aging: false, iso: daysAgoIso(2), started: '9h ago', state: 'Open' },
];

/* Current Batches can surface all four lifecycle states under the `All` filter
   (Decision #96), so its dataset carries locked/printed/archived rows too. */
const BATCH_HISTORY = [
  { id: 7, group: 'Lighter', seq: '#7', ready: 120, total: 120, blocked: 0, age: 2, aging: false, iso: daysAgoIso(2), started: '2d ago', state: 'Locked for Review' },
  { id: 8, group: 'Ashtray', seq: '#11', ready: 44, total: 44, blocked: 0, age: 3, aging: false, iso: daysAgoIso(3), started: '3d ago', state: 'Locked for Review' },
  { id: 9, group: 'Tin', seq: '#3', ready: 30, total: 30, blocked: 0, age: 6, aging: true, iso: daysAgoIso(6), started: '6d ago', state: 'Printed' },
  { id: 10, group: 'Box', seq: '#5', ready: 18, total: 18, blocked: 0, age: 9, aging: true, iso: daysAgoIso(9), started: '9d ago', state: 'Archived' },
];

const ORDER_ROWS = [
  { id: 1041, order_number: '#1041', created_at: 'Sep 3, 2026', status: 'Queued for Production', item_count: 3, blocked: 0, age: 0, iso: daysAgoIso(0), reprintable: false },
  { id: 1040, order_number: '#1040', created_at: 'Sep 2, 2026', status: 'In Production', item_count: 1, blocked: 0, age: 1, iso: daysAgoIso(1), reprintable: true },
  { id: 1039, order_number: '#1039', created_at: 'Sep 1, 2026', status: 'Queued for Production', item_count: 5, blocked: 2, age: 2, iso: daysAgoIso(2), reprintable: false },
  { id: 1038, order_number: '#1038', created_at: 'Aug 30, 2026', status: 'In Production', item_count: 2, blocked: 0, age: 4, iso: daysAgoIso(4), reprintable: true },
  { id: 1037, order_number: '#1037', created_at: 'Aug 29, 2026', status: 'Fulfilled Externally', item_count: 1, blocked: 0, age: 5, iso: daysAgoIso(5), reprintable: false },
  { id: 1036, order_number: '#1036', created_at: 'Aug 28, 2026', status: 'Queued for Production', item_count: 4, blocked: 1, age: 6, iso: daysAgoIso(6), reprintable: false },
  { id: 1035, order_number: '#1035', created_at: 'Aug 28, 2026', status: 'Canceled', item_count: 2, blocked: 0, age: 6, iso: daysAgoIso(6), reprintable: false },
  { id: 1034, order_number: '#1034', created_at: 'Aug 27, 2026', status: 'In Production (Needs Reprint)', item_count: 3, blocked: 0, age: 7, iso: daysAgoIso(7), reprintable: true },
];

const ORDER_STATUS_FILTERS = ['Queued for Production', 'In Production', 'In Production (Needs Reprint)', 'Fulfilled Externally', 'Canceled'];

const ACTIVITY = [
  { id: 9, actor: 'Operator', action: 'batch_marked_printed', object: 'Batch Ashtray #11', when: '18m ago', icon: 'printer' },
  { id: 8, actor: 'System', action: 'order_imported', object: 'Order #1041', when: '42m ago', icon: 'shopping-cart' },
  { id: 7, actor: 'Operator', action: 'pptx_generated', object: 'Batch Lighter #7', when: '1h ago', icon: 'file-output' },
  { id: 6, actor: 'System', action: 'component_blocked', object: 'LITF · DESNAM', when: '2h ago', icon: 'octagon-x' },
  { id: 5, actor: 'System', action: 'order_reconciled', object: 'Order #1037', when: '3h ago', icon: 'refresh-cw' },
  { id: 4, actor: 'Operator', action: 'artwork_replaced', object: 'ASH · NARUTO-01', when: '5h ago', icon: 'image' },
  { id: 3, actor: 'System', action: 'webhook_failed', object: 'orders/paid', when: '6h ago', icon: 'triangle-alert' },
];

/* Batch Detail component list. `color` drives the Color column and pills, shown
   only for batches with colour-variant components (LITF/LITB/TIN, Decision #57). */
const BATCH_COMPONENTS = [
  { id: 1, design_code: 'DESNAM', component_code: 'LITF', family_code: 'LIT', config_code: 'LITTIN', order_number: '#1039', order_date: 'Sep 1, 2026', color: 'Silver', status: 'Ready', failure: null, pair: 'start' },
  { id: 2, design_code: 'DESNAM', component_code: 'LITB', family_code: 'LIT', config_code: 'LITTIN', order_number: '#1039', order_date: 'Sep 1, 2026', color: 'Silver', status: 'Ready', failure: null, pair: 'end' },
  { id: 3, design_code: 'DESGOK', component_code: 'LITF', family_code: 'LIT', config_code: 'SOLO', order_number: '#1038', order_date: 'Sep 1, 2026', color: 'White/Gold', status: 'Ready', failure: null, pair: 'start' },
  { id: 4, design_code: 'DESGOK', component_code: 'LITB', family_code: 'LIT', config_code: 'SOLO', order_number: '#1038', order_date: 'Sep 1, 2026', color: 'White/Gold', status: 'Ready', failure: null, pair: 'end' },
  { id: 5, design_code: 'DESLUF', component_code: 'LITF', family_code: 'LIT', config_code: 'LITTIN', order_number: '#1036', order_date: 'Aug 31, 2026', color: 'White/Gold', status: 'Blocked', failure: 'MISSING_ARTWORK', pair: 'start' },
  { id: 6, design_code: 'DESLUF', component_code: 'LITB', family_code: 'LIT', config_code: 'LITTIN', order_number: '#1036', order_date: 'Aug 31, 2026', color: 'White/Gold', status: 'Blocked', failure: 'MISSING_ARTWORK', pair: 'end' },
  { id: 7, design_code: 'DESZOR', component_code: 'LITF', family_code: 'LIT', config_code: 'SOLO', order_number: '#1031', order_date: 'Aug 30, 2026', color: 'Silver', status: 'Printed', failure: null, pair: 'start' },
  { id: 8, design_code: 'DESZOR', component_code: 'LITB', family_code: 'LIT', config_code: 'SOLO', order_number: '#1031', order_date: 'Aug 30, 2026', color: 'Silver', status: 'Printed', failure: null, pair: 'end' },
  { id: 9, design_code: 'DESNEZ', component_code: 'LITF', family_code: 'LIT', config_code: 'SOLO', order_number: '#1029', order_date: 'Aug 29, 2026', color: 'Silver', status: 'Canceled', failure: null, pair: 'start' },
  { id: 10, design_code: 'DESNEZ', component_code: 'LITB', family_code: 'LIT', config_code: 'SOLO', order_number: '#1029', order_date: 'Aug 29, 2026', color: 'Silver', status: 'Canceled', failure: null, pair: 'end' },
];

/* Blocked queue rows are grouped by affected order item + failure + resolution
   (Decision #97), not one row per component. */
const BLOCKED = [
  {
    id: 1, order: '#1036', item: 'Luffy Flip Lighter + Tin Case', sku: 'LIT-DESLUF-GLD-TOR-LITTIN',
    components: '2 · LITF, LITB', code: 'MISSING_ARTWORK',
    detail: { family_code: 'LIT', config_code: 'LITTIN', design_code: 'DESLUF', expected_path: 'artwork/Flip Lighter/DESLUF.png', component_ids: '1187, 1188' },
  },
  {
    id: 2, order: '#1036', item: 'Gojo Grinder Set — 3 Piece', sku: 'GRS-DESGOJ-BLK-GRSFULL',
    components: '1 · GRS', code: 'MISSING_SERIES_METAFIELD',
    detail: { family_code: 'GRS', config_code: 'GRSFULL', design_code: 'DESGOJ', expected_path: 'artwork/Grinder Sets/{series}/DESGOJ.png', component_ids: '1191' },
  },
  {
    id: 3, order: '#1031', item: 'Naruto Ashtray', sku: 'ASH-DESNAM-CLR-SOLO',
    components: '1 · ASH', code: 'MISSING_ARTWORK',
    detail: { family_code: 'ASH', config_code: 'SOLO', design_code: 'DESNAM', expected_path: 'artwork/Ashtray/DESNAM.png', component_ids: '1164' },
  },
];

/* Missing SKU queue (stored code stays NO_SKU; label reads "Missing SKU"). */
const NO_SKU = [
  { id: 1, order: '#1036', item: 'Sanji Stash Box — Large / Black', line_item: 'LI-4471', proposal: 'BOX-DESSAN-BOX4' },
  { id: 2, order: '#1029', item: 'Zoro Wallet — Bifold / Brown', line_item: 'LI-4402', proposal: 'WAL-DESZOR-BRN-SOLO' },
  { id: 3, order: '#1027', item: 'Nezuko Tapestry — 40x60', line_item: 'LI-4388', proposal: 'TAP-DESNEZ-LRG-SOLO' },
];

const DEFERRED = [
  { id: 1, order: '#1034', item: 'Herb Grinder — Nezuko', sku: 'GRD-DESNEZ-BLK-SOLO', code: 'FAMILY_DEFERRED_MVP' },
  { id: 2, order: '#1028', item: 'Herb Grinder — Gojo', sku: 'GRD-DESGOJ-SIL-SOLO', code: 'FAMILY_DEFERRED_MVP' },
];

const WEBHOOKS = [
  { id: 1, topic: 'orders/paid', order_ref: '#1042', failure_summary: 'SKU_PARSE_ERROR', received_at: '2026-09-03 06:12' },
  { id: 2, topic: 'orders/fulfilled', order_ref: '—', failure_summary: 'ORDER_NOT_FOUND', received_at: '2026-09-02 21:44' },
];

const ARTWORK = [
  { id: 1, design: 'DESNAM', component: 'ASH', family: 'ASH', name: 'Naruto — Sage', status: 'Available', updated: 'Sep 1, 2026' },
  { id: 2, design: 'DESGOK', component: 'LITF', family: 'LIT', name: 'Goku — Ultra', status: 'Available', updated: 'Aug 30, 2026' },
  { id: 3, design: 'DESLUF', component: 'LITF', family: 'LIT', name: 'Luffy — Gear 5', status: 'Missing', updated: 'Aug 28, 2026' },
  { id: 4, design: 'DESZOR', component: 'BOX', family: 'BOX', name: 'Zoro — Three Sword', status: 'Available', updated: 'Aug 27, 2026' },
  { id: 5, design: 'DESNEZ', component: 'TIN', family: 'LIT', name: 'Nezuko — Bamboo', status: 'Available', updated: 'Aug 26, 2026' },
  { id: 6, design: 'DESGOJ', component: 'WALF', family: 'WAL', name: 'Gojo — Infinity', status: 'Retired', updated: 'Aug 20, 2026' },
];

Object.assign(window, {
  DS, ScreenSection, BoundedPanel, PageHeading, StatusGuide, QueueSwitcher, PerPage, SortHeader,
  Muted, Mono, FailureText, failureLabel, failureResolution,
  VALIDATION_FAILURE_SHORT_LABELS, VALIDATION_FAILURE_RESOLUTIONS, daysAgoIso,
  BATCH_ROWS, BATCH_HISTORY, ORDER_ROWS, ORDER_STATUS_FILTERS, ACTIVITY,
  BATCH_COMPONENTS, BLOCKED, NO_SKU, DEFERRED, WEBHOOKS, ARTWORK,
});
