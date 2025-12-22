import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reasons that are informational only - NOT indicators of bots
// These are normal characteristics in modern browsers, especially mobile
const INFORMATIONAL_REASONS = [
  'timing_no_precision',    // Normal in Safari/iOS for privacy (timestamps rounded)
  'webgl_no_debug',         // Some browsers don't expose debug info
  'audio_anomaly',          // Can fail in restricted audio contexts
  'no_permissions_api',     // Older browsers may not support this
  'fingerprint_only',       // Just collecting data, not a detection
  // Social app detections - these are users browsing via the app, NOT bots
  'ad_platform_musical_ly',
  'ad_platform_BytedanceWebview',
  'ad_platform_TikTok',
  'ad_platform_FBAN',
  'ad_platform_FBAV',
  'ad_platform_Instagram',
  'ad_platform_ByteLocale',
  'ad_platform_JsSdk',
  // Timing alone is not enough to block - common in fast mobile networks
  'timing_toofast_alone',
];

// Normal informational reasons that should NOT be saved to DB (saves storage)
// These are common in real users and don't provide value for analysis
const SKIP_SAVE_REASONS = [
  'ad_platform_musical_ly',
  'ad_platform_BytedanceWebview',
  'ad_platform_TikTok',
  'ad_platform_FBAN',
  'ad_platform_FBAV',
  'ad_platform_Instagram',
  'ad_platform_ByteLocale',
  'ad_platform_JsSdk',
  'fingerprint_only',
  'timing_no_precision',
];

// Social apps that should be treated as real users unless they have emulator WebGL
const SOCIAL_APPS = ['musical_ly', 'bytedancewebview', 'tiktok', 'fban', 'fbav', 'instagram', 'bytelocale', 'jssdk'];

// Emulator WebGL renderers - these are DEFINITELY bots/VMs
const EMULATOR_WEBGL = ['swiftshader', 'llvmpipe', 'virtualbox', 'vmware', 'mesa', 'parallels', 'google inc'];

// Real GPU vendors/renderers - users with these should NOT be blocked
const REAL_GPU_INDICATORS = ['apple', 'adreno', 'mali', 'powervr', 'nvidia', 'amd', 'intel', 'qualcomm', 'arm'];

// Desktop platforms that should NOT appear with mobile User Agents
const DESKTOP_PLATFORMS = ['x86_64', 'x86', 'win32', 'win64', 'linux x86'];

// Check if WebGL renderer indicates a real GPU
function hasRealGPU(webglRenderer: string): boolean {
  if (!webglRenderer) return false;
  const renderer = webglRenderer.toLowerCase();
  return REAL_GPU_INDICATORS.some(gpu => renderer.includes(gpu));
}

// Check if User Agent claims to be mobile
function userAgentClaimsMobile(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return ua.includes('android') || 
         ua.includes('iphone') || 
         ua.includes('ipad') ||
         ua.includes('mobile');
}

// Check if platform is desktop (x86_64, Win32, etc.)
function isPlatformDesktop(platform: string): boolean {
  if (!platform) return false;
  const p = platform.toLowerCase();
  return DESKTOP_PLATFORMS.some(dp => p.includes(dp));
}

// Check if there's a platform mismatch (UA says mobile but platform is desktop)
function hasPlatformMismatch(userAgent: string, platform: string): boolean {
  const uaClaimsMobile = userAgentClaimsMobile(userAgent);
  const platformIsDesktop = isPlatformDesktop(platform);
  
  // If UA says mobile but platform is desktop → MISMATCH (bot/emulator)
  return uaClaimsMobile && platformIsDesktop;
}

