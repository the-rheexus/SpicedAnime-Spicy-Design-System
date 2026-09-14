"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/ds";
import { getIntegrationStatus } from "@/lib/api";
import type { IntegrationStatus } from "@/lib/types";

/**
 * Dashboard System Status tile (Decision #90).
 *
 * Read-only surface for the Shopify / Google Drive / Celery health already
 * exposed on Settings from `GET /api/settings/integration-status/` (Decision
 * #38). It renders the same connected / not-connected vocabulary, introduces
 * no new status string, and links to `/settings`. No new endpoint.
 */

interface ServiceRow {
  name: string;
  healthy: boolean;
}

function toRows(status: IntegrationStatus): ServiceRow[] {
  return [
    { name: "Shopify", healthy: status.shopify.connected },
    { name: "Google Drive", healthy: status.drive.root_folder_configured },
    { name: "Celery", healthy: status.celery.worker_reachable },
  ];
}

export function SystemStatusTile() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getIntegrationStatus()
      .then((data) => {
        if (active) {
          setStatus(data);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows: ServiceRow[] = status
    ? toRows(status)
    : ["Shopify", "Google Drive", "Celery"].map((name) => ({ name, healthy: false }));

  return (
    <Link
      href="/settings"
      aria-label="System status — open Settings"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        color: "inherit",
        cursor: "pointer",
        display: "block",
        padding: "20px 22px",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            color: "var(--text-low)",
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
          }}
        >
          System status
        </span>
        <span style={{ color: "var(--text-faint)", display: "flex" }}>
          <Icon name="settings" size={17} />
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row) => (
          <span
            key={row.name}
            style={{
              alignItems: "center",
              color: "var(--text-hi)",
              display: "flex",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              gap: 10,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                background: row.healthy ? "var(--tone-success)" : "var(--tone-danger)",
                borderRadius: "50%",
                flex: "none",
                height: 9,
                width: 9,
              }}
            />
            {row.name}
            <span
              style={{
                color: row.healthy ? "var(--tone-success)" : "var(--tone-danger)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                marginLeft: "auto",
                textTransform: "uppercase",
              }}
            >
              {row.healthy ? "Connected" : failed ? "Unknown" : "Not connected"}
            </span>
          </span>
        ))}
      </div>
    </Link>
  );
}
