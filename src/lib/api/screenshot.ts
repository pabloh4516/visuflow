import { supabase } from '@/integrations/supabase/client';

export interface CaptureResult {
  success: boolean;
  screenshot?: string;
  isUrl?: boolean;
  error?: string;
}

export async function captureScreenshot(
  url: string, 
  device: 'desktop' | 'mobile',
  pageId?: string
): Promise<CaptureResult> {
  try {
    const { data, error } = await supabase.functions.invoke('capture-screenshot', {
      body: { url, device, pageId },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return data as CaptureResult;
  } catch (error) {
    console.error('Error calling capture-screenshot:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to capture screenshot' 
    };
  }
}
