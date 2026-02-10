-- Hito 3: Enlace público del profesional
-- Políticas RLS para:
-- 1) Lectura pública de profesional por slug (solo datos básicos)
-- 2) Lectura pública de disponibilidad, bloqueos y citas para cálculo de slots
-- 3) Inserción de citas por pacientes autenticados

-- 1. Profesionales: lectura pública para filas activas (el cliente filtra por slug)
CREATE POLICY "Lectura pública de profesionales activos por enlace"
  ON public.profesionales FOR SELECT
  TO anon
  USING (activo = true AND deleted_at IS NULL);

-- 2. Disponibilidad: lectura pública solo para profesionales activos (cálculo de slots)
CREATE POLICY "Lectura pública de disponibilidad para enlace"
  ON public.disponibilidad FOR SELECT
  TO anon
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );

-- 3. Bloqueos: lectura pública solo para profesionales activos
CREATE POLICY "Lectura pública de bloqueos para enlace"
  ON public.bloqueos_agenda FOR SELECT
  TO anon
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );

-- 4. Citas: lectura pública solo para profesionales activos (solapamientos/slots)
CREATE POLICY "Lectura pública de citas para enlace (slots)"
  ON public.citas FOR SELECT
  TO anon
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );

-- 5. Citas: pacientes pueden crear citas (desde el enlace público)
CREATE POLICY "Pacientes pueden crear sus propias citas"
  ON public.citas FOR INSERT
  TO authenticated
  WITH CHECK (
    paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );
