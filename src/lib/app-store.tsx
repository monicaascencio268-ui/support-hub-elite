import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role, Ticket, TicketStatus, User } from "./ticket-types";

interface AppState {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  tickets: Ticket[];
  getTicket: (id: string) => Ticket | undefined;
  createTicket: (input: {
    title: string;
    description: string;
    priority: Ticket["priority"];
    category: string;
    attachments: { name: string; size: number }[];
  }) => string;
  transition: (id: string, next: TicketStatus, note?: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const now = () => new Date().toISOString();

const seed: Ticket[] = [
  {
    id: "TCK-1042",
    title: "VPN no conecta desde casa",
    description: "El cliente VPN falla con timeout al autenticar.",
    priority: "Alta",
    category: "Redes",
    status: "ASIGNADO",
    createdBy: "ana@empresa.com",
    assignedTo: "soporte@empresa.com",
    createdAt: "2026-05-17T10:14:00Z",
    updatedAt: "2026-05-18T09:00:00Z",
    attachments: [{ name: "screenshot.png", size: 184320 }],
    timeline: [
      { id: "t1", at: "2026-05-17T10:14:00Z", actor: "ana@empresa.com", action: "Ticket creado" },
      { id: "t2", at: "2026-05-18T09:00:00Z", actor: "soporte@empresa.com", action: "Aceptado y asignado" },
    ],
  },
  {
    id: "TCK-1043",
    title: "Solicitud de instalación de Figma",
    description: "Necesito acceso a Figma Desktop en mi equipo.",
    priority: "Baja",
    category: "Software",
    status: "CREADO",
    createdBy: "luis@empresa.com",
    createdAt: "2026-05-18T08:31:00Z",
    updatedAt: "2026-05-18T08:31:00Z",
    attachments: [],
    timeline: [{ id: "t1", at: "2026-05-18T08:31:00Z", actor: "luis@empresa.com", action: "Ticket creado" }],
  },
  {
    id: "TCK-1041",
    title: "Pantalla externa no detectada",
    description: "Tras update, el segundo monitor no es reconocido.",
    priority: "Media",
    category: "Hardware",
    status: "VALIDACION",
    createdBy: "ana@empresa.com",
    assignedTo: "soporte@empresa.com",
    createdAt: "2026-05-15T14:00:00Z",
    updatedAt: "2026-05-18T11:20:00Z",
    attachments: [],
    timeline: [
      { id: "t1", at: "2026-05-15T14:00:00Z", actor: "ana@empresa.com", action: "Ticket creado" },
      { id: "t2", at: "2026-05-16T08:00:00Z", actor: "soporte@empresa.com", action: "Aceptado" },
      { id: "t3", at: "2026-05-18T11:20:00Z", actor: "soporte@empresa.com", action: "Enviado a validación", note: "Driver reinstalado, probar y confirmar." },
    ],
  },
  {
    id: "TCK-1040",
    title: "Reset de contraseña Office",
    description: "No recuerdo mi contraseña.",
    priority: "Media",
    category: "Cuentas",
    status: "FINALIZADO",
    createdBy: "luis@empresa.com",
    assignedTo: "soporte@empresa.com",
    createdAt: "2026-05-12T09:00:00Z",
    updatedAt: "2026-05-13T10:00:00Z",
    attachments: [],
    timeline: [
      { id: "t1", at: "2026-05-12T09:00:00Z", actor: "luis@empresa.com", action: "Ticket creado" },
      { id: "t2", at: "2026-05-12T10:00:00Z", actor: "soporte@empresa.com", action: "Aceptado" },
      { id: "t3", at: "2026-05-12T15:00:00Z", actor: "soporte@empresa.com", action: "Enviado a validación" },
      { id: "t4", at: "2026-05-13T10:00:00Z", actor: "luis@empresa.com", action: "Solución aprobada — Finalizado" },
    ],
  },
  {
    id: "TCK-1039",
    title: "Solicitud admin local",
    description: "Necesito permisos administrativos permanentes.",
    priority: "Alta",
    category: "Seguridad",
    status: "RECHAZADO",
    createdBy: "luis@empresa.com",
    assignedTo: "soporte@empresa.com",
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-05-10T11:00:00Z",
    attachments: [],
    timeline: [
      { id: "t1", at: "2026-05-10T09:00:00Z", actor: "luis@empresa.com", action: "Ticket creado" },
      { id: "t2", at: "2026-05-10T11:00:00Z", actor: "soporte@empresa.com", action: "Rechazado", note: "Política de seguridad no permite admin permanente." },
    ],
  },
  {
    id: "TCK-1038",
    title: "Outlook se cierra al abrir adjuntos",
    description: "Crash al abrir PDF adjuntos.",
    priority: "Alta",
    category: "Software",
    status: "DEVUELTO",
    createdBy: "ana@empresa.com",
    assignedTo: "soporte@empresa.com",
    createdAt: "2026-05-09T09:00:00Z",
    updatedAt: "2026-05-14T10:00:00Z",
    attachments: [],
    timeline: [
      { id: "t1", at: "2026-05-09T09:00:00Z", actor: "ana@empresa.com", action: "Ticket creado" },
      { id: "t2", at: "2026-05-10T11:00:00Z", actor: "soporte@empresa.com", action: "Enviado a validación" },
      { id: "t3", at: "2026-05-14T10:00:00Z", actor: "ana@empresa.com", action: "Devuelto", note: "Sigue ocurriendo con PDFs grandes." },
    ],
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(seed);

  const value = useMemo<AppState>(
    () => ({
      user,
      login: (email, role) =>
        setUser({ email, role, name: email.split("@")[0].replace(/\./g, " ") }),
      logout: () => setUser(null),
      tickets,
      getTicket: (id) => tickets.find((t) => t.id === id),
      createTicket: (input) => {
        const id = `TCK-${1044 + tickets.length}`;
        const t: Ticket = {
          id,
          ...input,
          status: "CREADO",
          createdBy: user?.email ?? "anon@empresa.com",
          createdAt: now(),
          updatedAt: now(),
          timeline: [
            { id: "t1", at: now(), actor: user?.email ?? "anon", action: "Ticket creado" },
          ],
        };
        setTickets((prev) => [t, ...prev]);
        return id;
      },
      transition: (id, next, note) =>
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: next,
                  updatedAt: now(),
                  assignedTo:
                    next === "ASIGNADO" ? user?.email ?? t.assignedTo : t.assignedTo,
                  timeline: [
                    ...t.timeline,
                    {
                      id: `t${t.timeline.length + 1}`,
                      at: now(),
                      actor: user?.email ?? "system",
                      action: labelFor(next),
                      note,
                    },
                  ],
                }
              : t,
          ),
        ),
    }),
    [user, tickets],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function labelFor(s: TicketStatus): string {
  switch (s) {
    case "ASIGNADO": return "Aceptado y asignado";
    case "VALIDACION": return "Enviado a validación";
    case "DEVUELTO": return "Devuelto al soporte";
    case "FINALIZADO": return "Solución aprobada — Finalizado";
    case "RECHAZADO": return "Rechazado";
    case "CREADO": return "Reabierto como creado";
  }
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
