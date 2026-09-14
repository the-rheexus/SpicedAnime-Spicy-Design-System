import { Button, DataTable, EmptyState } from "@/components/ds";
import { SelectCheckbox } from "@/components/batches/SelectCheckbox";
import type { NoSkuItem, QueuePagination } from "@/lib/types";

interface NoSkuItemsTableProps {
  items: NoSkuItem[];
  pagination: QueuePagination;
  loading: boolean;
  generatingItemId: number | null;
  onGenerate: (item: NoSkuItem) => void;
  selectedItemIds: number[];
  onSelectionChange: (itemIds: number[]) => void;
  onPageChange: (page: number) => void;
}

export function NoSkuItemsTable({
  items,
  pagination,
  loading,
  generatingItemId,
  onGenerate,
  selectedItemIds,
  onSelectionChange,
  onPageChange,
}: NoSkuItemsTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState icon="tag" title="NO ITEMS WITH A MISSING SKU" compact>
        Line items without Shopify SKUs appear here for SKU generation.
      </EmptyState>
    );
  }

  const selectableItems = items.filter(isGeneratable);
  const selectableIds = selectableItems.map((item) => item.order_item_id);
  const selectedOnPage = selectableIds.filter((id) => selectedItemIds.includes(id));
  const allSelected = selectableIds.length > 0 && selectedOnPage.length === selectableIds.length;
  const someSelected = selectedOnPage.length > 0 && !allSelected;
  const columns = [
    {
      key: "selection",
      header: (
        <SelectCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={selectableIds.length === 0}
          label={allSelected ? "Select none of the selectable Missing SKU items on this page" : "Select all selectable Missing SKU items on this page"}
          onChange={() => onSelectionChange(allSelected
            ? selectedItemIds.filter((id) => !selectableIds.includes(id))
            : Array.from(new Set([...selectedItemIds, ...selectableIds])))}
        />
      ),
      width: 44,
      render: (_value: unknown, item: NoSkuItem) => (
        <SelectCheckbox
          checked={selectedItemIds.includes(item.order_item_id)}
          disabled={!isGeneratable(item)}
          label={`Select Missing SKU item ${item.product_name || item.order_item_id} from order ${item.order_number}`}
          onChange={() => onSelectionChange(selectedItemIds.includes(item.order_item_id)
            ? selectedItemIds.filter((id) => id !== item.order_item_id)
            : [...selectedItemIds, item.order_item_id])}
        />
      ),
    },
    { key: "order_number", header: "Order", mono: true },
    {
      key: "item",
      header: "Item",
      render: (_value: unknown, item: NoSkuItem) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "var(--text-hi)", fontWeight: 700 }}>{item.product_name || "Unnamed item"}</span>
          <span style={{ color: "var(--text-low)", fontSize: 12 }}>{item.variant_options || "No variant options"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right" as const,
      render: (_value: unknown, item: NoSkuItem) => (
        <Button
          size="sm"
          variant="primary"
          loading={generatingItemId === item.id}
          disabled={generatingItemId !== null && generatingItemId !== item.id}
          onClick={() => onGenerate(item)}
        >
          Generate SKU
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <DataTable columns={columns} rows={items} rowKey="id" emptyLabel="No missing-SKU items" />
      <div aria-label="Missing SKU items pagination" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
        <span aria-live="polite">Page {pagination.page} of {pagination.total_pages || 1} ({pagination.count} total)</span>
        <Button size="sm" variant="outline" disabled={loading || !pagination.previous} onClick={() => pagination.previous && onPageChange(pagination.previous)}>Previous missing SKU</Button>
        <Button size="sm" variant="outline" disabled={loading || !pagination.next} onClick={() => pagination.next && onPageChange(pagination.next)}>Next missing SKU</Button>
      </div>
    </div>
  );
}

function isGeneratable(item: NoSkuItem): boolean {
  return Boolean(item.shopify_variant_id || item.product_name.trim());
}
