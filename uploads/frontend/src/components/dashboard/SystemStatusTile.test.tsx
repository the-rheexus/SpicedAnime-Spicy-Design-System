import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SystemStatusTile } from "@/components/dashboard/SystemStatusTile";
import { getIntegrationStatus } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getIntegrationStatus: vi.fn() };
});

const mockedStatus = vi.mocked(getIntegrationStatus);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SystemStatusTile", () => {
  it("renders the three integration services with connected / not-connected vocabulary", async () => {
    mockedStatus.mockResolvedValue({
      shopify: { connected: true, last_webhook_at: null, api_version: null },
      drive: { root_folder_configured: false, last_export_at: null },
      celery: { worker_reachable: true },
    });

    render(<SystemStatusTile />);

    expect(await screen.findByText("Shopify")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Connected")).toHaveLength(2));
    expect(screen.getByText("Not connected")).toBeInTheDocument();
  });

  it("degrades to Unknown when the status request fails", async () => {
    mockedStatus.mockRejectedValue(new Error("boom"));

    render(<SystemStatusTile />);

    await waitFor(() => expect(screen.getAllByText("Unknown")).toHaveLength(3));
  });

  it("is a genuine link to Settings, not a role=button keydown emulation (Decision #108)", async () => {
    mockedStatus.mockResolvedValue({
      shopify: { connected: true, last_webhook_at: null, api_version: null },
      drive: { root_folder_configured: true, last_export_at: null },
      celery: { worker_reachable: true },
    });

    render(<SystemStatusTile />);

    const link = await screen.findByRole("link", { name: "System status — open Settings" });
    expect(link).toHaveAttribute("href", "/settings");
    expect(link.tagName).toBe("A");
    expect(screen.queryByRole("button", { name: /System status/ })).not.toBeInTheDocument();
  });
});
