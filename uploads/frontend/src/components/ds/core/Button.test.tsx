import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ds";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

describe("Button navigation semantics (Decision #108)", () => {
  it("renders a real link with href when `href` is set", () => {
    render(
      <Button href="/batches/9" variant="outline" size="sm">
        Open
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Open" });
    expect(link).toHaveAttribute("href", "/batches/9");
    // A genuine anchor: middle-click / Cmd-click / "Open Link in New Tab" all
    // work natively, and there is no click-handler emulation of a link.
    expect(link.tagName).toBe("A");
  });

  it("stays a plain <button> for mutation/workflow actions", () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Generate PPTX
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Generate PPTX" });
    expect(button).not.toHaveAttribute("href");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("falls back to a non-navigating button when a link would be disabled", () => {
    render(
      <Button href="/batches/9" disabled>
        Open
      </Button>,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
  });
});
