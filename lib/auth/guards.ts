import type { UserRole } from "@/types/auth";
import { isValidRole } from "./roles";

export const RUTAS_PUBLICAS = ["/", "/login", "/registro"] as const;
export const PREFIJO_PROFESIONAL = "/profesional";
export const PREFIJO_PACIENTE = "/paciente";

export function esRutaPublica(pathname: string): boolean {
  return RUTAS_PUBLICAS.some((r) => r === pathname || pathname.startsWith("/api/"));
}

export function esRutaProfesional(pathname: string): boolean {
  return pathname.startsWith(PREFIJO_PROFESIONAL);
}

export function esRutaPaciente(pathname: string): boolean {
  return pathname.startsWith(PREFIJO_PACIENTE);
}

export function rutaParaRol(role: UserRole): string {
  return role === "profesional"
    ? `${PREFIJO_PROFESIONAL}/dashboard`
    : `${PREFIJO_PACIENTE}/dashboard`;
}

export function puedeAccederARuta(role: UserRole | null, pathname: string): boolean {
  if (!role || !isValidRole(role)) return false;
  if (esRutaPublica(pathname)) return true;
  if (role === "profesional" && esRutaProfesional(pathname)) return true;
  if (role === "paciente" && esRutaPaciente(pathname)) return true;
  return false;
}
