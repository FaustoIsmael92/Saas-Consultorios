import type { SupabaseClient } from "@supabase/supabase-js";
import { getSlotsDisponibles } from "@/lib/agenda/slots";
import type { TimeSlot } from "@/types/agenda";
import { DEFAULT_TIMEZONE } from "@/lib/utils/dates";

/**
 * Datos mínimos del profesional expuestos en el enlace público (sin datos sensibles).
 */
export interface ProfesionalPublico {
  id: string;
  nombre: string | null;
  especialidad: string | null;
  slug: string;
  timezone: string | null;
}

/**
 * Resuelve un profesional por slug para el enlace público.
 * Solo devuelve datos permitidos para lectura pública (sin teléfono, user_id, etc.).
 */
export async function getProfesionalBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<ProfesionalPublico | null> {
  const { data, error } = await supabase
    .from("profesionales")
    .select("id, nombre, especialidad, slug, timezone")
    .eq("slug", slug)
    .eq("activo", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as ProfesionalPublico | null;
}

/**
 * Obtiene los slots disponibles para un profesional en una fecha.
 * Usable con cliente anónimo (RLS permite lectura para cálculo de slots).
 */
export async function getSlotsPublicos(
  supabase: SupabaseClient,
  profesionalId: string,
  fecha: string,
  timezone: string = DEFAULT_TIMEZONE
): Promise<TimeSlot[]> {
  return getSlotsDisponibles(supabase, profesionalId, fecha, timezone);
}
