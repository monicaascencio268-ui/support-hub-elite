import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { ApiError, api } from "@/lib/api";
import { getUsuario } from "@/lib/auth";

export const Route = createFileRoute("/crear-ticket")({
  head: () => ({ meta: [{ title: "Crear ticket — IT Support" }] }),
  component: () => (
    <Shell allow={["solicitante"]}>
      <CrearTicket />
    </Shell>
  ),
});

function CrearTicket() {
  const navigate = useNavigate();
  const [correlativo, setCorrelativo] = useState("");
  const [detalles, setDetalles] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUsuario();
    if (!user) return;
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const t = await api.createTicket({ correlativo, detalles, id_solicitante: user.id, foto });
      setOk(`Ticket creado con ID #${t?.id ?? ""}. Redirigiendo…`);
      setTimeout(() => navigate({ to: "/mis-tickets" }), 900);
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) setErr(e.message || "Datos inválidos. Revisa los campos.");
      else setErr(e instanceof Error ? e.message : "No se pudo crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo ticket</h1>
          <p className="text-sm text-muted-foreground">Describe la incidencia con la mayor claridad posible.</p>
        </div>
        <Link to="/mis-tickets" className="text-xs text-muted-foreground hover:text-foreground">← Volver</Link>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-surface/60 p-6">
        <Field label="Correlativo">
          <input
            required value={correlativo}
            onChange={(e) => setCorrelativo(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            placeholder="Ej: INC-2026-001"
          />
        </Field>
        <Field label="Detalles">
          <textarea
            required value={detalles} rows={6}
            onChange={(e) => setDetalles(e.target.value)}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            placeholder="Describe el problema, pasos para reproducirlo y comportamiento esperado."
          />
        </Field>
        <Field label="Adjuntar archivo (opcional)">
          <input
            type="file"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:brightness-110"
          />
          {foto && <p className="mt-1 text-[11px] text-muted-foreground">Seleccionado: {foto.name}</p>}
        </Field>

        {err && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>
        )}
        {ok && (
          <p className="rounded-md border border-status-finished/40 bg-status-finished/10 px-3 py-2 text-xs text-status-finished">{ok}</p>
        )}

        <div className="flex justify-end gap-2">
          <Link to="/mis-tickets" className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancelar
          </Link>
          <button
            type="submit" disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Creando…" : "Crear ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
