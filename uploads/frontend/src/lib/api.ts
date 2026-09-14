import type {
  AcceptSkuProposalPayload,
  AuthSession,
  ArtworkAsset,
  ArtworkListParams,
  ArtworkRevalidateDispatch,
  AuditEvent,
  AuditLogListParams,
  BatchListParams,
  ConfigurationComponent,
  Design,
  DashboardMetrics,
  FlagReprintResult,
  BulkFlagReprintResult,
  BulkOrderReimportResult,
  EventPrintDispatchResult,
  EventPrintProductsResponse,
  EventPrintSelection,
  GeneratePptxResult,
  IntegrationStatus,
  MarkPrintedResult,
  NeedsAttentionResponse,
  NeedsAttentionParams,
  NormalizedApiError,
  OrderDetail,
  OrderHistoryListParams,
  OrderListItem,
  OrderListParams,
  OrderReimportResult,
  PackingExportsResponse,
  PackingExportListParams,
  PackingExportRequest,
  PaginatedResponse,
  PreviewPptxDispatchResult,
  ProductionBatch,
  SandboxBatch,
  SandboxCheckoutRequest,
  SandboxCheckoutResult,
  SandboxGeneratePptxResult,
  SandboxResetResult,
  SandboxSku,
  ShopifyCatalogListParams,
  ShopifyCatalogRow,
  SkuGenerateVariantInput,
  SkuListParams,
  SkuProposal,
  TaskDispatchResponse,
  TaskStatusResponse,
  OfferSku,
} from "@/lib/types";

const CSRF_HEADER_NAME = "X-CSRFToken";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
let csrfToken: string | null = null;
let csrfBootstrapPromise: Promise<string> | null = null;
let lastAuthenticationState: boolean | null = null;
let csrfStateVersion = 0;

export class ApiError extends Error implements NormalizedApiError {
  status: number;
  details?: unknown;

  constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = "ApiError";
    this.status = error.status;
    this.details = error.details;
  }
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    if (isLocalHost(window.location.hostname)) {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    return "";
  }

  return "http://localhost:8000";
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function normalizeError(response: Response): Promise<NormalizedApiError> {
  let details: unknown;
  try {
    details = await response.json();
  } catch {
    details = undefined;
  }

  let message = response.statusText || "Request failed";
  if (details && typeof details === "object") {
    const detail = (details as { detail?: unknown }).detail;
    const error = (details as { error?: unknown }).error;
    if (typeof detail === "string") {
      message = detail;
    } else if (typeof error === "string") {
      message = error;
    }
  }

  return {
    status: response.status,
    message,
    details,
  };
}

function clearCsrfState(): void {
  csrfStateVersion += 1;
  csrfToken = null;
  csrfBootstrapPromise = null;
}

export async function ensureCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    clearCsrfState();
  }
  if (csrfToken) {
    return csrfToken;
  }
  if (!csrfBootstrapPromise) {
    const bootstrapVersion = csrfStateVersion;
    const pendingBootstrap = apiFetch<{ csrfToken?: unknown }>("/api/auth/csrf/", {
      method: "GET",
      skipCsrfBootstrap: true,
    })
      .then((payload) => {
        if (typeof payload.csrfToken !== "string" || !payload.csrfToken) {
          throw new Error("CSRF bootstrap failed.");
        }
        if (bootstrapVersion !== csrfStateVersion) {
          return ensureCsrfToken();
        }
        csrfToken = payload.csrfToken;
        return payload.csrfToken;
      })
      .catch((error: unknown) => {
        if (bootstrapVersion === csrfStateVersion) {
          csrfToken = null;
        }
        throw error;
      });
    csrfBootstrapPromise = pendingBootstrap;
    void pendingBootstrap.then(
      () => {
        if (csrfBootstrapPromise === pendingBootstrap) {
          csrfBootstrapPromise = null;
        }
      },
      () => {
        if (csrfBootstrapPromise === pendingBootstrap) {
          csrfBootstrapPromise = null;
        }
      },
    );
  }
  return csrfBootstrapPromise;
}

