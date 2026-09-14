import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NeedsAttentionPreview } from "@/components/dashboard/NeedsAttentionPreview";
import type { DashboardAttentionQueues } from "@/lib/needsAttention";

function queues(overrides: Partial<DashboardAttentionQueues> = {}): DashboardAttentionQueues {
  return {
    errors: [],
    deferred: [],
    noSku: [],
    ...overrides,
  };
}

describe("NeedsAttentionPreview", () => {
  it("orders blocked items before deferred", async () => {
    render(
      <NeedsAttentionPreview
        failed={false}
        queues={queues({
        errors: [
          { id: 1, status: "Blocked", component_code: "TIN", family_code: "LIT", order_id: 5, order_number: "#3489", validation_failure_code: "MISSING_ARTWORK", order_date: "2026-08-20T00:00:00Z", created_at: "2026-08-20T00:00:00Z", updated_at: "2026-08-20T00:00:00Z" },
        ],
        deferred: [
          { id: 3, status: "Deferred MVP", component_code: "GRD", family_code: "GRD", order_id: 7, order_number: "#3458", validation_failure_code: "FAMILY_DEFERRED_MVP", order_date: "2026-08-01T00:00:00Z", created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
        ],
        })}
      />,
    );

    const list = screen.getByRole("list");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("#3489"); // blocked first
    expect(rows[1]).toHaveTextContent("#3458"); // deferred after
  });

  it("is read-only: renders no action buttons", async () => {
    render(
      <NeedsAttentionPreview
        failed={false}
        queues={queues({
        noSku: [
          { id: 9, order_item_id: 9, order_id: 4, order_number: "#3474", product_name: "Bulma Lighter", variant_options: "Gold", shopify_product_id: null, shopify_variant_id: null, created_at: "2026-08-25T00:00:00Z", updated_at: "2026-08-25T00:00:00Z" },
        ],
        })}
      />,
    );

    expect(screen.getByText(/Missing SKU on line item/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("caps the already-prioritized preview at 30 and scrolls within a bounded region", () => {
    const errors = Array.from({ length: 31 }, (_, index) => ({
      id: index + 1,
      status: "Blocked" as const,
      component_code: `C${index + 1}`,
      family_code: "LIT",
      order_id: index + 1,
      order_number: `#${index + 1}`,
      validation_failure_code: "MISSING_ARTWORK",
      order_date: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      updated_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    }));

    render(<NeedsAttentionPreview failed={false} queues={queues({ errors })} />);

    const rows = within(screen.getByRole("list", { name: "Needs attention items" })).getAllByRole("listitem");
    expect(rows).toHaveLength(30);
    expect(rows[0]).toHaveTextContent("C1");
    expect(rows[29]).toHaveTextContent("C30");
    expect(screen.queryByText(/C31/)).not.toBeInTheDocument();
    expect(screen.getByTestId("needs-attention-scroll-region")).toHaveStyle({
      maxHeight: "420px",
      overflowY: "auto",
    });
  });
});
