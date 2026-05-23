export const API_BASE =
  (typeof window !== "undefined" && (window as any).__API_BASE__) ||
  "http://localhost:8080/ITProject/it";

export type Role = "solicitante" | "soporte" | "administrador";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
}

export interface Ticket {
  id: number;
  correlativo: string;
  detalles: string;
  estado: string;
  id_solicitante?: number;
  id_soporte?: number;
  fecha_creacion?: string;
}

export interface LogEntry {
  id?: number;
  accion: string;
  descripcion: string;
  fecha: string;
  archivo?: string | null;
}

export interface Archivo {
  id: number;
  id_ticket: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || `${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return (await res.text()) as unknown as T;
}

export const api = {
  // Auth
  login: (email: string, contrasena: string) =>
    request<Usuario>("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ email, contrasena }),
    }),

  // Usuarios
  listUsuarios: () => request<Usuario[]>("/usuarios"),
  createUsuario: (u: { nombre: string; email: string; contrasena: string; rol: Role }) =>
    request<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(u) }),
  deleteUsuario: (id: number) =>
    request<unknown>(`/usuarios/${id}`, { method: "DELETE" }),

  // Tickets
  listTickets: () => request<Ticket[]>("/tickets"),
  listTicketsByUsuario: (id: number, rol: string) =>
    request<Ticket[]>(`/tickets/usuario/${id}/${rol}`),
  createTicket: async (t: { correlativo: string; detalles: string; id_solicitante: number; foto?: File | null }) => {
    const fd = new FormData();
    fd.append("correlativo", t.correlativo);
    fd.append("detalles", t.detalles);
    fd.append("id_solicitante", String(t.id_solicitante));
    if (t.foto) fd.append("foto", t.foto);
    const res = await fetch(`${API_BASE}/tickets`, { method: "POST", body: fd });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(res.status, text || `${res.status} ${res.statusText}`);
    }
    const ct = res.headers.get("content-type") || "";
    return (ct.includes("application/json") ? await res.json() : await res.text()) as Ticket;
  },
  aceptarTicket: (id: number, soporteId: number) =>
    request<unknown>(`/tickets/${id}/aceptar/${soporteId}`, { method: "PUT" }),
  finalizarTicket: (id: number) =>
    request<unknown>(`/tickets/${id}/finalizar`, { method: "PUT" }),
  rechazarTicket: (id: number, motivo: string) =>
    request<unknown>(`/tickets/${id}/rechazar`, {
      method: "PUT",
      body: JSON.stringify({ motivo }),
    }),
  validarTicket: (id: number) =>
    request<unknown>(`/tickets/${id}/validar`, { method: "PUT" }),

  // Logs
  ticketLogs: (id: number) => request<LogEntry[]>(`/logs/ticket/${id}`),

  // Archivos
  listArchivos: (idTicket: number) =>
    request<Archivo[]>(`/archivos/ticket/${idTicket}`),
};
