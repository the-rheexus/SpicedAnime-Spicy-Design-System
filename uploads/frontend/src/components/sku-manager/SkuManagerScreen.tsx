"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  ErrorAlert,
  FilterBar,
  Icon,
  IconButton,
  Input,
  LoadingState,
  Select,
} from "@/components/ds";
import { SelectCheckbox } from "@/components/batches/SelectCheckbox";
import { StatusKey } from "@/components/status-key/StatusKey";
import {
  acceptSkuProposal,
  ApiError,
  exportSkusCsv,
  generateSkuProposals,
  getShopifyCatalog,
  patchSku,
  retireSku,
} from "@/lib/api";
import { SKU_STATUS_KEY, group } from "@/lib/statusKeys";
import type { OfferSku, PaginatedResponse, ShopifyCatalogRow, SkuProposal } from "@/lib/types";

const HAS_SKU_FILTERS = [
  { value: "All", label: "All" },
  { value: "HasSku", label: "Has SKU" },
  { value: "NoSku", label: "No SKU" },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100];
// Decision #79 (P95 B4): default page size is 50; option set unchanged.
const DEFAULT_PAGE_SIZE = 50;

function keyFor(row: ShopifyCatalogRow): string {
  return String(row.variant_id);
}

function hasSkuParamFor(filter: string): boolean | undefined {
  if (filter === "HasSku") return true;
  if (filter === "NoSku") return false;
  return undefined;
}

type EditAction = { edit: OfferSku } | { retire: OfferSku } | null;

