import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppFrame } from "@/components/app-shell/AppFrame";

import "./globals.css";

export const metadata: Metadata = {
  title: "SpicedAnime Fulfillment",
  description: "Internal SpicedAnime fulfillment control center.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
