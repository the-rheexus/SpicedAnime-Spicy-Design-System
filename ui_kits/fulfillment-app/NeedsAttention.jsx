const { DataTable, StatusBadge, Button, Icon, EmptyState, DeferredPanel, ErrorAlert, Badge, Checkbox, Card } = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Expandable "Technical details" disclosure (Decision #97): keeps family,
   config, design code, the raw validation code, the expected Drive path and
   component IDs available without cluttering the operator workspace. */
function TechnicalDetails({ detail, code }) {
  return (
    <details className="status-guide" style={{ background: 'var(--ink-850)', borderTop: '1px solid var(--line-soft)' }}>
      <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span className="status-guide-chevron" style={{ display: 'flex' }}><Icon name="chevron-right" size={12} /></span>
        Technical details
      </summary>
      <div style={{ display: 'grid', gap: '10px 24px', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', padding: '4px 16px 16px 34px' }}>
        {[
          ['Family', detail.family_code], ['Config', detail.config_code], ['Design', detail.design_code],
          ['Raw code', code], ['Expected path', detail.expected_path], ['Component IDs', detail.component_ids],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{k}</div>
            <Mono style={{ color: 'var(--text-mid)', fontSize: 11, wordBreak: 'break-all' }}>{v}</Mono>
          </div>
        ))}
      </div>
    </details>
  );
}

function BlockedQueue() {
  const [resolved, setResolved] = React.useState([]);
  const rows = BLOCKED.filter((b) => !resolved.includes(b.id));

  if (rows.length === 0) {
    return <EmptyState icon="circle-check" title="NO BLOCKED COMPONENTS">Components appear here when artwork or a required metafield can't be resolved.</EmptyState>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {rows.map((b) => (
        <div key={b.id} style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '90px minmax(0,1.6fr) 150px minmax(0,1fr) minmax(0,1.4fr)', padding: '16px 18px' }}>
            <div>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Order</div>
              <a href={`#orders/${b.order.replace('#', '')}`}><Mono style={{ fontSize: 13, fontWeight: 700 }}>{b.order}</Mono></a>
            </div>
            <div>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Item / SKU</div>
              <div style={{ color: 'var(--text-hi)', fontSize: 13 }}>{b.item}</div>
              <Mono style={{ color: 'var(--text-low)', fontSize: 11 }}>{b.sku}</Mono>
            </div>
            <div>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Components</div>
              <Mono style={{ color: 'var(--text-mid)', fontSize: 12 }}>{b.components}</Mono>
            </div>
            <div>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Issue</div>
              <FailureText code={b.code} />
            </div>
            <div>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Resolution</div>
              <div style={{ color: 'var(--text-mid)', fontSize: 12, marginBottom: 10 }}>{failureResolution(b.code)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {b.code === 'MISSING_ARTWORK'
                  ? <Button size="sm" variant="outline" iconLeft={<Icon name="plus" size={13} />} onClick={() => setResolved((r) => [...r, b.id])}>Re-upload artwork</Button>
                  : <Button size="sm" variant="outline" iconLeft={<Icon name="tag" size={13} />} onClick={() => setResolved((r) => [...r, b.id])}>Fix SKU mapping</Button>}
              </div>
            </div>
          </div>
          <TechnicalDetails detail={b.detail} code={b.code} />
        </div>
      ))}
    </div>
  );
}

/* Missing SKU queue with single + bulk recovery (Decision #104): select many →
   generate proposals → one-page review → approve/reject → bulk reimport. */
