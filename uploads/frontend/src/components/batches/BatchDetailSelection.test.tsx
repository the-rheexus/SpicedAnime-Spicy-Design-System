import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BatchDetailScreen } from "@/components/batches/BatchDetailScreen";
import { ApiError, generateBatchPptx, getBatch, getTaskStatus } from "@/lib/api";
import type { BatchItem, ProductionBatch, ProductionComponent } from "@/lib/types";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    flagComponentReprint: vi.fn(),
    generateBatchPptx: vi.fn(),
    getBatch: vi.fn(),
    getTaskStatus: vi.fn(),
    markBatchPrinted: vi.fn(),
  };
});

const mockedGenerateBatchPptx = vi.mocked(generateBatchPptx);
const mockedGetBatch = vi.mocked(getBatch);
const mockedGetTaskStatus = vi.mocked(getTaskStatus);

function component(overrides: Partial<ProductionComponent> = {}): ProductionComponent {
  return {
    id: 1,
    component_code: "ASH",
    family_code: "ASH",
    design_code: "TEST",
    config_code: "SOLO",
    batch_group: "Ashtray",
    status: "Ready",
    order_number: "1001",
    order_item_id: 1,
    created_at: "2026-08-13T09:00:00Z",
    updated_at: "2026-08-13T09:00:00Z",
    ...overrides,
  };
}

function openBatch(components: ProductionComponent[]): ProductionBatch {
  const batchItems: BatchItem[] = components.map((comp, index) => ({
    id: index + 1,
    batch: 1,
    component: comp,
    created_at: "2026-08-13T09:00:00Z",
  }));
  return {
    id: 1,
    production_group: "Ashtray",
    batch_number: 1,
    batch_label: "Ashtray #1",
    status: "Open",
    opened_at: "2026-08-13T09:00:00Z",
    locked_at: null,
    generated_file_url: null,
    created_at: "2026-08-13T09:00:00Z",
    updated_at: "2026-08-13T09:00:00Z",
    batch_items: batchItems,
    generated_files: [],
  };
}

const ASH_ROWS = [
  component({ id: 10, order_number: "1003", order_item_id: 10 }),
  component({ id: 11, order_number: "1001", order_item_id: 11 }),
  component({ id: 12, order_number: "1002", order_item_id: 12 }),
];

const LIGHTER_ROWS = [
  component({ id: 20, component_code: "LITF", family_code: "LIT", order_item_id: 100, order_number: "2001" }),
  component({ id: 21, component_code: "LITB", family_code: "LIT", order_item_id: 100, order_number: "2001" }),
  component({ id: 22, component_code: "LITF", family_code: "LIT", order_item_id: 101, order_number: "2002" }),
  component({ id: 23, component_code: "LITB", family_code: "LIT", order_item_id: 101, order_number: "2002" }),
];

function rowCheckboxes() {
  // The first checkbox is the header select-all control.
  return screen.getAllByRole("checkbox").slice(1);
}

function selectionCount() {
  return screen.getByTestId("selection-count").textContent;
}

function orderColumnValues() {
  // P95 A8 column order: Checkbox | Order | Design | Component | (Color) |
  // Family | Config | Order Date | SKU | Status | Failure. Order is cell 1.
  const rows = screen.getAllByRole("row").slice(1);
  return rows.map((row) => within(row).getAllByRole("cell")[1].textContent);
}

async function renderBatch(components: ProductionComponent[]) {
  mockedGetBatch.mockResolvedValue(openBatch(components));
  render(<BatchDetailScreen batchId="1" />);
  await screen.findByText("Batch Items");
}

