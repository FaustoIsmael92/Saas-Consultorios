import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SuscripcionRow = Database["public"]["Tables"]["suscripciones"]["Row"];

/**
 * Comprueba si el profesional tiene una suscripción activa (chat habilitado).
 * Fuente de verdad para bloquear o permitir el acceso al chat.
 */
export async function tieneSuscripcionActiva(
  supabase: SupabaseClient,
  profesionalId: string
): Promise<boolean> {
  const hoy = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("suscripciones")
    .select("id")
    .eq("profesional_id", profesionalId)
    .eq("estado", "activa")
    .is("deleted_at", null)
    .lte("fecha_inicio", hoy)
    .gte("fecha_fin", hoy)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Obtiene la suscripción del profesional (relación 1:1).
 * Usado en el panel del profesional para mostrar estado.
 */
export async function getSuscripcionByProfesional(
  supabase: SupabaseClient,
  profesionalId: string
): Promise<SuscripcionRow | null> {
  const { data, error } = await supabase
    .from("suscripciones")
    .select("*")
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as SuscripcionRow | null;
}
