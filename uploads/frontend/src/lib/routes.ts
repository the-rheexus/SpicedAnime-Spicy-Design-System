import type { IconName } from "@/components/ds/core/Icon";

export interface AppRoute {
  key: string;
  label: string;
  href: string;
  icon: IconName;
  topLevel: boolean;
  footer?: boolean;
}

export const appRoutes = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: "layout-dashboard", topLevel: true },
  { key: "orders", label: "Orders", href: "/orders", icon: "shopping-cart", topLevel: true },
  { key: "order-detail", label: "Order Detail", href: "/orders/[id]", icon: "shopping-cart", topLevel: false },
  { key: "batches", label: "Current Batches", href: "/batches", icon: "layers", topLevel: true },
  { key: "batch-detail", label: "Batch Detail", href: "/batches/[id]", icon: "layers", topLevel: false },
  { key: "attention", label: "Needs Attention", href: "/needs-attention", icon: "triangle-alert", topLevel: true },
  { key: "artwork", label: "Artwork Library", href: "/artwork", icon: "image", topLevel: true },
  { key: "skus", label: "SKU Manager", href: "/sku-manager", icon: "tag", topLevel: true },
  { key: "packing", label: "Packing Queue", href: "/packing", icon: "boxes", topLevel: true },
  { key: "event-prints", label: "Event Prints", href: "/event-prints", icon: "printer", topLevel: true },
  { key: "settings", label: "Settings", href: "/settings", icon: "settings", topLevel: true, footer: true },
  { key: "audit", label: "Audit Log", href: "/audit-log", icon: "scroll-text", topLevel: true, footer: true },
  { key: "sandbox", label: "Sandbox", href: "/sandbox", icon: "refresh-cw", topLevel: true, footer: true },
] satisfies AppRoute[];

export const primaryNavItems = appRoutes
  .filter((route) => route.topLevel && !route.footer)
  .map(({ key, label, icon, href }) => ({ key, label, icon, href }));

export const footerNavItems = appRoutes
  .filter((route) => route.topLevel && route.footer)
  .map(({ key, label, icon, href }) => ({ key, label, icon, href }));

export function routeForKey(key: string): AppRoute | undefined {
  return appRoutes.find((route) => route.key === key);
}

export function activeRouteKey(pathname: string): string {
  if (pathname === "/") {
    return "dashboard";
  }
  if (pathname.startsWith("/orders/")) {
    return "orders";
  }
  if (pathname.startsWith("/batches/")) {
    return "batches";
  }
  return appRoutes.find((route) => route.href === pathname)?.key ?? "dashboard";
}

export function titleForPath(pathname: string): string {
  if (pathname.startsWith("/orders/")) {
    return "Order Detail";
  }
  if (pathname.startsWith("/batches/")) {
    return "Batch Detail";
  }
  return appRoutes.find((route) => route.href === pathname)?.label ?? "Dashboard";
}
