import { Suspense } from "react";

import { LoadingState } from "@/components/ds";
import { EventPrintsScreen } from "@/components/event-prints/EventPrintsScreen";

export default function EventPrintsPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={6} label="Loading Event Prints" />}>
      <EventPrintsScreen />
    </Suspense>
  );
}
