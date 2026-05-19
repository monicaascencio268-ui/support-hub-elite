import { useNavigate } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import type { Ticket } from "@/lib/api";

type Action =
  | { kind: "aceptar"; onClick: (t: Ticket) => void }
  | { kind: "rechazar"; onClick: (t: Ticket) => void }
  | { kind: "finalizar"; onClick: (t: Ticket) => void }
  | { kind: "validar"; onClick: (t: Ticket) => void };

export function TicketTable({
  tickets,
  getActions,
  empty = "No hay tickets para mostrar.",
}: {
  tickets: Ticket[];
  getActions?: (t: Ticket) => Action[];
  empty?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
      <table className="w-full text-sm">
        <thead className="bg-surface-elevated/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Correlativo</th>
            <th className="px-4 py-3 font-medium">Detalles</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const acts = getActions?.(t) ?? [];
            return (
              <tr key={t.id} className="border-t border-border/60 transition hover:bg-surface-elevated/50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{t.id}</td>
                <td className="px-4 py-3 font-medium">{t.correlativo}</td>
                <td className="px-4 py-3 max-w-md text-muted-foreground">
                  <span className="line-clamp-2">{t.detalles}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge estado={t.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      onClick={() => navigate({ to: "/timeline", search: { id: t.id } })}
                      className="rounded-md bg-status-created/15 px-2.5 py-1 text-[11px] font-semibold text-status-created hover:bg-status-created/25"
                    >
                      Timeline
                    </button>
                    {acts.map((a) => (
                      <ActionButton key={a.kind} action={a} ticket={t} />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActionButton({ action, ticket }: { action: Action; ticket: Ticket }) {
  const styles: Record<Action["kind"], { cls: string; label: string }> = {
    aceptar:   { cls: "bg-status-finished/15 text-status-finished hover:bg-status-finished/25", label: "Aceptar" },
    finalizar: { cls: "bg-status-finished/15 text-status-finished hover:bg-status-finished/25", label: "Finalizar" },
    rechazar:  { cls: "bg-status-rejected/15 text-status-rejected hover:bg-status-rejected/25", label: "Rechazar" },
    validar:   { cls: "bg-status-validation/15 text-status-validation hover:bg-status-validation/25", label: "Validar" },
  };
  const s = styles[action.kind];
  return (
    <button
      onClick={() => action.onClick(ticket)}
      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      {s.label}
    </button>
  );
}
