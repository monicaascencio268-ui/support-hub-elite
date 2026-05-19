import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { api, type Ticket } from "@/lib/api";
import { getUsuario } from "@/lib/auth";

export const Route = createFileRoute("/mis-tickets")({
  head: () => ({ meta: [{ title: "Mis tickets — IT Support" }] }),
  component: () => (
    <Shell allow={["solicitante"]}>
      <MisTickets />
    </Shell>
  ),
});

function MisTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const user = getUsuario();
      const all = await api.listTickets();
      setTickets(user ? all.filter((t) => t.id_solicitante === user.id) : all);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const validar = async (t: Ticket) => {
    if (!confirm(`¿Aprobar la solución del ticket #${t.id}?`)) return;
    try { await api.validarTicket(t.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis tickets</h1>
          <p className="text-sm text-muted-foreground">Tickets que has creado.</p>
        </div>
        <Link
          to="/crear-ticket"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
        >
          + Crear ticket
        </Link>
      </div>

      {err && <ErrorBox message={err} />}
      {loading ? (
        <div className="rounded-xl border border-border bg-surface/60 p-12 text-center text-sm text-muted-foreground">
          Cargando tickets…
        </div>
      ) : (
        <TicketTable
          tickets={tickets}
          getActions={(t) =>
            (t.estado || "").toUpperCase() === "FINALIZADO"
              ? [{ kind: "validar", onClick: validar }]
              : []
          }
          empty="Aún no has creado tickets."
        />
      )}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
      <p className="mt-1 text-xs opacity-80">
        Verifica que tu backend esté en <code className="font-mono">http://localhost:8080/ITProject/it</code> y con CORS habilitado.
      </p>
    </div>
  );
}
