export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: "profesional" | "paciente";
          full_name: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "profesional" | "paciente";
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "profesional" | "paciente";
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      profesionales: {
        Row: {
          id: string;
          user_id: string;
          nombre: string | null;
          especialidad: string | null;
          slug: string;
          telefono: string | null;
          activo: boolean;
          timezone: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          nombre?: string | null;
          especialidad?: string | null;
          slug: string;
          telefono?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          nombre?: string | null;
          especialidad?: string | null;
          slug?: string;
          telefono?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      pacientes: {
        Row: {
          id: string;
          user_id: string;
          nombre: string | null;
          telefono: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          nombre?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          nombre?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      disponibilidad: {
        Row: {
          id: string;
          profesional_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fin: string;
          duracion_cita_min: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profesional_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fin: string;
          duracion_cita_min?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profesional_id?: string;
          dia_semana?: number;
          hora_inicio?: string;
          hora_fin?: string;
          duracion_cita_min?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      bloqueos_agenda: {
        Row: {
          id: string;
          profesional_id: string;
          fecha_inicio: string;
          fecha_fin: string;
          motivo: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profesional_id: string;
          fecha_inicio: string;
          fecha_fin: string;
          motivo?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profesional_id?: string;
          fecha_inicio?: string;
          fecha_fin?: string;
          motivo?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      citas: {
        Row: {
          id: string;
          profesional_id: string;
          paciente_id: string;
          inicio: string;
          fin: string;
          estado: "programada" | "cancelada" | "completada";
          origen: "formulario" | "chat";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          profesional_id: string;
          paciente_id: string;
          inicio: string;
          fin: string;
          estado?: "programada" | "cancelada" | "completada";
          origen?: "formulario" | "chat";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          profesional_id?: string;
          paciente_id?: string;
          inicio?: string;
          fin?: string;
          estado?: "programada" | "cancelada" | "completada";
          origen?: "formulario" | "chat";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
  };
}
