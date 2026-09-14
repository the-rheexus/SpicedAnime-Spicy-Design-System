import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrdersScreen, dateFilterToInstant, quickDateRange } from "@/components/orders/OrdersScreen";
import { bulkFlagOrderReprints, getOrder, getOrders } from "@/lib/api";
import type { OrderDetail, OrderListItem } from "@/lib/types";

const { mockedPush } = vi.hoisted(() => ({ mockedPush: vi.fn() }));

let searchParamsValue = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockedPush }),
  useSearchParams: () => searchParamsValue,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    bulkFlagOrderReprints: vi.fn(),
  };
});

const mockedGetOrders = vi.mocked(getOrders);
const mockedGetOrder = vi.mocked(getOrder);
const mockedBulkFlagOrderReprints = vi.mocked(bulkFlagOrderReprints);

function listItem(overrides: Partial<OrderListItem> = {}): OrderListItem {
  return {
    id: 7,
    shopify_order_id: "shopify-7",
    order_number: "1007",
    sales_channel: "Shopify",
    financial_status: "paid",
    fulfillment_status: null,
    status: "In Production",
    shopify_created_at: "2026-08-25T12:00:00Z",
    created_at: "2026-08-25T12:00:00Z",
    updated_at: "2026-08-25T12:00:00Z",
    item_count: 1,
    has_blocked: false,
    blocked_count: 0,
    reprint_eligible_count: 2,
    ...overrides,
  };
}

function detail(overrides: Partial<OrderDetail> = {}): OrderDetail {
  const base = listItem(overrides);
  return {
    ...base,
    customer_email: "test@example.com",
    shipping_address: {},
    items: [
      {
        id: 11,
        shopify_line_item_id: "line-11",
        sku: "LIT-PAIR-WHT-BIC-SOLO",
        product_name: "Lighter",
        quantity: 1,
        created_at: "2026-08-25T12:00:00Z",
        updated_at: "2026-08-25T12:00:00Z",
        components: [
          { id: 41, component_code: "LITF", family_code: "LIT", status: "Printed", created_at: "2026-08-25T12:00:00Z", updated_at: "2026-08-25T12:00:00Z" },
          { id: 42, component_code: "LITB", family_code: "LIT", status: "Printed", created_at: "2026-08-25T12:00:00Z", updated_at: "2026-08-25T12:00:00Z" },
        ],
      },
    ],
    ...overrides,
  };
}

function singleComponentDetail(id: number, orderNumber: string, componentId: number): OrderDetail {
  return detail({
    id,
    order_number: orderNumber,
    shopify_order_id: `shopify-${id}`,
    items: [
      {
        id: componentId * 10,
        shopify_line_item_id: `line-${componentId}`,
        sku: "ASH-TEST-SOLO",
        product_name: "Ashtray",
        quantity: 1,
        created_at: "2026-08-25T12:00:00Z",
        updated_at: "2026-08-25T12:00:00Z",
        components: [
          { id: componentId, component_code: "ASH", family_code: "ASH", status: "Printed", created_at: "2026-08-25T12:00:00Z", updated_at: "2026-08-25T12:00:00Z" },
        ],
      },
    ],
  });
}

function resetMocks() {
  searchParamsValue = new URLSearchParams();
  mockedGetOrders.mockReset();
  mockedGetOrder.mockReset();
  mockedBulkFlagOrderReprints.mockReset();
  mockedPush.mockReset();
}

