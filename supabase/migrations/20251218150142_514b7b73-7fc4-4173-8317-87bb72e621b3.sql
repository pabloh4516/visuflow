-- Performance indexes for dashboard queries

-- generated_pages: commonly filtered by user_id and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_generated_pages_user_created
  ON public.generated_pages (user_id, created_at DESC);

-- page_events: commonly filtered by created_at and joined by page_id
CREATE INDEX IF NOT EXISTS idx_page_events_created
  ON public.page_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_events_page_created
  ON public.page_events (page_id, created_at DESC);

-- bot_detections: commonly filtered by detected_at and joined by page_id
CREATE INDEX IF NOT EXISTS idx_bot_detections_detected
  ON public.bot_detections (detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_bot_detections_page_detected
  ON public.bot_detections (page_id, detected_at DESC);

-- blocked-only queries in dashboard overview cards
CREATE INDEX IF NOT EXISTS idx_bot_detections_blocked_detected
  ON public.bot_detections (blocked, detected_at DESC);