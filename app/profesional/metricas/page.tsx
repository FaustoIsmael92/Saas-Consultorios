"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";
import { getResumenMetricas } from "@/lib/metricas";
import type { ResumenMetricas } from "@/types/notificaciones";

export default function MetricasPage() {
  const { user } = useAuth();
  const { profesional, loading: loadingProf } = useProfesional(user?.id);
  const supabase = useMemo(() => createClient(), []);
  const [metricas, setMetricas] = useState<ResumenMetricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profesional) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getResumenMetricas(supabase, profesional.id)
      .then((m) => {
        if (!cancelled) setMetricas(m);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar métricas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profesional?.id, supabase]);

  if (loadingProf || (loading && !metricas)) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Métricas</h1>
        <p className="text-zinc-500">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Métricas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!profesional) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Métricas</h1>
        <p className="text-zinc-500">No se encontró el profesional.</p>
      </div>
    );
  }

  const m = metricas ?? {
    citasFormulario: 0,
    citasChat: 0,
    citasCanceladas: 0,
    suscripcionesActivadas: 0,
    tieneSuscripcionActiva: false,
  };

  const totalCitasCreadas = m.citasFormulario + m.citasChat;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Métricas</h1>
      <p className="mb-6 text-zinc-400">
        Resumen de uso del sistema. Los datos se registran automáticamente.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
          <p className="text-sm text-zinc-500">Citas por formulario</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{m.citasFormulario}</p>
        </div>
        <div className="rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
          <p className="text-sm text-zinc-500">Citas por chat</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{m.citasChat}</p>
        </div>
        <div className="rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
          <p className="text-sm text-zinc-500">Total citas creadas</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{totalCitasCreadas}</p>
        </div>
        <div className="rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
          <p className="text-sm text-zinc-500">Citas canceladas</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{m.citasCanceladas}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
        <p className="text-sm text-zinc-500">Suscripción</p>
        <p className="mt-1 font-medium">
          {m.tieneSuscripcionActiva ? (
            <span className="text-green-400">Activa</span>
          ) : (
            <span className="text-amber-400">Inactiva</span>
          )}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Eventos de activación registrados: {m.suscripcionesActivadas}
        </p>
      </div>

      {totalCitasCreadas > 0 && (
        <div className="mt-6 rounded-xl border border-slate-600/40 bg-slate-800/80 shadow-lg shadow-black/20 p-4">
          <p className="text-sm text-zinc-500">Origen de citas</p>
          <p className="mt-1 text-sm text-zinc-400">
            Formulario: {m.citasFormulario} ({((m.citasFormulario / totalCitasCreadas) * 100).toFixed(0)}%)
            — Chat: {m.citasChat} ({((m.citasChat / totalCitasCreadas) * 100).toFixed(0)}%)
          </p>
        </div>
      )}
    </div>
  );
}
