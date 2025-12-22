-- Create cloaking_configs table
CREATE TABLE public.cloaking_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  
  -- URLs de destino para usuários reais
  redirect_url TEXT NOT NULL,
  use_separate_urls BOOLEAN DEFAULT false,
  redirect_url_desktop TEXT,
  redirect_url_mobile TEXT,
  
  -- Configuração de página fake para bots
  bot_action TEXT DEFAULT 'fake_page', -- 'fake_page', 'redirect', 'block'
  fake_page_template INTEGER DEFAULT 1,
  fake_page_html TEXT,
  bot_redirect_url TEXT,
  
  -- Opções de detecção
  block_known_bots BOOLEAN DEFAULT true,
  block_data_centers BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cloaking_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for cloaking_configs
CREATE POLICY "Users can view own cloaking configs"
ON public.cloaking_configs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cloaking configs"
ON public.cloaking_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cloaking configs"
ON public.cloaking_configs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cloaking configs"
ON public.cloaking_configs
FOR DELETE
USING (auth.uid() = user_id);

-- Add cloaking_id to page_events
ALTER TABLE public.page_events ADD COLUMN cloaking_id UUID;

-- Add cloaking_id to bot_detections
ALTER TABLE public.bot_detections ADD COLUMN cloaking_id UUID;

-- Update RLS for page_events to include cloaking_id
DROP POLICY IF EXISTS "Users can view own page events" ON public.page_events;
CREATE POLICY "Users can view own page events"
ON public.page_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp WHERE gp.id = page_events.page_id AND gp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM cloaking_configs cc WHERE cc.id = page_events.cloaking_id AND cc.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own page events" ON public.page_events;
CREATE POLICY "Users can delete own page events"
ON public.page_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp WHERE gp.id = page_events.page_id AND gp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM cloaking_configs cc WHERE cc.id = page_events.cloaking_id AND cc.user_id = auth.uid()
  )
);

-- Update RLS for bot_detections to include cloaking_id
DROP POLICY IF EXISTS "Users can view own bot detections through page" ON public.bot_detections;
CREATE POLICY "Users can view own bot detections"
ON public.bot_detections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp WHERE gp.id = bot_detections.page_id AND gp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM cloaking_configs cc WHERE cc.id = bot_detections.cloaking_id AND cc.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own bot detections through page" ON public.bot_detections;
CREATE POLICY "Users can delete own bot detections"
ON public.bot_detections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM generated_pages gp WHERE gp.id = bot_detections.page_id AND gp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM cloaking_configs cc WHERE cc.id = bot_detections.cloaking_id AND cc.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_cloaking_configs_updated_at
BEFORE UPDATE ON public.cloaking_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();