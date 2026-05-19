import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { PromptModal } from "@/components/PromptModal";
import { Spinner } from "@/components/Feedback";
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
  const [reject, setReject] = useState<Ticket | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const user = getUsuario();
      if (!user) return;
      const data = await api.listTicketsByUsuario(user.id, user.rol);
      setTickets(Array.isArray(data) ? data : []);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando tickets");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const aprobar = async (t: Ticket) => {
    try { await api.validarTicket(t.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  const confirmReject = async (motivo: string) => {
    if (!reject) return;
    const id = reject.id;
    setReject(null);
    try { await api.rechazarTicket(id, motivo); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis tickets</h1>
          <p className="text-sm text-muted-foreground">Tus solicitudes y su estado actual.</p>
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
        <Spinner />
      ) : (
        <TicketTable
          tickets={tickets}
          getActions={(t) =>
            (t.estado || "").toUpperCase() === "VALIDACION"
              ? [
                  { kind: "aprobar", onClick: aprobar },
                  { kind: "rechazar", onClick: (tk) => setReject(tk) },
                ]
              : []
          }
          empty="Aún no has creado tickets."
        />
      )}

      <PromptModal
        open={!!reject}
        title={`Rechazar ticket #${reject?.id ?? ""}`}
        description="La solución no resolvió tu incidencia. Cuéntale al soporte qué sigue pasando."
        placeholder="Describe el motivo del rechazo…"
        confirmLabel="Rechazar"
        variant="danger"
        onCancel={() => setReject(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
      <p className="mt-1 text-xs opacity-80">
        Verifica que tu backend esté disponible en <code className="font-mono">http://localhost:8080/ITProject/it</code> con CORS habilitado.
      </p>
    </div>
  );
}
