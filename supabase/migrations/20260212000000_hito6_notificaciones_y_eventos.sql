-- Hito 6: Notificaciones internas y métricas (event tracking)

-- 1. Tabla notificaciones (destinatario por user_id; opcional profesional_id/paciente_id para contexto)
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profesional_id UUID REFERENCES public.profesionales(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notificaciones_user_id ON public.notificaciones(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(user_id, leida) WHERE deleted_at IS NULL;
CREATE INDEX idx_notificaciones_created_at ON public.notificaciones(user_id, created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- El usuario solo ve sus propias notificaciones
CREATE POLICY "Usuarios ven solo sus notificaciones"
  ON public.notificaciones FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Usuarios pueden marcar sus notificaciones como leídas"
  ON public.notificaciones FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT se hace desde funciones SECURITY DEFINER (triggers) o desde app para el propio user_id
CREATE POLICY "Usuarios no insertan notificaciones directamente"
  ON public.notificaciones FOR INSERT
  WITH CHECK (false);

-- Permitir que las funciones definer inserten (policy con WITH CHECK (true) no aplica a definer).
-- En Postgres, el propietario de la tabla y las funciones definer pueden bypassear RLS si se usa
-- SET row_security = off en la función, o insertamos desde una función que pertenece al mismo owner.
-- La forma más limpia: función SECURITY DEFINER que hace INSERT; el trigger corre con el rol del
-- usuario que hace la operación, así que la función definer se ejecuta con permisos del owner (postgres/supabase)
-- y puede insertar en notificaciones. Necesitamos que la policy permita INSERT cuando es desde una función.
-- En Supabase, las funciones creadas son del owner (postgres). Por defecto RLS aplica a todos.
-- Solución: no tener policy INSERT para notificaciones con CHECK (false) — entonces nadie puede insertar desde el cliente.
-- La función definer corre con el rol del definer (postgres), y en RLS por defecto el table owner bypasses RLS... 
-- No: en Postgres the table owner does NOT bypass RLS by default. So we need to either:
-- 1) Use a policy that allows insert when ... but we can't distinguish "from trigger". 
-- 2) Grant the function to a role that bypasses RLS - not standard.
-- 3) In the SECURITY DEFINER function, use a different approach: the function runs as the owner of the function (the user who created it). So the function runs as postgres (or supabase_admin). In Supabase, typically the migration runs as postgres. So the function owner is postgres. When the function is invoked, it runs with postgres privileges. And in Supabase, the postgres role might have BYPASSRLS. Let me check - actually in Supabase, the "postgres" role (and often the role that runs migrations) has BYPASSRLS. So when we CREATE FUNCTION ... SECURITY DEFINER, the owner is the current user in the migration (e.g. postgres). When the trigger invokes it, it runs as postgres and bypasses RLS. So we're good: no INSERT policy for normal users (or CHECK false), and the trigger function runs as definer (postgres) and bypasses RLS. So I'll keep the INSERT policy as WITH CHECK (false) so no client can insert. The definer function will bypass RLS.

-- 2. Tabla eventos_sistema (métricas; append-only)
CREATE TABLE public.eventos_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento TEXT NOT NULL CHECK (evento IN (
    'cita_creada_formulario',
    'cita_creada_chat',
    'suscripcion_activada',
    'cita_cancelada'
  )),
  profesional_id UUID REFERENCES public.profesionales(id) ON DELETE SET NULL,
  entidad_tipo TEXT,
  entidad_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eventos_sistema_evento ON public.eventos_sistema(evento);
CREATE INDEX idx_eventos_sistema_profesional_id ON public.eventos_sistema(profesional_id);
CREATE INDEX idx_eventos_sistema_created_at ON public.eventos_sistema(created_at);

ALTER TABLE public.eventos_sistema ENABLE ROW LEVEL SECURITY;

