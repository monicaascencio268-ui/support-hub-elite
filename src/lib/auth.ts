import type { Usuario } from "./api";

const KEY = "usuario";

export function getUsuario(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function setUsuario(u: Usuario) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUsuario() {
  localStorage.removeItem(KEY);
}

export function homeForRole(rol: string): string {
  if (rol === "soporte") return "/bandeja-soporte";
  if (rol === "administrador") return "/admin";
  return "/mis-tickets";
}
