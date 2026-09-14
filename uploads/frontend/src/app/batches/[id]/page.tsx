import { BatchDetailScreen } from "@/components/batches/BatchDetailScreen";

interface BatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { id } = await params;
  return <BatchDetailScreen batchId={id} />;
}
