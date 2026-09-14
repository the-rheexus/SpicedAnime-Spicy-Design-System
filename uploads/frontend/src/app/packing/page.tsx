import { Suspense } from "react";

import { LoadingState } from "@/components/ds";
import { PackingScreen } from "@/components/packing/PackingScreen";

export default function PackingPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} label="Loading packing queue" />}>
      <PackingScreen />
    </Suspense>
  );
}
