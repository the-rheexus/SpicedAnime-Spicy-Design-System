import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { STATUS_MAP } from "@/components/ds";
import { StatusKey } from "@/components/status-key/StatusKey";
import {
  ARTWORK_STATUS_KEY,
  BATCH_STATUS_KEY,
  COMPONENT_STATUS_KEY,
  INTEGRATION_STATUS_KEY,
  MVP_VISIBLE_ORDER_STATUSES,
  ORDER_STATUS_KEY,
  PACKING_EXPORT_STATUS_KEY,
  SKU_STATUS_KEY,
  group,
  visibleOrderStatuses,
} from "@/lib/statusKeys";

const DORMANT = ["Being Packaged", "Shipped"];

const ALL_KEYS = [
  ORDER_STATUS_KEY,
  BATCH_STATUS_KEY,
  COMPONENT_STATUS_KEY,
  ARTWORK_STATUS_KEY,
  PACKING_EXPORT_STATUS_KEY,
  INTEGRATION_STATUS_KEY,
  SKU_STATUS_KEY,
];

/** Open the shared Status Guide disclosure and return its root element. */
function openGuide(): HTMLElement {
  const guide = screen.getByTestId("status-key");
  fireEvent.click(within(guide).getByText("Status Guide"));
  return guide;
}

