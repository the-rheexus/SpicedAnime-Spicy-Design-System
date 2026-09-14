/**
 * Compatibility alias. The aging flag now lives in the shared design system as
 * `AgingFlag` (`@/components/ds`), rendering in the Warning tone per Decision
 * #87. This module is kept so the Orders call sites wired up in P95 keep
 * working unchanged; P105+ migrate them to import `AgingFlag` directly.
 *
 * `AgingIndicator` is a re-export of `AgingFlag` — same props (`sinceIso`,
 * `now`, `style`), plus an optional `thresholdDays`.
 */
export {
  AgingFlag as AgingIndicator,
  AGING_THRESHOLD_DAYS,
  calendarDaysSince,
  isAging,
} from "@/components/ds/feedback/AgingFlag";
