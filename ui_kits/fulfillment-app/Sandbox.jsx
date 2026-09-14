const { DataTable, StatusBadge, Button, Icon, Card, Badge, EmptyState, ConfirmModal, ErrorAlert } = window.SpicedAnimeSpicyDesignSystem_daab0d;

/* The 14 fixed sandbox SKUs. Testing anything outside this set needs a separate
   pass to add it as a new fixed item, with artwork supplied by the owner — it
   cannot be entered freely at checkout (Decision #58). */
const SANDBOX_SKUS = [
  'LIT-DESNAM-SIL-TOR-LITTIN', 'LIT-DESNAM-WHT-BIC-SOLO', 'LIT-DESGOK-GLD-TOR-TINONLY',
  'ASH-DESNAM-CLR-SOLO', 'ASH-DESGOK-CLR-ASHGRD', 'TIN-DESNEZ-SIL-SOLO',
  'BOX-DESZOR-BOXLIT', 'BOX-DESZOR-BOX4', 'BOX-DESSAN-BOXJAR',
  'WAL-DESGOJ-BRN-SOLO', 'WAL-DESZOR-BLK-SOLO',
  'GRS-DESGOJ-BLK-GRSFULL', 'GRS-DESNEZ-SIL-GRSJAR', 'GRD-DESNEZ-BLK-SOLO',
];

const SANDBOX_ORDERS = [
  { id: 1, order_number: 'TEST-004', sku: 'LIT-DESNAM-SIL-TOR-LITTIN', components: 'LITF, LITB, TIN' },
  { id: 2, order_number: 'TEST-003', sku: 'ASH-DESGOK-CLR-ASHGRD', components: 'ASH, GRD' },
  { id: 3, order_number: 'TEST-002', sku: 'BOX-DESZOR-BOXLIT', components: 'BOX, LITF, LITB' },
  { id: 4, order_number: 'TEST-001', sku: 'WAL-DESGOJ-BRN-SOLO', components: 'WALF, WALB' },
];

const SANDBOX_BATCHES = [
  { id: 1, group: 'Lighter', seq: '#S3', components: 6, created: 'Sep 2, 2026' },
  { id: 2, group: 'Ashtray', seq: '#S2', components: 2, created: 'Sep 2, 2026' },
  { id: 3, group: 'Box', seq: '#S2', components: 3, created: 'Sep 1, 2026' },
  { id: 4, group: 'Wallet', seq: '#S1', components: 2, created: 'Sep 1, 2026' },
];

