export type TipoNotificacion =
  | "cita_nueva"
  | "cita_cancelada"
  | "suscripcion_activada";

export interface Notificacion {
  id: string;
  user_id: string;
  profesional_id: string | null;
  paciente_id: string | null;
  tipo: TipoNotificacion | string;
  contenido: string;
  leida: boolean;
  created_at: string;
  deleted_at: string | null;
}

export type EventoSistemaTipo =
  | "cita_creada_formulario"
  | "cita_creada_chat"
  | "suscripcion_activada"
  | "cita_cancelada";

export interface EventoSistema {
  id: string;
  evento: EventoSistemaTipo;
  profesional_id: string | null;
  entidad_tipo: string | null;
  entidad_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ResumenMetricas {
  citasFormulario: number;
  citasChat: number;
  citasCanceladas: number;
  suscripcionesActivadas: number;
  tieneSuscripcionActiva: boolean;
}
