import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";

interface QueryBoundaryProps {
  isLoading: boolean;
  isEmpty: boolean;
  scope: string;
  children: React.ReactNode;
  error?: Error | null;
  emptyDescription?: string;
  emptyTitle?: string;
  emptyAction?: { label: string; onClick: () => void };
}

export function QueryBoundary({
  isLoading,
  isEmpty,
  scope,
  children,
  error,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (isEmpty && !error) {
    return (
      <EmptyState
        title={emptyTitle || "No data"}
        description={emptyDescription || `Your ${scope} is empty for now.`}
        action={emptyAction}
      />
    );
  }

  if (error) {
    return <ErrorState title={"Unexpected error"} description={error.message} />;
  }

  return <>{children}</>;
}
