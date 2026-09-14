import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SkuManagerScreen } from "@/components/sku-manager/SkuManagerScreen";
import {
  acceptSkuProposal,
  exportSkusCsv,
  generateSkuProposals,
  getShopifyCatalog,
} from "@/lib/api";
import type { ShopifyCatalogRow } from "@/lib/types";

const { mockedPush, navigationState } = vi.hoisted(() => {
  const navigationState = { params: new URLSearchParams() };
  const mockedPush = vi.fn((href: string) => {
    navigationState.params = new URLSearchParams(href.split("?")[1] ?? "");
  });
  return { mockedPush, navigationState };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockedPush }),
  useSearchParams: () => navigationState.params,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getShopifyCatalog: vi.fn(),
    generateSkuProposals: vi.fn(),
    acceptSkuProposal: vi.fn(),
    exportSkusCsv: vi.fn(),
    patchSku: vi.fn(),
    retireSku: vi.fn(),
  };
});

const mockedGetShopifyCatalog = vi.mocked(getShopifyCatalog);
const mockedGenerateSkuProposals = vi.mocked(generateSkuProposals);
const mockedAcceptSkuProposal = vi.mocked(acceptSkuProposal);
const mockedExportSkusCsv = vi.mocked(exportSkusCsv);

const HAS_SKU_ROW: ShopifyCatalogRow = {
  product_id: 1,
  product_title: "Naruto Ashtray",
  product_type: "Ashtray",
  product_handle: "naruto-ashtray",
  product_status: "active",
  tags: "",
  variant_id: 101,
  option_values: ["Solo"],
  option_names: ["Bundle"],
  sku: "ASH-NARUTO-SOLO",
  has_sku: true,
  offer_sku: {
    id: 1,
    sku: "ASH-NARUTO-SOLO",
    family_code: "ASH",
    design: 1,
    design_code: "NARUTO",
    config_code: "SOLO",
    options: {},
    is_active: true,
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  },
};

const NO_SKU_ROW: ShopifyCatalogRow = {
  product_id: 2,
  product_title: "Bleach Wallet",
  product_type: "Wallet",
  product_handle: "bleach-wallet",
  product_status: "active",
  tags: "",
  variant_id: 201,
  option_values: ["Front + Back"],
  option_names: ["Bundle"],
  sku: "",
  has_sku: false,
  offer_sku: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  navigationState.params = new URLSearchParams();
  mockedGetShopifyCatalog.mockResolvedValue({
    count: 2,
    next: null,
    previous: null,
    results: [HAS_SKU_ROW, NO_SKU_ROW],
  });
});

