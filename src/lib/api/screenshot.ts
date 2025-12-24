import { supabase } from '@/integrations/supabase/client';

export interface CaptureResult {
  success: boolean;
  screenshot?: string;
  screenshotUrl?: string; // Nova propriedade para URL pública
  isUrl?: boolean;
  error?: string;
}

export async function captureScreenshot(
  url: string,
  device: 'desktop' | 'mobile',
  pageId?: string
): Promise<CaptureResult> {
  try {
    // 🔥 AGORA usando nossa NOVA Edge Function
    const { data, error } = await supabase.functions.invoke('capture-screenshot', {
      body: { url, device, pageId },
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return { success: false, error: error.message };
    }

    // ✅ Nossa nova função retorna { success: true, screenshotUrl: '...' }
    if (data?.success && data.screenshotUrl) {
      return {
        success: true,
        screenshot: data.screenshotUrl, // Mantém compatibilidade
        screenshotUrl: data.screenshotUrl, // Nova propriedade
        isUrl: true // Indica que é uma URL, não base64
      };
    } else {
      return {
        success: false,
        error: data?.error || 'Falha ao capturar screenshot'
      };
    }
  } catch (error) {
    console.error('❌ Error calling capture-screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture screenshot'
    };
  }
}

// Função auxiliar para gerar mobile + desktop em paralelo
export async function captureBothScreenshots(url: string, pageId?: string) {
  const [desktopResult, mobileResult] = await Promise.all([
    captureScreenshot(url, 'desktop', pageId),
    captureScreenshot(url, 'mobile', pageId),
  ]);

  return {
    desktop: desktopResult,
    mobile: mobileResult,
    allSuccess: desktopResult.success && mobileResult.success
  };
}