function MissingSkuQueue() {
  const [selected, setSelected] = React.useState([]);
  const [review, setReview] = React.useState(null);
  const [decisions, setDecisions] = React.useState({});
  const [approvedCount, setApprovedCount] = React.useState(0);

  const openReview = (ids) => { setReview(ids); setDecisions({}); };
  const decide = (id, verdict) => setDecisions((d) => ({ ...d, [id]: verdict }));

  if (review) {
    const items = NO_SKU.filter((n) => review.includes(n.id));
    const approved = items.filter((n) => decisions[n.id] === 'approve').length;
    const rejected = items.filter((n) => decisions[n.id] === 'reject').length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 14 }}>
          <Button variant="ghost" size="sm" iconLeft={<Icon name="chevron-right" size={13} style={{ transform: 'rotate(180deg)' }} />} onClick={() => setReview(null)}>Back to queue</Button>
          <span style={{ flex: 1 }} />
          <Mono style={{ color: 'var(--text-low)', fontSize: 12 }}>{approved} approved · {rejected} rejected · {items.length - approved - rejected} pending</Mono>
        </div>

        <Card eyebrow="SKU recovery" title="REVIEW PROPOSALS">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((n) => {
              const v = decisions[n.id];
              return (
                <div key={n.id} style={{ alignItems: 'center', borderBottom: '1px solid var(--line-soft)', display: 'grid', gap: 18, gridTemplateColumns: '90px minmax(0,1fr) minmax(0,1fr) 190px', padding: '14px 0' }}>
                  <Mono style={{ fontSize: 13 }}>{n.order}</Mono>
                  <div>
                    <div style={{ color: 'var(--text-hi)', fontSize: 13 }}>{n.item}</div>
                    <Mono style={{ color: 'var(--text-low)', fontSize: 11 }}>{n.line_item}</Mono>
                  </div>
                  <Mono style={{ color: v === 'reject' ? 'var(--text-faint)' : 'var(--tone-success)', fontSize: 13, fontWeight: 700, textDecoration: v === 'reject' ? 'line-through' : 'none' }}>{n.proposal}</Mono>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {v
                      ? <StatusBadge status={v === 'approve' ? 'Success' : 'Canceled'} label={v === 'approve' ? 'Approved' : 'Rejected'} size="sm" />
                      : (
                        <React.Fragment>
                          <Button size="sm" variant="outline" onClick={() => decide(n.id, 'approve')}>Approve</Button>
                          <Button size="sm" variant="ghost" onClick={() => decide(n.id, 'reject')}>Reject</Button>
                        </React.Fragment>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="outline" size="sm" onClick={() => setDecisions(Object.fromEntries(items.map((n) => [n.id, 'approve'])))}>Approve all</Button>
            <Button variant="ghost" size="sm" onClick={() => setDecisions(Object.fromEntries(items.map((n) => [n.id, 'reject'])))}>Reject all</Button>
            <span style={{ flex: 1 }} />
            <Button
              variant="primary" size="sm" disabled={approved === 0}
              iconLeft={<Icon name="refresh-cw" size={13} />}
              onClick={() => { setApprovedCount(approved); setReview(null); setSelected([]); }}
            >
              Apply and reimport {approved > 0 ? `(${approved})` : ''}
            </Button>
          </div>
          <p style={{ color: 'var(--text-low)', fontSize: 11, margin: '12px 0 0' }}>
            Rejected proposals are discarded and never persisted. Approved proposals save to the canonical SKU dictionary and join the cumulative Shopify CSV export.
          </p>
        </Card>
      </div>
    );
  }

  const allIds = NO_SKU.map((n) => n.id);
  const headerChecked = selected.length === allIds.length && allIds.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {approvedCount > 0 && (
        <ErrorAlert tone="success" title={`${approvedCount} SKUs applied`}>
          The affected orders were reimported from Shopify and their missing production components created.
        </ErrorAlert>
      )}

      <DataTable
        rowKey="id" rows={NO_SKU}
        selectable selected={selected} onSelect={setSelected}
        columns={[
          { key: 'order', header: 'Order', mono: true, width: 100, render: (v) => <a href={`#orders/${v.replace('#', '')}`}><Mono>{v}</Mono></a> },
          { key: 'item', header: 'Item' },
          { key: 'line_item', header: 'Line Item', mono: true, width: 120 },
          { key: 'action', header: 'Action', align: 'right', width: 170, render: (_v, row) => (
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openReview([row.id]); }}>Generate SKU</Button>
          ) },
        ]}
        emptyLabel="No items with a missing SKU"
      />

      <div style={{ alignItems: 'center', background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, padding: '12px 16px' }}>
        <Checkbox
          checked={headerChecked}
          indeterminate={selected.length > 0 && !headerChecked}
          onChange={(on) => setSelected(on ? allIds : [])}
          label={<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Select all</span>}
        />
        <Mono style={{ color: 'var(--text-low)', fontSize: 12 }}>{selected.length} selected</Mono>
        <span style={{ flex: 1 }} />
        <Button variant="primary" size="sm" disabled={selected.length === 0} iconLeft={<Icon name="tag" size={13} />} onClick={() => openReview(selected)}>
          Generate proposals
        </Button>
      </div>
    </div>
  );
}

