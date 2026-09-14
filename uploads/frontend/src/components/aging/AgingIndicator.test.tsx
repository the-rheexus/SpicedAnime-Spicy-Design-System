import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AgingIndicator, calendarDaysSince, isAging } from "@/components/aging/AgingIndicator";

const NOW = new Date("2026-08-27T12:00:00");

describe("aging helpers", () => {
  it("counts whole calendar days and flags at the 4-day threshold", () => {
    expect(calendarDaysSince("2026-08-24T23:00:00", NOW)).toBe(3);
    expect(isAging("2026-08-24T23:00:00", NOW)).toBe(false);
    expect(calendarDaysSince("2026-08-23T01:00:00", NOW)).toBe(4);
    expect(isAging("2026-08-23T01:00:00", NOW)).toBe(true);
  });

  it("returns null / false for unparseable input", () => {
    expect(calendarDaysSince(null, NOW)).toBeNull();
    expect(isAging(undefined, NOW)).toBe(false);
  });
});

describe("AgingIndicator", () => {
  it("renders nothing below the threshold", () => {
    const { container } = render(<AgingIndicator sinceIso="2026-08-25T12:00:00" now={NOW} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an accessible aging flag at or beyond the threshold", () => {
    render(<AgingIndicator sinceIso="2026-08-20T12:00:00" now={NOW} />);
    expect(screen.getByLabelText("Open 7 days — aging")).toBeInTheDocument();
  });
});
