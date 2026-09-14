const { DataTable, StatusBadge, Button, Icon, Input, Card, Badge, EmptyState, ConfirmModal, SegmentedFilter, IconButton, Select } = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* Event Prints exists for on-site convention printing: pick any product the
   catalog can produce — no Shopify order required — set quantities, and run
   the same PPTX engine used for real batches. */
const PRODUCT_TYPES = ['Lighter', 'Tin', 'Wallet', 'Ashtray', 'Box', 'Grinder/Jar/Tray'];
/* Slots per printed page, per production group (Decision #48 for Lighter). */
const PER_PAGE = { Lighter: 10, Tin: 8, Wallet: 4, Ashtray: 6, Box: 3, 'Grinder/Jar/Tray': 3 };

const DESIGNS = [
  { design: 'DESNAM', name: 'Naruto — Sage', type: 'Lighter' },
  { design: 'DESGOK', name: 'Goku — Ultra', type: 'Lighter' },
  { design: 'DESLUF', name: 'Luffy — Gear 5', type: 'Lighter' },
  { design: 'DESZOR', name: 'Zoro — Three Sword', type: 'Lighter' },
  { design: 'DESNEZ', name: 'Nezuko — Bamboo', type: 'Lighter' },
  { design: 'DESGOJ', name: 'Gojo — Infinity', type: 'Tin' },
  { design: 'DESITA', name: 'Itachi — Crow', type: 'Tin' },
  { design: 'DESDEK', name: 'Deku — One For All', type: 'Tin' },
  { design: 'DESTAN', name: 'Tanjiro — Water', type: 'Wallet' },
  { design: 'DESSAS', name: 'Sasuke — Susanoo', type: 'Wallet' },
  { design: 'DESACE', name: 'Ace — Flame Fist', type: 'Ashtray' },
  { design: 'DESKAT', name: 'Kakashi — Sharingan', type: 'Ashtray' },
  { design: 'DESSAN', name: 'Sanji — Diable Jambe', type: 'Box' },
  { design: 'DESERE', name: 'Eren — Titan', type: 'Box' },
  { design: 'DESLEV', name: 'Levi — Ackerman', type: 'Grinder/Jar/Tray' },
  { design: 'DESTOD', name: 'Todoroki — Half-Cold', type: 'Grinder/Jar/Tray' },
];

const EVENT_JOBS = [
  { id: 1, name: 'Anime Expo 2026', date: '2026-07-04', location: 'Los Angeles, CA' },
  { id: 2, name: 'Comic-Con Booth 412', date: '2026-09-19', location: 'San Diego, CA' },
];

const EVENT_RUNS = [
  { id: 1, at: '2026-07-02 18:20', job: 'Anime Expo 2026', group: 'Lighter', pages: 4, items: 40, file: 'EVENT-LIGHTER-20260702-001.pptx' },
  { id: 2, at: '2026-07-02 18:20', job: 'Anime Expo 2026', group: 'Ashtray', pages: 2, items: 12, file: 'EVENT-ASHTRAY-20260702-001.pptx' },
  { id: 3, at: '2026-06-28 09:04', job: 'Anime Expo 2026', group: 'Tin', pages: 1, items: 16, file: 'EVENT-TIN-20260628-001.pptx' },
];

function Metric({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Mono style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-hi)', lineHeight: 1 }}>{value}</Mono>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-low)' }}>{label}</span>
    </div>
  );
}