function NeedsAttention() {
  const [queue, setQueue] = React.useState('blocked');

  const queues = [
    { key: 'blocked', label: 'Blocked', count: BLOCKED.length },
    { key: 'missing', label: 'Missing SKU', count: NO_SKU.length },
    { key: 'deferred', label: 'Deferred', count: DEFERRED.length },
    { key: 'webhooks', label: 'Webhook Failures', count: WEBHOOKS.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeading eyebrow="Operations" title="Needs Attention" />

      {/* One counted queue switcher; only the selected queue occupies the
          workspace (Decision #97). The four summary count cards were removed
          by Decision #89. */}
      <QueueSwitcher queues={queues} active={queue} onChange={setQueue} />

      {queue === 'blocked' && <BlockedQueue />}
      {queue === 'missing' && <MissingSkuQueue />}

      {queue === 'deferred' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <DataTable
            rowKey="id" rows={DEFERRED}
            columns={[
              { key: 'order', header: 'Order', mono: true, width: 100, render: (v) => <a href={`#orders/${v.replace('#', '')}`}><Mono>{v}</Mono></a> },
              { key: 'item', header: 'Item / SKU', render: (v, row) => (
                <div>
                  <div style={{ color: 'var(--text-hi)', fontSize: 13 }}>{v}</div>
                  <Mono style={{ color: 'var(--text-low)', fontSize: 11 }}>{row.sku}</Mono>
                </div>
              ) },
              { key: 'reason', header: 'Reason', render: (_v, row) => <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>{failureLabel(row.code)}</span> },
            ]}
            emptyLabel="No deferred items"
          />
          <DeferredPanel title="Standalone grinder production" eta="post-MVP">
            GRD line items parse to a valid SKU but route here rather than into a print batch. They never block the rest of an order. This queue is informational and read-only.
          </DeferredPanel>
        </div>
      )}

      {queue === 'webhooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <DataTable
            rowKey="id" rows={WEBHOOKS}
            columns={[
              { key: 'topic', header: 'Topic', mono: true, width: 180 },
              { key: 'order_ref', header: 'Shopify order reference', mono: true, width: 200 },
              { key: 'failure_summary', header: 'Failure summary', render: (v) => <FailureText code={v} /> },
              { key: 'received_at', header: 'Received at', mono: true, width: 170, render: (v) => <Muted>{v}</Muted> },
            ]}
            emptyLabel="No webhook processing failures"
          />
          <p style={{ color: 'var(--text-low)', fontSize: 11, margin: 0 }}>
            Read-only. Failed webhook deliveries are reported separately and do not contribute to the Needs Attention navigation badge.
          </p>
        </div>
      )}

      {/* The guide explains only Blocked and Deferred MVP (Decision #97). */}
      <StatusGuide label="Status guide" groups={[{ title: 'Component', entries: [
        { status: 'Blocked', meaning: 'Artwork or a required metafield could not be resolved. Counted in the navigation badge, including items blocked with NO_SKU.' },
        { status: 'Deferred MVP', meaning: 'A supported SKU held out of production for a later phase. Never blocks the rest of an order.' },
      ] }]} />
    </div>
  );
}

Object.assign(window, { NeedsAttention, BlockedQueue, MissingSkuQueue, TechnicalDetails });
