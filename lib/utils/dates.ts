/**
 * Utilidades para manejo de fechas en la agenda.
 * Soporta zona horaria del profesional para cálculo de slots.
 */

export const DEFAULT_TIMEZONE = "America/Mexico_City";

/**
 * Formatea una fecha a ISO en la zona indicada.
 */
export function toISOInTimezone(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return date.toLocaleString("sv-SE", { timeZone: timezone }).replace(" ", "T");
}

/**
 * Obtiene el día de la semana (0=lunes, 6=domingo).
 * Debe alinearse con PostgreSQL: EXTRACT(DOW) con CASE 0->6 else n-1.
 */
export function getDayOfWeek(date: Date, timezone: string = DEFAULT_TIMEZONE): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
  const day = formatter.format(date);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[day] ?? 0;
}

/**
 * Devuelve el inicio y fin del día (en UTC) para una fecha en una zona horaria.
 * fecha: YYYY-MM-DD. Resultado en ISO para consultas a la BD (timestamptz).
 */
export function getDayBoundsISO(
  fecha: string,
  timezone: string = DEFAULT_TIMEZONE
): { start: string; end: string } {
  const [y, m, d] = fecha.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(noonUtc);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "12", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const offsetMs = (12 * 60 - (hour * 60 + minute)) * 60 * 1000;
  const start = new Date(noonUtc.getTime() + offsetMs - 12 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Genera un Date a partir de fecha (YYYY-MM-DD) y hora (HH:mm).
 */
export function parseDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(
    new Date(year, month - 1, day, hours, minutes).toLocaleString("en-US", {
      timeZone: timezone,
    })
  );
}

/**
 * Suma minutos a una fecha.
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Formatea hora a HH:mm.
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Formatea fecha a YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Crea Date en la zona indicada a partir de componentes.
 */
export function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const str = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return new Date(new Date(str).toLocaleString("en-US", { timeZone: timezone }));
}
