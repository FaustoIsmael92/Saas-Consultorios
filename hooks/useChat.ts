"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getMensajes,
  enviarMensaje,
  subscribeMensajes,
  getSlotsParaChat,
  crearCitaDesdeChat,
} from "@/lib/chat/chatService";
import type { MensajeChat } from "@/types/chat";
import type { PasoFlujoChat } from "@/types/chat";
import type { TimeSlot } from "@/types/agenda";
import { formatTime } from "@/lib/utils/dates";

const PREFIJO_FECHA = "FECHA:";
const PREFIJO_SLOT = "SLOT:";
const PREFIJO_CONFIRMAR = "CONFIRMAR";

function parseFechaFromMensaje(m: string): string | null {
  if (m.startsWith(PREFIJO_FECHA)) return m.slice(PREFIJO_FECHA.length).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(m.trim())) return m.trim();
  return null;
}

function parseSlotFromMensaje(m: string): { inicio: string; fin: string } | null {
  if (m.startsWith(PREFIJO_SLOT)) {
    const json = m.slice(PREFIJO_SLOT.length).trim();
    try {
      const o = JSON.parse(json) as { inicio: string; fin: string };
      if (o?.inicio && o?.fin) return o;
    } catch {
      return null;
    }
  }
  return null;
}

function derivarPasoDesdeMensajes(mensajes: MensajeChat[]): {
  paso: PasoFlujoChat;
  fechaElegida: string | null;
  slotElegido: TimeSlot | null;
} {
  let fechaElegida: string | null = null;
  let slotElegido: TimeSlot | null = null;

  for (const m of mensajes) {
    if (m.emisor === "paciente") {
      const f = parseFechaFromMensaje(m.mensaje);
      if (f) fechaElegida = f;
      const s = parseSlotFromMensaje(m.mensaje);
      if (s) slotElegido = s;
    }
  }

  const lastSistema = [...mensajes].reverse().find((x) => x.emisor === "sistema");
  const lastTexto = lastSistema?.mensaje ?? "";

  if (lastTexto.includes("Cita confirmada") || lastTexto.includes("cita ha sido agendada"))
    return { paso: "cita_creada", fechaElegida, slotElegido };
  if (lastTexto.includes("¿Confirmar cita") || lastTexto.includes("Confirmar cita"))
    return { paso: "confirmar_slot", fechaElegida, slotElegido };
  if (lastTexto.includes("Horarios disponibles") || lastTexto.includes("horarios disponibles"))
    return { paso: "mostrar_slots", fechaElegida, slotElegido };
  if (fechaElegida)
    return { paso: "elegir_fecha", fechaElegida, slotElegido };
  return { paso: "inicio", fechaElegida, slotElegido };
}

export interface UseChatOptions {
  chatId: string | null;
  profesionalId: string;
  profesionalNombre: string | null;
  timezone: string | null;
  pacienteId: string;
}