describe("Batch Detail selection", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 9,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 1,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: false,
      selection_mode: "selected_items",
      task_id: null,
    });
  });

  it("renders one checkbox per row plus a header select-all control", async () => {
    await renderBatch(ASH_ROWS);
    expect(screen.getAllByRole("checkbox")).toHaveLength(ASH_ROWS.length + 1);
  });

  it("shows a live selected count", async () => {
    await renderBatch(ASH_ROWS);
    expect(selectionCount()).toBe("0 of 3 items selected");

    fireEvent.click(rowCheckboxes()[0]);
    expect(selectionCount()).toBe("1 of 3 items selected");

    fireEvent.click(rowCheckboxes()[1]);
    expect(selectionCount()).toBe("2 of 3 items selected");
  });

  it("select-all then select-none toggles every row", async () => {
    await renderBatch(ASH_ROWS);
    const header = screen.getAllByRole("checkbox")[0];

    fireEvent.click(header);
    expect(selectionCount()).toBe("3 of 3 items selected");

    fireEvent.click(header);
    expect(selectionCount()).toBe("0 of 3 items selected");
  });

  it("labels the action for the all-items and selected-items modes", async () => {
    await renderBatch(ASH_ROWS);
    expect(screen.getByRole("button", { name: "Generate PPTX (All Items)" })).toBeVisible();

    fireEvent.click(rowCheckboxes()[0]);
    expect(screen.getByRole("button", { name: "Generate PPTX (Selected Items)" })).toBeVisible();

    // Selecting everything is the all-items branch, not a subset.
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByRole("button", { name: "Generate PPTX (All Items)" })).toBeVisible();
  });

  it("submits only the selected component IDs", async () => {
    await renderBatch(ASH_ROWS);
    fireEvent.click(rowCheckboxes()[0]);
    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (Selected Items)" }));
    const confirms = await screen.findAllByRole("button", {
      name: "Generate PPTX (Selected Items)",
    });
    fireEvent.click(confirms[confirms.length - 1]);

    expect(mockedGenerateBatchPptx).toHaveBeenCalledWith("1", [10]);
  });

  it("submits an empty selection for the all-items branch", async () => {
    await renderBatch(ASH_ROWS);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (All Items)" }));
    const confirms = await screen.findAllByRole("button", { name: "Generate PPTX (All Items)" });
    fireEvent.click(confirms[confirms.length - 1]);

    expect(mockedGenerateBatchPptx).toHaveBeenCalledWith("1", []);
  });

  it("does not offer selection for components that are not Ready", async () => {
    await renderBatch([
      component({ id: 30, status: "Ready", order_item_id: 30 }),
      component({ id: 31, status: "Blocked", order_item_id: 31 }),
    ]);
    expect(selectionCount()).toBe("0 of 1 items selected");
    expect(rowCheckboxes()[1]).toBeDisabled();
  });
});

describe("Batch Detail front/back pair integrity", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 9,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 1,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: false,
      task_id: null,
    });
  });

  it("selecting a LITF also selects its LITB sibling", async () => {
    await renderBatch(LIGHTER_ROWS);
    fireEvent.click(rowCheckboxes()[0]);
    expect(selectionCount()).toBe("2 of 4 items selected");
  });

  it("selecting a LITB also selects its LITF sibling", async () => {
    await renderBatch(LIGHTER_ROWS);
    fireEvent.click(rowCheckboxes()[1]);
    expect(selectionCount()).toBe("2 of 4 items selected");
  });

  it("deselecting one half never leaves a half pair", async () => {
    await renderBatch(LIGHTER_ROWS);
    fireEvent.click(rowCheckboxes()[0]);
    fireEvent.click(rowCheckboxes()[1]);
    expect(selectionCount()).toBe("0 of 4 items selected");
  });

  it("submits both halves of a selected pair", async () => {
    await renderBatch(LIGHTER_ROWS);
    fireEvent.click(rowCheckboxes()[2]);
    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (Selected Items)" }));
    const confirms = await screen.findAllByRole("button", {
      name: "Generate PPTX (Selected Items)",
    });
    fireEvent.click(confirms[confirms.length - 1]);

    expect(mockedGenerateBatchPptx).toHaveBeenCalledWith("1", [22, 23]);
  });
});

