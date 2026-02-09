-- Tabla de perfiles (1:1 con auth.users). Rol y datos básicos.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('profesional', 'paciente')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Solo leer y actualizar el propio perfil
CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir insertar solo el propio perfil (para registro)
CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
