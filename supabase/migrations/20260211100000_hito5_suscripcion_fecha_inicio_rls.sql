-- Hito 5 (fix): RLS de suscripción debe exigir también fecha_inicio <= CURRENT_DATE
-- para que suscripciones con inicio futuro no se consideren activas.

DROP POLICY IF EXISTS "Pacientes pueden crear chat con profesional" ON public.chats;
CREATE POLICY "Pacientes pueden crear chat con profesional"
  ON public.chats FOR INSERT
  TO authenticated
  WITH CHECK (
    paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.suscripciones s
      WHERE s.profesional_id = chats.profesional_id
        AND s.estado = 'activa'
        AND s.deleted_at IS NULL
        AND s.fecha_inicio <= CURRENT_DATE
        AND s.fecha_fin >= CURRENT_DATE
    )
  );

DROP POLICY IF EXISTS "Profesionales pueden enviar mensajes en sus chats" ON public.mensajes_chat;
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
    AND EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.suscripciones s ON s.profesional_id = c.profesional_id
        AND s.deleted_at IS NULL AND s.estado = 'activa'
        AND s.fecha_inicio <= CURRENT_DATE AND s.fecha_fin >= CURRENT_DATE
      WHERE c.id = mensajes_chat.chat_id
    )
  );
