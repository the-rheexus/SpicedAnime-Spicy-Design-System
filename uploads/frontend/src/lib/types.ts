export type ISODateTime = string;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NormalizedApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface AuditEvent {
  id: number;
  actor_type: string;
  actor_id?: string | null;
  /** Human-readable actor descriptor from the serializer (P95 A2), e.g. "Operator". */
  actor_label?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  /** Human-readable affected-object descriptor (P95 A2), e.g. "Order #3479". */
  entity_label?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: ISODateTime;
}

export interface DashboardBatchCount {
  production_group: string;
  open_count: number;
}

export interface DashboardQueueTotals {
  orders_queued_for_production: number;
  components_blocked: number;
  components_deferred_mvp: number;
  batches_locked_for_review: number;
  batches_printed: number;
}

export interface DashboardMetrics {
  active_open_batches_by_production_group: DashboardBatchCount[];
  locked_for_review_batch_count: number;
  printed_batch_count: number;
  blocked_component_count: number;
  deferred_mvp_component_count: number;
  queued_for_production_order_count: number;
  queue_totals: DashboardQueueTotals;
  recent_activity: AuditEvent[];
}

export interface NeedsAttentionResponse {
  errors: BlockedComponent[];
  deferred: DeferredComponent[];
  no_sku: NoSkuItem[];
  webhook_failures?: WebhookFailure[];
  errors_pagination: QueuePagination;
  deferred_pagination: QueuePagination;
  no_sku_pagination: QueuePagination;
  webhook_failures_pagination?: QueuePagination;
  badge_count: number;
  webhook_failure_count?: number;
}

