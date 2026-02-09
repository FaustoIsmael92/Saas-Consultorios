-- Trigger: crea perfil, paciente o profesional automáticamente cuando se registra un usuario
-- Evita errores de RLS (auth.uid() puede ser null justo tras signUp)
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
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'paciente');
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_especialidad := NEW.raw_user_meta_data->>'especialidad';

  -- Crear perfil
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (NEW.id, v_role, NULLIF(TRIM(v_full_name), ''));

  IF v_role = 'paciente' THEN
    INSERT INTO public.pacientes (user_id, nombre)
    VALUES (NEW.id, NULLIF(TRIM(v_full_name), ''));
  ELSIF v_role = 'profesional' THEN
    -- Generar slug único: base-normalizada + sufijo aleatorio
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(NULLIF(TRIM(v_full_name), ''), 'profesional'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
    IF v_slug = '' THEN v_slug := 'profesional'; END IF;
    v_slug := v_slug || '-' || SUBSTR(MD5(NEW.id::text || clock_timestamp()::text), 1, 8);

    INSERT INTO public.profesionales (user_id, nombre, especialidad, slug)
    VALUES (NEW.id, NULLIF(TRIM(v_full_name), ''), NULLIF(TRIM(v_especialidad), ''), v_slug);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