describe("SkuManagerScreen", () => {
  it("renders catalog rows with SKU and no-SKU status", async () => {
    render(<SkuManagerScreen />);
    expect(await screen.findByText("Naruto Ashtray")).toBeInTheDocument();
    expect(screen.getByText("Bleach Wallet")).toBeInTheDocument();
    expect(screen.getByText("ASH-NARUTO-SOLO")).toBeInTheDocument();
    expect(screen.getAllByText("No SKU").length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: "Registry status" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Validation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Dictionary" })).not.toBeInTheDocument();
    expect(screen.queryByText("Missing in Shopify")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending CSV export")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create SKU/ })).toBeInTheDocument();
  });

  it("keeps product-name/canonical-SKU search distinct from exact product-type filtering", async () => {
    render(<SkuManagerScreen />);

    expect(await screen.findByLabelText("Search catalog")).toHaveAttribute(
      "placeholder",
      "Search product name or canonical SKU...",
    );
    expect(screen.getByText("Product name or canonical SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Product type")).toHaveAttribute(
      "placeholder",
      "Filter by exact product type...",
    );
    expect(screen.getByText("Exact Shopify product type")).toBeInTheDocument();
  });

  it("uses search and product_type together in URL state and catalog requests", async () => {
    navigationState.params = new URLSearchParams("page=3&has_sku=true");
    const { rerender } = render(<SkuManagerScreen />);
    await screen.findByText("Naruto Ashtray");

    fireEvent.change(screen.getByLabelText("Search catalog"), { target: { value: "naruto" } });
    expect(mockedPush).toHaveBeenLastCalledWith("/sku-manager?has_sku=true&search=naruto");

    rerender(<SkuManagerScreen />);
    fireEvent.change(screen.getByLabelText("Product type"), { target: { value: "Ashtray" } });
    expect(mockedPush).toHaveBeenLastCalledWith(
      "/sku-manager?has_sku=true&search=naruto&product_type=Ashtray",
    );

    rerender(<SkuManagerScreen />);
    await waitFor(() => expect(mockedGetShopifyCatalog).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 50,
      search: "naruto",
      product_type: "Ashtray",
      has_sku: true,
    }));
  });

  it("resets pagination when search or product type changes", async () => {
    navigationState.params = new URLSearchParams("page=4&search=naruto&product_type=Ashtray");
    const { rerender } = render(<SkuManagerScreen />);
    await screen.findByText("Naruto Ashtray");

    fireEvent.change(screen.getByLabelText("Search catalog"), { target: { value: "bleach" } });
    expect(mockedPush).toHaveBeenLastCalledWith("/sku-manager?search=bleach&product_type=Ashtray");

    rerender(<SkuManagerScreen />);
    fireEvent.change(screen.getByLabelText("Product type"), { target: { value: "Wallet" } });
    expect(mockedPush).toHaveBeenLastCalledWith("/sku-manager?search=bleach&product_type=Wallet");
  });

  it("P95 A7: a populated SKU never shows the No SKU badge even when has_sku is false", async () => {
    mockedGetShopifyCatalog.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          ...HAS_SKU_ROW,
          product_id: 9,
          product_title: "Atla Lighter",
          variant_id: 909,
          sku: "LIT-ATLAGANG-WHT-BIC-SOLO",
          has_sku: false,
          offer_sku: null,
        },
      ],
    });

    render(<SkuManagerScreen />);
    const skuCell = await screen.findByText("LIT-ATLAGANG-WHT-BIC-SOLO");
    const row = skuCell.closest("tr") as HTMLElement;
    expect(within(row).queryByText("No SKU")).not.toBeInTheDocument();
    expect(within(row).getByText("Active")).toBeInTheDocument();
  });

  it("generates and accepts a proposal for a selected no-SKU row", async () => {
    mockedGenerateSkuProposals.mockResolvedValue({
      proposals: [
        {
          variant_id: 201,
          family_code: "WAL",
          design_code: "BLEACH",
          design_is_new: true,
          proposed_skus: [{ sku: "WAL-BLEACH-WALFB", is_duplicate: false }],
          options: {},
          placeholders: [],
          warnings: [],
          errors: [],
          excluded: false,
          skipped_no_family: false,
          is_approvable: true,
        },
      ],
    });
    mockedAcceptSkuProposal.mockResolvedValue({
      id: 2,
      sku: "WAL-BLEACH-WALFB",
      family_code: "WAL",
      design: 2,
      design_code: "BLEACH",
      config_code: "WALFB",
      options: {},
      is_active: true,
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:00:00Z",
    });

    render(<SkuManagerScreen />);
    await screen.findByText("Bleach Wallet");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Bleach Wallet" }));
    fireEvent.click(screen.getByRole("button", { name: /Create SKU/ }));

    await waitFor(() => expect(mockedGenerateSkuProposals).toHaveBeenCalledWith([
      expect.objectContaining({
        variant_id: 201,
        product_handle: "bleach-wallet",
        option_names: ["Bundle"],
      }),
    ]));

    expect(await screen.findByText("WAL-BLEACH-WALFB")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    await waitFor(() => expect(mockedAcceptSkuProposal).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: "WAL-BLEACH-WALFB",
        product_handle: "bleach-wallet",
        option_names: ["Bundle"],
      }),
    ));
  });

  it("blocks accepting a placeholder-flagged proposal", async () => {
    mockedGenerateSkuProposals.mockResolvedValue({
      proposals: [
        {
          variant_id: 201,
          family_code: "WAL",
          design_code: "BLEACH",
          design_is_new: true,
          proposed_skus: [{ sku: "WAL-BLEACH-CONFIG", is_duplicate: false }],
          options: {},
          placeholders: ["CONFIG"],
          warnings: [],
          errors: ["Unrecognized or absent Wallet bundle option."],
          excluded: false,
          skipped_no_family: false,
          is_approvable: false,
        },
      ],
    });

    render(<SkuManagerScreen />);
    await screen.findByText("Bleach Wallet");
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Bleach Wallet" }));
    fireEvent.click(screen.getByRole("button", { name: /Create SKU/ }));

    await screen.findByText("WAL-BLEACH-CONFIG");
    expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled();
  });

  it("exports the pending CSV", async () => {
    render(<SkuManagerScreen />);
    await screen.findByText("Naruto Ashtray");
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    await waitFor(() => expect(mockedExportSkusCsv).toHaveBeenCalled());
  });
});
