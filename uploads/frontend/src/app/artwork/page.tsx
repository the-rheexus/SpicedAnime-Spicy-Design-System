import { Suspense } from "react";

import { ArtworkScreen } from "@/components/artwork/ArtworkScreen";
import { LoadingState } from "@/components/ds";

export default function ArtworkPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} label="Loading artwork library" />}>
      <ArtworkScreen />
    </Suspense>
  );
}
