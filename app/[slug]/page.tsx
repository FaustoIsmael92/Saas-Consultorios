"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getProfesionalBySlug,
  getSlotsPublicos,
  type ProfesionalPublico,
} from "@/lib/agenda/public";
import { createCita } from "@/lib/agenda/citas";
import { tieneSuscripcionActiva } from "@/lib/suscripcion";
import { SLUGS_RESERVADOS } from "@/lib/auth/guards";
import { useAuth } from "@/hooks/useAuth";
import { usePaciente } from "@/hooks/usePaciente";
import { formatTime } from "@/lib/utils/dates";
import type { TimeSlot } from "@/types/agenda";

type EstadoFlujo = "cargando" | "no-encontrado" | "listo" | "confirmacion" | "error";

export default function EnlacePublicoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const { user } = useAuth();
  const { paciente, loading: loadingPaciente } = usePaciente(user?.id);
  const supabase = useMemo(() => createClient(), []);

  const [profesional, setProfesional] = useState<ProfesionalPublico | null>(null);
  const [estado, setEstado] = useState<EstadoFlujo>("cargando");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotElegido, setSlotElegido] = useState<TimeSlot | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [citaCreada, setCitaCreada] = useState<{ inicio: string; fin: string } | null>(null);
  const [chatDisponible, setChatDisponible] = useState(false);

  // Redirigir slugs reservados
  useEffect(() => {
    if (!slug) return;
    if (SLUGS_RESERVADOS.includes(slug as (typeof SLUGS_RESERVADOS)[number])) {
      if (slug === "login") router.replace("/login");
      else if (slug === "registro") router.replace("/registro");
      else if (slug === "profesional") router.replace("/profesional/dashboard");
      else if (slug === "paciente") router.replace("/paciente/dashboard");
      else router.replace("/");
    }
  }, [slug, router]);

  // Cargar profesional por slug
  useEffect(() => {
    if (!slug || SLUGS_RESERVADOS.includes(slug as (typeof SLUGS_RESERVADOS)[number])) return;

    let cancelled = false;

    async function load() {
      try {
        const p = await getProfesionalBySlug(supabase, slug);
        if (cancelled) return;
        if (!p) {
          setEstado("no-encontrado");
          return;
        }
        setProfesional(p);
        setEstado("listo");
        const activa = await tieneSuscripcionActiva(supabase, p.id);
        if (!cancelled) setChatDisponible(activa);
      } catch {
        if (!cancelled) setEstado("no-encontrado");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  // Cargar slots cuando cambia la fecha
  const cargarSlots = useCallback(
    async (fecha: string) => {
      if (!profesional || !fecha) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      setMensajeError(null);
      try {
        const tz = profesional.timezone ?? "America/Mexico_City";
        const lista = await getSlotsPublicos(supabase, profesional.id, fecha, tz);
        setSlots(lista);
        setSlotElegido(null);
      } catch (e) {
        setMensajeError(e instanceof Error ? e.message : "Error al cargar horarios");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [profesional, supabase]
  );

  useEffect(() => {
    if (fechaSeleccionada && profesional) cargarSlots(fechaSeleccionada);
    else setSlots([]);
  }, [fechaSeleccionada, profesional, cargarSlots]);

  const fechaMin = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const crearCita = useCallback(async () => {
    if (!slotElegido || !profesional || !paciente) return;
    setEnviando(true);
    setMensajeError(null);
    try {
      await createCita(supabase, {
        profesional_id: profesional.id,
        paciente_id: paciente.id,
        inicio: slotElegido.inicio,
        fin: slotElegido.fin,
        origen: "formulario",
      });
      setCitaCreada({ inicio: slotElegido.inicio, fin: slotElegido.fin });
      setEstado("confirmacion");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo crear la cita. El horario pudo quedar ocupado.";
      setMensajeError(msg);
      await cargarSlots(fechaSeleccionada);
    } finally {
      setEnviando(false);
    }
  }, [slotElegido, profesional, paciente, supabase, fechaSeleccionada, cargarSlots]);

  if (estado === "cargando" || (estado === "listo" && !profesional)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <p className="text-[var(--foreground)]/70">Cargando…</p>
      </div>
    );
  }

  if (estado === "no-encontrado") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
        <h1 className="text-xl font-semibold">Enlace no encontrado</h1>
        <p className="text-[var(--foreground)]/70 text-center">
          El enlace del profesional no existe o no está disponible.
        </p>
        <Link
          href="/"
          className="rounded bg-[var(--foreground)] px-4 py-2 text-[var(--background)] hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  if (estado === "confirmacion" && citaCreada) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
        <div className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-sm text-center max-w-md">
          <h1 className="mb-2 text-xl font-semibold text-green-700 dark:text-green-400">
            Cita confirmada
          </h1>
          <p className="mb-4 text-[var(--foreground)]/80">
            Tu cita con {profesional?.nombre ?? "el profesional"} ha sido agendada.
          </p>
          <p className="text-sm text-[var(--foreground)]/70">
            {new Date(citaCreada.inicio).toLocaleString("es", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <Link
            href="/paciente/citas"
            className="mt-6 inline-block rounded bg-[var(--foreground)] px-4 py-2 text-[var(--background)] hover:opacity-90"
          >
            Ver mis citas
          </Link>
        </div>
      </div>
    );
  }

  if (!profesional) return null;

  const isPaciente = !!paciente && !loadingPaciente;
  const redirectUrl = `/${slug}`;

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            {profesional.nombre ?? "Profesional"}
          </h1>
          {profesional.especialidad && (
            <p className="mt-1 text-[var(--foreground)]/70">{profesional.especialidad}</p>
          )}
          <p className="mt-2 text-sm text-[var(--foreground)]/60">Agenda tu cita</p>
          {isPaciente && chatDisponible && (
            <p className="mt-2">
              <Link
                href={`/${slug}/chat`}
                className="text-sm font-medium text-[var(--foreground)] underline hover:no-underline"
              >
                Agendar por chat asistido
              </Link>
            </p>
          )}
        </header>

        {!isPaciente && (
          <div className="mb-6 rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4 text-center">
            <p className="mb-3 text-sm text-[var(--foreground)]/80">
              Para agendar necesitas una cuenta de paciente.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/registro?redirect=${encodeURIComponent(redirectUrl)}&role=paciente`}
                className="rounded bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] hover:opacity-90"
              >
                Registrarme
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="rounded border border-[var(--foreground)]/30 px-4 py-2 text-sm hover:bg-[var(--foreground)]/10"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        )}

        {isPaciente && (
          <section className="space-y-4">
            <div>
              <label htmlFor="fecha" className="mb-1 block text-sm font-medium">
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                min={fechaMin}
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
              />
            </div>

            {fechaSeleccionada && (
              <div>
                <label className="mb-1 block text-sm font-medium">Horario disponible</label>
                {loadingSlots ? (
                  <p className="py-4 text-sm text-[var(--foreground)]/60">Cargando horarios…</p>
                ) : slots.length === 0 ? (
                  <p className="py-4 text-sm text-[var(--foreground)]/60">
                    No hay horarios disponibles este día.
                  </p>
                ) : (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <li key={s.inicio}>
                        <button
                          type="button"
                          onClick={() => setSlotElegido(s)}
                          className={`w-full rounded border py-2 text-sm transition ${
                            slotElegido?.inicio === s.inicio
                              ? "border-[var(--foreground)] bg-[var(--foreground)]/10"
                              : "border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/5"
                          }`}
                        >
                          {formatTime(new Date(s.inicio))}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {slotElegido && (
              <div className="pt-2">
                <p className="mb-2 text-sm text-[var(--foreground)]/70">
                  Horario elegido:{" "}
                  {new Date(slotElegido.inicio).toLocaleString("es", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <button
                  type="button"
                  onClick={crearCita}
                  disabled={enviando}
                  className="w-full rounded bg-[var(--foreground)] py-3 text-[var(--background)] hover:opacity-90 disabled:opacity-50"
                >
                  {enviando ? "Confirmando…" : "Confirmar cita"}
                </button>
              </div>
            )}

            {mensajeError && (
              <p className="text-sm text-red-600" role="alert">
                {mensajeError}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
