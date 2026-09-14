import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { ConfirmModal } from "@/components/ds";

describe("ConfirmModal", () => {
  it("uses dialog semantics, focuses Cancel, traps keyboard focus, and restores its opener", async () => {
    const onCancel = vi.fn();
    const { rerender, unmount } = render(
      <>
        <button type="button">Open confirmation</button>
        <ConfirmModal open={false} title="Retire artwork?" onCancel={onCancel} onConfirm={vi.fn()}>
          <input aria-label="Artwork File" type="file" />
        </ConfirmModal>
      </>,
    );
    const opener = screen.getByRole("button", { name: "Open confirmation" });
    opener.focus();
    rerender(
      <>
        <button type="button">Open confirmation</button>
        <ConfirmModal open title="Retire artwork?" onCancel={onCancel} onConfirm={vi.fn()}>
          <input aria-label="Artwork File" type="file" />
        </ConfirmModal>
      </>,
    );

    const dialog = screen.getByRole("dialog", { name: "Retire artwork?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    screen.getByRole("button", { name: "Confirm" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByLabelText("Artwork File")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(<button type="button">Open confirmation</button>);
    await waitFor(() => expect(opener).toHaveFocus());
    unmount();
  });

  it("does not close or submit a duplicate action while loading", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmModal open loading title="Generate PPTX" onCancel={onCancel} onConfirm={onConfirm}>
        Generating output.
      </ConfirmModal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("has no serious or critical axe violations for a confirmation state", async () => {
    render(
      <ConfirmModal open tone="danger" title="Retire this artwork?" onCancel={vi.fn()} onConfirm={vi.fn()}>
        This action can be recovered only by uploading new artwork.
      </ConfirmModal>,
    );
    const results = await axe.run(document.body);
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  });
});
