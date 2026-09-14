"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, DataTable, EmptyState, ErrorAlert, LoadingState } from "@/components/ds";
import { BlockedComponentsTable } from "@/components/needs-attention/BlockedComponentsTable";
import { DeferredItemsPanel } from "@/components/needs-attention/DeferredItemsPanel";
import { NoSkuItemsTable } from "@/components/needs-attention/NoSkuItemsTable";
import { CreateSkuDialog } from "@/components/sku-manager/SkuManagerScreen";
import { StatusKey } from "@/components/status-key/StatusKey";
import { acceptSkuProposal, ApiError, bulkReimportOrders, generateSkuProposals, getNeedsAttention, getShopifyCatalog } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { COMPONENT_STATUS_KEY, group } from "@/lib/statusKeys";
import type { BulkOrderReimportItemResult, NeedsAttentionResponse, NoSkuItem, ShopifyCatalogRow, SkuGenerateVariantInput, SkuProposal, WebhookFailure } from "@/lib/types";

type QueueId = "blocked" | "missing-sku" | "deferred" | "webhooks";
type ReviewDecision = "pending" | "approve" | "reject";
type AcceptanceState = "not-submitted" | "accepted" | "failed" | "rejected" | "not-approvable";

interface BulkReviewItem {
  key: string;
  item: NoSkuItem;
  descriptor?: SkuGenerateVariantInput;
  proposal?: SkuProposal;
  chosenSku?: string;
  generationError?: string;
  decision: ReviewDecision;
  acceptance: AcceptanceState;
  acceptanceMessage?: string;
}

function proposalKey(item: NoSkuItem): string {
  return `order-item:${item.order_item_id}`;
}

async function buildSkuDescriptor(item: NoSkuItem): Promise<{ descriptor: SkuGenerateVariantInput; catalogRow: ShopifyCatalogRow | null }> {
  if (!item.shopify_variant_id && !item.product_name.trim()) {
    throw new Error("This item has neither a Shopify variant reference nor a recorded product name.");
  }
  let row: ShopifyCatalogRow | null = null;
  if (item.shopify_variant_id) {
    try {
      const catalog = await getShopifyCatalog({ variant_id: item.shopify_variant_id, page_size: 1 });
      row = catalog.results[0] ?? null;
    } catch {
      row = null;
    }
  }
  const fallbackOptionValues = (item.variant_options || "").split(" / ").map((value) => value.trim()).filter(Boolean);
  const descriptor = row ?? {
    product_id: item.shopify_product_id ?? "",
    product_title: item.product_name,
    product_type: "",
    product_handle: "",
    tags: null,
    variant_id: item.shopify_variant_id ?? "",
    option_values: fallbackOptionValues,
    option_names: [],
    sku: "",
    has_sku: false,
    offer_sku: null,
  };
  return { catalogRow: row, descriptor: {
    client_key: proposalKey(item),
    variant_id: descriptor.variant_id,
    product_handle: descriptor.product_handle,
    product_title: descriptor.product_title,
    product_type: descriptor.product_type,
    tags: descriptor.tags,
    option_values: descriptor.option_values,
    option_names: descriptor.option_names,
  } };
}

