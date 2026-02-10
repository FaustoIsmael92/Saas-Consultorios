import type { SupabaseClient } from "@supabase/supabase-js";

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