function DesignRow({ d, qty, onQty, expanded, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 4px' }}>
        <Mono style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 700, width: 86, flex: 'none' }}>{d.design}</Mono>
        <span style={{ color: 'var(--text-mid)', flex: 1, fontSize: 12, minWidth: 0 }}>{d.name}</span>
        <IconButton icon="image" size="sm" variant={expanded ? 'solid' : 'ghost'} active={expanded} label="Adjust image" onClick={onToggle} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconButton icon="minus" size="sm" label="Decrease" onClick={() => onQty(qty - 1)} />
          <Mono style={{ width: 26, textAlign: 'center', fontSize: 13, color: qty > 0 ? 'var(--text-hi)' : 'var(--text-faint)' }}>{qty}</Mono>
          <IconButton icon="plus" size="sm" label="Increase" onClick={() => onQty(qty + 1)} />
        </div>
      </div>
      {expanded && (
        <div style={{ background: 'var(--surface-panel)', borderRadius: 'var(--radius-sm)', margin: '0 4px 14px', padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
            <Input label="Brightness" mono defaultValue="-15" />
            <Input label="Contrast" mono defaultValue="25" />
            <Input label="Saturation" mono defaultValue="200" />
            <Input label="Sharpness" mono placeholder="0" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button size="sm" variant="ghost">Reset</Button>
            <Button size="sm" variant="secondary">Save Adjustment</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupPreview({ g }) {
  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)', padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
        <span style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{g.type}</span>
        <Mono style={{ color: 'var(--text-low)', fontSize: 11 }}>{g.units} units · {g.pages} page{g.pages === 1 ? '' : 's'}</Mono>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {g.items.map((d) => <Badge key={d.design}>{d.design} ×{d.qty}</Badge>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {Array.from({ length: g.pages }).map((_, i) => {
          const last = i === g.pages - 1 && g.lastFill !== 0;
          const fill = last ? g.lastFill : g.perPage;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Muted style={{ fontSize: 11 }}>Page {i + 1} · {fill}/{g.perPage}</Muted>
              <Badge tone={last ? 'warning' : 'success'}>{last ? 'Partial' : 'Full'}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventPrints() {
  const [job, setJob] = React.useState(EVENT_JOBS[0]);
  const [type, setType] = React.useState('Lighter');
  const [search, setSearch] = React.useState('');
  const [qty, setQty] = React.useState({ DESNAM: 10, DESGOK: 10, DESACE: 6 });
  const [expanded, setExpanded] = React.useState(null);
  const [dirty, setDirty] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);

  const setQuantity = (design, n) => { setQty((s) => ({ ...s, [design]: Math.max(0, n) })); setDirty(true); };

  const q = (design) => Number.isFinite(Number(qty[design])) ? qty[design] : 0;

  const typeOptions = PRODUCT_TYPES.map((t) => {
    const units = DESIGNS.filter((d) => d.type === t).reduce((a, d) => a + q(d.design), 0);
    return { value: t, label: t, count: units > 0 ? units : undefined };
  });

  const visibleDesigns = DESIGNS.filter((d) => d.type === type
    && (!search || d.design.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase())));

  const selectedByType = PRODUCT_TYPES.map((t) => {
    const items = DESIGNS.filter((d) => d.type === t && q(d.design) > 0).map((d) => ({ ...d, qty: q(d.design) }));
    const units = items.reduce((a, d) => a + d.qty, 0);
    const perPage = PER_PAGE[t] || 3;
    const pages = Math.ceil(units / perPage) || 0;
    const lastFill = units % perPage;
    return { type: t, items, units, pages, lastFill, perPage };
  }).filter((g) => g.units > 0);

  const totalUnits = selectedByType.reduce((a, g) => a + g.units, 0);
  const totalGroups = selectedByType.length;
  const totalPages = selectedByType.reduce((a, g) => a + g.pages, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeading
        eyebrow="Events" title="Event Prints"
        right={<Button variant="outline" size="sm" iconLeft={<Icon name="x" size={13} />} onClick={() => { setQty({}); setDirty(true); }}>Clear All Items</Button>}
      />

      <Card bodyStyle={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end', padding: 18 }}>
        <div style={{ flex: '0 1 280px', minWidth: 220 }}>
          <Select
            label="Saved job" fullWidth
            value={String(job.id)}
            onChange={(e) => setJob(EVENT_JOBS.find((j) => String(j.id) === e.target.value))}
            options={EVENT_JOBS.map((j) => ({ value: String(j.id), label: `${j.name} — ${j.location}` }))}
          />
        </div>
        <Input label="Event name" defaultValue={job.name} style={{ flex: '1 1 180px' }} />
        <Input label="Event date" type="date" defaultValue={job.date} style={{ flex: '0 1 160px' }} />
        <Input label="Location" defaultValue={job.location} style={{ flex: '1 1 180px' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary">Save Job</Button>
          <Button variant="outline">Delete Job</Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        <Card eyebrow="Browse by product type" title="Select Products" bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SegmentedFilter options={typeOptions} value={type} onChange={(t) => { setType(t); setExpanded(null); }} />
          <Input iconLeft="search" placeholder="Search designs…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 460, overflowY: 'auto' }}>
            {visibleDesigns.length === 0
              ? <EmptyState icon="search" title="NO DESIGNS MATCH" compact>Try a different search or product type.</EmptyState>
              : visibleDesigns.map((d) => (
                <DesignRow
                  key={d.design} d={d} qty={q(d.design)}
                  onQty={(n) => setQuantity(d.design, n)}
                  expanded={expanded === d.design}
                  onToggle={() => setExpanded(expanded === d.design ? null : d.design)}
                />
              ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card accent eyebrow="One PPTX per production group" title="Generate" bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 28 }}>
              <Metric label="Units" value={totalUnits} />
              <Metric label="Groups" value={totalGroups} />
              <Metric label="Pages" value={totalPages} />
            </div>
            <Button variant="primary" fullWidth disabled={totalUnits === 0} iconLeft={<Icon name="file-output" size={15} />} onClick={() => setConfirm(true)}>Generate Print Sheet</Button>
            {dirty && totalUnits > 0 && (
              <div style={{ alignItems: 'center', color: 'var(--tone-info)', display: 'flex', fontSize: 11, gap: 7 }}>
                <Icon name="circle" size={13} />
                Unsaved changes — save the job before generating.
              </div>
            )}
          </Card>

          <Card eyebrow="Display only" title="Current Selection" bodyStyle={{ padding: 0 }}>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {selectedByType.length === 0
                ? <div style={{ padding: 24 }}><EmptyState icon="file-output" title="NOTHING SELECTED" compact>Set a quantity on at least one design to preview its page layout.</EmptyState></div>
                : selectedByType.map((g) => <GroupPreview key={g.type} g={g} />)}
            </div>
          </Card>

          <details style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', color: 'var(--text-mid)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="chevron-right" size={14} />Run History</span>
              <Mono style={{ fontSize: 11, color: 'var(--text-faint)' }}>{EVENT_RUNS.length}</Mono>
            </summary>
            <div style={{ borderTop: '1px solid var(--line)', padding: 14 }}>
              <DataTable
                rowKey="id" rows={EVENT_RUNS}
                columns={[
                  { key: 'at', header: 'Generated', mono: true, width: 150 },
                  { key: 'group', header: 'Group', width: 140 },
                  { key: 'pages', header: 'Pages', align: 'right', mono: true, width: 70 },
                  { key: 'items', header: 'Items', align: 'right', mono: true, width: 70 },
                  { key: 'file', header: 'File', render: (v) => <a href="#drive"><Mono style={{ fontSize: 11 }}>{v}</Mono></a> },
                ]}
                emptyLabel="No generations yet"
              />
            </div>
          </details>
        </div>
      </div>

      <ConfirmModal
        open={confirm} title={`Generate ${totalGroups} print sheet${totalGroups === 1 ? '' : 's'} for ${totalUnits} items?`}
        confirmLabel="Generate Print Sheet" onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)}
      >
        One file is produced per production group in the selection, saved to Drive and recorded in run history. No order and no batch are created.
      </ConfirmModal>
    </div>
  );
}

Object.assign(window, { EventPrints });
