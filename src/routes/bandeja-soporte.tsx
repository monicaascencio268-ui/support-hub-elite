import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { api, type Ticket } from "@/lib/api";
import { getUsuario } from "@/lib/auth";
import { ErrorBox } from "./mis-tickets";

const ESTADOS = ["TODOS", "CREADO", "ASIGNADO", "VALIDACION", "DEVUELTO", "FINALIZADO", "RECHAZADO"];

export const Route = createFileRoute("/bandeja-soporte")({
  head: () => ({ meta: [{ title: "Bandeja de soporte — IT Support" }] }),
  component: () => (
    <Shell allow={["soporte", "administrador"]}>
      <Bandeja />
    </Shell>
  ),
});

function Bandeja() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("TODOS");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await api.listTickets());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando tickets");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const visible = useMemo(
    () => (filter === "TODOS" ? tickets : tickets.filter((t) => (t.estado || "").toUpperCase() === filter)),
    [tickets, filter],
  );

  const aceptar = async (t: Ticket) => {
    const u = getUsuario();
    if (!u) return;
    try { await api.aceptarTicket(t.id, u.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  const finalizar = async (t: Ticket) => {
    try { await api.finalizarTicket(t.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  const rechazar = async (t: Ticket) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    try { await api.rechazarTicket(t.id, motivo); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODOS: tickets.length };
    for (const t of tickets) {
      const k = (t.estado || "").toUpperCase();
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bandeja de soporte</h1>
        <p className="text-sm text-muted-foreground">Tickets pendientes de gestión.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              filter === s
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "TODOS" ? "Todos" : s} <span className="text-muted-foreground">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {err && <ErrorBox message={err} />}
      {loading ? (
        <div className="rounded-xl border border-border bg-surface/60 p-12 text-center text-sm text-muted-foreground">
          Cargando tickets…
        </div>
      ) : (
        <TicketTable
          tickets={visible}
          getActions={(t) => {
            const e = (t.estado || "").toUpperCase();
            if (e === "CREADO" || e === "DEVUELTO")
              return [
                { kind: "aceptar", onClick: aceptar },
                { kind: "rechazar", onClick: rechazar },
              ];
            if (e === "ASIGNADO")
              return [
                { kind: "finalizar", onClick: finalizar },
                { kind: "rechazar", onClick: rechazar },
              ];
            return [];
          }}
        />
      )}
    </div>
  );
}
