import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { PromptModal } from "@/components/PromptModal";
import { Spinner } from "@/components/Feedback";
import { Toast } from "@/components/Toast";
import { api, type Ticket } from "@/lib/api";
import { getUsuario } from "@/lib/auth";
import { ErrorBox } from "./mis-tickets";
import { actionsForSoporte } from "./bandeja-soporte";

export const Route = createFileRoute("/mis-tickets-soporte")({
  head: () => ({ meta: [{ title: "Mis tickets asignados — IT Support" }] }),
  component: () => (
    <Shell allow={["soporte"]}>
      <MisTicketsSoporte />
    </Shell>
  ),
});

function MisTicketsSoporte() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reject, setReject] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<{ msg: string; v: "success" | "error" } | null>(null);

  const reload = useCallback(async () => {
    const u = getUsuario();
    if (!u) return;
    setLoading(true);
    try {
      const data = await api.listTicketsByUsuario(u.id, "soporte");
      setTickets(Array.isArray(data) ? data : []);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando tickets");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const aceptar = async (t: Ticket) => {
    const u = getUsuario(); if (!u) return;
    try { await api.aceptarTicket(t.id, u.id); setToast({ msg: `Ticket #${t.id} aceptado`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };
  const enviarValidacion = async (t: Ticket) => {
    try { await api.finalizarTicket(t.id); setToast({ msg: `Ticket #${t.id} enviado a validación`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };
  const confirmReject = async (motivo: string) => {
    if (!reject) return;
    const id = reject.id; setReject(null);
    try { await api.rechazarTicket(id, motivo); setToast({ msg: `Ticket #${id} rechazado`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis tickets</h1>
          <p className="text-sm text-muted-foreground">Tickets asignados a ti.</p>
        </div>
        <Link
          to="/bandeja-soporte"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Ver todos los tickets
        </Link>
      </div>

      {err && <ErrorBox message={err} />}
      {loading ? (
        <Spinner />
      ) : (
        <TicketTable
          tickets={tickets}
          empty="No tienes tickets asignados."
          getActions={(t) => actionsForSoporte(t, { aceptar, reject: setReject, enviarValidacion })}
        />
      )}

      <PromptModal
        open={!!reject}
        title={`Rechazar ticket #${reject?.id ?? ""}`}
        description="Indica el motivo del rechazo para el solicitante."
        placeholder="Motivo del rechazo…"
        confirmLabel="Rechazar"
        variant="danger"
        onCancel={() => setReject(null)}
        onConfirm={confirmReject}
      />
      <Toast
        message={toast?.msg ?? null}
        variant={toast?.v ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
