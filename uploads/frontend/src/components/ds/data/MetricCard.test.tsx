import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MetricCard } from "@/components/ds";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

describe("MetricCard navigation semantics (Decision #108)", () => {
  it("renders the whole tile as a real link when `href` is set", () => {
    render(<MetricCard label="Open batches" value={3} icon="layers" hint="active groups" href="/batches" />);
    const link = screen.getByRole("link", { name: /Open batches/ });
    expect(link).toHaveAttribute("href", "/batches");
    expect(link.tagName).toBe("A");
    // Essential content is present without hover.
    expect(link).toHaveTextContent("3");
    expect(link).toHaveTextContent("active groups");
  });

  it("stays a non-link div when there is no href", () => {
    render(<MetricCard label="Printed" value={7} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("still supports a plain onClick for non-navigation tiles", () => {
    const onClick = vi.fn();
    render(<MetricCard label="Filter" value={1} onClick={onClick} />);
    fireEvent.click(screen.getByText("Filter"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
