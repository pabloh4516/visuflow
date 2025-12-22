import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { 
      pageId, 
      eventType, 
      isHuman, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      utmContent, 
      utmTerm,
      referrer,
      metadata 
    } = body;

    console.log(`[track-event] Received event: ${eventType} for page: ${pageId}`);

    if (!pageId || !eventType) {
      console.error('[track-event] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing pageId or eventType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate event type
    const validEventTypes = ['view', 'popup_interaction', 'redirect'];
    if (!validEventTypes.includes(eventType)) {
      console.error(`[track-event] Invalid event type: ${eventType}`);
      return new Response(
        JSON.stringify({ error: 'Invalid eventType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Detect device type from user agent
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
      deviceType = /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Get page to retrieve user_id
    const { data: pageData, error: pageError } = await supabase
      .from('generated_pages')
      .select('user_id')
      .eq('id', pageId)
      .maybeSingle();

    if (pageError) {
      console.error('[track-event] Error fetching page:', pageError);
    }

    // Insert event
    const { data, error } = await supabase
      .from('page_events')
      .insert({
        page_id: pageId,
        user_id: pageData?.user_id || null,
        event_type: eventType,
        is_human: isHuman ?? true,
        ip_address: ip,
        user_agent: userAgent,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        utm_content: utmContent || null,
        utm_term: utmTerm || null,
        device_type: deviceType,
        referrer: referrer || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[track-event] Error inserting event:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[track-event] Event tracked successfully: ${data.id}`);

    return new Response(
      JSON.stringify({ success: true, eventId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[track-event] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