export interface NoSkuItem {
  id: number;
  order_item_id: number;
  order_id: number;
  order_number: string;
  product_name: string;
  variant_options: string;
  shopify_product_id?: string | null;
  shopify_variant_id?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface QueuePagination {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: number | null;
  previous: number | null;
}

export interface OrderListItem {
  id: number;
  shopify_order_id: string;
  order_number: string;
  sales_channel: string;
  financial_status: string;
  fulfillment_status?: string | null;
  status: string;
  shopify_created_at: ISODateTime;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  item_count?: number;
  has_blocked?: boolean;
  /**
   * Decision #105 / P116 derived list fields. `blocked_count` is the exact
   * number of `Blocked` production components on the order (always agrees with
   * `has_blocked`). `reprint_eligible_count` is the number of `Printed`
   * components — a display optimisation for the reprint control only; the
   * reprint endpoint stays authoritative on eligibility.
   */
  blocked_count?: number;
  reprint_eligible_count?: number;
}

export interface OrderDetail extends OrderListItem {
  customer_email: string;
  shipping_address: Record<string, unknown>;
  items: OrderItem[];
  generated_files?: OrderGeneratedFile[];
}

/** Safe artwork metadata nested on a production component in Order Detail. */
export interface OrderArtwork {
  id: number;
  component_code: string;
  design_code: string;
  status: string;
  source_file_path: string;
  drive_share_url?: string | null;
  /** Existing same-origin, session-authenticated thumbnail endpoint. */
  thumbnail_url: string;
}

/** A generated file from a batch containing a component from this order. */
export interface OrderGeneratedFile {
  id: number;
  file_type: string;
  file_name: string;
  drive_share_url?: string | null;
  created_at: ISODateTime;
  batch_id: number;
  batch_label: string;
}

export interface OrderListParams {
  /** One or more statuses; repeated as separate `status` query params (union). */
  status?: string[];
  created_at_after?: string;
  created_at_before?: string;
  search?: string;
  has_blocked?: string;
  page?: number;
  page_size?: number;
  /** Order # sort: "order_number" (ascending) or "-order_number" (descending). */
  ordering?: string;
}

export interface OrderReimportResult {
  order_id: number;
  order_status: string;
  components_created: number;
  items_processed: number;
  batch_items_created?: number;
}

export interface BulkOrderReimportItemResult {
  order_id: number;
  order_number: string | null;
  outcome: "succeeded" | "failed";
  items_processed: number;
  components_created: number;
  remaining_missing_sku_items: number;
  failure_code: string | null;
  message: string;
}

export interface BulkOrderReimportResult {
  requested_order_ids: number[];
  order_ids: number[];
  results: BulkOrderReimportItemResult[];
}

export type TaskStatusState = "idle" | "running" | "succeeded" | "failed" | "timed_out";

export interface PptxTaskSuccessResult {
  task_type: "pptx_generation";
  batch_id: number;
  generated_file_id: number;
}

export interface TaskStatusResponse {
  task_id?: string;
  celery_status?: string;
  status: string;
  result?: unknown;
  error?: string | null;
  output_ready?: boolean | null;
}

export interface OrderItem {
  id: number;
  shopify_line_item_id: string;
  shopify_product_id?: string | null;
  shopify_variant_id?: string | null;
  sku: string;
  product_name: string;
  variant_title?: string | null;
  quantity: number;
  family_code?: string | null;
  design_code?: string | null;
  config_code?: string | null;
  options?: Record<string, unknown> | null;
  validation_failure_code?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  components?: ProductionComponent[];
}

export interface BatchListParams {
  production_group?: string;
  status?: string | string[];
  page?: number;
}

export interface ArtworkListParams {
  design_code?: string;
  component_code?: string;
  status?: string;
  include_retired?: boolean;
  ordering?: "design_code" | "-design_code" | "-updated_at" | "updated_at";
  page?: number;
  page_size?: number;
}

export interface SkuListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface ShopifyCatalogRow {
  product_id: number | string;
  product_title: string;
  product_type: string;
  product_handle: string;
  product_status?: string | null;
  tags?: string | null;
  variant_id: number | string;
  option_values: string[];
  option_names: string[];
  sku: string;
  has_sku: boolean;
  offer_sku: OfferSku | null;
}

export interface ShopifyCatalogListParams {
  search?: string;
  product_type?: string;
  has_sku?: boolean;
  page?: number;
  page_size?: number;
  product_id?: number | string;
  variant_id?: number | string;
}

export interface SkuGenerateVariantInput {
  client_key?: string;
  variant_id: number | string;
  product_handle: string;
  product_title: string;
  product_type: string;
  tags?: string | null;
  option_values: string[];
  option_names: string[];
}

export interface SkuProposalCandidate {
  sku: string;
  is_duplicate: boolean;
}

export interface SkuProposal {
  client_key?: string | null;
  variant_id: number | string;
  family_code: string | null;
  design_code: string | null;
  design_is_new: boolean;
  proposed_skus: SkuProposalCandidate[];
  options: Record<string, unknown>;
  option_names?: string[];
  placeholders: string[];
  warnings: string[];
  errors: string[];
  excluded: boolean;
  skipped_no_family: boolean;
  is_approvable: boolean;
}

export interface AcceptSkuProposalPayload {
  sku: string;
  product_handle?: string | null;
  product_title?: string | null;
  option_values?: string[];
  option_names?: string[];
}

export interface PackingExportListParams {
  page?: number;
}

export interface PackingExportRequest {
  window_start: ISODateTime;
  window_end: ISODateTime;
}

export interface TaskDispatchResponse {
  task_id: string | null;
}

/** POST /api/artwork/revalidate/ — 202 for both a new run and a reused active one. */
export interface ArtworkRevalidateDispatch {
  task_id: string | null;
  run_id: number;
  reused: boolean;
  detail?: string;
}

/**
 * Successful result of the `artwork_reconciliation` task. Counts only, plus
 * bounded root-relative path samples. Never carries Drive file identifiers.
 */
export interface ArtworkReconciliationResult {
  task_type: "artwork_reconciliation";
  trigger: string;
  scan_complete: boolean;
  failure_reason: string | null;
  files_scanned: number;
  assets_checked: number;
  canonical_matches: number;
  components_resolved: number;
  still_missing: number;
  misplaced: number;
  duplicates: number;
  unknown: number;
  skipped: number;
  errors: number;
  samples?: {
    misplaced: string[];
    duplicates: string[];
    unknown: string[];
  };
  samples_truncated?: boolean;
}

export interface AuditLogListParams {
  entity_type?: string;
  entity_id?: string;
  action?: string;
  created_at_after?: string;
  created_at_before?: string;
  page?: number;
  page_size?: number;
}

/** Pagination controls for one order's aggregated lifecycle timeline. */
export interface OrderHistoryListParams {
  page?: number;
  page_size?: number;
}

export interface ShopifyIntegrationStatus {
  connected: boolean;
  last_webhook_at: ISODateTime | null;
  api_version: string | null;
}

export interface DriveIntegrationStatus {
  root_folder_configured: boolean;
  last_export_at: ISODateTime | null;
}

export interface CeleryIntegrationStatus {
  worker_reachable: boolean;
}

export interface IntegrationStatus {
  shopify: ShopifyIntegrationStatus;
  drive: DriveIntegrationStatus;
  celery: CeleryIntegrationStatus;
}

export interface Design {
  id: number;
  internal_design_id: string;
  design_code: string;
  design_name: string;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ConfigurationComponent {
  id: number;
  family_code: string;
  config_code: string;
  component_code: string;
  quantity: number;
  batch_group: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface GeneratePptxResult {
  locked_batch_id: number;
  locked_batch_status: string;
  /** For a subset split this is the original batch, which stays Open. */
  replacement_open_batch_id: number;
  replacement_open_batch_status: string;
  replacement_open_batch_created: boolean;
  selection_mode?: "all_items" | "selected_items";
  source_open_batch_id?: number;
  selected_component_ids?: number[];
  auto_included_component_ids?: number[];
  task_id: string | null;
}

/** Structured 409 body returned when a selection references stale components. */
export interface StaleSelectionErrorDetails {
  detail: string;
  error_code: "STALE_SELECTION";
  stale_component_ids: number[];
  stale_component_labels: string[];
}

/** Read-only webhook processing failure surfaced on Needs Attention. */
export interface WebhookFailure {
  id: number;
  topic: string;
  webhook_delivery_id: string;
  event_id?: string | null;
  shopify_order_id?: string | null;
  order_id?: number | null;
  order_number?: string | null;
  received_at: ISODateTime;
  outcome: string;
  state_mutated: boolean;
  failure_summary?: string | null;
}

export interface MarkPrintedResult {
  batch_id: number;
  batch_status: string;
  components_marked_printed: number;
  component_ids_marked_printed: number[];
  orders_promoted_count: number;
  orders_promoted: number[];
}

export interface FlagReprintResult {
  original_component_id: number;
  original_component_status: string;
  replacement_component_id: number;
  replacement_component_status: string;
  replacement_batch_id: number;
  replacement_batch_status: string;
  batch_group: string;
}

export interface BulkFlagReprintResult {
  requested_component_ids: number[];
  component_ids: number[];
  auto_included_component_ids: number[];
  affected_order_ids: number[];
  results: FlagReprintResult[];
}

export interface ProductionBatch {
  id: number;
  production_group: string;
  batch_number: number;
  batch_label: string;
  status: string;
  opened_at: ISODateTime;
  locked_at?: ISODateTime | null;
  printed_at?: ISODateTime | null;
  archived_at?: ISODateTime | null;
  generated_file_url?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  item_count?: number;
  batch_items?: BatchItem[];
  generated_files?: GeneratedFile[];
  component_status_counts?: Record<string, number>;
}

export interface BatchItem {
  id: number;
  batch?: number;
  component?: ProductionComponent;
  component_id?: number;
  created_at: ISODateTime;
}

export interface ProductionComponent {
  id: number;
  order_item_id?: number;
  order_id?: number;
  order_number?: string | null;
  order_date?: ISODateTime | null;
  component_code: string;
  family_code: string;
  design?: number | null;
  design_code?: string | null;
  config_code?: string | null;
  batch_group?: string | null;
  artwork_asset?: number | null;
  artwork?: OrderArtwork | null;
  print_template?: number | null;
  status: string;
  validation_failure_code?: string | null;
  batch_id?: number | null;
  sku?: string | null;
  /** White / Gold / Silver border colour (Decision #57); null for components with no colour variation. */
  color?: string | null;
  product_name?: string | null;
  error_message?: string | null;
  expected_file_path?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface BlockedComponent extends ProductionComponent {
  status: "Blocked";
  error_message?: string | null;
  expected_file_path?: string | null;
}

export interface DeferredComponent extends ProductionComponent {
  status: "Deferred MVP";
  validation_failure_code: "FAMILY_DEFERRED_MVP" | string | null;
}

export interface OfferSku {
  id: number;
  sku: string;
  family_code: string;
  design: number;
  design_code: string;
  config_code: string;
  options?: Record<string, unknown> | null;
  is_active: boolean;
  design_id?: number;
  design_name?: string;
  exported_at?: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ArtworkAsset {
  id: number;
  design: number;
  design_code: string;
  design_name?: string;
  component_code: string;
  source_file_path: string;
  drive_file_id?: string | null;
  drive_share_url?: string | null;
  status: string;
  /** Decision #78 (P95 B3): true for assets created by the sandbox checkout flow. */
  is_sandbox?: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface PackingExport {
  id: number;
  export_label: string;
  export_window_start?: ISODateTime | null;
  export_window_end?: ISODateTime | null;
  status: string;
  generated_file?: number | null;
  generated_file_id?: number | null;
  drive_share_url?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface PackingExportDefaultWindow {
  window_start: ISODateTime;
  window_end: ISODateTime;
  first_export: boolean;
  has_remaining_backlog: boolean;
}

export interface PackingExportsResponse extends PaginatedResponse<PackingExport> {
  default_window: PackingExportDefaultWindow;
}

export interface NeedsAttentionParams {
  blocked_page?: number;
  deferred_page?: number;
  no_sku_page?: number;
  page_size?: number;
}

export interface GeneratedFile {
  id: number;
  file_type: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  drive_file_id?: string | null;
  drive_share_url?: string | null;
  production_batch?: number | null;
  production_batch_id?: number | null;
  packing_export?: number | null;
  packing_export_id?: number | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** Sandbox batch row for GET /api/sandbox/batches/ (Decision #47). */
export interface SandboxBatch {
  id: number;
  production_group: string;
  batch_number: number;
  batch_label: string;
  status: string;
  opened_at: ISODateTime;
  generated_file_url?: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  item_count: number;
  batch_items: BatchItem[];
}

/** GET /api/sandbox/skus/ row: one of the 14 fixed sandbox SKUs (Decision #58). */
export interface SandboxSku {
  sku: string;
  family_code: string;
  design_code: string;
}

/** POST /api/sandbox/checkout/ body: up to 7 order groups, each {sku: quantity}. */
export interface SandboxCheckoutRequest {
  order_groups: Record<string, number>[];
}

/** POST /api/sandbox/checkout/ result (Decision #58). */
export interface SandboxCheckoutResult {
  order_groups_submitted: number;
  orders_created: number;
  order_numbers: string[];
  components_touched: number;
}

/** POST /api/sandbox/reset/ result (Decision #58: full wipe, no baseline restore). */
export interface SandboxResetResult {
  orders_deleted: number;
  components_deleted: number;
  batches_deleted: number;
}

/** POST /api/sandbox/batches/{id}/generate-pptx/ result. */
export interface SandboxGeneratePptxResult {
  batch_id: number;
  batch_status: string;
  task_id: string | null;
}

export interface AuthSession {
  authenticated: boolean;
  user: {
    id: number;
    username: string;
    display_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  } | null;
}

/** POST /api/batches/{id}/preview-pptx/ dispatch result (Decision #72). */
export interface PreviewPptxDispatchResult {
  batch_id: number;
  batch_status: string;
  task_id: string | null;
}

/** Polled task result shape for a completed batch-preview task. */
export interface PptxPreviewTaskResult {
  task_type: "pptx_preview";
  batch_id: number;
  filename: string;
  drive_file_id: string;
  share_url: string;
}

/** One producing (design, product type) row from GET /api/event-prints/products/. */
export interface EventPrintProduct {
  product_type: string;
  design_code: string;
  design_name: string;
  family_code: string;
  component_code: string;
  needs_color: boolean;
}

/** GET /api/event-prints/products/ response (Decision #73). */
export interface EventPrintProductsResponse {
  product_types: string[];
  products: EventPrintProduct[];
}

/** One operator selection in a POST /api/event-prints/generate/ request. */
export interface EventPrintSelection {
  product_type: string;
  design_code: string;
  family_code: string;
  component_code: string;
  quantity: number;
  color?: string;
}

/** POST /api/event-prints/generate/ dispatch result. */
export interface EventPrintDispatchResult {
  task_id: string | null;
}

/** Polled task result shape for a completed Event Prints generation task. */
export interface EventPrintTaskResult {
  task_type: "event_print";
  filename: string;
  drive_file_id: string;
  share_url: string;
  product_types: string[];
}
