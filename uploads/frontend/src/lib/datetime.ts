/**
 * Shared timestamp formatting (P95 / A1).
 *
 * Displayed timestamps app-wide omit seconds. Stored timestamp precision is
 * unchanged — this is a presentation concern only. Every screen that used to
 * call `new Date(value).toLocaleString()` (which renders seconds) now delegates
 * here.
 */

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

/** Locale date + time with no seconds. Returns an em dash for empty/invalid input. */
export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, DATE_TIME_OPTIONS).format(parsed);
}

/**
 * Relative time for recent events (P95 / A3), used on Dashboard Recent Activity.
 *
 * Below the cutoff the value reads "X minutes ago" / "1 hour ago"; at or beyond
 * the cutoff it falls back to the absolute, seconds-free timestamp. The cutoff
 * is 120 minutes (2 hours) — recorded here so it is a single source of truth.
 */
export const RELATIVE_TIME_CUTOFF_MINUTES = 120;

export function formatRelativeTime(value?: string | null, now: Date = new Date()): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) return formatDateTime(value);

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < RELATIVE_TIME_CUTOFF_MINUTES) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  return formatDateTime(value);
}

/**
 * Always-relative elapsed time (P106 / Decision #88 follow-through).
 *
 * `formatRelativeTime` switches to an absolute timestamp past a 2-hour cutoff,
 * which made the Dashboard and batch "Intake" columns mix "1 hour ago" and
 * "8/17/2026, 4:10 PM" in the same column. This variant stays relative at every
 * age — minutes, hours, days, weeks, months, years — so an intake/activity
 * column reads one way throughout. Pair it with an absolute value on hover
 * (`title={formatDateTime(value)}`); the shared `RelativeTime` component does
 * exactly that.
 *
 * Precision is presentational only; stored timestamps are untouched. Future
 * timestamps fall back to the absolute form rather than rendering "in -3 days".
 */
export function formatRelativeTimeLong(value?: string | null, now: Date = new Date()): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) return formatDateTime(value);

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
