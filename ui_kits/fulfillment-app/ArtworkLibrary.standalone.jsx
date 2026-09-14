const { StatusBadge, Button, Icon, Input, Select, Badge, EmptyState, LoadingState, DataTable } = window.SpicedAnimeSpicyDesignSystem_daab0d;

function ArtworkLibrary() {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  /* Server-side sorting across the complete matching result set, not just the
     current page. Design: A–Z then Z–A. Updated: newest then oldest (#100). */
  const [sort, setSort] = React.useState({ key: 'updated', dir: 'desc' });
  const [perPage, setPerPage] = React.useState(50);
  const [revalidating, setRevalidating] = React.useState(false);

  const toggleSort = (key) => setSort((s) => s.key === key
    ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    : { key, dir: key === 'design' ? 'asc' : 'desc' });

  let rows = ARTWORK.filter((a) => {
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
    available: ARTWORK.filter((a) => a.status === 'Available').length,
    missing: ARTWORK.filter((a) => a.status === 'Missing').length,
    retired: ARTWORK.filter((a) => a.status === 'Retired').length,
  };

  const columns = [
    /* Thumb column: the real image is fetched for Available assets; any other
       status (or a failed fetch) falls back to the component-code label. */
    { key: 'thumb', header: 'Thumb', width: 74, render: (_v, row) => (
      <div style={{ alignItems: 'center', background: 'var(--surface-raised)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', display: 'flex', height: 46, justifyContent: 'center', width: 46 }}>
        {row.status === 'Available'
          ? <span style={{ color: 'var(--text-faint)', display: 'flex' }}><Icon name="image" size={18} /></span>
          : <Mono style={{ color: 'var(--text-faint)', fontSize: 9 }}>{row.component}</Mono>}
      </div>
    ) },
    {
      key: 'design', width: 120,
      header: <SortHeader label="Design" active={sort.key === 'design'} dir={sort.dir} onClick={() => toggleSort('design')} />,
      render: (v) => <Mono style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 700 }}>{v}</Mono>,
    },
    { key: 'name', header: 'Name' },
    { key: 'component', header: 'Component', mono: true, width: 110 },
    { key: 'path', header: 'File path', render: (_v, row) => <Mono style={{ color: 'var(--text-low)', fontSize: 11 }}>artwork/{row.family}/{row.design}.png</Mono> },
    { key: 'status', header: 'Status', width: 140, render: (v) => <StatusBadge status={v} size="sm" /> },
    {
      key: 'updated', width: 140,
      header: <SortHeader label="Updated" active={sort.key === 'updated'} dir={sort.dir} onClick={() => toggleSort('updated')} />,
      render: (v) => <Muted>{v}</Muted>,
    },
    { key: 'actions', header: '', align: 'right', width: 210, render: () => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="outline">Replace</Button>
        <Button size="sm" variant="ghost">Retire</Button>
      </div>
    ) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PageHeading
        eyebrow="Assets" title="Artwork Library"
        right={<Button variant="primary" iconLeft={<Icon name="plus" size={15} />}>Upload artwork</Button>}
      />

      <div style={{ alignItems: 'center', background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, flexWrap: 'wrap', padding: '13px 16px' }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search design code or name…" iconLeft={<Icon name="search" size={14} />} style={{ minWidth: 250 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'All'], ['available', 'Available'], ['missing', 'Missing'], ['retired', 'Retired']].map(([k, label]) => {
            const on = k === filter;
            return (
              <button
                key={k} type="button" onClick={() => setFilter(k)}
                style={{
                  alignItems: 'center', cursor: 'pointer', display: 'inline-flex', gap: 7,
                  height: 30, padding: '0 11px', borderRadius: 'var(--radius-sm)',
                  background: on ? 'var(--spice-tint)' : 'transparent',
                  border: `1px solid ${on ? 'var(--line-spice)' : 'var(--line)'}`,
                  color: on ? 'var(--spice-300)' : 'var(--text-mid)',
                  fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                {label}
                <Mono style={{ fontSize: 10, opacity: 0.75 }}>{counts[k]}</Mono>
              </button>
            );
          })}
        </div>
        <span style={{ flex: 1 }} />
        <Button
          variant="outline" size="sm" disabled={revalidating}
          iconLeft={<Icon name="refresh-cw" size={13} spin={revalidating} />}
          onClick={() => { setRevalidating(true); setTimeout(() => setRevalidating(false), 1400); }}
        >
          {revalidating ? 'Revalidating…' : 'Revalidate artwork'}
        </Button>
      </div>

      {revalidating
        ? <LoadingState variant="skeleton" rows={4} label="Scanning Drive artwork subtree" logoSrc={window.__resources.spinnerLogo} />
        : rows.length === 0
          ? <EmptyState icon="image" title="NO ARTWORK MATCHES">Adjust the search or clear the filter to see the full library.</EmptyState>
          : <DataTable columns={columns} rows={rows} rowKey="id" emptyLabel="No artwork matches" />}

      <PerPage value={perPage} onChange={setPerPage} total={rows.length} />

      <StatusGuide label="Status guide" groups={[{ title: 'Artwork asset', entries: [
        { status: 'Available', meaning: 'Resolved in Drive and usable by the print pipeline.' },
        { status: 'Missing', meaning: 'No file found at the expected Drive path.' },
        { status: 'Retired', meaning: 'Withdrawn from use. The file remains in Drive but is no longer returned by lookups.' },
      ] }]} />
    </div>
  );
}

Object.assign(window, { ArtworkLibrary });
