/**
 * Page-level status-key placement and dormant-state exclusion (P69).
 *
 * Asserts each applicable routed screen renders its key as the last element of
 * the page, and that pages without their own finite status labels are not
 * given an invented key.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BatchesScreen } from "@/components/batches/BatchesScreen";
import { OrdersScreen } from "@/components/orders/OrdersScreen";
import { AuditLogScreen } from "@/components/audit-log/AuditLogScreen";
import { getAuditLog, getBatches, getOrders } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getOrders: vi.fn(),
    getBatches: vi.fn(),
    getAuditLog: vi.fn(),
  };
});

const mockedGetOrders = vi.mocked(getOrders);
const mockedGetBatches = vi.mocked(getBatches);
const mockedGetAuditLog = vi.mocked(getAuditLog);

const emptyPage = { count: 0, next: null, previous: null, results: [] };

/** The key must sit after the primary content, at the end of the page root. */
function assertKeyIsLast(container: HTMLElement) {
  const key = screen.getByTestId("status-key");
  const pageRoot = container.firstElementChild as HTMLElement;
  expect(pageRoot.lastElementChild).toBe(key);
}

/**
 * The shared Status Guide (Decision #107) is a disclosure closed by default;
 * open it before asserting its definitions are visible.
 */
function openStatusGuide() {
  const guide = screen.getByTestId("status-key");
  expect(guide).not.toHaveAttribute("open");
  fireEvent.click(within(guide).getByText("Status Guide"));
  return guide;
}

describe("Orders screen status key", () => {
  beforeEach(() => {
    mockedGetOrders.mockReset();
    mockedGetOrders.mockResolvedValue(emptyPage);
  });

  it("renders the order key at the bottom of the page", async () => {
    const { container } = render(<OrdersScreen />);
    await screen.findByTestId("status-key");
    assertKeyIsLast(container);

    const key = openStatusGuide();
    expect(within(key).getByText("Fulfilled Externally")).toBeVisible();
    expect(within(key).getByText("Canceled")).toBeVisible();
  });

  it("excludes the dormant Phase 3 states from the key and the filter bar", async () => {
    render(<OrdersScreen />);
    await screen.findByTestId("status-key");

    for (const dormant of ["Being Packaged", "Shipped"]) {
      expect(screen.queryByText(dormant)).not.toBeInTheDocument();
    }
  });

  it("offers only the MVP-visible order statuses as filters", async () => {
    render(<OrdersScreen />);
    await screen.findByTestId("status-key");

    for (const visible of [
      "Queued for Production",
      "In Production",
      "In Production (Needs Reprint)",
      "Fulfilled Externally",
      "Canceled",
    ]) {
      expect(screen.getAllByText(visible).length).toBeGreaterThan(0);
    }
  });
});

describe("Current Batches screen status key", () => {
  beforeEach(() => {
    mockedGetBatches.mockReset();
    mockedGetBatches.mockResolvedValue(emptyPage);
  });

  it("renders the batch key at the bottom, including history statuses", async () => {
    const { container } = render(<BatchesScreen />);
    await screen.findByTestId("status-key");
    assertKeyIsLast(container);

    const key = openStatusGuide();
    // The history filters can genuinely render Printed and Archived here.
    for (const status of ["Open", "Locked for Review", "Printed", "Archived"]) {
      expect(within(key).getByText(status)).toBeVisible();
    }
  });
});

describe("Current Batches screen badge label (P72)", () => {
  beforeEach(() => {
    mockedGetBatches.mockReset();
  });

  it("shows 'PPT Generated' on the badge but keeps 'Locked for Review' in the status key", async () => {
    mockedGetBatches.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          production_group: "Ashtray",
          batch_number: 1,
          batch_label: "Ashtray #1",
          status: "Locked for Review",
          opened_at: "2026-08-13T09:00:00Z",
          locked_at: "2026-08-13T10:00:00Z",
          generated_file_url: null,
          created_at: "2026-08-13T09:00:00Z",
          updated_at: "2026-08-13T10:00:00Z",
          batch_items: [],
          generated_files: [],
          item_count: 0,
        },
      ],
    });

    render(<BatchesScreen />);
    await screen.findByTestId("status-key");

    // The batch card badge reads "PPT Generated" (display-only override); the
    // Status Guide still explains the underlying "Locked for Review" value.
    expect(screen.getByText("PPT Generated")).toBeVisible();
    const key = openStatusGuide();
    expect(within(key).getByText("Locked for Review")).toBeVisible();
  });
});

describe("Audit Log screen", () => {
  beforeEach(() => {
    mockedGetAuditLog.mockReset();
    mockedGetAuditLog.mockResolvedValue(emptyPage);
  });

  it("gets no invented key because it renders no finite status labels", async () => {
    render(<AuditLogScreen />);
    // Let the initial fetch settle before asserting absence.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByTestId("status-key")).not.toBeInTheDocument();
  });
});