export interface ApiFetchOptions extends RequestInit {
  skipCsrfBootstrap?: boolean;
  csrfRetry?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    skipCsrfBootstrap = false,
    csrfRetry = false,
    ...requestOptions
  } = options;
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const headers = new Headers(requestOptions.headers);
  const isUnsafe = UNSAFE_METHODS.has(method);
  const isFormData = typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

  if (isUnsafe && !skipCsrfBootstrap) {
    await ensureCsrfToken();
  }

  if (isUnsafe && csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }

  if (requestOptions.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    method,
    headers,
    credentials: "include",
  });

  if (response.status === 403 && isUnsafe && !skipCsrfBootstrap && !csrfRetry) {
    await ensureCsrfToken(true);
    return apiFetch<T>(path, {
      ...requestOptions,
      csrfRetry: true,
    });
  }

  if (!response.ok) {
    throw new ApiError(await normalizeError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>("/api/dashboard/");
}

export function getNeedsAttention(params: NeedsAttentionParams = {}): Promise<NeedsAttentionResponse> {
  const query = new URLSearchParams();
  if (params.blocked_page) query.set("blocked_page", String(params.blocked_page));
  if (params.deferred_page) query.set("deferred_page", String(params.deferred_page));
  if (params.no_sku_page) query.set("no_sku_page", String(params.no_sku_page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  const queryString = query.toString();
  return apiFetch<NeedsAttentionResponse>(`/api/needs-attention/${queryString ? `?${queryString}` : ""}`);
}

export async function getAuthSession(): Promise<AuthSession> {
  try {
    const session = await apiFetch<AuthSession>("/api/auth/session/");
    if (!session.authenticated || lastAuthenticationState !== session.authenticated) {
      clearCsrfState();
    }
    lastAuthenticationState = session.authenticated;
    return session;
  } catch (error) {
    lastAuthenticationState = null;
    clearCsrfState();
    throw error;
  }
}

export function getOrders(params: OrderListParams = {}): Promise<PaginatedResponse<OrderListItem>> {
  const query = new URLSearchParams();
  (params.status ?? []).forEach((value) => query.append("status", value));
  if (params.created_at_after) query.set("created_at_after", params.created_at_after);
  if (params.created_at_before) query.set("created_at_before", params.created_at_before);
  if (params.search) query.set("search", params.search);
  if (params.has_blocked) query.set("has_blocked", params.has_blocked);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.ordering) query.set("ordering", params.ordering);

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<OrderListItem>>(`/api/orders/${queryString ? `?${queryString}` : ""}`);
}

export function getOrder(id: number | string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/orders/${id}/`);
}

export function reimportOrder(id: number | string): Promise<OrderReimportResult> {
  return apiFetch<OrderReimportResult>(`/api/orders/${id}/reimport/`, { method: "POST" });
}

export function bulkReimportOrders(orderIds: number[]): Promise<BulkOrderReimportResult> {
  return apiFetch<BulkOrderReimportResult>("/api/orders/bulk-reimport/", {
    method: "POST",
    body: JSON.stringify({ order_ids: orderIds }),
  });
}

/**
 * `GET /api/tasks/{task_id}/` (added in P34) backs this for Generate PPTX
 * polling. Order reimport remains synchronous and does not use this helper.
 */
export function getTaskStatus(statusUrl: string): Promise<TaskStatusResponse> {
  return apiFetch<TaskStatusResponse>(statusUrl);
}

export function getBatches(params: BatchListParams = {}): Promise<PaginatedResponse<ProductionBatch>> {
  const query = new URLSearchParams();
  if (params.production_group) query.set("production_group", params.production_group);
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    statuses.forEach((status) => query.append("status", status));
  }
  if (params.page) query.set("page", String(params.page));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<ProductionBatch>>(`/api/batches/${queryString ? `?${queryString}` : ""}`);
}

export function getBatch(id: number | string): Promise<ProductionBatch> {
  return apiFetch<ProductionBatch>(`/api/batches/${id}/`);
}

/**
 * Generate a PPTX for a batch. Passing no component IDs (or an empty list)
 * runs the all-items flow; a proper subset splits those components into a new
 * locked batch. Ordering of the IDs is irrelevant — generated placement order
 * always derives from component ID on the server.
 */
export function generateBatchPptx(
  id: number | string,
  componentIds: number[] = [],
): Promise<GeneratePptxResult> {
  const body = componentIds.length > 0 ? JSON.stringify({ component_ids: componentIds }) : undefined;
  return apiFetch<GeneratePptxResult>(`/api/batches/${id}/generate-pptx/`, {
    method: "POST",
    ...(body ? { body } : {}),
  });
}

export function markBatchPrinted(id: number | string): Promise<MarkPrintedResult> {
  return apiFetch<MarkPrintedResult>(`/api/batches/${id}/mark-printed/`, { method: "POST" });
}

/**
 * Generate a non-locking PPTX preview of an Open batch's current contents
 * (Decision #72). No batch/component mutation occurs; poll the returned
 * task_id through the shared `/api/tasks/{task_id}/` contract.
 */
export function previewBatchPptx(id: number | string): Promise<PreviewPptxDispatchResult> {
  return apiFetch<PreviewPptxDispatchResult>(`/api/batches/${id}/preview-pptx/`, { method: "POST" });
}

export function flagComponentReprint(componentId: number | string): Promise<FlagReprintResult> {
  return apiFetch<FlagReprintResult>(`/api/components/${componentId}/flag-reprint/`, { method: "POST" });
}

export function bulkFlagOrderReprints(componentIds: number[]): Promise<BulkFlagReprintResult> {
  return apiFetch<BulkFlagReprintResult>("/api/orders/bulk-flag-reprint/", {
    method: "POST",
    body: JSON.stringify({ component_ids: componentIds }),
  });
}

export function getArtwork(params: ArtworkListParams = {}): Promise<PaginatedResponse<ArtworkAsset>> {
  const query = new URLSearchParams();
  if (params.design_code) query.set("design_code", params.design_code);
  if (params.component_code) query.set("component_code", params.component_code);
  if (params.status) query.set("status", params.status);
  if (params.include_retired) query.set("include_retired", "true");
  if (params.ordering) query.set("ordering", params.ordering);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<ArtworkAsset>>(`/api/artwork/${queryString ? `?${queryString}` : ""}`);
}

/**
 * Fetch an artwork asset's thumbnail image as a Blob, authenticated the same
 * way every other API call is (session cookie via credentials: "include").
 * Drive share links are HTML viewer pages the browser cannot load directly,
 * and public sharing is disabled, so this goes through the backend proxy
 * endpoint rather than pointing an <img>/background-image at Drive.
 */
export async function getArtworkThumbnailBlob(assetId: number | string): Promise<Blob> {
  const response = await fetch(buildUrl(`/api/artwork/${assetId}/thumbnail/`), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(await normalizeError(response));
  }
  return response.blob();
}

export function uploadArtwork(formData: FormData): Promise<ArtworkAsset> {
  return apiFetch<ArtworkAsset>("/api/artwork/upload/", {
    method: "POST",
    body: formData,
  });
}

/**
 * Queue a canonical artwork revalidation. Read-only against Drive. Poll the
 * returned task_id through the shared `/api/tasks/{task_id}/` contract.
 */
export function revalidateArtwork(): Promise<ArtworkRevalidateDispatch> {
  return apiFetch<ArtworkRevalidateDispatch>("/api/artwork/revalidate/", {
    method: "POST",
  });
}

export function retireArtwork(id: number | string): Promise<ArtworkAsset> {
  return apiFetch<ArtworkAsset>(`/api/artwork/${id}/retire/`, { method: "POST" });
}

export function getSkus(params: SkuListParams = {}): Promise<PaginatedResponse<OfferSku>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.is_active !== undefined) query.set("is_active", String(params.is_active));
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<OfferSku>>(`/api/skus/${queryString ? `?${queryString}` : ""}`);
}

export function getPackingExports(params: PackingExportListParams = {}): Promise<PackingExportsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));

  const queryString = query.toString();
  return apiFetch<PackingExportsResponse>(`/api/packing/exports/${queryString ? `?${queryString}` : ""}`);
}

export function triggerPackingExport(payload: PackingExportRequest): Promise<TaskDispatchResponse> {
  return apiFetch<TaskDispatchResponse>("/api/packing/export/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAuditLog(params: AuditLogListParams = {}): Promise<PaginatedResponse<AuditEvent>> {
  const query = new URLSearchParams();
  if (params.entity_type) query.set("entity_type", params.entity_type);
  if (params.entity_id) query.set("entity_id", params.entity_id);
  if (params.action) query.set("action", params.action);
  if (params.created_at_after) query.set("created_at_after", params.created_at_after);
  if (params.created_at_before) query.set("created_at_before", params.created_at_before);
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<AuditEvent>>(`/api/audit-log/${queryString ? `?${queryString}` : ""}`);
}

export function getOrderHistory(
  orderId: string,
  params: OrderHistoryListParams = {},
): Promise<PaginatedResponse<AuditEvent>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<AuditEvent>>(
    `/api/orders/${orderId}/history/${queryString ? `?${queryString}` : ""}`,
  );
}

export function getIntegrationStatus(): Promise<IntegrationStatus> {
  return apiFetch<IntegrationStatus>("/api/settings/integration-status/");
}

export function createSku(payload: { sku: string }): Promise<OfferSku> {
  return apiFetch<OfferSku>("/api/skus/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchSku(id: number | string, payload: Partial<Pick<OfferSku, "sku" | "is_active">>): Promise<OfferSku> {
  return apiFetch<OfferSku>(`/api/skus/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function retireSku(id: number | string): Promise<OfferSku> {
  return apiFetch<OfferSku>(`/api/skus/${id}/retire/`, { method: "POST" });
}

/** Live, read-only Shopify catalog read (Decision #69). */
export function getShopifyCatalog(
  params: ShopifyCatalogListParams = {},
): Promise<PaginatedResponse<ShopifyCatalogRow>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.product_type) query.set("product_type", params.product_type);
  if (params.has_sku !== undefined) query.set("has_sku", String(params.has_sku));
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.product_id !== undefined) query.set("product_id", String(params.product_id));
  if (params.variant_id !== undefined) query.set("variant_id", String(params.variant_id));

  const queryString = query.toString();
  return apiFetch<PaginatedResponse<ShopifyCatalogRow>>(
    `/api/shopify/catalog/${queryString ? `?${queryString}` : ""}`,
  );
}

