"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, getTaskStatus } from "@/lib/api";
import type { TaskStatusResponse, TaskStatusState } from "@/lib/types";

export interface UseTaskPollingOptions {
  /** Poll interval in milliseconds. */
  intervalMs?: number;
  /** Maximum time to poll before giving up as timed_out. */
  timeoutMs?: number;
  /** Status values (case-insensitive) treated as success. Defaults to ["succeeded", "success", "completed", "done"]. */
  successStatuses?: string[];
  /** Status values (case-insensitive) treated as failure. Defaults to ["failed", "failure", "error"]. */
  failureStatuses?: string[];
  /** Require an explicit persisted-output proof before accepting terminal success. */
  requireOutputReady?: boolean;
}

export interface UseTaskPollingResult {
  state: TaskStatusState;
  data: TaskStatusResponse | null;
  error: ApiError | Error | null;
  /** Begin polling the given task status URL until a terminal state or timeout. */
  start: (statusUrl: string) => void;
  /** Stop polling and reset to idle. */
  reset: () => void;
  /** Stop polling without resetting the last known data/error. */
  cancel: () => void;
}

const DEFAULT_SUCCESS_STATUSES = ["succeeded", "success", "completed", "done"];
const DEFAULT_FAILURE_STATUSES = ["failed", "failure", "error", "revoked"];

/**
 * Generic, screen-agnostic polling hook for backend task-status endpoints.
 * Not coupled to any specific domain (Orders, Batches, etc) — callers pass a
 * status URL to poll. Intended to be the single shared polling implementation
 * reused across screens (Orders reimport, PPTX generation, packing export).
 */
export function useTaskPolling(options: UseTaskPollingOptions = {}): UseTaskPollingResult {
  const {
    intervalMs = 2000,
    timeoutMs = 120000,
    successStatuses = DEFAULT_SUCCESS_STATUSES,
    failureStatuses = DEFAULT_FAILURE_STATUSES,
    requireOutputReady = false,
  } = options;

  const [state, setState] = useState<TaskStatusState>("idle");
  const [data, setData] = useState<TaskStatusResponse | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    activeRef.current = false;
    clearTimers();
  }, [clearTimers]);

  const reset = useCallback(() => {
    cancel();
    setState("idle");
    setData(null);
    setError(null);
  }, [cancel]);

  const start = useCallback(
    (statusUrl: string) => {
      cancel();
      activeRef.current = true;
      setState("running");
      setData(null);
      setError(null);

      const poll = async () => {
        if (!activeRef.current) return;
        try {
          const payload = await getTaskStatus(statusUrl);
          if (!activeRef.current) return;
          setData(payload);

          const normalizedStatus = payload.status?.toLowerCase?.() ?? "";
          if (successStatuses.includes(normalizedStatus)) {
            if (payload.output_ready === false || (requireOutputReady && payload.output_ready !== true)) {
              setState("failed");
              setError(
                new Error(
                  payload.error ??
                    "Task completed without the required persisted output. Retry the action.",
                ),
              );
            } else {
              setState("succeeded");
            }
            cancel();
          } else if (failureStatuses.includes(normalizedStatus)) {
            setState("failed");
            setError(new Error(payload.error ?? "Background task failed. Retry the action."));
            cancel();
          }
        } catch (err: unknown) {
          if (!activeRef.current) return;
          setError(err instanceof Error ? err : new Error("Task status request failed"));
          setState("failed");
          cancel();
        }
      };

      timerRef.current = setInterval(poll, intervalMs);
      timeoutRef.current = setTimeout(() => {
        if (activeRef.current) {
          setState("timed_out");
          cancel();
        }
      }, timeoutMs);

      void poll();
    },
    [cancel, failureStatuses, intervalMs, requireOutputReady, successStatuses, timeoutMs],
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { state, data, error, start, reset, cancel };
}
