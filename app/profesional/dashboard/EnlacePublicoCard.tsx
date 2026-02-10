"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfesional } from "@/hooks/useProfesional";

interface EnlacePublicoCardProps {
  className?: string;
}

export function EnlacePublicoCard({ className = "" }: EnlacePublicoCardProps) {
  const { user } = useAuth();
  const { profesional, loading } = useProfesional(user?.id);

  if (loading || !profesional?.slug) return null;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${profesional.slug}`
      : `/${profesional.slug}`;

  function copiar() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(url);
  }

  return (
    <div
      className={`rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4 ${className}`}
    >
      <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]/80">
        Tu enlace público para que los pacientes agenden
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 break-all rounded bg-[var(--background)] px-2 py-1 text-sm">
          {url}
        </code>
        <button
          type="button"
          onClick={copiar}
          className="rounded border border-[var(--foreground)]/30 px-3 py-1 text-sm hover:bg-[var(--foreground)]/10"
        >
          Copiar
        </button>
      </div>
    </div>
  );
}
