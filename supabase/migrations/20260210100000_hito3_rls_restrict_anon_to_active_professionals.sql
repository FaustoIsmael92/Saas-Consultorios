-- Hito 3 (fix): Restringir lectura anónima solo a datos de profesionales activos.
-- Evita que un usuario anónimo consulte directamente la BD y obtenga horarios/citas
-- de todos los profesionales; solo puede ver datos de profesionales con activo = true.

DROP POLICY IF EXISTS "Lectura pública de disponibilidad para enlace" ON public.disponibilidad;
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

DROP POLICY IF EXISTS "Lectura pública de bloqueos para enlace" ON public.bloqueos_agenda;
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

DROP POLICY IF EXISTS "Lectura pública de citas para enlace (slots)" ON public.citas;
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
