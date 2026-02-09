-- Tabla profesionales (según modelo de datos del MVP)
CREATE TABLE public.profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  especialidad TEXT,
  slug TEXT NOT NULL,
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(slug)
);

CREATE UNIQUE INDEX idx_profesionales_user_id ON public.profesionales(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profesionales_slug ON public.profesionales(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_profesionales_deleted_at ON public.profesionales(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.profesionales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales pueden leer su propio registro"
  ON public.profesionales FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Profesionales pueden insertar su propio registro"
  ON public.profesionales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profesionales pueden actualizar su propio registro"
  ON public.profesionales FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Hito 3: se podrá añadir política de lectura pública por slug para el enlace del profesional.

CREATE TRIGGER profesionales_updated_at
  BEFORE UPDATE ON public.profesionales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla pacientes (según modelo de datos del MVP)
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_pacientes_user_id ON public.pacientes(user_id);
CREATE INDEX idx_pacientes_deleted_at ON public.pacientes(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes pueden leer su propio registro"
  ON public.pacientes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Pacientes pueden insertar su propio registro"
  ON public.pacientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pacientes pueden actualizar su propio registro"
  ON public.pacientes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
