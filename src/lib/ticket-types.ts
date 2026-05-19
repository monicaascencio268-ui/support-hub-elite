export type Role = "soporte" | "solicitante";

export type TicketStatus =
  | "CREADO"
  | "ASIGNADO"
  | "VALIDACION"
  | "DEVUELTO"
  | "FINALIZADO"
  | "RECHAZADO";

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface TicketAttachment {
  name: string;
  size: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  category: string;
  status: TicketStatus;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  timeline: TimelineEvent[];
}

export interface User {
  email: string;
  name: string;
  role: Role;
}
