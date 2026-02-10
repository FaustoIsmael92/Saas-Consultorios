import type { UserRole } from "@/types/auth";
import { isValidRole } from "./roles";

export const RUTAS_PUBLICAS = ["/", "/login", "/registro"] as const;
export const PREFIJO_PROFESIONAL = "/profesional";
export const PREFIJO_PACIENTE = "/paciente";

/** Slugs reservados (no son enlaces de profesional). Exportado para la página [slug]. */
export const SLUGS_RESERVADOS = [
  "login",
  "registro",
  "logout",
  "profesional",
  "paciente",
  "api",
  "_next",
] as const;

const SEGMENTOS_RESERVADOS = new Set<string>(SLUGS_RESERVADOS);

/**
 * True si el pathname es un único segmento (ej. /dr-juan-perez).
 * Usado para el enlace público del profesional (hito 3).
 * No incluye / ni rutas con más de un segmento.
 */
export function esRutaEnlacePublico(pathname: string): boolean {
  const match = pathname.match(/^\/([^/]+)$/);
  if (!match) return false;
  const segment = match[1];
  return segment.length > 0 && !SEGMENTOS_RESERVADOS.has(segment);
}

export function esRutaPublica(pathname: string): boolean {
  if (RUTAS_PUBLICAS.some((r) => r === pathname || pathname.startsWith("/api/")))
    return true;
  // Enlace público del profesional: /[slug]
  return esRutaEnlacePublico(pathname);
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
