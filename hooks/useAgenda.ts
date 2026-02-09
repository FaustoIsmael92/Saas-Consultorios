"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getDisponibilidadByProfesional,
  getBloqueosByProfesional,
  createDisponibilidad,
  updateDisponibilidad,
  deleteDisponibilidad,
  createBloqueo,
  deleteBloqueo,
} from "@/lib/agenda/availability";
import {
  getCitasByProfesional,
  createCita,
  cancelarCita,
} from "@/lib/agenda/citas";
import { getSlotsDisponibles } from "@/lib/agenda/slots";
import type {
  Disponibilidad,
  BloqueoAgenda,
  Cita,
  CitaConDetalles,
  TimeSlot,
} from "@/types/agenda";
import { DEFAULT_TIMEZONE } from "@/lib/utils/dates";

export function useAgenda(profesionalId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);

  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAgenda[]>([]);
  const [citas, setCitas] = useState<CitaConDetalles[]>([]);
  const [loading, setLoading] = useState(!!profesionalId);

  const refetch = useCallback(async () => {
    if (!profesionalId) return;
    setLoading(true);
    try {
      const [disp, bloc, cits] = await Promise.all([
        getDisponibilidadByProfesional(supabase, profesionalId),
        getBloqueosByProfesional(supabase, profesionalId),
        getCitasByProfesional(supabase, profesionalId),
      ]);
      setDisponibilidad(disp);
      setBloqueos(bloc);
      setCitas(cits);
    } finally {
      setLoading(false);
    }
  }, [profesionalId, supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addDisponibilidad = useCallback(
    async (data: {
      dia_semana: number;
      hora_inicio: string;
      hora_fin: string;
      duracion_cita_min: number;
    }) => {
      if (!profesionalId) throw new Error("No profesional");
      await createDisponibilidad(supabase, {
        profesional_id: profesionalId,
        ...data,
      });
      await refetch();
    },
    [profesionalId, supabase, refetch]
  );

  const editDisponibilidad = useCallback(
    async (
      id: string,
      data: Partial<{
        dia_semana: number;
        hora_inicio: string;
        hora_fin: string;
        duracion_cita_min: number;
      }>
    ) => {
      await updateDisponibilidad(supabase, id, data);
      await refetch();
    },
    [supabase, refetch]
  );

  const removeDisponibilidad = useCallback(
    async (id: string) => {
      await deleteDisponibilidad(supabase, id);
      await refetch();
    },
    [supabase, refetch]
  );

  const addBloqueo = useCallback(
    async (data: {
      fecha_inicio: string;
      fecha_fin: string;
      motivo?: string | null;
    }) => {
      if (!profesionalId) throw new Error("No profesional");
      await createBloqueo(supabase, {
        profesional_id: profesionalId,
        ...data,
      });
      await refetch();
    },
    [profesionalId, supabase, refetch]
  );

  const removeBloqueo = useCallback(
    async (id: string) => {
      await deleteBloqueo(supabase, id);
      await refetch();
    },
    [supabase, refetch]
  );

  const addCita = useCallback(
    async (data: {
      paciente_id: string;
      inicio: string;
      fin: string;
      origen?: "formulario" | "chat";
    }) => {
      if (!profesionalId) throw new Error("No profesional");
      await createCita(supabase, {
        profesional_id: profesionalId,
        origen: data.origen ?? "formulario",
        ...data,
      });
      await refetch();
    },
    [profesionalId, supabase, refetch]
  );

  const cancelar = useCallback(
    async (id: string) => {
      await cancelarCita(supabase, id);
      await refetch();
    },
    [supabase, refetch]
  );

  const getSlots = useCallback(
    async (
      fecha: string,
      timezone: string = DEFAULT_TIMEZONE
    ): Promise<TimeSlot[]> => {
      if (!profesionalId) return [];
      return getSlotsDisponibles(supabase, profesionalId, fecha, timezone);
    },
    [profesionalId, supabase]
  );

  return {
    disponibilidad,
    bloqueos,
    citas,
    loading,
    refetch,
    addDisponibilidad,
    editDisponibilidad,
    removeDisponibilidad,
    addBloqueo,
    removeBloqueo,
    addCita,
    cancelar,
    getSlots,
  };
}
