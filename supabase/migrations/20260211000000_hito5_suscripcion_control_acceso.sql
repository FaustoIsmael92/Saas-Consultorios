-- Hito 5: Suscripción y control de acceso
-- 1:1 profesional-suscripción, creación automática, RLS que bloquea chat sin suscripción activa,
-- y solo service role puede cambiar estado (activar/desactivar).

-- 1. Garantizar una suscripción por profesional (backfill y UNIQUE)

-- Backfill: crear suscripción inactiva para profesionales que no tienen ninguna
INSERT INTO public.suscripciones (profesional_id, estado, plan, fecha_inicio, fecha_fin)
SELECT p.id, 'inactiva', 'mensual', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'
FROM public.profesionales p
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.suscripciones s
    WHERE s.profesional_id = p.id AND s.deleted_at IS NULL
  );

-- Si hubiera duplicados (varios registros por profesional), conservar uno y marcar el resto
WITH ranked AS (
  SELECT id, profesional_id,
         ROW_NUMBER() OVER (PARTITION BY profesional_id ORDER BY updated_at DESC NULLS LAST) AS rn
  FROM public.suscripciones
  WHERE deleted_at IS NULL
)
UPDATE public.suscripciones s
SET deleted_at = now()
FROM ranked r
WHERE s.id = r.id AND r.rn > 1;

-- Índice único 1:1 (una suscripción vigente por profesional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_suscripciones_profesional_uno
  ON public.suscripciones(profesional_id) WHERE deleted_at IS NULL;

-- 2. Trigger: crear suscripción al dar de alta un profesional
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_especialidad TEXT;
  v_slug TEXT;
  v_prof_id UUID;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'paciente');
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_especialidad := NEW.raw_user_meta_data->>'especialidad';

  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (NEW.id, v_role, NULLIF(TRIM(v_full_name), ''));

  IF v_role = 'paciente' THEN
    INSERT INTO public.pacientes (user_id, nombre)
    VALUES (NEW.id, NULLIF(TRIM(v_full_name), ''));
  ELSIF v_role = 'profesional' THEN
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(NULLIF(TRIM(v_full_name), ''), 'profesional'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
    IF v_slug = '' THEN v_slug := 'profesional'; END IF;
    v_slug := v_slug || '-' || SUBSTR(MD5(NEW.id::text || clock_timestamp()::text), 1, 8);

    INSERT INTO public.profesionales (user_id, nombre, especialidad, slug)
    VALUES (NEW.id, NULLIF(TRIM(v_full_name), ''), NULLIF(TRIM(v_especialidad), ''), v_slug)
    RETURNING id INTO v_prof_id;

    INSERT INTO public.suscripciones (profesional_id, estado, plan, fecha_inicio, fecha_fin)
    VALUES (v_prof_id, 'inactiva', 'mensual', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year');
  END IF;

  RETURN NEW;
END;
$$;

-- 3. RLS: el profesional solo puede leer su suscripción (no modificarla)
DROP POLICY IF EXISTS "Profesionales pueden actualizar sus suscripciones" ON public.suscripciones;
DROP POLICY IF EXISTS "Profesionales pueden insertar sus suscripciones" ON public.suscripciones;

-- La inserción de suscripciones queda solo por trigger y service role; los profesionales no insertan.

-- 4. Chats: solo se puede crear un chat si el profesional tiene suscripción activa
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

-- 5. Mensajes: el profesional solo puede enviar mensajes si tiene suscripción activa
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