describe("OrdersScreen operational table (Decision #105)", () => {
  beforeEach(() => {
    resetMocks();
    mockedGetOrders.mockResolvedValue({ count: 1, next: null, previous: null, results: [listItem()] });
    mockedGetOrder.mockResolvedValue(detail());
  });

  it("renders the approved column hierarchy and drops the permanent Blocked column", async () => {
    render(<OrdersScreen />);
    await screen.findByRole("link", { name: "1007" });

    const headers = screen.getAllByRole("columnheader").map((cell) => cell.textContent?.trim());
    expect(headers).toEqual([
      "", // leading selection checkbox
      "Order #",
      "Order Date",
      "Status",
      "Items",
      "Attention",
      "Reprint",
    ]);
    expect(screen.queryByRole("columnheader", { name: "Blocked" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Reprint Items/ })).not.toBeInTheDocument();
  });

  it("shows a quiet Attention cell for a normal order and Blocked N when blocked", async () => {
    mockedGetOrders.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        listItem({ id: 7, order_number: "1007", blocked_count: 0, has_blocked: false }),
        listItem({ id: 8, order_number: "1008", shopify_order_id: "shopify-8", blocked_count: 2, has_blocked: true, reprint_eligible_count: 0 }),
      ],
    });
    render(<OrdersScreen />);
    await screen.findByRole("link", { name: "1007" });

    const normalRow = screen.getByRole("link", { name: "1007" }).closest("tr") as HTMLElement;
    const blockedRow = screen.getByRole("link", { name: "1008" }).closest("tr") as HTMLElement;
    expect(within(normalRow).queryByText(/Blocked/i)).not.toBeInTheDocument();
    expect(within(blockedRow).getByText("Blocked 2")).toBeInTheDocument();
  });

  it("uses the order number as the only detail link and never the whole row", async () => {
    render(<OrdersScreen />);
    const orderLink = await screen.findByRole("link", { name: "1007" });
    expect(orderLink).toHaveAttribute("href", "/orders/7");

    const row = orderLink.closest("tr") as HTMLElement;
    expect(within(row).getAllByRole("link")).toHaveLength(1);
    fireEvent.click(row);
    expect(mockedPush).not.toHaveBeenCalled();
  });

  it("shows Select items only for reprint-eligible orders", async () => {
    mockedGetOrders.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        listItem({ id: 7, order_number: "1007", reprint_eligible_count: 2 }),
        listItem({ id: 8, order_number: "1008", shopify_order_id: "shopify-8", reprint_eligible_count: 0 }),
      ],
    });
    render(<OrdersScreen />);
    await screen.findByRole("link", { name: "1007" });

    const eligibleRow = screen.getByRole("link", { name: "1007" }).closest("tr") as HTMLElement;
    const ineligibleRow = screen.getByRole("link", { name: "1008" }).closest("tr") as HTMLElement;

    expect(within(eligibleRow).getByRole("button", { name: "Select items" })).toBeInTheDocument();
    expect(within(eligibleRow).getByRole("checkbox", { name: "Select order 1007" })).toBeInTheDocument();

    expect(within(ineligibleRow).queryByRole("button", { name: "Select items" })).not.toBeInTheDocument();
    expect(within(ineligibleRow).queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("expands the reprint picker as the table row directly beneath its order, not after the table", async () => {
    render(<OrdersScreen />);
    fireEvent.click(await screen.findByRole("button", { name: "Select items" }));

    const picker = await screen.findByLabelText("Printed items for order 1007");
    const expandedRow = picker.closest("tr") as HTMLElement;
    expect(expandedRow).toHaveAttribute("data-testid", "data-table-expanded-row");
    expect(picker.closest("table")).not.toBeNull();

    const orderRow = screen.getByRole("link", { name: "1007" }).closest("tr") as HTMLElement;
    expect(orderRow.nextElementSibling).toBe(expandedRow);
  });

  it("keeps multiple expansions and their component selections correctly associated", async () => {
    mockedGetOrders.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        listItem({ id: 7, order_number: "1007", reprint_eligible_count: 1 }),
        listItem({ id: 8, order_number: "1008", shopify_order_id: "shopify-8", reprint_eligible_count: 1 }),
      ],
    });
    mockedGetOrder.mockImplementation(async (id) => {
      if (Number(id) === 7) return singleComponentDetail(7, "1007", 71);
      return singleComponentDetail(8, "1008", 81);
    });

    render(<OrdersScreen />);
    await screen.findByRole("link", { name: "1007" });

    const row1007 = () => screen.getByRole("link", { name: "1007" }).closest("tr") as HTMLElement;
    const row1008 = () => screen.getByRole("link", { name: "1008" }).closest("tr") as HTMLElement;

    fireEvent.click(within(row1007()).getByRole("button", { name: "Select items" }));
    fireEvent.click(within(row1008()).getByRole("button", { name: "Select items" }));

    const picker1007 = await screen.findByLabelText("Printed items for order 1007");
    const picker1008 = await screen.findByLabelText("Printed items for order 1008");

    fireEvent.click(within(picker1007).getByRole("checkbox"));
    fireEvent.click(within(picker1008).getByRole("checkbox"));
    expect(screen.getByText("2 order(s), 2 component(s) selected")).toBeVisible();

    // Collapsing order 1008 leaves both orders' component selections intact.
    fireEvent.click(within(row1008()).getByRole("button", { name: "Hide items" }));
    expect(screen.queryByLabelText("Printed items for order 1008")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Printed items for order 1007")).toBeInTheDocument();
    expect(screen.getByText("2 order(s), 2 component(s) selected")).toBeVisible();
  });

  it("header select-all only affects reprint-eligible orders on the current page", async () => {
    mockedGetOrders.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        listItem({ id: 7, order_number: "1007", reprint_eligible_count: 2 }),
        listItem({ id: 8, order_number: "1008", shopify_order_id: "shopify-8", reprint_eligible_count: 0 }),
      ],
    });
    render(<OrdersScreen />);
    const selectAll = await screen.findByRole("checkbox", { name: "Select all reprint-eligible orders on this page" });

    fireEvent.click(selectAll);
    expect(screen.getByRole("checkbox", { name: "Select order 1007" })).toBeChecked();
    expect(screen.getByText("1 order(s), 0 component(s) selected")).toBeVisible();

    fireEvent.click(selectAll);
    expect(screen.getByRole("checkbox", { name: "Select order 1007" })).not.toBeChecked();
    expect(screen.getByText("0 order(s), 0 component(s) selected")).toBeVisible();
  });

  it("header checkbox is indeterminate when only some eligible orders are selected", async () => {
    mockedGetOrders.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        listItem({ id: 7, order_number: "1007", reprint_eligible_count: 2 }),
        listItem({ id: 8, order_number: "1008", shopify_order_id: "shopify-8", reprint_eligible_count: 2 }),
      ],
    });
    render(<OrdersScreen />);
    const selectAll = (await screen.findByRole("checkbox", {
      name: "Select all reprint-eligible orders on this page",
    })) as HTMLInputElement;

    fireEvent.click(screen.getByRole("checkbox", { name: "Select order 1007" }));
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll).not.toBeChecked();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select order 1008" }));
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll).toBeChecked();
  });

  it("keeps order and item selection separate and submits both halves of a pair", async () => {
    render(<OrdersScreen />);

    const orderCheckbox = await screen.findByRole("checkbox", { name: "Select order 1007" });
    fireEvent.click(orderCheckbox);
    expect(screen.getByText("1 order(s), 0 component(s) selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Select items" }));
    const pairCheckbox = await screen.findByRole("checkbox", { name: /Lighter: LITF \/ LITB/ });
    fireEvent.click(pairCheckbox);
    expect(screen.getByText("1 order(s), 2 component(s) selected")).toBeVisible();

    mockedBulkFlagOrderReprints.mockResolvedValue({
      requested_component_ids: [41, 42],
      component_ids: [41, 42],
      auto_included_component_ids: [],
      affected_order_ids: [7],
      results: [],
    });
    fireEvent.click(screen.getByRole("button", { name: "Bulk Flag Reprint" }));
    await waitFor(() => expect(mockedBulkFlagOrderReprints).toHaveBeenCalledWith([41, 42]));
  });

  it("explains stale eligibility inside the affected order's inline region", async () => {
    mockedGetOrder.mockResolvedValue(
      detail({
        items: [
          {
            id: 11,
            shopify_line_item_id: "line-11",
            sku: "ASH-TEST-SOLO",
            product_name: "Ashtray",
            quantity: 1,
            created_at: "2026-08-25T12:00:00Z",
            updated_at: "2026-08-25T12:00:00Z",
            components: [
              { id: 41, component_code: "ASH", family_code: "ASH", status: "Ready", created_at: "2026-08-25T12:00:00Z", updated_at: "2026-08-25T12:00:00Z" },
            ],
          },
        ],
      }),
    );
    render(<OrdersScreen />);
    fireEvent.click(await screen.findByRole("button", { name: "Select items" }));

    const picker = await screen.findByLabelText("Printed items for order 1007");
    expect(within(picker).getByText(/no longer available for reprint/i)).toBeInTheDocument();
  });
});

