const { MetricCard, DataTable, StatusBadge, AgingFlag, Button, Icon, EmptyState } = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Needs Attention tile (Decision #93): one merged total, with a hover-revealed
   informational breakdown. The breakdown rows are labels with counts, NOT
   navigation targets — every figure stays reachable by clicking the tile, so
   nothing depends on hover. */
function NeedsAttentionTile({ go, blocked, missingSku, deferred }) {
  const [hover, setHover] = React.useState(false);
  const total = blocked + missingSku + deferred;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <MetricCard
        label="Needs attention" value={String(total)} icon="triangle-alert"
        hint="blocked · missing SKU · deferred"
        onClick={() => go('needsAttention')}
      />
      {hover && (
        <div
          role="presentation"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20,
            background: 'var(--surface-raised)', border: '1px solid var(--line-strong)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-pop)', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 9,
          }}
        >
          {[['Blocked components', blocked, 'danger'], ['Missing SKU', missingSku, 'danger'], ['Deferred items', deferred, 'neutral']].map(([label, count, tone]) => (
            <div key={label} style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <span style={{ alignItems: 'center', color: 'var(--text-mid)', display: 'inline-flex', fontSize: 12, gap: 8 }}>
                <span style={{ background: `var(--tone-${tone})`, borderRadius: '50%', flex: 'none', height: 6, width: 6 }} />
                {label}
              </span>
              <Mono style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 700 }}>{count}</Mono>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SystemStatusTile({ go }) {
  const rows = [['Shopify', true], ['Google Drive', true], ['Celery worker', false]];
  return (
    <div
      onClick={() => go('settings')}
      style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', padding: '20px 22px' }}
    >
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>System status</span>
        <span style={{ color: 'var(--text-faint)', display: 'flex' }}><Icon name="settings" size={17} /></span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map(([name, ok]) => (
          <div key={name} style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>{name}</span>
            <StatusBadge status={ok ? 'Available' : 'Failed'} label={ok ? 'Connected' : 'Not connected'} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ go }) {
  /* Group and Batch stay separate columns; Batch shows only `#N` and never
     repeats the group name; the timestamp column is `Started` (Decision #95). */
  const columns = [
    { key: 'group', header: 'Group', width: 190, render: (v) => <span style={{ color: 'var(--text-hi)', fontWeight: 700, whiteSpace: 'nowrap' }}>{v}</span> },
    { key: 'seq', header: 'Batch', mono: true, width: 76 },
    { key: 'state', header: 'State', width: 130, render: (v) => <StatusBadge status={v} size="sm" /> },
    {
      key: 'ready', header: 'Ready', width: 150,
      render: (_v, row) => row.total === 0
        ? <Muted style={{ fontFamily: 'var(--font-mono)' }}>Empty batch</Muted>
        : <span style={{ color: row.ready === row.total ? 'var(--tone-success)' : 'var(--tone-warning)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.ready}/{row.total} ready</span>,
    },
    { key: 'blocked', header: 'Blocked', width: 130, render: (v) => v === 0 ? <Muted>0</Muted> : <StatusBadge status="Blocked" label={`Blocked ${v}`} size="sm" /> },
    { key: 'age', header: 'Oldest age', width: 120, render: (_v, row) => row.aging ? <AgingFlag sinceIso={row.iso} /> : <Muted>{row.age}d</Muted> },
    { key: 'started', header: 'Started', width: 130, render: (v) => <Muted>{v}</Muted> },
    { key: 'action', header: '', align: 'right', width: 100, render: () => <Button size="sm" variant="outline" onClick={() => go('batchDetail')}>Open</Button> },
  ];

  const blocked = BLOCKED.length, missingSku = NO_SKU.length, deferred = DEFERRED.length;

  /* Preview rows: blocked first, then oldest first (Decision #90). */
  const preview = [
    ...BLOCKED.map((b) => ({ id: `b${b.id}`, kind: 'Blocked', tone: 'danger', order: b.order, text: failureLabel(b.code), action: 'Revalidate' })),
    ...NO_SKU.map((n) => ({ id: `n${n.id}`, kind: 'Missing SKU', tone: 'danger', order: n.order, text: n.item, action: 'Generate SKU' })),
    ...DEFERRED.map((d) => ({ id: `d${d.id}`, kind: 'Deferred', tone: 'neutral', order: d.order, text: d.item, action: null })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Four tiles: Open Batches, Needs Attention, Queued, System Status (#93). */}
      <section style={{ display: 'grid', gap: 'var(--card-gap)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <MetricCard label="Open batches" value="6" icon="layers" accent hint="active groups" onClick={() => go('batches')} />
        <NeedsAttentionTile go={go} blocked={blocked} missingSku={missingSku} deferred={deferred} />
        <MetricCard label="Queued" value="24" icon="shopping-cart" hint="orders" onClick={() => go('orders')} />
        <SystemStatusTile go={go} />
      </section>

      <ScreenSection eyebrow="Production" title="ACTIVE BATCHES">
        <DataTable columns={columns} rows={BATCH_ROWS} rowKey="id" emptyLabel="No open batches" />
      </ScreenSection>

      <div style={{ alignItems: 'start', display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* Recent Activity caps at 25 entries; semantic activity icons (#95). */}
        <BoundedPanel eyebrow="Audit" title="RECENT ACTIVITY" cap={25} onViewAll={() => go('audit')}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {ACTIVITY.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '11px 0 11px 18px', width: 30 }}>
                    <span style={{ color: 'var(--text-faint)', display: 'flex' }}><Icon name={e.icon} size={15} /></span>
                  </td>
                  <td style={{ padding: '11px 10px', width: 76 }}>
                    <span style={{ color: e.actor === 'Operator' ? 'var(--spice-400)' : 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{e.actor}</span>
                  </td>
                  <td style={{ padding: '11px 0' }}><Mono style={{ color: 'var(--text-hi)', fontSize: 12 }}>{e.action}</Mono></td>
                  <td style={{ color: 'var(--text-mid)', fontSize: 12, padding: '11px 12px' }}>{e.object}</td>
                  <td style={{ color: 'var(--text-low)', fontSize: 11, padding: '11px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </BoundedPanel>

        {/* Needs Attention preview caps at 30 eligible items (#95); inline
            controls appear only where the action already exists on the
            Needs Attention screen (#90). */}
        <BoundedPanel eyebrow="Exceptions" title="NEEDS YOUR ATTENTION" tone="danger" cap={30} onViewAll={() => go('needsAttention')}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {preview.map((p) => (
              <div key={p.id} style={{ alignItems: 'center', borderBottom: '1px solid var(--line-soft)', display: 'flex', gap: 12, padding: '12px 18px' }}>
                <span style={{ color: `var(--tone-${p.tone})`, display: 'flex' }}>
                  <Icon name={p.tone === 'danger' ? 'octagon-x' : 'minus'} size={15} />
                </span>
                <a href={`#orders/${p.order.replace('#', '')}`}><Mono style={{ fontSize: 12 }}>{p.order}</Mono></a>
                <span style={{ color: 'var(--text-low)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', width: 84 }}>{p.kind}</span>
                <span style={{ color: 'var(--text-mid)', flex: 1, fontSize: 12, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</span>
                {p.action && <Button size="sm" variant="ghost" onClick={() => go('needsAttention')}>{p.action}</Button>}
              </div>
            ))}
          </div>
        </BoundedPanel>
      </div>

      {/* Only `Open` — this screen's batch list can never show anything else. */}
      <StatusGuide label="Status guide" groups={[{ title: 'Batch', entries: [
        { status: 'Open', meaning: 'Accepting components. Exactly one Open batch per production group.' },
      ] }]} />
    </div>
  );
}

Object.assign(window, { Dashboard, SystemStatusTile, NeedsAttentionTile });
