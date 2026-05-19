import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";

export function AppShell() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!user) {
    if (path !== "/login") {
      // soft redirect
      queueMicrotask(() => navigate({ to: "/login" }));
    }
    return <Outlet />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              IT
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Helpdesk</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                IT Support Console
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" label="Tickets" />
            <NavLink to="/tickets/new" label="Nuevo ticket" />
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium capitalize">{user.name}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {user.role}
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold uppercase">
              {user.email[0]}
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
    >
      {label}
    </Link>
  );
}
