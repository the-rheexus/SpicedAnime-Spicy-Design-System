import type { ReactNode } from "react";
import Link from "next/link";

import { EmptyState, ErrorAlert } from "@/components/ds";
import type { BlockedComponent, QueuePagination } from "@/lib/types";
import { validationFailureResolution, validationFailureShortLabel } from "@/lib/validationLabels";

interface BlockedComponentsTableProps {
  components: BlockedComponent[];
  pagination: QueuePagination;
}

interface BlockedIssue {
  key: string;
  components: BlockedComponent[];
  issue: string;
  resolution: string;
}

export function groupBlockedComponents(components: BlockedComponent[]): BlockedIssue[] {
  const groups = new Map<string, BlockedIssue>();
  for (const component of components) {
    const rawCode = component.validation_failure_code ?? "";
    const issue = validationFailureShortLabel(rawCode) ?? (rawCode || "Validation issue");
    const resolution = validationFailureResolution(rawCode) ?? component.error_message ?? "Review the technical details.";
    const itemKey = component.order_item_id ?? `component-${component.id}`;
    const key = `${itemKey}::${rawCode}::${resolution}`;
    const existing = groups.get(key);
    if (existing) existing.components.push(component);
    else groups.set(key, { key, components: [component], issue, resolution });
  }
  return Array.from(groups.values());
}

export function BlockedComponentsTable({ components, pagination }: BlockedComponentsTableProps) {
  if (components.length === 0) {
    return (
      <EmptyState icon="circle-check" title="NO BLOCKED COMPONENTS" compact>
        Blocking validation failures appear here when components cannot enter production.
      </EmptyState>
    );
  }

  const issues = groupBlockedComponents(components);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ErrorAlert
        tone="error"
        title={`${pagination.count} affected component${pagination.count === 1 ? "" : "s"} · ${issues.length} issue${issues.length === 1 ? "" : "s"} ${pagination.total_pages > 1 ? "on this page" : "requiring resolution"}`}
      >
        Resolve each issue before its affected components can continue through production.
      </ErrorAlert>

      <div style={{ background: "var(--surface-card)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-sans)", minWidth: 900, width: "100%" }}>
          <thead>
            <tr style={{ background: "var(--ink-850)" }}>
              <HeaderCell width="10%">Order</HeaderCell>
              <HeaderCell width="27%">Item / SKU</HeaderCell>
              <HeaderCell width="15%">Components</HeaderCell>
              <HeaderCell width="20%">Issue</HeaderCell>
              <HeaderCell width="28%">Resolution</HeaderCell>
            </tr>
          </thead>
          <tbody>{issues.map((issue) => <BlockedIssueRow key={issue.key} issue={issue} />)}</tbody>
        </table>
      </div>
    </div>
  );
}

function BlockedIssueRow({ issue }: { issue: BlockedIssue }) {
  const first = issue.components[0];
  return (
    <tr style={{ borderTop: "1px solid var(--line)" }}>
      <Cell mono>
        {first.order_id && first.order_number ? (
          <Link href={`/orders/${first.order_id}`} style={{ color: "var(--text-hi)", fontWeight: 700, textDecoration: "none" }}>
            {first.order_number}
          </Link>
        ) : (first.order_number ?? "—")}
      </Cell>
      <Cell>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "var(--text-hi)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{first.sku || "No SKU"}</span>
          {first.product_name && <span style={{ color: "var(--text-low)", fontSize: 12 }}>{first.product_name}</span>}
        </div>
      </Cell>
      <Cell mono>{formatComponentLabels(issue.components)}</Cell>
      <Cell><span style={{ color: "var(--text-hi)", fontWeight: 700 }}>{issue.issue}</span></Cell>
      <Cell>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <span>{issue.resolution}</span>
          <TechnicalDetails issue={issue} />
        </div>
      </Cell>
    </tr>
  );
}

function TechnicalDetails({ issue }: { issue: BlockedIssue }) {
  const components = issue.components;
  const first = components[0];
  const values = (selector: (component: BlockedComponent) => string | number | null | undefined) =>
    Array.from(new Set(components.map(selector).filter((value): value is string | number => value !== null && value !== undefined && value !== ""))).join(", ") || "—";

  return (
    <details>
      <summary style={{ color: "var(--spice-400)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "var(--ls-label)", textTransform: "uppercase" }}>
        Technical details
      </summary>
      <dl style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-sm)", color: "var(--text-low)", display: "grid", fontSize: 12, gap: "var(--space-2)", gridTemplateColumns: "max-content minmax(0, 1fr)", margin: "var(--space-3) 0 0", padding: "var(--space-3)" }}>
        <Detail label="Family" value={values((component) => component.family_code)} />
        <Detail label="Config" value={values((component) => component.config_code)} />
        <Detail label="Design" value={values((component) => component.design_code)} />
        <Detail label="Raw failure" value={first.validation_failure_code || "—"} mono />
        <Detail label="Expected path" value={values((component) => component.expected_file_path)} mono />
        <Detail label="Component IDs" value={values((component) => component.id)} mono />
      </dl>
    </details>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt style={{ color: "var(--text-low)", fontWeight: 700 }}>{label}</dt>
      <dd style={{ color: "var(--text-mid)", fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", margin: 0, overflowWrap: "anywhere" }}>{value}</dd>
    </>
  );
}

function formatComponentLabels(components: BlockedComponent[]): string {
  const labels = Array.from(new Set(components.map((component) => {
    if (component.component_code === "LITF" || component.component_code === "WALF") return "Front";
    if (component.component_code === "LITB" || component.component_code === "WALB") return "Back";
    return component.component_code;
  })));
  return labels.length === 2 && labels.includes("Front") && labels.includes("Back") ? "Front + Back" : labels.join(", ");
}

function HeaderCell({ children, width }: { children: ReactNode; width: string }) {
  return <th style={{ color: "var(--text-low)", fontSize: 10, fontWeight: 700, letterSpacing: "var(--ls-label)", padding: "13px 18px", textAlign: "left", textTransform: "uppercase", whiteSpace: "nowrap", width }}>{children}</th>;
}

function Cell({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return <td style={{ color: "var(--text-mid)", fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", fontSize: mono ? 13 : 14, padding: "14px 18px", verticalAlign: "top" }}>{children}</td>;
}
