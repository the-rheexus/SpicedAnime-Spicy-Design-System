import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AgingFlag, calendarDaysSince, isAging } from "@/components/ds/feedback/AgingFlag";
import { STATUS_MAP } from "@/components/ds";

const NOW = new Date("2026-08-27T12:00:00");

describe("aging helpers", () => {
  it("counts whole calendar days and flags at the default 4-day threshold", () => {
    expect(calendarDaysSince("2026-08-24T23:00:00", NOW)).toBe(3);
    expect(isAging("2026-08-24T23:00:00", NOW)).toBe(false);
    expect(calendarDaysSince("2026-08-23T01:00:00", NOW)).toBe(4);
    expect(isAging("2026-08-23T01:00:00", NOW)).toBe(true);
  });

  it("honours a caller-supplied threshold", () => {
    expect(isAging("2026-08-23T01:00:00", NOW, 7)).toBe(false);
    expect(isAging("2026-08-18T01:00:00", NOW, 7)).toBe(true);
  });

  it("returns null / false for unparseable input", () => {
    expect(calendarDaysSince(null, NOW)).toBeNull();
    expect(isAging(undefined, NOW)).toBe(false);
  });
});

describe("AgingFlag", () => {
  it("renders nothing below the threshold", () => {
    const { container } = render(<AgingFlag sinceIso="2026-08-25T12:00:00" now={NOW} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a compact {n}D flag with the clock icon in the Warning tone", () => {
    const { container } = render(<AgingFlag sinceIso="2026-08-20T12:00:00" now={NOW} />);
    const flag = screen.getByLabelText("Open 7 days — aging");
    expect(flag).toHaveTextContent("7D");
    expect(flag).toHaveStyle({ color: "var(--tone-warning)" });
    expect(container.querySelector('svg[data-icon="clock"]')).not.toBeNull();
  });

  it("respects a custom threshold via props", () => {
    const { container: below } = render(
      <AgingFlag sinceIso="2026-08-24T12:00:00" now={NOW} thresholdDays={7} />,
    );
    expect(below).toBeEmptyDOMElement();
    render(<AgingFlag sinceIso="2026-08-18T12:00:00" now={NOW} thresholdDays={7} />);
    expect(screen.getByLabelText("Open 9 days — aging")).toBeInTheDocument();
  });

  it("is not a status: the clock icon it uses is not any tone's badge icon", () => {
    const toneIcons = new Set(Object.values(STATUS_MAP).map((m) => m.tone));
    expect(toneIcons.has("warning")).toBe(true);
    // The aging flag deliberately uses `clock`, which no StatusBadge tone renders.
    render(<AgingFlag sinceIso="2026-08-20T12:00:00" now={NOW} />);
    expect(screen.getByLabelText("Open 7 days — aging").querySelector("svg")).toHaveAttribute(
      "data-icon",
      "clock",
    );
  });
});
