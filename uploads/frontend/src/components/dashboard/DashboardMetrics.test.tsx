import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { getIntegrationStatus } from "@/lib/api";
import type { DashboardMetrics as DashboardMetricsPayload } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, prefetch: vi.fn() }) }));
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getIntegrationStatus: vi.fn() };
});

const mockedIntegrationStatus = vi.mocked(getIntegrationStatus);

const metrics: DashboardMetricsPayload = {
  active_open_batches_by_production_group: [{ production_group: "ASH", open_count: 2 }],
  locked_for_review_batch_count: 0,
  printed_batch_count: 0,
  blocked_component_count: 99,
  deferred_mvp_component_count: 99,
  queued_for_production_order_count: 4,
  queue_totals: {
    orders_queued_for_production: 4,
    components_blocked: 99,
    components_deferred_mvp: 99,
    batches_locked_for_review: 0,
    batches_printed: 0,
  },
  recent_activity: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedIntegrationStatus.mockResolvedValue({
    shopify: { connected: true, last_webhook_at: null, api_version: "2026-07" },
    drive: { root_folder_configured: true, last_export_at: null },
    celery: { worker_reachable: true },
  });
});

describe("DashboardMetrics", () => {
  it("renders exactly four tiles and uses only sandbox-filtered attention queues", () => {
    const { container } = render(
      <DashboardMetrics
        metrics={metrics}
        attentionQueues={{
          errors: [{ id: 1, status: "Blocked", component_code: "ASH", family_code: "ASH", order_number: "#1001", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" }],
          noSku: [{ id: 2, order_item_id: 2, order_id: 2, order_number: "#1002", product_name: "Wallet", variant_options: "", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" }],
          deferred: [{ id: 3, status: "Deferred MVP", component_code: "GRD", family_code: "GRD", order_number: "#1003", validation_failure_code: "FAMILY_DEFERRED_MVP", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" }],
        }}
      />,
    );

    expect(container.querySelector("section")?.children).toHaveLength(4);
    const tile = screen.getByRole("link", { name: /Needs Attention — 3 total/ });
    expect(tile).toHaveAttribute("href", "/needs-attention");
    fireEvent.mouseEnter(tile);
    expect(screen.getByText("Missing SKU").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "false");
    expect(screen.queryByText("99")).not.toBeInTheDocument();
  });

  it("renders the navigation tiles as real links, not router.push buttons (Decision #108)", () => {
    render(<DashboardMetrics metrics={metrics} attentionQueues={null} />);

    const openBatches = screen.getByRole("link", { name: /Open batches/ });
    expect(openBatches).toHaveAttribute("href", "/batches");
    expect(openBatches.tagName).toBe("A");

    const queued = screen.getByRole("link", { name: /Queued/ });
    expect(queued).toHaveAttribute("href", "/orders");
    // The tiles carry a genuine href (native new-tab / modifier-click support);
    // they are not bare click handlers calling router.push.
  });
});
