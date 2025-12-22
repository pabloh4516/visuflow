-- Fix RLS policy for bot_detections to only show user's own data
DROP POLICY IF EXISTS "Users can view own bot detections" ON public.bot_detections;

CREATE POLICY "Users can view own bot detections" 
ON public.bot_detections FOR SELECT 
USING (auth.uid() = user_id);

-- Fix RLS policy for generated_pages (already correct, but ensure it's strict)
DROP POLICY IF EXISTS "Users can view own pages" ON public.generated_pages;

CREATE POLICY "Users can view own pages" 
ON public.generated_pages FOR SELECT 
USING (auth.uid() = user_id);