describe("status key data source", () => {
  it("excludes the dormant Phase 3 order states from every key", () => {
    for (const key of ALL_KEYS) {
      for (const entry of key) {
        expect(DORMANT).not.toContain(entry.status);
      }
    }
  });

  it("exposes exactly the five MVP-visible order statuses", () => {
    expect(MVP_VISIBLE_ORDER_STATUSES).toEqual([
      "Queued for Production",
      "In Production",
      "In Production (Needs Reprint)",
      "Fulfilled Externally",
      "Canceled",
    ]);
  });

  it("includes the terminal reconciliation states in the order key", () => {
    const statuses = ORDER_STATUS_KEY.map((entry) => entry.status);
    expect(statuses).toContain("Fulfilled Externally");
    expect(statuses).toContain("Canceled");
  });

  it("includes the Canceled component state in the component key", () => {
    expect(COMPONENT_STATUS_KEY.map((entry) => entry.status)).toContain("Canceled");
  });

  it("gives the Canceled component entry a Print Not Needed display label without changing its status value", () => {
    const canceled = COMPONENT_STATUS_KEY.find((entry) => entry.status === "Canceled");
    expect(canceled?.label).toBe("Print Not Needed");
    expect(canceled?.status).toBe("Canceled");
  });

  it("does not apply the component display-label override to the order-level Canceled entry", () => {
    const canceled = ORDER_STATUS_KEY.find((entry) => entry.status === "Canceled");
    expect(canceled?.label).toBeUndefined();
  });

  it("gives every entry a non-empty meaning", () => {
    for (const key of ALL_KEYS) {
      for (const entry of key) {
        expect(entry.meaning.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("filters dormant values out of an arbitrary status list", () => {
    expect(visibleOrderStatuses(["In Production", "Shipped", "Being Packaged", "Canceled"])).toEqual(
      ["In Production", "Canceled"],
    );
  });
});

describe("Status Guide disclosure (Decision #107)", () => {
  it("renders as a native disclosure labelled 'Status Guide', closed by default", () => {
    render(<StatusKey label="Orders status key" groups={[group("Order", ORDER_STATUS_KEY)]} />);

    const guide = screen.getByTestId("status-key");
    expect(guide.tagName).toBe("DETAILS");
    expect(guide).not.toHaveAttribute("open");

    // The summary is a real <summary> (natively keyboard- and screen-reader
    // operable) and carries the "Status Guide" label.
    const summary = within(guide).getByText("Status Guide");
    expect(summary.tagName).toBe("SUMMARY");

    // Definitions are present in the DOM but not visible while it is closed.
    expect(within(guide).getByText(ORDER_STATUS_KEY[0].meaning)).not.toBeVisible();
  });

  it("exposes the same definitions once the operator opens it", () => {
    render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    const guide = openGuide();
    expect(guide).toHaveAttribute("open");

    for (const entry of ORDER_STATUS_KEY) {
      expect(within(guide).getByText(entry.label ?? entry.status)).toBeVisible();
      expect(within(guide).getByText(entry.meaning)).toBeVisible();
    }
  });

  it("uses a native, focusable summary so keyboard activation works", () => {
    render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    const guide = screen.getByTestId("status-key");
    const summary = within(guide).getByText("Status Guide");

    // A native <summary> is keyboard-operable by the browser (Enter / Space
    // toggle its <details>) and is focusable without an explicit tabindex.
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary).not.toHaveAttribute("tabindex", "-1");

    // The toggle the browser dispatches on Enter / Space:
    fireEvent.click(summary);
    expect(guide).toHaveAttribute("open");
    fireEvent.click(summary);
    expect(guide).not.toHaveAttribute("open");
  });

  it("never persists open/closed state to local storage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const getItem = vi.spyOn(Storage.prototype, "getItem");

    const view = render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    openGuide();
    view.unmount();

    render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    // Fresh render starts closed again.
    expect(screen.getByTestId("status-key")).not.toHaveAttribute("open");
    expect(setItem).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();

    setItem.mockRestore();
    getItem.mockRestore();
  });

  it("is exposed as a group with a per-page accessible name", () => {
    render(<StatusKey label="Orders status key" groups={[group("Order", ORDER_STATUS_KEY)]} />);
    expect(screen.getByRole("group", { name: "Orders status key" })).toBeInTheDocument();
  });
});

describe("StatusKey content", () => {
  it("renders each status with its meaning when open", () => {
    render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    const key = openGuide();
    for (const entry of ORDER_STATUS_KEY) {
      expect(within(key).getByText(entry.status)).toBeVisible();
      expect(within(key).getByText(entry.meaning)).toBeVisible();
    }
  });

  it("never renders a dormant Phase 3 order state", () => {
    render(<StatusKey groups={[group("Order", ORDER_STATUS_KEY)]} />);
    const key = openGuide();
    for (const dormant of DORMANT) {
      expect(within(key).queryByText(dormant)).not.toBeInTheDocument();
    }
  });

  it("labels each entity when more than one group is shown", () => {
    render(
      <StatusKey
        groups={[group("Order", ORDER_STATUS_KEY), group("Component", COMPONENT_STATUS_KEY)]}
      />,
    );
    const key = openGuide();
    expect(within(key).getByRole("heading", { name: "Order" })).toBeVisible();
    expect(within(key).getByRole("heading", { name: "Component" })).toBeVisible();
  });

  it("omits entity headings for a single group", () => {
    render(<StatusKey groups={[group("Batch", BATCH_STATUS_KEY)]} />);
    const key = openGuide();
    expect(within(key).queryByRole("heading", { name: "Batch" })).not.toBeInTheDocument();
  });

  it("renders nothing when a page has no status labels", () => {
    const { container } = render(<StatusKey groups={[group("Nothing", [])]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the Canceled component entry's badge as Print Not Needed but keeps its meaning text unchanged", () => {
    render(<StatusKey groups={[group("Component", COMPONENT_STATUS_KEY)]} />);
    const key = openGuide();
    const canceled = COMPONENT_STATUS_KEY.find((entry) => entry.status === "Canceled")!;
    expect(within(key).getByText("Print Not Needed")).toBeVisible();
    expect(within(key).queryByText("Canceled")).not.toBeInTheDocument();
    expect(within(key).getByText(canceled.meaning)).toBeVisible();
  });

  it("renders non-lifecycle labels such as the SKU Active flag", () => {
    render(<StatusKey groups={[group("Offer SKU", SKU_STATUS_KEY)]} />);
    const key = openGuide();
    expect(within(key).getByText("Active")).toBeVisible();
    expect(within(key).getByText("Retired")).toBeVisible();
  });

  it("renders the SKU Retired legend chip with no icon, matching the screen badge", () => {
    render(<StatusKey groups={[group("Offer SKU", SKU_STATUS_KEY)]} />);
    openGuide();
    const retiredTerm = screen.getByText("Retired").closest("dt");
    expect(retiredTerm).not.toBeNull();
    expect(retiredTerm?.querySelector("svg")).toBeNull();
  });

  it("includes a No SKU entry in the SKU key, toned like its table badge", () => {
    const noSku = SKU_STATUS_KEY.find((entry) => entry.status === "No SKU");
    expect(noSku?.tone).toBe("danger");
    render(<StatusKey groups={[group("Offer SKU", SKU_STATUS_KEY)]} />);
    const key = openGuide();
    expect(within(key).getByText("No SKU")).toBeVisible();
  });

  it("renders each lifecycle legend entry with its tone's fixed icon (Decision #85)", () => {
    const TONE_ICON: Record<string, string> = {
      info: "circle",
      progress: "circle-dashed",
      success: "circle-check",
      warning: "triangle-alert",
      danger: "octagon-x",
      neutral: "minus",
    };
    render(<StatusKey groups={[group("Component", COMPONENT_STATUS_KEY)]} />);
    const key = openGuide();
    for (const entry of COMPONENT_STATUS_KEY) {
      const term = within(key).getByText(entry.label ?? entry.status).closest("dt");
      const icon = term?.querySelector("svg")?.getAttribute("data-icon");
      const tone = STATUS_MAP[entry.status as keyof typeof STATUS_MAP]?.tone;
      expect(icon).toBe(TONE_ICON[tone]);
    }
  });
});
