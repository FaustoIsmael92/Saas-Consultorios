export type UserRole = "profesional" | "paciente";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profesional {
  id: string;
  user_id: string;
  nombre: string | null;
  especialidad: string | null;
  slug: string;
  telefono: string | null;
  activo: boolean;
  timezone?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Paciente {
  id: string;
  user_id: string;
  nombre: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
