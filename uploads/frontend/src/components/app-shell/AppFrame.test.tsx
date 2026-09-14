import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppFrame } from "@/components/app-shell/AppFrame";
import { getAuthSession } from "@/lib/api";

const { pathname } = vi.hoisted(() => ({ pathname: { value: "/" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getAuthSession: vi.fn() };
});

beforeEach(() => {
  pathname.value = "/";
  vi.mocked(getAuthSession).mockResolvedValue({ authenticated: false } as never);
});

describe("AppFrame sidebar navigation (Decision #108)", () => {
  it("renders every primary and footer nav entry as a real link with a route href", () => {
    render(<AppFrame><div>content</div></AppFrame>);

    const expected: [string, string][] = [
      ["Dashboard", "/"],
      ["Current Batches", "/batches"],
      ["Needs Attention", "/needs-attention"],
      ["Orders", "/orders"],
      ["Artwork Library", "/artwork"],
      ["SKU Manager", "/sku-manager"],
      ["Packing Queue", "/packing"],
      ["Settings", "/settings"],
      ["Audit Log", "/audit-log"],
      ["Sandbox", "/sandbox"],
    ];

    for (const [label, href] of expected) {
      const link = screen.getByRole("link", { name: new RegExp(`^${label}$`, "i") });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", href);
    }
  });

  it("marks the active route with aria-current and never emulates a link with a button", () => {
    pathname.value = "/orders";
    render(<AppFrame><div>content</div></AppFrame>);

    const orders = screen.getByRole("link", { name: /^Orders$/i });
    expect(orders).toHaveAttribute("aria-current", "page");

    // No navigation entry is a role=button click-handler emulation.
    const nav = screen.getByRole("navigation");
    expect(within(nav).queryAllByRole("button")).toHaveLength(0);
  });
});
