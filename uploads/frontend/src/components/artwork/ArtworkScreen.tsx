"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  ErrorAlert,
  FilterBar,
  IconButton,
  Input,
  LoadingState,
  Select,
  StatusBadge,
} from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { StatusKey } from "@/components/status-key/StatusKey";
import { useArtworkThumbnail } from "@/hooks/useArtworkThumbnail";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import {
  ApiError,
  getAllConfigurationComponents,
  getAllDesigns,
  getArtwork,
  retireArtwork,
  revalidateArtwork,
  uploadArtwork,
} from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { ARTWORK_STATUS_KEY, group } from "@/lib/statusKeys";
import type {
  ArtworkAsset,
  ArtworkReconciliationResult,
  ConfigurationComponent,
  Design,
  PaginatedResponse,
} from "@/lib/types";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "Available", label: "Available" },
  { value: "Missing", label: "Missing" },
  { value: "Retired", label: "Retired" },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100];
// Decision #79 (P95 B4): default page size is 50; option set unchanged.
const DEFAULT_PAGE_SIZE = 50;
const ARTWORK_ORDERINGS = ["design_code", "-design_code", "-updated_at", "updated_at"] as const;

type ArtworkOrdering = (typeof ARTWORK_ORDERINGS)[number];

interface UploadState {
  file: File | null;
  designCode: string;
  componentCode: string;
  familyCode: string;
}

