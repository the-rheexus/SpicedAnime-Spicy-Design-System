import { Suspense } from "react";

import { OrdersScreen } from "@/components/orders/OrdersScreen";
import { LoadingState } from "@/components/ds";

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} label="Loading orders" />}>
      <OrdersScreen />
    </Suspense>
  );
}
