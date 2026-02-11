import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notificacion } from "@/types/notificaciones";

export async function getNotificacionesByUser(
  supabase: SupabaseClient,
  userId: string,
  opts?: { limit?: number; soloNoLeidas?: boolean }
): Promise<Notificacion[]> {
  let query = supabase
    .from("notificaciones")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (opts?.soloNoLeidas) {
    query = query.eq("leida", false);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Notificacion[];
}

export async function marcarComoLeida(
  supabase: SupabaseClient,
  id: string
): Promise<Notificacion> {
  const { data, error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Notificacion;
}

export async function marcarTodasComoLeidas(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw error;
}

export function subscribeNotificaciones(
  supabase: SupabaseClient,
  userId: string,
  onNotificacion: (notificacion: Notificacion) => void
) {
  return supabase
    .channel(`notificaciones:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notificaciones",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as Notificacion;
        if (!row.deleted_at) onNotificacion(row);
      }
    )
    .subscribe();
}
