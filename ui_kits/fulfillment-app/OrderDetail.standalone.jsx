const { Card, DataTable, StatusBadge, AgingFlag, Button, Icon, Badge, ErrorAlert, ConfirmModal, PairBracket, SegmentedSku, LoadingState } = window.SpicedAnimeSpicyDesignSystem_daab0d;

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

const TABS = [
  { id: 'production', label: 'Production' },
  { id: 'items', label: 'Order items' },
  { id: 'files', label: 'Files and reprints' },
  { id: 'history', label: 'History' },
];

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
  iso: daysAgoIso(7),
};

const ITEMS = [
  { id: 1, product_name: 'Naruto Flip Lighter + Tin Case', sku: 'LIT-DESNAM-SIL-TOR-LITTIN', family_code: 'LIT', design_code: 'DESNAM', options: { color: 'SIL', flame: 'TOR' }, config_code: 'LITTIN', variant_title: 'Silver / Torch', quantity: 1, failure: null },
  { id: 2, product_name: 'Naruto Ashtray', sku: 'ASH-DESNAM-CLR-SOLO', family_code: 'ASH', design_code: 'DESNAM', options: { color: 'CLR' }, config_code: 'SOLO', variant_title: 'Clear', quantity: 2, failure: null },
  { id: 3, product_name: 'Sanji Stash Box — Large', sku: 'BOX-DESSAN-BOX4', family_code: 'BOX', design_code: 'DESSAN', options: null, config_code: 'BOX4', variant_title: 'Large / Black', quantity: 1, failure: null },
  { id: 4, product_name: 'Nezuko Tapestry — 40x60', sku: 'TAP-DESNEZ-LRG-SOLO', family_code: 'TAP', design_code: 'DESNEZ', options: { size: 'LRG' }, config_code: 'SOLO', variant_title: '40x60', quantity: 1, failure: null },
  { id: 5, product_name: 'Herb Grinder — Nezuko', sku: 'GRD-DESNEZ-BLK-SOLO', family_code: 'GRD', design_code: 'DESNEZ', options: { color: 'BLK' }, config_code: 'SOLO', variant_title: 'Black', quantity: 1, failure: 'FAMILY_DEFERRED_MVP' },
];

/* One component row per produced unit. `order_item_id` ties a replacement back
   to the original it was created for; `artwork` carries the Drive source
   (Decision #102). */
const COMPONENTS = [
  { id: 1181, order_item_id: 1, component_code: 'LITF', family_code: 'LIT', design_code: 'DESNAM', config_code: 'LITTIN', batch_group: 'Lighter', status: 'Reprint Needed', failure: null, batch_id: 7, batch_label: 'Lighter #7', artwork: { design_code: 'DESNAM', status: 'Available', source_file_path: 'artwork/Flip Lighter/Front/DESNAM.png', drive: true } },
  { id: 1182, order_item_id: 1, component_code: 'LITB', family_code: 'LIT', design_code: 'DESNAM', config_code: 'LITTIN', batch_group: 'Lighter', status: 'Reprint Needed', failure: null, batch_id: 7, batch_label: 'Lighter #7', artwork: { design_code: 'DESNAM', status: 'Available', source_file_path: 'artwork/Flip Lighter/Back/DESNAM.png', drive: true } },
  { id: 1207, order_item_id: 1, component_code: 'LITF', family_code: 'LIT', design_code: 'DESNAM', config_code: 'LITTIN', batch_group: 'Lighter', status: 'Queued', failure: null, batch_id: 8, batch_label: 'Lighter #8', artwork: null },
  { id: 1208, order_item_id: 1, component_code: 'LITB', family_code: 'LIT', design_code: 'DESNAM', config_code: 'LITTIN', batch_group: 'Lighter', status: 'Queued', failure: null, batch_id: 8, batch_label: 'Lighter #8', artwork: null },
  { id: 1183, order_item_id: 1, component_code: 'TIN', family_code: 'LIT', design_code: 'DESNAM', config_code: 'LITTIN', batch_group: 'Tin', status: 'Printed', failure: null, batch_id: 4, batch_label: 'Tin #4', artwork: { design_code: 'DESNAM', status: 'Available', source_file_path: 'artwork/Tin Case/DESNAM.png', drive: true } },
  { id: 1184, order_item_id: 2, component_code: 'ASH', family_code: 'ASH', design_code: 'DESNAM', config_code: 'SOLO', batch_group: 'Ashtray', status: 'Ready', failure: null, batch_id: 12, batch_label: 'Ashtray #12', artwork: { design_code: 'DESNAM', status: 'Available', source_file_path: 'artwork/Ashtray/DESNAM.png', drive: true } },
  { id: 1185, order_item_id: 2, component_code: 'ASH', family_code: 'ASH', design_code: 'DESNAM', config_code: 'SOLO', batch_group: 'Ashtray', status: 'Ready', failure: null, batch_id: 12, batch_label: 'Ashtray #12', artwork: null },
  { id: 1186, order_item_id: 3, component_code: 'BOX', family_code: 'BOX', design_code: 'DESSAN', config_code: 'BOX4', batch_group: 'Box', status: 'Blocked', failure: 'MISSING_ARTWORK', batch_id: null, batch_label: null, artwork: { design_code: 'DESSAN', status: 'Missing', source_file_path: 'artwork/Stash Box/DESSAN.png', drive: false } },
  { id: 1187, order_item_id: 5, component_code: 'GRD', family_code: 'GRD', design_code: 'DESNEZ', config_code: 'SOLO', batch_group: '—', status: 'Deferred MVP', failure: 'FAMILY_DEFERRED_MVP', batch_id: null, batch_label: null, artwork: null },
];

