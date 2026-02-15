"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";
import { getSuscripcionByProfesional } from "@/lib/suscripcion";
import type { SuscripcionRow } from "@/lib/suscripcion";

interface EstadoSuscripcionCardProps {
  className?: string;
}

function formatFecha(fecha: string) {
  try {
    return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return fecha;
  }
}

export function EstadoSuscripcionCard({ className = "" }: EstadoSuscripcionCardProps) {
  const { user } = useAuth();
  const { profesional, loading: loadingProf } = useProfesional(user?.id);
  const supabase = useMemo(() => createClient(), []);
  const [suscripcion, setSuscripcion] = useState<SuscripcionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!profesional) return;
    setLoading(true);
    try {
      const s = await getSuscripcionByProfesional(supabase, profesional.id);
      setSuscripcion(s);
    } catch {
      setSuscripcion(null);
    } finally {
      setLoading(false);
    }
  }, [profesional, supabase]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (loadingProf || !profesional) return null;
  if (loading) {
    return (
      <div
        className={`rounded-xl border border-slate-600/40 bg-slate-800/80 p-4 shadow-lg shadow-black/20 ${className}`}
      >
        <p className="text-sm text-zinc-500">Cargando estado de suscripción…</p>
      </div>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const activa =
    suscripcion?.estado === "activa" &&
    suscripcion?.fecha_inicio != null &&
    suscripcion?.fecha_fin != null &&
    suscripcion.fecha_inicio <= hoy &&
    suscripcion.fecha_fin >= hoy;

  return (
    <div
      className={`rounded-xl border border-slate-600/40 bg-slate-800/80 p-4 shadow-lg shadow-black/20 ${className}`}
    >
      <h2 className="mb-2 text-sm font-medium text-zinc-400">
        Estado de suscripción
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
            activa ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {activa ? "Activa" : "Inactiva"}
        </span>
        {suscripcion?.plan && (
          <span className="text-sm capitalize text-zinc-400">
            Plan {suscripcion.plan}
          </span>
        )}
      </div>
      {suscripcion?.fecha_inicio && suscripcion?.fecha_fin && (
        <p className="mt-2 text-xs text-zinc-500">
          Vigencia: {formatFecha(suscripcion.fecha_inicio)} – {formatFecha(suscripcion.fecha_fin)}
        </p>
      )}
      {!activa && (
        <p className="mt-2 text-sm text-zinc-400">
          El chat asistido está deshabilitado mientras la suscripción esté inactiva. Contacta al
          administrador para activarla.
        </p>
      )}
    </div>
  );
}
