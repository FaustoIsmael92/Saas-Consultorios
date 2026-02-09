"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Paciente } from "@/types/auth";

export function usePaciente(userId: string | undefined) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) {
      setPaciente(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPaciente() {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();

      if (!cancelled) {
        setPaciente((error ? null : data) as Paciente | null);
        setLoading(false);
      }
    }

    fetchPaciente();
    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  return { paciente, loading };
}
