const { DataTable, StatusBadge, AgingFlag, Button, Icon, Select, Input, Checkbox, Badge, SegmentedSku } = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Multi-select status pills: the list narrows to the UNION of active pills
   (Decision #105). Deliberately lighter than the table so the table stays
   the visually primary object. */
function StatusPills({ options, active, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const on = active.includes(o);
        return (
          <button
            key={o} type="button" onClick={() => onToggle(o)}
            style={{
              cursor: 'pointer', height: 26, padding: '0 10px', borderRadius: 'var(--radius-sm)',
              background: on ? 'var(--spice-tint)' : 'transparent',
              border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
              color: on ? 'var(--spice-300)' : 'var(--text-low)',
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
            }}
          >{o}</button>
        );
      })}
    </div>
  );
}

function Orders({ go }) {
  const [q, setQ] = React.useState('');
  const [statuses, setStatuses] = React.useState([]);
  const [dateRange, setDateRange] = React.useState('Last 7 Days');
  const [sortDir, setSortDir] = React.useState(null); // null → asc → desc → null
  const [selected, setSelected] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);
  const [perPage, setPerPage] = React.useState(50);

  const toggleStatus = (s) => setStatuses((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const cycleSort = () => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null));

  let rows = ORDER_ROWS.filter((r) => {
    if (q && !r.order_number.includes(q)) return false;
    if (statuses.length && !statuses.includes(r.status)) return false;
    return true;
  });
  if (sortDir) {
    rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.id - b.id : b.id - a.id);
  }

  const selectableIds = rows.filter((r) => r.reprintable).map((r) => r.id);
  const toggleExpand = (id) => setExpanded((p) => p.includes(id) ? p.filter((k) => k !== id) : [...p, id]);

  const columns = [
    /* `Order #` is the strongest identifier and the row's only detail link —
       surrounding row whitespace does not navigate (Decisions #105, #108). */
    {
      key: 'order_number', width: 110,
      header: <SortHeader label="Order #" active={!!sortDir} dir={sortDir} onClick={cycleSort} />,
      render: (v, row) => <a href={`#orders/${row.id}`} onClick={(e) => { e.preventDefault(); go && go('orderDetail'); }}><Mono style={{ fontSize: 13, fontWeight: 700 }}>{v}</Mono></a>,
    },
    { key: 'created_at', header: 'Order Date', width: 165, render: (v, row) => (
      <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
        <Muted>{v}</Muted><AgingFlag sinceIso={row.iso} />
      </span>
    ) },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} size="sm" /> },
    { key: 'item_count', header: 'Items', align: 'right', mono: true, width: 70 },
    /* `Attention` replaces the permanent Blocked column: quiet when there is
       nothing to resolve, concise (`Blocked 2`) when there is (Decision #105). */
    { key: 'blocked', header: 'Attention', width: 140, render: (v) => v > 0
      ? <StatusBadge status="Blocked" label={`Blocked ${v}`} size="sm" />
      : <Muted>—</Muted> },
    { key: 'reprint', header: 'Reprint', width: 140, align: 'right', render: (_v, row) => row.reprintable
      ? (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }} iconRight={<Icon name="chevron-down" size={13} style={{ transform: expanded.includes(row.id) ? 'rotate(180deg)' : 'none' }} />}>
          Select items
        </Button>
      )
      : null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PageHeading
        eyebrow="Operations" title="Orders"
        right={<Button variant="primary" disabled={selected.length === 0} iconLeft={<Icon name="rotate-ccw" size={14} />}>Bulk flag reprint {selected.length > 0 ? `(${selected.length})` : ''}</Button>}
      />

      {/* Tighter, lighter filter area so the table remains primary (#105). */}
      <div style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 12, padding: '13px 16px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order number…" iconLeft={<Icon name="search" size={14} />} style={{ minWidth: 240 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['Today', 'Yesterday', 'Last 7 Days'].map((d) => (
              <button
                key={d} type="button" onClick={() => setDateRange(d)}
                style={{
                  cursor: 'pointer', height: 30, padding: '0 11px', borderRadius: 'var(--radius-sm)',
                  background: dateRange === d ? 'var(--surface-control)' : 'transparent',
                  border: `1px solid ${dateRange === d ? 'var(--line-strong)' : 'var(--line)'}`,
                  color: dateRange === d ? 'var(--text-hi)' : 'var(--text-mid)',
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                }}
              >{d}</button>
            ))}
          </div>
          <Select options={['Custom range…', 'All time']} defaultValue="Custom range…" />
          <span style={{ flex: 1 }} />
          <Button variant="outline" size="sm" iconLeft={<Icon name="download" size={13} />}>Export CSV</Button>
        </div>
        <StatusPills options={ORDER_STATUS_FILTERS} active={statuses} onToggle={toggleStatus} />
      </div>

      <DataTable
        columns={columns} rows={rows} rowKey="id"
        selectable selected={selected} onSelect={setSelected}
        selectableRowKeys={selectableIds}
        emptyLabel="No orders match this filter"
        expandedRowKeys={expanded}
        renderExpandedRow={(row) => (
          <div style={{ background: 'var(--ink-850)', padding: '16px 20px' }}>
            <div style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              Printed items eligible for reprint · order {row.order_number}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Front/back pairs are shown and selected together (#71, #105). */}
              <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
                <Checkbox checked label={<Mono style={{ fontSize: 12 }}>LITF + LITB</Mono>} />
                <span style={{ borderLeft: '2px solid var(--group-pair-line)', color: 'var(--group-pair)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', paddingLeft: 6 }}>PAIR</span>
                <SegmentedSku sku="LIT-DESNAM-SIL-TOR-LITTIN" familyCode="LIT" designCode="DESNAM" options={{ color: 'SIL', flame: 'TOR' }} configCode="LITTIN" size="sm" />
              </div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
                <Checkbox label={<Mono style={{ fontSize: 12 }}>ASH</Mono>} />
                <SegmentedSku sku="ASH-DESGOK-CLR-SOLO" familyCode="ASH" designCode="DESGOK" options={{ color: 'CLR' }} configCode="SOLO" size="sm" />
              </div>
            </div>
            <p style={{ color: 'var(--text-low)', fontSize: 11, margin: '14px 0 0' }}>
              Flagging creates a replacement component in the current open batch and moves this order to In Production (Needs Reprint).
            </p>
          </div>
        )}
      />

      <PerPage value={perPage} onChange={setPerPage} total={rows.length} />

      <StatusGuide label="Status guide" groups={[
        { title: 'Order', entries: [
          { status: 'Queued for Production', meaning: 'Imported and decoded. Components are accumulating in open batches.' },
          { status: 'In Production', meaning: 'Every required component for this order has been printed.' },
          { status: 'In Production (Needs Reprint)', meaning: 'A printed component was flagged for reprint. Returns to In Production once every flagged component is printed again.' },
          { status: 'Fulfilled Externally', meaning: 'Fulfilled in Shopify outside this app. Terminal.' },
          { status: 'Canceled', meaning: 'Cancelled or refunded in Shopify. Unprinted components pulled from their batch. Terminal.' },
        ] },
        { title: 'Component', entries: [
          { status: 'Blocked', meaning: 'The component status represented by the Attention column.' },
        ] },
      ]} />
    </div>
  );
}

Object.assign(window, { Orders, StatusPills });
