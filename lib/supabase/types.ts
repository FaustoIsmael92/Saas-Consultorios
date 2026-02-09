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
    };
  };
}
