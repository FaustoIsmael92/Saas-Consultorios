"use client";

import type { MensajeChat } from "@/types/chat";
import type { TimeSlot } from "@/types/agenda";
import { formatTime } from "@/lib/utils/dates";

export interface ChatWindowProps {
  mensajes: MensajeChat[];
  paso: string;
  slots: TimeSlot[];
  slotElegido: TimeSlot | null;
  loading: boolean;
  loadingSlots: boolean;
  enviando: boolean;
  error: string | null;
  onEnviarFecha: (fecha: string) => void;
  onEnviarSlot: (slot: TimeSlot) => void;
  onConfirmarCita: () => void;
  onIniciarFlujo: () => void;
  profesionalNombre: string | null;
}

export function ChatWindow({
  mensajes,
  paso,
  slots,
  slotElegido,
  loading,
  loadingSlots,
  enviando,
  error,
  onEnviarFecha,
  onEnviarSlot,
  onConfirmarCita,
  onIniciarFlujo,
  profesionalNombre,
}: ChatWindowProps) {
  const fechaMin = new Date().toISOString().slice(0, 10);

  const handleSubmitFecha = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fecha = (form.elements.namedItem("fecha") as HTMLInputElement)?.value;
    if (fecha) onEnviarFecha(fecha);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-slate-600/40 bg-slate-800/80 p-4">
        <p className="text-sm text-zinc-500">Cargando conversación…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-slate-600/40 bg-slate-800/80">
      <div className="border-b border-slate-600/40 px-4 py-2">
        <p className="text-sm font-medium text-zinc-100">
          Chat con {profesionalNombre ?? "el profesional"}
        </p>
        <p className="text-xs text-zinc-500">Solo para agendar citas</p>
      </div>

      <div className="flex max-h-[360px] min-h-[240px] flex-1 flex-col overflow-y-auto p-4">
        {mensajes.length === 0 && paso === "inicio" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onIniciarFlujo}
              disabled={enviando}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              Iniciar conversación para agendar
            </button>
          </div>
        )}

        {mensajes.map((m) => (
          <div
            key={m.id || m.created_at}
            className={`mb-2 flex ${m.emisor === "paciente" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.emisor === "paciente"
                  ? "bg-slate-600/50 text-zinc-100"
                  : m.emisor === "sistema"
                    ? "bg-slate-700/50 text-zinc-200"
                    : "bg-slate-700/50 text-zinc-100"
              }`}
            >
              {m.emisor === "sistema" && (
                <span className="mr-1 text-xs text-zinc-500">Asistente:</span>
              )}
              {m.mensaje.startsWith("FECHA:") ? (
                <span>Fecha elegida: {m.mensaje.replace("FECHA:", "").trim()}</span>
              ) : m.mensaje.startsWith("SLOT:") ? (
                <span>Horario elegido</span>
              ) : m.mensaje === "CONFIRMAR" ? (
                <span>Confirmado</span>
              ) : (
                m.mensaje
              )}
            </div>
          </div>
        ))}

        {paso === "inicio" && mensajes.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-zinc-400">Elige una fecha:</p>
            <form onSubmit={handleSubmitFecha} className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                name="fecha"
                min={fechaMin}
                className="rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={enviando}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Ver horarios"}
              </button>
            </form>
          </div>
        )}

        {paso === "mostrar_slots" && (
          <div className="mt-2 space-y-2">
            {loadingSlots ? (
              <p className="text-sm text-zinc-500">Cargando horarios…</p>
            ) : (
              <>
                <p className="text-xs text-zinc-400">Elige un horario:</p>
                <ul className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <li key={s.inicio}>
                      <button
                        type="button"
                        onClick={() => onEnviarSlot(s)}
                        disabled={enviando}
                        className="rounded-md border border-slate-600 px-3 py-2 text-sm text-zinc-100 hover:bg-slate-700 disabled:opacity-50"
                      >
                        {formatTime(new Date(s.inicio))}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {paso === "confirmar_slot" && slotElegido && (
          <div className="mt-2">
            <p className="mb-2 text-xs text-zinc-400">
              {new Date(slotElegido.inicio).toLocaleString("es", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <button
              type="button"
              onClick={onConfirmarCita}
              disabled={enviando}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              {enviando ? "Confirmando…" : "Confirmar cita"}
            </button>
          </div>
        )}

        {paso === "cita_creada" && (
          <p className="mt-2 text-sm font-medium text-green-400">
            Cita agendada correctamente.
          </p>
        )}
      </div>

      {error && (
        <div className="border-t border-slate-600/40 px-4 py-2">
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
