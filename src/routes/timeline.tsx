import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api, type LogEntry, type Archivo } from "@/lib/api";

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
  const search = Route.useSearch();
  const id = search.id || (typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("id")) || 0 : 0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);

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

      // Fetch archivos separately — silent failure
      try {
        if (alive) setLoadingArchivos(true);
        const files = await api.listArchivos(id);
        if (alive) setArchivos(Array.isArray(files) ? files : []);
      } catch {
        // silently ignore archivos errors
      } finally {
        if (alive) setLoadingArchivos(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const fileUrl = (nombre: string) => `http://localhost:8080/ITProject/it/tickets/archivo/${encodeURIComponent(nombre)}`;

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
          {logs.map((ev, i) => {
            const { text, cssVar } = accionColor(ev.accion);
            return (
              <li key={ev.id ?? i} className="relative">
                <span
                  className="absolute -left-[26px] top-1.5 grid h-3 w-3 place-items-center rounded-full ring-4 ring-background"
                  style={{ background: `var(${cssVar})` }}
                />
                <div className="rounded-xl border border-border bg-surface/60 p-4">
                  <p className={`text-sm font-bold ${text}`}>{ev.accion}</p>
                  {ev.descripcion && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{ev.descripcion}</p>
                  )}
                  {ev.archivo && (
                    <a
                      href={fileUrl(ev.archivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated/60 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-secondary"
                    >
                      📎 Descargar {ev.archivo}
                    </a>
                  )}
                  {ev.fecha && (
                    <time className="mt-2 block text-[11px] text-muted-foreground">{fmt(ev.fecha)}</time>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Archivos adjuntos */}
      {loadingArchivos ? (
        <div className="rounded-xl border border-border bg-surface/60 p-6 text-center text-sm text-muted-foreground">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary align-middle" />
          <span className="ml-2 align-middle">Cargando archivos…</span>
        </div>
      ) : archivos.length > 2 && (
        <section className="rounded-xl border border-border bg-surface/60 p-5">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Archivos adjuntos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {archivos.map((f) => (
              <div
                key={f.id}
                className="flex flex-col rounded-lg border border-border bg-surface-elevated/40 p-3"
              >
                {f.tipo.startsWith("image/") ? (
                  <a href={fileUrl(f.nombre_archivo)} target="_blank" rel="noreferrer">
                    <img
                      src={fileUrl(f.nombre_archivo)}
                      alt={f.nombre_archivo}
                      className="h-48 w-full rounded-md object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : f.tipo === "application/pdf" ? (
                  <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-border bg-surface-elevated/60">
                    <svg className="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" opacity="0.5"/>
                      <path d="M14 2v6h6"/>
                      <path d="M16 13h-8M16 17h-8M10 9H8h2z"/>
                    </svg>
                    <span className="mt-2 text-xs text-muted-foreground">PDF</span>
                  </div>
                ) : (
                  <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-border bg-surface-elevated/60">
                    <svg className="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 1 00-2 2v16a2 2 1 002 2h12a2 2 1 002-2V8l-6-6z" opacity="0.5"/>
                      <path d="M14 2v6h6M16 13h-8M16 17h-8M10 9H8h2z"/>
                    </svg>
                    <span className="mt-2 text-xs text-muted-foreground">Archivo</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground" title={f.nombre_archivo}>
                    {f.nombre_archivo}
                  </p>
                  {f.tipo.startsWith("image/") ? (
                    <a
                      href={fileUrl(f.nombre_archivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary"
                    >
                      Ver imagen
                    </a>
                  ) : f.tipo === "application/pdf" ? (
                    <a
                      href={fileUrl(f.nombre_archivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <a
                      href={fileUrl(f.nombre_archivo)}
                      download={f.nombre_archivo}
                      className="shrink-0 rounded-md border border-border bg-surface-elevated/60 px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary"
                    >
                      Descargar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function accionColor(accion: string): { text: string; cssVar: string } {
  const k = (accion || "").toUpperCase();
  if (k.includes("CREAD"))   return { text: "text-status-created",   cssVar: "--color-status-created" };
  if (k.includes("ASIGN"))   return { text: "text-status-assigned",  cssVar: "--color-status-assigned" };
  if (k.includes("RECHAZ"))  return { text: "text-status-rejected",  cssVar: "--color-status-rejected" };
  if (k.includes("FINALIZ")) return { text: "text-status-finished",  cssVar: "--color-status-finished" };
  if (k.includes("VALID"))   return { text: "text-status-validated", cssVar: "--color-status-validated" };
  if (k.includes("DEVUEL"))  return { text: "text-status-returned",  cssVar: "--color-status-returned" };
  return { text: "text-primary", cssVar: "--color-primary" };
}

function fmt(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
