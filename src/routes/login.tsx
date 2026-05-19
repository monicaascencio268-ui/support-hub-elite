import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { homeForRole, setUsuario } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — IT Support" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const usuario = await api.login(email, contrasena);
      if (!usuario || !usuario.rol) throw new Error("Respuesta inválida del servidor.");
      setUsuario(usuario);
      navigate({ to: homeForRole(usuario.rol) });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setErr("Credenciales incorrectas");
      else setErr(e instanceof Error ? e.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.14_200/0.25),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.6_0.18_280/0.2),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <TicketIcon className="h-10 w-10 rounded-xl bg-primary p-2 text-primary-foreground" />
            <div>
              <div className="font-semibold tracking-tight">IT Support</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Ticket Console</div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Gestión de tickets para
              <span className="block text-primary">soporte IT profesional.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Creado → Asignado → Validación → Finalizado. Un flujo claro para tu equipo.
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            API: <code className="font-mono">http://localhost:8080/ITProject/it</code>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">Accede con tu cuenta corporativa.</p>
          </div>

          <div className="space-y-3">
            <Field label="Correo">
              <input
                type="email" required value={email} autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                placeholder="tu@empresa.com"
              />
            </Field>
            <Field label="Contraseña">
              <input
                type="password" required value={contrasena} autoComplete="current-password"
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </Field>
          </div>

          {err && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Validando…" : "Entrar"}
          </button>
        </form>
      </div>
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

export function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M13 6v12" strokeDasharray="2 2" />
    </svg>
  );
}
