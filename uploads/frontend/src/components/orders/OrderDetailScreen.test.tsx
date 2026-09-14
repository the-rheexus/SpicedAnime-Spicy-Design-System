import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderDetailScreen } from "@/components/orders/OrderDetailScreen";
import { flagComponentReprint, getArtworkThumbnailBlob, getOrder, getOrderHistory } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getArtworkThumbnailBlob: vi.fn(),
    getOrder: vi.fn(),
    getOrderHistory: vi.fn(),
    flagComponentReprint: vi.fn(),
    reimportOrder: vi.fn(),
  };
});

const mockedGetOrder = vi.mocked(getOrder);
const mockedGetOrderHistory = vi.mocked(getOrderHistory);
const mockedFlagComponentReprint = vi.mocked(flagComponentReprint);
const mockedGetArtworkThumbnailBlob = vi.mocked(getArtworkThumbnailBlob);

// The screen persists the active tab to the URL; reset it so tab state does not
// leak between tests.
beforeEach(() => {
  window.history.replaceState({}, "", "/");
  mockedGetOrderHistory.mockReset();
  mockedGetOrderHistory.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
  mockedGetArtworkThumbnailBlob.mockReset();
  mockedGetArtworkThumbnailBlob.mockResolvedValue(new Blob(["png-bytes"], { type: "image/png" }));
  vi.stubGlobal("URL", Object.assign(class extends URL {}, {
    createObjectURL: vi.fn(() => "blob:mock-order-thumbnail"),
    revokeObjectURL: vi.fn(),
  }));
});

