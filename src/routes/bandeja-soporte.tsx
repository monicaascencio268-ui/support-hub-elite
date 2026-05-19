import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { PromptModal } from "@/components/PromptModal";
import { Spinner } from "@/components/Feedback";
import { Toast } from "@/components/Toast";
import { api, type Ticket } from "@/lib/api";
import { getUsuario } from "@/lib/auth";
import { ErrorBox } from "./mis-tickets";

const ESTADOS = ["TODOS", "CREADO", "ASIGNADO", "VALIDACION", "DEVUELTO", "FINALIZADO", "RECHAZADO", "VALIDADO"];

export const Route = createFileRoute("/bandeja-soporte")({
  head: () => ({ meta: [{ title: "Bandeja de soporte — IT Support" }] }),
  component: () => (
    <Shell allow={["soporte"]}>
      <Bandeja />
    </Shell>
  ),
});

function Bandeja() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("TODOS");
  const [reject, setReject] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<{ msg: string; v: "success" | "error" } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTickets();
      setTickets(Array.isArray(data) ? data : []);
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
    const u = getUsuario(); if (!u) return;
    try { await api.aceptarTicket(t.id, u.id); setToast({ msg: `Ticket #${t.id} aceptado`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };
  const enviarValidacion = async (t: Ticket) => {
    try { await api.finalizarTicket(t.id); setToast({ msg: `Ticket #${t.id} enviado a validación`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODOS: tickets.length };
    for (const t of tickets) {
      const k = (t.estado || "").toUpperCase();
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [tickets]);

  const confirmReject = async (motivo: string) => {
    if (!reject) return;
    const id = reject.id; setReject(null);
    try { await api.rechazarTicket(id, motivo); setToast({ msg: `Ticket #${id} rechazado`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };

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
        <Spinner />
      ) : (
        <TicketTable
          tickets={visible}
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

import type { Action } from "@/components/TicketTable";

export function actionsForSoporte(
  t: Ticket,
  h: {
    aceptar: (t: Ticket) => void;
    reject: (t: Ticket) => void;
    enviarValidacion: (t: Ticket) => void;
  },
): Action[] {
  const e = (t.estado || "").toUpperCase();
  if (e === "CREADO")
    return [
      { kind: "aceptar", onClick: h.aceptar },
      { kind: "rechazar", onClick: h.reject },
    ];
  if (e === "ASIGNADO" || e === "DEVUELTO")
    return [{ kind: "validacion", onClick: h.enviarValidacion }];
  return [];
}
