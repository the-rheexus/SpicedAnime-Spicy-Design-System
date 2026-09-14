const { DataTable, StatusBadge, AgingFlag, Button, Icon, Checkbox, ConfirmModal, BatchCard, SegmentedSku, Badge, ErrorAlert, Select } = window.SpicedAnimeSpicyDesignSystem_daab0d;

const COLORS = ['All Colors', 'White/Gold', 'Silver'];

function BatchDetail({ go }) {
  const [selected, setSelected] = React.useState([]);
  const [sortDir, setSortDir] = React.useState(null);
  const [color, setColor] = React.useState('All Colors');
  const [confirm, setConfirm] = React.useState(null);
  const [state, setState] = React.useState('Open');

  /* Selecting one half of a front/back pair auto-includes its sibling
     (LITF/LITB, WALF/WALB — Decision #42 / Section 2.5). */
  const withPairs = (keys) => {
    const out = new Set(keys);
    keys.forEach((k) => {
      const row = BATCH_COMPONENTS.find((c) => c.id === k);
      if (!row || !row.pair) return;
      BATCH_COMPONENTS
        .filter((c) => c.design_code === row.design_code && c.order_number === row.order_number && c.config_code === row.config_code)
        .forEach((c) => out.add(c.id));
    });
    return [...out];
  };

  const eligible = BATCH_COMPONENTS.filter((c) => c.status === 'Ready').map((c) => c.id);

  /* Color filtering is display-only: it never changes selection state or the
     generated component set (Decision #57 / Section 2.5). */
  let rows = color === 'All Colors' ? BATCH_COMPONENTS : BATCH_COMPONENTS.filter((c) => c.color === color);
  if (sortDir) rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.order_number.localeCompare(b.order_number) : b.order_number.localeCompare(a.order_number));

  const selectedEligible = selected.filter((k) => eligible.includes(k));
  /* A proper subset drives the contextual label; selecting everything eligible
     canonicalizes back to the all-items branch (Decision #101). */
  const isProperSubset = selectedEligible.length > 0 && selectedEligible.length < eligible.length;

  const hasColorVariants = BATCH_COMPONENTS.some((c) => ['LITF', 'LITB', 'TIN'].includes(c.component_code));
  const ready = BATCH_COMPONENTS.filter((c) => c.status === 'Ready').length;
  const blocked = BATCH_COMPONENTS.filter((c) => c.status === 'Blocked').length;

  const columns = [
    { key: 'design_code', header: 'Design', mono: true, width: 110 },
    { key: 'component_code', header: 'Component', width: 140, render: (v, row) => (
      <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
        <Mono>{v}</Mono>
        {row.pair && <span style={{ borderLeft: '2px solid var(--group-pair-line)', color: 'var(--group-pair)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', paddingLeft: 6 }}>PAIR</span>}
      </span>
    ) },
    {
      key: 'order_number', width: 120,
      header: <SortHeader label="Order" active={!!sortDir} dir={sortDir} onClick={() => setSortDir((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null))} />,
      render: (v) => <a href={`#orders/${v.replace('#', '')}`} onClick={(e) => { e.preventDefault(); go('orderDetail'); }}><Mono>{v}</Mono></a>,
    },
    { key: 'order_date', header: 'Order Date', width: 130, render: (v) => <Muted>{v}</Muted> },
    ...(hasColorVariants ? [{ key: 'color', header: 'Color', width: 120, render: (v) => (
      <span style={{ alignItems: 'center', display: 'inline-flex', gap: 7 }}>
        <span style={{ background: v === 'Silver' ? '#E8E8E8' : '#FBE3D6', border: '1px solid var(--line-strong)', borderRadius: 2, height: 11, width: 11 }} />
        <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>{v}</span>
      </span>
    ) }] : []),
    /* Component lists render `Canceled` as "Print Not Needed" (Decision #64). */
    { key: 'status', header: 'Status', width: 165, render: (v) => <StatusBadge status={v} context="component" size="sm" /> },
    { key: 'failure', header: 'Failure', width: 180, render: (v) => v ? <FailureText code={v} /> : <Muted>—</Muted> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <a href="#batches" onClick={(e) => { e.preventDefault(); go('batches'); }} style={{ alignItems: 'center', color: 'var(--text-mid)', display: 'inline-flex', fontSize: 11, fontWeight: 700, gap: 6, letterSpacing: '0.1em', marginBottom: 14, textTransform: 'uppercase' }}>
          <Icon name="chevron-right" size={13} style={{ transform: 'rotate(180deg)' }} />Current Batches
        </a>
        <PageHeading
          eyebrow="Batch" title="Lighter #8"
          right={
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" iconLeft={<Icon name="image" size={14} />} disabled={state !== 'Open'} onClick={() => setConfirm('preview')}>Download Preview PPTX</Button>
              <Button variant="secondary" iconLeft={<Icon name="printer" size={14} />} disabled={state !== 'Locked for Review'} onClick={() => setConfirm('print')}>Mark Printed</Button>
              {/* Contextual primary action (Decision #101). */}
              <Button variant="primary" iconLeft={<Icon name="file-output" size={15} />} disabled={state !== 'Open'} onClick={() => setConfirm('generate')}>
                {isProperSubset ? 'Generate PPTX (Selected Items)' : 'Generate PPTX (All Items)'}
              </Button>
            </div>
          }
        />
      </div>

      {blocked > 0 && (
        <ErrorAlert tone="warning" title={`${blocked} components blocked`} action={<Button variant="outline" size="sm" onClick={() => go('needsAttention')}>Review</Button>}>
          Blocked components are excluded from the generated PPTX. The rest of the batch is unaffected.
        </ErrorAlert>
      )}

      <div style={{ display: 'grid', gap: 'var(--card-gap)', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {[
          ['Production group', 'Lighter'], ['State', state], ['Components', String(BATCH_COMPONENTS.length)],
          ['Ready / Blocked', `${ready}/${blocked}`], ['Created', 'Aug 29, 2026'],
        ].map(([label, value]) => (
          <div key={label} style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
            <div style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ marginTop: 10 }}>
              {label === 'State'
                ? <StatusBadge status={value} size="sm" />
                : <Mono style={{ color: 'var(--text-hi)', fontSize: 19, fontWeight: 700 }}>{value}</Mono>}
            </div>
          </div>
        ))}
      </div>

      {/* Single-select colour pills, shown only for batches that contain
          colour-variant components (Decision #57). */}
      {hasColorVariants && (
        <div style={{ alignItems: 'center', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-low)', fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', marginRight: 4, textTransform: 'uppercase' }}>Color</span>
          {COLORS.map((c) => {
            const on = c === color;
            return (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                style={{
                  cursor: 'pointer', height: 28, padding: '0 11px', borderRadius: 'var(--radius-sm)',
                  background: on ? 'var(--spice-tint)' : 'transparent',
                  border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
                  color: on ? 'var(--spice-300)' : 'var(--text-mid)',
                  fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >{c}</button>
            );
          })}
        </div>
      )}

      <ScreenSection eyebrow="Contents" title="COMPONENTS">
        <DataTable
          columns={columns} rows={rows} rowKey="id"
          selectable selected={selected} onSelect={(keys) => setSelected(withPairs(keys))}
          selectableRowKeys={eligible}
          virtualize scrollHeight={420}
          emptyLabel="No components match this color filter"
        />
      </ScreenSection>

      <div style={{ alignItems: 'center', background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 14, padding: '14px 18px' }}>
        <Mono style={{ color: 'var(--text-hi)', fontSize: 12 }}>{selectedEligible.length} of {eligible.length} items selected</Mono>
        {color !== 'All Colors' && <Muted style={{ fontSize: 11 }}>Color filter is display-only — selection and the generated set are unaffected.</Muted>}
        <span style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
        <Button variant="outline" size="sm" onClick={() => setSelected(eligible)}>Select all eligible</Button>
      </div>

      <StatusGuide label="Status guide" groups={[
        { title: 'Component', entries: [
          { status: 'Queued', meaning: 'Decoded, waiting on artwork resolution.' },
          { status: 'Ready', meaning: 'Artwork resolved. Eligible for this print run.' },
          { status: 'Printed', meaning: 'Included in a printed batch. Terminal.' },
          { status: 'Blocked', meaning: 'Artwork or metafield could not be resolved. Excluded from generation.' },
          { status: 'Canceled', meaning: 'Pulled from the batch because the order was cancelled or refunded. Shown in the component list as "Print Not Needed".' },
        ] },
      ]} />

      <ConfirmModal
        open={confirm === 'generate'}
        title={isProperSubset ? `Generate PPTX for ${selectedEligible.length} selected components?` : `Generate PPTX for all ${eligible.length} ready components?`}
        confirmLabel={isProperSubset ? 'Generate PPTX (Selected Items)' : 'Generate PPTX (All Items)'}
        onConfirm={() => { setState('Locked for Review'); setConfirm(null); }} onCancel={() => setConfirm(null)}
      >
        {isProperSubset
          ? 'A new Locked for Review batch is created holding only the selected and pair-expanded components. This batch stays Open with the remainder.'
          : 'This batch locks for review and a fresh batch opens for Lighter. Blocked components are excluded.'}
      </ConfirmModal>
      <ConfirmModal
        open={confirm === 'preview'} title="Download preview PPTX?"
        confirmLabel="Download Preview" onConfirm={() => setConfirm(null)} onCancel={() => setConfirm(null)}
      >
        Builds a full production-quality file from the batch's current contents and returns a Drive link. No lock, no new batch, no component status change. Repeatable.
      </ConfirmModal>
      <ConfirmModal
        open={confirm === 'print'} title="Mark batch printed?"
        confirmLabel="Mark Printed" onConfirm={() => { setState('Printed'); setConfirm(null); }} onCancel={() => setConfirm(null)}
      >
        Components move to Printed. Orders whose required components are all printed advance to In Production.
      </ConfirmModal>
    </div>
  );
}

const LIFECYCLE_FILTERS = ['Active Queue', 'Open', 'Locked for Review', 'Printed', 'Archived', 'All'];

function Batches({ go }) {
  const [filter, setFilter] = React.useState('Active Queue');
  const [group, setGroup] = React.useState('All Production Groups');

  const all = [...BATCH_ROWS, ...BATCH_HISTORY];
  let rows = all;
  if (filter === 'Active Queue') rows = all.filter((b) => b.state === 'Open' || b.state === 'Locked for Review');
  else if (filter !== 'All') rows = all.filter((b) => b.state === filter);
  if (group !== 'All Production Groups') rows = rows.filter((b) => b.group === group);

  /* Grouped by production group (Decision #96). */
  const groups = [...new Set(rows.map((b) => b.group))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeading eyebrow="Operations" title="Current Batches" />

      <div style={{ alignItems: 'center', background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, flexWrap: 'wrap', padding: '13px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {LIFECYCLE_FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f} type="button" onClick={() => setFilter(f)}
                style={{
                  cursor: 'pointer', height: 30, padding: '0 12px', borderRadius: 'var(--radius-sm)',
                  background: on ? 'var(--spice-tint)' : 'transparent',
                  border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
                  color: on ? 'var(--spice-300)' : 'var(--text-mid)',
                  fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >{f}</button>
            );
          })}
        </div>
        <span style={{ flex: 1 }} />
        <Select options={['All Production Groups', 'Ashtray', 'Lighter', 'Tin', 'Grinder/Jar/Tray', 'Box', 'Wallet']} value={group} onChange={(e) => setGroup(e.target.value)} />
      </div>

      {groups.length === 0 && <EmptyStateShim />}

      {/* The live app renders each production group as a TABLE, not cards.
         `BatchCard` stays in the design system as an approved alternative
         treatment (see the Components card) but is not what ships here. */}
      {groups.map((g) => (
        <ScreenSection key={g} eyebrow="Production group" title={g.toUpperCase()}>
          <DataTable
            rowKey="id" rows={rows.filter((b) => b.group === g)}
            onRowClick={() => go('batchDetail')}
            columns={[
              { key: 'seq', header: 'Batch', mono: true, width: 90,
                render: (v, row) => <a href={`#batches/${row.id}`}><Mono style={{ fontSize: 13, fontWeight: 700 }}>{v}</Mono></a> },
              /* `Locked for Review` reads "PPT Generated" on THIS screen only
                 (Decision #44) — Batch Detail, Dashboard and every Status
                 Guide keep the raw string. */
              { key: 'state', header: 'State', width: 165, render: (v) => <StatusBadge status={v} context="batches" size="sm" /> },
              { key: 'ready', header: 'Ready', width: 150, render: (_v, row) => row.total === 0
                ? <Muted style={{ fontFamily: 'var(--font-mono)' }}>Empty batch</Muted>
                : <span style={{ color: row.ready === row.total ? 'var(--tone-success)' : 'var(--tone-warning)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.ready}/{row.total} ready</span> },
              { key: 'blocked', header: 'Blocked', width: 130, render: (v) => v === 0 ? <Muted>0</Muted> : <StatusBadge status="Blocked" label={`Blocked ${v}`} size="sm" /> },
              { key: 'age', header: 'Oldest age', width: 120, render: (_v, row) => row.aging ? <AgingFlag sinceIso={row.iso} /> : <Muted>{row.age}d</Muted> },
              { key: 'started', header: 'Started', width: 130, render: (v) => <Muted>{v}</Muted> },
              { key: 'action', header: '', align: 'right', width: 130, render: () => (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); go('batchDetail'); }}>Open Batch</Button>
              ) },
            ]}
            emptyLabel="No batches in this group"
          />
        </ScreenSection>
      ))}

      <StatusGuide label="Status guide" groups={[{ title: 'Batch', entries: [
        { status: 'Open', meaning: 'Accepting components. Exactly one Open batch per production group.' },
        { status: 'Locked for Review', meaning: 'PPTX generated, awaiting print. Shown in the State column above as "PPT Generated".' },
        { status: 'Printed', meaning: 'Physically printed and marked done.' },
        { status: 'Archived', meaning: 'Closed out. Terminal.' },
      ] }]} />
    </div>
  );
}

function EmptyStateShim() {
  const { EmptyState } = window.SpicedAnimeSpicyDesignSystem_daab0d;
  return <EmptyState icon="layers" title="NO BATCHES IN THIS VIEW">Change the lifecycle filter or production group to see other batches.</EmptyState>;
}

Object.assign(window, { BatchDetail, Batches });
