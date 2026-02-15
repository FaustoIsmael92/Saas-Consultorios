"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfesionalBySlug } from "@/lib/agenda/public";
import { getOrCreateChat } from "@/lib/chat/chatService";
import { tieneSuscripcionActiva } from "@/lib/suscripcion";
import { SLUGS_RESERVADOS } from "@/lib/auth/guards";
import { useAuth } from "@/hooks/useAuth";
import { usePaciente } from "@/hooks/usePaciente";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/organisms/ChatWindow/ChatWindow";
import type { ProfesionalPublico } from "@/lib/agenda/public";

type Estado = "cargando" | "no-encontrado" | "sin-suscripcion" | "listo";

export default function ChatAsistidoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const { user } = useAuth();
  const { paciente, loading: loadingPaciente } = usePaciente(user?.id);
  const supabase = useMemo(() => createClient(), []);

  const [profesional, setProfesional] = useState<ProfesionalPublico | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [chatId, setChatId] = useState<string | null>(null);
  const crearChatIntentadoRef = useRef(false);
  const flujoIniciadoRef = useRef(false);

  useEffect(() => {
    if (!slug || SLUGS_RESERVADOS.includes(slug as (typeof SLUGS_RESERVADOS)[number])) {
      router.replace("/");
      return;
    }
  }, [slug, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const p = await getProfesionalBySlug(supabase, slug);
        if (cancelled) return;
        if (!p) {
          setEstado("no-encontrado");
          return;
        }
        const activa = await tieneSuscripcionActiva(supabase, p.id);
        if (cancelled) return;
        if (!activa) {
          setProfesional(p);
          setEstado("sin-suscripcion");
          return;
        }
        setProfesional(p);
        setEstado("listo");
      } catch {
        if (!cancelled) setEstado("no-encontrado");
      }
    }

    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  const crearChat = useCallback(async () => {
    if (!profesional || !paciente) return;
    try {
      const chat = await getOrCreateChat(supabase, profesional.id, paciente.id);
      setChatId(chat.id);
    } catch {
      setEstado("no-encontrado");
    }
  }, [profesional, paciente, supabase]);

  useEffect(() => {
    if (estado === "listo" && profesional && paciente && !chatId && !crearChatIntentadoRef.current) {
      crearChatIntentadoRef.current = true;
      crearChat();
    }
  }, [estado, profesional, paciente, chatId, crearChat]);

  const chat = useChat({
    chatId,
    profesionalId: profesional?.id ?? "",
    profesionalNombre: profesional?.nombre ?? null,
    timezone: profesional?.timezone ?? null,
    pacienteId: paciente?.id ?? "",
  });

  useEffect(() => {
    if (
      chatId &&
      !chat.loading &&
      chat.mensajes.length === 0 &&
      !flujoIniciadoRef.current
    ) {
      flujoIniciadoRef.current = true;
      chat.iniciarFlujo();
    }
  }, [chatId, chat.loading, chat.mensajes.length, chat.iniciarFlujo]);

  if (estado === "cargando" || (estado === "listo" && !chatId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <p className="text-zinc-500">Cargando…</p>
      </div>
    );
  }

  if (estado === "no-encontrado") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4">
        <h1 className="text-xl font-semibold">Enlace no encontrado</h1>
        <p className="text-center text-zinc-500">
          El enlace del profesional no existe o no está disponible.
        </p>
        <Link
          href="/"
          className="rounded rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500 hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  if (estado === "sin-suscripcion" && profesional) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4">
        <h1 className="text-xl font-semibold">Chat no disponible</h1>
        <p className="text-center text-zinc-500">
          El chat asistido solo está disponible para profesionales con suscripción activa.
          {profesional.nombre && ` (${profesional.nombre})`}
        </p>
        <Link
          href={`/${slug}`}
          className="rounded rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500 hover:opacity-90"
        >
          Agendar por formulario
        </Link>
      </div>
    );
  }

  if (!paciente && !loadingPaciente) {
    const redirectUrl = `/${slug}/chat`;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4">
        <h1 className="text-xl font-semibold">Inicia sesión como paciente</h1>
        <p className="text-center text-zinc-500">
          Para usar el chat necesitas una cuenta de paciente.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/registro?redirect=${encodeURIComponent(redirectUrl)}&role=paciente`}
            className="rounded rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-500 hover:opacity-90"
          >
            Registrarme
          </Link>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="rounded rounded-xl border border-slate-600 px-4 py-2 text-zinc-100 hover:bg-slate-800"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    );
  }

  if (!profesional || !paciente) return null;

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">
              Chat con {profesional.nombre ?? "el profesional"}
            </h1>
            {profesional.especialidad && (
              <p className="text-sm text-zinc-500">{profesional.especialidad}</p>
            )}
          </div>
          <Link
            href={`/${slug}`}
            className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
          >
            Volver al formulario
          </Link>
        </header>

        <ChatWindow
          mensajes={chat.mensajes}
          paso={chat.paso}
          slots={chat.slots}
          slotElegido={chat.slotElegido}
          loading={chat.loading}
          loadingSlots={chat.loadingSlots}
          enviando={chat.enviando}
          error={chat.error}
          onEnviarFecha={chat.enviarFecha}
          onEnviarSlot={chat.enviarSlot}
          onConfirmarCita={chat.confirmarCita}
          onIniciarFlujo={chat.iniciarFlujo}
          profesionalNombre={profesional.nombre}
        />
      </div>
    </div>
  );
}
