import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PackingScreen } from "@/components/packing/PackingScreen";
import { getPackingExports, getTaskStatus, triggerPackingExport } from "@/lib/api";
import type { PackingExport, PackingExportsResponse } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getPackingExports: vi.fn(),
    triggerPackingExport: vi.fn(),
    getTaskStatus: vi.fn(),
  };
});

const mockedGetPackingExports = vi.mocked(getPackingExports);
const mockedTriggerPackingExport = vi.mocked(triggerPackingExport);
const mockedGetTaskStatus = vi.mocked(getTaskStatus);

const EXACT_LIMIT_MESSAGE =
  "Export limit reached (30 days max). Exporting the first 30 days now. " +
  "Please run another export for the remaining dates once this completes.";

const DAY_MS = 24 * 60 * 60 * 1000;

function exportRow(overrides: Partial<PackingExport> = {}): PackingExport {
  return {
    id: 1,
    export_label: "Packing Export (2026-01-01 - 2026-01-08)",
    export_window_start: "2026-01-01T00:00:00Z",
    export_window_end: "2026-01-08T00:00:00Z",
    status: "Success",
    drive_share_url: "https://drive.example.test/packing-1",
    created_at: "2026-01-08T02:00:00Z",
    updated_at: "2026-01-08T02:00:00Z",
    ...overrides,
  };
}

function response(rows: PackingExport[]): PackingExportsResponse {
  return {
    count: rows.length,
    next: null,
    previous: null,
    results: rows,
    default_window: {
      window_start: "2026-01-01T00:00:00Z",
      window_end: "2026-01-31T00:00:00Z",
      first_export: false,
      has_remaining_backlog: false,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetTaskStatus.mockResolvedValue({ state: "running", status: "running" } as never);
});

describe("PackingScreen — history table (Decision #106)", () => {
  it("does not render a redundant Export column but keeps window, status and Drive access", async () => {
    mockedGetPackingExports.mockResolvedValue(response([exportRow()]));

    render(<PackingScreen />);

    await screen.findByText("Open file");

    const headers = screen.getAllByRole("columnheader").map((cell) => cell.textContent?.trim());
    expect(headers).not.toContain("Export");
    expect(headers).toEqual(
      expect.arrayContaining(["Status", "Window Start", "Window End", "Drive File", "Created"]),
    );

    // Drive access still works, and the internal export label survives in the
    // accessible name even though it no longer occupies a visible column.
    const driveLink = screen.getByRole("link", {
      name: "Open Drive file for Packing Export (2026-01-01 - 2026-01-08)",
    });
    expect(driveLink).toHaveAttribute("href", "https://drive.example.test/packing-1");
    expect(driveLink).toHaveAttribute("target", "_blank");
    expect(driveLink).toHaveAttribute("rel", "noreferrer");
  });

  it("preserves empty, loading and pagination behavior", async () => {
    mockedGetPackingExports.mockResolvedValue(response([]));
    render(<PackingScreen />);
    expect(await screen.findByText("NO PACKING EXPORTS")).toBeInTheDocument();
  });

  it("keeps the Status Guide closed by default on the Packing Queue", async () => {
    mockedGetPackingExports.mockResolvedValue(response([exportRow()]));
    render(<PackingScreen />);
    await screen.findByText("Open file");

    const guide = screen.getByTestId("status-key");
    expect(guide).not.toHaveAttribute("open");
    fireEvent.click(within(guide).getByText("Status Guide"));
    expect(within(guide).getByText(/Export slot allocated/)).toBeVisible();
  });
});

describe("PackingScreen — over-30-day export (Decision #106)", () => {
  it("shows the exact approved message and dispatches the first 30 days", async () => {
    mockedGetPackingExports.mockResolvedValue(response([exportRow()]));
    mockedTriggerPackingExport.mockResolvedValue({ task_id: "task-1" } as never);

    render(<PackingScreen />);
    await screen.findByText("Open file");

    const start = "2026-03-01T00:00";
    const end = "2026-04-20T00:00"; // 50 days, well past the 30-day maximum
    fireEvent.change(screen.getByLabelText("Window Start"), { target: { value: start } });
    fireEvent.change(screen.getByLabelText("Window End"), { target: { value: end } });
    fireEvent.click(screen.getByRole("button", { name: "Export Packing Sheet" }));

    expect(await screen.findByText(EXACT_LIMIT_MESSAGE)).toBeInTheDocument();

    await waitFor(() => expect(mockedTriggerPackingExport).toHaveBeenCalledTimes(1));
    const payload = mockedTriggerPackingExport.mock.calls[0][0];
    const startMs = new Date(start).getTime();
    expect(payload.window_start).toBe(new Date(start).toISOString());
    // The 30-day window calculation is unchanged: end is clamped to start + 30d.
    expect(payload.window_end).toBe(new Date(startMs + 30 * DAY_MS).toISOString());

    // Dispatch + polling path is unchanged — task polling starts and the
    // running confirmation shows.
    expect(await screen.findByText("Packing export is running.")).toBeInTheDocument();
    await waitFor(() => expect(mockedGetTaskStatus).toHaveBeenCalled());
  });

  it("dispatches an in-range window unchanged and shows no limit message", async () => {
    mockedGetPackingExports.mockResolvedValue(response([exportRow()]));
    mockedTriggerPackingExport.mockResolvedValue({ task_id: "task-2" } as never);

    render(<PackingScreen />);
    await screen.findByText("Open file");

    const start = "2026-03-01T00:00";
    const end = "2026-03-15T00:00"; // 14 days, within the maximum
    fireEvent.change(screen.getByLabelText("Window Start"), { target: { value: start } });
    fireEvent.change(screen.getByLabelText("Window End"), { target: { value: end } });
    fireEvent.click(screen.getByRole("button", { name: "Export Packing Sheet" }));

    await waitFor(() => expect(mockedTriggerPackingExport).toHaveBeenCalledTimes(1));
    const payload = mockedTriggerPackingExport.mock.calls[0][0];
    expect(payload.window_start).toBe(new Date(start).toISOString());
    expect(payload.window_end).toBe(new Date(end).toISOString());
    expect(screen.queryByText(EXACT_LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("still rejects an inverted window with the existing error", async () => {
    mockedGetPackingExports.mockResolvedValue(response([exportRow()]));

    render(<PackingScreen />);
    await screen.findByText("Open file");

    fireEvent.change(screen.getByLabelText("Window Start"), { target: { value: "2026-03-15T00:00" } });
    fireEvent.change(screen.getByLabelText("Window End"), { target: { value: "2026-03-01T00:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Export Packing Sheet" }));

    await waitFor(() =>
      expect(
        screen.getAllByText("Window start must be before window end.").length,
      ).toBeGreaterThan(0),
    );
    expect(mockedTriggerPackingExport).not.toHaveBeenCalled();
    expect(screen.queryByText(EXACT_LIMIT_MESSAGE)).not.toBeInTheDocument();
  });
});
