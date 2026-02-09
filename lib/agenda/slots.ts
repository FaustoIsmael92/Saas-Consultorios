import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimeSlot, Disponibilidad } from "@/types/agenda";
import {
  addMinutes,
  formatDate,
  getDayBoundsISO,
  getDayOfWeek,
  DEFAULT_TIMEZONE,
} from "@/lib/utils/dates";

/**
 * Parsea una cadena de tiempo "HH:mm" o "HH:mm:ss" a minutos desde medianoche.
 */
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  return h * 60 + m;
}

/**
 * Genera los slots disponibles para un día dado, según la disponibilidad del profesional,
 * excluyendo bloqueos y citas existentes.
 */
export async function getSlotsDisponibles(
  supabase: SupabaseClient,
  profesionalId: string,
  fecha: string, // YYYY-MM-DD
  timezone: string = DEFAULT_TIMEZONE
): Promise<TimeSlot[]> {
  const { start: dayStartISO, end: dayEndISO } = getDayBoundsISO(fecha, timezone);
  const dateAtNoon = new Date(
    new Date(dayStartISO).getTime() + 12 * 60 * 60 * 1000
  );
  const diaSemana = getDayOfWeek(dateAtNoon, timezone);

  const { data: disponibilidad } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("profesional_id", profesionalId)
    .eq("dia_semana", diaSemana)
    .is("deleted_at", null);

  if (!disponibilidad?.length) return [];

  // dayStartISO/dayEndISO = inicio/fin del día en la zona del profesional (como UTC)
  // Solapamiento: bloqueo.fecha_fin > dayStart AND bloqueo.fecha_inicio < dayEnd
  const { data: bloqueos } = await supabase
    .from("bloqueos_agenda")
    .select("*")
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null)
    .gt("fecha_fin", dayStartISO)
    .lt("fecha_inicio", dayEndISO);

  // Solapamiento: cita.fin > dayStart AND cita.inicio < dayEnd
  const { data: citas } = await supabase
    .from("citas")
    .select("inicio, fin")
    .eq("profesional_id", profesionalId)
    .is("deleted_at", null)
    .in("estado", ["programada", "completada"])
    .gt("fin", dayStartISO)
    .lt("inicio", dayEndISO);

  const ocupados: { inicio: Date; fin: Date }[] = [
    ...(bloqueos ?? []).map((b) => ({
      inicio: new Date(b.fecha_inicio),
      fin: new Date(b.fecha_fin),
    })),
    ...(citas ?? []).map((c) => ({
      inicio: new Date(c.inicio),
      fin: new Date(c.fin),
    })),
  ];

  const slots: TimeSlot[] = [];

  const dayStartMs = new Date(dayStartISO).getTime();
  for (const d of disponibilidad as Disponibilidad[]) {
    const inicioMin = timeToMinutes(d.hora_inicio);
    const finMin = timeToMinutes(d.hora_fin);
    const duracion = d.duracion_cita_min;

    for (let m = inicioMin; m + duracion <= finMin; m += duracion) {
      const slotInicio = new Date(dayStartMs + m * 60 * 1000);
      const slotFin = addMinutes(slotInicio, duracion);

      // Comprobar si el slot se solapa con algún bloqueo o cita
      const solapado = ocupados.some(
        (o) =>
          (slotInicio >= o.inicio && slotInicio < o.fin) ||
          (slotFin > o.inicio && slotFin <= o.fin) ||
          (slotInicio <= o.inicio && slotFin >= o.fin)
      );

      if (!solapado) {
        slots.push({
          inicio: slotInicio.toISOString(),
          fin: slotFin.toISOString(),
        });
      }
    }
  }

  return slots.sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
  );
}

/**
 * Calcula slots disponibles para un rango de días (para la vista de calendario).
 */
export async function getSlotsDisponiblesRango(
  supabase: SupabaseClient,
  profesionalId: string,
  desde: string,
  hasta: string,
  timezone: string = DEFAULT_TIMEZONE
): Promise<Map<string, TimeSlot[]>> {
  const result = new Map<string, TimeSlot[]>();
  const start = new Date(desde);
  const end = new Date(hasta);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const fechaStr = formatDate(d);
    const slots = await getSlotsDisponibles(
      supabase,
      profesionalId,
      fechaStr,
      timezone
    );
    result.set(fechaStr, slots);
  }

  return result;
}