export function NeedsAttentionScreen() {
  const [data, setData] = useState<NeedsAttentionResponse | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [deferredPage, setDeferredPage] = useState(1);
  const [noSkuPage, setNoSkuPage] = useState(1);
  const [deferredLoading, setDeferredLoading] = useState(false);
  const [noSkuLoading, setNoSkuLoading] = useState(false);
  const [generatingItemId, setGeneratingItemId] = useState<number | null>(null);
  const [catalogRow, setCatalogRow] = useState<ShopifyCatalogRow | null>(null);
  const [reimportOrderNumber, setReimportOrderNumber] = useState<string | null>(null);
  const [proposal, setProposal] = useState<SkuProposal | null>(null);
  const [chosenSku, setChosenSku] = useState<string | undefined>();
  const [accepting, setAccepting] = useState(false);
  const [skuActionError, setSkuActionError] = useState<ApiError | Error | null>(null);
  const [skuActionSuccess, setSkuActionSuccess] = useState<string | null>(null);
  const [activeQueue, setActiveQueue] = useState<QueueId>("blocked");
  const [selectedItems, setSelectedItems] = useState<Record<number, NoSkuItem>>({});
  const [bulkReview, setBulkReview] = useState<BulkReviewItem[]>([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkAccepting, setBulkAccepting] = useState(false);
  const [bulkReimporting, setBulkReimporting] = useState(false);
  const [bulkReimportResults, setBulkReimportResults] = useState<BulkOrderReimportItemResult[]>([]);
  const selectedItemIds = useMemo(() => Object.keys(selectedItems).map(Number), [selectedItems]);

  const load = useCallback(async (nextDeferredPage: number, nextNoSkuPage: number, queue?: "deferred" | "no_sku") => {
    if (queue === "deferred") setDeferredLoading(true);
    if (queue === "no_sku") setNoSkuLoading(true);
    try {
      // Aggregation must not split one order-item issue across API pages. Use
      // the endpoint's existing maximum page size, then collect every blocked
      // page before grouping in the table. Other queues retain their existing
      // independent server pagination.
      const payload = await getNeedsAttention({ blocked_page: 1, deferred_page: nextDeferredPage, no_sku_page: nextNoSkuPage, page_size: 100 });
      const remainingBlockedPages = await Promise.all(
        Array.from({ length: Math.max(0, payload.errors_pagination.total_pages - 1) }, (_, index) =>
          getNeedsAttention({ blocked_page: index + 2, deferred_page: nextDeferredPage, no_sku_page: nextNoSkuPage, page_size: 100 }),
        ),
      );
      const errors = Array.from(new Map(
        [payload, ...remainingBlockedPages].flatMap((response) => response.errors).map((component) => [component.id, component]),
      ).values());
      setData({
        ...payload,
        errors,
        errors_pagination: {
          ...payload.errors_pagination,
          page: 1,
          page_size: errors.length,
          total_pages: errors.length > 0 ? 1 : 0,
          next: null,
          previous: null,
        },
      });
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error("Needs Attention request failed"));
    } finally {
      if (queue === "deferred") setDeferredLoading(false);
      if (queue === "no_sku") setNoSkuLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, 1);
  }, [load]);

  const changeDeferredPage = (nextPage: number) => {
    setDeferredPage(nextPage);
    void load(nextPage, noSkuPage, "deferred");
  };
  const changeNoSkuPage = (nextPage: number) => {
    setNoSkuPage(nextPage);
    void load(deferredPage, nextPage, "no_sku");
  };

  const startSkuGeneration = useCallback(async (item: NoSkuItem) => {
    setSkuActionError(null);
    setSkuActionSuccess(null);
    if (!item.shopify_variant_id && !item.product_name) {
      // Nothing to generate from: no variant reference to resolve in the live
      // catalog, and no product title recorded on the line item either.
      setSkuActionError(new Error(
        `Cannot generate a SKU for order ${item.order_number}: this line item has neither a Shopify variant reference nor a recorded product name. Contact support.`,
      ));
      return;
    }
    setGeneratingItemId(item.id);
    try {
      // Preferred path: resolve the live Shopify catalog row for this variant
      // so the proposal is enriched with the product handle (design-code
      // registry reuse), tags, and type. The lookup is best-effort — a variant
      // that was recreated/archived in Shopify, a legacy line item with no
      // variant id, or a transient Admin API error must NOT block generation
      // (spec §2.6 Section 4: "Calls POST /api/skus/generate/ for this order
      // item's product"). We fall back to the data already on the order item.
      const resolved = await buildSkuDescriptor(item);
      const descriptor = resolved.descriptor;
      if (resolved.catalogRow?.has_sku && resolved.catalogRow.offer_sku) {
        setSkuActionSuccess(
          `SKU ${resolved.catalogRow.offer_sku.sku} is already present in Shopify and the SKU dictionary. Reimport order ${item.order_number} from Order Detail.`,
        );
        return;
      }

      const generated = await generateSkuProposals([descriptor]);
      const nextProposal = generated.proposals[0];
      if (!nextProposal) throw new Error("SKU generation returned no proposal for this variant.");

      // Every proposed SKU already exists in the SKU dictionary (offer_skus):
      // there is nothing to create — the item just needs re-importing so its
      // components are built from the existing SKU. Don't open the accept
      // dialog on a dead-end "Duplicate" proposal.
      const proposedSkus = nextProposal.proposed_skus ?? [];
      if (proposedSkus.length > 0 && proposedSkus.every((candidate) => candidate.is_duplicate)) {
        setSkuActionSuccess(
          `SKU ${proposedSkus[0].sku} already exists in the SKU dictionary. Reimport order ${item.order_number} from Order Detail to create its production components.`,
        );
        return;
      }

      setCatalogRow({ ...descriptor, product_id: item.shopify_product_id ?? "", sku: "", has_sku: false, offer_sku: null });
      setReimportOrderNumber(item.order_number);
      setProposal(nextProposal);
      setChosenSku(nextProposal.proposed_skus[0]?.sku);
    } catch (err: unknown) {
      setSkuActionError(err instanceof Error ? err : new Error("SKU generation request failed"));
    } finally {
      setGeneratingItemId(null);
    }
  }, []);

  const changeSelection = useCallback((ids: number[]) => {
    setSelectedItems((current) => {
      const next = { ...current };
      for (const id of Object.keys(next).map(Number)) if (!ids.includes(id)) delete next[id];
      for (const item of data?.no_sku ?? []) if (ids.includes(item.order_item_id)) next[item.order_item_id] = item;
      return next;
    });
  }, [data]);

  const generateSelected = useCallback(async () => {
    const items = Object.values(selectedItems);
    if (!items.length) return;
    setBulkGenerating(true);
    setSkuActionError(null);
    setBulkReimportResults([]);
    const resolved = await Promise.all(items.map(async (item) => {
      try { return { item, ...(await buildSkuDescriptor(item)) }; }
      catch (error) { return { item, descriptor: undefined, catalogRow: null, error: error instanceof Error ? error.message : "Descriptor generation failed." }; }
    }));
    const descriptors = resolved.flatMap((entry) => entry.descriptor ? [entry.descriptor] : []);
    let proposals: SkuProposal[] = [];
    try {
      if (descriptors.length) proposals = (await generateSkuProposals(descriptors)).proposals;
    } catch (error) {
      setSkuActionError(error instanceof Error ? error : new Error("Bulk SKU generation request failed"));
    }
    const proposalsByKey = new Map(proposals.map((entry, index) => [entry.client_key ?? descriptors[index]?.client_key, entry]));
    setBulkReview(resolved.map((entry) => {
      const key = proposalKey(entry.item);
      const nextProposal = proposalsByKey.get(key);
      return {
        key,
        item: entry.item,
        descriptor: entry.descriptor,
        proposal: nextProposal,
        chosenSku: nextProposal?.proposed_skus.find((candidate) => !candidate.is_duplicate)?.sku ?? nextProposal?.proposed_skus[0]?.sku,
        generationError: entry.error ?? (!nextProposal ? "No proposal was returned for this item." : undefined),
        decision: "pending",
        acceptance: nextProposal?.is_approvable ? "not-submitted" : "not-approvable",
      };
    }));
    setBulkGenerating(false);
  }, [selectedItems]);

  const decide = useCallback((key: string, decision: ReviewDecision) => {
    setBulkReview((items) => items.map((item) => item.key === key ? { ...item, decision } : item));
  }, []);

  const decideAll = useCallback((decision: Exclude<ReviewDecision, "pending">) => {
    setBulkReview((items) => items.map((item) => item.decision !== "pending" ? item : (
      decision === "approve" && !item.proposal?.is_approvable ? item : { ...item, decision }
    )));
  }, []);

  const submitReview = useCallback(async () => {
    setBulkAccepting(true);
    const outcomes = await Promise.all(bulkReview.map(async (item): Promise<BulkReviewItem> => {
      if (item.acceptance === "accepted") return item;
      if (item.decision === "reject") return { ...item, acceptance: "rejected", acceptanceMessage: "Proposal rejected by operator; nothing was saved." };
      if (item.decision !== "approve") return item;
      if (!item.proposal?.is_approvable || !item.descriptor || !item.chosenSku) return { ...item, acceptance: "not-approvable", acceptanceMessage: "This proposal cannot be approved." };
      try {
        await acceptSkuProposal({ sku: item.chosenSku, product_handle: item.descriptor.product_handle, product_title: item.descriptor.product_title, option_values: item.descriptor.option_values, option_names: item.descriptor.option_names });
        return { ...item, acceptance: "accepted", acceptanceMessage: "Canonical SKU accepted locally." };
      } catch (error) {
        return { ...item, acceptance: "failed", acceptanceMessage: error instanceof Error ? error.message : "Proposal acceptance failed." };
      }
    }));
    setBulkReview(outcomes);
    setBulkAccepting(false);
  }, [bulkReview]);

  const acceptedOrderIds = useMemo(() => Array.from(new Set(bulkReview.filter((item) => item.acceptance === "accepted").map((item) => item.item.order_id))), [bulkReview]);
  const runBulkReimport = useCallback(async () => {
    if (!acceptedOrderIds.length) return;
    setBulkReimporting(true);
    setSkuActionError(null);
    try {
      const result = await bulkReimportOrders(acceptedOrderIds);
      setBulkReimportResults(result.results);
      await load(deferredPage, noSkuPage);
    } catch (error) {
      setSkuActionError(error instanceof Error ? error : new Error("Bulk order reimport failed"));
    } finally { setBulkReimporting(false); }
  }, [acceptedOrderIds, deferredPage, load, noSkuPage]);

  const closeSkuDialog = useCallback(() => {
    if (accepting) return;
    setCatalogRow(null);
    setReimportOrderNumber(null);
    setProposal(null);
    setChosenSku(undefined);
  }, [accepting]);

  const acceptSku = useCallback(async () => {
    if (!catalogRow || !proposal || !chosenSku) return;
    setAccepting(true);
    setSkuActionError(null);
    try {
      await acceptSkuProposal({
        sku: chosenSku,
        product_handle: catalogRow.product_handle,
        product_title: catalogRow.product_title,
        option_values: catalogRow.option_values,
        option_names: catalogRow.option_names,
      });
      setSkuActionSuccess(
        `SKU ${chosenSku} created and added to the SKU dictionary. Reimport order ${reimportOrderNumber ?? ""} from Order Detail to create its production components. Also export pending SKUs from SKU Manager and import the CSV into Shopify so the variant carries this SKU going forward.`,
      );
      setCatalogRow(null);
      setReimportOrderNumber(null);
      setProposal(null);
      setChosenSku(undefined);
      await load(deferredPage, noSkuPage);
    } catch (err: unknown) {
      setSkuActionError(err instanceof Error ? err : new Error("SKU accept request failed"));
    } finally {
      setAccepting(false);
    }
  }, [catalogRow, deferredPage, load, noSkuPage, proposal, chosenSku, reimportOrderNumber]);

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  if (!data) {
    return <LoadingState variant="skeleton" rows={8} label="Loading needs attention" />;
  }

  const webhookFailures = data.webhook_failures ?? [];
  const webhookFailureCount = data.webhook_failure_count ?? data.webhook_failures_pagination?.count ?? webhookFailures.length;

  // Rendered next to the Generate SKU action (Section 4), not only at the
  // foot of the screen — the action lives near the top of a long, multi-table
  // page, and an outcome banner far below the fold reads to the operator as
  // "nothing happened".
  const skuActionFeedback = (
    <>
      {skuActionError && (
        <ErrorAlert tone="error" title="SKU generation failed" onDismiss={() => setSkuActionError(null)}>
          {skuActionError.message}
        </ErrorAlert>
      )}
      {skuActionSuccess && (
        <ErrorAlert tone="success" title="SKU created" onDismiss={() => setSkuActionSuccess(null)}>
          {skuActionSuccess}
        </ErrorAlert>
      )}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <header>
        <div style={{ color: "var(--spice-400)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>Operations</div>
        <h1 style={{ color: "var(--text-hi)", fontFamily: "var(--font-sans)", fontSize: 28, letterSpacing: "0.04em", margin: "6px 0 0", textTransform: "uppercase" }}>Needs Attention</h1>
      </header>

      <div role="tablist" aria-label="Needs Attention queues" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <QueueTab id="blocked" label="Blocked" count={data.errors_pagination.count} active={activeQueue === "blocked"} onSelect={setActiveQueue} />
        <QueueTab id="missing-sku" label="Missing SKU" count={data.no_sku_pagination.count} active={activeQueue === "missing-sku"} onSelect={setActiveQueue} />
        <QueueTab id="deferred" label="Deferred" count={data.deferred_pagination.count} active={activeQueue === "deferred"} onSelect={setActiveQueue} />
        <QueueTab id="webhooks" label="Webhook Failures" count={webhookFailureCount} active={activeQueue === "webhooks"} onSelect={setActiveQueue} />
      </div>

      <div role="tabpanel" id="needs-attention-active-panel" aria-labelledby={`needs-attention-tab-${activeQueue}`}>
        {activeQueue === "blocked" && (
          <ScreenSection eyebrow="Errors" title="BLOCKED COMPONENTS">
            <BlockedComponentsTable components={data.errors} pagination={data.errors_pagination} />
          </ScreenSection>
        )}

        {activeQueue === "missing-sku" && (
          <ScreenSection eyebrow="SKU recovery" title="MISSING SKU">
            {skuActionFeedback}
            <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "var(--space-3)", justifyContent: "space-between" }}>
              <strong aria-live="polite">{selectedItemIds.length} Missing SKU {selectedItemIds.length === 1 ? "item" : "items"} selected</strong>
              <Button type="button" disabled={!selectedItemIds.length || bulkGenerating} loading={bulkGenerating} onClick={() => { void generateSelected(); }}>
                {bulkGenerating ? "Generating proposals…" : "Generate proposals for selected items"}
              </Button>
            </div>
            <NoSkuItemsTable items={data.no_sku} pagination={data.no_sku_pagination} loading={noSkuLoading} generatingItemId={generatingItemId} onGenerate={startSkuGeneration} selectedItemIds={selectedItemIds} onSelectionChange={changeSelection} onPageChange={changeNoSkuPage} />
            {bulkReview.length > 0 && (
              <BulkReviewWorkspace
                items={bulkReview}
                accepting={bulkAccepting}
                reimporting={bulkReimporting}
                reimportResults={bulkReimportResults}
                acceptedOrderCount={acceptedOrderIds.length}
                onChooseSku={(key, sku) => setBulkReview((items) => items.map((item) => item.key === key ? { ...item, chosenSku: sku } : item))}
                onDecide={decide}
                onApproveAll={() => decideAll("approve")}
                onRejectAll={() => decideAll("reject")}
                onSubmit={() => { void submitReview(); }}
                onReimport={() => { void runBulkReimport(); }}
                onReturn={() => { void load(deferredPage, noSkuPage); }}
              />
            )}
          </ScreenSection>
        )}

        {activeQueue === "deferred" && (
          <ScreenSection eyebrow="Deferred MVP" title="DEFERRED ITEMS">
            <DeferredItemsPanel components={data.deferred} pagination={data.deferred_pagination} loading={deferredLoading} onPageChange={changeDeferredPage} />
          </ScreenSection>
        )}

        {activeQueue === "webhooks" && (
          <ScreenSection eyebrow="Integration" title="WEBHOOK PROCESSING FAILURES">
            {webhookFailures.length > 0 ? <WebhookFailuresTable failures={webhookFailures} /> : (
              <EmptyState icon="circle-check" title="NO WEBHOOK PROCESSING FAILURES" compact>
                Failed authenticated Shopify webhook deliveries appear here for engineering review.
              </EmptyState>
            )}
          </ScreenSection>
        )}
      </div>

      <StatusKey
        label="Needs Attention status key"
        groups={[
          group(
            "Component",
            COMPONENT_STATUS_KEY.filter((entry) =>
              (["Blocked", "Deferred MVP"] as string[]).includes(entry.status),
            ),
          ),
        ]}
      />

      {proposal && (
        <CreateSkuDialog
          generating={false}
          proposals={[proposal]}
          proposalChoices={{ [proposal.variant_id]: chosenSku ?? "" }}
          setProposalChoices={(updater) => {
            const next = updater({ [proposal.variant_id]: chosenSku ?? "" });
            setChosenSku(next[proposal.variant_id]);
          }}
          acceptingKey={accepting ? String(proposal.variant_id) : null}
          onAccept={() => { void acceptSku(); }}
          onClose={closeSkuDialog}
        />
      )}
    </div>
  );
}

