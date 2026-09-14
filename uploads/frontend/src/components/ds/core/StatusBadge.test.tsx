import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STATUS_MAP, StatusBadge, TONE_ICON } from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";

/** The one fixed icon per tone (Decision #85). */
const EXPECTED_TONE_ICON = {
  info: "circle",
  progress: "circle-dashed",
  success: "circle-check",
  warning: "triangle-alert",
  danger: "octagon-x",
  neutral: "minus",
} as const;

function iconOf(el: HTMLElement): string | null {
  return el.querySelector("svg")?.getAttribute("data-icon") ?? null;
}

describe("StatusBadge — tone-driven icons (Decision #85)", () => {
  it("maps every tone to exactly its one fixed icon", () => {
    expect(TONE_ICON).toEqual(EXPECTED_TONE_ICON);
  });

  it("renders each status with its tone's icon, never a per-status glyph", () => {
    for (const [status, { tone }] of Object.entries(STATUS_MAP)) {
      const { container } = render(<StatusBadge status={status as StatusName} />);
      expect(iconOf(container)).toBe(
        EXPECTED_TONE_ICON[tone as keyof typeof EXPECTED_TONE_ICON],
      );
    }
  });

  it("shows circle-check for both Printed and Fulfilled Externally (shared, not special-cased)", () => {
    const printed = render(<StatusBadge status="Printed" />);
    const external = render(<StatusBadge status="Fulfilled Externally" />);
    expect(iconOf(printed.container)).toBe("circle-check");
    expect(iconOf(external.container)).toBe("circle-check");
  });

  it("uses no exclamation-style glyph on Danger badges", () => {
    for (const status of ["Blocked", "Missing", "Failed"] as StatusName[]) {
      const { container } = render(<StatusBadge status={status} />);
      expect(iconOf(container)).toBe("octagon-x");
      expect(container.querySelector('svg[data-icon="circle-alert"]')).toBeNull();
      expect(container.querySelector('svg[data-icon="triangle-alert"]')).toBeNull();
    }
  });

  it("falls back to the neutral tone + icon for an unknown status", () => {
    const { container } = render(<StatusBadge status={"Nonsense" as StatusName} />);
    expect(iconOf(container)).toBe("minus");
  });

  it("renders a dot instead of the icon when asked, keeping the text label", () => {
    const { container, getByText } = render(<StatusBadge status="Open" dot />);
    expect(container.querySelector("svg")).toBeNull();
    expect(getByText("Open")).toBeVisible();
  });

  it("still honours a display-only label override without changing the tone icon", () => {
    const { container, getByText } = render(
      <StatusBadge status="Locked for Review" label="PPT Generated" />,
    );
    expect(getByText("PPT Generated")).toBeVisible();
    expect(iconOf(container)).toBe("triangle-alert");
  });
});
