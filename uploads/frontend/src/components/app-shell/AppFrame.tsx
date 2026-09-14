"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/ds";
import { SessionStatus } from "@/components/app-shell/SessionStatus";
import {
  activeRouteKey,
  footerNavItems,
  primaryNavItems,
  titleForPath,
} from "@/lib/routes";

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const active = activeRouteKey(pathname);

  // Sidebar entries carry `href` and render as real Next.js links (Decision
  // #108) — middle-click, Cmd/Ctrl-click, and "Open Link in New Tab" all work
  // natively, and a plain left-click still does an in-place client navigation.
  return (
    <AppShell
      active={active}
      sidebarProps={{
        nav: primaryNavItems,
        footerNav: footerNavItems,
        logoSrc: "/assets/spicedanime-icon.png",
        operator: "Josiah",
        operatorRole: "Operator",
      }}
      topBarProps={{
        title: titleForPath(pathname),
        breadcrumb: ["Operations", titleForPath(pathname)],
        notifications: 0,
        actions: <SessionStatus />,
      }}
    >
      {children}
    </AppShell>
  );
}