function BulkReviewWorkspace({ items, accepting, reimporting, reimportResults, acceptedOrderCount, onChooseSku, onDecide, onApproveAll, onRejectAll, onSubmit, onReimport, onReturn }: {
  items: BulkReviewItem[];
  accepting: boolean;
  reimporting: boolean;
  reimportResults: BulkOrderReimportItemResult[];
  acceptedOrderCount: number;
  onChooseSku: (key: string, sku: string) => void;
  onDecide: (key: string, decision: ReviewDecision) => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onSubmit: () => void;
  onReimport: () => void;
  onReturn: () => void;
}) {
  const approved = items.filter((item) => item.decision === "approve").length;
  const rejected = items.filter((item) => item.decision === "reject").length;
  const pending = items.length - approved - rejected;
  const accepted = items.filter((item) => item.acceptance === "accepted").length;
  return (
    <section aria-label="Bulk Missing SKU proposal review" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-4)" }}>
      <div>
        <h3 style={{ margin: 0 }}>Bulk proposal review</h3>
        <p aria-live="polite">{items.length} reviewed · {approved} approve · {rejected} reject · {pending} pending · {accepted} accepted</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <Button size="sm" type="button" onClick={onApproveAll} disabled={!items.some((item) => item.decision === "pending" && item.proposal?.is_approvable)}>Approve All approvable pending</Button>
        <Button size="sm" variant="outline" type="button" onClick={onRejectAll} disabled={!items.some((item) => item.decision === "pending")}>Reject All pending</Button>
        <Button size="sm" type="button" loading={accepting} onClick={onSubmit} disabled={accepting || !items.some((item) => (item.decision === "reject" && item.acceptance !== "rejected") || (item.decision === "approve" && ["not-submitted", "failed", "rejected"].includes(item.acceptance)))}>{accepting ? "Submitting decisions…" : "Submit reviewed decisions"}</Button>
        <Button size="sm" variant="outline" type="button" onClick={onReturn}>Refresh Missing SKU queue</Button>
      </div>
      {items.map((item) => {
        const proposal = item.proposal;
        const approvable = Boolean(proposal?.is_approvable && item.chosenSku);
        return (
          <article key={item.key} style={{ borderTop: "1px solid var(--line)", paddingTop: "var(--space-3)" }}>
            <strong>Order {item.item.order_number} — {item.item.product_name || "Unnamed item"}</strong>
            <div>{item.item.variant_options || "No variant options"}</div>
            <div>Design code: {proposal?.design_code ?? "Unavailable"}</div>
            {proposal?.proposed_skus.length ? (
              <label>Proposed canonical SKU{" "}
                <select aria-label={`Proposed canonical SKU for order ${item.item.order_number}`} value={item.chosenSku ?? ""} onChange={(event) => onChooseSku(item.key, event.target.value)}>
                  {proposal.proposed_skus.map((candidate) => <option key={candidate.sku} value={candidate.sku} disabled={candidate.is_duplicate}>{candidate.sku}{candidate.is_duplicate ? " (duplicate)" : ""}</option>)}
                </select>
              </label>
            ) : <div>Generation failure: {item.generationError ?? proposal?.errors.join(" ") ?? "No canonical SKU proposal."}</div>}
            {proposal && [...proposal.warnings, ...proposal.placeholders.map((value) => `Placeholder: ${value}`), ...proposal.errors].map((warning) => <div key={warning}>{warning}</div>)}
            <div>Approvable: {approvable ? "Yes" : "No"}</div>
            <div>Review decision: {item.decision}</div>
            <div>Acceptance result: {item.acceptance}{item.acceptanceMessage ? ` — ${item.acceptanceMessage}` : ""}</div>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              <Button size="sm" type="button" onClick={() => onDecide(item.key, "approve")} disabled={!approvable || item.acceptance === "accepted"}>Approve</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => onDecide(item.key, "reject")} disabled={item.acceptance === "accepted"}>Reject</Button>
            </div>
          </article>
        );
      })}
      {accepted > 0 && (
        <div>
          <p>{accepted} proposals approved successfully across {acceptedOrderCount} distinct orders.</p>
          <Button type="button" loading={reimporting} onClick={onReimport} disabled={reimporting}>{reimporting ? "Reimporting orders…" : `Bulk reimport ${acceptedOrderCount} affected orders`}</Button>
          <p>Reimport updates this fulfillment app only. Export the cumulative full Shopify CSV from SKU Manager and import it manually into Shopify.</p>
        </div>
      )}
      {reimportResults.length > 0 && (
        <section aria-label="Bulk reimport outcomes">
          <h4>Order reimport outcomes</h4>
          {reimportResults.map((result) => (
            <div key={result.order_id}>
              Order {result.order_number ?? result.order_id}: {result.outcome === "succeeded" ? "Order reimport succeeded" : "Order reimport failed"}. {result.message}
              {result.remaining_missing_sku_items > 0 && ` Order remained unresolved after reimport (${result.remaining_missing_sku_items} Missing SKU items).`}
            </div>
          ))}
        </section>
      )}
    </section>
  );
}

