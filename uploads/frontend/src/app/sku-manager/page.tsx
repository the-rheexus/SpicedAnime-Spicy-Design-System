import { Suspense } from "react";

import { LoadingState } from "@/components/ds";
import { SkuManagerScreen } from "@/components/sku-manager/SkuManagerScreen";

export default function SkuManagerPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} label="Loading SKU manager" />}>
      <SkuManagerScreen />
    </Suspense>
  );
}
