import { Suspense } from "react";

import { LoadingState } from "@/components/ds";
import { SandboxScreen } from "@/components/sandbox/SandboxScreen";

export default function SandboxPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={6} label="Loading sandbox" />}>
      <SandboxScreen />
    </Suspense>
  );
}
