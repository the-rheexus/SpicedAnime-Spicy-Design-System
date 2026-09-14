import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SandboxScreen } from "@/components/sandbox/SandboxScreen";
import {
  checkoutSandboxOrders,
  generateSandboxBatchPptx,
  getSandboxBatches,
  getSandboxSkus,
  resetSandboxData,
} from "@/lib/api";
import type { SandboxBatch, SandboxSku } from "@/lib/types";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getSandboxBatches: vi.fn(),
    getSandboxSkus: vi.fn(),
    checkoutSandboxOrders: vi.fn(),
    resetSandboxData: vi.fn(),
    generateSandboxBatchPptx: vi.fn(),
  };
});

const mockedGetSandboxBatches = vi.mocked(getSandboxBatches);
const mockedGetSandboxSkus = vi.mocked(getSandboxSkus);
const mockedCheckoutSandboxOrders = vi.mocked(checkoutSandboxOrders);
const mockedResetSandboxData = vi.mocked(resetSandboxData);
const mockedGenerateSandboxBatchPptx = vi.mocked(generateSandboxBatchPptx);

const SANDBOX_BATCH: SandboxBatch = {
  id: 42,
  production_group: "Ashtray",
  batch_number: 1,
  batch_label: "Ashtray #1",
  status: "Open",
  opened_at: "2026-08-21T00:00:00Z",
  generated_file_url: null,
  created_at: "2026-08-21T00:00:00Z",
  updated_at: "2026-08-21T00:00:00Z",
  item_count: 1,
  batch_items: [
    {
      id: 1,
      created_at: "2026-08-21T00:00:00Z",
      component: {
        id: 7,
        component_code: "ASH",
        family_code: "ASH",
        status: "Ready",
        order_number: "TEST-001",
        sku: "ASH-SBXASH1-SOLO",
        created_at: "2026-08-21T00:00:00Z",
        updated_at: "2026-08-21T00:00:00Z",
      },
    },
  ],
};

const SANDBOX_SKUS: SandboxSku[] = [
  { sku: "ASH-SBXASH1-SOLO", family_code: "ASH", design_code: "SBXASH1" },
  { sku: "ASH-SBXASH2-ASHGRD", family_code: "ASH", design_code: "SBXASH2" },
];

describe("SandboxScreen", () => {
  beforeEach(() => {
    mockedGetSandboxBatches.mockReset();
    mockedGetSandboxSkus.mockReset();
    mockedCheckoutSandboxOrders.mockReset();
    mockedResetSandboxData.mockReset();
    mockedGenerateSandboxBatchPptx.mockReset();

    mockedGetSandboxBatches.mockResolvedValue([SANDBOX_BATCH]);
    mockedGetSandboxSkus.mockResolvedValue(SANDBOX_SKUS);
    mockedCheckoutSandboxOrders.mockResolvedValue({
      order_groups_submitted: 1,
      orders_created: 1,
      order_numbers: ["TEST-005"],
      components_touched: 1,
    });
    mockedResetSandboxData.mockResolvedValue({
      orders_deleted: 14,
      components_deleted: 14,
      batches_deleted: 8,
    });
    mockedGenerateSandboxBatchPptx.mockResolvedValue({
      batch_id: 42,
      batch_status: "Open",
      task_id: "mock-task-id",
    });
  });

  it("renders sandbox batches and their test orders", async () => {
    render(<SandboxScreen />);

    expect(await screen.findAllByText("Ashtray #1")).toHaveLength(2);
    expect(screen.getByText("TEST-001")).toBeVisible();
    expect(screen.getAllByText("ASH-SBXASH1-SOLO").length).toBeGreaterThan(0);
  });

  it("loads the fixed sandbox SKU catalog for checkout", async () => {
    render(<SandboxScreen />);

    await waitFor(() => expect(mockedGetSandboxSkus).toHaveBeenCalledTimes(1));
    expect(await screen.findByLabelText("ASH-SBXASH1-SOLO")).toBeVisible();
    expect(await screen.findByLabelText("ASH-SBXASH2-ASHGRD")).toBeVisible();
  });

  it("requires confirmation before dispatching a reset, then refreshes the batch list", async () => {
    render(<SandboxScreen />);
    await screen.findAllByText("Ashtray #1");

    fireEvent.click(screen.getByRole("button", { name: "Reset sandbox data" }));

    const dialog = await screen.findByRole("dialog");
    expect(mockedResetSandboxData).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Reset" }));

    await waitFor(() => expect(mockedResetSandboxData).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByText(/Sandbox data reset: 14 order\(s\)/)).toBeVisible(),
    );
    expect(mockedGetSandboxBatches).toHaveBeenCalledTimes(2);
  });

  it("cancels the reset confirmation without mutating sandbox data", async () => {
    render(<SandboxScreen />);
    await screen.findAllByText("Ashtray #1");

    fireEvent.click(screen.getByRole("button", { name: "Reset sandbox data" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(mockedResetSandboxData).not.toHaveBeenCalled();
  });

  it("dispatches Generate PPTX for a sandbox batch", async () => {
    render(<SandboxScreen />);
    await screen.findAllByText("Ashtray #1");

    fireEvent.click(screen.getByRole("button", { name: "Generate PPTX" }));

    await waitFor(() => expect(mockedGenerateSandboxBatchPptx).toHaveBeenCalledWith(42));
  });

  it("checkout button is disabled until a quantity is entered", async () => {
    render(<SandboxScreen />);
    await screen.findByLabelText("ASH-SBXASH1-SOLO");

    expect(screen.getByRole("button", { name: "Checkout" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("ASH-SBXASH1-SOLO"), { target: { value: "2" } });

    expect(screen.getByRole("button", { name: "Checkout" })).toBeEnabled();
  });

  it("submits a checkout with the entered quantity and refreshes batches", async () => {
    render(<SandboxScreen />);
    await screen.findByLabelText("ASH-SBXASH1-SOLO");

    fireEvent.change(screen.getByLabelText("ASH-SBXASH1-SOLO"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    await waitFor(() =>
      expect(mockedCheckoutSandboxOrders).toHaveBeenCalledWith({
        order_groups: [{ "ASH-SBXASH1-SOLO": 3 }],
      }),
    );
    await waitFor(() =>
      expect(screen.getByText(/Sandbox checkout: 1 order\(s\) created \(TEST-005\)/)).toBeVisible(),
    );
  });

  it("quantity input clamps to the 0-10 range", async () => {
    render(<SandboxScreen />);
    await screen.findByLabelText("ASH-SBXASH1-SOLO");

    fireEvent.change(screen.getByLabelText("ASH-SBXASH1-SOLO"), { target: { value: "99" } });

    expect(screen.getByLabelText("ASH-SBXASH1-SOLO")).toHaveValue(10);
  });

  it("adding an order group is capped at 7", async () => {
    render(<SandboxScreen />);
    await screen.findByLabelText("ASH-SBXASH1-SOLO");

    const addButton = () => screen.getByRole("button", { name: /Add order group/ });
    for (let i = 0; i < 10; i += 1) {
      if (addButton().hasAttribute("disabled")) break;
      fireEvent.click(addButton());
    }

    expect(addButton()).toBeDisabled();
    expect(screen.getByText("Add order group (7/7)")).toBeVisible();
  });
});
