import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { clearUsuario, getUsuario, homeForRole } from "@/lib/auth";
import type { Role, Usuario } from "@/lib/api";
import { TicketIcon } from "@/routes/login";

interface Props {
  children: ReactNode;
  allow?: Role[];
}

const ROLE_BADGE: Record<string, string> = {
  solicitante: "bg-status-created/15 text-status-created",
  soporte: "bg-status-finished/15 text-status-finished",
  administrador: "bg-status-validation/15 text-status-validation",
};

export function Shell({ children, allow }: Props) {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getUsuario();
    if (!u) { navigate({ to: "/login" }); return; }
    if (allow && !allow.includes(u.rol)) { navigate({ to: homeForRole(u.rol) }); return; }
    setUser(u);
    setReady(true);
  }, [navigate, allow]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to={homeForRole(user.rol)} className="flex items-center gap-2.5">
            <TicketIcon className="h-8 w-8 rounded-lg bg-primary p-1.5 text-primary-foreground" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">IT Support</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ticket Console
              </div>
            </div>
          </Link>

          {user.rol === "soporte" && (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/mis-tickets-soporte"
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Mis Tickets
              </Link>
              <Link
                to="/bandeja-soporte"
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Bandeja General
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="text-right">
                <div className="text-sm font-medium leading-tight">{user.nombre}</div>
                <div className="text-[10px] text-muted-foreground">{user.email}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE[user.rol] ?? "bg-secondary text-foreground"}`}>
                {user.rol}
              </span>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold uppercase">
              {user.nombre?.[0] ?? "?"}
            </div>
            <button
              onClick={() => { clearUsuario(); navigate({ to: "/login" }); }}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