export function useChat({
  chatId,
  profesionalId,
  profesionalNombre,
  timezone,
  pacienteId,
}: UseChatOptions) {
  const supabase = useMemo(() => createClient(), []);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [paso, setPaso] = useState<PasoFlujoChat>("inicio");
  const [fechaElegida, setFechaElegida] = useState<string | null>(null);
  const [slotElegido, setSlotElegido] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(!!chatId);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tz = timezone ?? "America/Mexico_City";

  const cargarMensajes = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getMensajes(supabase, chatId);
      setMensajes(list);
      const { paso: p, fechaElegida: fe, slotElegido: se } = derivarPasoDesdeMensajes(list);
      setPaso(p);
      setFechaElegida(fe);
      setSlotElegido(se);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }, [chatId, supabase]);

  useEffect(() => {
    cargarMensajes();
  }, [cargarMensajes]);

  useEffect(() => {
    if (!chatId) return;
    const channel = subscribeMensajes(supabase, chatId, (nuevo) => {
      setMensajes((prev) => {
        if (prev.some((m) => m.id === nuevo.id)) return prev;
        return [...prev, nuevo];
      });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [chatId, supabase]);

  const agregarMensajeSistema = useCallback(
    async (texto: string) => {
      if (!chatId) return;
      await enviarMensaje(supabase, chatId, "sistema", texto);
      // La suscripción en tiempo real añadirá el mensaje a la lista
    },
    [chatId, supabase]
  );

  const enviarFecha = useCallback(
    async (fecha: string) => {
      if (!chatId || !profesionalId) return;
      setEnviando(true);
      setError(null);
      try {
        await enviarMensaje(supabase, chatId, "paciente", `${PREFIJO_FECHA}${fecha}`);
        setFechaElegida(fecha);
        setPaso("elegir_fecha");
        setLoadingSlots(true);
        const lista = await getSlotsParaChat(supabase, profesionalId, fecha, tz);
        setSlots(lista);
        setLoadingSlots(false);
        if (lista.length === 0) {
          await agregarMensajeSistema(
            `No hay horarios disponibles el ${fecha}. Elige otra fecha.`
          );
          setPaso("inicio");
          return;
        }
        const textoSlots =
          lista.map((s) => formatTime(new Date(s.inicio))).join(", ") +
          ". Elige uno de los horarios.";
        await agregarMensajeSistema(`Horarios disponibles el ${fecha}: ${textoSlots}`);
        setPaso("mostrar_slots");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al enviar");
        setLoadingSlots(false);
        setPaso("inicio");
      } finally {
        setEnviando(false);
      }
    },
    [chatId, supabase, profesionalId, tz, agregarMensajeSistema]
  );

  const enviarSlot = useCallback(
    async (slot: TimeSlot) => {
      if (!chatId) return;
      setEnviando(true);
      setError(null);
      try {
        const payload = JSON.stringify({ inicio: slot.inicio, fin: slot.fin });
        await enviarMensaje(supabase, chatId, "paciente", `${PREFIJO_SLOT}${payload}`);
        setSlotElegido(slot);
        const fechaStr = slot.inicio.slice(0, 10);
        const horaStr = formatTime(new Date(slot.inicio));
        await agregarMensajeSistema(
          `¿Confirmar cita el ${fechaStr} a las ${horaStr}? Pulsa "Confirmar" para agendar.`
        );
        setPaso("confirmar_slot");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al enviar");
      } finally {
        setEnviando(false);
      }
    },
    [chatId, supabase, agregarMensajeSistema]
  );

  const confirmarCita = useCallback(async () => {
    if (!chatId || !slotElegido || !profesionalId || !pacienteId) return;
    setEnviando(true);
    setError(null);
    try {
      await enviarMensaje(supabase, chatId, "paciente", PREFIJO_CONFIRMAR);
      await crearCitaDesdeChat(supabase, {
        profesional_id: profesionalId,
        paciente_id: pacienteId,
        inicio: slotElegido.inicio,
        fin: slotElegido.fin,
      });
      const fechaStr = slotElegido.inicio.slice(0, 10);
      const horaStr = formatTime(new Date(slotElegido.inicio));
      await agregarMensajeSistema(
        `Cita confirmada. Tu cita con ${profesionalNombre ?? "el profesional"} ha sido agendada para el ${fechaStr} a las ${horaStr}.`
      );
      setPaso("cita_creada");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo crear la cita. El horario pudo quedar ocupado.";
      setError(msg);
      await agregarMensajeSistema(`Error: ${msg}. Elige otro horario si lo deseas.`);
      setPaso("mostrar_slots");
    } finally {
      setEnviando(false);
    }
  }, [
    chatId,
    slotElegido,
    supabase,
    profesionalId,
    pacienteId,
    profesionalNombre,
    agregarMensajeSistema,
  ]);

  const cargarSlotsParaFecha = useCallback(
    async (fecha: string) => {
      if (!profesionalId) return;
      setLoadingSlots(true);
      setError(null);
      try {
        const lista = await getSlotsParaChat(supabase, profesionalId, fecha, tz);
        setSlots(lista);
        setFechaElegida(fecha);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar horarios");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [supabase, profesionalId, tz]
  );

  const iniciarFlujo = useCallback(async () => {
    if (!chatId || mensajes.length > 0) return;
    await agregarMensajeSistema(
      "Hola. Soy el asistente para agendar citas. ¿En qué fecha te gustaría agendar? (Elige una fecha abajo.)"
    );
    setPaso("inicio");
  }, [chatId, mensajes.length, agregarMensajeSistema]);

  return {
    mensajes,
    paso,
    fechaElegida,
    slotElegido,
    slots,
    loadingSlots,
    loading,
    enviando,
    error,
    enviarFecha,
    enviarSlot,
    confirmarCita,
    cargarSlotsParaFecha,
    iniciarFlujo,
    cargarMensajes,
  };
}
