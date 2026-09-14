import { RelativeTime } from "@/components/common/RelativeTime";
import { EmptyState, Icon } from "@/components/ds";
import { auditActivityDescription, auditActivityIcon } from "@/lib/audit";
import type { AuditEvent } from "@/lib/types";

interface RecentActivityTableProps {
  events: AuditEvent[];
}

export const DASHBOARD_ACTIVITY_LIMIT = 25;

export function RecentActivityTable({ events }: RecentActivityTableProps) {
  const visibleEvents = events.slice(0, DASHBOARD_ACTIVITY_LIMIT);

  if (visibleEvents.length === 0) {
    return (
      <EmptyState icon="scroll-text" title="NO RECENT ACTIVITY" compact>
        Audit events appear here after order imports, batch transitions, exports, or artwork updates.
      </EmptyState>
    );
  }

  return (
    <div
      data-testid="recent-activity-scroll-region"
      style={{
        maxHeight: 420,
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
      tabIndex={0}
    >
      <ul aria-label="Recent activity" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visibleEvents.map((event) => (
          <li
            key={event.id}
            style={{
              borderTop: "1px solid var(--line)",
              padding: "13px 18px",
            }}
          >
            <div style={{ alignItems: "flex-start", display: "flex", gap: 12 }}>
              <span
                aria-hidden="true"
                style={{ color: "var(--spice-400)", display: "flex", flex: "none", marginTop: 2 }}
              >
                <Icon name={auditActivityIcon(event)} size={16} strokeWidth={2.1} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--text-hi)", fontSize: 13, lineHeight: 1.45 }}>
                  {auditActivityDescription(event)}
                </div>
                <RelativeTime
                  value={event.created_at}
                  style={{ color: "var(--text-low)", display: "block", fontSize: 11, marginTop: 3 }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
