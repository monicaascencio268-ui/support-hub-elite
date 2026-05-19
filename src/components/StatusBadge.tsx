const STYLES: Record<string, string> = {
  CREADO: "bg-status-created/15 text-status-created",
  ASIGNADO: "bg-status-assigned/15 text-status-assigned",
  VALIDACION: "bg-status-validation/15 text-status-validation",
  DEVUELTO: "bg-status-returned/15 text-status-returned",
  FINALIZADO: "bg-status-finished/15 text-status-finished",
  RECHAZADO: "bg-status-rejected/15 text-status-rejected",
  VALIDADO: "bg-status-validated/15 text-status-validated",
};

export function StatusBadge({ estado }: { estado: string }) {
  const key = (estado || "").toUpperCase();
  const cls = STYLES[key] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {key || "—"}
    </span>
  );
}
