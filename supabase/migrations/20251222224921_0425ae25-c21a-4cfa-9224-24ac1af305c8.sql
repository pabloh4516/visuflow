-- Add slug and short_id columns to generated_pages
ALTER TABLE public.generated_pages 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS short_id VARCHAR(8);

-- Add slug and short_id columns to cloaking_configs
ALTER TABLE public.cloaking_configs 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS short_id VARCHAR(8);

-- Create unique indexes for slug (per user) and short_id (global)
CREATE UNIQUE INDEX IF NOT EXISTS idx_generated_pages_slug_user 
ON public.generated_pages (user_id, slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_generated_pages_short_id 
ON public.generated_pages (short_id) WHERE short_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cloaking_configs_slug_user 
ON public.cloaking_configs (user_id, slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cloaking_configs_short_id 
ON public.cloaking_configs (short_id) WHERE short_id IS NOT NULL;

-- Function to generate random short_id
CREATE OR REPLACE FUNCTION public.generate_short_id(length INTEGER DEFAULT 8)
RETURNS TEXT
LANGUAGE plpgsql
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

-- Trigger function for generated_pages
CREATE OR REPLACE FUNCTION public.set_short_id_pages()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Trigger function for cloaking_configs
CREATE OR REPLACE FUNCTION public.set_short_id_cloaking()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_short_id_pages ON public.generated_pages;
CREATE TRIGGER trigger_set_short_id_pages
BEFORE INSERT ON public.generated_pages
FOR EACH ROW
EXECUTE FUNCTION public.set_short_id_pages();

DROP TRIGGER IF EXISTS trigger_set_short_id_cloaking ON public.cloaking_configs;
CREATE TRIGGER trigger_set_short_id_cloaking
BEFORE INSERT ON public.cloaking_configs
FOR EACH ROW
EXECUTE FUNCTION public.set_short_id_cloaking();

-- Generate short_ids for existing records that don't have one
UPDATE public.generated_pages 
SET short_id = public.generate_short_id(8) 
WHERE short_id IS NULL;

UPDATE public.cloaking_configs 
SET short_id = public.generate_short_id(8) 
WHERE short_id IS NULL;