const GENERATED_FILES = [
  { id: 1, file_name: 'LIGHTER-07-20260829.pptx', file_type: 'PPTX', batch_id: 7, batch_label: 'Lighter #7', created_at: 'Aug 29, 2026 14:02', drive: true },
  { id: 2, file_name: 'TIN-04-20260828.pptx', file_type: 'PPTX', batch_id: 4, batch_label: 'Tin #4', created_at: 'Aug 28, 2026 10:40', drive: true },
  { id: 3, file_name: 'LIGHTER-07-20260829-preview.pptx', file_type: 'PPTX (preview)', batch_id: 7, batch_label: 'Lighter #7', created_at: 'Aug 29, 2026 11:17', drive: false },
];

/* Decision #103: order events, component events for this order's components,
   and batch events for batches holding them — one timeline, newest first. */
const HISTORY = [
  { id: 40, when: 'Sep 3, 2026 08:22', actor: 'Operator', action: 'component_reprint_flagged', object: 'Component 1181 · LITF' },
  { id: 39, when: 'Sep 3, 2026 08:22', actor: 'System', action: 'component_created', object: 'Component 1207 · LITF' },
  { id: 38, when: 'Sep 3, 2026 08:22', actor: 'System', action: 'order_status_changed', object: 'Order #1034' },
  { id: 37, when: 'Sep 1, 2026 16:05', actor: 'Operator', action: 'batch_marked_printed', object: 'Batch Tin #4' },
  { id: 36, when: 'Aug 29, 2026 14:02', actor: 'Operator', action: 'pptx_generated', object: 'Batch Lighter #7' },
  { id: 35, when: 'Aug 29, 2026 09:51', actor: 'System', action: 'component_blocked', object: 'Component 1186 · BOX' },
  { id: 34, when: 'Aug 27, 2026 09:16', actor: 'System', action: 'component_created', object: 'Component 1181 · LITF' },
  { id: 33, when: 'Aug 27, 2026 09:16', actor: 'System', action: 'order_imported', object: 'Order #1034' },
];
const HISTORY_OLDER = [
  { id: 32, when: 'Aug 27, 2026 09:16', actor: 'System', action: 'component_created', object: 'Component 1187 · GRD' },
  { id: 31, when: 'Aug 27, 2026 09:15', actor: 'System', action: 'sku_parsed', object: 'Order item 4 · TAP-DESNEZ-LRG-SOLO' },
  { id: 30, when: 'Aug 27, 2026 09:14', actor: 'System', action: 'webhook_received', object: 'orders/paid · #1034' },
];

