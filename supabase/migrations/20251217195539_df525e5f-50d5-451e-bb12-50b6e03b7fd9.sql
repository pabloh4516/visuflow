-- Create bot_detections table
CREATE TABLE public.bot_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.generated_pages(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  detection_type TEXT NOT NULL CHECK (detection_type IN ('frontend', 'cloaking')),
  user_agent TEXT,
  ip_address TEXT,
  detection_reason TEXT NOT NULL,
  fingerprint_data JSONB,
  blocked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bot_detections
CREATE POLICY "Anyone can view bot detections"
ON public.bot_detections FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert bot detections"
ON public.bot_detections FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete bot detections"
ON public.bot_detections FOR DELETE
USING (true);

-- Add bot_protection_config column to generated_pages
ALTER TABLE public.generated_pages 
ADD COLUMN bot_protection_config JSONB DEFAULT '{
  "enableFrontendDetection": false,
  "detectWebdriver": true,
  "detectHeadless": true,
  "detectCanvas": true,
  "detectWebGL": true,
  "detectTiming": true,
  "enableCloaking": false,
  "blockKnownBots": true,
  "blockDataCenters": false,
  "fakePageContent": ""
}'::jsonb;

-- Create index for faster queries
CREATE INDEX idx_bot_detections_page_id ON public.bot_detections(page_id);
CREATE INDEX idx_bot_detections_detected_at ON public.bot_detections(detected_at DESC);