function Sandbox() {
  /* Up to 7 order groups per checkout submission; quantity capped at 10 per
     item (Decision #58). */
  const [groups, setGroups] = React.useState([{ id: 1, qty: {} }]);
  const [confirm, setConfirm] = React.useState(null);
  const [notice, setNotice] = React.useState(null);

  const setQty = (gid, sku, n) => setGroups((gs) => gs.map((g) => g.id === gid
    ? { ...g, qty: { ...g.qty, [sku]: Math.min(10, Math.max(0, n)) } }
    : g));

  const addGroup = () => setGroups((gs) => gs.length >= 7 ? gs : [...gs, { id: Math.max(...gs.map((g) => g.id)) + 1, qty: {} }]);
  const removeGroup = (gid) => setGroups((gs) => gs.length === 1 ? gs : gs.filter((g) => g.id !== gid));

  const groupTotal = (g) => Object.values(g.qty).reduce((a, b) => a + b, 0);
  const totalItems = groups.reduce((sum, g) => sum + groupTotal(g), 0);
  const ordersToCreate = groups.filter((g) => groupTotal(g) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeading
        eyebrow="Testing" title="Sandbox"
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" iconLeft={<Icon name="refresh-cw" size={14} />} onClick={() => setConfirm('reset')}>Reset sandbox data</Button>
            <Button variant="primary" disabled={ordersToCreate === 0} iconLeft={<Icon name="shopping-cart" size={15} />} onClick={() => setConfirm('checkout')}>
              Checkout {ordersToCreate > 0 ? `(${ordersToCreate})` : ''}
            </Button>
          </div>
        }
      />

      {notice && <ErrorAlert tone="success" title={notice} onDismiss={() => setNotice(null)}>Sandbox rows are invisible on the Dashboard, Orders, Current Batches, and packing-sheet selection.</ErrorAlert>}

      <ErrorAlert tone="info" title="Isolated from real data">
        Sandbox orders are <Mono>TEST-</Mono> prefixed and never reach Shopify. Their batches are exempt from the lock-on-generate rule, so the same batch can be regenerated without limit.
      </ErrorAlert>

      <ScreenSection eyebrow="Checkout" title="COMPOSE SANDBOX ORDERS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {groups.map((g, i) => (
            <Card key={g.id} eyebrow={`Order group ${i + 1} of ${groups.length}`} title={`${groupTotal(g)} ITEMS`}>
              <div style={{ display: 'grid', gap: '8px 18px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {SANDBOX_SKUS.map((sku) => (
                  <div key={sku} style={{ alignItems: 'center', borderBottom: '1px solid var(--line-soft)', display: 'flex', gap: 12, padding: '7px 0' }}>
                    <Mono style={{ color: (g.qty[sku] || 0) > 0 ? 'var(--text-hi)' : 'var(--text-mid)', flex: 1, fontSize: 11, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{sku}</Mono>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => setQty(g.id, sku, (g.qty[sku] || 0) - 1)}>−</Button>
                      <Mono style={{ color: (g.qty[sku] || 0) > 0 ? 'var(--text-hi)' : 'var(--text-faint)', fontSize: 12, textAlign: 'center', width: 26 }}>{g.qty[sku] || 0}</Mono>
                      <Button size="sm" variant="ghost" disabled={(g.qty[sku] || 0) >= 10} onClick={() => setQty(g.id, sku, (g.qty[sku] || 0) + 1)}>+</Button>
                    </div>
                  </div>
                ))}
              </div>
              {groups.length > 1 && (
                <div style={{ display: 'flex', marginTop: 14 }}>
                  <Button size="sm" variant="ghost" onClick={() => removeGroup(g.id)}>Remove this order group</Button>
                </div>
              )}
            </Card>
          ))}
          <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
            <Button variant="outline" size="sm" disabled={groups.length >= 7} iconLeft={<Icon name="plus" size={13} />} onClick={addGroup}>
              Add order group
            </Button>
            <Muted style={{ fontSize: 11 }}>{groups.length} of 7 order groups · {totalItems} items · max 10 per item</Muted>
          </div>
        </div>
      </ScreenSection>

      <ScreenSection eyebrow="Sandbox" title="TEST ORDERS">
        <DataTable
          rowKey="id" rows={SANDBOX_ORDERS}
          columns={[
            { key: 'order_number', header: 'Order', mono: true, width: 130 },
            { key: 'sku', header: 'SKU', mono: true },
            { key: 'components', header: 'Components generated', mono: true, width: 230 },
          ]}
          emptyLabel="No sandbox orders — check some out above"
        />
      </ScreenSection>

      <ScreenSection eyebrow="Sandbox" title="TEST BATCHES">
        <DataTable
          rowKey="id" rows={SANDBOX_BATCHES}
          columns={[
            { key: 'group', header: 'Group', width: 190, render: (v) => <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{v}</span> },
            { key: 'seq', header: 'Batch', mono: true, width: 90 },
            { key: 'state', header: 'State', width: 120, render: () => <StatusBadge status="Open" size="sm" /> },
            { key: 'components', header: 'Components', align: 'right', mono: true, width: 120 },
            { key: 'created', header: 'Created', width: 140, render: (v) => <Muted>{v}</Muted> },
            { key: 'action', header: '', align: 'right', width: 170, render: () => (
              <Button size="sm" variant="outline" iconLeft={<Icon name="file-output" size={13} />}>Generate PPTX</Button>
            ) },
          ]}
          emptyLabel="No sandbox batches"
        />
      </ScreenSection>

      {/* Sandbox batches never leave `Open`, so the guide lists only that (#107). */}
      <StatusGuide label="Status guide" groups={[{ title: 'Batch', entries: [
        { status: 'Open', meaning: 'Sandbox batches never leave Open — generating a PPTX does not lock them or spawn a new batch.' },
      ] }]} />

      <ConfirmModal
        open={confirm === 'checkout'} title={`Create ${ordersToCreate} sandbox order${ordersToCreate === 1 ? '' : 's'}?`}
        confirmLabel="Checkout"
        onConfirm={() => { setNotice(`${ordersToCreate} sandbox orders created`); setGroups([{ id: 1, qty: {} }]); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      >
        Each order group becomes one TEST- prefixed order with a sequential number, flowing through normal component generation and batch assignment.
      </ConfirmModal>
      <ConfirmModal
        open={confirm === 'reset'} tone="danger" title="Reset all sandbox data?"
        confirmLabel="Reset sandbox data"
        onConfirm={() => { setNotice('Sandbox data cleared'); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      >
        Fully clears every sandbox order, component, batch and batch item. Nothing is recreated — check out whatever you need next. Real data is untouched.
      </ConfirmModal>
    </div>
  );
}

Object.assign(window, { Sandbox });