/** SKU Auto-Generation Engine proposal preview; does not write to offer_skus. */
export function generateSkuProposals(
  variants: SkuGenerateVariantInput[],
): Promise<{ proposals: SkuProposal[] }> {
  return apiFetch<{ proposals: SkuProposal[] }>("/api/skus/generate/", {
    method: "POST",
    body: JSON.stringify({ variants }),
  });
}

/** Accepts one generated proposal, saving it to offer_skus. */
export function acceptSkuProposal(payload: AcceptSkuProposalPayload): Promise<OfferSku> {
  return apiFetch<OfferSku>("/api/skus/generate/accept/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Downloads the complete Shopify product CSV with pending SKUs patched in. */
export async function exportSkusCsv(): Promise<void> {
  const response = await fetch(buildUrl("/api/skus/export.csv"), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(await normalizeError(response));
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products_export_with_spicedanime_skus.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getDesigns(page = 1): Promise<PaginatedResponse<Design>> {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  const queryString = query.toString();
  return apiFetch<PaginatedResponse<Design>>(`/api/designs/${queryString ? `?${queryString}` : ""}`);
}

export async function getAllDesigns(): Promise<Design[]> {
  const rows: Design[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const payload = await getDesigns(page);
    rows.push(...payload.results);
    hasNext = Boolean(payload.next);
    page += 1;
  }

  return rows;
}

export function getConfigurationComponents(page = 1): Promise<PaginatedResponse<ConfigurationComponent>> {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  const queryString = query.toString();
  return apiFetch<PaginatedResponse<ConfigurationComponent>>(
    `/api/configuration-components/${queryString ? `?${queryString}` : ""}`,
  );
}

export function getSandboxBatches(): Promise<SandboxBatch[]> {
  return apiFetch<SandboxBatch[]>("/api/sandbox/batches/");
}

export function getSandboxSkus(): Promise<SandboxSku[]> {
  return apiFetch<SandboxSku[]>("/api/sandbox/skus/");
}

export function checkoutSandboxOrders(
  request: SandboxCheckoutRequest,
): Promise<SandboxCheckoutResult> {
  return apiFetch<SandboxCheckoutResult>("/api/sandbox/checkout/", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function resetSandboxData(): Promise<SandboxResetResult> {
  return apiFetch<SandboxResetResult>("/api/sandbox/reset/", { method: "POST" });
}

export function generateSandboxBatchPptx(id: number | string): Promise<SandboxGeneratePptxResult> {
  return apiFetch<SandboxGeneratePptxResult>(`/api/sandbox/batches/${id}/generate-pptx/`, {
    method: "POST",
  });
}

/** GET /api/event-prints/products/ — producing products/designs browsable by
 * product type, sourced from the design-code registry (Decision #73). */
export function getEventPrintProducts(): Promise<EventPrintProductsResponse> {
  return apiFetch<EventPrintProductsResponse>("/api/event-prints/products/");
}

/**
 * POST /api/event-prints/generate/ — build a production-quality PPTX from an
 * operator-selected set of designs and quantities, with no Shopify order and
 * no production batch (Decision #73). Poll the returned task_id through the
 * shared `/api/tasks/{task_id}/` contract.
 */
export function generateEventPrint(
  selections: EventPrintSelection[],
): Promise<EventPrintDispatchResult> {
  return apiFetch<EventPrintDispatchResult>("/api/event-prints/generate/", {
    method: "POST",
    body: JSON.stringify({ selections }),
  });
}

export async function getAllConfigurationComponents(): Promise<ConfigurationComponent[]> {
  const rows: ConfigurationComponent[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const payload = await getConfigurationComponents(page);
    rows.push(...payload.results);
    hasNext = Boolean(payload.next);
    page += 1;
  }

  return rows;
}
