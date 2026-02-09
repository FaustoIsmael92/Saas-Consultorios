"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/auth";

export function useUser(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();

      if (!cancelled) {
        if (error) {
          setProfile(null);
        } else {
          setProfile(data as Profile | null);
        }
        setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  return { profile, loading };
}
