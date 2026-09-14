import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelativeTime } from "@/components/common/RelativeTime";
import { formatDateTime } from "@/lib/datetime";

describe("RelativeTime", () => {
  it("renders always-relative text with the absolute value on hover", () => {
    const iso = "2020-01-01T00:00:00Z";
    render(<RelativeTime value={iso} />);
    const el = screen.getByText(/years ago$/);
    expect(el).toHaveAttribute("title", formatDateTime(iso));
  });

  it("renders an em dash with no title for missing input", () => {
    render(<RelativeTime value={null} />);
    const el = screen.getByText("—");
    expect(el).not.toHaveAttribute("title");
  });
});
