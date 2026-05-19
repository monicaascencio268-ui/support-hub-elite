export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/40 p-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
