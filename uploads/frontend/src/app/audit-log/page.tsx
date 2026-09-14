import { Suspense } from "react";

import { AuditLogScreen } from "@/components/audit-log/AuditLogScreen";
import { LoadingState } from "@/components/ds";

export default function AuditLogPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} label="Loading audit log" />}>
      <AuditLogScreen />
    </Suspense>
  );
}
