-- Hito 3 (fix): Permitir que usuarios autenticados lean disponibilidad, bloqueos y citas
-- para el cálculo de slots en el enlace público. Sin esto, un paciente logueado ve
-- "No hay horarios disponibles" porque las políticas de lectura solo aplicaban a anon.

CREATE POLICY "Lectura pública de disponibilidad para enlace (authenticated)"
  ON public.disponibilidad FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );

CREATE POLICY "Lectura pública de bloqueos para enlace (authenticated)"
  ON public.bloqueos_agenda FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );

CREATE POLICY "Lectura pública de citas para enlace slots (authenticated)"
  ON public.citas FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND profesional_id IN (
      SELECT id FROM public.profesionales
      WHERE activo = true AND deleted_at IS NULL
    )
  );
