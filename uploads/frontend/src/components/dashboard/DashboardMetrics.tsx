"use client";

import { MetricCard } from "@/components/ds";
import { NeedsAttentionMetricTile } from "@/components/dashboard/NeedsAttentionMetricTile";
import { SystemStatusTile } from "@/components/dashboard/SystemStatusTile";
import type { DashboardAttentionQueues } from "@/lib/needsAttention";
import type { DashboardMetrics as DashboardMetricsPayload } from "@/lib/types";

interface DashboardMetricsProps {
  metrics: DashboardMetricsPayload;
  attentionQueues: DashboardAttentionQueues | null;
}

export function DashboardMetrics({ metrics, attentionQueues }: DashboardMetricsProps) {
  const openBatchCount = metrics.active_open_batches_by_production_group.reduce(
    (total, row) => total + row.open_count,
    0,
  );

  return (
    <section
      style={{
        display: "grid",
        gap: "var(--card-gap)",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      <MetricCard
        label="Open batches"
        value={openBatchCount}
        icon="layers"
        accent
        hint="active groups"
        href="/batches"
      />
      <NeedsAttentionMetricTile queues={attentionQueues} />
      <MetricCard
        label="Queued"
        value={metrics.queued_for_production_order_count}
        icon="shopping-cart"
        hint="orders"
        href="/orders"
      />
      <SystemStatusTile />
    </section>
  );
}
