-- Hito 3 (fix): Permitir que usuarios autenticados lean profesionales activos en el enlace público.
-- La política existente "Lectura pública de profesionales activos por enlace" solo aplica a TO anon.
-- Si el usuario entra al enlace /[slug] con sesión (paciente o profesional), el cliente usa JWT
-- authenticated y no podía ver el profesional → "Enlace no encontrado".

CREATE POLICY "Lectura pública de profesionales activos (authenticated)"
  ON public.profesionales FOR SELECT
  TO authenticated
  USING (activo = true AND deleted_at IS NULL);
