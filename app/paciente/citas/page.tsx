"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePaciente } from "@/hooks/usePaciente";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCitasByPaciente } from "@/lib/agenda/citas";
import type { CitaConDetalles } from "@/types/agenda";

export default function CitasPacientePage() {
  const { user } = useAuth();
  const { paciente } = usePaciente(user?.id);
  const [citas, setCitas] = useState<CitaConDetalles[]>([]);
  const [loading, setLoading] = useState(!!paciente?.id);

  const supabase = useMemo(() => createClient(), []);

  const refetch = useCallback(async () => {
    if (!paciente?.id) return;
    setLoading(true);
    try {
      const data = await getCitasByPaciente(supabase, paciente.id);
      setCitas(data);
    } finally {
      setLoading(false);
    }
  }, [paciente?.id, supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading || !paciente) {
    return (
      <div className="py-8">
        <p className="text-zinc-500">Cargando…</p>
      </div>
    );
  }

  const citasFuturas = citas
    .filter((c) => new Date(c.inicio) >= new Date() && c.estado === "programada")
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

  const citasPasadas = citas
    .filter((c) => new Date(c.inicio) < new Date() || c.estado !== "programada")
    .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Mis citas</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-medium text-zinc-100">Próximas citas</h2>
        {citasFuturas.length === 0 ? (
          <p className="text-zinc-500">No tienes citas programadas.</p>
        ) : (
          <ul className="space-y-3">
            {citasFuturas.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-600/40 bg-slate-800/80 p-4 shadow-lg shadow-black/20"
              >
                <div className="font-medium text-zinc-100">
                  {(c.profesional as { nombre?: string })?.nombre ?? "Profesional"}
                  {(c.profesional as { especialidad?: string })?.especialidad && (
                    <span className="ml-2 text-sm font-normal text-zinc-400">
                      ({(c.profesional as { especialidad?: string }).especialidad})
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  {new Date(c.inicio).toLocaleString("es-ES", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">Historial</h2>
        {citasPasadas.length === 0 ? (
          <p className="text-zinc-500">Sin citas anteriores.</p>
        ) : (
          <ul className="space-y-3">
            {citasPasadas.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-600/40 bg-slate-800/60 p-4 opacity-90"
              >
                <div className="font-medium text-zinc-100">
                  {(c.profesional as { nombre?: string })?.nombre ?? "Profesional"}
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  {new Date(c.inicio).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  – {c.estado}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
