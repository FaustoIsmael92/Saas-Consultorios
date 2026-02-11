"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getNotificacionesByUser,
  marcarComoLeida,
  marcarTodasComoLeidas,
  subscribeNotificaciones,
} from "@/lib/notificaciones";
import type { Notificacion } from "@/types/notificaciones";

const DEFAULT_LIMIT = 50;

export function useNotificaciones(userId: string | undefined, limit: number = DEFAULT_LIMIT) {
  const supabase = useMemo(() => createClient(), []);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await getNotificacionesByUser(supabase, userId, { limit });
      setNotificaciones(list);
    } catch (err) {
      console.error("[useNotificaciones] Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!userId) return;
    const sub = subscribeNotificaciones(supabase, userId, () => {
      refetch();
    });
    return () => {
      sub.unsubscribe();
    };
  }, [userId, supabase, refetch]);

  const marcarLeida = useCallback(
    async (id: string) => {
      try {
        await marcarComoLeida(supabase, id);
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
      } catch (err) {
        console.error("[useNotificaciones] Error al marcar notificación como leída:", err);
        refetch();
      }
    },
    [supabase, refetch]
  );

  const marcarTodasLeidas = useCallback(async () => {
    if (!userId) return;
    try {
      await marcarTodasComoLeidas(supabase, userId);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error("[useNotificaciones] Error al marcar todas como leídas:", err);
      refetch();
    }
  }, [userId, supabase, refetch]);

  const noLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  return {
    notificaciones,
    loading,
    noLeidas,
    refetch,
    marcarLeida,
    marcarTodasLeidas,
  };
}
