import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-store";
import { StatusBadge } from "@/components/StatusBadge";
import type { TicketStatus } from "@/lib/ticket-types";

export const Route = createFileRoute("/_app/tickets/$id")({
  head: () => ({ meta: [{ title: "Detalle de ticket — Helpdesk IT" }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { getTicket, transition, user } = useApp();
  const navigate = useNavigate();
  const t = getTicket(id);
  const [note, setNote] = useState("");

  if (!t) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-12 text-center">
        <p className="text-sm text-muted-foreground">Ticket no encontrado.</p>
        <Link to="/dashboard" className="mt-3 inline-block text-sm text-primary">
          ← Volver al dashboard
        </Link>
      </div>
    );
  }

  const role = user!.role;
  const actions = getActions(t.status, role);

  const doAction = (next: TicketStatus, needsNote = false) => {
    if (needsNote && !note.trim()) {
      alert("Añade una nota explicando el motivo.");
      return;
    }
    transition(t.id, next, note.trim() || undefined);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
        ← Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{t.id}</div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t.title}</h1>
              </div>
              <StatusBadge status={t.status} size="md" />
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {t.description}
            </p>

            {t.attachments.length > 0 && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Adjuntos
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {t.attachments.map((a) => (
                    <li
                      key={a.name}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <span className="truncate">📎 {a.name}</span>
                      <span className="text-muted-foreground">
                        {(a.size / 1024).toFixed(1)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border bg-surface/60 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Timeline
            </h2>
            <ol className="relative space-y-5 border-l border-border/60 pl-5">
              {t.timeline.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[26px] top-1 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{ev.action}</p>
                    <time className="text-[11px] text-muted-foreground">{fmt(ev.at)}</time>
                  </div>
                  <p className="text-xs text-muted-foreground">{ev.actor}</p>
                  {ev.note && (
                    <p className="mt-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground/80">
                      {ev.note}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-surface/60 p-5 text-sm">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Detalles
            </h3>
            <dl className="space-y-2.5">
              <Row k="Categoría" v={t.category} />
              <Row k="Prioridad" v={t.priority} />
              <Row k="Solicitante" v={t.createdBy} />
              <Row k="Asignado a" v={t.assignedTo ?? "—"} />
              <Row k="Creado" v={fmt(t.createdAt)} />
              <Row k="Actualizado" v={fmt(t.updatedAt)} />
            </dl>
          </div>

          {actions.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface/60 p-5">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Acciones · {role}
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Nota (obligatoria para rechazar/devolver)"
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              <div className="mt-3 grid gap-2">
                {actions.map((a) => (
                  <button
                    key={a.next}
                    onClick={() => doAction(a.next, a.needsNote)}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${a.cls}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface/60 p-5 text-xs text-muted-foreground">
              No hay acciones disponibles para tu rol en este estado.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

type Action = { next: TicketStatus; label: string; cls: string; needsNote?: boolean };

function getActions(status: TicketStatus, role: "soporte" | "solicitante"): Action[] {
  const primary = "bg-primary text-primary-foreground hover:brightness-110";
  const good = "bg-status-finished/20 text-status-finished hover:bg-status-finished/30";
  const warn = "bg-status-returned/20 text-status-returned hover:bg-status-returned/30";
  const danger = "bg-status-rejected/20 text-status-rejected hover:bg-status-rejected/30";

  if (role === "soporte") {
    if (status === "CREADO")
      return [
        { next: "ASIGNADO", label: "Aceptar y asignarme", cls: primary },
        { next: "RECHAZADO", label: "Rechazar", cls: danger, needsNote: true },
      ];
    if (status === "ASIGNADO" || status === "DEVUELTO")
      return [
        { next: "VALIDACION", label: "Enviar a validación", cls: primary },
        { next: "RECHAZADO", label: "Rechazar", cls: danger, needsNote: true },
      ];
  } else {
    if (status === "VALIDACION")
      return [
        { next: "FINALIZADO", label: "Aprobar solución", cls: good },
        { next: "DEVUELTO", label: "Rechazar / devolver", cls: warn, needsNote: true },
      ];
  }
  return [];
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}
