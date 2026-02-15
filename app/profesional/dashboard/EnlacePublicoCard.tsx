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
      className={`rounded-xl border border-slate-600/40 bg-slate-800/80 p-4 shadow-lg shadow-black/20 ${className}`}
    >
      <h2 className="mb-2 text-sm font-medium text-zinc-400">
        Tu enlace público para que los pacientes agenden
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 break-all rounded-md bg-slate-900/80 px-2 py-1 text-sm text-zinc-100">
          {url}
        </code>
        <button
          type="button"
          onClick={copiar}
          className="rounded-xl border border-slate-600 bg-zinc-600 px-3 py-1 text-sm text-white hover:bg-zinc-500"
        >
          Copiar
        </button>
      </div>
    </div>
  );
}