export function ArtworkScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const designCode = searchParams.get("design_code") ?? "";
  const componentCode = searchParams.get("component_code") ?? "";
  const status = searchParams.get("status") ?? "";
  const orderingParam = searchParams.get("ordering");
  const ordering = ARTWORK_ORDERINGS.includes(orderingParam as ArtworkOrdering)
    ? (orderingParam as ArtworkOrdering)
    : undefined;
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get("page_size")))
    ? Number(searchParams.get("page_size"))
    : DEFAULT_PAGE_SIZE;

  const [data, setData] = useState<PaginatedResponse<ArtworkAsset> | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [configurationComponents, setConfigurationComponents] = useState<ConfigurationComponent[]>([]);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    designCode: "",
    componentCode: "",
    familyCode: "",
  });
  const [retireTarget, setRetireTarget] = useState<ArtworkAsset | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<ApiError | Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [revalidateDispatching, setRevalidateDispatching] = useState(false);
  const [revalidateError, setRevalidateError] = useState<ApiError | Error | null>(null);
  const [revalidateSummary, setRevalidateSummary] = useState<ArtworkReconciliationResult | null>(
    null,
  );

  const revalidatePolling = useTaskPolling({ successStatuses: ["success", "succeeded"] });

  const loadArtwork = useCallback(() => {
    setLoading(true);
    return getArtwork({
      design_code: designCode || undefined,
      component_code: componentCode || undefined,
      status: status || undefined,
      include_retired: status === "Retired",
      ordering,
      page,
      page_size: pageSize,
    })
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error("Artwork request failed"));
      })
      .finally(() => setLoading(false));
  }, [componentCode, designCode, ordering, page, pageSize, status]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getArtwork({
      design_code: designCode || undefined,
      component_code: componentCode || undefined,
      status: status || undefined,
      include_retired: status === "Retired",
      ordering,
      page,
      page_size: pageSize,
    }), getAllDesigns(), getAllConfigurationComponents()])
      .then(([artworkPayload, designRows, componentRows]) => {
        if (active) {
          setData(artworkPayload);
          setDesigns(designRows);
          setConfigurationComponents(componentRows);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Artwork request failed"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [componentCode, designCode, ordering, page, pageSize, status]);

  const componentOptions = useMemo(() => {
    const codes = new Set<string>();
    configurationComponents.forEach((component) => codes.add(component.component_code));
    data?.results.forEach((asset) => codes.add(asset.component_code));
    return Array.from(codes)
      .sort()
      .map((code) => ({ value: code, label: code }));
  }, [configurationComponents, data]);

  const designOptions = useMemo(
    () =>
      designs
        .filter((design) => design.is_active)
        .sort((a, b) => a.design_code.localeCompare(b.design_code))
        .map((design) => ({
          value: design.design_code,
          label: `${design.design_code} — ${design.design_name}`,
        })),
    [designs],
  );

  const familyOptions = useMemo(() => {
    const codes = new Set(configurationComponents.map((component) => component.family_code));
    return Array.from(codes)
      .sort()
      .map((code) => ({ value: code, label: code }));
  }, [configurationComponents]);

  useEffect(() => {
    if (!uploadOpen) return;

    setUploadState((current) => {
      const nextDesignCode = current.designCode || designCode || designOptions[0]?.value || "";
      const nextComponentCode = current.componentCode || componentCode || componentOptions[0]?.value || "";
      if (nextDesignCode === current.designCode && nextComponentCode === current.componentCode) {
        return current;
      }
      return {
        ...current,
        designCode: nextDesignCode,
        componentCode: nextComponentCode,
      };
    });
  }, [componentCode, componentOptions, designCode, designOptions, uploadOpen]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      if (!("page" in updates)) {
        next.delete("page");
      }
      router.push(`/artwork?${next.toString()}`);
    },
    [router, searchParams],
  );

  const openUpload = () => {
    setActionError(null);
    setActionSuccess(null);
    setUploadState({
      file: null,
      designCode: designCode || designOptions[0]?.value || "",
      componentCode: componentCode || componentOptions[0]?.value || "",
      familyCode: "",
    });
    setUploadOpen(true);
  };

  const handleSort = useCallback(
    (column: "design" | "updated") => {
      const nextOrdering: ArtworkOrdering = column === "design"
        ? ordering === "design_code" ? "-design_code" : "design_code"
        : ordering === "-updated_at" ? "updated_at" : "-updated_at";
      updateParams({ ordering: nextOrdering, page: undefined });
    },
    [ordering, updateParams],
  );

  const handleUpload = useCallback(async () => {
    if (!uploadState.file || !uploadState.designCode || !uploadState.componentCode || !uploadState.familyCode) {
      setActionError(new Error("Select a file, design, component, and originating family before uploading."));
      return;
    }

    const formData = new FormData();
    formData.set("file", uploadState.file);
    formData.set("design_code", uploadState.designCode);
    formData.set("component_code", uploadState.componentCode);
    formData.set("family_code", uploadState.familyCode);

    setActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await uploadArtwork(formData);
      setUploadOpen(false);
      setActionSuccess("Artwork uploaded.");
      await loadArtwork();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Artwork upload failed"));
    } finally {
      setActionPending(false);
    }
  }, [loadArtwork, uploadState]);

  const revalidateRunning = revalidateDispatching || revalidatePolling.state === "running";

  const handleRevalidate = useCallback(async () => {
    // Guard here as well as on the button so a keyboard repeat or a queued
    // click can never dispatch a second reconciliation.
    if (revalidateRunning) return;

    setRevalidateDispatching(true);
    setRevalidateError(null);
    setRevalidateSummary(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      const payload = await revalidateArtwork();
      if (!payload.task_id) {
        throw new Error(
          "Revalidation is already running but its task is not reportable yet. Retry shortly.",
        );
      }
      revalidatePolling.start(`/api/tasks/${payload.task_id}/`);
    } catch (err: unknown) {
      setRevalidateError(
        err instanceof Error ? err : new Error("Artwork revalidation request failed"),
      );
    } finally {
      setRevalidateDispatching(false);
    }
  }, [revalidatePolling, revalidateRunning]);

  useEffect(() => {
    if (revalidatePolling.state === "succeeded") {
      const result = revalidatePolling.data?.result as ArtworkReconciliationResult | undefined;
      if (result && result.scan_complete === false) {
        setRevalidateSummary(null);
        setRevalidateError(new Error(scanFailureMessage(result.failure_reason)));
        return;
      }
      setRevalidateSummary(result ?? null);
      setRevalidateError(null);
      void loadArtwork();
    } else if (revalidatePolling.state === "failed") {
      setRevalidateSummary(null);
      setRevalidateError(
        revalidatePolling.error ??
          new Error("Artwork revalidation failed. Retry or check the worker logs."),
      );
    } else if (revalidatePolling.state === "timed_out") {
      setRevalidateSummary(null);
      setRevalidateError(
        new Error("Artwork revalidation is taking longer than expected. Check back shortly."),
      );
    }
  }, [loadArtwork, revalidatePolling.data, revalidatePolling.error, revalidatePolling.state]);

  const handleRetire = useCallback(async () => {
    if (!retireTarget) return;
    setActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await retireArtwork(retireTarget.id);
      setRetireTarget(null);
      setActionSuccess(`Artwork ${retireTarget.design_code} ${retireTarget.component_code} retired.`);
      await loadArtwork();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("Artwork retire request failed"));
    } finally {
      setActionPending(false);
    }
  }, [loadArtwork, retireTarget]);

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  const columns = [
    {
      key: "drive_share_url",
      header: "Thumb",
      width: 74,
      render: (_value: unknown, row: ArtworkAsset) => <ArtworkThumb asset={row} />,
    },
    {
      key: "design_code",
      header: (
        <SortHeader
          label="Design"
          direction={ordering === "design_code" ? "A–Z" : ordering === "-design_code" ? "Z–A" : null}
          onClick={() => handleSort("design")}
        />
      ),
      mono: true,
      // P93 Finding 16 / P95 A6: one label. `DESIGN_CODE (Design Name)` when the
      // two differ, just the code when they are the same string.
      render: (_value: unknown, row: ArtworkAsset) =>
        mergedDesignLabel(row.design_code, row.design_name),
    },
    { key: "component_code", header: "Component", mono: true },
    { key: "source_file_path", header: "Source Path", mono: true },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => <StatusBadge status={value as StatusName} size="sm" />,
    },
    {
      key: "updated_at",
      header: (
        <SortHeader
          label="Updated"
          direction={ordering === "-updated_at" ? "newest first" : ordering === "updated_at" ? "oldest first" : null}
          onClick={() => handleSort("updated")}
        />
      ),
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: "id",
      header: "",
      align: "right" as const,
      render: (_value: unknown, row: ArtworkAsset) =>
        row.status !== "Retired" ? (
          <IconButton
            icon="ban"
            label={`Retire artwork ${row.design_code} ${row.component_code}`}
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setActionError(null);
              setRetireTarget(row);
            }}
          />
        ) : null,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <FilterBar
        searchValue={designCode}
        onSearch={(value) => updateParams({ design_code: value.trim().toUpperCase() || undefined })}
        searchPlaceholder="Filter design code..."
        filters={STATUS_FILTERS.map((filter) => filter.value || "All")}
        activeFilter={status || "All"}
        onFilter={(value) => updateParams({ status: value === "All" ? undefined : value })}
        right={
          <>
            <Select
              value={componentCode}
              onChange={(event) => updateParams({ component_code: event.target.value || undefined })}
              options={[{ value: "", label: "All Components" }, ...componentOptions]}
              fullWidth={false}
            />
            <Button
              variant="outline"
              onClick={handleRevalidate}
              loading={revalidateRunning}
              disabled={revalidateRunning}
            >
              Revalidate Artwork
            </Button>
            <Button
              variant="primary"
              onClick={openUpload}
              disabled={designOptions.length === 0 || componentOptions.length === 0}
            >
              Upload Artwork
            </Button>
          </>
        }
      />

      <p
        style={{
          color: "var(--text-lo)",
          fontSize: 12,
          margin: 0,
        }}
      >
        Revalidate Artwork rescans Google Drive. Only a file at its exact canonical path —
        including folder name capitalisation — is recognised. Misplaced, duplicate, and
        unknown files are reported but never used, and nothing in Drive is changed.
      </p>

      <div role="status" aria-live="polite" aria-atomic="true">
        {revalidateRunning && (
          <ErrorAlert tone="warning" title="Revalidation running">
            Scanning the canonical artwork folder in Drive...
          </ErrorAlert>
        )}

        {!revalidateRunning && revalidateError && (
          <ErrorAlert
            tone="error"
            title="Revalidation failed"
            onDismiss={() => setRevalidateError(null)}
          >
            {formatApiError(revalidateError)}
          </ErrorAlert>
        )}

        {!revalidateRunning && !revalidateError && revalidateSummary && (
          <ErrorAlert
            tone="success"
            title="Revalidation complete"
            onDismiss={() => setRevalidateSummary(null)}
          >
            <RevalidationSummary result={revalidateSummary} />
          </ErrorAlert>
        )}
      </div>

      {actionError && (
        <ErrorAlert tone="error" title="Action failed" onDismiss={() => setActionError(null)}>
          {formatApiError(actionError)}
        </ErrorAlert>
      )}

      {actionSuccess && (
        <ErrorAlert tone="success" title="Success" onDismiss={() => setActionSuccess(null)}>
          {actionSuccess}
        </ErrorAlert>
      )}

      {loading && !data ? (
        <LoadingState variant="skeleton" rows={8} label="Loading artwork library" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="image" title="NO ARTWORK FOUND">
          Adjust filters or upload artwork for an active design.
        </EmptyState>
      ) : data ? (
        <>
          <DataTable columns={columns} rows={data.results} rowKey="id" emptyLabel="No artwork assets" />
          <Pagination
            count={data.count}
            page={page}
            pageSize={pageSize}
            hasNext={Boolean(data.next)}
            hasPrevious={Boolean(data.previous)}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            onPageSizeChange={(nextSize) =>
              updateParams({ page_size: String(nextSize), page: undefined })
            }
          />
        </>
      ) : null}

      <ConfirmModal
        open={uploadOpen}
        tone="default"
        title="Upload artwork"
        confirmLabel="Upload"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={handleUpload}
        onCancel={() => setUploadOpen(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 320 }}>
          <Input
            type="file"
            label="Artwork File"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setUploadState((current) => ({ ...current, file: event.target.files?.[0] ?? null }));
            }}
            hint={uploadState.file?.name ?? "PNG source artwork"}
          />
          <Select
            label="Design"
            value={uploadState.designCode}
            onChange={(event) => setUploadState((current) => ({ ...current, designCode: event.target.value }))}
            options={designOptions}
            placeholder="Select design"
            disabled={designOptions.length === 0}
          />
          <Select
            label="Component"
            value={uploadState.componentCode}
            onChange={(event) => setUploadState((current) => ({ ...current, componentCode: event.target.value }))}
            options={componentOptions}
            placeholder="Select component"
            disabled={componentOptions.length === 0}
          />
          <Select
            label="Originating Family"
            value={uploadState.familyCode}
            onChange={(event) => setUploadState((current) => ({ ...current, familyCode: event.target.value }))}
            options={familyOptions}
            placeholder="Select originating family"
            disabled={familyOptions.length === 0}
          />
          {actionError && <InlineError error={actionError} />}
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(retireTarget)}
        tone="danger"
        title="Retire this artwork?"
        confirmLabel="Retire"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={handleRetire}
        onCancel={() => setRetireTarget(null)}
      >
        {retireTarget
          ? `${retireTarget.design_code} ${retireTarget.component_code} will be hidden from active artwork lookup.`
          : null}
      </ConfirmModal>

      <StatusKey
        label="Artwork Library status key"
        groups={[group("Artwork", ARTWORK_STATUS_KEY)]}
      />
    </div>
  );
}

