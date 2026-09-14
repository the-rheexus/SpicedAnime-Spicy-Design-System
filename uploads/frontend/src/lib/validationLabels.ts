/**
 * Operator-facing short labels for validation failure codes (Decision #88c).
 *
 * The mapping is owned by
 * `docs/02_app_specs/Validation_Errors_Reprints_and_Recovery_SOT.md`
 * ("Operator-Facing Short Labels"), not by this file — this is a verbatim
 * transcription so screens render the short label instead of the raw enum
 * string, with the raw code retained as secondary detail. The stored
 * `validation_failure_code` value is unchanged; this is display-only.
 */
export const VALIDATION_FAILURE_SHORT_LABELS: Record<string, string> = {
  INVALID_CASE: "Lowercase in SKU",
  INVALID_CHARACTERS: "Invalid characters in SKU",
  NO_SKU: "Missing SKU",
  DUPLICATE_SKU: "Duplicate SKU",
  UNKNOWN_FAMILY: "Unknown family code",
  INVALID_FORMAT: "Invalid SKU format",
  UNKNOWN_CONFIG: "Invalid config for family",
  UNKNOWN_OPTION: "Unrecognized option code",
  NO_COMPONENT_RULE: "No decomposition rule",
  MISSING_ARTWORK: "Missing artwork",
  MISSING_SERIES_METAFIELD: "Missing series metafield",
  MISSING_TEMPLATE: "Missing print template",
  FAILED_PPTX_GENERATION: "Print file generation failed",
  STALE_SELECTION: "Selection out of date",
  FAILED_PACKING_EXPORT: "Packing export failed",
  WEBHOOK_FAILURE: "Webhook delivery failed",
  DUPLICATE_ORDER: "Duplicate order",
  FAMILY_DEFERRED_MVP: "Deferred product family",
};

/** Short label for a code, or `undefined` when the SOT table has no entry. */
export function validationFailureShortLabel(code?: string | null): string | undefined {
  if (!code) return undefined;
  return VALIDATION_FAILURE_SHORT_LABELS[code];
}

/** Operator recovery actions from the SOT error catalog above. */
export const VALIDATION_FAILURE_RESOLUTIONS: Record<string, string> = {
  INVALID_CASE: "Update the SKU in Shopify and re-import.",
  INVALID_CHARACTERS: "Update the SKU in Shopify and re-import.",
  NO_SKU: "Add or generate a SKU, then re-import.",
  DUPLICATE_SKU: "Resolve the duplicate in Shopify and retire one record.",
  UNKNOWN_FAMILY: "Add the family or correct the SKU.",
  INVALID_FORMAT: "Correct the SKU format.",
  UNKNOWN_CONFIG: "Correct the SKU or add the config rule.",
  UNKNOWN_OPTION: "Add the option code or correct the SKU.",
  NO_COMPONENT_RULE: "Update the component rules and re-seed them.",
  MISSING_ARTWORK: "Upload artwork to Drive at the expected path, then revalidate artwork.",
  MISSING_SERIES_METAFIELD: "Set Series in Shopify and re-import.",
  MISSING_TEMPLATE: "Add the missing print template.",
  FAILED_PPTX_GENERATION: "Retry generation from Batch Detail.",
  STALE_SELECTION: "Refresh Batch Detail and re-select.",
  FAILED_PACKING_EXPORT: "Retry the packing export.",
  WEBHOOK_FAILURE: "Investigate the webhook receipt and application logs.",
  DUPLICATE_ORDER: "No action is required.",
  FAMILY_DEFERRED_MVP: "No action is required; this is expected behavior.",
};

export function validationFailureResolution(code?: string | null): string | undefined {
  if (!code) return undefined;
  return VALIDATION_FAILURE_RESOLUTIONS[code];
}
