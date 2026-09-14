import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PairBracket } from "@/components/ds";

describe("PairBracket (Decision #86)", () => {
  it("renders a PAIR label in the grouping accent and keeps its children", () => {
    render(
      <PairBracket>
        <div>LITF row</div>
        <div>LITB row</div>
      </PairBracket>,
    );
    const label = screen.getByText("Pair");
    expect(label).toHaveStyle({ color: "var(--group-pair)" });
    expect(screen.getByText("LITF row")).toBeVisible();
    expect(screen.getByText("LITB row")).toBeVisible();
  });

  it("renders a visually distinct shared-source variant so it is not confused with a pair", () => {
    const { container } = render(
      <PairBracket variant="shared-source">
        <div>TIN row</div>
      </PairBracket>,
    );
    expect(screen.queryByText("Pair")).not.toBeInTheDocument();
    const label = screen.getByText("Shared art");
    expect(label).not.toHaveStyle({ color: "var(--group-pair)" });
    // dashed rule rather than the solid pair bracket
    const rule = container.querySelector("span[aria-hidden='true']");
    expect(rule?.getAttribute("style")).toContain("dashed");
  });

  it("accepts a label override", () => {
    render(<PairBracket label="Front / Back">content</PairBracket>);
    expect(screen.getByText("Front / Back")).toBeVisible();
  });

  it("exposes the bracket rule as decorative only", () => {
    const { container } = render(<PairBracket>x</PairBracket>);
    const rule = container.querySelector("span[aria-hidden='true']");
    expect(rule).not.toBeNull();
    expect(within(container).getByText("x")).toBeVisible();
  });
});
