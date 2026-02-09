"use client";

import { useAuth } from "./useAuth";
import { useUser } from "./useUser";
import type { UserRole } from "@/types/auth";

export function useRole(): {
  role: UserRole | null;
  loading: boolean;
  isProfesional: boolean;
  isPaciente: boolean;
} {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser(user?.id);

  const loading = authLoading || profileLoading;
  const role = (profile?.role as UserRole | undefined) ?? null;

  return {
    role,
    loading,
    isProfesional: role === "profesional",
    isPaciente: role === "paciente",
  };
}
