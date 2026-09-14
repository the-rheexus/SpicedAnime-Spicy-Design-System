import { Suspense } from "react";

import { BatchesScreen } from "@/components/batches/BatchesScreen";
import { LoadingState } from "@/components/ds";

export default function BatchesPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={6} label="Loading current batches" />}>
      <BatchesScreen />
    </Suspense>
  );
}