export function SkuManagerScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get("page_size")))
    ? Number(searchParams.get("page_size"))
    : DEFAULT_PAGE_SIZE;
  const search = searchParams.get("search") ?? "";
  const productType = searchParams.get("product_type") ?? "";
  const hasSkuFilter = searchParams.get("has_sku") === "true"
    ? "HasSku"
    : searchParams.get("has_sku") === "false"
      ? "NoSku"
      : "All";

  const [data, setData] = useState<PaginatedResponse<ShopifyCatalogRow> | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Record<string, ShopifyCatalogRow>>({});
  const [editAction, setEditAction] = useState<EditAction>(null);
  const [skuDraft, setSkuDraft] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<ApiError | Error | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [proposals, setProposals] = useState<SkuProposal[] | null>(null);
  const [proposalChoices, setProposalChoices] = useState<Record<number | string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [acceptingKey, setAcceptingKey] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);

  const hasSkuParam = hasSkuParamFor(hasSkuFilter);

  const loadCatalog = useCallback(() => {
    setLoading(true);
    return getShopifyCatalog({
      page,
      page_size: pageSize,
      search: search.trim() || undefined,
      product_type: productType.trim() || undefined,
      has_sku: hasSkuParam,
    })
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error("Shopify catalog request failed"));
      })
      .finally(() => setLoading(false));
  }, [hasSkuParam, page, pageSize, productType, search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getShopifyCatalog({
      page,
      page_size: pageSize,
      search: search.trim() || undefined,
      product_type: productType.trim() || undefined,
      has_sku: hasSkuParam,
    })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error("Shopify catalog request failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hasSkuParam, page, pageSize, productType, search]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      const query = next.toString();
      router.push(`/sku-manager${query ? `?${query}` : ""}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => updateParams({ search: value.trim() || undefined, page: undefined }),
    [updateParams],
  );

  const handleProductTypeFilter = useCallback(
    (value: string) => updateParams({ product_type: value.trim() || undefined, page: undefined }),
    [updateParams],
  );

  const handleHasSkuFilter = useCallback((value: string) => {
    updateParams({ has_sku: hasSkuParamFor(value) === undefined ? undefined : String(hasSkuParamFor(value)), page: undefined });
  }, [updateParams]);

  const handlePageSizeChange = useCallback((nextSize: number) => {
    updateParams({ page_size: String(nextSize), page: undefined });
  }, [updateParams]);

  const toggleSelected = useCallback((row: ShopifyCatalogRow) => {
    setSelected((prev) => {
      const key = keyFor(row);
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = row;
      }
      return next;
    });
  }, []);

  const selectableRows = useMemo(
    () => (data?.results ?? []).filter((row) => !row.has_sku),
    [data],
  );
  const selectedCount = Object.keys(selected).length;
  const allSelectableSelected =
    selectableRows.length > 0 && selectableRows.every((row) => selected[keyFor(row)]);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (allSelectableSelected) {
        const next = { ...prev };
        selectableRows.forEach((row) => delete next[keyFor(row)]);
        return next;
      }
      const next = { ...prev };
      selectableRows.forEach((row) => {
        next[keyFor(row)] = row;
      });
      return next;
    });
  }, [allSelectableSelected, selectableRows]);

  const openEdit = (row: ShopifyCatalogRow) => {
    if (!row.offer_sku) return;
    setActionError(null);
    setActionSuccess(null);
    setSkuDraft(row.offer_sku.sku);
    setEditAction({ edit: row.offer_sku });
  };

  const handleUpdate = useCallback(async () => {
    if (!editAction || !("edit" in editAction)) return;
    const sku = skuDraft.trim().toUpperCase();
    if (!sku) {
      setActionError(new Error("SKU is required."));
      return;
    }
    setActionPending(true);
    setActionError(null);
    try {
      await patchSku(editAction.edit.id, { sku });
      setEditAction(null);
      setActionSuccess(`SKU ${sku} updated.`);
      await loadCatalog();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("SKU update request failed"));
    } finally {
      setActionPending(false);
    }
  }, [editAction, loadCatalog, skuDraft]);

  const handleRetire = useCallback(async () => {
    if (!editAction || !("retire" in editAction)) return;
    setActionPending(true);
    setActionError(null);
    try {
      await retireSku(editAction.retire.id);
      setEditAction(null);
      setActionSuccess(`SKU ${editAction.retire.sku} retired.`);
      await loadCatalog();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("SKU retire request failed"));
    } finally {
      setActionPending(false);
    }
  }, [editAction, loadCatalog]);

  const openCreate = useCallback(async () => {
    const rows = Object.values(selected);
    if (rows.length === 0) return;
    setCreateOpen(true);
    setGenerating(true);
    setProposals(null);
    setProposalChoices({});
    setActionError(null);
    try {
      const result = await generateSkuProposals(
        rows.map((row) => ({
          variant_id: row.variant_id,
          product_handle: row.product_handle,
          product_title: row.product_title,
          product_type: row.product_type,
          tags: row.tags,
          option_values: row.option_values,
          option_names: row.option_names,
        })),
      );
      setProposals(result.proposals);
      const defaults: Record<number | string, string> = {};
      result.proposals.forEach((proposal) => {
        if (proposal.proposed_skus.length > 0) {
          defaults[proposal.variant_id] = proposal.proposed_skus[0].sku;
        }
      });
      setProposalChoices(defaults);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("SKU generation request failed"));
    } finally {
      setGenerating(false);
    }
  }, [selected]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setProposals(null);
    setProposalChoices({});
    setActionError(null);
  }, []);

  const handleAccept = useCallback(
    async (proposal: SkuProposal) => {
      const chosenSku = proposalChoices[proposal.variant_id];
      if (!chosenSku) return;
      const row = Object.values(selected).find((r) => r.variant_id === proposal.variant_id);
      setAcceptingKey(String(proposal.variant_id));
      setActionError(null);
      try {
        await acceptSkuProposal({
          sku: chosenSku,
          product_handle: row?.product_handle,
          product_title: row?.product_title,
          option_values: row?.option_values,
          option_names: row?.option_names,
        });
        setProposals((prev) => (prev ? prev.filter((p) => p.variant_id !== proposal.variant_id) : prev));
        setSelected((prev) => {
          if (!row) return prev;
          const next = { ...prev };
          delete next[keyFor(row)];
          return next;
        });
        setActionSuccess(`SKU ${chosenSku} created.`);
        await loadCatalog();
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err : new Error("SKU accept request failed"));
      } finally {
        setAcceptingKey(null);
      }
    },
    [loadCatalog, proposalChoices, selected],
  );

  const handleExport = useCallback(async () => {
    setExporting(true);
    setActionError(null);
    try {
      await exportSkusCsv();
      setActionSuccess("CSV export downloaded.");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err : new Error("CSV export request failed"));
    } finally {
      setExporting(false);
    }
  }, []);

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  const columns = [
    {
      key: "select",
      header: (
        <SelectCheckbox
          checked={allSelectableSelected}
          disabled={selectableRows.length === 0}
          label="Select all no-SKU rows on this page"
          onChange={toggleSelectAll}
        />
      ),
      render: (_value: unknown, row: ShopifyCatalogRow) =>
        row.has_sku ? null : (
          <SelectCheckbox
            checked={Boolean(selected[keyFor(row)])}
            label={`Select ${row.product_title}`}
            onChange={() => toggleSelected(row)}
          />
        ),
    },
    { key: "product_title", header: "Product" },
    { key: "product_type", header: "Type" },
    {
      key: "option_values",
      header: "Options",
      render: (value: unknown) => formatOptionValues(value as string[] | undefined),
    },
    {
      key: "sku",
      header: "SKU",
      mono: true,
      render: (value: unknown) => (value ? String(value) : "—"),
    },
    {
      key: "has_sku",
      header: "Registry status",
      // P95 A7: the has-SKU / no-SKU decision must read the same value the SKU
      // column renders (`row.sku`). A populated SKU string previously still
      // showed a "No SKU" badge whenever `row.has_sku` was false.
      render: (_value: unknown, row: ShopifyCatalogRow) => {
        if (!row.sku) {
          return (
            <Badge tone="danger">
              <Icon name="octagon-x" size={11} strokeWidth={2.25} />
              No SKU
            </Badge>
          );
        }
        const active = row.offer_sku ? row.offer_sku.is_active : true;
        return active ? (
          <Badge tone="success">
            <Icon name="circle-check" size={11} strokeWidth={2.25} />
            Active
          </Badge>
        ) : (
          <Badge tone="neutral">Retired</Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (_value: unknown, row: ShopifyCatalogRow) =>
        row.offer_sku ? (
          <div style={{ display: "inline-flex", gap: 6 }}>
            <IconButton icon="refresh-cw" label={`Update SKU ${row.offer_sku.sku}`} size="sm" onClick={() => openEdit(row)} />
            {row.offer_sku.is_active && (
              <IconButton
                icon="ban"
                label={`Retire SKU ${row.offer_sku.sku}`}
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setEditAction({ retire: row.offer_sku as OfferSku });
                }}
              />
            )}
          </div>
        ) : null,
    },
  ];

  const isEditing = Boolean(editAction && "edit" in editAction);
  const isRetiring = Boolean(editAction && "retire" in editAction);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <FilterBar
        filters={HAS_SKU_FILTERS}
        activeFilter={hasSkuFilter}
        onFilter={handleHasSkuFilter}
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={handleExport} loading={exporting}>
              Export CSV
            </Button>
            <Button variant="primary" disabled={selectedCount === 0} onClick={openCreate}>
              Create SKU{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flex: "1 1 460px", gap: 8, flexWrap: "wrap" }}>
          <Input
            label="Search catalog"
            hint="Product name or canonical SKU"
            value={search}
            placeholder="Search product name or canonical SKU..."
            iconLeft="search"
            onChange={(event) => handleSearch(event.target.value)}
            style={{ flex: "1 1 250px" }}
          />
          <Input
            label="Product type"
            hint="Exact Shopify product type"
            value={productType}
            placeholder="Filter by exact product type..."
            onChange={(event) => handleProductTypeFilter(event.target.value)}
            style={{ flex: "1 1 190px" }}
          />
        </div>
      </FilterBar>

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
        <LoadingState variant="skeleton" rows={8} label="Loading SKU manager" />
      ) : data && data.results.length === 0 ? (
        <EmptyState icon="tag" title="NO PRODUCTS FOUND">
          {search.trim() || productType.trim() || hasSkuFilter !== "All"
            ? "Adjust the current search, product-type, or SKU filter."
            : "The Shopify catalog is empty."}
        </EmptyState>
      ) : data ? (
        <>
          <DataTable columns={columns} rows={data.results} rowKey="variant_id" emptyLabel="No products" />
          <Pagination
            count={data.count}
            page={page}
            pageSize={pageSize}
            hasNext={Boolean(data.next)}
            hasPrevious={Boolean(data.previous)}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      ) : null}

      <ConfirmModal
        open={isEditing}
        tone="default"
        title="Update SKU"
        confirmLabel="Update"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={handleUpdate}
        onCancel={() => setEditAction(null)}
      >
        <SkuForm skuDraft={skuDraft} setSkuDraft={setSkuDraft} error={actionError} />
      </ConfirmModal>

      <ConfirmModal
        open={isRetiring}
        tone="danger"
        title="Retire this SKU?"
        confirmLabel="Retire"
        cancelLabel="Cancel"
        loading={actionPending}
        onConfirm={handleRetire}
        onCancel={() => setEditAction(null)}
      >
        {editAction && "retire" in editAction
          ? `${editAction.retire.sku} will remain in history but stop being active.`
          : null}
      </ConfirmModal>

      {createOpen && (
        <CreateSkuDialog
          generating={generating}
          proposals={proposals}
          proposalChoices={proposalChoices}
          setProposalChoices={setProposalChoices}
          acceptingKey={acceptingKey}
          onAccept={handleAccept}
          onClose={closeCreate}
        />
      )}

      <StatusKey label="SKU Manager status key" groups={[group("Offer SKU", SKU_STATUS_KEY)]} />
    </div>
  );
}

export function CreateSkuDialog({
  generating,
  proposals,
  proposalChoices,
  setProposalChoices,
  acceptingKey,
  onAccept,
  onClose,
}: {
  generating: boolean;
  proposals: SkuProposal[] | null;
  proposalChoices: Record<number | string, string>;
  setProposalChoices: (updater: (prev: Record<number | string, string>) => Record<number | string, string>) => void;
  acceptingKey: string | null;
  onAccept: (proposal: SkuProposal) => void;
  onClose: () => void;
}) {
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.66)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "80vh",
          overflowY: "auto",
          background: "var(--surface-panel)",
          border: "1px solid var(--line-strong)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-pop)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, textTransform: "uppercase" }}>Create SKU</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {generating ? (
          <LoadingState variant="skeleton" rows={4} label="Generating SKU proposals" />
        ) : proposals && proposals.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.variant_id}
                proposal={proposal}
                chosen={proposalChoices[proposal.variant_id]}
                onChoose={(sku) =>
                  setProposalChoices((prev) => ({ ...prev, [proposal.variant_id]: sku }))
                }
                pending={acceptingKey === String(proposal.variant_id)}
                onAccept={() => onAccept(proposal)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="check" title="ALL DONE">
            Every selected product has been accepted or has no proposals remaining.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  chosen,
  onChoose,
  pending,
  onAccept,
}: {
  proposal: SkuProposal;
  chosen: string | undefined;
  onChoose: (sku: string) => void;
  pending: boolean;
  onAccept: () => void;
}) {
  const chosenIsDuplicate = proposal.proposed_skus.find((c) => c.sku === chosen)?.is_duplicate ?? false;
  const canAccept = proposal.is_approvable && Boolean(chosen) && !chosenIsDuplicate;

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-lo)" }}>
        Variant {proposal.variant_id} · Family {proposal.family_code ?? "—"} · Design{" "}
        {proposal.design_code ?? "—"}
        {proposal.design_is_new ? " (new)" : ""}
      </div>

      {proposal.skipped_no_family && (
        <ErrorAlert tone="warning" title="No family recognized">
          This product could not be matched to a SKU family and was skipped.
        </ErrorAlert>
      )}
      {proposal.excluded && (
        <ErrorAlert tone="warning" title="Excluded variant">
          This variant is on the excluded-options list (e.g. Aluminum Gold) and cannot be generated.
        </ErrorAlert>
      )}

      {proposal.proposed_skus.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {proposal.proposed_skus.map((candidate) => (
            <label
              key={candidate.sku}
              style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 13 }}
            >
              <input
                type="radio"
                name={`proposal-${proposal.variant_id}`}
                checked={chosen === candidate.sku}
                onChange={() => onChoose(candidate.sku)}
              />
              <span>{candidate.sku}</span>
              {candidate.is_duplicate && <Badge tone="danger">Duplicate</Badge>}
            </label>
          ))}
        </div>
      )}

      {proposal.placeholders.length > 0 && (
        <ErrorAlert tone="error" title="Unresolved placeholder">
          {proposal.errors.join(" ") || "This proposal has an unresolved value and cannot be accepted."}
        </ErrorAlert>
      )}
      {proposal.warnings.length > 0 && (
        <ErrorAlert tone="warning" title="Warning">
          {proposal.warnings.join(" ")}
        </ErrorAlert>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" size="sm" disabled={!canAccept} loading={pending} onClick={onAccept}>
          Accept
        </Button>
      </div>
    </div>
  );
}

function SkuForm({
  skuDraft,
  setSkuDraft,
  error,
}: {
  skuDraft: string;
  setSkuDraft: (value: string) => void;
  error: ApiError | Error | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 320 }}>
      <Input
        label="SKU"
        value={skuDraft}
        mono
        onChange={(event) => setSkuDraft(event.target.value.toUpperCase())}
        placeholder="ASH-DESIGN-SOLO"
      />
      {error && (
        <ErrorAlert tone="error" title="Validation error">
          {formatApiError(error)}
        </ErrorAlert>
      )}
    </div>
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
      <span>{count} rows</span>
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

function formatOptionValues(values?: string[]): string {
  if (!values || values.length === 0) return "—";
  return values.join(" / ");
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "SKU Manager unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to manage SKUs.";
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
