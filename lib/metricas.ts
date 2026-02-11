import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventoSistema, ResumenMetricas } from "@/types/notificaciones";
import { tieneSuscripcionActiva } from "@/lib/suscripcion";

const EVENTOS = [
  "cita_creada_formulario",
  "cita_creada_chat",
  "suscripcion_activada",
  "cita_cancelada",
] as const;

export async function getEventosByProfesional(
  supabase: SupabaseClient,
  profesionalId: string,
  opts?: { limite?: number }
): Promise<EventoSistema[]> {
  let query = supabase
    .from("eventos_sistema")
    .select("*")
    .eq("profesional_id", profesionalId)
    .order("created_at", { ascending: false });

  if (opts?.limite) {
    query = query.limit(opts.limite);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as EventoSistema[];
}

/**
 * Obtiene el resumen de métricas para un profesional: conteos por tipo de evento
 * y si tiene suscripción activa.
 */
export async function getResumenMetricas(
  supabase: SupabaseClient,
  profesionalId: string
): Promise<ResumenMetricas> {
  const { data: eventos, error } = await supabase
    .from("eventos_sistema")
    .select("evento")
    .eq("profesional_id", profesionalId);

  if (error) throw error;

  const rows = (eventos ?? []) as { evento: (typeof EVENTOS)[number] }[];
  const citasFormulario = rows.filter((r) => r.evento === "cita_creada_formulario").length;
  const citasChat = rows.filter((r) => r.evento === "cita_creada_chat").length;
  const citasCanceladas = rows.filter((r) => r.evento === "cita_cancelada").length;
  const suscripcionesActivadas = rows.filter((r) => r.evento === "suscripcion_activada").length;

  const tieneSuscripcionActivaFlag = await tieneSuscripcionActiva(supabase, profesionalId);

  return {
    citasFormulario,
    citasChat,
    citasCanceladas,
    suscripcionesActivadas,
    tieneSuscripcionActiva: tieneSuscripcionActivaFlag,
  };
}