function SummaryCell({ icon, label, divider, emphasis, children }) {
  return (
    <div style={{ borderRight: divider ? '1px solid var(--line)' : undefined, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minHeight: 112, padding: 'var(--space-5)' }}>
      <span style={{ alignItems: 'center', color: 'var(--text-low)', display: 'inline-flex', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, gap: 'var(--space-2)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
        <span style={{ alignItems: 'center', background: 'var(--spice-tint)', border: '1px solid var(--line-spice)', borderRadius: 'var(--radius-sm)', color: 'var(--spice-400)', display: 'inline-flex', height: 28, justifyContent: 'center', width: 28 }}>
          <Icon name={icon} size={15} strokeWidth={2} />
        </span>
        {label}
      </span>
      <span style={{ color: 'var(--text-hi)', fontFamily: emphasis ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: emphasis ? 24 : 16, fontWeight: 700, lineHeight: 1.2 }}>{children}</span>
    </div>
  );
}

/* Financial and Fulfillment status stay plain label/value context — never
   status badges (§2.3). */
function PlainStatus({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <dt style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>{label}</dt>
      <dd style={{ color: 'var(--text-hi)', fontSize: 14, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{value || '—'}</dd>
    </div>
  );
}

function BatchLink({ id, label }) {
  if (!id) return <Muted>—</Muted>;
  return <a href={`#batches/${id}`}><Mono style={{ fontSize: 12 }}>{label || `#${id}`}</Mono></a>;
}

function OrderDetail({ go }) {
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
    const t = window.setTimeout(() => { setHistory(HISTORY); setHistoryLoading(false); }, 700);
    return () => window.clearTimeout(t);
  }, [tab, history]);

  const hasLighterPair = components.some((c) => c.component_code === 'LITF' || c.component_code === 'LITB');

  /* A bracketed component still shows its own status badge — the bracket is a
     grouping cue, never a status (Decision #86). TIN only shares a source
     artwork file with the lighter pair, so it gets the distinct
     `shared-source` treatment. */
  const relationshipCell = (c) => {
    const inner = <Mono style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{c.component_code}</Mono>;
    if (PAIR_COMPONENT_CODES.includes(c.component_code)) return <PairBracket variant="pair">{inner}</PairBracket>;
    if (c.component_code === 'TIN' && hasLighterPair) return <PairBracket variant="shared-source">{inner}</PairBracket>;
    return inner;
  };

  const flagReprint = () => {
    const target = reprintTarget;
    if (!target) return;
    /* Flagging transitions the component to Reprint Needed and queues its
       replacement automatically; front/back pairs are flagged together. There
       is no reason field and no manual batch assignment. */
    const group = PAIR_COMPONENT_CODES.includes(target.component_code)
      ? components.filter((c) => c.order_item_id === target.order_item_id && PAIR_COMPONENT_CODES.includes(c.component_code) && c.status === 'Printed')
      : [target];
    const nextId = Math.max(...components.map((c) => c.id)) + 1;
    const replacements = group.map((c, i) => ({ ...c, id: nextId + i, status: 'Queued', batch_id: null, batch_label: null, artwork: null }));
    setComponents([
      ...components.map((c) => (group.some((g) => g.id === c.id) ? { ...c, status: 'Reprint Needed' } : c)),
      ...replacements,
    ]);
    setReprintTarget(null);
    setNotice({ tone: 'success', title: 'Reprint flagged', body: `${group.map((c) => c.component_code).join(', ')} marked Reprint Needed. ${group.length} replacement component${group.length > 1 ? 's' : ''} queued for the current Open batch.` });
    setHistory(null);
  };

  const componentColumns = [
    { key: 'component_code', header: 'Relationship / Component', width: 175, render: (_v, c) => relationshipCell(c) },
    { key: 'family_code', header: 'Family', mono: true, width: 85 },
    { key: 'design_code', header: 'Design', mono: true, width: 110 },
    { key: 'config_code', header: 'Config', mono: true, width: 105 },
    { key: 'batch_group', header: 'Batch Group', width: 120, render: (v) => <Muted style={{ fontSize: 12 }}>{v}</Muted> },
    /* Component lists render a stored `Canceled` as "Print Not Needed"
       (Decision #64) — the Status Guide keeps the raw string. */
    { key: 'status', header: 'Status', width: 165, render: (v) => <StatusBadge status={v} context="component" size="sm" /> },
    { key: 'failure', header: 'Failure', width: 175, render: (v) => v ? <FailureText code={v} /> : <Muted>—</Muted> },
    { key: 'batch_id', header: 'Batch', width: 115, render: (_v, c) => <BatchLink id={c.batch_id} label={c.batch_label} /> },
    { key: 'recovery', header: 'Recovery', align: 'right', width: 130, render: (_v, c) => c.status === 'Printed'
      ? <Button size="sm" variant="outline" onClick={() => setReprintTarget(c)}>Flag Reprint</Button>
      : <Muted>—</Muted> },
  ];

  const itemColumns = [
    { key: 'product_name', header: 'Product' },
    { key: 'sku', header: 'SKU', width: 330, render: (_v, it) => (
      <SegmentedSku sku={it.sku} familyCode={it.family_code} designCode={it.design_code} options={it.options} configCode={it.config_code} size="sm" />
    ) },
    { key: 'variant_title', header: 'Variant', width: 150, render: (v) => <Muted style={{ fontSize: 12 }}>{v}</Muted> },
    { key: 'quantity', header: 'Qty', align: 'right', width: 70, mono: true },
    { key: 'failure', header: 'Failure', width: 175, render: (v) => v ? <FailureText code={v} /> : <Muted>—</Muted> },
  ];

  const producedItems = ITEMS.filter((i) => !NON_PRODUCED_FAMILIES.includes(i.family_code));
  const nonProducedItems = ITEMS.filter((i) => NON_PRODUCED_FAMILIES.includes(i.family_code));
  const producedComponents = components.filter((c) => c.status !== 'Deferred MVP');
  const deferredComponents = components.filter((c) => c.status === 'Deferred MVP');
  const reprintOriginals = components.filter((c) => c.status === 'Reprint Needed');
  const artworkComponents = components.filter((c) => c.artwork);
  const agingSuppressed = AGING_SUPPRESSED_STATUSES.includes(ORDER.status);

  const replacementFor = (original) => components.find((c) => (
    c.id !== original.id && c.order_item_id === original.order_item_id &&
    c.component_code === original.component_code && c.status !== 'Reprint Needed'
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <a href="#orders" onClick={(e) => { e.preventDefault(); go && go('orders'); }} style={{ alignItems: 'center', color: 'var(--text-mid)', display: 'inline-flex', fontSize: 11, fontWeight: 700, gap: 6, letterSpacing: '0.1em', marginBottom: 14, textTransform: 'uppercase' }}>
          <Icon name="chevron-right" size={13} style={{ transform: 'rotate(180deg)' }} />Orders
        </a>
        <PageHeading
          eyebrow="Order Detail" title={`Order ${ORDER.order_number}`}
          right={<Button variant="primary" iconLeft={<Icon name="refresh-cw" size={15} />} onClick={() => setConfirm('reimport')}>Reimport</Button>}
        />
      </div>

      {/* Connected four-part summary (Decision #98). Customer name and Sales
          Channel are deliberately absent (Decision #94). */}
      <div aria-label="Order summary" style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', overflow: 'hidden' }}>
        <SummaryCell icon="circle-dashed" label="Status" divider>
          <span style={{ alignItems: 'center', display: 'inline-flex', flexWrap: 'wrap', gap: 8 }}>
            <StatusBadge status={ORDER.status} size="sm" />
            {!agingSuppressed && <AgingFlag sinceIso={ORDER.iso} />}
          </span>
        </SummaryCell>
        <SummaryCell icon="clock" label="Order Date" divider>{ORDER.shopify_created_at}</SummaryCell>
        <SummaryCell icon="shopping-cart" label="# of Items" divider emphasis>{ITEMS.length}</SummaryCell>
        <SummaryCell icon="boxes" label="# of Components" emphasis>{components.length}</SummaryCell>
      </div>

      <dl style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', margin: 0 }}>
        <PlainStatus label="Financial Status" value={ORDER.financial_status} />
        {/* A null Shopify fulfillment status displays as `Unfulfilled`. */}
        <PlainStatus label="Fulfillment Status" value={ORDER.fulfillment_status || 'Unfulfilled'} />
      </dl>

      {notice && (
        <ErrorAlert tone={notice.tone} title={notice.title} onDismiss={() => setNotice(null)}>{notice.body}</ErrorAlert>
      )}

      {/* Four tabs (Decision #91). */}
      <div role="tablist" aria-label="Order detail sections" style={{ borderBottom: '1px solid var(--line)', display: 'flex', gap: 'var(--space-5)', overflowX: 'auto' }}>
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setTab(t.id)}
              style={{
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${on ? 'var(--spice-500)' : 'transparent'}`,
                color: on ? 'var(--text-hi)' : 'var(--text-low)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.08em', padding: 'var(--space-3) var(--space-1)',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}
            >{t.label}</button>
          );
        })}
      </div>

      {tab === 'production' && (
        <ScreenSection eyebrow="Generated" title="PRODUCTION COMPONENTS">
          <DataTable columns={componentColumns} rows={producedComponents} rowKey="id" emptyLabel="No production components" />
          <Muted style={{ fontSize: 11 }}>
            Flagging a printed component transitions it to Reprint Needed and queues its replacement in the current Open batch automatically. Front/back pairs are flagged together.
          </Muted>
        </ScreenSection>
      )}

      {tab === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ScreenSection eyebrow="Shopify" title="ORDER ITEMS">
            <DataTable columns={itemColumns} rows={producedItems} rowKey="id" emptyLabel="No order items" />
          </ScreenSection>
          {/* Non-produced families (BAT, HOD, PIL, TAP, TOT) are listed in
              their own headed section (§2.3). */}
          {nonProducedItems.length > 0 && (
            <ScreenSection eyebrow="Not produced" title="NON-PRODUCED ITEMS">
              <DataTable columns={itemColumns} rows={nonProducedItems} rowKey="id" emptyLabel="No non-produced items" />
              <Muted style={{ fontSize: 11 }}>These families are shipped but never printed. They appear in the packing export and generate no production components.</Muted>
            </ScreenSection>
          )}
          {deferredComponents.length > 0 && (
            <ScreenSection eyebrow="Deferred MVP" title="DEFERRED ITEMS">
              <DataTable columns={componentColumns} rows={deferredComponents} rowKey="id" emptyLabel="No deferred items" />
            </ScreenSection>
          )}
        </div>
      )}

      {tab === 'files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ScreenSection eyebrow="Recovery" title="REPRINTS">
            {reprintOriginals.length === 0 ? (
              <Card><p style={{ color: 'var(--text-mid)', margin: 0 }}>No components on this order have been flagged for reprint.</p></Card>
            ) : (
              <DataTable
                rowKey="id" rows={reprintOriginals}
                columns={[
                  { key: 'component_code', header: 'Component', width: 175, render: (_v, c) => relationshipCell(c) },
                  { key: 'design_code', header: 'Design', mono: true, width: 115 },
                  { key: 'batch_id', header: 'Printed in batch', width: 150, render: (_v, c) => <BatchLink id={c.batch_id} label={c.batch_label} /> },
                  /* A replacement not yet assigned to a batch reads
                     "Awaiting batch" — `Open` is reserved for batch status
                     and is never used for a reprint (Decision #88). */
                  { key: 'replacement', header: 'Replacement', width: 165, render: (_v, c) => {
                    const r = replacementFor(c);
                    if (r && r.batch_id) return <BatchLink id={r.batch_id} label={r.batch_label} />;
                    if (r) return <Badge tone="neutral">Awaiting batch</Badge>;
                    return <Muted>—</Muted>;
                  } },
                  { key: 'status', header: 'State', width: 165, render: (v) => <StatusBadge status={v} context="component" size="sm" /> },
                ]}
                emptyLabel="No reprints"
              />
            )}
          </ScreenSection>

          {/* Decision #102: source artwork is shown here directly, so the
              operator is never sent to Artwork Library to find a known file. */}
          <ScreenSection eyebrow="Drive" title="SOURCE ARTWORK">
            <div style={{ display: 'grid', gap: 'var(--card-gap)', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
              {artworkComponents.map((c) => (
                <div key={c.id} style={{ alignItems: 'center', background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
                  {/* The PNG textures ship as utility classes, never inline:
                      their `url()` is stylesheet-relative and would resolve
                      against the document if inlined. */}
                  <div className={c.artwork.drive ? 'tex-halftone' : undefined} style={{ alignItems: 'center', backgroundColor: 'var(--ink-850)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', color: 'var(--text-faint)', display: 'flex', flex: 'none', height: 88, justifyContent: 'center', width: 88 }}>
                    <Icon name={c.artwork.drive ? 'image' : 'octagon-x'} size={22} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <strong style={{ color: 'var(--text-hi)', fontSize: 13 }}>{c.component_code} · {c.design_code}</strong>
                    <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
                      <StatusBadge status={c.artwork.status} size="sm" />
                    </span>
                    <Mono style={{ color: 'var(--text-low)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.artwork.source_file_path}</Mono>
                    {c.artwork.drive
                      ? <a href="#drive" style={{ fontSize: 12 }}>Open source artwork in Drive</a>
                      : <Muted style={{ fontSize: 11 }}>No Drive link available</Muted>}
                  </div>
                </div>
              ))}
            </div>
          </ScreenSection>

          <ScreenSection eyebrow="Drive" title="GENERATED FILES">
            <DataTable
              rowKey="id" rows={GENERATED_FILES}
              columns={[
                { key: 'file_name', header: 'File', render: (v) => <Mono style={{ color: 'var(--text-hi)', fontSize: 12 }}>{v}</Mono> },
                { key: 'file_type', header: 'Type', width: 145, render: (v) => <Muted style={{ fontSize: 12 }}>{v}</Muted> },
                { key: 'batch_id', header: 'Batch', width: 140, render: (_v, f) => <BatchLink id={f.batch_id} label={f.batch_label} /> },
                { key: 'created_at', header: 'Created', mono: true, width: 175 },
                { key: 'drive', header: 'Drive', align: 'right', width: 190, render: (v) => v
                  ? <a href="#drive" style={{ fontSize: 12 }}>Open in Drive</a>
                  : <Muted style={{ fontSize: 11 }}>No Drive link available</Muted> },
              ]}
              emptyLabel="No generated files are known for this order."
            />
          </ScreenSection>
        </div>
      )}

      {tab === 'history' && (
        <ScreenSection eyebrow="Lifecycle" title="HISTORY">
          {historyLoading && !history && <LoadingState variant="skeleton" rows={4} label="Loading order history" logoSrc={window.__resources.spinnerLogo} />}
          {history && (
            <React.Fragment>
              <DataTable
                rowKey="id" rows={historyExpanded ? [...history, ...HISTORY_OLDER] : history}
                columns={[
                  { key: 'when', header: 'When', mono: true, width: 185 },
                  { key: 'actor', header: 'Actor', width: 120, render: (v) => <Muted style={{ fontSize: 12 }}>{v}</Muted> },
                  { key: 'action', header: 'Action', mono: true },
                  { key: 'object', header: 'Object', width: 260, render: (v) => <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>{v}</span> },
                ]}
                emptyLabel="No recorded lifecycle history for this order"
              />
              <div style={{ alignItems: 'center', display: 'flex', gap: 14 }}>
                {!historyExpanded && <Button variant="outline" size="sm" onClick={() => setHistoryExpanded(true)}>Load more history</Button>}
                <Muted style={{ fontSize: 11 }}>One timeline: this order's events, its components' events, and events for the batches holding them — newest first.</Muted>
              </div>
            </React.Fragment>
          )}
        </ScreenSection>
      )}

      {/* Closed by default (Decision #107) and always the RAW vocabulary. */}
      <StatusGuide label="Order Detail status key" groups={[
        { title: 'Order', entries: [
          { status: 'Queued for Production', meaning: 'Imported and decoded, components not yet all printed.' },
          { status: 'In Production', meaning: 'Components printed; order moving toward packing.' },
          { status: 'In Production (Needs Reprint)', meaning: 'An active reprint flag exists on at least one component.' },
          { status: 'Fulfilled Externally', meaning: 'Reconciled from Shopify as fulfilled outside the app. Terminal.' },
          { status: 'Canceled', meaning: 'Cancelled or refunded in Shopify. Terminal.' },
        ] },
        { title: 'Component', entries: [
          { status: 'Queued', meaning: 'Decoded, waiting on artwork resolution.' },
          { status: 'Ready', meaning: 'Artwork resolved. Eligible for the next print run.' },
          { status: 'Printed', meaning: 'Included in a printed batch.' },
          { status: 'Blocked', meaning: 'Artwork or metafield could not be resolved. Excluded from generation.' },
          { status: 'Reprint Needed', meaning: 'Flagged for reprint; a replacement component has been created.' },
          { status: 'Deferred MVP', meaning: 'Family deferred out of MVP scope. No action required.' },
          { status: 'Canceled', meaning: 'Pulled from its batch because the order was cancelled. Shown in component lists as "Print Not Needed".' },
        ] },
      ]} />

      <ConfirmModal
        open={confirm === 'reimport'} tone="warning" title="Reimport this order?"
        confirmLabel="Reimport" cancelLabel="Cancel"
        onConfirm={() => { setConfirm(null); setNotice({ tone: 'success', title: 'Reimport complete', body: 'Items processed: 5. Components created: 0. No duplicate records were made.' }); }}
        onCancel={() => setConfirm(null)}
      >
        This re-processes the order against current SKU and component rules. It will not duplicate existing order items or components, and fills in missing components if the SKU dictionary has been updated.
      </ConfirmModal>

      <ConfirmModal
        open={!!reprintTarget} tone="warning" title="Flag this component for reprint?"
        confirmLabel="Flag Reprint" cancelLabel="Cancel"
        onConfirm={flagReprint} onCancel={() => setReprintTarget(null)}
      >
        {reprintTarget ? `${reprintTarget.component_code} will be marked Reprint Needed and a replacement will be queued in the current Open batch. There is no reason field and no manual batch assignment.` : null}
      </ConfirmModal>
    </div>
  );
}

Object.assign(window, { OrderDetail });
