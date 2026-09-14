import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BatchDetailScreen } from "@/components/batches/BatchDetailScreen";
import {
  flagComponentReprint,
  generateBatchPptx,
  getBatch,
  getTaskStatus,
  markBatchPrinted,
} from "@/lib/api";
import type { GeneratedFile, ProductionBatch } from "@/lib/types";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    flagComponentReprint: vi.fn(),
    generateBatchPptx: vi.fn(),
    getBatch: vi.fn(),
    getTaskStatus: vi.fn(),
    markBatchPrinted: vi.fn(),
  };
});

const mockedFlagComponentReprint = vi.mocked(flagComponentReprint);
const mockedGenerateBatchPptx = vi.mocked(generateBatchPptx);
const mockedGetBatch = vi.mocked(getBatch);
const mockedGetTaskStatus = vi.mocked(getTaskStatus);
const mockedMarkBatchPrinted = vi.mocked(markBatchPrinted);

const LOCKED_AT = "2026-07-21T10:00:00Z";

function pptxFile(overrides: Partial<GeneratedFile> = {}): GeneratedFile {
  return {
    id: 41,
    file_type: "pptx",
    file_name: "Ashtray-BATCH-20260721-001.pptx",
    mime_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    storage_path: "batches/2026-07-21/Ashtray-BATCH-20260721-001.pptx",
    drive_file_id: "drive-41",
    drive_share_url: "https://drive.example/41",
    created_at: "2026-07-21T10:01:00Z",
    updated_at: "2026-07-21T10:01:00Z",
    ...overrides,
  };
}

function batch(overrides: Partial<ProductionBatch> = {}): ProductionBatch {
  return {
    id: 1,
    production_group: "Ashtray",
    batch_number: 1,
    batch_label: "Ashtray #1",
    status: "Locked for Review",
    opened_at: "2026-07-21T09:00:00Z",
    locked_at: LOCKED_AT,
    generated_file_url: "https://drive.example/41",
    created_at: "2026-07-21T09:00:00Z",
    updated_at: "2026-07-21T10:01:00Z",
    batch_items: [],
    generated_files: [pptxFile()],
    component_status_counts: {},
    ...overrides,
  };
}

async function confirmGeneration() {
  // With no selection the action is the all-items branch (P69).
  fireEvent.click(await screen.findByRole("button", { name: "Generate PPTX (All Items)" }));
  await screen.findByRole("heading", { name: "Generate PPTX for this batch?" });
  const buttons = screen.getAllByRole("button", { name: "Generate PPTX (All Items)" });
  fireEvent.click(buttons[buttons.length - 1]);
}

