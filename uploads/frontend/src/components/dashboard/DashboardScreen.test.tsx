import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { getAuditLog, getDashboardMetrics } from "@/lib/api";
import { loadDashboardAttentionQueues } from "@/lib/needsAttention";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getAuditLog: vi.fn(), getDashboardMetrics: vi.fn() };
});

vi.mock("@/lib/needsAttention", () => ({ loadDashboardAttentionQueues: vi.fn() }));
vi.mock("@/components/dashboard/ActiveBatchTable", () => ({ ActiveBatchTable: () => <div>batch table</div> }));
vi.mock("@/components/dashboard/DashboardMetrics", () => ({ DashboardMetrics: () => <div>metrics</div> }));
vi.mock("@/components/dashboard/NeedsAttentionPreview", () => ({ NeedsAttentionPreview: () => <div>attention list</div> }));
vi.mock("@/components/dashboard/RecentActivityTable", () => ({ RecentActivityTable: () => <div>activity list</div> }));
vi.mock("@/components/status-key/StatusKey", () => ({ StatusKey: () => <div>status key</div> }));

describe("DashboardScreen", () => {
  it("uses the approved section headings and View all routes", async () => {
    vi.mocked(getDashboardMetrics).mockResolvedValue({
      active_open_batches_by_production_group: [],
      locked_for_review_batch_count: 0,
      printed_batch_count: 0,
      blocked_component_count: 0,
      deferred_mvp_component_count: 0,
      queued_for_production_order_count: 0,
      queue_totals: {
        orders_queued_for_production: 0,
        components_blocked: 0,
        components_deferred_mvp: 0,
        batches_locked_for_review: 0,
        batches_printed: 0,
      },
      recent_activity: [],
    });
    vi.mocked(getAuditLog).mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    vi.mocked(loadDashboardAttentionQueues).mockResolvedValue({ errors: [], noSku: [], deferred: [] });

    render(<DashboardScreen />);

    expect(await screen.findByRole("heading", { name: "ACTIVE BATCHES" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "OPEN BATCHES" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "RECENT ACTIVITY" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NEEDS ATTENTION" })).toBeInTheDocument();

    const viewAllLinks = screen.getAllByRole("link", { name: "View all" });
    expect(viewAllLinks.map((link) => link.getAttribute("href"))).toEqual(["/audit-log", "/needs-attention"]);
    expect(screen.getByRole("heading", { name: "RECENT ACTIVITY" }).closest("header")).toContainElement(viewAllLinks[0]);
    expect(screen.getByRole("heading", { name: "NEEDS ATTENTION" }).closest("header")).toContainElement(viewAllLinks[1]);
    expect(getAuditLog).toHaveBeenCalledWith({ page_size: 25 });
  });
});
