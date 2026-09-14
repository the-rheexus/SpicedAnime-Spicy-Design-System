import { LoadingState } from "@/components/ds";

interface RoutePlaceholderProps {
  label: string;
}

export function RoutePlaceholder({ label }: RoutePlaceholderProps) {
  return <LoadingState variant="skeleton" rows={5} label={label} />;
}
