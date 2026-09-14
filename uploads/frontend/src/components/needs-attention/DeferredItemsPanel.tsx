import { Button, DataTable, EmptyState } from "@/components/ds";
import type { DeferredComponent, QueuePagination } from "@/lib/types";

interface DeferredItemsPanelProps {
  components: DeferredComponent[];
  pagination: QueuePagination;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const columns = [
  { key: "order_number", header: "Order", mono: true },
  {
    key: "item",
    header: "Item / SKU",
    render: (_value: unknown, component: DeferredComponent) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ color: "var(--text-hi)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{component.sku || "No SKU"}</span>
        {component.product_name && <span style={{ color: "var(--text-low)", fontSize: 12 }}>{component.product_name}</span>}
      </div>
    ),
  },
  { key: "reason", header: "Reason", render: () => "Product family held for Deferred MVP." },
];

export function DeferredItemsPanel({ components, pagination, loading, onPageChange }: DeferredItemsPanelProps) {
  if (components.length === 0) {
    return (
      <EmptyState icon="pause" title="NO DEFERRED ITEMS" compact>
        No deferred items. GRD-family items held for Deferred MVP will appear here.
      </EmptyState>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <DataTable columns={columns} rows={components} rowKey="id" emptyLabel="No deferred items" />
      <div aria-label="Deferred items pagination" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
        <span aria-live="polite">Page {pagination.page} of {pagination.total_pages || 1} ({pagination.count} total)</span>
        <Button size="sm" variant="outline" disabled={loading || !pagination.previous} onClick={() => pagination.previous && onPageChange(pagination.previous)}>Previous deferred</Button>
        <Button size="sm" variant="outline" disabled={loading || !pagination.next} onClick={() => pagination.next && onPageChange(pagination.next)}>Next deferred</Button>
      </div>
    </div>
  );
}
