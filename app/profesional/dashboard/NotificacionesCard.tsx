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
      className={`rounded-xl border border-slate-600/40 bg-slate-800/80 p-4 shadow-lg shadow-black/20 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">
          Notificaciones
          {noLeidas > 0 && (
            <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
              {noLeidas}
            </span>
          )}
        </h2>
        {noLeidas > 0 && (
          <button
            type="button"
            onClick={marcarTodasLeidas}
            className="text-xs text-blue-500 hover:text-blue-400 hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Cargando notificaciones…</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay notificaciones.</p>
      ) : (
        <ul className="space-y-2">
          {notificaciones.slice(0, maxItems).map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border border-slate-600/40 p-2 text-sm ${
                !n.leida ? "bg-blue-500/10" : "bg-slate-900/50"
              }`}
            >
              <div className="flex justify-between gap-2">
                <p className="flex-1 text-zinc-100">{n.contenido}</p>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-xs text-zinc-500">
                    {formatFecha(n.created_at)}
                  </span>
                  {!n.leida && (
                    <button
                      type="button"
                      onClick={() => marcarLeida(n.id)}
                      className="text-xs text-blue-500 hover:text-blue-400 hover:underline"
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
