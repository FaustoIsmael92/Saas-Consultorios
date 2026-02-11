"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotificaciones } from "@/hooks/useNotificaciones";

interface NotificacionesCardProps {
  className?: string;
  maxItems?: number;
}

function formatFecha(iso: string) {
  try {
    const d = new Date(iso);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    if (d.toDateString() === ayer.toDateString()) {
      return "Ayer " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function NotificacionesCard({ className = "", maxItems = 10 }: NotificacionesCardProps) {
  const { user } = useAuth();
  const {
    notificaciones,
    loading,
    noLeidas,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones(user?.id, maxItems);

  if (!user) return null;

  return (
    <div
      className={`rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--foreground)]/80">
          Notificaciones
          {noLeidas > 0 && (
            <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
              {noLeidas}
            </span>
          )}
        </h2>
        {noLeidas > 0 && (
          <button
            type="button"
            onClick={marcarTodasLeidas}
            className="text-xs underline hover:no-underline text-[var(--foreground)]/60"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--foreground)]/60">Cargando notificaciones…</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-sm text-[var(--foreground)]/60">No hay notificaciones.</p>
      ) : (
        <ul className="space-y-2">
          {notificaciones.slice(0, maxItems).map((n) => (
            <li
              key={n.id}
              className={`rounded border border-[var(--foreground)]/5 p-2 text-sm ${
                !n.leida ? "bg-blue-500/5" : ""
              }`}
            >
              <div className="flex justify-between gap-2">
                <p className="flex-1 text-[var(--foreground)]/90">{n.contenido}</p>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-xs text-[var(--foreground)]/50">
                    {formatFecha(n.created_at)}
                  </span>
                  {!n.leida && (
                    <button
                      type="button"
                      onClick={() => marcarLeida(n.id)}
                      className="text-xs underline hover:no-underline text-[var(--foreground)]/60"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
