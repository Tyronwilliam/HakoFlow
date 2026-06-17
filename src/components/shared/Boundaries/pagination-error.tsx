interface PaginationErrorProps {
  error: Error | null | undefined;
  hasPreviousData: boolean;
  onRetry: () => void;
}

export function PaginationError({ error, hasPreviousData, onRetry }: PaginationErrorProps) {
  if (!error || !hasPreviousData) return null;

  return (
    <div className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-sm">
      <span>Impossible de charger d&apos;autres éléments</span>
      <button onClick={onRetry} className="text-primary underline">
        Réessayer
      </button>
    </div>
  );
}
