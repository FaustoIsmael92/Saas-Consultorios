import type { UserRole } from "@/types/auth";

export const ROLES = {
  profesional: "profesional",
  paciente: "paciente",
} as const satisfies Record<string, UserRole>;

export function isProfesional(role: UserRole | null): role is "profesional" {
  return role === ROLES.profesional;
}

export function isPaciente(role: UserRole | null): role is "paciente" {
  return role === ROLES.paciente;
}

export function isValidRole(value: string): value is UserRole {
  return value === ROLES.profesional || value === ROLES.paciente;
}
