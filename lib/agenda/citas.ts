import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cita, CitaConDetalles } from "@/types/agenda";

interface CitaInsert {
  profesional_id: string;
  paciente_id: string;
  inicio: string;
  fin: string;
  estado?: "programada" | "cancelada" | "completada";
  origen?: "formulario" | "chat";
}

export async function getCitasByProfesional(
  supabase: SupabaseClient,
  profesionalId: string,
  desde?: string,
  hasta?: string
): Promise<CitaConDetalles[]> {
  let query = supabase
    .from("citas")
    .select(
      `
      *,
      paciente:pacientes(nombre)
    `
    )
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null);

  if (desde) query = query.gte("inicio", desde);
  if (hasta) query = query.lte("fin", hasta);

  const { data, error } = await query.order("inicio");
  if (error) throw error;
  return (data ?? []) as CitaConDetalles[];
}

export async function getCitasByPaciente(
  supabase: SupabaseClient,
  pacienteId: string,
  desde?: string,
  hasta?: string
): Promise<CitaConDetalles[]> {
  let query = supabase
    .from("citas")
    .select(
      `
      *,
      profesional:profesionales(nombre, especialidad)
    `
    )
    .eq("paciente_id", pacienteId)
    .is("deleted_at", null);

  if (desde) query = query.gte("inicio", desde);
  if (hasta) query = query.lte("fin", hasta);

  const { data, error } = await query.order("inicio");
  if (error) throw error;
  return (data ?? []) as CitaConDetalles[];
}

export async function createCita(
  supabase: SupabaseClient,
  insert: CitaInsert
): Promise<Cita> {
  const { data, error } = await supabase
    .from("citas")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data as Cita;
}

export async function cancelarCita(
  supabase: SupabaseClient,
  id: string
): Promise<Cita> {
  const { data, error } = await supabase
    .from("citas")
    .update({ estado: "cancelada" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Cita;
}

export async function getCitaById(
  supabase: SupabaseClient,
  id: string
): Promise<CitaConDetalles | null> {
  const { data, error } = await supabase
    .from("citas")
    .select(
      `
      *,
      paciente:pacientes(nombre, telefono),
      profesional:profesionales(nombre, especialidad)
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as CitaConDetalles | null;
}
