import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArtworkScreen } from "@/components/artwork/ArtworkScreen";
import {
  ApiError,
  getAllConfigurationComponents,
  getAllDesigns,
  getArtwork,
  getTaskStatus,
  revalidateArtwork,
} from "@/lib/api";
import type { ArtworkReconciliationResult } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getAllConfigurationComponents: vi.fn(),
    getAllDesigns: vi.fn(),
    getArtwork: vi.fn(),
    getTaskStatus: vi.fn(),
    revalidateArtwork: vi.fn(),
  };
});

const mockedGetArtwork = vi.mocked(getArtwork);
const mockedGetAllDesigns = vi.mocked(getAllDesigns);
const mockedGetAllConfigurationComponents = vi.mocked(getAllConfigurationComponents);
const mockedGetTaskStatus = vi.mocked(getTaskStatus);
const mockedRevalidateArtwork = vi.mocked(revalidateArtwork);

function reconciliationResult(
  overrides: Partial<ArtworkReconciliationResult> = {},
): ArtworkReconciliationResult {
  return {
    task_type: "artwork_reconciliation",
    trigger: "manual",
    scan_complete: true,
    failure_reason: null,
    files_scanned: 12,
    assets_checked: 4,
    canonical_matches: 3,
    components_resolved: 2,
    still_missing: 1,
    misplaced: 1,
    duplicates: 0,
    unknown: 2,
    skipped: 0,
    errors: 0,
    samples: { misplaced: ["artwork/Ashtray/old/AB12.png"], duplicates: [], unknown: [] },
    samples_truncated: false,
    ...overrides,
  };
}

function revalidateButton() {
  return screen.getByRole("button", { name: /revalidate artwork/i });
}

