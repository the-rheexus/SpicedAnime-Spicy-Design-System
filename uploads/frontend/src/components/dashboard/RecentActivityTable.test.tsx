import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";

describe("RecentActivityTable", () => {
  it("renders a friendly activity feed with the identifier and relative time", () => {
    render(
      <RecentActivityTable
        events={[{
          id: 1,
          actor_type: "system",
          action: "artwork_reconciliation_completed",
          entity_type: "ArtworkRevalidationRun",
          entity_id: "8",
          entity_label: "Revalidation run #8",
          created_at: "2026-09-01T00:00:00Z",
        }]}
      />,
    );

    const feed = screen.getByRole("list", { name: "Recent activity" });
    expect(within(feed).getByText("Artwork reconciliation completed — Revalidation run #8")).toBeInTheDocument();
    expect(screen.queryByText("artwork_reconciliation_completed")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
    expect(screen.queryByText("Actor")).not.toBeInTheDocument();
    expect(screen.queryByText("Affected object")).not.toBeInTheDocument();
    expect(feed.querySelector('[data-icon="image"]')).toBeInTheDocument();
  });

  it("leaves an unknown action raw without duplicating it", () => {
    render(
      <RecentActivityTable
        events={[{
          id: 2,
          actor_type: "system",
          action: "uncontracted_future_action",
          entity_type: "Order",
          entity_id: "2",
          created_at: "2026-09-01T00:00:00Z",
        }]}
      />,
    );

    expect(screen.getByText("uncontracted_future_action — Order #2")).toBeInTheDocument();
  });

  it("caps the preview at 25 newest-first rows inside a bounded scroll region", () => {
    const events = Array.from({ length: 35 }, (_, index) => ({
      id: 35 - index,
      actor_type: "system",
      action: "order_imported",
      entity_type: "Order",
      entity_id: String(35 - index),
      entity_label: `Order #${35 - index}`,
      created_at: new Date(Date.now() - index * 60_000).toISOString(),
    }));

    render(<RecentActivityTable events={events} />);

    const rows = within(screen.getByRole("list", { name: "Recent activity" })).getAllByRole("listitem");
    expect(rows).toHaveLength(25);
    expect(rows[0]).toHaveTextContent("Order #35 imported");
    expect(rows[24]).toHaveTextContent("Order #11 imported");
    expect(screen.queryByText("Order #10 imported")).not.toBeInTheDocument();
    expect(rows[0].querySelector('[data-icon="shopping-cart"]')).toBeInTheDocument();
    expect(screen.getByTestId("recent-activity-scroll-region")).toHaveStyle({
      maxHeight: "420px",
      overflowY: "auto",
    });
  });
});
