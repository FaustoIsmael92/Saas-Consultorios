export type EstadoCita = "programada" | "cancelada" | "completada";
export type OrigenCita = "formulario" | "chat";

export interface Disponibilidad {
  id: string;
  profesional_id: string;
  dia_semana: number; // 0=lunes, 6=domingo
  hora_inicio: string; // "09:00"
  hora_fin: string; // "17:00"
  duracion_cita_min: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BloqueoAgenda {
  id: string;
  profesional_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Cita {
  id: string;
  profesional_id: string;
  paciente_id: string;
  inicio: string;
  fin: string;
  estado: EstadoCita;
  origen: OrigenCita;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CitaConDetalles extends Cita {
  paciente?: { nombre: string | null } | null;
  profesional?: { nombre: string | null } | null;
}

export interface TimeSlot {
  inicio: string; // ISO string
  fin: string; // ISO string
}

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;
