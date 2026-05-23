import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { PromptModal } from "@/components/PromptModal";
import { Spinner, EmptyState } from "@/components/Feedback";
import { Toast } from "@/components/Toast";
import { api, ApiError, type Role, type Ticket, type Usuario } from "@/lib/api";
import { getUsuario } from "@/lib/auth";
import { ErrorBox } from "./mis-tickets";
import { actionsForSoporte } from "./bandeja-soporte";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administración — IT Support" }] }),
  component: () => (
    <Shell allow={["administrador"]}>
      <AdminPanel />
    </Shell>
  ),
});

function AdminPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reject, setReject] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<{ msg: string; v: "success" | "error" } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t] = await Promise.all([api.listUsuarios(), api.listTickets()]);
      setUsuarios(Array.isArray(u) ? u : []);
      setTickets(Array.isArray(t) ? t : []);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando datos");
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
    if (!reject) return; const id = reject.id; setReject(null);
    try { await api.rechazarTicket(id, motivo); setToast({ msg: `Ticket #${id} rechazado`, v: "success" }); await reload(); }
    catch (e) { setToast({ msg: e instanceof Error ? e.message : "Error", v: "error" }); }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Gestiona usuarios y supervisa todos los tickets del sistema.</p>
      </div>

      {err && <ErrorBox message={err} />}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {loading ? <Spinner /> : <UsuariosTable usuarios={usuarios} onChanged={reload} />}
        <NuevoUsuario onCreated={reload} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Todos los tickets</h2>
        {loading ? (
          <Spinner />
        ) : tickets.length === 0 ? (
          <EmptyState message="No hay tickets registrados." />
        ) : (
          <TicketTable
            tickets={tickets}
            getActions={(t) => actionsForSoporte(t, { aceptar, reject: setReject, enviarValidacion })}
          />
        )}
      </section>

      <PromptModal
        open={!!reject}
        title={`Rechazar ticket #${reject?.id ?? ""}`}
        description="Indica el motivo del rechazo."
        placeholder="Motivo…"
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

function UsuariosTable({ usuarios, onChanged }: { usuarios: Usuario[]; onChanged: () => void }) {
  const [confirmU, setConfirmU] = useState<Usuario | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);

  const doDelete = async (u: Usuario) => {
    setConfirmU(null);
    setDelErr(null);
    try {
      await api.deleteUsuario(u.id);
      onChanged();
    } catch (e) {
      if (e instanceof ApiError || e instanceof Error) {
        setDelErr("No se puede eliminar: el usuario tiene tickets asociados.");
      } else {
        setDelErr("Error eliminando usuario.");
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
      <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Usuarios</div>
      {delErr && <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">{delErr}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-border/60 hover:bg-surface-elevated/50">
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">#{u.id}</td>
                <td className="px-4 py-2.5">{u.nombre}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] uppercase tracking-wide">{u.rol}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setConfirmU(u)}
                    className="rounded-md bg-status-rejected/15 px-2.5 py-1 text-[11px] font-semibold text-status-rejected hover:bg-status-rejected/25"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">Sin usuarios.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <PromptModal
        open={!!confirmU}
        title={`Eliminar a ${confirmU?.nombre ?? ""}`}
        description={`Esta acción no puede deshacerse. Escribe "ELIMINAR" para confirmar.`}
        placeholder="ELIMINAR"
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setConfirmU(null)}
        onConfirm={(v) => { if (confirmU && v.trim().toUpperCase() === "ELIMINAR") void doDelete(confirmU); }}
      />
    </div>
  );
}

function NuevoUsuario({ onCreated }: { onCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState<Role>("solicitante");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(false); setLoading(true);
    try {
      await api.createUsuario({ nombre, email, contrasena, rol });
      setOk(true);
      setNombre(""); setEmail(""); setContrasena(""); setRol("solicitante");
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-surface/60 p-5">
      <div className="text-sm font-semibold">Crear usuario</div>

      <Field label="Nombre">
        <input required value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </Field>
      <Field label="Email">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </Field>
      <Field label="Contraseña">
        <input required type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </Field>
      <Field label="Rol">
        <select value={rol} onChange={(e) => setRol(e.target.value as Role)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40">
          <option value="solicitante">solicitante</option>
          <option value="soporte">soporte</option>
          <option value="administrador">administrador</option>
        </select>
      </Field>

      {err && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
      {ok && <p className="rounded-md border border-status-finished/40 bg-status-finished/10 px-3 py-2 text-xs text-status-finished">Usuario creado.</p>}

      <button type="submit" disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-60">
        {loading ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
