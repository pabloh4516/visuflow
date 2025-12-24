import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url, device = 'desktop' } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 🔥 URL do seu Cloud Run (JÁ TESTADO E FUNCIONANDO)
    const CLOUD_RUN_URL = "https://visuflow-screenshot-service-806839898976.southamerica-east1.run.app/screenshot";

    console.log(`📸 Chamando Cloud Run: ${url} (${device})`);

    // 1. Chamada ao Cloud Run
    const screenshotResponse = await fetch(CLOUD_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, device }),
    });

    if (!screenshotResponse.ok) {
      const errorText = await screenshotResponse.text();
      console.error('❌ Cloud Run error:', errorText);
      throw new Error(`Falha no screenshot: ${screenshotResponse.status}`);
    }

    const imageBuffer = await screenshotResponse.arrayBuffer();
    console.log(`✅ Screenshot recebido: ${imageBuffer.byteLength} bytes`);

    // 2. Configurar Supabase Client
const supabaseUrl = "https://ptnfrvvihpbudjrlzzhn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bmZydnZpaHBidWRqcmx6emhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQzOTQ3MCwiZXhwIjoyMDgyMDE1NDcwfQ.C8aazOiL73P6JCwFGSqK5ttF18WESf8DyjCLYxwGxiQ"; // ← SUA CHAVE REAL

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `screenshots/${timestamp}-${device}.png`;

    // 4. Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false, // Não sobrescrever se existir
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    // 5. Obter URL pública
    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    console.log(`✅ Upload concluído: ${urlData.publicUrl}`);

    // 6. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        screenshotUrl: urlData.publicUrl,
        fileName: fileName,
        device: device,
        timestamp: timestamp
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (err) {
    console.error('❌ Edge Function error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});