"use client";

import { useEffect, useState } from "react";

import { ErrorAlert, LoadingState, MetricCard } from "@/components/ds";
import { ApiError, getDashboardMetrics } from "@/lib/api";
import type { DashboardMetrics } from "@/lib/types";

export function DashboardSmoke() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDashboardMetrics()
      .then((data) => {
        if (active) {
          setMetrics(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof ApiError ? err.message : "Dashboard request failed");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <ErrorAlert tone="warning" title="Dashboard smoke request">
        {error}
      </ErrorAlert>
    );
  }

  if (!metrics) {
    return <LoadingState label="Loading dashboard metrics" />;
  }

  const openBatchCount = metrics.active_open_batches_by_production_group.reduce(
    (total, row) => total + row.open_count,
    0,
  );

  return (
    <section
      style={{
        display: "grid",
        gap: "var(--card-gap)",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      }}
    >
      <MetricCard label="Open batches" value={openBatchCount} icon="layers" accent hint="awaiting print" />
      <MetricCard
        label="Queued orders"
        value={metrics.queued_for_production_order_count}
        icon="shopping-cart"
        hint="production queue"
      />
      <MetricCard
        label="Blocked items"
        value={metrics.blocked_component_count}
        icon="octagon-x"
        delta={metrics.blocked_component_count > 0 ? "needs review" : undefined}
        trend={metrics.blocked_component_count > 0 ? "down" : "flat"}
      />
      <MetricCard
        label="Deferred items"
        value={metrics.deferred_mvp_component_count}
        icon="pause"
        hint="MVP hold"
      />
    </section>
  );
}