-- Profesional solo ve eventos de su profesional_id
CREATE POLICY "Profesionales ven solo sus eventos"
  ON public.eventos_sistema FOR SELECT
  USING (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- No permitir INSERT desde cliente; solo desde funciones definer (triggers / backend)
CREATE POLICY "No insert desde cliente en eventos_sistema"
  ON public.eventos_sistema FOR INSERT
  WITH CHECK (false);

-- 3. Función SECURITY DEFINER: crear notificación y evento (cita nueva)
CREATE OR REPLACE FUNCTION public.hito6_notif_y_evento_cita_creada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id_prof UUID;
  v_origen TEXT;
  v_evento TEXT;
  v_contenido TEXT;
  v_paciente_nombre TEXT;
BEGIN
  SELECT user_id INTO v_user_id_prof
  FROM public.profesionales
  WHERE id = NEW.profesional_id AND deleted_at IS NULL;

  IF v_user_id_prof IS NULL THEN
    RETURN NEW;
  END IF;

  v_origen := COALESCE(NEW.origen::TEXT, 'formulario');
  v_evento := CASE WHEN v_origen = 'chat' THEN 'cita_creada_chat' ELSE 'cita_creada_formulario' END;

  SELECT nombre INTO v_paciente_nombre
  FROM public.pacientes
  WHERE id = NEW.paciente_id AND deleted_at IS NULL;

  v_contenido := 'Nueva cita agendada'
    || COALESCE(' con ' || v_paciente_nombre, '')
    || ' para ' || to_char(NEW.inicio AT TIME ZONE 'UTC', 'DD/MM/YYYY HH24:MI') || ' UTC.'
    || ' Origen: ' || v_origen || '.';

  INSERT INTO public.notificaciones (user_id, profesional_id, paciente_id, tipo, contenido, leida)
  VALUES (v_user_id_prof, NEW.profesional_id, NEW.paciente_id, 'cita_nueva', v_contenido, false);

  INSERT INTO public.eventos_sistema (evento, profesional_id, entidad_tipo, entidad_id, metadata)
  VALUES (
    v_evento,
    NEW.profesional_id,
    'citas',
    NEW.id,
    jsonb_build_object(
      'paciente_id', NEW.paciente_id,
      'inicio', NEW.inicio,
      'origen', v_origen
    )
  );

  RETURN NEW;
END;
$$;

-- 4. Función SECURITY DEFINER: cita cancelada
CREATE OR REPLACE FUNCTION public.hito6_notif_y_evento_cita_cancelada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id_prof UUID;
  v_contenido TEXT;
  v_paciente_nombre TEXT;
BEGIN
  IF NEW.estado <> 'cancelada' OR OLD.estado = 'cancelada' THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id_prof
  FROM public.profesionales
  WHERE id = NEW.profesional_id AND deleted_at IS NULL;

  IF v_user_id_prof IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT nombre INTO v_paciente_nombre
  FROM public.pacientes
  WHERE id = NEW.paciente_id AND deleted_at IS NULL;

  v_contenido := 'Cita cancelada'
    || COALESCE(' (' || v_paciente_nombre || ')', '')
    || ' que era para ' || to_char(NEW.inicio AT TIME ZONE 'UTC', 'DD/MM/YYYY HH24:MI') || ' UTC.';

  INSERT INTO public.notificaciones (user_id, profesional_id, paciente_id, tipo, contenido, leida)
  VALUES (v_user_id_prof, NEW.profesional_id, NEW.paciente_id, 'cita_cancelada', v_contenido, false);

  INSERT INTO public.eventos_sistema (evento, profesional_id, entidad_tipo, entidad_id, metadata)
  VALUES (
    'cita_cancelada',
    NEW.profesional_id,
    'citas',
    NEW.id,
    jsonb_build_object('paciente_id', NEW.paciente_id, 'inicio', NEW.inicio)
  );

  RETURN NEW;
END;
$$;

-- 5. Función SECURITY DEFINER: suscripción activada
CREATE OR REPLACE FUNCTION public.hito6_notif_y_evento_suscripcion_activada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id_prof UUID;
  v_contenido TEXT;
BEGIN
  IF NEW.estado <> 'activa' OR (OLD.estado = 'activa' AND OLD.estado IS NOT NULL) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id_prof
  FROM public.profesionales
  WHERE id = NEW.profesional_id AND deleted_at IS NULL;

  IF v_user_id_prof IS NULL THEN
    RETURN NEW;
  END IF;

  v_contenido := 'Tu suscripción está activa. Plan: ' || COALESCE(NEW.plan, 'N/A')
    || '. Válida hasta ' || to_char(NEW.fecha_fin, 'DD/MM/YYYY') || '.';

  INSERT INTO public.notificaciones (user_id, profesional_id, tipo, contenido, leida)
  VALUES (v_user_id_prof, NEW.profesional_id, 'suscripcion_activada', v_contenido, false);

  INSERT INTO public.eventos_sistema (evento, profesional_id, entidad_tipo, entidad_id, metadata)
  VALUES (
    'suscripcion_activada',
    NEW.profesional_id,
    'suscripciones',
    NEW.id,
    jsonb_build_object('plan', NEW.plan, 'fecha_fin', NEW.fecha_fin)
  );

  RETURN NEW;
END;
$$;

-- 6. Triggers
CREATE TRIGGER hito6_after_cita_insert
  AFTER INSERT ON public.citas
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION public.hito6_notif_y_evento_cita_creada();

CREATE TRIGGER hito6_after_cita_update_cancelada
  AFTER UPDATE ON public.citas
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM 'cancelada' AND NEW.estado = 'cancelada' AND NEW.deleted_at IS NULL)
  EXECUTE FUNCTION public.hito6_notif_y_evento_cita_cancelada();

CREATE TRIGGER hito6_after_suscripcion_activada
  AFTER UPDATE ON public.suscripciones
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM 'activa' AND NEW.estado = 'activa' AND NEW.deleted_at IS NULL)
  EXECUTE FUNCTION public.hito6_notif_y_evento_suscripcion_activada();