function SortHeader({
  label,
  direction,
  onClick,
}: {
  label: "Design" | "Updated";
  direction: "A–Z" | "Z–A" | "newest first" | "oldest first" | null;
  onClick: () => void;
}) {
  const initialDirection = label === "Design" ? "A to Z" : "newest first";
  const activeDirection = direction?.replace("–", " to ") ?? initialDirection;
  const nextDirection = label === "Design"
    ? direction === "A–Z" ? "Z to A" : "A to Z"
    : direction === "newest first" ? "oldest first" : "newest first";
  const arrow = direction === "A–Z" || direction === "oldest first" ? "↑" : "↓";

  return (
    <button
      type="button"
      aria-label={`Sort ${label}: ${activeDirection}. Activate to sort ${nextDirection}.`}
      onClick={onClick}
      style={{
        alignItems: "center",
        background: "transparent",
        border: 0,
        color: direction ? "var(--text-mid)" : "inherit",
        cursor: "pointer",
        display: "inline-flex",
        font: "inherit",
        gap: 5,
        letterSpacing: "inherit",
        padding: 0,
        textTransform: "inherit",
      }}
    >
      <span>{label}</span>
      {direction && <span aria-hidden="true">{arrow} {direction}</span>}
    </button>
  );
}

function ArtworkThumb({ asset }: { asset: ArtworkAsset }) {
  const canRender = Boolean(asset.drive_share_url) && asset.status === "Available";
  const { imageUrl } = useArtworkThumbnail(asset.id, canRender);

  return (
    <div
      aria-label={`${asset.design_code} ${asset.component_code} artwork thumbnail`}
      style={{
        alignItems: "center",
        background: "var(--ink-850)",
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundPosition: "center",
        backgroundSize: "cover",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        height: 44,
        justifyContent: "center",
        overflow: "hidden",
        width: 44,
      }}
    >
      {!imageUrl && (
        <span
          style={{
            color: "var(--text-low)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
          }}
        >
          {asset.component_code.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

function InlineError({ error }: { error: Error }) {
  return (
    <ErrorAlert tone="error" title="Validation error">
      {formatApiError(error)}
    </ErrorAlert>
  );
}

function Pagination({
  count,
  page,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
}: {
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        color: "var(--text-lo)",
        display: "flex",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        gap: "var(--space-3)",
        justifyContent: "flex-end",
      }}
    >
      <span>{count} artwork assets</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>Per page</span>
        <Select
          value={String(pageSize)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onPageSizeChange(Number(e.target.value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
          fullWidth={false}
          style={{ width: 76 }}
        />
      </div>
      <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>
        Prev
      </Button>
      <span>Page {page}</span>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}

const SCAN_FAILURE_MESSAGES: Record<string, string> = {
  drive_not_configured: "Google Drive storage is not configured. No artwork was changed.",
  drive_credentials_invalid:
    "Google Drive authentication failed. No artwork was changed.",
  drive_scan_failed: "The Drive scan failed. No artwork was changed.",
  artwork_root_unreadable:
    "The canonical artwork folder could not be read. No artwork was changed.",
  artwork_root_ambiguous:
    "More than one folder named 'artwork' exists in Drive. No artwork was changed.",
  folder_unreadable:
    "Part of the artwork folder could not be read, so the scan was incomplete. No artwork was changed.",
  cyclic_parent_relationship:
    "The artwork folder structure could not be resolved. No artwork was changed.",
  malformed_drive_entry:
    "Drive returned an unreadable entry, so the scan was incomplete. No artwork was changed.",
  max_depth_exceeded:
    "The artwork folder is nested more deeply than the scan supports. No artwork was changed.",
  max_entries_exceeded:
    "The artwork folder holds more files than one scan supports. No artwork was changed.",
};

function scanFailureMessage(reason?: string | null): string {
  if (reason && SCAN_FAILURE_MESSAGES[reason]) {
    return SCAN_FAILURE_MESSAGES[reason];
  }
  return "The Drive scan did not complete, so no artwork was changed.";
}

// Samples are already bounded server-side (SAMPLE_LIMIT); this caps defensively
// so the UI never renders an unbounded list regardless of payload shape.
const SAMPLE_DISPLAY_CAP = 20;

function summarizeReconciliation(result: ArtworkReconciliationResult): string {
  const parts = [
    `${result.assets_checked} checked`,
    `${result.canonical_matches} found`,
    `${result.components_resolved} resolved`,
    `${result.still_missing} missing`,
    `${result.misplaced} misplaced`,
    `${result.duplicates} duplicate`,
    `${result.unknown} unknown`,
  ];
  return `${parts.join(", ")} (${result.files_scanned} files scanned).`;
}

function RevalidationSummary({ result }: { result: ArtworkReconciliationResult }) {
  const sampleGroups = [
    { label: "Misplaced", total: result.misplaced, paths: result.samples?.misplaced ?? [] },
    { label: "Duplicate", total: result.duplicates, paths: result.samples?.duplicates ?? [] },
    { label: "Unknown", total: result.unknown, paths: result.samples?.unknown ?? [] },
  ].filter((group) => group.paths.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <p style={{ margin: 0 }}>{summarizeReconciliation(result)}</p>
      {sampleGroups.map((group) => {
        const shown = group.paths.slice(0, SAMPLE_DISPLAY_CAP);
        return (
          <div key={group.label}>
            <div
              style={{
                color: "var(--text-lo)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              {`${group.label} — showing ${shown.length} of ${group.total}`}
            </div>
            <ul style={{ fontFamily: "var(--font-mono)", fontSize: 12, margin: 0, paddingLeft: 18 }}>
              {shown.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

/** One design label: `CODE (Name)` when they differ, just `CODE` when identical. */
function mergedDesignLabel(designCode: string, designName?: string | null): string {
  const name = (designName ?? "").trim();
  if (!name || name === designCode) return designCode;
  return `${designCode} (${name})`;
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Artwork unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to manage artwork.";
  }
  return formatApiError(error);
}

function formatApiError(error: Error): string {
  if (!(error instanceof ApiError) || error.details == null) {
    return error.message || "Request failed.";
  }
  return stringifyDetails(error.details) || error.message;
}

function stringifyDetails(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(stringifyDetails).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${stringifyDetails(item)}`)
      .filter(Boolean)
      .join(" ");
  }
  return value == null ? "" : String(value);
}
