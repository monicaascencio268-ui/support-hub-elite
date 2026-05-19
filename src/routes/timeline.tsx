import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api, type LogEntry } from "@/lib/api";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Timeline — IT Support" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ id: Number(s.id) || 0 }),
  component: () => (
    <Shell>
      <Timeline />
    </Shell>
  ),
});

function Timeline() {
  const { id } = Route.useSearch();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.ticketLogs(id);
        if (alive) setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Error cargando timeline");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Timeline · <span className="font-mono text-primary">#{id}</span>
          </h1>
          <p className="text-sm text-muted-foreground">Historial cronológico del ticket.</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          ← Regresar
        </button>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{err}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-surface/60 p-10 text-center text-sm text-muted-foreground">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary align-middle" />
          <span className="ml-3 align-middle">Cargando…</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/60 p-10 text-center text-sm text-muted-foreground">
          No hay registros para este ticket.
        </div>
      ) : (
        <ol className="relative space-y-5 border-l border-border/60 pl-5">
          {logs.map((ev, i) => (
            <li key={ev.id ?? i} className="relative">
              <span className="absolute -left-[26px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
              <div className="rounded-xl border border-border bg-surface/60 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{ev.accion}</p>
                  <time className="text-[11px] text-muted-foreground">{fmt(ev.fecha)}</time>
                </div>
                {ev.descripcion && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{ev.descripcion}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function fmt(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
