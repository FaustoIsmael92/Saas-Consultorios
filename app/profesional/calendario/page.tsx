"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";
import { useAgenda } from "@/hooks/useAgenda";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Paciente } from "@/types/auth";
import type { CitaConDetalles } from "@/types/agenda";
import { formatDate } from "@/lib/utils/dates";

type VistaCalendario = "dia" | "semana" | "mes";

export default function CalendarioPage() {
  const { user } = useAuth();
  const { profesional } = useProfesional(user?.id);
  const { citas, loading, addCita, cancelar, getSlots } = useAgenda(
    profesional?.id
  );

  const [vista, setVista] = useState<VistaCalendario>("semana");
  const [fechaBase, setFechaBase] = useState(() => new Date());
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [modalCita, setModalCita] = useState<{
    slotInicio: string;
    slotFin: string;
    fechaStr: string;
  } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchPacientes() {
      const { data } = await supabase
        .from("pacientes")
        .select("id, nombre")
        .is("deleted_at", null)
        .order("nombre");
      setPacientes((data ?? []) as Paciente[]);
    }
    fetchPacientes();
  }, [supabase]);

  const timezone = profesional?.timezone ?? "America/Mexico_City";

  const { inicioRango, finRango } = useMemo(() => {
    const d = new Date(fechaBase);
    let inicio: Date;
    let fin: Date;
    if (vista === "dia") {
      inicio = new Date(d);
      fin = new Date(d);
    } else if (vista === "semana") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      inicio = new Date(d.setDate(diff));
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
    } else {
      inicio = new Date(d.getFullYear(), d.getMonth(), 1);
      fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    }
    return { inicioRango: inicio, finRango: fin };
  }, [fechaBase, vista]);

  const citasEnRango = useMemo(() => {
    return citas.filter((c) => {
      const inicio = new Date(c.inicio);
      return inicio >= inicioRango && inicio <= finRango;
    });
  }, [citas, inicioRango, finRango]);

  const diasAMostrar = useMemo(() => {
    const dias: Date[] = [];
    if (vista === "dia") {
      dias.push(new Date(fechaBase));
    } else if (vista === "semana") {
      const d = new Date(inicioRango);
      for (let i = 0; i < 7; i++) {
        dias.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    } else {
      const d = new Date(inicioRango);
      const fin = new Date(finRango);
      while (d <= fin) {
        dias.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    }
    return dias;
  }, [vista, fechaBase, inicioRango, finRango]);

  const handleAbrirModalNuevaCita = useCallback((slotInicio?: string, slotFin?: string, fechaStr?: string) => {
    if (slotInicio && slotFin && fechaStr) {
      setModalCita({ slotInicio, slotFin, fechaStr });
    } else {
      const hoy = formatDate(new Date());
      setModalCita({
        slotInicio: new Date(hoy + "T09:00:00").toISOString(),
        slotFin: new Date(hoy + "T09:30:00").toISOString(),
        fechaStr: hoy,
      });
    }
  }, []);

  const handleSlotSeleccionado = useCallback((slotInicio: string, slotFin: string, fechaStr: string) => {
    setModalCita({ slotInicio, slotFin, fechaStr });
  }, []);

  const navegar = useCallback((delta: number) => {
    setFechaBase((prev) => {
      const d = new Date(prev);
      if (vista === "dia") d.setDate(d.getDate() + delta);
      else if (vista === "semana") d.setDate(d.getDate() + delta * 7);
      else d.setMonth(d.getMonth() + delta);
      return d;
    });
  }, [vista]);

  if (loading || !profesional) {
    return (
      <div className="py-8">
        <p className="text-zinc-500">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Calendario</h1>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-2">
          {(["dia", "semana", "mes"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`rounded px-3 py-1 text-sm ${
                vista === v
                  ? "bg-blue-600 text-white"
                  : "border border-slate-600"
              }`}
            >
              {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar(-1)}
            className="rounded border border-slate-600 px-3 py-1"
          >
            ←
          </button>
          <span className="min-w-[180px] text-center font-medium text-zinc-100">
            {vista === "dia"
              ? fechaBase.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : vista === "semana"
              ? `${inicioRango.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })} – ${finRango.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : fechaBase.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
          </span>
          <button
            onClick={() => navegar(1)}
            className="rounded border border-slate-600 px-3 py-1"
          >
            →
          </button>
        </div>
        <button
          onClick={() => setFechaBase(new Date())}
          className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
        >
          Hoy
        </button>
      </div>

      {vista === "mes" ? (
        <VistaMensual
          dias={diasAMostrar}
          citas={citasEnRango}
          onCancelar={cancelar}
        />
      ) : (
        <VistaSemanal
          dias={diasAMostrar}
          citas={citasEnRango}
          onSlotClick={handleSlotSeleccionado}
          onCancelar={cancelar}
          getSlots={getSlots}
          timezone={timezone}
        />
      )}

      <button
        onClick={() => handleAbrirModalNuevaCita()}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500"
      >
        Nueva cita
      </button>

      {modalCita && (
        <ModalNuevaCita
          slotInicio={modalCita.slotInicio}
          slotFin={modalCita.slotFin}
          fechaStr={modalCita.fechaStr}
          pacientes={pacientes}
          getSlots={getSlots}
          timezone={timezone}
          onCrear={async (pacienteId, inicio, fin) => {
            await addCita({
              paciente_id: pacienteId,
              inicio,
              fin,
            });
            setModalCita(null);
          }}
          onCerrar={() => setModalCita(null)}
        />
      )}
    </div>
  );
}

function VistaSemanal({
  dias,
  citas,
  onSlotClick,
  onCancelar,
  getSlots,
  timezone,
}: {
  dias: Date[];
  citas: CitaConDetalles[];
  onSlotClick: (inicio: string, fin: string, fecha: string) => void;
  onCancelar: (id: string) => void;
  getSlots: (fecha: string, tz?: string) => Promise<{ inicio: string; fin: string }[]>;
  timezone: string;
}) {
  const horas = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="overflow-x-auto rounded border border-slate-600/40">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            <th className="w-16 border-b border-r border-slate-600/40 bg-slate-800/80 p-2 text-left text-sm">
              Hora
            </th>
            {dias.map((d) => (
              <th
                key={d.toISOString()}
                className="border-b border-r border-slate-600/40 bg-slate-800/80 p-2 text-center text-sm last:border-r-0"
              >
                {d.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((h) => (
            <tr key={h}>
              <td className="border-b border-r border-slate-600/40 p-1 text-xs">
                {String(h).padStart(2, "0")}:00
              </td>
              {dias.map((d) => {
                const fechaStr = formatDate(d);
                return (
                  <CeldaDiaSemana
                    key={`${fechaStr}-${h}`}
                    fecha={d}
                    hora={h}
                    citas={citas}
                    onSlotClick={onSlotClick}
                    onCancelar={onCancelar}
                    getSlots={getSlots}
                    timezone={timezone}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CeldaDiaSemana({
  fecha,
  hora,
  citas,
  onSlotClick,
  onCancelar,
  getSlots,
  timezone,
}: {
  fecha: Date;
  hora: number;
  citas: CitaConDetalles[];
  onSlotClick: (inicio: string, fin: string, fecha: string) => void;
  onCancelar: (id: string) => void;
  getSlots: (fecha: string, tz?: string) => Promise<{ inicio: string; fin: string }[]>;
  timezone: string;
}) {
  const [slots, setSlots] = useState<{ inicio: string; fin: string }[]>([]);
  const fechaStr = formatDate(fecha);

  useEffect(() => {
    getSlots(fechaStr, timezone).then(setSlots);
  }, [fechaStr, getSlots, timezone]);

  const citasEnCelda = citas.filter((c) => {
    const inicio = new Date(c.inicio);
    return (
      formatDate(inicio) === fechaStr &&
      inicio.getHours() >= hora &&
      inicio.getHours() < hora + 1
    );
  });

  const slotsEnCelda = slots.filter((s) => {
    const inicio = new Date(s.inicio);
    return inicio.getHours() >= hora && inicio.getHours() < hora + 1;
  });

  return (
    <td className="relative border-b border-r border-slate-600/40 p-0 align-top last:border-r-0">
      <div className="min-h-[48px] p-1">
        {citasEnCelda.map((c) => (
          <div
            key={c.id}
            className="mb-1 rounded bg-blue-500/20 px-2 py-1 text-xs"
          >
            <span className="font-medium">
              {(c.paciente as { nombre?: string })?.nombre ?? "Paciente"}
            </span>
            <span className="ml-1 opacity-80">
              {new Date(c.inicio).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {c.estado === "programada" && (
              <button
                onClick={() => onCancelar(c.id)}
                className="ml-1 text-red-400 underline"
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
        {slotsEnCelda.slice(0, 2).map((s) => {
          const inicioDate = new Date(s.inicio);
          const finDate = new Date(s.fin);
          return (
            <button
              key={s.inicio}
              onClick={() => onSlotClick(s.inicio, s.fin, fechaStr)}
              className="mb-1 block w-full rounded border border-dashed border-slate-500 px-2 py-1 text-left text-xs hover:bg-slate-800/80"
            >
              {inicioDate.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              libre
            </button>
          );
        })}
        {slotsEnCelda.length > 2 && (
          <span className="text-xs text-zinc-500">
            +{slotsEnCelda.length - 2} más
          </span>
        )}
      </div>
    </td>
  );
}

function VistaMensual({
  dias,
  citas,
  onCancelar,
}: {
  dias: Date[];
  citas: CitaConDetalles[];
  onCancelar: (id: string) => void;
}) {
  const primeraSemana = new Date(dias[0]!);
  const inicioMes = primeraSemana.getDay();
  const offset = inicioMes === 0 ? 6 : inicioMes - 1;

  const chunks: (Date | null)[][] = [];
  let fila: (Date | null)[] = Array(offset)
    .fill(null)
    .map(() => null);
  for (const d of dias) {
    fila.push(d);
    if (fila.length === 7) {
      chunks.push(fila);
      fila = [];
    }
  }
  if (fila.length) {
    while (fila.length < 7) fila.push(null);
    chunks.push(fila);
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-600/40">
      <table className="w-full min-w-[500px] border-collapse">
        <thead>
          <tr>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <th
                key={d}
                className="border-b border-r border-slate-600/40 bg-slate-800/80 p-2 text-center text-sm"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chunks.map((fila, i) => (
            <tr key={i}>
              {fila.map((d, j) => {
                if (!d) return <td key={j} className="border border-slate-600/40 p-2" />;
                const fechaStr = formatDate(d);
                const citasDia = citas.filter(
                  (c) => formatDate(new Date(c.inicio)) === fechaStr
                );
                return (
                  <td
                    key={j}
                    className="min-h-[80px] border border-slate-600/40 p-2 align-top"
                  >
                    <div className="text-sm font-medium">{d.getDate()}</div>
                    <div className="mt-1 space-y-1">
                      {citasDia.map((c) => (
                        <div
                          key={c.id}
                          className="rounded bg-blue-500/20 px-1 py-0.5 text-xs"
                        >
                          {(c.paciente as { nombre?: string })?.nombre ?? "Cita"}{" "}
                          {new Date(c.inicio).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {c.estado === "programada" && (
                            <button
                              onClick={() => onCancelar(c.id)}
                              className="ml-1 text-red-400"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModalNuevaCita({
  slotInicio,
  slotFin,
  fechaStr,
  pacientes,
  getSlots,
  timezone,
  onCrear,
  onCerrar,
}: {
  slotInicio: string;
  slotFin: string;
  fechaStr: string;
  pacientes: Paciente[];
  getSlots: (fecha: string, tz?: string) => Promise<{ inicio: string; fin: string }[]>;
  timezone: string;
  onCrear: (pacienteId: string, inicio: string, fin: string) => Promise<void>;
  onCerrar: () => void;
}) {
  const [pacienteId, setPacienteId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ inicio: string; fin: string } | null>(
    () => ({ inicio: slotInicio, fin: slotFin })
  );
  const [slots, setSlots] = useState<{ inicio: string; fin: string }[]>([]);
  const [fecha, setFecha] = useState(fechaStr);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSlots(fecha, timezone).then((s) => {
      setSlots(s);
      setSelectedSlot(s.length > 0 ? s[0] ?? null : null);
    });
  }, [fecha, getSlots, timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || !selectedSlot) return;
    setLoading(true);
    try {
      await onCrear(pacienteId, selectedSlot.inicio, selectedSlot.fin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-600/40 bg-slate-800 p-6 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Nueva cita</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Horario</label>
            <div className="max-h-32 overflow-y-auto rounded-md border border-slate-600 bg-slate-900/50 p-2">
              {slots.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin slots disponibles</p>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {slots.map((s) => (
                    <button
                      key={s.inicio}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded px-2 py-1 text-sm text-zinc-100 ${
                        selectedSlot?.inicio === s.inicio
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-700"
                      }`}
                    >
                      {new Date(s.inicio).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Paciente</label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
              className="w-full rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar…</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre ?? "Sin nombre"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCerrar} className="rounded-xl border border-slate-600 bg-zinc-600 px-4 py-2 text-white hover:bg-zinc-500">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || slots.length === 0}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-500"
            >
              {loading ? "Creando…" : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
