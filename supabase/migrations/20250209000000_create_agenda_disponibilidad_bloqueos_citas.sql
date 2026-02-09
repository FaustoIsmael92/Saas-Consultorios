-- Hito 2: Agenda núcleo - Disponibilidad, bloqueos y citas

-- Zona horaria para disponibilidad (configurada por profesional)
ALTER TABLE public.profesionales ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Mexico_City';

-- 1. Tabla disponibilidad (configuración base de horarios del profesional)
CREATE TABLE public.disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_cita_min INTEGER NOT NULL DEFAULT 30 CHECK (duracion_cita_min > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT disponibilidad_hora_valida CHECK (hora_inicio < hora_fin)
);

CREATE INDEX idx_disponibilidad_profesional_id ON public.disponibilidad(profesional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_disponibilidad_dia_semana ON public.disponibilidad(dia_semana) WHERE deleted_at IS NULL;

ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales pueden gestionar su propia disponibilidad"
  ON public.disponibilidad FOR ALL
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

CREATE TRIGGER disponibilidad_updated_at
  BEFORE UPDATE ON public.disponibilidad
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Tabla bloqueos_agenda (días u horarios bloqueados)
CREATE TABLE public.bloqueos_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT bloqueos_fecha_valida CHECK (fecha_inicio < fecha_fin)
);

CREATE INDEX idx_bloqueos_profesional_id ON public.bloqueos_agenda(profesional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bloqueos_fecha_inicio ON public.bloqueos_agenda(fecha_inicio) WHERE deleted_at IS NULL;
CREATE INDEX idx_bloqueos_rango ON public.bloqueos_agenda(profesional_id, fecha_inicio, fecha_fin) WHERE deleted_at IS NULL;

ALTER TABLE public.bloqueos_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales pueden gestionar sus bloqueos"
  ON public.bloqueos_agenda FOR ALL
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

CREATE TRIGGER bloqueos_agenda_updated_at
  BEFORE UPDATE ON public.bloqueos_agenda
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Tabla citas
CREATE TYPE estado_cita AS ENUM ('programada', 'cancelada', 'completada');
CREATE TYPE origen_cita AS ENUM ('formulario', 'chat');

CREATE TABLE public.citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  estado estado_cita NOT NULL DEFAULT 'programada',
  origen origen_cita NOT NULL DEFAULT 'formulario',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT citas_fecha_valida CHECK (inicio < fin)
);

CREATE INDEX idx_citas_profesional_id ON public.citas(profesional_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_citas_paciente_id ON public.citas(paciente_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_citas_inicio ON public.citas(inicio) WHERE deleted_at IS NULL;
CREATE INDEX idx_citas_profesional_rango ON public.citas(profesional_id, inicio, fin) WHERE deleted_at IS NULL;

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para citas
-- Profesional: ve y gestiona sus citas
CREATE POLICY "Profesionales pueden ver sus citas"
  ON public.citas FOR SELECT
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Profesionales pueden crear citas"
  ON public.citas FOR INSERT
  WITH CHECK (
    profesional_id IN (
      SELECT id FROM public.profesionales WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Profesionales pueden actualizar sus citas"
  ON public.citas FOR UPDATE
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

-- Paciente: solo ve sus propias citas (read-only para el paciente en este hito)
CREATE POLICY "Pacientes pueden ver sus propias citas"
  ON public.citas FOR SELECT
  USING (
    deleted_at IS NULL
    AND paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Para que el paciente pueda crear citas desde el enlace público (hito 3), 
-- se añadirá política posterior. Por ahora el profesional crea las citas.

CREATE TRIGGER citas_updated_at
  BEFORE UPDATE ON public.citas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Función de validación: no-overbooking y dentro de disponibilidad
CREATE OR REPLACE FUNCTION public.validate_cita_slot()
RETURNS TRIGGER AS $$
DECLARE
  v_tz TEXT;
  v_dia_semana SMALLINT;
  v_hora_inicio TIME;
  v_hora_fin TIME;
  v_disponible BOOLEAN := false;
  v_overlap_count INTEGER;
  v_blocked_count INTEGER;
BEGIN
  -- Solo validar citas activas (programada o completada)
  IF NEW.estado = 'cancelada' THEN
    RETURN NEW;
  END IF;

  -- 1. No-overbooking: ninguna otra cita activa en el mismo horario para el mismo profesional
  SELECT COUNT(*) INTO v_overlap_count
  FROM public.citas c
  WHERE c.profesional_id = NEW.profesional_id
    AND c.deleted_at IS NULL
    AND c.estado IN ('programada', 'completada')
    AND c.id IS DISTINCT FROM COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND tstzrange(c.inicio, c.fin) && tstzrange(NEW.inicio, NEW.fin);

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Overbooking: ya existe una cita en ese horario';
  END IF;

  -- 2. El slot debe estar dentro de la disponibilidad del profesional (en zona horaria del profesional)
  SELECT COALESCE(p.timezone, 'America/Mexico_City') INTO v_tz
  FROM public.profesionales p WHERE p.id = NEW.profesional_id AND p.deleted_at IS NULL;

  v_dia_semana := EXTRACT(DOW FROM (NEW.inicio AT TIME ZONE v_tz))::SMALLINT;
  -- PostgreSQL DOW: 0=domingo, 1=lunes... 6=sábado. Ajustamos a 0-6 (lun=0, dom=6)
  v_dia_semana := CASE WHEN v_dia_semana = 0 THEN 6 ELSE v_dia_semana - 1 END;
  v_hora_inicio := (NEW.inicio AT TIME ZONE v_tz)::TIME;
  v_hora_fin := (NEW.fin AT TIME ZONE v_tz)::TIME;

  SELECT EXISTS (
    SELECT 1 FROM public.disponibilidad d
    WHERE d.profesional_id = NEW.profesional_id
      AND d.deleted_at IS NULL
      AND d.dia_semana = v_dia_semana
      AND d.hora_inicio <= v_hora_inicio
      AND d.hora_fin >= v_hora_fin
      AND (v_hora_fin - v_hora_inicio) >= (d.duracion_cita_min || ' minutes')::INTERVAL
  ) INTO v_disponible;

  IF NOT v_disponible THEN
    RAISE EXCEPTION 'El horario no está dentro de la disponibilidad configurada';
  END IF;

  -- 3. No debe solaparse con bloqueos
  SELECT COUNT(*) INTO v_blocked_count
  FROM public.bloqueos_agenda b
  WHERE b.profesional_id = NEW.profesional_id
    AND b.deleted_at IS NULL
    AND tstzrange(b.fecha_inicio, b.fecha_fin) && tstzrange(NEW.inicio, NEW.fin);

  IF v_blocked_count > 0 THEN
    RAISE EXCEPTION 'El horario está bloqueado';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_cita_before_insert_update
  BEFORE INSERT OR UPDATE ON public.citas
  FOR EACH ROW EXECUTE FUNCTION public.validate_cita_slot();

-- Política para que profesionales puedan leer pacientes (para seleccionar al crear cita)
CREATE POLICY "Profesionales pueden leer pacientes"
  ON public.pacientes FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profesionales pr
      WHERE pr.user_id = auth.uid() AND pr.deleted_at IS NULL
    )
  );
