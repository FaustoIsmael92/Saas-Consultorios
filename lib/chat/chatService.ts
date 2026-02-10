import type { SupabaseClient } from "@supabase/supabase-js";
import type { Chat, MensajeChat, ChatConDetalles } from "@/types/chat";
import type { TimeSlot } from "@/types/agenda";
import { getSlotsPublicos } from "@/lib/agenda/public";
import { createCita } from "@/lib/agenda/citas";
import { DEFAULT_TIMEZONE } from "@/lib/utils/dates";

type Emisor = "paciente" | "sistema" | "profesional";

/**
 * Obtiene o crea un chat entre el paciente y el profesional.
 */
export async function getOrCreateChat(
  supabase: SupabaseClient,
  profesionalId: string,
  pacienteId: string
): Promise<Chat> {
  const { data: existente, error: errSelect } = await supabase
    .from("chats")
    .select("*")
    .eq("profesional_id", profesionalId)
    .eq("paciente_id", pacienteId)
    .is("deleted_at", null)
    .maybeSingle();

  if (errSelect) throw errSelect;
  if (existente) return existente as Chat;

  const { data: nuevo, error: errInsert } = await supabase
    .from("chats")
    .insert({
      profesional_id: profesionalId,
      paciente_id: pacienteId,
      activo: true,
    })
    .select()
    .single();

  if (errInsert) throw errInsert;
  return nuevo as Chat;
}

/**
 * Lista los mensajes de un chat (ordenados por fecha).
 */
export async function getMensajes(
  supabase: SupabaseClient,
  chatId: string
): Promise<MensajeChat[]> {
  const { data, error } = await supabase
    .from("mensajes_chat")
    .select("*")
    .eq("chat_id", chatId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MensajeChat[];
}

/**
 * Envía un mensaje en el chat (paciente, sistema o profesional).
 */
export async function enviarMensaje(
  supabase: SupabaseClient,
  chatId: string,
  emisor: Emisor,
  mensaje: string
): Promise<MensajeChat> {
  const { data, error } = await supabase
    .from("mensajes_chat")
    .insert({ chat_id: chatId, emisor, mensaje })
    .select()
    .single();

  if (error) throw error;
  return data as MensajeChat;
}

/**
 * Suscripción en tiempo real a mensajes de un chat.
 */
export function subscribeMensajes(
  supabase: SupabaseClient,
  chatId: string,
  onMensaje: (mensaje: MensajeChat) => void
) {
  return supabase
    .channel(`mensajes:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mensajes_chat",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        const row = payload.new as MensajeChat;
        if (!row.deleted_at) onMensaje(row);
      }
    )
    .subscribe();
}

/**
 * Obtiene slots disponibles para un profesional en una fecha (para sugerir en el chat).
 */
export async function getSlotsParaChat(
  supabase: SupabaseClient,
  profesionalId: string,
  fecha: string,
  timezone: string = DEFAULT_TIMEZONE
): Promise<TimeSlot[]> {
  return getSlotsPublicos(supabase, profesionalId, fecha, timezone);
}

/**
 * Crea una cita desde el chat (origen: chat).
 */
export async function crearCitaDesdeChat(
  supabase: SupabaseClient,
  params: {
    profesional_id: string;
    paciente_id: string;
    inicio: string;
    fin: string;
  }
) {
  return createCita(supabase, {
    ...params,
    origen: "chat",
  });
}

/**
 * Lista chats del profesional con datos de paciente.
 */
export async function getChatsByProfesional(
  supabase: SupabaseClient,
  profesionalId: string
): Promise<ChatConDetalles[]> {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      paciente:pacientes(nombre)
    `
    )
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChatConDetalles[];
}

/**
 * Lista chats del paciente con datos del profesional.
 */
export async function getChatsByPaciente(
  supabase: SupabaseClient,
  pacienteId: string
): Promise<ChatConDetalles[]> {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      profesional:profesionales(nombre, especialidad)
    `
    )
    .eq("paciente_id", pacienteId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChatConDetalles[];
}

/**
 * Obtiene un chat por ID con detalles.
 */
export async function getChatById(
  supabase: SupabaseClient,
  chatId: string
): Promise<ChatConDetalles | null> {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      profesional:profesionales(nombre, especialidad, timezone),
      paciente:pacientes(nombre)
    `
    )
    .eq("id", chatId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data as ChatConDetalles | null;
}
