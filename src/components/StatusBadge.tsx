import type { TicketStatus } from "@/lib/ticket-types";

const map: Record<TicketStatus, { label: string; bg: string; text: string; dot: string }> = {
  CREADO:      { label: "Creado",      bg: "bg-status-created/15",    text: "text-status-created",    dot: "bg-status-created" },
  ASIGNADO:    { label: "Asignado",    bg: "bg-status-assigned/15",   text: "text-status-assigned",   dot: "bg-status-assigned" },
  VALIDACION:  { label: "Validación",  bg: "bg-status-validation/15", text: "text-status-validation", dot: "bg-status-validation" },
  DEVUELTO:    { label: "Devuelto",    bg: "bg-status-returned/15",   text: "text-status-returned",   dot: "bg-status-returned" },
  FINALIZADO:  { label: "Finalizado",  bg: "bg-status-finished/15",   text: "text-status-finished",   dot: "bg-status-finished" },
  RECHAZADO:   { label: "Rechazado",   bg: "bg-status-rejected/15",   text: "text-status-rejected",   dot: "bg-status-rejected" },
};

export function StatusBadge({ status, size = "sm" }: { status: TicketStatus; size?: "sm" | "md" }) {
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.bg} ${s.text} ${
        size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export const STATUS_LIST: TicketStatus[] = [
  "CREADO", "ASIGNADO", "VALIDACION", "DEVUELTO", "FINALIZADO", "RECHAZADO",
];
