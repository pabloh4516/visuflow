-- Create page_events table for tracking all page interactions
CREATE TABLE public.page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.generated_pages(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'popup_interaction', 'redirect')),
  is_human BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  country TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert events (public tracking from HTML pages)
CREATE POLICY "Anyone can insert page events"
ON public.page_events
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view events for their own pages
CREATE POLICY "Users can view own page events"
ON public.page_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.generated_pages gp
    WHERE gp.id = page_events.page_id
    AND gp.user_id = auth.uid()
  )
);

-- Policy: Users can delete events for their own pages
CREATE POLICY "Users can delete own page events"
ON public.page_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.generated_pages gp
    WHERE gp.id = page_events.page_id
    AND gp.user_id = auth.uid()
  )
);

-- Create indexes for fast queries
CREATE INDEX idx_page_events_page_id ON public.page_events(page_id);
CREATE INDEX idx_page_events_created_at ON public.page_events(created_at DESC);
CREATE INDEX idx_page_events_event_type ON public.page_events(event_type);
CREATE INDEX idx_page_events_page_created ON public.page_events(page_id, created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_events;