function order(): OrderDetail {
  return {
    id: 7, shopify_order_id: "shopify-7", order_number: "#1007", sales_channel: "Shopify",
    financial_status: "paid", fulfillment_status: null, status: "In Production",
    shopify_created_at: "2026-07-21T00:00:00Z", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z",
    customer_email: "operator@example.test", shipping_address: {},
    items: [{
      id: 1, shopify_line_item_id: "line-1", sku: "ASH-TEST-SOLO", product_name: "Ashtray", quantity: 1,
      created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z",
      components: [
        { id: 41, component_code: "ASH", family_code: "ASH", status: "Printed", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
        { id: 42, component_code: "ASH", family_code: "ASH", status: "Queued", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
      ],
    }],
  };
}

describe("OrderDetailScreen component reprint", () => {
  beforeEach(() => {
    mockedGetOrder.mockReset();
    mockedFlagComponentReprint.mockReset();
    mockedGetOrder.mockResolvedValue(order());
  });

  it("shows recovery only for Printed components, supports cancellation, prevents duplicate dispatch, and refreshes", async () => {
    let resolveReprint: (() => void) | undefined;
    mockedFlagComponentReprint.mockImplementation(() => new Promise((resolve) => { resolveReprint = () => resolve({
      original_component_id: 41, original_component_status: "Reprint Needed", replacement_component_id: 43,
      replacement_component_status: "Queued", replacement_batch_id: 2, replacement_batch_status: "Open", batch_group: "Ashtray",
    }); }));
    render(<OrderDetailScreen orderId="7" />);

    const buttons = await screen.findAllByRole("button", { name: "Flag Reprint" });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockedFlagComponentReprint).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Flag Reprint" }));
    const confirms = screen.getAllByRole("button", { name: "Flag Reprint" });
    fireEvent.click(confirms[confirms.length - 1]);
    fireEvent.click(confirms[confirms.length - 1]);
    expect(mockedFlagComponentReprint).toHaveBeenCalledTimes(1);
    resolveReprint?.();
    await waitFor(() => expect(mockedGetOrder).toHaveBeenCalledTimes(2));
  });
});

describe("OrderDetailScreen component status display", () => {
  beforeEach(() => {
    mockedGetOrder.mockReset();
  });

  it('shows a Canceled production component as "Print Not Needed" while the Canceled order still shows "Canceled"', async () => {
    const canceledOrder = order();
    canceledOrder.status = "Canceled";
    canceledOrder.items[0].components = [
      { id: 44, component_code: "ASH", family_code: "ASH", status: "Canceled", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
    ];
    mockedGetOrder.mockResolvedValue(canceledOrder);

    render(<OrderDetailScreen orderId="7" />);

    // The component row and its Component status-key legend entry both say
    // "Print Not Needed"; the order-level "Canceled" badge (header) and the
    // Order status-key legend entry both still say "Canceled".
    expect(await screen.findAllByText("Print Not Needed")).toHaveLength(2);
    expect(screen.getAllByText("Canceled")).toHaveLength(2);
  });

  it('renders "In Production (Needs Reprint)" in Order Detail and its status key', async () => {
    const needsReprintOrder = order();
    needsReprintOrder.status = "In Production (Needs Reprint)";
    mockedGetOrder.mockResolvedValue(needsReprintOrder);

    render(<OrderDetailScreen orderId="7" />);

    expect(await screen.findAllByText("In Production (Needs Reprint)")).toHaveLength(2);
  });
});

describe("OrderDetailScreen section separation and batch links", () => {
  beforeEach(() => {
    mockedGetOrder.mockReset();
  });

  it("does not expose the customer name on Order Detail", async () => {
    mockedGetOrder.mockResolvedValue(order());
    render(<OrderDetailScreen orderId="7" />);

    await screen.findByText("ORDER #1007");
    expect(screen.queryByText("Customer")).not.toBeInTheDocument();
    expect(screen.queryByText("Operator")).not.toBeInTheDocument();
  });

  it("shows a cohesive four-card summary, omits Sales Channel, and keeps financial and fulfillment values as plain text", async () => {
    mockedGetOrder.mockResolvedValue(order());
    render(<OrderDetailScreen orderId="7" />);

    await screen.findByText("ORDER #1007");
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
    expect(screen.getByText("Order Date")).toBeInTheDocument();
    expect(screen.getByText("# of Items")).toBeInTheDocument();
    expect(screen.getByText("# of Components")).toBeInTheDocument();
    expect(screen.getByText("Financial Status")).toBeInTheDocument();
    expect(screen.getByText("Fulfillment Status")).toBeInTheDocument();
    expect(screen.getByText("paid").tagName).toBe("DD");
    expect(screen.getByText("Unfulfilled").tagName).toBe("DD");
    expect(screen.getByLabelText("Order summary").querySelectorAll("[data-summary-icon]")).toHaveLength(4);
    expect(screen.queryByText("Sales Channel")).not.toBeInTheDocument();
    expect(screen.queryByText("Shopify")).not.toBeInTheDocument();
  });

  it("lists a non-produced-family item in its own section, separate from produced items", async () => {
    const mixedOrder = order();
    mixedOrder.items = [
      ...mixedOrder.items,
      {
        id: 2, shopify_line_item_id: "line-2", sku: "BAT-TEST", product_name: "Black Art Tapestry",
        quantity: 1, family_code: "BAT", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z",
      },
    ];
    mockedGetOrder.mockResolvedValue(mixedOrder);

    render(<OrderDetailScreen orderId="7" />);

    expect(await screen.findByText("NON-PRODUCED ITEMS")).toBeInTheDocument();
    // The BAT SKU renders through SegmentedSku (family segment "BAT"); assert on
    // the product name, which is unique to the non-produced row.
    expect(screen.getByText("Black Art Tapestry")).toBeInTheDocument();
    expect(screen.getByText("Order Items")).toBeInTheDocument();
    expect(screen.getByText("ASH-TEST-SOLO")).toBeInTheDocument();
  });

  it("lists a Deferred MVP component in its own section, separate from Production Components", async () => {
    const deferredOrder = order();
    deferredOrder.items[0].components = [
      { id: 45, component_code: "GRD", family_code: "GRD", status: "Deferred MVP", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
    ];
    mockedGetOrder.mockResolvedValue(deferredOrder);

    render(<OrderDetailScreen orderId="7" />);

    expect(await screen.findByText("DEFERRED ITEMS")).toBeInTheDocument();
    expect(screen.getByText("No production components")).toBeInTheDocument();
  });

  it("renders the four Decision #91 tabs", async () => {
    mockedGetOrder.mockResolvedValue(order());
    render(<OrderDetailScreen orderId="7" />);
    await screen.findByRole("tab", { name: "Production" });
    expect(screen.getByRole("tab", { name: "Order items" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Files and reprints" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
  });

  it("shows a friendly validation label with the raw code as secondary detail", async () => {
    const blockedOrder = order();
    blockedOrder.items[0].components = [
      {
        id: 50, component_code: "LITF", family_code: "LIT", status: "Blocked",
        validation_failure_code: "MISSING_ARTWORK",
        created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z",
      },
    ];
    mockedGetOrder.mockResolvedValue(blockedOrder);
    render(<OrderDetailScreen orderId="7" />);
    expect(await screen.findByText("Missing artwork")).toBeInTheDocument();
    expect(screen.getByText("MISSING_ARTWORK")).toBeInTheDocument();
  });

  it("marks LITF/LITB rows with the PAIR bracket label", async () => {
    const pairOrder = order();
    pairOrder.items[0].components = [
      { id: 61, component_code: "LITF", family_code: "LIT", status: "Ready", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
      { id: 62, component_code: "LITB", family_code: "LIT", status: "Ready", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
    ];
    mockedGetOrder.mockResolvedValue(pairOrder);
    render(<OrderDetailScreen orderId="7" />);
    expect(await screen.findAllByText("Pair")).toHaveLength(2);
  });

  it("shows reprint records as 'Awaiting batch' and never 'Open'", async () => {
    const reprintOrder = order();
    reprintOrder.items[0].components = [
      { id: 71, order_item_id: 1, component_code: "WALF", family_code: "WAL", status: "Reprint Needed", batch_id: 3, created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
      { id: 72, order_item_id: 1, component_code: "WALF", family_code: "WAL", status: "Queued", created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" },
    ];
    mockedGetOrder.mockResolvedValue(reprintOrder);
    render(<OrderDetailScreen orderId="7" />);
    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));
    expect(await screen.findByText("Awaiting batch")).toBeInTheDocument();
    expect(screen.queryByText("Open")).not.toBeInTheDocument();
    expect(screen.queryByText(/reason/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /assign batch/i })).not.toBeInTheDocument();
  });

  it("renders source artwork through the authenticated thumbnail proxy and retains source/Drive links", async () => {
    const filesOrder = order();
    filesOrder.items[0].components![0].artwork = {
      id: 301,
      component_code: "ASH",
      design_code: "TEST",
      status: "Available",
      source_file_path: "artwork/Ashtray/TEST.png",
      drive_share_url: "https://drive.example.test/source",
      thumbnail_url: "/api/artwork/301/thumbnail/",
    };
    filesOrder.generated_files = [
      {
        id: 401, file_type: "PPTX", file_name: "Ashtray #2.pptx",
        drive_share_url: "https://drive.example.test/generated",
        created_at: "2026-07-22T00:00:00Z", batch_id: 9, batch_label: "Ashtray #2",
      },
      {
        id: 402, file_type: "PPTX", file_name: "Unavailable.pptx",
        drive_share_url: null,
        created_at: "2026-07-21T00:00:00Z", batch_id: 10, batch_label: "Ashtray #3",
      },
    ];
    mockedGetOrder.mockResolvedValue(filesOrder);
    let resolveThumbnail: ((blob: Blob) => void) | undefined;
    mockedGetArtworkThumbnailBlob.mockImplementationOnce(() => new Promise((resolve) => {
      resolveThumbnail = resolve;
    }));
    render(<OrderDetailScreen orderId="7" />);

    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading thumbnail…");
    resolveThumbnail?.(new Blob(["png-bytes"], { type: "image/png" }));
    const thumbnail = await screen.findByAltText("Artwork TEST for ASH");
    expect(mockedGetArtworkThumbnailBlob).toHaveBeenCalledWith(301);
    expect(thumbnail).toHaveAttribute("src", "blob:mock-order-thumbnail");
    expect(screen.getByText("artwork/Ashtray/TEST.png")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open source artwork in Drive" })).toHaveAttribute("href", "https://drive.example.test/source");
    expect(screen.getByRole("link", { name: "Open in Drive" })).toHaveAttribute("href", "https://drive.example.test/generated");
    expect(screen.getByRole("link", { name: "Ashtray #2" })).toHaveAttribute("href", "/batches/9");
    expect(screen.getByText("No Drive link available")).toBeInTheDocument();
    expect(screen.queryByText(/Source artwork for this order/i)).not.toBeInTheDocument();

    fireEvent.error(thumbnail);
    expect(await screen.findByText("Thumbnail unavailable")).toBeInTheDocument();
  });

  it("revokes the authenticated thumbnail object URL when Order Detail unmounts", async () => {
    const filesOrder = order();
    filesOrder.items[0].components![0].artwork = {
      id: 301, component_code: "ASH", design_code: "TEST", status: "Available",
      source_file_path: "artwork/Ashtray/TEST.png", drive_share_url: null,
      thumbnail_url: "/api/artwork/301/thumbnail/",
    };
    mockedGetOrder.mockResolvedValue(filesOrder);
    const view = render(<OrderDetailScreen orderId="7" />);

    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));
    await screen.findByAltText("Artwork TEST for ASH");
    view.unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-order-thumbnail");
  });

  it("shows Thumbnail unavailable when the authenticated proxy returns an error or an empty Blob", async () => {
    const filesOrder = order();
    filesOrder.items[0].components![0].artwork = {
      id: 301, component_code: "ASH", design_code: "TEST", status: "Available",
      source_file_path: "artwork/Ashtray/TEST.png", drive_share_url: "https://drive.example.test/source",
      thumbnail_url: "/api/artwork/301/thumbnail/",
    };
    mockedGetOrder.mockResolvedValue(filesOrder);
    mockedGetArtworkThumbnailBlob.mockRejectedValueOnce(new Error("Thumbnail proxy unavailable"));
    const firstView = render(<OrderDetailScreen orderId="7" />);

    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));
    expect(await screen.findByText("Thumbnail unavailable")).toBeInTheDocument();
    expect(screen.getByText("artwork/Ashtray/TEST.png")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open source artwork in Drive" })).toHaveAttribute("href", "https://drive.example.test/source");

    firstView.unmount();
    mockedGetArtworkThumbnailBlob.mockResolvedValueOnce(new Blob());
    render(<OrderDetailScreen orderId="7" />);
    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));
    expect(await screen.findByText("Thumbnail unavailable")).toBeInTheDocument();
  });

  it("shows clear source-artwork and generated-file empty states", async () => {
    mockedGetOrder.mockResolvedValue(order());
    render(<OrderDetailScreen orderId="7" />);
    fireEvent.click(await screen.findByRole("tab", { name: "Files and reprints" }));

    expect(await screen.findByText("No source artwork is known for this order.")).toBeInTheDocument();
    expect(screen.getByText("No generated files are known for this order.")).toBeInTheDocument();
  });

  it("links an assigned batch ID to /batches/{id}", async () => {
    const batchedOrder = order();
    batchedOrder.items[0].components![0].batch_id = 9;
    mockedGetOrder.mockResolvedValue(batchedOrder);

    render(<OrderDetailScreen orderId="7" />);

    const link = await screen.findByRole("link", { name: "#9" });
    expect(link).toHaveAttribute("href", "/batches/9");
  });
});

describe("OrderDetailScreen aggregated history", () => {
  beforeEach(() => {
    mockedGetOrder.mockReset();
    mockedGetOrder.mockResolvedValue(order());
  });

  it("lazily uses the order-history endpoint and renders combined events in returned order", async () => {
    mockedGetOrderHistory.mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: [
        { id: 3, actor_type: "operator", actor_label: "Operator", action: "batch_marked_printed", entity_type: "ProductionBatch", entity_id: "9", entity_label: "Batch #2", created_at: "2026-07-23T00:00:00Z" },
        { id: 2, actor_type: "system", actor_label: "System", action: "component_touched", entity_type: "ProductionComponent", entity_id: "41", entity_label: "ASH component · TEST", created_at: "2026-07-22T00:00:00Z" },
        { id: 1, actor_type: "system", actor_label: "System", action: "order_imported", entity_type: "Order", entity_id: "7", entity_label: "Order #1007", created_at: "2026-07-21T00:00:00Z" },
      ],
    });
    render(<OrderDetailScreen orderId="7" />);

    await screen.findByText("ORDER #1007");
    expect(mockedGetOrderHistory).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("tab", { name: "History" }));

    expect(await screen.findByText("Batch #2")).toBeInTheDocument();
    expect(mockedGetOrderHistory).toHaveBeenCalledWith("7", { page: 1 });
    const rows = screen.getAllByRole("row");
    expect(rows.map((row) => row.textContent).join(" ")).toMatch(/batch_marked_printed.*component_touched.*order_imported/);
    expect(screen.getByText("ASH component · TEST")).toBeInTheDocument();
    expect(screen.getByText("Order #1007")).toBeInTheDocument();
    expect(screen.queryByText(/Order-level events only/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Audit Log" })).not.toBeInTheDocument();
  });

  it("shows loading, empty, error, and accessible load-more states", async () => {
    let resolveHistory: ((value: { count: number; next: string | null; previous: string | null; results: never[] }) => void) | undefined;
    mockedGetOrderHistory.mockImplementationOnce(() => new Promise((resolve) => { resolveHistory = resolve; }));
    const firstScreen = render(<OrderDetailScreen orderId="7" />);
    fireEvent.click(await screen.findByRole("tab", { name: "History" }));
    expect(await screen.findByText("Loading order history")).toBeInTheDocument();
    resolveHistory?.({ count: 0, next: null, previous: null, results: [] });
    expect(await screen.findByText("No recorded lifecycle history for this order")).toBeInTheDocument();

    mockedGetOrderHistory.mockRejectedValueOnce(new Error("History offline"));
    // A new screen exercises the first-page error state rather than relying on
    // cached history in the previous instance.
    firstScreen.unmount();
    render(<OrderDetailScreen orderId="8" />);
    fireEvent.click(await screen.findByRole("tab", { name: "History" }));
    expect(await screen.findByText("History offline")).toBeInTheDocument();
  });

  it("loads remaining order-specific history without disturbing Files and reprints", async () => {
    const filesOrder = order();
    filesOrder.items[0].components![0].artwork = {
      id: 301, component_code: "ASH", design_code: "TEST", status: "Available",
      source_file_path: "artwork/Ashtray/TEST.png", drive_share_url: null,
      thumbnail_url: "/api/artwork/301/thumbnail/",
    };
    filesOrder.generated_files = [{
      id: 401, file_type: "PPTX", file_name: "history-file.pptx", drive_share_url: null,
      created_at: "2026-07-22T00:00:00Z", batch_id: 9, batch_label: "Ashtray #2",
    }];
    mockedGetOrder.mockResolvedValue(filesOrder);
    mockedGetOrderHistory
      .mockResolvedValueOnce({
        count: 2, next: "http://testserver/api/orders/7/history/?page=2", previous: null,
        results: [{ id: 2, actor_type: "system", action: "newest", entity_type: "Order", entity_id: "7", entity_label: "Order #1007", created_at: "2026-07-22T00:00:00Z" }],
      })
      .mockResolvedValueOnce({
        count: 2, next: null, previous: "http://testserver/api/orders/7/history/?page=1",
        results: [{ id: 1, actor_type: "system", action: "older", entity_type: "ProductionComponent", entity_id: "41", entity_label: "ASH component · TEST", created_at: "2026-07-21T00:00:00Z" }],
      });
    render(<OrderDetailScreen orderId="7" />);

    fireEvent.click(await screen.findByRole("tab", { name: "History" }));
    fireEvent.click(await screen.findByRole("button", { name: "Load more order history" }));
    expect(await screen.findByText("older")).toBeInTheDocument();
    expect(mockedGetOrderHistory).toHaveBeenLastCalledWith("7", { page: 2 });

    fireEvent.click(screen.getByRole("tab", { name: "Files and reprints" }));
    expect(await screen.findByAltText("Artwork TEST for ASH")).toBeInTheDocument();
    expect(screen.getByText("history-file.pptx")).toBeInTheDocument();
    expect(screen.getAllByText("No Drive link available")).toHaveLength(2);
  });
});
