import { describe, expect, it } from "vitest";

import { sandboxFilteredAttentionQueues } from "@/lib/needsAttention";
import type { NeedsAttentionResponse } from "@/lib/types";

const page = { count: 2, page: 1, page_size: 100, total_pages: 1, next: null, previous: null };

function response(): NeedsAttentionResponse {
  return {
    errors: [
      { id: 1, status: "Blocked", component_code: "ASH", family_code: "ASH", order_number: "#1001", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
      { id: 2, status: "Blocked", component_code: "ASH", family_code: "ASH", order_number: "TEST-1001", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
    ],
    no_sku: [
      { id: 3, order_item_id: 3, order_id: 3, order_number: "#1002", product_name: "Wallet", variant_options: "", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
      { id: 4, order_item_id: 4, order_id: 4, order_number: "TEST-1002", product_name: "Wallet", variant_options: "", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
    ],
    deferred: [
      { id: 5, status: "Deferred MVP", component_code: "GRD", family_code: "GRD", order_number: "#1003", validation_failure_code: "FAMILY_DEFERRED_MVP", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
      { id: 6, status: "Deferred MVP", component_code: "GRD", family_code: "GRD", order_number: "TEST-1003", validation_failure_code: "FAMILY_DEFERRED_MVP", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
    ],
    errors_pagination: page,
    no_sku_pagination: page,
    deferred_pagination: page,
    badge_count: 6,
  };
}

describe("sandboxFilteredAttentionQueues", () => {
  it("applies the TEST- guard to every queue used by the dashboard tile and preview", () => {
    const filtered = sandboxFilteredAttentionQueues([response()]);
    expect(filtered.errors.map((row) => row.order_number)).toEqual(["#1001"]);
    expect(filtered.noSku.map((row) => row.order_number)).toEqual(["#1002"]);
    expect(filtered.deferred.map((row) => row.order_number)).toEqual(["#1003"]);
  });
});
