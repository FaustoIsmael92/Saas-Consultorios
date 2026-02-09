"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profesional } from "@/types/auth";

export function useProfesional(userId: string | undefined) {
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) {
      setProfesional(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfesional() {
      const { data, error } = await supabase
        .from("profesionales")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();

      if (!cancelled) {
        setProfesional((error ? null : data) as Profesional | null);
        setLoading(false);
      }
    }

    fetchProfesional();
    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  return { profesional, loading };
}
