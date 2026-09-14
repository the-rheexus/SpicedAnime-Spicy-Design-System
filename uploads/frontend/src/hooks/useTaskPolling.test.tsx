import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTaskPolling } from "@/hooks/useTaskPolling";
import { getTaskStatus } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, getTaskStatus: vi.fn() };
});

const mockedGetTaskStatus = vi.mocked(getTaskStatus);

describe("useTaskPolling", () => {
  beforeEach(() => {
    mockedGetTaskStatus.mockReset();
  });

  it("continues polling through non-terminal Celery states", async () => {
    mockedGetTaskStatus
      .mockResolvedValueOnce({ task_id: "task-1", status: "PENDING", celery_status: "PENDING" })
      .mockResolvedValueOnce({ task_id: "task-1", status: "STARTED", celery_status: "STARTED" })
      .mockResolvedValueOnce({
        task_id: "task-1",
        status: "SUCCESS",
        celery_status: "SUCCESS",
        output_ready: true,
        result: { task_type: "pptx_generation", batch_id: 1, generated_file_id: 2 },
      });
    const { result } = renderHook(() =>
      useTaskPolling({ intervalMs: 5, timeoutMs: 1000, requireOutputReady: true }),
    );

    act(() => result.current.start("/api/tasks/task-1/"));

    await waitFor(() => expect(mockedGetTaskStatus).toHaveBeenCalledTimes(3));
    expect(result.current.state).toBe("succeeded");
  });

  it("surfaces terminal FAILURE as an error", async () => {
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-2",
      status: "FAILURE",
      celery_status: "FAILURE",
      error: "PPTX generation failed. Retry from Batch Detail.",
    });
    const { result } = renderHook(() =>
      useTaskPolling({ intervalMs: 5, timeoutMs: 1000, requireOutputReady: true }),
    );

    act(() => result.current.start("/api/tasks/task-2/"));

    await waitFor(() => expect(result.current.state).toBe("failed"));
    expect(result.current.error?.message).toContain("Retry from Batch Detail");
  });

  it("rejects terminal SUCCESS when persisted output proof is false", async () => {
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-3",
      status: "SUCCESS",
      celery_status: "SUCCESS",
      output_ready: false,
      error: "Task completed without a persisted PPTX output.",
    });
    const { result } = renderHook(() =>
      useTaskPolling({ intervalMs: 5, timeoutMs: 1000, requireOutputReady: true }),
    );

    act(() => result.current.start("/api/tasks/task-3/"));

    await waitFor(() => expect(result.current.state).toBe("failed"));
    expect(result.current.error?.message).toContain("persisted PPTX output");
  });

  it("accepts terminal SUCCESS only with positive output proof", async () => {
    mockedGetTaskStatus.mockResolvedValue({
      task_id: "task-4",
      status: "SUCCESS",
      celery_status: "SUCCESS",
      output_ready: true,
      result: { task_type: "pptx_generation", batch_id: 1, generated_file_id: 2 },
    });
    const { result } = renderHook(() =>
      useTaskPolling({ intervalMs: 5, timeoutMs: 1000, requireOutputReady: true }),
    );

    act(() => result.current.start("/api/tasks/task-4/"));

    await waitFor(() => expect(result.current.state).toBe("succeeded"));
    expect(result.current.error).toBeNull();
  });
});
