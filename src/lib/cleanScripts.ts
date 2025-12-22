import { GeneratorConfig } from '@/types/generator';

export function generateCleanBotDetectionScript(config: GeneratorConfig, v: Record<string, string>, pageId?: string): string {
  const { botProtection } = config;
  const reportUrl = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/report-bot`;
  const pageIdStr = pageId ? `'${pageId}'` : 'null';

  const detections: string[] = [];

  // AD PLATFORM BOTS DETECTION (Clean)
  // AD PLATFORM BOTS DETECTION (Clean) - Lista completa e sincronizada
  if (botProtection.detectAdPlatformBots) {
    detections.push(`
      var adBotList = [
        // Google (lista completa oficial)
        'AdsBot-Google','AdsBot-Google-Mobile','AdsBot-Google-Mobile-Apps','Googlebot','Googlebot-Image','Googlebot-Video','Googlebot-News','Google-Ads','Google-InspectionTool','Google-Safety','Google-Read-Aloud','Mediapartners-Google','googleweblight','APIs-Google','Storebot-Google','Google-Site-Verification','Google-Structured-Data-Testing-Tool',
        // Meta/Facebook
        'facebookexternalhit','Facebot','Meta-ExternalAgent','Meta-ExternalFetcher','FacebookBot','facebookcatalog',
        // TikTok/ByteDance
        'Bytespider','TikTok','Tiktokbot','TikTok_Ads_Bot','musical_ly','BytedanceWebview','ByteLocale','JsSdk','ByteFullLocale','TTPush','TikTokApi','BytedanceSpider',
        // Microsoft
        'Bingbot','bingbot','adidxbot','BingPreview','msnbot',
        // Outros
        'LinkedInBot','Twitterbot','Slackbot','Slackbot-LinkExpanding','PinterestBot','Discordbot','SemrushBot','AhrefsBot','DotBot','MJ12bot','YandexBot','Applebot','Baiduspider','DuckDuckBot'
      ];
      var currentUserAgent = navigator.userAgent || '';
      for (var i = 0; i < adBotList.length; i++) {
        if (currentUserAgent.toLowerCase().indexOf(adBotList[i].toLowerCase()) > -1) {
          isBot = true;
          reasons.push('ad_platform_' + adBotList[i]);
          break;
        }
      }`);
  }

  // AUTOMATION TOOLS DETECTION (Clean)
  if (botProtection.detectAutomationTools) {
    detections.push(`
      if (window.callSelenium || window._selenium || window.__selenium_unwrapped || window.__webdriver_evaluate || document.$cdc_asdjflasutopfhvcZLmcfl_) {
        isBot = true; reasons.push('selenium');
      }
      if ((navigator.webdriver === true) && (!window.chrome || !window.chrome.runtime)) {
        isBot = true; reasons.push('puppeteer');
      }
      if (window.__playwright || window.__pw_manual || window.playwright) {
        isBot = true; reasons.push('playwright');
      }
      if (window.Cypress || window.__cypress || window.cy) {
        isBot = true; reasons.push('cypress');
      }`);
  }

  // WEBDRIVER DETECTION (Clean)
  if (botProtection.detectWebdriver) {
    detections.push(`
      if (navigator.webdriver) { isBot = true; reasons.push('webdriver'); }`);
  }

  // HEADLESS BROWSER DETECTION (Clean)
  if (botProtection.detectHeadless) {
    detections.push(`
      if (!window.chrome || !window.chrome.runtime) {
        if (navigator.plugins.length === 0 && !navigator.userAgent.match(/mobile/i)) {
          isBot = true; reasons.push('headless_noplugins');
        }
      }
      if (window.callPhantom || window._phantom || window.phantom) { isBot = true; reasons.push('phantom'); }
      if (/HeadlessChrome/.test(navigator.userAgent)) { isBot = true; reasons.push('headless_chrome_ua'); }`);
  }

  // CANVAS FINGERPRINT (Clean)
  if (botProtection.detectCanvas) {
    detections.push(`
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 50;
        var ctx = canvas.getContext('2d');
        if (!ctx) { isBot = true; reasons.push('canvas_nocontext'); }
        else {
          ctx.textBaseline = 'top'; ctx.font = '14px Arial';
          ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 62, 20);
          ctx.fillStyle = '#069'; ctx.fillText('BotDetect', 2, 15);
          var dataUrl = canvas.toDataURL();
          if (dataUrl === 'data:,' || dataUrl.length < 1000) { isBot = true; reasons.push('canvas_anomaly'); }
          var hash = 0;
          for (var i = 0; i < dataUrl.length; i++) { hash = ((hash << 5) - hash) + dataUrl.charCodeAt(i); hash = hash & hash; }
          fingerprint.canvasHash = hash.toString(16);
        }
      } catch (e) { isBot = true; reasons.push('canvas_error'); }`);
  }

  // WEBGL FINGERPRINT (Clean)
  if (botProtection.detectWebGL) {
    detections.push(`
      try {
        var gl = document.createElement('canvas').getContext('webgl');
        if (gl) {
          var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
            fingerprint.webglRenderer = renderer;
            if (renderer.indexOf('SwiftShader') > -1 || renderer.indexOf('llvmpipe') > -1 || renderer.indexOf('VirtualBox') > -1) {
              isBot = true; reasons.push('webgl_virtual');
            }
          }
        }
      } catch (e) {}`);
  }

  // TIMING ANALYSIS (Clean)
  if (botProtection.detectTiming) {
    detections.push(`
      var timeStart = performance.now();
      for (var i = 0; i < 5000; i++) { Math.random() * Math.sqrt(i); }
      var execTime = performance.now() - timeStart;
      fingerprint.execTime = execTime;
      if (execTime < 0.5) { isBot = true; reasons.push('timing_toofast'); }`);
  }

  // BASIC FINGERPRINT (Clean)
  if (botProtection.collectAdvancedFingerprint) {
    detections.push(`
      fingerprint.platform = navigator.platform;
      fingerprint.cpuCores = navigator.hardwareConcurrency || 0;
      fingerprint.screenWidth = screen.width;
      fingerprint.screenHeight = screen.height;
      fingerprint.colorDepth = screen.colorDepth;
      fingerprint.pixelRatio = window.devicePixelRatio || 1;
      fingerprint.language = navigator.language;
      fingerprint.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fingerprint.url = window.location.href;
      fingerprint.referrer = document.referrer;`);
  }

  return `
    var isBot = false;
    var reasons = [];
    var fingerprint = {};
    
    ${detections.join('\n')}
    
    fingerprint.screen = screen.width + 'x' + screen.height;
    fingerprint.userAgent = navigator.userAgent;
    
    // Filter out informational reasons (not real bot indicators)
    var informationalReasons = ['timing_no_precision','webgl_no_debug','audio_anomaly','no_permissions_api','fingerprint_only'];
    var realReasons = reasons.filter(function(r) { return informationalReasons.indexOf(r) === -1; });
    
    // Only report if there are REAL blocking reasons or confirmed bot
    // Report bot detection using sendBeacon (non-blocking)
    if (realReasons.length > 0 || isBot) {
      try {
        var reportData = JSON.stringify({
          pageId: ${pageIdStr},
          detectionType: 'frontend',
          detectionReason: realReasons.join(','),
          isBot: isBot,
          reasonCount: realReasons.length,
          userAgent: navigator.userAgent,
          fingerprintData: fingerprint
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('${reportUrl}', reportData);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', '${reportUrl}', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reportData);
        }
      } catch (e) {}
    }
    
    window['${v.func}'] = function() {
      if (isBot) return;
      if (!${v.hasMouse} && !${v.hasTouch}) return;`;
}

export function generateCleanDevToolsDetectionScript(config: GeneratorConfig, pageId?: string): string {
  const { botProtection } = config;
  
  if (!botProtection.enableDevToolsDetection) return '';

  const redirectUrl = botProtection.devToolsRedirectUrl || 'https://google.com';
  const reportUrl = 'https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/report-bot';

  return `
    (function() {
      var detected = false;
      
      // Detecção robusta de mobile real vs DevTools emulação
      var uaClaimsMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      var hasTouchPoints = navigator.maxTouchPoints > 1;
      var platform = (navigator.platform || '').toLowerCase();
      
      // Plataformas desktop - se o UA diz mobile mas platform é desktop, é emulação
      var isDesktopPlatform = platform.indexOf('win') > -1 || 
                              platform.indexOf('mac') > -1 || 
                              platform.indexOf('linux x86') > -1 ||
                              platform.indexOf('x86') > -1 ||
                              platform === 'linux';
      
      // Mobile real: UA diz mobile E platform é ARM/mobile
      var isMobileRealPlatform = platform.indexOf('arm') > -1 || 
                                  platform.indexOf('iphone') > -1 || 
                                  platform.indexOf('ipad') > -1 ||
                                  platform.indexOf('android') > -1;
      
      // É DevTools com emulação mobile se: UA diz mobile MAS platform é desktop
      var isEmulatedMobile = uaClaimsMobile && isDesktopPlatform && !isMobileRealPlatform;
      
      // Considerar como mobile REAL apenas se não for emulação
      var isMobile = (uaClaimsMobile || hasTouchPoints) && !isEmulatedMobile;
      
      // Se é emulação mobile, aplicar TODAS as detecções de desktop (F12, debugger, etc)
      var applyDesktopDetections = !isMobile || isEmulatedMobile;
      
      var report = function(reason) {
        try {
          navigator.sendBeacon('${reportUrl}', JSON.stringify({
            page_id: '${pageId || ''}',
            detection_type: 'devtools',
            detection_reason: reason,
            user_agent: navigator.userAgent,
            is_mobile: isMobile,
            is_emulated: isEmulatedMobile,
            platform: navigator.platform
          }));
        } catch (e) {}
      };
      
      var redirect = function(reason) {
        if (!detected) {
          detected = true;
          report(reason || 'devtools_detected');
          setTimeout(function() { window.location.replace('${redirectUrl}'); }, 100);
        }
      };
      
      // Atalhos de teclado - funciona em todos dispositivos
      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) redirect('keyboard_f12');
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) redirect('keyboard_ctrl_shift');
        if (e.ctrlKey && e.keyCode === 85) redirect('keyboard_ctrl_u');
      }, true);
      
      // Clique direito - aplica em desktop ou emulação mobile
      if (applyDesktopDetections) {
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          redirect('right_click');
          return false;
        }, true);
      }
      
      // Debugger timing - aplica em desktop ou emulação mobile
      if (applyDesktopDetections) {
        var check = function() {
          var start = Date.now();
          debugger;
          if (Date.now() - start > 100) redirect('debugger_timing');
        };
        setInterval(check, 2000);
      }
      
      // Window resize - aplica em desktop ou emulação mobile
      if (applyDesktopDetections) {
        var checkSize = function() {
          if (window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 200) {
            redirect('window_resize');
          }
        };
        checkSize();
        window.addEventListener('resize', checkSize);
      }
    })();`;
}
