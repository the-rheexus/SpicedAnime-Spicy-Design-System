import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NeedsAttentionScreen } from "@/components/needs-attention/NeedsAttentionScreen";
import { acceptSkuProposal, bulkReimportOrders, generateSkuProposals, getNeedsAttention, getShopifyCatalog } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getNeedsAttention: vi.fn(), getShopifyCatalog: vi.fn(), generateSkuProposals: vi.fn(), acceptSkuProposal: vi.fn(), bulkReimportOrders: vi.fn() };
});

const mockedNeedsAttention = vi.mocked(getNeedsAttention);
const mockedCatalog = vi.mocked(getShopifyCatalog);
const mockedGenerate = vi.mocked(generateSkuProposals);
const mockedAccept = vi.mocked(acceptSkuProposal);
const mockedBulkReimport = vi.mocked(bulkReimportOrders);

const response = {
  errors: [], deferred: [], webhook_failures: [], badge_count: 1,
  errors_pagination: { count: 0, page: 1, page_size: 25, total_pages: 0, next: null, previous: null },
  deferred_pagination: { count: 0, page: 1, page_size: 25, total_pages: 0, next: null, previous: null },
  no_sku_pagination: { count: 1, page: 1, page_size: 25, total_pages: 1, next: null, previous: null },
  no_sku: [{ id: 10, order_item_id: 10, order_id: 7, order_number: "#1007", product_name: "Bleach Wallet", variant_options: "Front + Back", shopify_product_id: "2", shopify_variant_id: "201", created_at: "2026-08-25T00:00:00Z", updated_at: "2026-08-25T00:00:00Z" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedNeedsAttention.mockResolvedValue(response);
  mockedCatalog.mockResolvedValue({ count: 1, next: null, previous: null, results: [{ product_id: 2, product_title: "Bleach Wallet", product_type: "Wallet", product_handle: "bleach-wallet", variant_id: 201, option_values: ["Front + Back"], option_names: ["Bundle"], sku: "", has_sku: false, offer_sku: null }] });
  mockedGenerate.mockResolvedValue({ proposals: [{ variant_id: 201, family_code: "WAL", design_code: "BLEACH", design_is_new: true, proposed_skus: [{ sku: "WAL-BLEACH-WALFB", is_duplicate: false }], options: {}, option_names: ["Bundle"], placeholders: [], warnings: [], errors: [], excluded: false, skipped_no_family: false, is_approvable: true }] });
  mockedAccept.mockResolvedValue({ id: 1, sku: "WAL-BLEACH-WALFB", family_code: "WAL", design: 1, design_code: "BLEACH", config_code: "WALFB", is_active: true, created_at: "2026-08-25T00:00:00Z", updated_at: "2026-08-25T00:00:00Z" });
  mockedBulkReimport.mockResolvedValue({ requested_order_ids: [7], order_ids: [7], results: [] });
});

async function selectQueue(name: RegExp) {
  fireEvent.click(await screen.findByRole("tab", { name }));
}

describe("NeedsAttentionScreen no-SKU funnel", () => {
  it("uses the black-on-spice text token for the selected queue", async () => {
    render(<NeedsAttentionScreen />);

    for (const name of [/^Blocked/, /^Missing SKU/, /^Deferred/, /^Webhook Failures/]) {
      const tab = await screen.findByRole("tab", { name });
      fireEvent.click(tab);
      expect(tab).toHaveAttribute("aria-selected", "true");
      expect(tab).toHaveStyle({ color: "var(--text-on-spice)" });
    }
  });

  it("groups one order-item issue across component records and keeps diagnostics expandable", async () => {
    const base = {
      status: "Blocked" as const,
      family_code: "GRS",
      order_id: 8,
      order_item_id: 88,
      order_number: "#2854",
      sku: "GRS-LAND-GRDSET",
      validation_failure_code: "MISSING_SERIES_METAFIELD",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    };
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      errors: [
        { ...base, id: 31, component_code: "GRD" },
        { ...base, id: 32, component_code: "JAR" },
        { ...base, id: 33, component_code: "TRY" },
      ],
      errors_pagination: { count: 3, page: 1, page_size: 25, total_pages: 1, next: null, previous: null },
    });

    render(<NeedsAttentionScreen />);

    expect(await screen.findByText("GRD, JAR, TRY")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.queryByRole("columnheader", { name: "Status" })).not.toBeInTheDocument();
    expect(screen.getByText("Set Series in Shopify and re-import.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Technical details"));
    expect(screen.getByText("31, 32, 33")).toBeInTheDocument();
  });

  it("collects all blocked API pages before grouping an issue", async () => {
    const base = {
      status: "Blocked" as const,
      family_code: "LIT",
      order_id: 9,
      order_item_id: 99,
      order_number: "#3119",
      sku: "LIT-HIE12-WHT-TOR-SOLO",
      validation_failure_code: "MISSING_ARTWORK",
      expected_file_path: "SpicedAnime/artwork/Flip Lighter/HIE12.png",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    };
    mockedNeedsAttention
      .mockResolvedValueOnce({
        ...response,
        errors: [{ ...base, id: 41, component_code: "LITF" }],
        errors_pagination: { count: 2, page: 1, page_size: 1, total_pages: 2, next: 2, previous: null },
      })
      .mockResolvedValueOnce({
        ...response,
        errors: [{ ...base, id: 42, component_code: "LITB" }],
        errors_pagination: { count: 2, page: 2, page_size: 1, total_pages: 2, next: null, previous: 1 },
      });

    render(<NeedsAttentionScreen />);

    expect(await screen.findByText("Front + Back")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(mockedNeedsAttention).toHaveBeenCalledTimes(2);
  });


  it("uses SOT short labels with raw validation codes as secondary detail", async () => {
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      errors: [{
        id: 22,
        status: "Blocked",
        component_code: "ASH",
        family_code: "ASH",
        order_number: "#1022",
        validation_failure_code: "UNKNOWN_CONFIG",
        created_at: "2026-09-01T00:00:00Z",
        updated_at: "2026-09-01T00:00:00Z",
      }],
      errors_pagination: { count: 1, page: 1, page_size: 25, total_pages: 1, next: null, previous: null },
    });

    render(<NeedsAttentionScreen />);
    expect(await screen.findByText("Invalid config for family")).toBeInTheDocument();
    expect(screen.getByText("UNKNOWN_CONFIG")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^Missing SKU/ })).toBeInTheDocument();
  });

  it("renders deferred rows read-only with a concise reason", async () => {
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      deferred: [{
        id: 23,
        status: "Deferred MVP",
        component_code: "GRD",
        family_code: "GRD",
        order_number: "#1023",
        validation_failure_code: "FAMILY_DEFERRED_MVP",
        created_at: "2026-09-01T00:00:00Z",
        updated_at: "2026-09-01T00:00:00Z",
      }],
      deferred_pagination: { count: 1, page: 1, page_size: 25, total_pages: 1, next: null, previous: null },
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Deferred/);
    expect(await screen.findByText("Product family held for Deferred MVP.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Review|Resume|Decide/ })).not.toBeInTheDocument();
  });

  it("renders supplied webhook failures as a read-only section", async () => {
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      webhook_failures: [{
        id: 24,
        topic: "orders/fulfilled",
        webhook_delivery_id: "delivery-24",
        order_number: "#1024",
        received_at: "2026-09-01T00:00:00Z",
        outcome: "Failed",
        state_mutated: false,
        failure_summary: "orders/fulfilled:ValueError",
      }],
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Webhook Failures/);
    expect(await screen.findByRole("heading", { name: "WEBHOOK PROCESSING FAILURES" })).toBeInTheDocument();
    expect(screen.getByText("delivery-24")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Retry|Resolve/ })).not.toBeInTheDocument();
  });

  it("lists a no-SKU row and preserves full CSV linkage through generation and acceptance", async () => {
    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    expect(await screen.findByText("Bleach Wallet")).toBeInTheDocument();
    expect(screen.getByText("Front + Back")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate SKU" }));
    await waitFor(() => expect(mockedGenerate).toHaveBeenCalledWith([expect.objectContaining({ option_names: ["Bundle"] })]));
    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));
    await waitFor(() => expect(mockedAccept).toHaveBeenCalledWith(expect.objectContaining({ product_handle: "bleach-wallet", product_title: "Bleach Wallet", option_values: ["Front + Back"], option_names: ["Bundle"] })));
  });

  it("directs an already-updated Shopify variant to the existing reimport action", async () => {
    mockedCatalog.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{
        product_id: 2,
        product_title: "Bleach Wallet",
        product_type: "Wallet",
        product_handle: "bleach-wallet",
        variant_id: 201,
        option_values: ["Front + Back"],
        option_names: ["Bundle"],
        sku: "WAL-BLEACH-WALFB",
        has_sku: true,
        offer_sku: {
          id: 1,
          sku: "WAL-BLEACH-WALFB",
          family_code: "WAL",
          design: 1,
          design_code: "BLEACH",
          config_code: "WALFB",
          is_active: true,
          created_at: "2026-08-25T00:00:00Z",
          updated_at: "2026-08-25T00:00:00Z",
        },
      }],
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("button", { name: "Generate SKU" }));

    expect(await screen.findByText(/already present in Shopify and the SKU dictionary/)).toBeInTheDocument();
    expect(mockedGenerate).not.toHaveBeenCalled();
    expect(mockedAccept).not.toHaveBeenCalled();
  });

  it("directs to reimport when the generated SKU already exists (all candidates duplicate)", async () => {
    mockedGenerate.mockResolvedValue({ proposals: [{ variant_id: 201, family_code: "WAL", design_code: "BLEACH", design_is_new: false, proposed_skus: [{ sku: "WAL-BLEACH-WALFB", is_duplicate: true }], options: {}, option_names: ["Bundle"], placeholders: [], warnings: [], errors: [], excluded: false, skipped_no_family: false, is_approvable: false }] });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("button", { name: "Generate SKU" }));

    expect(await screen.findByText(/already exists in the SKU dictionary/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
    expect(mockedAccept).not.toHaveBeenCalled();
  });

  it("still generates from the order item when the variant is not in the live catalog", async () => {
    mockedCatalog.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("button", { name: "Generate SKU" }));

    await waitFor(() => expect(mockedGenerate).toHaveBeenCalledWith([
      expect.objectContaining({ product_title: "Bleach Wallet", option_values: ["Front + Back"] }),
    ]));
    expect(await screen.findByRole("button", { name: "Accept" })).toBeInTheDocument();
  });

  it("still generates for a legacy item with no captured Shopify variant, without hitting the catalog", async () => {
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      no_sku: [{ ...response.no_sku[0], shopify_product_id: null, shopify_variant_id: null }],
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("button", { name: "Generate SKU" }));

    await waitFor(() => expect(mockedGenerate).toHaveBeenCalledWith([
      expect.objectContaining({ product_title: "Bleach Wallet", variant_id: "" }),
    ]));
    expect(mockedCatalog).not.toHaveBeenCalled();
  });

  it("shows a visible terminal message when the line item has no variant and no product name", async () => {
    mockedNeedsAttention.mockResolvedValue({
      ...response,
      no_sku: [{ ...response.no_sku[0], shopify_variant_id: null, product_name: "" }],
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("button", { name: "Generate SKU" }));

    expect(await screen.findByText(/neither a Shopify variant reference nor a recorded product name/)).toBeInTheDocument();
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("selects the current page with indeterminate state and reviews a correlated bulk set", async () => {
    const items = [
      response.no_sku[0],
      { ...response.no_sku[0], id: 11, order_item_id: 11, product_name: "Naruto Ashtray", shopify_variant_id: "202" },
      { ...response.no_sku[0], id: 12, order_item_id: 12, order_id: 8, order_number: "#1008", product_name: "Sailor Moon Ashtray", shopify_variant_id: "203" },
    ];
    mockedNeedsAttention.mockResolvedValue({ ...response, no_sku: items, badge_count: 3, no_sku_pagination: { ...response.no_sku_pagination, count: 3 } });
    mockedCatalog.mockRejectedValue(new Error("catalog unavailable"));
    mockedGenerate.mockImplementation(async (descriptors) => ({ proposals: descriptors.map((descriptor, index) => ({
      client_key: descriptor.client_key,
      variant_id: descriptor.variant_id,
      family_code: index === 0 ? "WAL" : "ASH",
      design_code: `DESIGN${index}`,
      design_is_new: true,
      proposed_skus: [{ sku: index === 0 ? "WAL-DESIGN0-WALFB" : `ASH-DESIGN${index}-SOLO`, is_duplicate: false }],
      options: {}, option_names: [], placeholders: [], warnings: [], errors: [], excluded: false, skipped_no_family: false, is_approvable: true,
    })) }));
    mockedBulkReimport.mockResolvedValue({
      requested_order_ids: [7, 8], order_ids: [7, 8], results: [
        { order_id: 7, order_number: "#1007", outcome: "succeeded", items_processed: 2, components_created: 2, remaining_missing_sku_items: 0, failure_code: null, message: "Order reimport completed locally." },
        { order_id: 8, order_number: "#1008", outcome: "failed", items_processed: 0, components_created: 0, remaining_missing_sku_items: 1, failure_code: "REIMPORT_FAILED", message: "Order reimport could not be completed." },
      ],
    });

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    const selectAll = await screen.findByRole("checkbox", { name: /Select all selectable Missing SKU items/ });
    fireEvent.click(selectAll);
    expect(screen.getByText("3 Missing SKU items selected")).toBeInTheDocument();
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /^Select Missing SKU item/ });
    fireEvent.click(rowCheckboxes[0]);
    expect((selectAll as HTMLInputElement).indeterminate).toBe(true);
    fireEvent.click(rowCheckboxes[0]);

    fireEvent.click(screen.getByRole("button", { name: "Generate proposals for selected items" }));
    await waitFor(() => expect(mockedGenerate).toHaveBeenCalledTimes(1));
    expect(mockedGenerate.mock.calls[0][0]).toHaveLength(3);
    expect(mockedGenerate.mock.calls[0][0]).toEqual(expect.arrayContaining([
      expect.objectContaining({ client_key: "order-item:10", product_title: "Bleach Wallet", option_values: ["Front + Back"] }),
      expect.objectContaining({ client_key: "order-item:12", product_title: "Sailor Moon Ashtray" }),
    ]));
    expect(await screen.findByRole("heading", { name: "Bulk proposal review" })).toBeInTheDocument();
    expect(screen.getAllByText(/Review decision:/)).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Approve All approvable pending" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Reject" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Submit reviewed decisions" }));
    await waitFor(() => expect(mockedAccept).toHaveBeenCalledTimes(2));
    expect(mockedAccept).not.toHaveBeenCalledWith(expect.objectContaining({ sku: "ASH-DESIGN1-SOLO" }));
    expect(screen.getByText(/2 proposals approved successfully across 2 distinct orders/)).toBeInTheDocument();
    expect(screen.getByText(/Proposal rejected by operator; nothing was saved/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bulk reimport 2 affected orders" }));
    await waitFor(() => expect(mockedBulkReimport).toHaveBeenCalledWith([7, 8]));
    expect(await screen.findByText(/Order #1007: Order reimport succeeded/)).toBeInTheDocument();
    expect(screen.getByText(/Order #1008: Order reimport failed/)).toBeInTheDocument();
    expect(screen.getByText(/Order remained unresolved after reimport/)).toBeInTheDocument();
    expect(screen.getByText(/import it manually into Shopify/)).toBeInTheDocument();
  });

  it("keeps acceptance failures independent and reimports only successful approvals", async () => {
    const items = [response.no_sku[0], { ...response.no_sku[0], id: 12, order_item_id: 12, order_id: 8, order_number: "#1008", shopify_variant_id: "203" }];
    mockedNeedsAttention.mockResolvedValue({ ...response, no_sku: items, no_sku_pagination: { ...response.no_sku_pagination, count: 2 } });
    mockedGenerate.mockImplementation(async (descriptors) => ({ proposals: descriptors.map((descriptor, index) => ({
      client_key: descriptor.client_key, variant_id: descriptor.variant_id, family_code: "WAL", design_code: `OK${index}`, design_is_new: true,
      proposed_skus: [{ sku: `WAL-OK${index}-WALFB`, is_duplicate: false }], options: {}, placeholders: [], warnings: [], errors: [], excluded: false, skipped_no_family: false, is_approvable: true,
    })) }));
    mockedAccept.mockResolvedValueOnce({ id: 1, sku: "WAL-OK0-WALFB", family_code: "WAL", design: 1, design_code: "OK0", config_code: "WALFB", is_active: true, created_at: "x", updated_at: "x" }).mockRejectedValueOnce(new Error("Duplicate SKU"));

    render(<NeedsAttentionScreen />);
    await selectQueue(/^Missing SKU/);
    fireEvent.click(await screen.findByRole("checkbox", { name: /Select all selectable/ }));
    fireEvent.click(screen.getByRole("button", { name: "Generate proposals for selected items" }));
    await screen.findByRole("heading", { name: "Bulk proposal review" });
    fireEvent.click(screen.getByRole("button", { name: "Approve All approvable pending" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit reviewed decisions" }));
    await waitFor(() => expect(mockedAccept).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/accepted — Canonical SKU accepted locally/)).toBeInTheDocument();
    expect(screen.getByText(/failed — Duplicate SKU/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulk reimport 1 affected orders" })).toBeInTheDocument();
  });
});
