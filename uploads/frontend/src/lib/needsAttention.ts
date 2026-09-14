import { getNeedsAttention } from "@/lib/api";
import type { BlockedComponent, DeferredComponent, NeedsAttentionResponse, NoSkuItem } from "@/lib/types";

export interface DashboardAttentionQueues {
  errors: BlockedComponent[];
  noSku: NoSkuItem[];
  deferred: DeferredComponent[];
}

/**
 * Sandbox orders are intentionally absent from Dashboard surfaces (Decisions
 * #47 and #58). The Needs Attention API does not expose `is_sandbox`, so its
 * stable TEST- order-number prefix is the client-side guard established in
 * P105.
 */
export function isSandboxAttentionOrder(orderNumber?: string | null): boolean {
  return Boolean(orderNumber?.startsWith("TEST-"));
}

function uniqueById<T extends { id: number }>(rows: T[]): T[] {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

export function sandboxFilteredAttentionQueues(
  responses: NeedsAttentionResponse[],
): DashboardAttentionQueues {
  return {
    errors: uniqueById(responses.flatMap((response) => response.errors)).filter(
      (row) => !isSandboxAttentionOrder(row.order_number),
    ),
    noSku: uniqueById(responses.flatMap((response) => response.no_sku)).filter(
      (row) => !isSandboxAttentionOrder(row.order_number),
    ),
    deferred: uniqueById(responses.flatMap((response) => response.deferred)).filter(
      (row) => !isSandboxAttentionOrder(row.order_number),
    ),
  };
}

/**
 * Load every Needs Attention queue page before applying the sandbox guard.
 * Pagination totals cannot safely be used because they include sandbox rows.
 */
export async function loadDashboardAttentionQueues(): Promise<DashboardAttentionQueues> {
  const first = await getNeedsAttention({ page_size: 100 });
  const totalPages = Math.max(
    first.errors_pagination.total_pages,
    first.no_sku_pagination.total_pages,
    first.deferred_pagination.total_pages,
  );
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
      const page = index + 2;
      return getNeedsAttention({
        blocked_page: page,
        no_sku_page: page,
        deferred_page: page,
        page_size: 100,
      });
    }),
  );

  return sandboxFilteredAttentionQueues([first, ...remaining]);
}
