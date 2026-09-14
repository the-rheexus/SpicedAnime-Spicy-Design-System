import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BatchesScreen } from "@/components/batches/BatchesScreen";
import { getBatches } from "@/lib/api";
import type { ProductionBatch } from "@/lib/types";

const { mockedPush } = vi.hoisted(() => ({ mockedPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockedPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getBatches: vi.fn() };
});

const mockedGetBatches = vi.mocked(getBatches);

const OLD = "2020-01-01T00:00:00Z";

function batch(overrides: Partial<ProductionBatch> = {}): ProductionBatch {
  return {
    id: 1,
    production_group: "Lighter",
    batch_number: 12,
    batch_label: "Lighter #12",
    status: "Open",
    opened_at: OLD,
    created_at: OLD,
    updated_at: OLD,
    item_count: 3,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedPush.mockReset();
});

describe("BatchesScreen", () => {
  it("offers an All filter that removes the status constraint", async () => {
    mockedGetBatches.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });

    render(<BatchesScreen />);

    const allFilter = await screen.findByRole("button", { name: "All" });
    fireEvent.click(allFilter);
    expect(mockedPush).toHaveBeenCalledWith("/batches?");
    expect(screen.queryByText("Include History")).not.toBeInTheDocument();
  });

  it("renders batches as a table with an aging flag and no per-row detail fetch", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [batch()],
    });

    render(<BatchesScreen />);

    expect(await screen.findByText("Lighter #12")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Label" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Lighter" })).toBeInTheDocument();
    // "Open Batch" is navigation, so it is a real link (Decision #108), not a
    // router.push button — middle-click / Cmd-click / "Open in New Tab" work.
    const openLink = screen.getByRole("link", { name: "Open Batch" });
    expect(openLink).toHaveAttribute("href", "/batches/1");
    // opened_at is years old → shared aging flag ("{n}D")
    expect(screen.getByText(/\dD/)).toBeInTheDocument();
    // No Priority / Readiness / Exceptions columns on this screen.
    expect(screen.queryByRole("columnheader", { name: /priority/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /readiness/i })).not.toBeInTheDocument();
    expect(mockedGetBatches).toHaveBeenCalledTimes(1);
  });

  it("renders a zero-component batch neutrally", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [batch({ item_count: 0 })],
    });

    render(<BatchesScreen />);

    expect(await screen.findByText("no components")).toBeInTheDocument();
  });

  it("shows the PPT Generated display label for a Locked for Review batch", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [batch({ status: "Locked for Review" })],
    });

    render(<BatchesScreen />);

    // The row badge reads "PPT Generated"; the status-key legend still shows
    // the raw "Locked for Review" string (Decision #44).
    expect(await screen.findByText("PPT Generated")).toBeInTheDocument();
  });
});
