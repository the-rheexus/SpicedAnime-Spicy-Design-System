import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("cross-origin CSRF transport", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    Reflect.deleteProperty(URL, "createObjectURL");
    Reflect.deleteProperty(URL, "revokeObjectURL");
  });

  it("bootstraps a masked token, keeps credentials included, and reuses the token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "masked-token-1" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { reimportOrder } = await import("@/lib/api");

    await reimportOrder(1);
    await reimportOrder(2);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.test/api/auth/csrf/");
    for (const [, init] of fetchMock.mock.calls) {
      expect(init.credentials).toBe("include");
    }
    for (const call of fetchMock.mock.calls.slice(1)) {
      expect((call[1].headers as Headers).get("X-CSRFToken")).toBe("masked-token-1");
    }
  });

  it("refreshes stale CSRF state once before retrying an unsafe request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "stale-token" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "CSRF failed" }, 403))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "fresh-token" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { markBatchPrinted } = await import("@/lib/api");

    await markBatchPrinted(7);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((fetchMock.mock.calls[1][1].headers as Headers).get("X-CSRFToken")).toBe("stale-token");
    expect((fetchMock.mock.calls[3][1].headers as Headers).get("X-CSRFToken")).toBe("fresh-token");
  });

  it("clears failed bootstrap state so a later request can recover", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: "unavailable" }, 503))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "recovered-token" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { retireArtwork } = await import("@/lib/api");

    await expect(retireArtwork(1)).rejects.toMatchObject({ status: 503 });
    await retireArtwork(1);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[2][1].headers as Headers).get("X-CSRFToken")).toBe("recovered-token");
  });

  it("clears in-memory CSRF state when the session becomes anonymous", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "session-token-1" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ authenticated: false, user: null }))
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "session-token-2" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { getAuthSession, triggerPackingExport } = await import("@/lib/api");

    await triggerPackingExport({ window_start: "2026-07-01T00:00:00Z", window_end: "2026-07-02T00:00:00Z" });
    await getAuthSession();
    await triggerPackingExport({ window_start: "2026-07-02T00:00:00Z", window_end: "2026-07-03T00:00:00Z" });

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock.mock.calls[3][0]).toBe("https://api.example.test/api/auth/csrf/");
    expect((fetchMock.mock.calls[4][1].headers as Headers).get("X-CSRFToken")).toBe("session-token-2");
  });

  it("routes every operator mutation through the same masked-token contract", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      void _init;
      if (String(input).endsWith("/api/auth/csrf/")) {
        return jsonResponse({ csrfToken: "shared-masked-token" });
      }
      return jsonResponse({});
    });
    vi.stubGlobal("fetch", fetchMock);
    const api = await import("@/lib/api");

    await api.reimportOrder(1);
    await api.generateBatchPptx(2);
    await api.markBatchPrinted(2);
    await api.flagComponentReprint(3);
    await api.uploadArtwork(new FormData());
    await api.retireArtwork(4);
    await api.createSku({ sku: "ASH-TEST-SOLO" });
    await api.patchSku(5, { is_active: true });
    await api.retireSku(5);
    await api.triggerPackingExport({
      window_start: "2026-07-01T00:00:00Z",
      window_end: "2026-07-02T00:00:00Z",
    });

    const mutationCalls = fetchMock.mock.calls.filter(([, init]) =>
      ["POST", "PATCH"].includes(String(init?.method)),
    );
    expect(mutationCalls).toHaveLength(10);
    for (const [, init] of mutationCalls) {
      expect(init?.credentials).toBe("include");
      expect((init?.headers as Headers).get("X-CSRFToken")).toBe("shared-masked-token");
    }
  });

  it("sends the active batch statuses as repeated query parameters and keeps Needs Attention pages independent", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ count: 0, next: null, previous: null, results: [] }))
      .mockResolvedValueOnce(jsonResponse({ errors: [], deferred: [], errors_pagination: {}, deferred_pagination: {}, badge_count: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getBatches, getNeedsAttention } = await import("@/lib/api");

    await getBatches({ status: ["Open", "Locked for Review"] });
    await getNeedsAttention({ blocked_page: 2, deferred_page: 3, page_size: 25 });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/batches/?status=Open&status=Locked+for+Review",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api.example.test/api/needs-attention/?blocked_page=2&deferred_page=3&page_size=25",
    );
  });

  it("downloads the pending SKU export from the authenticated CSV endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Handle,Variant SKU\nnaruto,ASH-NARUTO-SOLO", {
        status: 200,
        headers: { "Content-Type": "text/csv" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const createObjectUrl = vi.fn().mockReturnValue("blob:sku-export");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const { exportSkusCsv } = await import("@/lib/api");

    await exportSkusCsv();

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/api/skus/export.csv", {
      credentials: "include",
    });
    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe(
      "products_export_with_spicedanime_skus.csv",
    );
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:sku-export");
  });
});
