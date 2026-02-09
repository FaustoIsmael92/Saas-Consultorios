"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";
import { useAgenda } from "@/hooks/useAgenda";
import { DIAS_SEMANA } from "@/types/agenda";
import { useCallback, useState } from "react";

export default function DisponibilidadPage() {
  const { user } = useAuth();
  const { profesional } = useProfesional(user?.id);
  const {
    disponibilidad,
    bloqueos,
    loading,
    addDisponibilidad,
    removeDisponibilidad,
    addBloqueo,
    removeBloqueo,
  } = useAgenda(profesional?.id);

  const [nuevoDia, setNuevoDia] = useState(0);
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState("09:00");
  const [nuevaHoraFin, setNuevaHoraFin] = useState("17:00");
  const [nuevaDuracion, setNuevaDuracion] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const [bloqueoDesde, setBloqueoDesde] = useState("");
  const [bloqueoHasta, setBloqueoHasta] = useState("");
  const [bloqueoMotivo, setBloqueoMotivo] = useState("");

  const handleAddDisponibilidad = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        await addDisponibilidad({
          dia_semana: nuevoDia,
          hora_inicio: nuevaHoraInicio,
          hora_fin: nuevaHoraFin,
          duracion_cita_min: nuevaDuracion,
        });
        setNuevoDia(0);
        setNuevaHoraInicio("09:00");
        setNuevaHoraFin("17:00");
        setNuevaDuracion(30);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    },
    [
      addDisponibilidad,
      nuevoDia,
      nuevaHoraInicio,
      nuevaHoraFin,
      nuevaDuracion,
    ]
  );

  const handleAddBloqueo = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!bloqueoDesde || !bloqueoHasta) {
        setError("Indica fecha de inicio y fin");
        return;
      }
      const desde = new Date(bloqueoDesde + "T00:00:00");
      const hasta = new Date(bloqueoHasta + "T23:59:59");
      if (desde >= hasta) {
        setError("La fecha de fin debe ser posterior a la de inicio");
        return;
      }
      try {
        await addBloqueo({
          fecha_inicio: desde.toISOString(),
          fecha_fin: hasta.toISOString(),
          motivo: bloqueoMotivo.trim() || null,
        });
        setBloqueoDesde("");
        setBloqueoHasta("");
        setBloqueoMotivo("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    },
    [addBloqueo, bloqueoDesde, bloqueoHasta, bloqueoMotivo]
  );

  if (loading || !profesional) {
    return (
      <div className="py-8">
        <p className="text-[var(--foreground)]/70">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Disponibilidad</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Horarios por día</h2>
        <form onSubmit={handleAddDisponibilidad} className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-sm">Día</label>
            <select
              value={nuevoDia}
              onChange={(e) => setNuevoDia(Number(e.target.value))}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            >
              {DIAS_SEMANA.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">De</label>
            <input
              type="time"
              value={nuevaHoraInicio}
              onChange={(e) => setNuevaHoraInicio(e.target.value)}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">A</label>
            <input
              type="time"
              value={nuevaHoraFin}
              onChange={(e) => setNuevaHoraFin(e.target.value)}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Duración cita (min)</label>
            <select
              value={nuevaDuracion}
              onChange={(e) => setNuevaDuracion(Number(e.target.value))}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded bg-[var(--foreground)] px-4 py-2 text-[var(--background)] hover:opacity-90"
            >
              Añadir
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {disponibilidad.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded border border-[var(--foreground)]/10 px-4 py-2"
            >
              <span>
                {DIAS_SEMANA[d.dia_semana]} {d.hora_inicio.slice(0, 5)} –{" "}
                {d.hora_fin.slice(0, 5)} ({d.duracion_cita_min} min)
              </span>
              <button
                type="button"
                onClick={() => removeDisponibilidad(d.id)}
                className="text-sm text-red-600 underline hover:no-underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Bloqueos de agenda</h2>
        <form onSubmit={handleAddBloqueo} className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-sm">Desde</label>
            <input
              type="date"
              value={bloqueoDesde}
              onChange={(e) => setBloqueoDesde(e.target.value)}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Hasta</label>
            <input
              type="date"
              value={bloqueoHasta}
              onChange={(e) => setBloqueoHasta(e.target.value)}
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Motivo (opcional)</label>
            <input
              type="text"
              value={bloqueoMotivo}
              onChange={(e) => setBloqueoMotivo(e.target.value)}
              placeholder="Vacaciones, etc."
              className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded bg-[var(--foreground)] px-4 py-2 text-[var(--background)] hover:opacity-90"
            >
              Bloquear
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {bloqueos.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded border border-[var(--foreground)]/10 px-4 py-2"
            >
              <span>
                {new Date(b.fecha_inicio).toLocaleDateString()} –{" "}
                {new Date(b.fecha_fin).toLocaleDateString()}
                {b.motivo && ` (${b.motivo})`}
              </span>
              <button
                type="button"
                onClick={() => removeBloqueo(b.id)}
                className="text-sm text-red-600 underline hover:no-underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
