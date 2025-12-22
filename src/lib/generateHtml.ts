import { GeneratorConfig, PopupSize, PopupTemplate, defaultBackgrounds } from '@/types/generator';
import { generateCleanBotDetectionScript, generateCleanDevToolsDetectionScript } from './cleanScripts';

const sizeMap: Record<PopupSize, string> = {
  small: '320px',
  medium: '420px',
  large: '520px',
};

function randomHex(): string {
  return Math.random().toString(16).substring(2, 6);
}

function esc(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escJs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function generateBotDetectionScript(config: GeneratorConfig, v: Record<string, string>, pageId?: string): string {
  const { botProtection } = config;
  
  if (!botProtection.enableFrontendDetection) {
    return '';
  }

  // Use clean mode if enabled
  if (botProtection.cleanMode) {
    return generateCleanBotDetectionScript(config, v, pageId);
  }

  const detections: string[] = [];
  const reportUrl = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/report-bot`;
  const pageIdStr = pageId ? `'${pageId}'` : 'null';

  // Variable names for obfuscation
  const vBot = {
    isBot: `_0x${randomHex()}`,
    reason: `_0x${randomHex()}`,
    reasons: `_0x${randomHex()}`,
    report: `_0x${randomHex()}`,
    check: `_0x${randomHex()}`,
    fp: `_0x${randomHex()}`,
    adBots: `_0x${randomHex()}`,
    behavior: `_0x${randomHex()}`,
    mouseData: `_0x${randomHex()}`,
    scrollData: `_0x${randomHex()}`,
    audioHash: `_0x${randomHex()}`,
    webrtcIps: `_0x${randomHex()}`,
    canvasHash: `_0x${randomHex()}`,
  };

  // ========== AD PLATFORM BOTS DETECTION (Lista completa e sincronizada) ==========
  if (botProtection.detectAdPlatformBots) {
    detections.push(`
      var ${vBot.adBots}=[
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
      var ${vBot.adBots}UA=navigator['userAgent']||'';
      for(var i=0;i<${vBot.adBots}['length'];i++){
        if(${vBot.adBots}UA['toLowerCase']()['indexOf'](${vBot.adBots}[i]['toLowerCase']())>-1){
          ${vBot.isBot}=!0;
          ${vBot.reasons}['push']('ad_platform_'+${vBot.adBots}[i]);
          break;
        }
      }`);
  }

  // ========== AUTOMATION TOOLS DETECTION ==========
  if (botProtection.detectAutomationTools) {
    detections.push(`
      // Selenium detection
      if(window['callSelenium']||window['_selenium']||window['__selenium_unwrapped']||
         window['__webdriver_evaluate']||window['__driver_evaluate']||
         document['__selenium_evaluate']||document['__webdriver_evaluate']||
         document['$cdc_asdjflasutopfhvcZLmcfl_']||window['$cdc_asdjflasutopfhvcZLmcfl_']||
         document['$chrome_asyncScriptInfo']||window['__$webdriverAsyncExecutor']||
         navigator['__webdriver_script_fn']||navigator['__webdriver_script_func']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('selenium');
      }
      // Puppeteer detection
      if((navigator['webdriver']===!0)&&(!window['chrome']||!window['chrome']['runtime'])){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('puppeteer');
      }
      // Playwright detection
      if(window['__playwright']||window['__pw_manual']||window['playwright']||
         window['__PW_inspect']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('playwright');
      }
      // Cypress detection
      if(window['Cypress']||window['__cypress']||window['cy']||
         parent!==window&&parent['Cypress']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('cypress');
      }
      // CDP detection (Chrome DevTools Protocol)
      if(window['cdc_adoQpoasnfa76pfcZLmcfl_Array']||
         window['cdc_adoQpoasnfa76pfcZLmcfl_Promise']||
         window['cdc_adoQpoasnfa76pfcZLmcfl_Symbol']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('cdp');
      }
      // Generic automation detection
      if(window['domAutomation']||window['domAutomationController']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('dom_automation');
      }`);
  }

  // ========== WEBDRIVER DETECTION ==========
  if (botProtection.detectWebdriver) {
    detections.push(`
      if(navigator['webdriver']||window['__webdriver_script_fn']||
         Object['getOwnPropertyDescriptor'](navigator,'webdriver')?.['get']?.['toString']()?.['indexOf']('native code')===-1){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('webdriver');
      }`);
  }

  // ========== HEADLESS BROWSER DETECTION ==========
  if (botProtection.detectHeadless) {
    detections.push(`
      // Chrome headless detection
      if(!window['chrome']||!window['chrome']['runtime']){
        if(navigator['plugins']['length']===0&&!navigator['userAgent']['match'](/mobile/i)){
          ${vBot.isBot}=!0;${vBot.reasons}['push']('headless_noplugins');
        }
      }
      // PhantomJS detection
      if(window['callPhantom']||window['_phantom']||window['phantom']||
         window['__phantomas']||window['Buffer']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('phantom');
      }
      // Nightmare detection
      if(window['__nightmare']||window['nightmare']){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('nightmare');
      }
      // Generic headless indicators
      if(navigator['webdriver']===!0||navigator['languages']===''){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('headless_indicators');
      }
      // Missing features in headless
      if(!navigator['permissions']||!navigator['permissions']['query']){
        ${vBot.reasons}['push']('no_permissions_api');
      }
      // Chrome headless specific
      if(/HeadlessChrome/['test'](navigator['userAgent'])){
        ${vBot.isBot}=!0;${vBot.reasons}['push']('headless_chrome_ua');
      }
      // Electron detection (often used for scraping)
      if(navigator['userAgent']['indexOf']('Electron')>-1||window['process']?.['type']){
        ${vBot.reasons}['push']('electron');
      }`);
  }

  // ========== CANVAS FINGERPRINT DETECTION ==========
  if (botProtection.detectCanvas) {
    detections.push(`
      try{
        var cvs=document['createElement']('canvas');
        cvs['width']=200;cvs['height']=50;
        var ctx=cvs['getContext']('2d');
        if(!ctx){${vBot.isBot}=!0;${vBot.reasons}['push']('canvas_nocontext');}
        else{
          ctx['textBaseline']='top';
          ctx['font']='14px Arial';
          ctx['fillStyle']='#f60';
          ctx['fillRect'](0,0,62,20);
          ctx['fillStyle']='#069';
          ctx['fillText']('BotDetect,test!',2,15);
          ctx['fillStyle']='rgba(102,204,0,0.7)';
          ctx['fillText']('BotDetect,test!',4,17);
          var d=cvs['toDataURL']();
          if(d==='data:,'||d['length']<1000){
            ${vBot.isBot}=!0;${vBot.reasons}['push']('canvas_anomaly');
          }
          // Store canvas hash for fingerprint
          var hash=0;for(var i=0;i<d['length'];i++){hash=((hash<<5)-hash)+d['charCodeAt'](i);hash=hash&hash;}
          ${vBot.canvasHash}=hash['toString'](16);
        }
      }catch(e){${vBot.isBot}=!0;${vBot.reasons}['push']('canvas_error');}`);
  }

  // ========== WEBGL FINGERPRINT DETECTION ==========
  if (botProtection.detectWebGL) {
    detections.push(`
      try{
        var gl=document['createElement']('canvas')['getContext']('webgl')||document['createElement']('canvas')['getContext']('experimental-webgl');
        if(gl){
          var dbg=gl['getExtension']('WEBGL_debug_renderer_info');
          if(dbg){
            var rndr=gl['getParameter'](dbg['UNMASKED_RENDERER_WEBGL'])||'';
            var vndr=gl['getParameter'](dbg['UNMASKED_VENDOR_WEBGL'])||'';
            ${vBot.fp}['webglRenderer']=rndr;
            ${vBot.fp}['webglVendor']=vndr;
            if(rndr['indexOf']('SwiftShader')>-1||rndr['indexOf']('llvmpipe')>-1||
               rndr['indexOf']('VirtualBox')>-1||rndr['indexOf']('VMware')>-1||
               rndr['indexOf']('Parallels')>-1||rndr==='Google Inc.'){
              ${vBot.isBot}=!0;${vBot.reasons}['push']('webgl_virtual');
            }
          }else{
            ${vBot.reasons}['push']('webgl_no_debug');
          }
        }else{
          ${vBot.reasons}['push']('webgl_unavailable');
        }
      }catch(e){}`);
  }

  // ========== TIMING ANALYSIS ==========
  if (botProtection.detectTiming) {
    detections.push(`
      // NOTE: Some browsers (especially iOS/Safari) intentionally reduce timer precision.
      // If precision is reduced, a micro-benchmark can look "too fast" (0ms) and cause false positives.
      var t1=performance['now']();var t2=performance['now']();
      var lp=(t1===t2);

      var st=performance['now']();
      for(var i=0;i<5000;i++){Math['random']()*Math['sqrt'](i);}
      var et=performance['now']()-st;
      ${vBot.fp}['execTime']=et;

      // Only flag "too fast" when we have decent timer precision.
      if(!lp&&et<0.5){${vBot.isBot}=!0;${vBot.reasons}['push']('timing_toofast');}

      // Record reduced precision for analytics, but don't block by itself.
      if(lp){${vBot.reasons}['push']('timing_no_precision');}`);
  }

  // ========== AUDIO FINGERPRINT ==========
  if (botProtection.detectAudioFingerprint) {
    detections.push(`
      try{
        var audioCtx=new(window['AudioContext']||window['webkitAudioContext'])();
        var oscillator=audioCtx['createOscillator']();
        var analyser=audioCtx['createAnalyser']();
        var gainNode=audioCtx['createGain']();
        var scriptProcessor=audioCtx['createScriptProcessor'](4096,1,1);
        gainNode['gain']['value']=0;
        oscillator['type']='triangle';
        oscillator['frequency']['setValueAtTime'](10000,audioCtx['currentTime']);
        oscillator['connect'](analyser);
        analyser['connect'](scriptProcessor);
        scriptProcessor['connect'](gainNode);
        gainNode['connect'](audioCtx['destination']);
        oscillator['start'](0);
        var bins=new Float32Array(analyser['frequencyBinCount']);
        analyser['getFloatFrequencyData'](bins);
        oscillator['stop']();audioCtx['close']();
        var audioSum=0;for(var i=0;i<bins['length'];i++){audioSum+=Math['abs'](bins[i]);}
        ${vBot.audioHash}=audioSum['toString'](16);
        ${vBot.fp}['audioHash']=${vBot.audioHash};
        if(audioSum===0||isNaN(audioSum)){${vBot.reasons}['push']('audio_anomaly');}
      }catch(e){${vBot.fp}['audioHash']='error';}`);
  }

  // ========== WEBRTC LEAK DETECTION ==========
  if (botProtection.detectWebRTC) {
    detections.push(`
      try{
        ${vBot.webrtcIps}=[];
        var rtc=new RTCPeerConnection({iceServers:[]});
        rtc['createDataChannel']('');
        rtc['onicecandidate']=function(e){
          if(e['candidate']){
            var parts=e['candidate']['candidate']['split'](' ');
            var ip=parts[4];
            if(ip&&${vBot.webrtcIps}['indexOf'](ip)===-1){
              ${vBot.webrtcIps}['push'](ip);
            }
          }
        };
        rtc['createOffer']()['then'](function(o){rtc['setLocalDescription'](o);});
        setTimeout(function(){
          ${vBot.fp}['webrtcIps']=${vBot.webrtcIps};
          rtc['close']();
        },500);
      }catch(e){${vBot.fp}['webrtcIps']=['error'];}`);
  }

  // ========== BEHAVIORAL ANALYSIS ==========
  if (botProtection.detectBehavior) {
    detections.push(`
      ${vBot.behavior}={mouseEvents:0,scrollEvents:0,clickTimes:[],lastMove:0,movePattern:[],touchEvents:0};
      document['addEventListener']('mousemove',function(e){
        ${vBot.behavior}['mouseEvents']++;
        var now=Date['now']();
        if(${vBot.behavior}['lastMove']>0){
          var delta=now-${vBot.behavior}['lastMove'];
          ${vBot.behavior}['movePattern']['push'](delta);
          if(${vBot.behavior}['movePattern']['length']>10)${vBot.behavior}['movePattern']['shift']();
        }
        ${vBot.behavior}['lastMove']=now;
      });
      document['addEventListener']('scroll',function(){${vBot.behavior}['scrollEvents']++;});
      document['addEventListener']('click',function(){${vBot.behavior}['clickTimes']['push'](Date['now']());});
      document['addEventListener']('touchstart',function(){${vBot.behavior}['touchEvents']++;});
      // Check for linear mouse movement (bot-like)
      setTimeout(function(){
        if(${vBot.behavior}['movePattern']['length']>5){
          var allSame=!0;
          for(var i=1;i<${vBot.behavior}['movePattern']['length'];i++){
            if(Math['abs'](${vBot.behavior}['movePattern'][i]-${vBot.behavior}['movePattern'][i-1])>50)allSame=!1;
          }
          if(allSame&&${vBot.behavior}['mouseEvents']>10){
            ${vBot.reasons}['push']('linear_mouse_movement');
          }
        }
        ${vBot.fp}['behavior']=${vBot.behavior};
      },3000);`);
  }

  // ========== ADVANCED FINGERPRINT COLLECTION ==========
  if (botProtection.collectAdvancedFingerprint) {
    detections.push(`
      // Device & Hardware
      ${vBot.fp}['platform']=navigator['platform'];
      ${vBot.fp}['vendor']=navigator['vendor'];
      ${vBot.fp}['product']=navigator['product'];
      ${vBot.fp}['productSub']=navigator['productSub'];
      ${vBot.fp}['cpuCores']=navigator['hardwareConcurrency']||0;
      ${vBot.fp}['deviceMemory']=navigator['deviceMemory']||0;
      ${vBot.fp}['maxTouchPoints']=navigator['maxTouchPoints']||0;
      
      // Screen & Display
      ${vBot.fp}['screenWidth']=screen['width'];
      ${vBot.fp}['screenHeight']=screen['height'];
      ${vBot.fp}['availWidth']=screen['availWidth'];
      ${vBot.fp}['availHeight']=screen['availHeight'];
      ${vBot.fp}['colorDepth']=screen['colorDepth'];
      ${vBot.fp}['pixelDepth']=screen['pixelDepth'];
      ${vBot.fp}['pixelRatio']=window['devicePixelRatio']||1;
      ${vBot.fp}['viewport']=window['innerWidth']+'x'+window['innerHeight'];
      ${vBot.fp}['outerSize']=window['outerWidth']+'x'+window['outerHeight'];
      
      // Browser Features
      ${vBot.fp}['cookieEnabled']=navigator['cookieEnabled'];
      ${vBot.fp}['doNotTrack']=navigator['doNotTrack'];
      ${vBot.fp}['language']=navigator['language'];
      ${vBot.fp}['languages']=navigator['languages']?navigator['languages']['join'](','):'';
      ${vBot.fp}['timezone']=Intl['DateTimeFormat']()['resolvedOptions']()['timeZone'];
      ${vBot.fp}['timezoneOffset']=new Date()['getTimezoneOffset']();
      ${vBot.fp}['plugins']=navigator['plugins']?navigator['plugins']['length']:0;
      ${vBot.fp}['mimeTypes']=navigator['mimeTypes']?navigator['mimeTypes']['length']:0;
      
      // Connection
      if(navigator['connection']){
        ${vBot.fp}['connectionType']=navigator['connection']['effectiveType']||'';
        ${vBot.fp}['connectionRtt']=navigator['connection']['rtt']||0;
        ${vBot.fp}['connectionDownlink']=navigator['connection']['downlink']||0;
        ${vBot.fp}['connectionSaveData']=navigator['connection']['saveData']||!1;
      }
      
      // Storage
      try{
        ${vBot.fp}['localStorage']=!!window['localStorage'];
        ${vBot.fp}['sessionStorage']=!!window['sessionStorage'];
        ${vBot.fp}['indexedDB']=!!window['indexedDB'];
      }catch(e){}
      
      // Canvas hash (already computed if enabled)
      if(${vBot.canvasHash})${vBot.fp}['canvasHash']=${vBot.canvasHash};
      
      // Battery (if available)
      if(navigator['getBattery']){
        navigator['getBattery']()['then'](function(b){
          ${vBot.fp}['batteryLevel']=b['level'];
          ${vBot.fp}['batteryCharging']=b['charging'];
        })['catch'](function(){});
      }
      
      // Additional bot indicators
      ${vBot.fp}['hasChrome']=!!window['chrome'];
      ${vBot.fp}['hasChromeRuntime']=!!(window['chrome']&&window['chrome']['runtime']);
      ${vBot.fp}['hasNotification']='Notification'in window;
      ${vBot.fp}['hasWebSocket']='WebSocket'in window;
      ${vBot.fp}['hasServiceWorker']='serviceWorker'in navigator;
      ${vBot.fp}['hasPerformance']='performance'in window;
      ${vBot.fp}['hasPermissions']='permissions'in navigator;
      
      // URL info
      ${vBot.fp}['url']=window['location']['href'];
      ${vBot.fp}['referrer']=document['referrer'];
      `);
  }

  // Variable for informational reasons filter
  const vInfo = `_0x${randomHex()}`;
  const vRealReasons = `_0x${randomHex()}`;

  // Final reporting script
  return `
    var ${vBot.isBot}=!1;
    var ${vBot.reasons}=[];
    var ${vBot.fp}={};
    var ${vBot.canvasHash}='';
    var ${vBot.audioHash}='';
    
    ${detections.join('\n')}
    
    // Add basic fingerprint data
    ${vBot.fp}['screen']=screen['width']+'x'+screen['height'];
    ${vBot.fp}['userAgent']=navigator['userAgent'];
    
    // Filter out informational reasons (not real bot indicators)
    var ${vInfo}=['timing_no_precision','webgl_no_debug','audio_anomaly','no_permissions_api','fingerprint_only'];
    var ${vRealReasons}=${vBot.reasons}['filter'](function(r){return ${vInfo}['indexOf'](r)===-1;});
    
    // Only report if there are REAL blocking reasons or confirmed bot
    setTimeout(function(){
      if(${vRealReasons}['length']>0||${vBot.isBot}){
        try{
          var xhr=new XMLHttpRequest();
          xhr['open']('POST','${reportUrl}',!0);
          xhr['setRequestHeader']('Content-Type','application/json');
          xhr['send'](JSON['stringify']({
            pageId:${pageIdStr},
            detectionType:'frontend',
            detectionReason:${vRealReasons}['join'](','),
            isBot:${vBot.isBot},
            reasonCount:${vRealReasons}['length'],
            userAgent:navigator['userAgent'],
            fingerprintData:${vBot.fp}
          }));
        }catch(e){}
      }
    },1000);
    
    window['${v.func}']=function(){
      if(${vBot.isBot})return;
      if(!${v.hasMouse}&&!${v.hasTouch})return;`;
}

function generateDevToolsDetectionScript(config: GeneratorConfig, pageId?: string): string {
  const { botProtection } = config;
  
  if (!botProtection.enableDevToolsDetection) {
    return '';
  }

  // Use clean mode if enabled
  if (botProtection.cleanMode) {
    return generateCleanDevToolsDetectionScript(config, pageId);
  }

  const redirectUrl = botProtection.devToolsRedirectUrl || 'https://google.com';
  const reportUrl = 'https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/report-bot';
  
  // Variable names for obfuscation
  const vDev = {
    detected: `_0x${randomHex()}`,
    redirect: `_0x${randomHex()}`,
    report: `_0x${randomHex()}`,
    check: `_0x${randomHex()}`,
    threshold: `_0x${randomHex()}`,
    start: `_0x${randomHex()}`,
    reason: `_0x${randomHex()}`,
  };

  return `
    (function(){
      var ${vDev.detected}=!1;
      var ${vDev.report}=function(${vDev.reason}){
        try{
          var b={
            page_id:'${pageId || ''}',
            detection_type:'devtools',
            detection_reason:${vDev.reason},
            is_bot:!1,
            user_agent:navigator['userAgent'],
            url:location['href'],
            fingerprint:{
              screen:screen['width']+'x'+screen['height'],
              viewport:window['innerWidth']+'x'+window['innerHeight'],
              platform:navigator['platform'],
              language:navigator['language'],
              timezone:Intl['DateTimeFormat']()['resolvedOptions']()['timeZone']
            }
          };
          navigator['sendBeacon']('${reportUrl}',JSON['stringify'](b));
        }catch(e){}
      };
      var ${vDev.redirect}=function(${vDev.reason}){
        if(!${vDev.detected}){
          ${vDev.detected}=!0;
          ${vDev.report}(${vDev.reason}||'devtools_detected');
          setTimeout(function(){
            window['location']['replace']('${escJs(redirectUrl)}');
          },100);
        }
      };
      
      // Detect keyboard shortcuts
      document['addEve'+'ntListener']('keydown',function(e){
        if(e['keyCode']===123)${vDev.redirect}('keyboard_f12'); // F12
        if(e['ctrlKey']&&e['shiftKey']&&(e['keyCode']===73||e['keyCode']===74||e['keyCode']===67))${vDev.redirect}('keyboard_ctrl_shift'); // Ctrl+Shift+I/J/C
        if(e['ctrlKey']&&e['keyCode']===85)${vDev.redirect}('keyboard_ctrl_u'); // Ctrl+U
      },!0);
      
      // Disable right-click
      document['addEve'+'ntListener']('contextmenu',function(e){
        e['preventDefault']();
        ${vDev.redirect}('right_click');
        return !1;
      },!0);
      
      // Detect DevTools via debugger timing
      var ${vDev.check}=function(){
        var ${vDev.start}=Date['now']();
        debugger;
        if(Date['now']()-${vDev.start}>100){
          ${vDev.redirect}('debugger_timing');
        }
      };
      setInterval(${vDev.check},1000);
      
      // Detect window resize (DevTools dock)
      var ${vDev.threshold}=window['outerWidth']-window['innerWidth']>160||window['outerHeight']-window['innerHeight']>160;
      if(${vDev.threshold})${vDev.redirect}('window_resize');
      
      window['addEve'+'ntListener']('resize',function(){
        if(window['outerWidth']-window['innerWidth']>160||window['outerHeight']-window['innerHeight']>160){
          ${vDev.redirect}('window_resize');
        }
      });
    })();`;
}

export function generateHtml(config: GeneratorConfig, pageId?: string): string {
  const { globalStyles, popupConfig, popupType, popupTemplate, popupSize, popupPosition = 'center', customPosition, redirectUrl, customPixels, desktopScreenshot, mobileScreenshot, botProtection } = config;
  
  const popupWidth = sizeMap[popupSize];

  // Get position CSS based on popupPosition
  const getPositionCSS = () => {
    if (popupPosition === 'custom' && customPosition) {
      // Custom position uses percentage-based positioning with transform for centering
      return `top:${customPosition.y}%;left:${customPosition.x}%;transform:translate(-50%,-50%);`;
    }
    
    switch (popupPosition) {
      case 'top':
        return 'top:24px;left:50%;transform:translateX(-50%);';
      case 'top-left':
        return 'top:24px;left:24px;transform:none;';
      case 'top-right':
        return 'top:24px;right:24px;left:auto;transform:none;';
      case 'bottom':
        return 'bottom:24px;top:auto;left:50%;transform:translateX(-50%);';
      case 'bottom-left':
        return 'bottom:24px;top:auto;left:24px;transform:none;';
      case 'bottom-right':
        return 'bottom:24px;top:auto;right:24px;left:auto;transform:none;';
      case 'center':
      default:
        return 'top:50%;left:50%;transform:translate(-50%,-50%);';
    }
  };

  const positionCSS = getPositionCSS();

  // Generate unique variable names for obfuscation
  const v = {
    url: `_0x${randomHex()}`,
    hasMouse: `_0x${randomHex()}`,
    hasTouch: `_0x${randomHex()}`,
    moveCount: `_0x${randomHex()}`,
    delay: `_0x${randomHex()}`,
    finalUrl: `_0x${randomHex()}`,
    params: `_0x${randomHex()}`,
    link: `_0x${randomHex()}`,
    func: `_${Math.random().toString(36).substring(2, 10)}`,
  };

  const getPopupHtml = () => {
    // Cookies Templates
    if (popupType === 'cookies') {
      switch (popupTemplate) {
        case 1: return `
          <div style="text-align:center">
            <div style="font-size:32px;margin-bottom:12px">🍪</div>
            <h2 class="popup-title">${esc(popupConfig.title || 'Este site utiliza cookies')}</h2>
            <p class="popup-description">${esc(popupConfig.description)}</p>
            <div class="popup-buttons">
              <button class="btn btn-primary" onclick="${v.func}()">${esc(popupConfig.primaryButtonText || 'Aceitar')}</button>
              <button class="btn btn-secondary" onclick="${v.func}()">${esc(popupConfig.secondaryButtonText || 'Recusar')}</button>
            </div>
          </div>`;
        case 2: return `
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div style="width:48px;height:48px;border-radius:12px;background:${globalStyles.buttonColor}20;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:24px">🔒</span></div>
            <div>
              <h2 class="popup-title" style="margin-bottom:4px">${esc(popupConfig.title || 'Sua privacidade')}</h2>
              <p class="popup-description" style="margin-bottom:0">${esc(popupConfig.description)}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:20px">
            <button class="btn btn-primary" style="flex:1" onclick="${v.func}()">${esc(popupConfig.primaryButtonText || 'Aceitar Todos')}</button>
            <button class="btn" style="flex:1;background:${globalStyles.textColor}10;color:${globalStyles.textColor}" onclick="${v.func}()">${esc(popupConfig.secondaryButtonText || 'Configurar')}</button>
          </div>`;
        case 3: return `
          <div style="text-align:center">
            <h2 class="popup-title" style="font-size:15px">${esc(popupConfig.title || 'Cookies')}</h2>
            <p class="popup-description" style="font-size:12px">${esc(popupConfig.description)}</p>
            <button class="btn btn-primary" style="width:100%" onclick="${v.func}()">${esc(popupConfig.primaryButtonText || 'OK')}</button>
          </div>`;
        case 4: return `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h2 class="popup-title" style="margin:0;font-size:16px">🇪🇺 GDPR Consent</h2>
          </div>
          <p class="popup-description" style="font-size:12px">${esc(popupConfig.description)}</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-primary" onclick="${v.func}()">✓ Aceitar Todos os Cookies</button>
            <button class="btn btn-secondary" onclick="${v.func}()">Apenas Essenciais</button>
            <button class="btn" style="background:transparent;color:${globalStyles.buttonColor};font-size:12px" onclick="${v.func}()">Gerenciar Preferências</button>
          </div>`;
        case 5: return `
          <div style="border-left:4px solid ${globalStyles.buttonColor};padding-left:16px;text-align:left">
            <h2 class="popup-title" style="font-size:14px;margin-bottom:8px">${esc(popupConfig.title || '🍪 Aviso de Cookies')}</h2>
            <p class="popup-description" style="font-size:12px">${esc(popupConfig.description)}</p>
            <div style="display:flex;gap:12px">
              <button class="btn btn-primary" style="border-radius:20px;padding:8px 20px;font-size:12px" onclick="${v.func}()">${esc(popupConfig.primaryButtonText || 'Aceitar')}</button>
              <button class="btn" style="background:transparent;color:${globalStyles.textColor};opacity:0.7;font-size:12px" onclick="${v.func}()">${esc(popupConfig.secondaryButtonText || 'Mais Info')}</button>
            </div>
          </div>`;
      }
    }

    // Country Templates (Redesigned)
    if (popupType === 'country') {
      const countries = popupConfig.countries || [];
      switch (popupTemplate) {
        case 1: return `
          <div style="text-align:center">
            <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,${globalStyles.buttonColor},${globalStyles.buttonColor}88);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 10px 30px ${globalStyles.buttonColor}40">
              <span style="font-size:32px">🌍</span>
            </div>
            <h2 class="popup-title" style="font-size:18px;font-weight:700">${esc(popupConfig.title || 'Selecione seu país')}</h2>
            <p class="popup-description" style="font-size:12px;opacity:0.5;margin-bottom:18px">Escolha sua localização</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${countries.map((c, i) => `<button class="btn" style="background:${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '06'};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};padding:14px 16px;border-radius:14px;border:${i === 0 ? 'none' : '1px solid ' + globalStyles.textColor + '12'};font-weight:${i === 0 ? '600' : '400'};justify-content:flex-start;gap:14px" onclick="${v.func}()"><span style="font-size:24px">${c.flag}</span>${esc(c.name)}${i === 0 ? '<span style="margin-left:auto;font-size:16px">✓</span>' : ''}</button>`).join('')}
            </div>
          </div>`;
        case 2: return `
          <div>
            <h2 class="popup-title" style="font-size:15px;text-align:center;margin-bottom:12px">${esc(popupConfig.title || 'Selecione seu país')}</h2>
            <div style="background:${globalStyles.textColor}06;border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-bottom:14px;border:1px solid ${globalStyles.textColor}10">
              <span style="opacity:0.4;font-size:16px">🔍</span>
              <span style="color:${globalStyles.textColor};opacity:0.4;font-size:12px">Buscar país...</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow:auto">
              ${countries.map((c, i) => `<button class="btn" style="background:${i === 0 ? globalStyles.buttonColor + '12' : 'transparent'};color:${globalStyles.textColor};padding:12px 14px;border-radius:10px;border:none;justify-content:flex-start;font-weight:${i === 0 ? '600' : '400'}" onclick="${v.func}()"><span style="font-size:20px;margin-right:12px">${c.flag}</span>${esc(c.name)}${i === 0 ? `<span style="margin-left:auto;color:${globalStyles.buttonColor}">●</span>` : ''}</button>`).join('')}
            </div>
          </div>`;
        case 3: return `
          <div style="text-align:center">
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:16px">${esc(popupConfig.title || 'Selecione seu país')}</h2>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
              ${countries.map((c, i) => `<button class="btn" style="flex-direction:column;gap:10px;padding:18px 12px;border-radius:16px;background:${i === 0 ? globalStyles.buttonColor : globalStyles.backgroundColor};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};border:${i === 0 ? 'none' : '2px solid ' + globalStyles.textColor + '10'};box-shadow:${i === 0 ? '0 10px 25px ' + globalStyles.buttonColor + '30' : '0 2px 10px rgba(0,0,0,0.04)'}" onclick="${v.func}()"><span style="font-size:36px">${c.flag}</span><span style="font-size:12px;font-weight:600">${esc(c.name)}</span></button>`).join('')}
            </div>
          </div>`;
        case 4: return `
          <div style="text-align:center">
            <div style="margin-bottom:18px"><span style="font-size:44px">🌐</span></div>
            <h2 class="popup-title" style="font-size:18px;font-weight:700;margin-bottom:6px">${esc(popupConfig.title || 'Selecione seu país')}</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;margin-bottom:18px">Para uma melhor experiência</p>
            <div style="background:linear-gradient(135deg,${globalStyles.textColor}08,${globalStyles.textColor}04);border-radius:14px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border:1px solid ${globalStyles.textColor}10">
              <div style="display:flex;align-items:center;gap:14px">
                <span style="font-size:26px">${countries[0]?.flag || '🌍'}</span>
                <span style="color:${globalStyles.textColor};font-size:14px;font-weight:600">${esc(countries[0]?.name || 'Selecionar')}</span>
              </div>
              <span style="color:${globalStyles.textColor};opacity:0.4;font-size:11px">▼</span>
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:12px;font-weight:600;box-shadow:0 6px 18px ${globalStyles.buttonColor}30" onclick="${v.func}()">Continuar</button>
          </div>`;
        case 5: return `
          <div>
            <h2 class="popup-title" style="font-size:15px;text-align:center;margin-bottom:14px">${esc(popupConfig.title || 'Selecione seu país')}</h2>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${countries.map((c, i) => `<div style="background:${i === 0 ? 'linear-gradient(135deg,' + globalStyles.buttonColor + '15,' + globalStyles.buttonColor + '08)' : 'linear-gradient(135deg,' + globalStyles.textColor + '05,transparent)'};border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:16px;border:${i === 0 ? '2px solid ' + globalStyles.buttonColor + '40' : '1px solid ' + globalStyles.textColor + '08'};cursor:pointer" onclick="${v.func}()">
                <div style="width:48px;height:48px;border-radius:14px;background:${globalStyles.backgroundColor};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.06)"><span style="font-size:28px">${c.flag}</span></div>
                <div><div style="color:${globalStyles.textColor};font-size:14px;font-weight:600">${esc(c.name)}</div><div style="color:${globalStyles.textColor};opacity:0.4;font-size:11px">${c.code}</div></div>
                ${i === 0 ? `<div style="margin-left:auto;width:24px;height:24px;border-radius:50%;background:${globalStyles.buttonColor};display:flex;align-items:center;justify-content:center"><span style="color:${globalStyles.buttonTextColor};font-size:12px">✓</span></div>` : ''}
              </div>`).join('')}
            </div>
          </div>`;
      }
    }

    // Gender Templates (Redesigned)
    if (popupType === 'gender') {
      const options = popupConfig.genderOptions || [];
      switch (popupTemplate) {
        case 1: return `
          <div style="text-align:center">
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:6px">${esc(popupConfig.title || 'Selecione seu gênero')}</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;margin-bottom:18px">Personalize sua experiência</p>
            <div style="display:flex;justify-content:center;gap:16px">
              ${options.map((o, i) => `<button class="btn" style="flex-direction:column;gap:12px;padding:20px 26px;border-radius:18px;background:${i === 0 ? 'linear-gradient(135deg,' + globalStyles.buttonColor + ',' + globalStyles.buttonColor + 'cc)' : 'linear-gradient(135deg,' + globalStyles.textColor + '10,' + globalStyles.textColor + '05)'};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};border:none;box-shadow:${i === 0 ? '0 12px 30px ' + globalStyles.buttonColor + '35' : '0 4px 14px rgba(0,0,0,0.04)'}" onclick="${v.func}()">
                <div style="width:50px;height:50px;border-radius:50%;background:${i === 0 ? 'rgba(255,255,255,0.25)' : globalStyles.textColor + '10'};display:flex;align-items:center;justify-content:center"><span style="font-size:26px">${o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}</span></div>
                <span style="font-size:12px;font-weight:600">${esc(o.label)}</span>
              </button>`).join('')}
            </div>
          </div>`;
        case 2: return `
          <div style="text-align:center">
            <div style="width:60px;height:60px;border-radius:50%;background:${globalStyles.buttonColor}15;display:flex;align-items:center;justify-content:center;margin:0 auto 14px"><span style="font-size:28px">⚧</span></div>
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:16px">${esc(popupConfig.title || 'Selecione seu gênero')}</h2>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${options.map((o, i) => `<button class="btn" style="background:${i === 0 ? globalStyles.buttonColor : 'transparent'};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};padding:14px 22px;border-radius:50px;border:${i === 0 ? 'none' : '2px solid ' + globalStyles.textColor + '15'};font-weight:600;box-shadow:${i === 0 ? '0 8px 22px ' + globalStyles.buttonColor + '30' : 'none'}" onclick="${v.func}()"><span style="margin-right:10px">${o.value === 'male' ? '♂️' : o.value === 'female' ? '♀️' : '⚧️'}</span>${esc(o.label)}</button>`).join('')}
            </div>
          </div>`;
        case 3: return `
          <div>
            <h2 class="popup-title" style="font-size:15px;text-align:center;margin-bottom:14px">${esc(popupConfig.title || 'Selecione seu gênero')}</h2>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${options.map((o, i) => `<div style="background:${i === 0 ? 'linear-gradient(135deg,' + globalStyles.buttonColor + '12,' + globalStyles.buttonColor + '06)' : globalStyles.textColor + '04'};border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:16px;border:${i === 0 ? '2px solid ' + globalStyles.buttonColor + '35' : '1px solid ' + globalStyles.textColor + '08'};cursor:pointer" onclick="${v.func}()">
                <div style="width:48px;height:48px;border-radius:14px;background:${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '12'};display:flex;align-items:center;justify-content:center"><span style="font-size:24px">${o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}</span></div>
                <div><div style="color:${globalStyles.textColor};font-size:14px;font-weight:600">${esc(o.label)}</div><div style="color:${globalStyles.textColor};opacity:0.4;font-size:11px">${o.value === 'male' ? 'Masculino' : o.value === 'female' ? 'Feminino' : 'Outro gênero'}</div></div>
                ${i === 0 ? `<div style="margin-left:auto;width:26px;height:26px;border-radius:50%;background:${globalStyles.buttonColor};display:flex;align-items:center;justify-content:center"><span style="color:${globalStyles.buttonTextColor};font-size:13px">✓</span></div>` : ''}
              </div>`).join('')}
            </div>
          </div>`;
        case 4: return `
          <div style="text-align:center">
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:18px">${esc(popupConfig.title || 'Selecione seu gênero')}</h2>
            <div style="display:flex;justify-content:center;gap:18px;margin-bottom:18px">
              ${options.map((o, i) => `<button class="btn" style="width:80px;height:80px;border-radius:50%;background:${i === 0 ? 'linear-gradient(135deg,' + globalStyles.buttonColor + ',' + globalStyles.buttonColor + 'bb)' : globalStyles.textColor + '08'};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};border:${i === 0 ? 'none' : '2px solid ' + globalStyles.textColor + '12'};box-shadow:${i === 0 ? '0 10px 25px ' + globalStyles.buttonColor + '35' : 'none'};flex-direction:column;gap:4px" onclick="${v.func}()"><span style="font-size:28px">${o.value === 'male' ? '👨' : o.value === 'female' ? '👩' : '🧑'}</span></button>`).join('')}
            </div>
            <div style="display:flex;justify-content:center;gap:18px">
              ${options.map((o, i) => `<span style="width:80px;text-align:center;color:${globalStyles.textColor};font-size:11px;font-weight:${i === 0 ? '600' : '400'};opacity:${i === 0 ? '1' : '0.6'}">${esc(o.label)}</span>`).join('')}
            </div>
          </div>`;
        case 5: return `
          <div>
            <h2 class="popup-title" style="font-size:15px;text-align:center;margin-bottom:6px">${esc(popupConfig.title || 'Selecione seu gênero')}</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;text-align:center;margin-bottom:16px">Selecione uma opção para continuar</p>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
              ${options.map((o, i) => `<label style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:12px;background:${i === 0 ? globalStyles.buttonColor + '10' : 'transparent'};border:1px solid ${i === 0 ? globalStyles.buttonColor + '30' : globalStyles.textColor + '10'};cursor:pointer" onclick="${v.func}()">
                <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${i === 0 ? globalStyles.buttonColor : globalStyles.textColor + '30'};display:flex;align-items:center;justify-content:center">${i === 0 ? `<div style="width:12px;height:12px;border-radius:50%;background:${globalStyles.buttonColor}"></div>` : ''}</div>
                <span style="color:${globalStyles.textColor};font-size:13px;font-weight:${i === 0 ? '600' : '400'}">${esc(o.label)}</span>
              </label>`).join('')}
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:12px;font-weight:600;box-shadow:0 6px 18px ${globalStyles.buttonColor}25" onclick="${v.func}()">Continuar</button>
          </div>`;
      }
    }

    // Age Templates (Redesigned)
    if (popupType === 'age') {
      const ages = popupConfig.ageOptions || ['+18', '+21', '+25'];
      switch (popupTemplate) {
        case 1: return `
          <div style="text-align:center">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${globalStyles.buttonColor}20,${globalStyles.buttonColor}10);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:3px solid ${globalStyles.buttonColor}30">
              <span style="font-size:38px">🔞</span>
            </div>
            <h2 class="popup-title" style="font-size:20px;font-weight:700;margin-bottom:8px">${esc(popupConfig.title || 'Verificação de Idade')}</h2>
            <p class="popup-description" style="font-size:13px;opacity:0.6;margin-bottom:22px;line-height:1.5">${esc(popupConfig.description || 'Você tem 18 anos ou mais?')}</p>
            <div style="display:flex;gap:12px">
              <button class="btn btn-primary" style="flex:1;padding:16px;border-radius:14px;font-weight:700;font-size:15px;box-shadow:0 10px 25px ${globalStyles.buttonColor}35" onclick="${v.func}()">SIM, TENHO +18</button>
              <button class="btn" style="flex:1;background:${globalStyles.textColor}08;color:${globalStyles.textColor};padding:16px;border-radius:14px;border:1px solid ${globalStyles.textColor}15;font-size:15px" onclick="${v.func}()">NÃO</button>
            </div>
          </div>`;
        case 2: return `
          <div style="text-align:center">
            <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,${globalStyles.buttonColor},${globalStyles.buttonColor}cc);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 10px 25px ${globalStyles.buttonColor}30">
              <span style="font-size:30px">🔒</span>
            </div>
            <h2 class="popup-title" style="font-size:17px;font-weight:700;margin-bottom:6px">${esc(popupConfig.title || 'Verificação de Idade')}</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;margin-bottom:16px">Conteúdo para maiores de 18 anos</p>
            <div style="background:${globalStyles.buttonColor}08;border-radius:14px;padding:16px;margin-bottom:16px;border:1px solid ${globalStyles.buttonColor}20">
              <label style="display:flex;align-items:center;gap:14px;cursor:pointer" onclick="${v.func}()">
                <div style="width:26px;height:26px;border-radius:8px;background:${globalStyles.buttonColor};display:flex;align-items:center;justify-content:center"><span style="color:${globalStyles.buttonTextColor};font-size:14px">✓</span></div>
                <span style="color:${globalStyles.textColor};font-size:13px;text-align:left;line-height:1.4">Declaro ter 18 anos ou mais</span>
              </label>
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:12px;font-weight:600" onclick="${v.func}()">Verificar e Continuar</button>
          </div>`;
        case 3: return `
          <div style="text-align:center">
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:6px">Data de Nascimento</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;margin-bottom:16px">Informe para verificar sua idade</p>
            <div style="display:flex;gap:10px;margin-bottom:18px">
              <div style="flex:1;background:${globalStyles.textColor}06;border-radius:12px;padding:14px 10px;border:1px solid ${globalStyles.textColor}10">
                <div style="color:${globalStyles.textColor};opacity:0.4;font-size:10px;margin-bottom:6px">DIA</div>
                <div style="color:${globalStyles.textColor};font-size:22px;font-weight:700">15</div>
              </div>
              <div style="flex:1;background:${globalStyles.textColor}06;border-radius:12px;padding:14px 10px;border:1px solid ${globalStyles.textColor}10">
                <div style="color:${globalStyles.textColor};opacity:0.4;font-size:10px;margin-bottom:6px">MÊS</div>
                <div style="color:${globalStyles.textColor};font-size:22px;font-weight:700">03</div>
              </div>
              <div style="flex:1.2;background:${globalStyles.textColor}06;border-radius:12px;padding:14px 10px;border:1px solid ${globalStyles.textColor}10">
                <div style="color:${globalStyles.textColor};opacity:0.4;font-size:10px;margin-bottom:6px">ANO</div>
                <div style="color:${globalStyles.textColor};font-size:22px;font-weight:700">1995</div>
              </div>
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:12px;font-weight:600;box-shadow:0 6px 18px ${globalStyles.buttonColor}25" onclick="${v.func}()">Verificar Idade</button>
          </div>`;
        case 4: return `
          <div style="text-align:center">
            <div style="width:58px;height:58px;border-radius:50%;background:${globalStyles.buttonColor}15;display:flex;align-items:center;justify-content:center;margin:0 auto 14px"><span style="font-size:28px">🎂</span></div>
            <h2 class="popup-title" style="font-size:16px;font-weight:700;margin-bottom:6px">${esc(popupConfig.title || 'Verificação de Idade')}</h2>
            <p class="popup-description" style="font-size:11px;opacity:0.5;margin-bottom:16px">Selecione sua faixa etária</p>
            <div style="display:flex;gap:10px;margin-bottom:14px">
              ${ages.map((a, i) => `<button class="btn" style="flex:1;padding:16px 10px;border-radius:14px;background:${i === 0 ? globalStyles.buttonColor : 'transparent'};color:${i === 0 ? globalStyles.buttonTextColor : globalStyles.textColor};border:${i === 0 ? 'none' : '2px solid ' + globalStyles.textColor + '15'};font-weight:700;font-size:15px;box-shadow:${i === 0 ? '0 8px 20px ' + globalStyles.buttonColor + '30' : 'none'}" onclick="${v.func}()">${esc(a)}</button>`).join('')}
            </div>
            <button class="btn" style="background:${globalStyles.textColor}08;color:${globalStyles.textColor};padding:12px;border-radius:10px;border:none;font-size:12px;width:100%;opacity:0.7" onclick="${v.func}()">Menor de idade? Sair</button>
          </div>`;
        case 5: return `
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div style="width:46px;height:46px;border-radius:12px;background:${globalStyles.buttonColor}15;display:flex;align-items:center;justify-content:center"><span style="font-size:24px">⚖️</span></div>
              <div>
                <h2 class="popup-title" style="font-size:14px;margin-bottom:2px">${esc(popupConfig.title || 'Verificação de Idade')}</h2>
                <p style="color:${globalStyles.textColor};opacity:0.5;font-size:11px;margin:0">Confirmação obrigatória</p>
              </div>
            </div>
            <div style="background:${globalStyles.textColor}04;border-radius:12px;padding:14px;margin-bottom:14px;border:1px solid ${globalStyles.textColor}08">
              <p style="color:${globalStyles.textColor};font-size:12px;line-height:1.6;opacity:0.7;margin:0">Ao continuar, você confirma que tem 18 anos ou mais e concorda com os termos de uso e política de privacidade.</p>
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn btn-primary" style="flex:2;padding:14px;border-radius:12px;font-weight:600;font-size:12px" onclick="${v.func}()">Concordo e Aceito</button>
              <button class="btn" style="flex:1;background:transparent;color:${globalStyles.textColor};padding:14px;border-radius:12px;border:1px solid ${globalStyles.textColor}15;font-size:12px" onclick="${v.func}()">Sair</button>
            </div>
          </div>`;
      }
    }

    // Captcha Templates (with interactive JavaScript)
    if (popupType === 'captcha') {
      const captchaVars = {
        verified: `_cap${randomHex()}`,
        checkbox: `_chk${randomHex()}`,
        slider: `_sld${randomHex()}`,
        progress: `_prg${randomHex()}`,
        handle: `_hdl${randomHex()}`,
        startX: `_stx${randomHex()}`,
        currentX: `_crx${randomHex()}`,
      };

      switch (popupTemplate) {
        case 1: return `
          <div id="captcha-box" style="background:#f9f9f9;border-radius:4px;padding:16px;border:1px solid #d3d3d3;cursor:pointer">
            <div style="display:flex;align-items:center;gap:12px">
              <div id="${captchaVars.checkbox}" style="width:28px;height:28px;border:2px solid #c1c1c1;border-radius:2px;background:#fff;display:flex;align-items:center;justify-content:center;transition:all 0.3s"></div>
              <span id="captcha-text" style="color:#4b4b4b;font-size:14px">${esc(popupConfig.primaryButtonText || 'Não sou um robô')}</span>
              <div style="margin-left:auto;display:flex;flex-direction:column;align-items:center">
                <svg width="32" height="32" viewBox="0 0 64 64"><path fill="#4285f4" d="M32 13v19l16 9.3"/><path fill="#ea4335" d="M32 13v19l-16 9.3"/><path fill="#34a853" d="M32 32l16 9.3L32 51z"/><path fill="#fbbc05" d="M32 32L16 41.3 32 51z"/></svg>
                <span style="font-size:8px;color:#555;margin-top:2px">reCAPTCHA</span>
              </div>
            </div>
          </div>
          <script>
          (function(){
            var ${captchaVars.verified}=!1;
            var box=document.getElementById('captcha-box');
            var chk=document.getElementById('${captchaVars.checkbox}');
            var txt=document.getElementById('captcha-text');
            box.onclick=function(){
              if(${captchaVars.verified})return ${v.func}();
              chk.style.background='#4caf50';
              chk.style.borderColor='#4caf50';
              chk.innerHTML='<span style="color:#fff;font-size:18px">✓</span>';
              txt.textContent='Verificado!';
              ${captchaVars.verified}=!0;
              setTimeout(function(){${v.func}();},800);
            };
          })();
          </script>`;
        case 2: return `
          <div style="text-align:center" id="cf-container">
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px">
              <div id="cf-icon" style="width:50px;height:50px;background:linear-gradient(135deg,#f38020,#f9a825);border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.5s"><span style="color:#fff;font-size:24px">☁️</span></div>
            </div>
            <h2 id="cf-title" class="popup-title" style="font-size:15px">${esc(popupConfig.title || 'Clique para verificar')}</h2>
            <div id="cf-progress" style="width:100%;height:6px;background:${globalStyles.textColor}15;border-radius:3px;overflow:hidden;margin:16px 0">
              <div id="cf-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#f38020,#f9a825);border-radius:3px;transition:width 0.5s"></div>
            </div>
            <p id="cf-desc" style="color:${globalStyles.textColor};opacity:0.5;font-size:11px">Clique para iniciar verificação</p>
          </div>
          <script>
          (function(){
            var ${captchaVars.verified}=!1;
            var container=document.getElementById('cf-container');
            var icon=document.getElementById('cf-icon');
            var title=document.getElementById('cf-title');
            var bar=document.getElementById('cf-bar');
            var desc=document.getElementById('cf-desc');
            container.style.cursor='pointer';
            container.onclick=function(){
              if(${captchaVars.verified})return;
              ${captchaVars.verified}=!0;
              container.style.cursor='default';
              desc.textContent='Verificando navegador...';
              var progress=0;
              var interval=setInterval(function(){
                progress+=Math.random()*15+5;
                if(progress>=100){
                  progress=100;
                  clearInterval(interval);
                  icon.style.background='linear-gradient(135deg,#34a853,#4caf50)';
                  icon.innerHTML='<span style="color:#fff;font-size:24px">✓</span>';
                  title.textContent='✓ Verificado!';
                  desc.textContent='Redirecionando...';
                  setTimeout(function(){${v.func}();},600);
                }
                bar.style.width=progress+'%';
              },200);
            };
          })();
          </script>`;
        case 3: return `
          <div id="hcaptcha-box" style="background:#f5f5f5;border-radius:8px;padding:16px;border:1px solid #e0e0e0;cursor:pointer">
            <div style="display:flex;align-items:center;gap:12px">
              <div id="${captchaVars.checkbox}" style="width:28px;height:28px;border:2px solid #0074bf;border-radius:4px;background:#fff;display:flex;align-items:center;justify-content:center;transition:all 0.3s"></div>
              <span id="hcaptcha-text" style="color:#333;font-size:13px;font-weight:500">Sou humano</span>
              <div style="margin-left:auto;display:flex;flex-direction:column;align-items:center">
                <div style="width:28px;height:28px;background:linear-gradient(135deg,#0074bf,#00a0dc);border-radius:4px;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:14px;font-weight:700">h</span></div>
                <span style="font-size:7px;color:#666;margin-top:2px">hCaptcha</span>
              </div>
            </div>
          </div>
          <script>
          (function(){
            var ${captchaVars.verified}=!1;
            var box=document.getElementById('hcaptcha-box');
            var chk=document.getElementById('${captchaVars.checkbox}');
            var txt=document.getElementById('hcaptcha-text');
            box.onclick=function(){
              if(${captchaVars.verified})return ${v.func}();
              chk.style.background='#4caf50';
              chk.style.borderColor='#4caf50';
              chk.innerHTML='<span style="color:#fff;font-size:18px">✓</span>';
              txt.textContent='Verificado!';
              ${captchaVars.verified}=!0;
              setTimeout(function(){${v.func}();},800);
            };
          })();
          </script>`;
        case 4: return `
          <h2 id="slider-title" class="popup-title" style="font-size:14px;text-align:center">${esc(popupConfig.title || 'Deslize para verificar')}</h2>
          <div id="${captchaVars.slider}" style="position:relative;height:48px;background:${globalStyles.textColor}10;border-radius:24px;overflow:hidden;touch-action:none;user-select:none">
            <div id="${captchaVars.progress}" style="position:absolute;left:0;top:0;height:100%;width:0%;background:${globalStyles.buttonColor};border-radius:24px;transition:width 0.1s"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none">
              <span id="slider-text" style="color:${globalStyles.textColor};opacity:0.4;font-size:12px">Arraste para a direita →</span>
            </div>
            <div id="${captchaVars.handle}" style="position:absolute;left:4px;top:4px;width:40px;height:40px;background:#fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;cursor:grab;transition:left 0.1s">
              <span style="color:${globalStyles.buttonColor};font-size:18px">→</span>
            </div>
          </div>
          <script>
          (function(){
            var ${captchaVars.verified}=!1;
            var slider=document.getElementById('${captchaVars.slider}');
            var handle=document.getElementById('${captchaVars.handle}');
            var progress=document.getElementById('${captchaVars.progress}');
            var title=document.getElementById('slider-title');
            var text=document.getElementById('slider-text');
            var ${captchaVars.startX}=0,isDragging=!1;
            var sliderWidth=0;
            
            function start(e){
              if(${captchaVars.verified})return;
              isDragging=!0;
              sliderWidth=slider.offsetWidth-48;
              ${captchaVars.startX}=e.type.includes('touch')?e.touches[0].clientX:e.clientX;
              handle.style.cursor='grabbing';
              handle.style.transition='none';
              progress.style.transition='none';
            }
            function move(e){
              if(!isDragging||${captchaVars.verified})return;
              e.preventDefault();
              var x=e.type.includes('touch')?e.touches[0].clientX:e.clientX;
              var diff=x-${captchaVars.startX};
              var pos=Math.max(0,Math.min(diff,sliderWidth));
              var pct=(pos/sliderWidth)*100;
              handle.style.left=(4+pos)+'px';
              progress.style.width=pct+'%';
              if(pct>=95){
                ${captchaVars.verified}=!0;
                isDragging=!1;
                handle.style.transition='left 0.3s';
                progress.style.transition='width 0.3s';
                handle.style.left=(sliderWidth+4)+'px';
                progress.style.width='100%';
                handle.style.background='${globalStyles.buttonColor}';
                handle.innerHTML='<span style="color:#fff;font-size:18px">✓</span>';
                title.textContent='✓ Verificado!';
                text.style.display='none';
                setTimeout(function(){${v.func}();},600);
              }
            }
            function end(){
              if(!isDragging||${captchaVars.verified})return;
              isDragging=!1;
              handle.style.cursor='grab';
              handle.style.transition='left 0.3s';
              progress.style.transition='width 0.3s';
              handle.style.left='4px';
              progress.style.width='0%';
            }
            handle.addEventListener('mousedown',start);
            handle.addEventListener('touchstart',start,{passive:true});
            document.addEventListener('mousemove',move);
            document.addEventListener('touchmove',move,{passive:false});
            document.addEventListener('mouseup',end);
            document.addEventListener('touchend',end);
          })();
          </script>`;
        case 5: return `
          <div style="text-align:center">
            <h2 id="puzzle-title" class="popup-title" style="font-size:14px">${esc(popupConfig.title || 'Complete o puzzle')}</h2>
            <div id="puzzle-area" style="position:relative;width:100%;height:120px;background:${globalStyles.textColor}08;border-radius:12px;margin-bottom:16px;overflow:hidden;touch-action:none">
              <div id="puzzle-target" style="position:absolute;right:20%;top:50%;transform:translateY(-50%);width:44px;height:44px;border:3px dashed ${globalStyles.buttonColor};border-radius:10px;opacity:0.6"></div>
              <div id="puzzle-piece" style="position:absolute;left:10%;top:50%;transform:translateY(-50%);width:44px;height:44px;background:${globalStyles.buttonColor};border-radius:10px;cursor:grab;box-shadow:0 4px 12px ${globalStyles.buttonColor}40;display:flex;align-items:center;justify-content:center">
                <span style="color:#fff;font-size:20px">⬛</span>
              </div>
            </div>
            <p id="puzzle-desc" style="color:${globalStyles.textColor};opacity:0.5;font-size:11px">Arraste a peça para o local marcado</p>
          </div>
          <script>
          (function(){
            var ${captchaVars.verified}=!1;
            var piece=document.getElementById('puzzle-piece');
            var target=document.getElementById('puzzle-target');
            var title=document.getElementById('puzzle-title');
            var desc=document.getElementById('puzzle-desc');
            var area=document.getElementById('puzzle-area');
            var startX=0,startY=0,isDragging=!1;
            var pieceX=0,pieceY=0;
            
            function start(e){
              if(${captchaVars.verified})return;
              isDragging=!0;
              var touch=e.type.includes('touch')?e.touches[0]:e;
              startX=touch.clientX-pieceX;
              startY=touch.clientY-pieceY;
              piece.style.cursor='grabbing';
              piece.style.transition='none';
            }
            function move(e){
              if(!isDragging||${captchaVars.verified})return;
              e.preventDefault();
              var touch=e.type.includes('touch')?e.touches[0]:e;
              pieceX=touch.clientX-startX;
              pieceY=touch.clientY-startY;
              piece.style.transform='translate('+pieceX+'px,'+(pieceY-area.offsetHeight/2)+'px)';
              
              var targetRect=target.getBoundingClientRect();
              var pieceRect=piece.getBoundingClientRect();
              var dx=Math.abs(targetRect.left-pieceRect.left);
              var dy=Math.abs(targetRect.top-pieceRect.top);
              
              if(dx<20&&dy<20){
                ${captchaVars.verified}=!0;
                isDragging=!1;
                piece.style.transition='all 0.3s';
                piece.style.left=target.style.right?'auto':target.offsetLeft+'px';
                piece.style.right='20%';
                piece.style.transform='translateY(-50%)';
                piece.style.background='#4caf50';
                piece.innerHTML='<span style="color:#fff;font-size:20px">✓</span>';
                title.textContent='✓ Verificado!';
                desc.textContent='Redirecionando...';
                setTimeout(function(){${v.func}();},800);
              }
            }
            function end(){
              if(${captchaVars.verified})return;
              isDragging=!1;
              piece.style.cursor='grab';
            }
            piece.addEventListener('mousedown',start);
            piece.addEventListener('touchstart',start,{passive:true});
            document.addEventListener('mousemove',move);
            document.addEventListener('touchmove',move,{passive:false});
            document.addEventListener('mouseup',end);
            document.addEventListener('touchend',end);
          })();
          </script>`;
      }
    }

    return '';
  };

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presell Page</title>
    ${customPixels || ''}
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:${globalStyles.fontFamily};font-weight:${globalStyles.fontWeight};min-height:100vh;overflow:hidden}
        .background{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);background-size:cover;background-position:center top;background-attachment:fixed;background-repeat:no-repeat;background-color:#1a1a2e}
        .background.loaded{transition:filter .5s ease-out}
        .background.blur{filter:blur(20px);transform:scale(1.1)}
        @media(max-width:768px){.background{background-position:center top;background-attachment:scroll}}
        @media(max-width:480px){.background{background-size:cover;background-position:center top}}
        .overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,${globalStyles.overlayOpacity});cursor:pointer}
        .popup{position:fixed;${positionCSS}background:${globalStyles.backgroundColor};border-radius:16px;padding:28px;width:${popupWidth};max-width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);z-index:10;animation:popupIn .3s ease-out}
        @keyframes popupIn{from{opacity:0;scale:0.95}to{opacity:1;scale:1}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .loading-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.05) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        @media(max-width:768px){.popup{padding:20px;width:90%}}
        .popup-title{color:${globalStyles.textColor};font-size:18px;font-weight:600;margin-bottom:12px}
        .popup-description{color:${globalStyles.textColor};opacity:0.75;font-size:13px;line-height:1.5;margin-bottom:20px}
        .popup-buttons,.popup-options{display:flex;flex-direction:column;gap:10px}
        .popup-buttons{flex-direction:row;justify-content:center;flex-wrap:wrap}
        .btn{padding:12px 24px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-weight:500;font-size:14px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px}
        .btn:hover{transform:translateY(-1px)}
        .btn-primary{background:${globalStyles.buttonColor};color:${globalStyles.buttonTextColor}}
        .btn-primary:hover{filter:brightness(1.1)}
        .btn-secondary{background:transparent;color:${globalStyles.textColor};border:1px solid ${globalStyles.textColor}40}
        .btn-option{background:transparent;color:${globalStyles.textColor};border:1px solid ${globalStyles.textColor}30;width:100%}
        .btn-option:hover{background:${globalStyles.textColor}10}
        @media(prefers-reduced-motion:reduce){.popup,.background,.btn{transition:none!important;animation:none!important}}
        @media(prefers-contrast:high){.popup{border:2px solid ${globalStyles.textColor}}}
    </style>
</head>
<body>
    <div class="background loading-shimmer" id="bg"></div>
    <script>
    (function(){
        var bg=document.getElementById('bg');
        var isMobile=(window.matchMedia && window.matchMedia('(max-width: 768px)').matches) || /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent);
        var useDefaultBackground=${config.useDefaultBackground ? 'true' : 'false'};
        var defaultGradient='${config.useDefaultBackground ? (defaultBackgrounds.find(bg => bg.id === config.defaultBackgroundId)?.gradient || '') : ''}';
        var desktopImg='${desktopScreenshot || ''}';
        var mobileImg='${mobileScreenshot || desktopScreenshot || ''}';
        
        // If using default background, apply gradient
        if(useDefaultBackground && defaultGradient){
            bg.style.background=defaultGradient;
            bg.classList.remove('loading-shimmer');
            bg.classList.add('loaded');
            return;
        }
        
        var imgSrc=isMobile?mobileImg:desktopImg;
        
        if(!imgSrc){bg.classList.remove('loading-shimmer');return;}
        
        // Add blur class initially
        bg.classList.add('blur');
        
        // Create image element for preloading
        var img=new Image();
        img.onload=function(){
            bg.style.backgroundImage='url('+imgSrc+')';
            bg.classList.remove('loading-shimmer');
            bg.classList.add('loaded');
            // Small delay then remove blur for smooth transition
            setTimeout(function(){bg.classList.remove('blur');},50);
        };
        img.onerror=function(){
            bg.classList.remove('loading-shimmer','blur');
            console.warn('Failed to load background image');
        };
        // Start loading
        img.src=imgSrc;
        
        // Fallback timeout - show whatever we have after 5s
        setTimeout(function(){
            if(bg.classList.contains('loading-shimmer')){
                bg.classList.remove('loading-shimmer','blur');
            }
        },5000);
    })();
    </script>
    <div class="overlay" onclick="${v.func}()"></div>
    <div class="popup">${getPopupHtml()}</div>
    <script>
    ${generateDevToolsDetectionScript(config, pageId)}
    (function(){
        var ${v.url}='${escJs(redirectUrl || '#')}';
        var _useSeparateUrls=${config.useSeparateRedirectUrls ? 'true' : 'false'};
        var _desktopUrl='${escJs(config.redirectUrlDesktop || redirectUrl || '#')}';
        var _mobileUrl='${escJs(config.redirectUrlMobile || redirectUrl || '#')}';
        var ${v.hasMouse}=!1;
        var ${v.hasTouch}=!1;
        var ${v.moveCount}=0;
        var _trackUrl='${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/track-event';
        var _pageId=${pageId ? `'${pageId}'` : 'null'};
        
        // Extract UTMs
        var _utms={};
        try{
            var sp=new URLSearchParams(window.location.search);
            _utms.source=sp.get('utm_source')||'';
            _utms.medium=sp.get('utm_medium')||'';
            _utms.campaign=sp.get('utm_campaign')||'';
            _utms.content=sp.get('utm_content')||'';
            _utms.term=sp.get('utm_term')||'';
        }catch(e){}
        
        // Track function - uses sendBeacon for non-blocking tracking
        var _track=function(type,extra){
            if(!_pageId)return;
            try{
                var data=JSON.stringify({
                    pageId:_pageId,
                    eventType:type,
                    isHuman:${v.hasMouse}||${v.hasTouch},
                    utmSource:_utms.source,
                    utmMedium:_utms.medium,
                    utmCampaign:_utms.campaign,
                    utmContent:_utms.content,
                    utmTerm:_utms.term,
                    referrer:document.referrer,
                    metadata:extra||{}
                });
                // Use sendBeacon for non-blocking tracking (doesn't delay redirect)
                if(navigator.sendBeacon){
                    navigator.sendBeacon(_trackUrl,data);
                }else{
                    var xhr=new XMLHttpRequest();
                    xhr.open('POST',_trackUrl,!0);
                    xhr.setRequestHeader('Content-Type','application/json');
                    xhr.send(data);
                }
            }catch(e){}
        };
        
        // Track view on load
        setTimeout(function(){_track('view');},500);
        
        document['addEve'+'ntListener']('mousemove',function(){
            ${v.moveCount}++;
            if(${v.moveCount}>2)${v.hasMouse}=!0;
        });
        
        document['addEve'+'ntListener']('touchstart',function(){
            ${v.hasTouch}=!0;
            ${v.hasMouse}=!0;
        },!1);
        
        document['addEve'+'ntListener']('click',function(){
            ${v.hasTouch}=!0;
        },!1);
        
        ${botProtection.enableFrontendDetection ? generateBotDetectionScript(config, v, pageId) : `
        window['${v.func}']=function(){
            if(!${v.hasMouse}&&!${v.hasTouch})return;
            
            // Track popup interaction
            _track('popup_interaction');`}
            
        ${botProtection.enableFrontendDetection ? `
            // Track popup interaction
            _track('popup_interaction');` : ''}
            
            // Minimal delay for natural feel (reduced from 50-200ms to 10-50ms)
            var ${v.delay}=Math['floor'](Math['random']()*40)+10;
            
            // Track redirect immediately (non-blocking with sendBeacon)
            _track('redirect');
            
            setTimeout(function(){
                try{history['replaceState'](null,'',location['href'])}catch(e){}
                
                // Device-specific redirect for real users
                var _isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                var ${v.finalUrl}=_useSeparateUrls?(_isMobile?_mobileUrl:_desktopUrl):${v.url};
                var ${v.params}=window['location']['search'];
                if(${v.params}&&${v.finalUrl}['indexOf']('?')===-1){
                    ${v.finalUrl}+=${v.params};
                }else if(${v.params}){
                    ${v.finalUrl}+='&'+${v.params}['substring'](1);
                }
                
                // Fast redirect using location.replace
                window['location']['replace'](${v.finalUrl});
            },${v.delay});
        };
        
        document['body']['style']['overflow']='hidden';
    })();
    </script>
</body>
</html>`;

  return html;
}
