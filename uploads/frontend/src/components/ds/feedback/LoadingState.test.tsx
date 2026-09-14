import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingState } from "@/components/ds";

describe("LoadingState", () => {
  it("renders the spinning SpicedAnime logo with the rotation class for the default spinner variant", () => {
    const { container } = render(<LoadingState label="Loading dashboard metrics" />);
    const logo = container.querySelector("img.sa-loading-logo");
    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute("src", "/assets/spicedanime-logo-spinner.png");
    expect(screen.getByText("Loading dashboard metrics")).toBeInTheDocument();
  });

  it("renders the spinning logo for the inline variant", () => {
    const { container } = render(<LoadingState variant="inline" label="Syncing orders…" />);
    const logo = container.querySelector("img.sa-loading-logo");
    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute("src", "/assets/spicedanime-logo-spinner.png");
  });

  it("renders the spinning logo above the shimmer rows for the skeleton variant", () => {
    const { container } = render(<LoadingState variant="skeleton" rows={2} label="Loading orders" />);
    const logo = container.querySelector("img.sa-loading-logo");
    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute("src", "/assets/spicedanime-logo-spinner.png");
    expect(screen.getByText("Loading orders")).toBeInTheDocument();
  });
});
