import type { SupabaseClient } from "@supabase/supabase-js";
import type { Disponibilidad, BloqueoAgenda } from "@/types/agenda";

interface DisponibilidadInsert {
  profesional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita_min?: number;
}

interface BloqueoInsert {
  profesional_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo?: string | null;
}

interface DisponibilidadUpdate {
  dia_semana?: number;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_cita_min?: number;
}

export async function getDisponibilidadByProfesional(
  supabase: SupabaseClient,
  profesionalId: string
): Promise<Disponibilidad[]> {
  const { data, error } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null)
    .order("dia_semana");

  if (error) throw error;
  return (data ?? []) as Disponibilidad[];
}

export async function createDisponibilidad(
  supabase: SupabaseClient,
  insert: DisponibilidadInsert
): Promise<Disponibilidad> {
  const { data, error } = await supabase
    .from("disponibilidad")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data as Disponibilidad;
}

export async function updateDisponibilidad(
  supabase: SupabaseClient,
  id: string,
  updates: DisponibilidadUpdate
): Promise<Disponibilidad> {
  const { data, error } = await supabase
    .from("disponibilidad")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Disponibilidad;
}

export async function deleteDisponibilidad(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("disponibilidad")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function getBloqueosByProfesional(
  supabase: SupabaseClient,
  profesionalId: string,
  desde?: string,
  hasta?: string
): Promise<BloqueoAgenda[]> {
  let query = supabase
    .from("bloqueos_agenda")
    .select("*")
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null);

  if (desde) query = query.gte("fecha_fin", desde);
  if (hasta) query = query.lte("fecha_inicio", hasta);

  const { data, error } = await query.order("fecha_inicio");
  if (error) throw error;
  return (data ?? []) as BloqueoAgenda[];
}

export async function createBloqueo(
  supabase: SupabaseClient,
  insert: BloqueoInsert
): Promise<BloqueoAgenda> {
  const { data, error } = await supabase
    .from("bloqueos_agenda")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data as BloqueoAgenda;
}

export async function deleteBloqueo(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("bloqueos_agenda")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
