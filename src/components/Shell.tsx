import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { clearUsuario, getUsuario, homeForRole } from "@/lib/auth";
import type { Role, Usuario } from "@/lib/api";

interface Props {
  children: ReactNode;
  /** Si se define, redirige al login (o a home) cuando el rol no coincide */
  allow?: Role[];
}

export function Shell({ children, allow }: Props) {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getUsuario();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    if (allow && !allow.includes(u.rol)) {
      navigate({ to: homeForRole(u.rol) });
      return;
    }
    setUser(u);
    setReady(true);
  }, [navigate, allow]);

  if (!ready || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to={homeForRole(user.rol)} className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">IT</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">IT Support</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ticket Console
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{user.nombre}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {user.rol}
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold uppercase">
              {user.nombre?.[0] ?? "?"}
            </div>
            <button
              onClick={() => {
                clearUsuario();
                navigate({ to: "/login" });
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
