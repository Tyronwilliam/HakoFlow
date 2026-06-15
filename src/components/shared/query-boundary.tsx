import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "./error-state";

interface QueryBoundaryProps {
  isLoading: boolean;
  isEmpty: boolean;
  scope: string;
  children: React.ReactNode;
  error?: Error | null;
}

export function QueryBoundary({ isLoading, isEmpty, scope, children, error }: QueryBoundaryProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (isEmpty && !error) {
    return <EmptyState title={"No data"} description={`Your ${scope} is empty for now.`} />;
  }

  if (error) {
    return <ErrorState title={"Unexpected error"} description={error.message} />;
  }

  return <>{children}</>;
}
