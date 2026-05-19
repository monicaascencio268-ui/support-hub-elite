import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-store";
import type { Role } from "@/lib/ticket-types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Helpdesk IT" },
      { name: "description", content: "Acceso a la consola de tickets de soporte IT." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana.lopez@empresa.com");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("soporte");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setErr("Credenciales inválidas.");
      return;
    }
    login(email, role);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.14_200/0.25),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.6_0.18_280/0.2),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
              IT
            </div>
            <div>
              <div className="font-semibold tracking-tight">Helpdesk</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Support Console
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Gestión de tickets para
              <span className="block text-primary">soporte IT profesional.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Centraliza incidencias, asigna recursos y valida soluciones con
              un flujo claro: Creado → Asignado → Validación → Finalizado.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            {[
              ["120+", "Tickets / semana"],
              ["98%", "SLA cumplido"],
              ["<2h", "Primer respuesta"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg border border-border/60 bg-surface/40 p-3">
                <div className="text-lg font-semibold text-foreground">{n}</div>
                <div>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">
              Accede con tu cuenta corporativa.
            </p>
          </div>

          <div className="space-y-3">
            <Field label="Correo">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
                placeholder="tu@empresa.com"
                required
              />
            </Field>
            <Field label="Contraseña">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
                required
              />
            </Field>
            <Field label="Rol (demo)">
              <div className="grid grid-cols-2 gap-2">
                {(["soporte", "solicitante"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-md border px-3 py-2 text-xs font-medium capitalize transition ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {err && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {err}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            Entrar
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Demo — los datos se almacenan en memoria.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
