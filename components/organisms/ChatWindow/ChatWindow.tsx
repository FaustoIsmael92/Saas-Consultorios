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
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
        <p className="text-sm text-[var(--foreground)]/60">Cargando conversación…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)]">
      <div className="border-b border-[var(--foreground)]/10 px-4 py-2">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Chat con {profesionalNombre ?? "el profesional"}
        </p>
        <p className="text-xs text-[var(--foreground)]/60">Solo para agendar citas</p>
      </div>

      <div className="flex max-h-[360px] min-h-[240px] flex-1 flex-col overflow-y-auto p-4">
        {mensajes.length === 0 && paso === "inicio" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onIniciarFlujo}
              disabled={enviando}
              className="rounded bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] hover:opacity-90 disabled:opacity-50"
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
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                  : m.emisor === "sistema"
                    ? "bg-[var(--foreground)]/5 text-[var(--foreground)]/90"
                    : "bg-[var(--foreground)]/5 text-[var(--foreground)]"
              }`}
            >
              {m.emisor === "sistema" && (
                <span className="mr-1 text-xs text-[var(--foreground)]/60">Asistente:</span>
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
            <p className="text-xs text-[var(--foreground)]/70">Elige una fecha:</p>
            <form onSubmit={handleSubmitFecha} className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                name="fecha"
                min={fechaMin}
                className="rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={enviando}
                className="rounded bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] hover:opacity-90 disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Ver horarios"}
              </button>
            </form>
          </div>
        )}

        {paso === "mostrar_slots" && (
          <div className="mt-2 space-y-2">
            {loadingSlots ? (
              <p className="text-sm text-[var(--foreground)]/60">Cargando horarios…</p>
            ) : (
              <>
                <p className="text-xs text-[var(--foreground)]/70">Elige un horario:</p>
                <ul className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <li key={s.inicio}>
                      <button
                        type="button"
                        onClick={() => onEnviarSlot(s)}
                        disabled={enviando}
                        className="rounded border border-[var(--foreground)]/20 px-3 py-2 text-sm hover:bg-[var(--foreground)]/10 disabled:opacity-50"
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
            <p className="mb-2 text-xs text-[var(--foreground)]/70">
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
          <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
            Cita agendada correctamente.
          </p>
        )}
      </div>

      {error && (
        <div className="border-t border-[var(--foreground)]/10 px-4 py-2">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
