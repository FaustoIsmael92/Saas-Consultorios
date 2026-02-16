"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";
import { tieneSuscripcionActiva } from "@/lib/suscripcion";
import { getChatsByProfesional, getMensajes, subscribeMensajes } from "@/lib/chat/chatService";
import type { ChatConDetalles } from "@/types/chat";
import type { MensajeChat } from "@/types/chat";

export default function ChatsProfesionalPage() {
  const { user } = useAuth();
  const { profesional, loading: loadingProf } = useProfesional(user?.id);
  const supabase = useMemo(() => createClient(), []);

  const [suscripcionActiva, setSuscripcionActiva] = useState<boolean | null>(null);
  const [chats, setChats] = useState<ChatConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatSeleccionado, setChatSeleccionado] = useState<ChatConDetalles | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  useEffect(() => {
    if (!profesional) return;
    let cancelled = false;
    tieneSuscripcionActiva(supabase, profesional.id)
      .then((activa) => {
        if (!cancelled) setSuscripcionActiva(activa);
      })
      .catch(() => {
        if (!cancelled) setSuscripcionActiva(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profesional, supabase]);

  const cargarChats = useCallback(async () => {
    if (!profesional) return;
    setLoading(true);
    try {
      const lista = await getChatsByProfesional(supabase, profesional.id);
      setChats(lista);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [profesional, supabase]);

  useEffect(() => {
    if (suscripcionActiva === true) cargarChats();
  }, [suscripcionActiva, cargarChats]);

  const cargarMensajes = useCallback(
    async (chatId: string) => {
      setLoadingMensajes(true);
      try {
        const list = await getMensajes(supabase, chatId);
        setMensajes(list);
      } catch {
        setMensajes([]);
      } finally {
        setLoadingMensajes(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!chatSeleccionado) {
      setMensajes([]);
      return;
    }
    cargarMensajes(chatSeleccionado.id);
  }, [chatSeleccionado, cargarMensajes]);

  useEffect(() => {
    if (!chatSeleccionado?.id) return;
    const channel = subscribeMensajes(supabase, chatSeleccionado.id, (nuevo) => {
      setMensajes((prev) => {
        if (prev.some((m) => m.id === nuevo.id)) return prev;
        return [...prev, nuevo];
      });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [chatSeleccionado?.id, supabase]);

  if (loadingProf || !profesional) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-zinc-500">Cargando…</p>
      </div>
    );
  }

  if (suscripcionActiva === false) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Chats</h1>
        <div className="rounded-lg border rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-center">
          <p className="mb-2 font-medium text-zinc-100">
            Chat asistido no disponible
          </p>
          <p className="mb-4 text-sm text-zinc-100/70">
            Tu suscripción está inactiva. El chat asistido se habilita solo con suscripción activa.
            Puedes seguir viendo tus citas y tu agenda. Contacta al administrador para activar la
            suscripción.
          </p>
          <Link
            href="/profesional/dashboard"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm text-white shadow-lg hover:bg-blue-500 hover:opacity-90"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (suscripcionActiva === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-zinc-500">Comprobando suscripción…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Chats</h1>
      <p className="mb-6 text-sm text-zinc-100/70">
        Conversaciones con pacientes para gestión de citas.
      </p>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-slate-600/40 bg-slate-800/80 p-4">
          <h2 className="mb-3 text-sm font-medium">Conversaciones</h2>
          {loading ? (
            <p className="text-sm text-zinc-500">Cargando…</p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-zinc-500">Aún no hay chats.</p>
          ) : (
            <ul className="space-y-1">
              {chats.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setChatSeleccionado(c)}
                    className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                      chatSeleccionado?.id === c.id
                        ? "bg-blue-500/20 font-medium"
                        : "hover:bg-slate-700/50"
                    }`}
                  >
                    {(c.paciente as { nombre?: string | null })?.nombre ?? "Paciente"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-600/40 bg-slate-800/80 p-4">
          {!chatSeleccionado ? (
            <p className="text-sm text-zinc-500">
              Selecciona una conversación para ver el historial.
            </p>
          ) : (
            <>
              <h2 className="mb-3 text-sm font-medium">
                Con {(chatSeleccionado.paciente as { nombre?: string | null })?.nombre ?? "paciente"}
              </h2>
              {loadingMensajes ? (
                <p className="text-sm text-zinc-500">Cargando mensajes…</p>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {mensajes.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.emisor === "paciente" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          m.emisor === "paciente"
                            ? "bg-slate-600/50"
                            : "bg-slate-700/50"
                        }`}
                      >
                        <span className="text-xs text-zinc-500">
                          {m.emisor === "sistema" ? "Sistema" : m.emisor}:
                        </span>{" "}
                        {m.mensaje.startsWith("FECHA:")
                          ? `Fecha: ${m.mensaje.replace("FECHA:", "").trim()}`
                          : m.mensaje.startsWith("SLOT:")
                            ? "Horario elegido"
                            : m.mensaje === "CONFIRMAR"
                              ? "Confirmó cita"
                              : m.mensaje}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
