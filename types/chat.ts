export type EmisorMensaje = "paciente" | "sistema" | "profesional";

export interface Chat {
  id: string;
  profesional_id: string;
  paciente_id: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MensajeChat {
  id: string;
  chat_id: string;
  emisor: EmisorMensaje;
  mensaje: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ChatConDetalles extends Chat {
  profesional?: { nombre: string | null; especialidad: string | null } | null;
  paciente?: { nombre: string | null } | null;
}

/** Pasos del flujo conversacional para agendar por chat */
export type PasoFlujoChat =
  | "inicio"
  | "elegir_fecha"
  | "mostrar_slots"
  | "confirmar_slot"
  | "cita_creada"
  | "error";
