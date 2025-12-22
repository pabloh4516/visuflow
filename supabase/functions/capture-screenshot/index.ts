import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.88.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Generate unique filename
function generateFilename(pageId: string | undefined, device: string): string {
  const id = pageId || crypto.randomUUID();
  const timestamp = Date.now();
  return `${id}-${device}-${timestamp}.png`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, device, pageId } = await req.json();

    if (!url) {
      console.error('URL is required');
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for storage access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const isMobile = device === 'mobile';
    const viewport = isMobile ? '390x844 (mobile)' : '1920x1080 (desktop)';
    
    console.log('=== SCREENSHOT CAPTURE START ===');
    console.log(`URL: ${formattedUrl}`);
    console.log(`Device: ${device || 'desktop'}`);
    console.log(`Viewport: ${viewport}`);

    // Call Firecrawl API with screenshot format
    const requestBody = {
      url: formattedUrl,
      formats: ['screenshot'],
      waitFor: 3000,
      mobile: isMobile,
      skipTlsVerification: true,
    };
    
    console.log('Firecrawl request:', JSON.stringify(requestBody));
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log('Firecrawl response status:', response.status);

    if (!response.ok) {
      console.error('Firecrawl API error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract screenshot from response
    const screenshot = data.data?.screenshot || data.screenshot;
    
    if (!screenshot) {
      console.error('No screenshot in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: 'No screenshot captured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert base64 to bytes
    const imageBytes = base64ToUint8Array(screenshot);
    console.log(`Screenshot captured: ${imageBytes.length} bytes`);

    // Generate filename and upload to Storage
    const filename = generateFilename(pageId, device || 'desktop');
    console.log(`Uploading to storage: screenshots/${filename}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filename, imageBytes, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: `Storage upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filename);

    const screenshotUrl = publicUrlData.publicUrl;
    console.log(`Screenshot uploaded: ${screenshotUrl}`);
    console.log('=== SCREENSHOT CAPTURE END ===');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        screenshot: screenshotUrl,
        isUrl: true,
        metadata: {
          device: device || 'desktop',
          filename,
          size: imageBytes.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to capture screenshot';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
