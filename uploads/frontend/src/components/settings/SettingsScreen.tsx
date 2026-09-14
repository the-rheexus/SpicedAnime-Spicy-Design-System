"use client";

import { useEffect, useState } from "react";

import { Card, EmptyState, ErrorAlert, LoadingState, StatusBadge } from "@/components/ds";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import { StatusKey } from "@/components/status-key/StatusKey";
import { INTEGRATION_STATUS_KEY, group } from "@/lib/statusKeys";
import { formatDateTime } from "@/lib/datetime";
import { ApiError, getIntegrationStatus } from "@/lib/api";
import type { IntegrationStatus } from "@/lib/types";

interface IntegrationCard {
  title: string;
  eyebrow: string;
  status: StatusName;
  rows: [string, string][];
  note: string;
}

export function SettingsScreen() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getIntegrationStatus()
      .then((payload) => {
        if (active) {
          setStatus(payload);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Integration status request failed"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
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

  if (loading && !status) {
    return <LoadingState variant="skeleton" rows={6} label="Loading settings" />;
  }

  if (!status) {
    return (
      <EmptyState icon="settings" title="NO STATUS SIGNALS">
        Integration status signals are not available from the current API session.
      </EmptyState>
    );
  }

  const cards: IntegrationCard[] = [
    {
      title: "SHOPIFY",
      eyebrow: "Integration",
      status: status.shopify.connected ? "Available" : "Missing",
      rows: [
        ["API version", status.shopify.api_version ?? "—"],
        ["Last webhook received", formatDate(status.shopify.last_webhook_at)],
      ],
      note: "Reflects the read-only Shopify integration health signal from the backend.",
    },
    {
      title: "GOOGLE DRIVE",
      eyebrow: "Storage",
      status: status.drive.root_folder_configured ? "Available" : "Missing",
      rows: [
        ["Root folder configured", status.drive.root_folder_configured ? "Yes" : "No"],
        ["Last successful export", formatDate(status.drive.last_export_at)],
      ],
      note: "No folder ID, path, or credential value is exposed by this signal.",
    },
    {
      title: "CELERY",
      eyebrow: "Background Jobs",
      status: status.celery.worker_reachable ? "Available" : "Missing",
      rows: [["Worker reachable", status.celery.worker_reachable ? "Yes" : "No"]],
      note: "Reflects a live worker ping at the time this page was loaded.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "grid", gap: "var(--space-4)", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {cards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            eyebrow={card.eyebrow}
            accent
            action={<StatusBadge status={card.status} size="sm" />}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <dl style={{ display: "grid", gap: "var(--space-2)", margin: 0 }}>
                {card.rows.map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      alignItems: "baseline",
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "160px minmax(0, 1fr)",
                    }}
                  >
                    <dt
                      style={{
                        color: "var(--text-lo)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </dt>
                    <dd style={{ color: "var(--text-hi)", margin: 0, minWidth: 0, overflowWrap: "anywhere" }}>{value}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ color: "var(--text-lo)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{card.note}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Settings renders integration health with the artwork Available/Missing
          palette; no order, batch, or component status appears here. */}
      <StatusKey
        label="Settings status key"
        groups={[group("Integration signal", INTEGRATION_STATUS_KEY)]}
      />
    </div>
  );
}

function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

function errorTitle(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Session required";
  }
  return "Settings unavailable";
}

function errorMessage(error: Error): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Sign in with a valid Django admin session to view integration status.";
  }
  return error.message || "Integration status could not be loaded.";
}