describe("OrdersScreen quick-date shortcuts", () => {
  beforeEach(() => {
    resetMocks();
    mockedGetOrders.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mockedGetOrder.mockResolvedValue(detail());
  });

  it("computes inclusive local-calendar ranges", () => {
    const now = new Date(2026, 8, 3, 15, 30); // 2026-09-03 local

    expect(quickDateRange("today", now)).toEqual({ after: "2026-09-03", before: "2026-09-03" });
    expect(quickDateRange("yesterday", now)).toEqual({ after: "2026-09-02", before: "2026-09-02" });
    expect(quickDateRange("last7", now)).toEqual({ after: "2026-08-28", before: "2026-09-03" });

    const start = new Date(dateFilterToInstant("2026-09-03", "start"));
    const end = new Date(dateFilterToInstant("2026-09-03", "end"));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    // A value that already carries a time part is untouched.
    expect(dateFilterToInstant("2026-09-03T08:00:00Z", "end")).toBe("2026-09-03T08:00:00Z");
  });

  it("applies a shortcut to the URL date filters and resets to page 1", async () => {
    searchParamsValue = new URLSearchParams({ page: "3", status: "In Production" });
    render(<OrdersScreen />);
    await screen.findByText("NO ORDERS FOUND");

    fireEvent.click(screen.getByRole("button", { name: "Last 7 Days" }));

    expect(mockedPush).toHaveBeenCalledTimes(1);
    const pushed = new URLSearchParams(mockedPush.mock.calls[0][0].split("?")[1]);
    const expected = quickDateRange("last7");
    expect(pushed.get("created_at_after")).toBe(expected.after);
    expect(pushed.get("created_at_before")).toBe(expected.before);
    expect(pushed.get("page")).toBeNull();
    expect(pushed.get("status")).toBe("In Production");
  });

  it("marks the active shortcut and widens the request to an inclusive end-of-day", async () => {
    const range = quickDateRange("today");
    searchParamsValue = new URLSearchParams({
      created_at_after: range.after,
      created_at_before: range.before,
    });
    render(<OrdersScreen />);
    await screen.findByText("NO ORDERS FOUND");

    expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Yesterday" })).toHaveAttribute("aria-pressed", "false");

    const call = mockedGetOrders.mock.calls[0][0];
    expect(call?.created_at_after).toBe(dateFilterToInstant(range.after, "start"));
    expect(call?.created_at_before).toBe(dateFilterToInstant(range.before, "end"));
  });

  it("keeps the custom From/To controls and Apply working", async () => {
    render(<OrdersScreen />);
    await screen.findByText("NO ORDERS FOUND");

    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-08-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const pushed = new URLSearchParams(mockedPush.mock.calls.at(-1)?.[0].split("?")[1]);
    expect(pushed.get("created_at_after")).toBe("2026-08-01");
    expect(pushed.get("created_at_before")).toBe("2026-08-31");
  });

  it("still toggles status filters", async () => {
    render(<OrdersScreen />);
    await screen.findByText("NO ORDERS FOUND");

    fireEvent.click(screen.getByRole("button", { name: /Queued for Production/ }));
    const pushed = new URLSearchParams(mockedPush.mock.calls.at(-1)?.[0].split("?")[1]);
    expect(pushed.getAll("status")).toContain("Queued for Production");
  });
});
