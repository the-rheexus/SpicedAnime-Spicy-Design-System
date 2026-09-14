import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveBatchTable } from "@/components/dashboard/ActiveBatchTable";
import { getBatch, getBatches } from "@/lib/api";
import type { ProductionBatch } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getBatches: vi.fn(), getBatch: vi.fn() };
});

const mockedGetBatches = vi.mocked(getBatches);
const mockedGetBatch = vi.mocked(getBatch);

const OLD = "2020-01-01T00:00:00Z";
const RECENT = new Date().toISOString();

function listBatch(overrides: Partial<ProductionBatch> = {}): ProductionBatch {
  return {
    id: 1,
    production_group: "Lighter",
    batch_number: 12,
    batch_label: "Lighter #12",
    status: "Open",
    opened_at: OLD,
    created_at: OLD,
    updated_at: RECENT,
    item_count: 3,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ActiveBatchTable", () => {
  it("shows real Ready / Blocked counts from the batch detail payload and an aging flag", async () => {
    mockedGetBatches.mockResolvedValue({ count: 1, next: null, previous: null, results: [listBatch()] });
    mockedGetBatch.mockResolvedValue({
      ...listBatch(),
      component_status_counts: { Ready: 2, Blocked: 1 },
    });

    render(<ActiveBatchTable />);

    expect(await screen.findByText("#12")).toBeInTheDocument();
    expect(screen.queryByText("Lighter #12")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Batch" })).toHaveStyle({ width: "76px" });
    expect(screen.getByRole("columnheader", { name: "Group" })).toHaveStyle({ width: "190px" });
    expect(screen.getByRole("columnheader", { name: "Started" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Intake" })).not.toBeInTheDocument();
    expect(screen.getByText("2/3 ready")).toBeInTheDocument();
    expect(screen.getByText("1 blocked")).toBeInTheDocument();
    // The row "Open" control is a real link to the batch detail route
    // (Decision #108), not a router.push button.
    const openLink = screen.getByRole("link", { name: "Open" });
    expect(openLink).toHaveAttribute("href", "/batches/1");
    expect(openLink.tagName).toBe("A");
    // opened_at is years old → aging flag renders
    await waitFor(() => expect(screen.getByText(/\dD/)).toBeInTheDocument());
  });

  it("renders a zero-component batch neutrally, not as 0/0 ready", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [listBatch({ item_count: 0 })],
    });
    mockedGetBatch.mockResolvedValue({ ...listBatch({ item_count: 0 }), component_status_counts: {} });

    render(<ActiveBatchTable />);

    expect(await screen.findByText("#12")).toBeInTheDocument();
    expect(screen.getByText("no components")).toBeInTheDocument();
    expect(screen.queryByText("0/0 ready")).not.toBeInTheDocument();
  });

  it("renders an em dash for Ready / Blocked when the detail lookup fails", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [listBatch({ opened_at: RECENT, created_at: RECENT })],
    });
    mockedGetBatch.mockRejectedValue(new Error("no detail"));

    render(<ActiveBatchTable />);

    expect(await screen.findByText("#12")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});
