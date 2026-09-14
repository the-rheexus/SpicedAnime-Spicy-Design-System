"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

import { ActiveBatchTable } from "@/components/dashboard/ActiveBatchTable";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { NeedsAttentionPreview } from "@/components/dashboard/NeedsAttentionPreview";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { ErrorAlert, LoadingState } from "@/components/ds";
import { StatusKey } from "@/components/status-key/StatusKey";
import { ApiError, getAuditLog, getDashboardMetrics } from "@/lib/api";
import { loadDashboardAttentionQueues } from "@/lib/needsAttention";
import { BATCH_STATUS_KEY, group } from "@/lib/statusKeys";
import type { AuditEvent, DashboardMetrics as DashboardMetricsPayload } from "@/lib/types";
import type { DashboardAttentionQueues } from "@/lib/needsAttention";

export function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetricsPayload | null>(null);
  const [attentionQueues, setAttentionQueues] = useState<DashboardAttentionQueues | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditEvent[] | null>(null);
  const [attentionFailed, setAttentionFailed] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    let active = true;

    getDashboardMetrics()
      .then((data) => {
        if (active) {
          setMetrics(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Dashboard request failed"));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getAuditLog({ page_size: 25 })
      .then((payload) => {
        if (active) setRecentActivity(payload.results);
      })
      .catch(() => {
        // The Dashboard summary still carries a smaller recent-activity fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadDashboardAttentionQueues()
      .then((queues) => {
        if (active) {
          setAttentionQueues(queues);
          setAttentionFailed(false);
        }
      })
      .catch(() => {
        if (active) setAttentionFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <ErrorAlert tone="warning" title={errorTitle(error)}>
        {errorMessage(error)}
      </ErrorAlert>
    );
  }

  if (!metrics) {
    return <LoadingState variant="skeleton" rows={8} label="Loading dashboard" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <DashboardMetrics metrics={metrics} attentionQueues={attentionQueues} />

      <ScreenSection eyebrow="Production" title="ACTIVE BATCHES">
        <ActiveBatchTable />
      </ScreenSection>

      <div
        style={{
          alignItems: "start",
          display: "grid",
          gap: "var(--space-6)",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        <DashboardPanel eyebrow="Audit" title="RECENT ACTIVITY" viewAllHref="/audit-log">
          <RecentActivityTable events={recentActivity ?? metrics.recent_activity} />
        </DashboardPanel>
        <DashboardPanel
          eyebrow="Exceptions"
          title="NEEDS ATTENTION"
          viewAllHref="/needs-attention"
          tone="danger"
        >
          <NeedsAttentionPreview queues={attentionQueues} failed={attentionFailed} />
        </DashboardPanel>
      </div>

      {/* The Active Batches list is the only status label this screen renders,
          and it can only ever show Open batches. Metric tiles are counts, not
          statuses, and no dormant Phase 3 order state appears anywhere here. */}
      <StatusKey
        label="Dashboard status key"
        groups={[
          group(
            "Batch",
            BATCH_STATUS_KEY.filter((entry) => entry.status === "Open"),
          ),
        ]}
      />
    </div>
  );
}

function ScreenSection({
  eyebrow,
  title,
  children,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  viewAllHref?: string;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ alignItems: "end", display: "flex", gap: 16, justifyContent: "space-between" }}>
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
        {viewAllHref && (
          <Link
            href={viewAllHref}
            style={{
              color: "var(--text-mid)",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "6px 0",
              textDecoration: "none",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            View all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function DashboardPanel({
  eyebrow,
  title,
  children,
  viewAllHref,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  viewAllHref: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <section
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${tone === "danger" ? "var(--tone-danger-line)" : "var(--line)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          alignItems: "end",
          background: "var(--ink-850)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          padding: "14px 18px",
        }}
      >
        <div>
          <div
            style={{
              color: "var(--spice-400)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
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
              fontSize: 16,
              letterSpacing: "0.06em",
              margin: "4px 0 0",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          style={{
            color: "var(--text-mid)",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "6px 0",
            textDecoration: "none",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          View all
        </Link>
      </header>
      {children}
    </section>
  );
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Dashboard unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view dashboard data.";
  }
  return error.message || "Dashboard data could not be loaded.";
}
