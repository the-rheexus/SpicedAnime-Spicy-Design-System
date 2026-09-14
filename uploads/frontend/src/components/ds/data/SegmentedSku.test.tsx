import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedSku } from "@/components/ds";

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  return writeText;
}

describe("SegmentedSku", () => {
  it("renders one chip per canonical segment in SKU_and_Internal_ID_Guide order", () => {
    // LIT-DESNAM-SIL-TOR-LITTIN — parser fields as the API returns them.
    render(
      <SegmentedSku
        sku="LIT-DESNAM-SIL-TOR-LITTIN"
        familyCode="LIT"
        designCode="DESNAM"
        options={{ color: "SIL", flame: "TOR" }}
        configCode="LITTIN"
      />,
    );
    const group = screen.getByRole("group", { name: "SKU LIT-DESNAM-SIL-TOR-LITTIN" });
    const chips = within(group).getAllByText(/^(LIT|DESNAM|SIL|TOR|LITTIN)$/);
    expect(chips.map((c) => c.textContent)).toEqual(["LIT", "DESNAM", "SIL", "TOR", "LITTIN"]);
  });

  it("handles a config-only family (ASH-CHARFRIE-SOLO)", () => {
    render(
      <SegmentedSku sku="ASH-CHARFRIE-SOLO" familyCode="ASH" designCode="CHARFRIE" configCode="SOLO" />,
    );
    const group = screen.getByRole("group", { name: "SKU ASH-CHARFRIE-SOLO" });
    expect(within(group).getByText("ASH")).toBeVisible();
    expect(within(group).getByText("CHARFRIE")).toBeVisible();
    expect(within(group).getByText("SOLO")).toBeVisible();
  });

  it("copies the full canonical string, not a single segment", async () => {
    const writeText = mockClipboard();
    render(
      <SegmentedSku
        sku="BAT-SAMURAI-LRG-NONE"
        familyCode="BAT"
        designCode="SAMURAI"
        options={{ size: "LRG" }}
        configCode="NONE"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy SKU BAT-SAMURAI-LRG-NONE" }));
    expect(writeText).toHaveBeenCalledWith("BAT-SAMURAI-LRG-NONE");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied BAT-SAMURAI-LRG-NONE" })).toBeInTheDocument(),
    );
  });

  it("falls back to a single chip when no parsed fields are supplied", () => {
    render(<SegmentedSku sku="TOT-EVA-BLK-NONE" />);
    const group = screen.getByRole("group", { name: "SKU TOT-EVA-BLK-NONE" });
    expect(within(group).getByText("TOT-EVA-BLK-NONE")).toBeVisible();
  });
});
