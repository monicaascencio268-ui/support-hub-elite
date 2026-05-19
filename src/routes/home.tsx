import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TicketTable } from "@/components/TicketTable";
import { api, type Role, type Ticket, type Usuario } from "@/lib/api";
import { getUsuario } from "@/lib/auth";
import { ErrorBox } from "./mis-tickets";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Administración — IT Support" }] }),
  component: () => (
    <Shell allow={["administrador"]}>
      <AdminHome />
    </Shell>
  ),
});

function AdminHome() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([api.listUsuarios(), api.listTickets()]);
      setUsuarios(u);
      setTickets(t);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error cargando datos");
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  // Acciones tickets
  const aceptar = async (t: Ticket) => {
    const u = getUsuario(); if (!u) return;
    try { await api.aceptarTicket(t.id, u.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  const finalizar = async (t: Ticket) => {
    try { await api.finalizarTicket(t.id); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  const rechazar = async (t: Ticket) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    try { await api.rechazarTicket(t.id, motivo); await reload(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Usuarios y todos los tickets del sistema.</p>
      </div>

      {err && <ErrorBox message={err} />}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <UsuariosTable usuarios={usuarios} onChanged={reload} />
        <NuevoUsuario onCreated={reload} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Todos los tickets</h2>
        <TicketTable
          tickets={tickets}
          getActions={(t) => {
            const e = (t.estado || "").toUpperCase();
            if (e === "CREADO" || e === "DEVUELTO")
              return [
                { kind: "aceptar", onClick: aceptar },
                { kind: "rechazar", onClick: rechazar },
              ];
            if (e === "ASIGNADO")
              return [
                { kind: "finalizar", onClick: finalizar },
                { kind: "rechazar", onClick: rechazar },
              ];
            return [];
          }}
        />
      </section>
    </div>
  );
}

function UsuariosTable({ usuarios, onChanged }: { usuarios: Usuario[]; onChanged: () => void }) {
  const del = async (u: Usuario) => {
    if (!confirm(`¿Eliminar al usuario ${u.nombre}?`)) return;
    try { await api.deleteUsuario(u.id); onChanged(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error"); }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
      <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Usuarios</div>
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
                  onClick={() => del(u)}
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

      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Nombre</span>
        <input required value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</span>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Contraseña</span>
        <input required type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Rol</span>
        <select value={rol} onChange={(e) => setRol(e.target.value as Role)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40">
          <option value="solicitante">solicitante</option>
          <option value="soporte">soporte</option>
          <option value="administrador">administrador</option>
        </select>
      </label>

      {err && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
      {ok && <p className="rounded-md border border-status-finished/40 bg-status-finished/10 px-3 py-2 text-xs text-status-finished">Usuario creado.</p>}

      <button type="submit" disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-60">
        {loading ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
