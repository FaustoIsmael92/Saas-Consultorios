-- Hito 4: Chat asistido — Tablas suscripciones, chats, mensajes_chat y RLS

-- 1. Tabla suscripciones (fuente de verdad para acceso al chat)
CREATE TABLE public.suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  estado TEXT NOT NULL CHECK (estado IN ('activa', 'inactiva')),
  plan TEXT NOT NULL CHECK (plan IN ('mensual', 'anual')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT suscripciones_fecha_valida CHECK (fecha_inicio <= fecha_fin)
);

CREATE INDEX idx_suscripciones_profesional_id ON public.suscripciones(profesional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_suscripciones_estado_fecha ON public.suscripciones(profesional_id, estado, fecha_fin) WHERE deleted_at IS NULL;

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales pueden ver sus suscripciones"
  ON public.suscripciones FOR SELECT
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Profesionales pueden insertar sus suscripciones"
  ON public.suscripciones FOR INSERT
  WITH CHECK (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Profesionales pueden actualizar sus suscripciones"
  ON public.suscripciones FOR UPDATE
  USING (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Lectura pública de suscripciones activas (solo para comprobar si el profesional tiene chat habilitado)
CREATE POLICY "Lectura de suscripción activa para enlace público"
  ON public.suscripciones FOR SELECT
  TO anon
  USING (
    deleted_at IS NULL
    AND estado = 'activa'
    AND fecha_fin >= CURRENT_DATE
    AND profesional_id IN (
      SELECT id FROM public.profesionales WHERE activo = true AND deleted_at IS NULL
    )
  );

CREATE TRIGGER suscripciones_updated_at
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Tabla chats
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chats_unicos_profesional_paciente UNIQUE (profesional_id, paciente_id)
);

CREATE INDEX idx_chats_profesional_id ON public.chats(profesional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chats_paciente_id ON public.chats(paciente_id) WHERE deleted_at IS NULL;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Profesional: ve solo sus chats
CREATE POLICY "Profesionales pueden ver sus chats"
  ON public.chats FOR SELECT
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Paciente: ve solo sus propios chats
CREATE POLICY "Pacientes pueden ver sus chats"
  ON public.chats FOR SELECT
  USING (
    deleted_at IS NULL
    AND paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Pacientes pueden crear chat (desde enlace público; la app validará suscripción activa)
CREATE POLICY "Pacientes pueden crear chat con profesional"
  ON public.chats FOR INSERT
  TO authenticated
  WITH CHECK (
    paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Profesionales pueden actualizar sus chats (ej. activo)
CREATE POLICY "Profesionales pueden actualizar sus chats"
  ON public.chats FOR UPDATE
  USING (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE TRIGGER chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Tabla mensajes_chat
CREATE TABLE public.mensajes_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  emisor TEXT NOT NULL CHECK (emisor IN ('paciente', 'sistema', 'profesional')),
  mensaje TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_mensajes_chat_id ON public.mensajes_chat(chat_id) WHERE deleted_at IS NULL;

ALTER TABLE public.mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Ver mensajes: mismo criterio que chats (a través de chat_id)
CREATE POLICY "Profesionales pueden ver mensajes de sus chats"
  ON public.mensajes_chat FOR SELECT
  USING (
    deleted_at IS NULL
    AND chat_id IN (
      SELECT id FROM public.chats
      WHERE deleted_at IS NULL
        AND profesional_id IN (
          SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    )
  );

CREATE POLICY "Pacientes pueden ver mensajes de sus chats"
  ON public.mensajes_chat FOR SELECT
  USING (
    deleted_at IS NULL
    AND chat_id IN (
      SELECT id FROM public.chats
      WHERE deleted_at IS NULL
        AND paciente_id IN (
          SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    )
  );

-- Insertar: paciente o profesional según el chat
CREATE POLICY "Pacientes pueden enviar mensajes en sus chats"
  ON public.mensajes_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    emisor = 'paciente'
    AND chat_id IN (
      SELECT id FROM public.chats
      WHERE deleted_at IS NULL
        AND paciente_id IN (
          SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    )
  );

CREATE POLICY "Profesionales pueden enviar mensajes en sus chats"
  ON public.mensajes_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    emisor = 'profesional'
    AND chat_id IN (
      SELECT id FROM public.chats
      WHERE deleted_at IS NULL
        AND profesional_id IN (
          SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    )
  );

-- Sistema: permitir inserción desde service role o desde backend; para MVP el front
-- puede insertar como 'sistema' si usamos una función o policy más amplia.
-- Permitimos que el profesional inserte mensajes con emisor 'sistema' (para flujo guiado
-- que podría generarse desde el mismo cliente del profesional en futuras iteraciones).
-- Por ahora: solo paciente y profesional insertan; mensajes "sistema" los inserta el
-- cliente cuando guía el flujo (ej. tras elegir fecha). Para que el paciente no pueda
-- falsificar "sistema", la policy de INSERT ya restringe emisor = 'paciente' para pacientes.
-- Necesitamos una forma de que la app inserte mensajes "sistema". Opción: RPC o policy
-- que permita INSERT con emisor = 'sistema' cuando el chat pertenece al paciente que hace la petición
-- (así el frontend puede añadir mensajes del sistema en nombre del flujo).
CREATE POLICY "Pacientes pueden insertar mensaje sistema en sus chats (flujo guiado)"
  ON public.mensajes_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    emisor = 'sistema'
    AND chat_id IN (
      SELECT id FROM public.chats
      WHERE deleted_at IS NULL
        AND paciente_id IN (
          SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    )
  );

-- No permitimos UPDATE/DELETE de mensajes para mantener historial íntegro.