describe("BatchDetailScreen PPTX truthfulness", () => {
  beforeEach(() => {
    mockedFlagComponentReprint.mockReset();
    mockedGenerateBatchPptx.mockReset();
    mockedGetBatch.mockReset();
    mockedGetTaskStatus.mockReset();
    mockedMarkBatchPrinted.mockReset();
  });

  it("enables download and Mark Printed for a current persisted PPTX with a Drive URL", async () => {
    mockedGetBatch.mockResolvedValue(batch());

    render(<BatchDetailScreen batchId="1" />);

    expect(await screen.findByRole("link", { name: "Download latest PPTX" })).toHaveAttribute(
      "href",
      "https://drive.example/41",
    );
    expect(screen.getByRole("button", { name: "Mark Printed" })).toBeEnabled();
  });

  it("enables download and Mark Printed when created_at trails locked_at by ordinary clock skew (P73 Bug 1)", async () => {
    // locked_at (web service clock) and created_at (Celery worker clock) are
    // written by separate backend processes with independently synced clocks.
    // A few seconds of created_at landing before locked_at is expected skew,
    // not staleness, and must not disable Mark Printed / hide the download link.
    mockedGetBatch.mockResolvedValue(
      batch({ generated_files: [pptxFile({ created_at: "2026-07-21T09:59:57Z" })] }),
    );

    render(<BatchDetailScreen batchId="1" />);

    expect(await screen.findByRole("link", { name: "Download latest PPTX" })).toHaveAttribute(
      "href",
      "https://drive.example/41",
    );
    expect(screen.getByRole("button", { name: "Mark Printed" })).toBeEnabled();
  });

  it.each([
    ["missing output", batch({ generated_file_url: null, generated_files: [] })],
    [
      "empty URL",
      batch({
        generated_file_url: "",
        generated_files: [pptxFile({ drive_share_url: "" })],
      }),
    ],
    [
      "stale prior output",
      batch({ generated_files: [pptxFile({ created_at: "2026-07-21T09:59:00Z" })] }),
    ],
  ])("keeps Mark Printed disabled for %s", async (_label, payload) => {
    mockedGetBatch.mockResolvedValue(payload);

    render(<BatchDetailScreen batchId="1" />);

    expect(await screen.findByRole("button", { name: "Mark Printed" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Download latest PPTX" })).not.toBeInTheDocument();
  });

  it("does not announce completion when Celery succeeds without the matching persisted output", async () => {
    const open = batch({
      status: "Open",
      locked_at: null,
      generated_file_url: null,
      generated_files: [],
    });
    const lockedWithoutOutput = batch({ generated_file_url: null, generated_files: [] });
    mockedGetBatch
      .mockResolvedValueOnce(open)
      .mockResolvedValueOnce(lockedWithoutOutput)
      .mockResolvedValueOnce(lockedWithoutOutput);
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 1,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 2,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: true,
      task_id: "task-missing-output",
    });
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-missing-output",
      status: "SUCCESS",
      celery_status: "SUCCESS",
      output_ready: true,
      result: { task_type: "pptx_generation", batch_id: 1, generated_file_id: 41 },
    });

    render(<BatchDetailScreen batchId="1" />);
    await confirmGeneration();

    expect(await screen.findByText(/matching persisted PPTX output/i)).toBeVisible();
    expect(screen.queryByText("PPTX generation complete.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Printed" })).toBeDisabled();
  });

  it("announces completion only after terminal success matches the refreshed persisted output", async () => {
    const open = batch({
      status: "Open",
      locked_at: null,
      generated_file_url: null,
      generated_files: [],
    });
    const lockedWithoutOutput = batch({ generated_file_url: null, generated_files: [] });
    const lockedWithOutput = batch();
    mockedGetBatch
      .mockResolvedValueOnce(open)
      .mockResolvedValueOnce(lockedWithoutOutput)
      .mockResolvedValueOnce(lockedWithOutput);
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 1,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 2,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: true,
      task_id: "task-complete",
    });
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-complete",
      status: "SUCCESS",
      celery_status: "SUCCESS",
      output_ready: true,
      result: { task_type: "pptx_generation", batch_id: 1, generated_file_id: 41 },
    });

    render(<BatchDetailScreen batchId="1" />);
    await confirmGeneration();

    expect(await screen.findByText("PPTX generation complete.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Mark Printed" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Download latest PPTX" })).toHaveAttribute(
      "href",
      "https://drive.example/41",
    );
  });

  it("surfaces terminal failure and never enables Mark Printed", async () => {
    const open = batch({
      status: "Open",
      locked_at: null,
      generated_file_url: null,
      generated_files: [],
    });
    const lockedWithoutOutput = batch({ generated_file_url: null, generated_files: [] });
    mockedGetBatch.mockResolvedValueOnce(open).mockResolvedValueOnce(lockedWithoutOutput).mockResolvedValue(open);
    mockedGenerateBatchPptx.mockResolvedValue({
      locked_batch_id: 1,
      locked_batch_status: "Locked for Review",
      replacement_open_batch_id: 2,
      replacement_open_batch_status: "Open",
      replacement_open_batch_created: true,
      task_id: "task-failed",
    });
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-failed",
      status: "FAILURE",
      celery_status: "FAILURE",
      output_ready: false,
      error: "PPTX generation failed. Retry from Batch Detail.",
    });

    render(<BatchDetailScreen batchId="1" />);
    await confirmGeneration();

    expect(await screen.findByText(/PPTX generation failed\. Retry from Batch Detail\./)).toBeVisible();
    expect(screen.queryByText("PPTX generation complete.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark Printed" })).not.toBeInTheDocument();
  });
});

describe("BatchDetailScreen component status display", () => {
  beforeEach(() => {
    mockedGetBatch.mockReset();
  });

  it('shows a Canceled production component as "Print Not Needed" (display-only; batch status unaffected)', async () => {
    mockedGetBatch.mockResolvedValue(
      batch({
        batch_items: [
          {
            id: 1,
            batch: 1,
            created_at: "2026-08-13T09:00:00Z",
            component: {
              id: 50,
              component_code: "ASH",
              family_code: "ASH",
              design_code: "TEST",
              config_code: "SOLO",
              batch_group: "Ashtray",
              status: "Canceled",
              order_number: "1001",
              order_item_id: 1,
              created_at: "2026-08-13T09:00:00Z",
              updated_at: "2026-08-13T09:00:00Z",
            },
          },
        ],
      }),
    );

    render(<BatchDetailScreen batchId="1" />);

    // The component row and its Component status-key legend entry both say
    // "Print Not Needed".
    expect(await screen.findAllByText("Print Not Needed")).toHaveLength(2);
    // The batch's own status ("Locked for Review") is untouched by the
    // component-level override.
    expect(screen.getAllByText("Locked for Review").length).toBeGreaterThan(0);
    expect(screen.queryByText("Canceled")).not.toBeInTheDocument();
  });
});
