import { expect, it } from "vitest";

const routeModules = {
  "/": () => import("@/app/page"),
  "/orders": () => import("@/app/orders/page"),
  "/orders/[id]": () => import("@/app/orders/[id]/page"),
  "/batches": () => import("@/app/batches/page"),
  "/batches/[id]": () => import("@/app/batches/[id]/page"),
  "/needs-attention": () => import("@/app/needs-attention/page"),
  "/artwork": () => import("@/app/artwork/page"),
  "/sku-manager": () => import("@/app/sku-manager/page"),
  "/packing": () => import("@/app/packing/page"),
  "/settings": () => import("@/app/settings/page"),
  "/audit-log": () => import("@/app/audit-log/page"),
  "/sandbox": () => import("@/app/sandbox/page"),
} as const;

for (const [route, load] of Object.entries(routeModules)) {
  it(`loads the ${route} route module`, async () => {
    await expect(load()).resolves.toHaveProperty("default");
  });
}