// Check if fingerprint indicates a real mobile device
function isRealMobileDevice(fingerprintData: any, userAgent: string): boolean {
  if (!fingerprintData) return false;
  
  const touchPoints = fingerprintData.maxTouchPoints || 0;
  const platform = (fingerprintData.platform || '').toLowerCase();
  const webglRenderer = (fingerprintData.webglRenderer || '').toLowerCase();
  
  // First check: platform mismatch detection
  // If UA claims mobile but platform is desktop → NOT a real mobile device
  if (hasPlatformMismatch(userAgent, platform)) {
    return false;
  }
  
  // Check for virtual/emulated GPU - definitely not a real device
  const isVirtualGpu = webglRenderer.includes('swiftshader') || 
                       webglRenderer.includes('llvmpipe') ||
                       webglRenderer.includes('software') ||
                       webglRenderer.includes('microsoft basic') ||
                       webglRenderer.includes('google inc');
  
  if (isVirtualGpu) {
    return false;
  }
  
  // Real ARM mobile platforms - including aarch64!
  const isArmPlatform = platform.includes('arm') || 
                        platform.includes('aarch64') ||  // Added: Android 64-bit ARM
                        platform.includes('iphone') || 
                        platform.includes('ipad');
  
  // Linux ARM (armv8l, aarch64) is real mobile, Linux x86_64 is NOT
  const isLinuxMobile = platform.includes('linux') && 
                        (platform.includes('arm') || platform.includes('aarch64'));
  
  // Linux desktop = x86/x86_64 OR neither ARM nor aarch64
  const isLinuxDesktop = platform.includes('linux') && 
                         (platform.includes('x86') || 
                          (!platform.includes('arm') && !platform.includes('aarch64')));
  
  // iOS is always mobile
  const isIOS = platform.includes('iphone') || platform.includes('ipad');
  
  // Real mobile = has touch + is ARM/aarch64 platform (not x86)
  const isMobilePlatform = isArmPlatform || isLinuxMobile || isIOS;
  
  return touchPoints > 0 && isMobilePlatform && !isLinuxDesktop;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      pageId, 
      detectionType, 
      detectionReason, 
      isBot,
      reasonCount,
      userAgent, 
      fingerprintData 
    } = body;

    // Get client IP from various headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('cf-connecting-ip') || 
                      req.headers.get('x-real-ip') ||
                      'unknown';

    // Parse reasons into array
    const reasons = detectionReason ? String(detectionReason).split(',').filter(r => r.trim()) : [];
    
    // Filter out informational reasons to determine if this is actually a bot
    let blockingReasons = reasons.filter(r => !INFORMATIONAL_REASONS.includes(r.trim()));
    const informationalReasons = reasons.filter(r => INFORMATIONAL_REASONS.includes(r.trim()));
    
    // Check if this is a social app user
    const ua = (userAgent || '').toLowerCase();
    const isSocialApp = SOCIAL_APPS.some(app => ua.includes(app));
    
    // Check if WebGL indicates emulator
    const webglRenderer = fingerprintData?.webglRenderer?.toLowerCase() || '';
    const isEmulatorWebGL = EMULATOR_WEBGL.some(e => webglRenderer.includes(e));
    
    // Check if user has a real GPU (strong indicator of real user)
    const hasRealGpuDevice = hasRealGPU(webglRenderer);
    
    // Get platform info for mismatch detection
    const platform = fingerprintData?.platform || '';
    
    // Check for PLATFORM MISMATCH - critical bot detection
    const platformMismatch = hasPlatformMismatch(userAgent, platform);
    
    // Check if this is a real mobile device (includes platform mismatch check)
    const isRealMobile = isRealMobileDevice(fingerprintData, userAgent);
    
    // IMPROVEMENT: If timing_toofast is the ONLY blocking reason and user has real GPU, make it informational
    if (blockingReasons.length === 1 && blockingReasons[0] === 'timing_toofast' && hasRealGpuDevice) {
      informationalReasons.push('timing_toofast_alone');
      blockingReasons = [];
    }
    
    // IMPROVEMENT: If headless_noplugins detected but user has real GPU and is on mobile, don't block
    if (blockingReasons.includes('headless_noplugins') && hasRealGpuDevice && isRealMobile) {
      blockingReasons = blockingReasons.filter(r => r !== 'headless_noplugins');
      informationalReasons.push('headless_noplugins');
    }
    
    // Determine if this should be blocked
    let isBotDetected = false;
    let detectionStatus = 'LIMPO';
    
    if (isSocialApp) {
      // Social app detected - but verify it's a REAL mobile device
      if (platformMismatch) {
        // CRITICAL: UA claims mobile (Android/TikTok) but platform is x86_64 → BOT!
        detectionStatus = 'BOT_PLATFORM_MISMATCH';
        isBotDetected = true;
        blockingReasons.push('platform_mismatch');
        console.log(`[ALERT] Platform mismatch detected! UA claims mobile but platform is: ${platform}`);
      } else if (isEmulatorWebGL) {
        // Social app + emulator = platform verifier, track but don't block harshly
        detectionStatus = 'VERIFICADOR_PLATAFORMA';
        isBotDetected = true;
      } else if (!isRealMobile && userAgentClaimsMobile(userAgent)) {
        // Claims mobile in UA but doesn't have real mobile fingerprint
        // HOWEVER: If it's a social app with a real GPU, trust it
        if (hasRealGpuDevice) {
          // Social app + real GPU (Mali, Adreno, Apple) = real user
          // Even if isRealMobile check failed for some reason
          detectionStatus = 'USUARIO_REAL_APP';
          isBotDetected = false;
          console.log(`[INFO] Social app with real GPU (${webglRenderer}) - treating as real user despite fingerprint check`);
        } else {
          detectionStatus = 'BOT_FAKE_MOBILE';
          isBotDetected = true;
          blockingReasons.push('fake_mobile_fingerprint');
          console.log(`[ALERT] Fake mobile detected! Not a real mobile device and no real GPU`);
        }
      } else {
        // Social app + real mobile device + no emulator = real user
        detectionStatus = 'USUARIO_REAL_APP';
        isBotDetected = false;
      }
    } else if (platformMismatch) {
      // Non-social app but still has platform mismatch → BOT
      detectionStatus = 'BOT_PLATFORM_MISMATCH';
      isBotDetected = true;
      blockingReasons.push('platform_mismatch');
      console.log(`[ALERT] Platform mismatch detected (non-social)! UA claims mobile but platform is: ${platform}`);
    } else if (hasRealGpuDevice && isRealMobile && blockingReasons.length === 0) {
      // Real GPU + real mobile device + no blocking reasons = definitely real user
      detectionStatus = informationalReasons.length > 0 ? 'INFORMATIVO' : 'LIMPO';
      isBotDetected = false;
    } else {
      // Standard detection logic
      isBotDetected = blockingReasons.length > 0;
      detectionStatus = isBotDetected ? 'BLOQUEADO' : (informationalReasons.length > 0 ? 'INFORMATIVO' : 'LIMPO');
    }

    // Structured logging
    console.log('='.repeat(60));
    console.log('[BOT DETECTION REPORT]');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Page ID: ${pageId || 'unknown'}`);
    console.log(`Detection Type: ${detectionType || 'frontend'}`);
    console.log(`Is Social App: ${isSocialApp}`);
    console.log(`Is Emulator WebGL: ${isEmulatorWebGL}`);
    console.log(`Has Real GPU: ${hasRealGpuDevice}`);
    console.log(`Is Real Mobile: ${isRealMobile}`);
    console.log(`Platform Mismatch: ${platformMismatch}`);
    console.log(`Platform: ${platform}`);
    console.log(`UA Claims Mobile: ${userAgentClaimsMobile(userAgent)}`);
    console.log(`Detection Status: ${detectionStatus}`);
    console.log(`Is Bot: ${isBotDetected}`);
    console.log(`Total Reasons: ${reasons.length}`);
    console.log(`Blocking Reasons: ${blockingReasons.length} - ${blockingReasons.join(', ') || 'none'}`);
    console.log(`Informational Reasons: ${informationalReasons.length} - ${informationalReasons.join(', ') || 'none'}`);
    console.log(`Reasons: ${reasons.join(', ') || 'none'}`);
    console.log(`IP Address: ${ipAddress}`);
    console.log(`User Agent: ${userAgent || 'unknown'}`);
    
    if (fingerprintData) {
      console.log('-'.repeat(40));
      console.log('[FINGERPRINT DATA]');
      
      // Device & Hardware
      if (fingerprintData.platform) console.log(`Platform: ${fingerprintData.platform}`);
      if (fingerprintData.vendor) console.log(`Vendor: ${fingerprintData.vendor}`);
      if (fingerprintData.cpuCores) console.log(`CPU Cores: ${fingerprintData.cpuCores}`);
      if (fingerprintData.deviceMemory) console.log(`Device Memory: ${fingerprintData.deviceMemory}GB`);
      if (fingerprintData.maxTouchPoints !== undefined) console.log(`Touch Points: ${fingerprintData.maxTouchPoints}`);
      
      // Screen & Display
      if (fingerprintData.screen) console.log(`Screen: ${fingerprintData.screen}`);
      if (fingerprintData.viewport) console.log(`Viewport: ${fingerprintData.viewport}`);
      if (fingerprintData.colorDepth) console.log(`Color Depth: ${fingerprintData.colorDepth}`);
      if (fingerprintData.pixelRatio) console.log(`Pixel Ratio: ${fingerprintData.pixelRatio}`);
      
      // Browser Features
      if (fingerprintData.language) console.log(`Language: ${fingerprintData.language}`);
      if (fingerprintData.languages) console.log(`Languages: ${fingerprintData.languages}`);
      if (fingerprintData.timezone) console.log(`Timezone: ${fingerprintData.timezone}`);
      if (fingerprintData.timezoneOffset !== undefined) console.log(`TZ Offset: ${fingerprintData.timezoneOffset}min`);
      if (fingerprintData.plugins !== undefined) console.log(`Plugins: ${fingerprintData.plugins}`);
      
      // Connection
      if (fingerprintData.connectionType) console.log(`Connection: ${fingerprintData.connectionType}`);
      if (fingerprintData.connectionRtt) console.log(`RTT: ${fingerprintData.connectionRtt}ms`);
      if (fingerprintData.connectionDownlink) console.log(`Downlink: ${fingerprintData.connectionDownlink}Mbps`);
      
      // Fingerprint Hashes
      if (fingerprintData.canvasHash) console.log(`Canvas Hash: ${fingerprintData.canvasHash}`);
      if (fingerprintData.audioHash) console.log(`Audio Hash: ${fingerprintData.audioHash}`);
      if (fingerprintData.webglRenderer) console.log(`WebGL Renderer: ${fingerprintData.webglRenderer}`);
      if (fingerprintData.webglVendor) console.log(`WebGL Vendor: ${fingerprintData.webglVendor}`);
      
      // WebRTC
      if (fingerprintData.webrtcIps && Array.isArray(fingerprintData.webrtcIps)) {
        console.log(`WebRTC IPs: ${fingerprintData.webrtcIps.join(', ')}`);
      }
      
      // Behavioral Data
      if (fingerprintData.behavior) {
        console.log('-'.repeat(40));
        console.log('[BEHAVIORAL DATA]');
        console.log(`Mouse Events: ${fingerprintData.behavior.mouseEvents || 0}`);
        console.log(`Scroll Events: ${fingerprintData.behavior.scrollEvents || 0}`);
        console.log(`Touch Events: ${fingerprintData.behavior.touchEvents || 0}`);
        if (fingerprintData.behavior.movePattern) {
          console.log(`Move Pattern: ${JSON.stringify(fingerprintData.behavior.movePattern)}`);
        }
      }
      
      // Bot Indicators
      console.log('-'.repeat(40));
      console.log('[BOT INDICATORS]');
      if (fingerprintData.hasChrome !== undefined) console.log(`Has Chrome: ${fingerprintData.hasChrome}`);
      if (fingerprintData.hasChromeRuntime !== undefined) console.log(`Has Chrome Runtime: ${fingerprintData.hasChromeRuntime}`);
      if (fingerprintData.hasNotification !== undefined) console.log(`Has Notification: ${fingerprintData.hasNotification}`);
      if (fingerprintData.hasPermissions !== undefined) console.log(`Has Permissions API: ${fingerprintData.hasPermissions}`);
      if (fingerprintData.execTime !== undefined) console.log(`Exec Time: ${fingerprintData.execTime.toFixed(2)}ms`);
      
      // URL Info
      if (fingerprintData.url) console.log(`URL: ${fingerprintData.url}`);
      if (fingerprintData.referrer) console.log(`Referrer: ${fingerprintData.referrer}`);
    }
    
    console.log('='.repeat(60));

    // Check if we should skip saving this detection to save storage
    // NEVER skip if platform mismatch or fake mobile detected - these are important!
    const shouldSkipSave = !isBotDetected && 
      blockingReasons.length === 0 &&
      !platformMismatch &&
      (informationalReasons.length === 0 || 
       informationalReasons.every(r => SKIP_SAVE_REASONS.some(skip => r.includes(skip))));

    if (shouldSkipSave) {
      console.log(`[SKIP] Normal user passed - not saving to DB (Status: ${detectionStatus})`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Normal user - not logged',
          isBot: false,
          skipped: true,
          status: detectionStatus,
          isSocialApp: isSocialApp,
          blockingReasons: 0,
          informationalReasons: informationalReasons.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare fingerprint data for storage
    const enrichedFingerprintData = {
      ...fingerprintData,
      detectionReasons: reasons,
      blockingReasons: blockingReasons,
      informationalReasons: informationalReasons,
      isSocialApp: isSocialApp,
      isEmulatorWebGL: isEmulatorWebGL,
      platformMismatch: platformMismatch,
      isRealMobile: isRealMobile,
      detectionStatus: detectionStatus,
      detectedAt: new Date().toISOString(),
      clientHeaders: {
        userAgent: req.headers.get('user-agent'),
        acceptLanguage: req.headers.get('accept-language'),
        referer: req.headers.get('referer'),
      }
    };

    // Determine if we should actually block
    // Block if: platform mismatch, emulator, or other blocking reasons
    const shouldBlock = isBotDetected;

    // Insert detection record
    const { data, error } = await supabase.from('bot_detections').insert({
      page_id: pageId || null,
      detection_type: detectionType || 'frontend',
      detection_reason: [...reasons, ...blockingReasons.filter(r => !reasons.includes(r))].join(', ').substring(0, 500) || 'fingerprint_only',
      user_agent: (userAgent || req.headers.get('user-agent') || '').substring(0, 1000),
      ip_address: ipAddress,
      fingerprint_data: enrichedFingerprintData,
      blocked: shouldBlock,
    }).select('id');

    if (error) {
      console.error('[ERROR] Failed to save bot detection:', error.message);
      throw error;
    }

    console.log(`[SUCCESS] Bot detection saved with ID: ${data?.[0]?.id} | Status: ${detectionStatus} | Blocked: ${shouldBlock} | Blocking: ${blockingReasons.length} | Informational: ${informationalReasons.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bot detection recorded', 
        id: data?.[0]?.id,
        isBot: shouldBlock,
        status: detectionStatus,
        isSocialApp: isSocialApp,
        isEmulatorWebGL: isEmulatorWebGL,
        platformMismatch: platformMismatch,
        blockingReasons: blockingReasons.length,
        informationalReasons: informationalReasons.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ERROR] report-bot function failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
