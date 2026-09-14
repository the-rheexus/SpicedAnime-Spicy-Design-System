import { formatDateTime, formatRelativeTimeLong } from "@/lib/datetime";

/**
 * The one intake/activity timestamp convention (P106, item 5).
 *
 * Renders elapsed time as an always-relative phrase ("4 days ago") with the
 * absolute, seconds-free timestamp available on hover via the `title`
 * attribute. Used identically on the Current Batches "Intake" column and the
 * Dashboard `ActiveBatchTable` "Intake" column so the two never disagree.
 *
 * Presentation only — no stored value is read or written here.
 */
export function RelativeTime({
  value,
  now,
  className,
  style,
}: {
  value?: string | null;
  now?: Date;
  className?: string;
  style?: React.CSSProperties;
}) {
  const relative = formatRelativeTimeLong(value, now);
  const absolute = formatDateTime(value);
  return (
    <span
      className={className}
      style={style}
      title={absolute === "—" ? undefined : absolute}
    >
      {relative}
    </span>
  );
}