describe("Batch Detail Order sort", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
  });

  it("cycles unsorted → ascending → descending → unsorted", async () => {
    await renderBatch(ASH_ROWS);
    const sortControl = screen.getByRole("button", { name: /Sort by Order ID/ });

    expect(orderColumnValues()).toEqual(["1003", "1001", "1002"]);
    expect(screen.getByTestId("order-sort-state")).toHaveTextContent("unsorted");

    fireEvent.click(sortControl);
    expect(orderColumnValues()).toEqual(["1001", "1002", "1003"]);
    expect(screen.getByTestId("order-sort-state")).toHaveTextContent("ascending");

    fireEvent.click(screen.getByRole("button", { name: /Sort by Order ID/ }));
    expect(orderColumnValues()).toEqual(["1003", "1002", "1001"]);
    expect(screen.getByTestId("order-sort-state")).toHaveTextContent("descending");

    fireEvent.click(screen.getByRole("button", { name: /Sort by Order ID/ }));
    expect(orderColumnValues()).toEqual(["1003", "1001", "1002"]);
    expect(screen.getByTestId("order-sort-state")).toHaveTextContent("unsorted");
  });

  it("announces the sort direction in the control's accessible name", async () => {
    await renderBatch(ASH_ROWS);
    expect(
      screen.getByRole("button", { name: "Sort by Order ID (currently unsorted)" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Sort by Order ID/ }));
    expect(
      screen.getByRole("button", { name: "Sort by Order ID (currently ascending)" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Sort by Order ID/ }));
    expect(
      screen.getByRole("button", { name: "Sort by Order ID (currently descending)" }),
    ).toBeVisible();
  });

  it("is keyboard reachable as a real button", async () => {
    await renderBatch(ASH_ROWS);
    const sortControl = screen.getByRole("button", { name: /Sort by Order ID/ });
    expect(sortControl.tagName).toBe("BUTTON");
  });

  it("keeps the selection intact across every sort transition", async () => {
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 9,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 1,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: false,
      task_id: null,
    });
    await renderBatch(ASH_ROWS);

    // Select the row whose order number sorts last, so its row index moves.
    fireEvent.click(rowCheckboxes()[0]);
    expect(selectionCount()).toBe("1 of 3 items selected");

    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Sort by Order ID/ }));
      expect(selectionCount()).toBe("1 of 3 items selected");
    }

    // Submitted selection is by component ID and independent of visual order.
    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (Selected Items)" }));
    const confirms = await screen.findAllByRole("button", {
      name: "Generate PPTX (Selected Items)",
    });
    fireEvent.click(confirms[confirms.length - 1]);
    expect(mockedGenerateBatchPptx).toHaveBeenCalledWith("1", [10]);
  });
});

describe("Batch Detail Order Date column", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
  });

  it("renders order date alongside order number, independent of sort order", async () => {
    const rows = [
      component({
        id: 30,
        order_number: "1003",
        order_item_id: 30,
        order_date: "2026-08-10T00:00:00Z",
      }),
      component({
        id: 31,
        order_number: "1001",
        order_item_id: 31,
        order_date: "2026-08-12T00:00:00Z",
      }),
    ];
    await renderBatch(rows);

    expect(screen.getByRole("columnheader", { name: "Order Date" })).toBeVisible();
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent?.trim());
    const orderDateIndex = headers.findIndex((label) => label === "Order Date");
    const dataRows = screen.getAllByRole("row").slice(1);
    expect(within(dataRows[0]).getAllByRole("cell")[orderDateIndex].textContent).toContain("2026");
    expect(within(dataRows[1]).getAllByRole("cell")[orderDateIndex].textContent).toContain("2026");
  });
});

describe("Batch Detail stale selection handling", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
  });

  it("renders the inline refresh message for a stale selection", async () => {
    mockedGenerateBatchPptx.mockRejectedValue(
      new ApiError({
        status: 409,
        message: "Some selected items are no longer available: ASH #10.",
        details: {
          error_code: "STALE_SELECTION",
          stale_component_ids: [10],
          stale_component_labels: ["ASH #10"],
        },
      }),
    );
    await renderBatch(ASH_ROWS);

    fireEvent.click(rowCheckboxes()[0]);
    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (Selected Items)" }));
    const confirms = await screen.findAllByRole("button", {
      name: "Generate PPTX (Selected Items)",
    });
    fireEvent.click(confirms[confirms.length - 1]);

    expect(
      await screen.findByText(
        "Some selected items are no longer available: ASH #10. Refresh the page and try again.",
      ),
    ).toBeVisible();
  });

  it("leaves non-stale failures with their original message", async () => {
    mockedGenerateBatchPptx.mockRejectedValue(
      new ApiError({ status: 409, message: "Generate PPTX requires an Open batch." }),
    );
    await renderBatch(ASH_ROWS);

    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX (All Items)" }));
    const confirms = await screen.findAllByRole("button", { name: "Generate PPTX (All Items)" });
    fireEvent.click(confirms[confirms.length - 1]);

    expect(await screen.findByText("Generate PPTX requires an Open batch.")).toBeVisible();
  });
});