describe("ArtworkScreen revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedGetArtwork.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mockedGetAllDesigns.mockResolvedValue([
      {
        id: 1,
        internal_design_id: "D000001",
        design_code: "KIDNARUTO",
        design_name: "Kid Naruto",
        is_active: true,
        created_at: "2026-07-26T00:00:00Z",
        updated_at: "2026-07-26T00:00:00Z",
      },
    ]);
    mockedGetAllConfigurationComponents.mockResolvedValue([
      {
        id: 1,
        family_code: "ASH",
        config_code: "SOLO",
        component_code: "ASH",
        quantity: 1,
        batch_group: "Ashtray",
        created_at: "2026-07-26T00:00:00Z",
        updated_at: "2026-07-26T00:00:00Z",
      },
    ]);
  });

  it("offers a Revalidate Artwork control alongside Upload Artwork", async () => {
    render(<ArtworkScreen />);

    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /upload artwork/i })).toBeInTheDocument();
    expect(revalidateButton()).toBeEnabled();
  });

  it("explains that only artwork at its exact canonical path qualifies", async () => {
    render(<ArtworkScreen />);

    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());
    expect(screen.getByText(/exact canonical path/i)).toBeInTheDocument();
  });

  it("is keyboard operable and dispatches on Enter", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-1", run_id: 1, reused: false });
    mockedGetTaskStatus.mockResolvedValue({ status: "PENDING" });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    const button = revalidateButton();
    button.focus();
    expect(button).toHaveFocus();
    // A native <button> activates on Enter via click; assert the wiring directly.
    fireEvent.click(button);

    await waitFor(() => expect(mockedRevalidateArtwork).toHaveBeenCalledTimes(1));
  });

  it("disables the control and announces progress while running", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-1", run_id: 1, reused: false });
    mockedGetTaskStatus.mockResolvedValue({ status: "PENDING" });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    fireEvent.click(revalidateButton());

    await waitFor(() => expect(revalidateButton()).toBeDisabled());
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/revalidation running/i);
  });

  it("does not dispatch a second run on double submission", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-1", run_id: 1, reused: false });
    mockedGetTaskStatus.mockResolvedValue({ status: "PENDING" });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    const button = revalidateButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(mockedRevalidateArtwork).toHaveBeenCalledTimes(1);
  });

  it("polls the shared task-status endpoint and renders the summary counts", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-9", run_id: 9, reused: false });
    mockedGetTaskStatus.mockResolvedValue({
      status: "SUCCESS",
      result: reconciliationResult(),
    });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    fireEvent.click(revalidateButton());

    await waitFor(() =>
      expect(screen.getByText(/revalidation complete/i)).toBeInTheDocument(),
    );
    expect(mockedGetTaskStatus).toHaveBeenCalledWith("/api/tasks/task-9/");

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/4 checked/);
    expect(status).toHaveTextContent(/3 found/);
    expect(status).toHaveTextContent(/2 resolved/);
    expect(status).toHaveTextContent(/1 missing/);
    expect(status).toHaveTextContent(/1 misplaced/);
    expect(status).toHaveTextContent(/0 duplicate/);
  });

  it("renders sample paths as a bounded, grouped list rather than one flat sentence", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-9", run_id: 9, reused: false });
    mockedGetTaskStatus.mockResolvedValue({
      status: "SUCCESS",
      result: reconciliationResult({
        misplaced: 2,
        samples: {
          misplaced: ["artwork/Ashtray/old/AB12.png", "artwork/Ashtray/old/AB13.png"],
          duplicates: [],
          unknown: ["artwork/unknown/loose.png"],
        },
      }),
    });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    fireEvent.click(revalidateButton());

    await waitFor(() =>
      expect(screen.getByText(/revalidation complete/i)).toBeInTheDocument(),
    );

    expect(screen.getByText(/misplaced — showing 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown — showing 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText("artwork/Ashtray/old/AB12.png")).toBeInTheDocument();
    expect(screen.getByText("artwork/unknown/loose.png")).toBeInTheDocument();
    expect(screen.queryByText(/duplicate — showing/i)).not.toBeInTheDocument();
  });

  it("refreshes the artwork list after a successful run", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-9", run_id: 9, reused: false });
    mockedGetTaskStatus.mockResolvedValue({
      status: "SUCCESS",
      result: reconciliationResult(),
    });

    render(<ArtworkScreen />);
    await waitFor(() => expect(mockedGetArtwork).toHaveBeenCalledTimes(1));

    fireEvent.click(revalidateButton());

    await waitFor(() => expect(mockedGetArtwork).toHaveBeenCalledTimes(2));
  });

  it("reports an incomplete Drive scan as a failure and does not refresh", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-9", run_id: 9, reused: false });
    mockedGetTaskStatus.mockResolvedValue({
      status: "SUCCESS",
      result: reconciliationResult({
        scan_complete: false,
        failure_reason: "folder_unreadable",
      }),
    });

    render(<ArtworkScreen />);
    await waitFor(() => expect(mockedGetArtwork).toHaveBeenCalledTimes(1));

    fireEvent.click(revalidateButton());

    await waitFor(() =>
      expect(screen.getByText(/revalidation failed/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/no artwork was changed/i);
    expect(mockedGetArtwork).toHaveBeenCalledTimes(1);
  });

  it("reports a terminal task failure clearly", async () => {
    mockedRevalidateArtwork.mockResolvedValue({ task_id: "task-9", run_id: 9, reused: false });
    mockedGetTaskStatus.mockResolvedValue({
      status: "FAILURE",
      error: "Background task failed. Retry the action.",
    });

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    fireEvent.click(revalidateButton());

    await waitFor(() =>
      expect(screen.getByText(/revalidation failed/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/background task failed/i);
    await waitFor(() => expect(revalidateButton()).toBeEnabled());
  });

  it("reports Drive or worker unavailability from the dispatch call", async () => {
    mockedRevalidateArtwork.mockRejectedValue(
      new ApiError({
        message: "Service unavailable",
        status: 503,
        details: { detail: "Drive storage is not configured." },
      }),
    );

    render(<ArtworkScreen />);
    await waitFor(() => expect(revalidateButton()).toBeInTheDocument());

    fireEvent.click(revalidateButton());

    await waitFor(() =>
      expect(screen.getByText(/revalidation failed/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/drive storage is not configured/i);
    expect(mockedGetTaskStatus).not.toHaveBeenCalled();
    await waitFor(() => expect(revalidateButton()).toBeEnabled());
  });
});