function QueueTab({ id, label, count, active, onSelect }: { id: QueueId; label: string; count: number; active: boolean; onSelect: (id: QueueId) => void }) {
  return (
    <button
      type="button"
      role="tab"
      id={`needs-attention-tab-${id}`}
      aria-controls="needs-attention-active-panel"
      aria-selected={active}
      onClick={() => onSelect(id)}
      style={{
        alignItems: "center",
        background: active ? "var(--spice-500)" : "var(--surface-card)",
        border: `1px solid ${active ? "var(--spice-500)" : "var(--line)"}`,
        borderRadius: "var(--radius-sm)",
        color: active ? "var(--text-on-spice)" : "var(--text-mid)",
        cursor: "pointer",
        display: "inline-flex",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        gap: "var(--space-2)",
        letterSpacing: "0.05em",
        padding: "10px 14px",
        textTransform: "uppercase",
      }}
    >
      <span>{label}</span>
      <span style={{ background: active ? "var(--spice-300)" : "var(--surface-sunken)", borderRadius: 999, color: active ? "var(--text-on-spice)" : "var(--text-low)", fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 22, padding: "2px 7px", textAlign: "center" }}>{count}</span>
    </button>
  );
}

/**
 * Read-only evidence for authenticated Shopify deliveries that failed to
 * process. Deliberately has no recovery action and no resolution state: it
 * reuses the existing operational-issue surface rather than introducing a new
 * component lifecycle.
 */
function WebhookFailuresTable({ failures }: { failures: WebhookFailure[] }) {
  const columns = [
    { key: "received_at", header: "Received", render: (value: unknown) => formatDateTime(value as string | null | undefined) },
    { key: "topic", header: "Topic", mono: true },
    { key: "order_number", header: "Order", mono: true, render: (value: unknown) => (value as string) ?? "—" },
    { key: "failure_summary", header: "Failure", mono: true, render: (value: unknown) => (value as string) ?? "—" },
    { key: "webhook_delivery_id", header: "Delivery ID", mono: true },
  ];
  return (
    <DataTable
      columns={columns}
      rows={failures}
      rowKey="id"
      emptyLabel="No webhook processing failures"
    />
  );
}

function ScreenSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <div
          style={{
            color: "var(--spice-400)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            color: "var(--text-hi)",
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            letterSpacing: "0.06em",
            margin: "6px 0 0",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Needs Attention unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view blocked and deferred components.";
  }
  return error.message || "Needs Attention data could not be loaded.";
}