function largeRows(count = 220): ProductionComponent[] {
  return Array.from({ length: count }, (_, index) =>
    component({
      id: index + 1,
      order_item_id: index + 1,
      order_number: String(3000 + index),
      color: index % 2 === 0 ? "Gold" : "Silver",
    }),
  );
}

function virtualScrollTo(scrollTop: number) {
  fireEvent.scroll(screen.getByTestId("virtualized-data-table-scroll"), {
    target: { scrollTop },
  });
}

describe("Batch Detail large-table virtualization", () => {
  beforeEach(() => {
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
  });

  it("uses a bounded sticky viewport and mounts only a row window", async () => {
    await renderBatch(largeRows());

    const viewport = screen.getByTestId("virtualized-data-table-scroll");
    expect(viewport).toHaveStyle({ maxHeight: "576px", overflowY: "auto" });
    expect(screen.getAllByRole("row").length).toBeLessThan(40);
    expect(screen.queryByLabelText("Select component ASH 220")).not.toBeInTheDocument();

    const orderHeader = screen.getAllByRole("columnheader")[1];
    expect(orderHeader).toHaveStyle({ position: "sticky", top: "0px", zIndex: "1" });

    virtualScrollTo(52 * 150);
    expect(screen.queryByLabelText("Select component ASH 1")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Select component ASH 151")).toBeInTheDocument();
  });

  it("keeps selections and front/back pair expansion across virtual windows", async () => {
    const rows = largeRows();
    rows[149] = component({
      id: 150,
      component_code: "LITF",
      family_code: "LIT",
      order_item_id: 999,
      order_number: "3999",
      color: "Gold",
    });
    rows[150] = component({
      id: 151,
      component_code: "LITB",
      family_code: "LIT",
      order_item_id: 999,
      order_number: "3999",
      color: "Gold",
    });
    await renderBatch(rows);

    fireEvent.click(screen.getByLabelText("Select component ASH 1"));
    expect(selectionCount()).toBe("1 of 220 items selected");

    virtualScrollTo(52 * 148);
    expect(screen.queryByLabelText("Select component ASH 1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select component LITF 150"));
    expect(selectionCount()).toBe("3 of 220 items selected");
    expect(screen.getByLabelText("Select component LITB 151")).toBeChecked();

    virtualScrollTo(0);
    expect(screen.getByLabelText("Select component ASH 1")).toBeChecked();
    expect(selectionCount()).toBe("3 of 220 items selected");
  });

  it("preserves selected IDs through color filtering and clearing the filter", async () => {
    await renderBatch([
      component({ id: 10, order_item_id: 10, color: "Gold" }),
      component({ id: 11, order_item_id: 11, color: "Silver" }),
      component({ id: 12, order_item_id: 12, color: "Gold" }),
    ]);

    fireEvent.click(screen.getByLabelText("Select component ASH 10"));
    expect(selectionCount()).toBe("1 of 3 items selected");
    fireEvent.click(screen.getByRole("button", { name: "Silver" }));
    expect(screen.queryByLabelText("Select component ASH 10")).not.toBeInTheDocument();
    expect(selectionCount()).toBe("1 of 3 items selected");
    fireEvent.click(screen.getByRole("button", { name: "All Colors" }));
    expect(screen.getByLabelText("Select component ASH 10")).toBeChecked();
    expect(selectionCount()).toBe("1 of 3 items selected");
  });
});
