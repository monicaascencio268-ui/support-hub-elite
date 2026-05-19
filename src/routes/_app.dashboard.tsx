import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-store";
import { STATUS_LIST, StatusBadge } from "@/components/StatusBadge";
import type { TicketStatus } from "@/lib/ticket-types";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Helpdesk IT" },
      { name: "description", content: "Lista filtrable de tickets de soporte." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { tickets, user } = useApp();
  const [filter, setFilter] = useState<TicketStatus | "TODOS">("TODOS");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    return tickets.filter((t) => {
      if (filter !== "TODOS" && t.status !== filter) return false;
      if (q && !`${t.id} ${t.title} ${t.createdBy}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [tickets, filter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODOS: tickets.length };
    STATUS_LIST.forEach((s) => (c[s] = tickets.filter((t) => t.status === s).length));
    return c;
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Hola, <span className="capitalize text-foreground">{user?.name}</span> — aquí está
            la cola actual.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
        >
          + Nuevo ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={filter === "TODOS"} onClick={() => setFilter("TODOS")}>
          Todos <span className="ml-1.5 text-muted-foreground">{counts.TODOS}</span>
        </FilterPill>
        {STATUS_LIST.map((s) => (
          <FilterPill key={s} active={filter === s} onClick={() => setFilter(s)}>
            <StatusBadge status={s} />
            <span className="ml-1 text-muted-foreground">{counts[s]}</span>
          </FilterPill>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por ID, título, solicitante…"
          className="ml-auto w-full max-w-xs rounded-md border border-input bg-surface px-3 py-1.5 text-sm outline-none ring-ring/40 focus:border-primary focus:ring-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Solicitante</th>
              <th className="px-4 py-3 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr
                key={t.id}
                className="border-t border-border/60 transition hover:bg-surface-elevated/50"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                <td className="px-4 py-3">
                  <Link
                    to="/tickets/$id"
                    params={{ id: t.id }}
                    className="font-medium hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{t.category}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><PriorityChip p={t.priority} /></td>
                <td className="px-4 py-3 text-muted-foreground">{t.createdBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(t.updatedAt)}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No hay tickets con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PriorityChip({ p }: { p: string }) {
  const map: Record<string, string> = {
    Baja: "bg-muted text-muted-foreground",
    Media: "bg-status-created/15 text-status-created",
    Alta: "bg-status-returned/15 text-status-returned",
    Crítica: "bg-status-rejected/20 text-status-rejected",
  };
  return <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${map[p]}`}>{p}</span>;
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" }) +
    " · " + d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}
