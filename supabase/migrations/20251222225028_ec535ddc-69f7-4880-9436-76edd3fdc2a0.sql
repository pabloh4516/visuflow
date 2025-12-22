-- Fix search_path on functions to address security warnings
CREATE OR REPLACE FUNCTION public.generate_short_id(length INTEGER DEFAULT 8)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_short_id_pages()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_short_id TEXT;
  attempts INTEGER := 0;
BEGIN
  IF NEW.short_id IS NULL THEN
    LOOP
      new_short_id := public.generate_short_id(8);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.generated_pages WHERE short_id = new_short_id);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique short_id after 10 attempts';
      END IF;
    END LOOP;
    NEW.short_id := new_short_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_short_id_cloaking()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_short_id TEXT;
  attempts INTEGER := 0;
BEGIN
  IF NEW.short_id IS NULL THEN
    LOOP
      new_short_id := public.generate_short_id(8);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.cloaking_configs WHERE short_id = new_short_id);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique short_id after 10 attempts';
      END IF;
    END LOOP;
    NEW.short_id := new_short_id;
  END IF;
  RETURN NEW;
END;
$$;