drop extension if exists "pg_net";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(NULLIF(TRIM(v_full_name), ''), 'profesional'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
    IF v_slug = '' THEN v_slug := 'profesional'; END IF;
    v_slug := v_slug || '-' || SUBSTR(MD5(NEW.id::text || clock_timestamp()::text), 1, 8);

    INSERT INTO public.profesionales (user_id, nombre, especialidad, slug)
    VALUES (NEW.id, NULLIF(TRIM(v_full_name), ''), NULLIF(TRIM(v_especialidad), ''), v_slug);
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


