"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, EmptyState, ErrorAlert, Input, LoadingState } from "@/components/ds";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { ApiError, generateEventPrint, getEventPrintProducts } from "@/lib/api";
import type { EventPrintProduct, EventPrintSelection, EventPrintTaskResult } from "@/lib/types";

const VALID_COLOR_CODES = ["WHT", "SIL", "GLD"] as const;

interface SelectionState {
  quantity: number;
  color: string;
}

function selectionKey(product: EventPrintProduct): string {
  return `${product.product_type}::${product.design_code}::${product.component_code}`;
}

/**
 * Decision #73: order-less, batch-less on-demand print sheet generation.
 * Type-first browsing (tabs) is the doc's explicit UX requirement — a
 * specific product must be findable quickly, so product type is the primary
 * navigation rather than a flat design list.
 */
export function EventPrintsScreen() {
  const [products, setProducts] = useState<EventPrintProduct[] | null>(null);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<ApiError | Error | null>(null);

  const [activeType, setActiveType] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, SelectionState>>({});

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<ApiError | Error | null>(null);
  const [result, setResult] = useState<EventPrintTaskResult | null>(null);
  const polling = useTaskPolling();

  useEffect(() => {
    getEventPrintProducts()
      .then((payload) => {
        setProducts(payload.products);
        setProductTypes(payload.product_types);
        setActiveType((current) => current ?? payload.product_types[0] ?? null);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err : new Error("Event Prints products request failed"));
      });
  }, []);

  useEffect(() => {
    if (polling.state === "succeeded") {
      const taskResult = polling.data?.result as EventPrintTaskResult | undefined;
      if (taskResult?.share_url) {
        setResult(taskResult);
        setGenerateError(null);
      } else {
        setResult(null);
        setGenerateError(new Error("Print sheet generation did not return a Drive link. Retry."));
      }
    } else if (polling.state === "failed" || polling.state === "timed_out") {
      setResult(null);
      setGenerateError(polling.error ?? new Error("Print sheet generation did not complete."));
    }
  }, [polling.data, polling.error, polling.state]);

  const productsByType = useMemo(() => {
    const map = new Map<string, EventPrintProduct[]>();
    for (const product of products ?? []) {
      const list = map.get(product.product_type) ?? [];
      list.push(product);
      map.set(product.product_type, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.design_code.localeCompare(b.design_code));
    }
    return map;
  }, [products]);

  const visibleProducts = activeType ? productsByType.get(activeType) ?? [] : [];

  const setQuantity = useCallback((product: EventPrintProduct, quantity: number) => {
    const key = selectionKey(product);
    setSelections((prev) => {
      const next = { ...prev };
      if (quantity > 0) {
        next[key] = { quantity, color: prev[key]?.color ?? VALID_COLOR_CODES[0] };
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const setColor = useCallback((product: EventPrintProduct, color: string) => {
    const key = selectionKey(product);
    setSelections((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return { ...prev, [key]: { ...existing, color } };
    });
  }, []);

  const selectedCount = Object.keys(selections).length;

  const handleGenerate = useCallback(async () => {
    if (!products) return;
    const entries: EventPrintSelection[] = [];
    for (const product of products) {
      const selection = selections[selectionKey(product)];
      if (!selection) continue;
      entries.push({
        product_type: product.product_type,
        design_code: product.design_code,
        family_code: product.family_code,
        component_code: product.component_code,
        quantity: selection.quantity,
        ...(product.needs_color ? { color: selection.color } : {}),
      });
    }
    if (entries.length === 0) {
      setGenerateError(new Error("Select at least one design and quantity before generating."));
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setResult(null);
    polling.reset();
    try {
      const dispatch = await generateEventPrint(entries);
      if (dispatch.task_id) {
        polling.start(`/api/tasks/${dispatch.task_id}/`);
      } else {
        setGenerateError(new Error("Print sheet generation was queued without a task ID. Retry."));
      }
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err : new Error("Print sheet generation failed"));
    } finally {
      setGenerating(false);
    }
  }, [polling, products, selections]);

  if (loadError) {
    return (
      <ErrorAlert tone="warning" title="Event Prints unavailable">
        {loadError.message}
      </ErrorAlert>
    );
  }

  if (!products) {
    return <LoadingState variant="skeleton" rows={6} label="Loading Event Prints products" />;
  }

  const isBusy = generating || polling.state === "running";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {productTypes.map((type) => (
          <Button
            key={type}
            variant={type === activeType ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {generateError && (
        <ErrorAlert tone="error" title="Generation failed" onDismiss={() => setGenerateError(null)}>
          {generateError.message}
        </ErrorAlert>
      )}

      {isBusy && (
        <ErrorAlert tone="info" title="Print sheet generation in progress">
          Building the PPTX in the background. A Drive link will appear here on completion.
        </ErrorAlert>
      )}

      {result && (
        <ErrorAlert tone="success" title="Print sheet generated" onDismiss={() => setResult(null)}>
          <a href={result.share_url} target="_blank" rel="noreferrer" style={{ color: "var(--spice-400)" }}>
            Open {result.filename} in Drive
          </a>
        </ErrorAlert>
      )}

      {visibleProducts.length === 0 ? (
        <EmptyState icon="image" title="NO PRODUCING DESIGNS">
          No Available artwork found for this product type.
        </EmptyState>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {visibleProducts.map((product) => {
            const key = selectionKey(product);
            const selection = selections[key];
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-3)",
                }}
              >
                <strong>{product.design_name}</strong>
                {/* P95 A6: only show the design code line when it differs from the name. */}
                {product.design_code !== product.design_name && (
                  <span style={{ color: "var(--text-lo)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {product.design_code}
                  </span>
                )}
                <Input
                  label="Quantity"
                  type="number"
                  mono
                  value={String(selection?.quantity ?? 0)}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
                    setQuantity(product, clamped);
                  }}
                />
                {product.needs_color && selection && (
                  <div style={{ display: "flex", gap: "var(--space-1)" }}>
                    {VALID_COLOR_CODES.map((code) => (
                      <Button
                        key={code}
                        type="button"
                        variant={selection.color === code ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setColor(product, code)}
                      >
                        {code}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <Button variant="primary" loading={isBusy} disabled={isBusy || selectedCount === 0} onClick={handleGenerate}>
          Generate Print Sheet ({selectedCount} selected)
        </Button>
      </div>
    </div>
  );
}
