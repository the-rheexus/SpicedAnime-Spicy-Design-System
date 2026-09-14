import { Badge, Icon, STATUS_MAP, StatusBadge } from "@/components/ds";
import type { IconName } from "@/components/ds/core/Icon";
import type { StatusName } from "@/components/ds/core/StatusBadge";
import type { StatusKeyGroup } from "@/lib/statusKeys";

/** Render a label the same way the page itself renders it. */
function KeyLabel({
  status,
  label,
  tone,
  icon,
}: {
  status: string;
  label?: string;
  tone?: "neutral" | "spice" | "info" | "success" | "warning" | "danger";
  icon?: IconName;
}) {
  // An explicit tone or icon on the entry means the page renders this label as
  // a plain (non-lifecycle) Badge — e.g. the SKU Manager "Active" / "No SKU" /
  // "Retired" chips. Honor that even when the label string also happens to
  // exist in the lifecycle STATUS_MAP, so the legend matches the screen.
  const isPlainBadge = tone !== undefined || icon !== undefined;
  if (!isPlainBadge && status in STATUS_MAP) {
    return <StatusBadge status={status as StatusName} label={label} size="sm" />;
  }
  return (
    <Badge tone={tone ?? "success"}>
      {icon && <Icon name={icon} size={11} strokeWidth={2.25} />}
      {label ?? status}
    </Badge>
  );
}

interface StatusKeyProps {
  /**
   * Status groups this page can actually render. Pass one group when the page
   * shows a single entity's statuses; pass several to label them by entity.
   */
  groups: StatusKeyGroup[];
  /** Accessible label; distinct per page so screen-reader users can tell them apart. */
  label?: string;
}

/**
 * Shared "Status Guide" disclosure explaining the finite status labels a screen
 * can show (Decision #107).
 *
 * A native `<details>`/`<summary>` disclosure, **closed by default on every
 * render**. It is rendered after the primary content so it never competes with
 * the page's main work area. Meanings come from `@/lib/statusKeys`, the single
 * source of truth — pages pass in only the groups they can genuinely display.
 * No label, icon, tone, stored value, or definition is changed here versus the
 * previous always-visible legend; only the presentation is collapsed.
 *
 * Open/closed state is intentionally not persisted (no local storage): the guide
 * is a reference the operator opens on demand, and it starts closed every time.
 */
export function StatusKey({ groups, label = "Status Guide" }: StatusKeyProps) {
  const populated = groups.filter((entry) => entry.entries.length > 0);
  if (populated.length === 0) {
    return null;
  }

  const showEntityHeadings = populated.length > 1;

  return (
    <details
      aria-label={label}
      className="status-guide"
      data-testid="status-key"
      style={{
        borderTop: "1px solid var(--line)",
        marginTop: "var(--space-6)",
        paddingTop: "var(--space-3)",
      }}
    >
      <summary
        style={{
          alignItems: "center",
          color: "var(--text-lo)",
          cursor: "pointer",
          display: "flex",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          gap: "var(--space-2)",
          letterSpacing: "0.08em",
          listStyle: "none",
          paddingBottom: "var(--space-2)",
          textTransform: "uppercase",
          userSelect: "none",
          width: "fit-content",
        }}
      >
        <Icon name="chevron-right" size={12} className="status-guide-chevron" />
        Status Guide
      </summary>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          paddingTop: "var(--space-2)",
        }}
      >
        {populated.map((entry) => (
          <div
            key={entry.entity}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
          >
            {showEntityHeadings && (
              <h3
                style={{
                  color: "var(--text-lo)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {entry.entity}
              </h3>
            )}
            <dl
              style={{
                display: "grid",
                gap: "var(--space-2) var(--space-3)",
                gridTemplateColumns: "max-content 1fr",
                margin: 0,
              }}
            >
              {entry.entries.map((item) => (
                <div key={`${entry.entity}-${item.status}`} style={{ display: "contents" }}>
                  <dt style={{ margin: 0 }}>
                    <KeyLabel status={item.status} label={item.label} tone={item.tone} icon={item.icon} />
                  </dt>
                  <dd
                    style={{
                      color: "var(--text-mid)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      margin: 0,
                    }}
                  >
                    {item.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}
