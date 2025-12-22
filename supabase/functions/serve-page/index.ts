import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Social apps - these are NOT bots, they are real users browsing via the app
// We should only treat them as verifiers if they use emulator WebGL
const SOCIAL_APPS = ['musical_ly', 'bytedancewebview', 'tiktok', 'fban', 'fbav', 'instagram'];

// Infrastructure bots - these are platform verifiers that crawl pages
const INFRA_BOTS = ['facebookexternalhit', 'facebookcatalog', 'facebot', 'thirdlandingpagefeinfra'];

// Emulator WebGL renderers - indicate running in a virtual environment
const EMULATOR_WEBGL = ['swiftshader', 'llvmpipe', 'virtualbox', 'vmware', 'mesa'];

// Known bot User-Agents (excluding social apps which are handled separately)
// Lista completa e sincronizada com cleanScripts.ts e generateHtml.ts
const BOT_USER_AGENTS = [
  // Google (lista completa oficial)
  'googlebot',
  'googlebot-image',
  'googlebot-video',
  'googlebot-news',
  'adsbot-google',
  'adsbot-google-mobile',
  'adsbot-google-mobile-apps',
  'google-ads',
  'google-inspectiontool',
  'google-safety',
  'google-read-aloud',
  'mediapartners-google',
  'googleweblight',
  'apis-google',
  'storebot-google',
  'google-site-verification',
  'google-structured-data-testing-tool',
  // TikTok/ByteDance crawlers (not the app)
  'bytespider',
  'tiktok_ads_bot',
  'bytedancespider',
  // Microsoft
  'bingbot',
  'adidxbot',
  'bingpreview',
  'msnbot',
  // Other crawlers
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'ia_archiver',
  'applebot',
  'crawler',
  'spider',
  'scraper',
  'headlesschrome',
  'phantomjs',
  'selenium',
  'puppeteer',
  'playwright',
  // SEO tools
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  // Social bots
  'linkedinbot',
  'twitterbot',
  'slackbot',
  'slackbot-linkexpanding',
  'pinterestbot',
  'discordbot',
];

// Known data center IPv4 ranges (simplified - first octets)
const DATA_CENTER_PREFIXES_V4 = [
  '34.', '35.', // Google Cloud
  '52.', '54.', '18.', '3.', // AWS
  '40.', '13.', // Azure
  '104.', '172.', // Cloudflare
  '157.', '199.', // Facebook
  '66.249.', // Googlebot
  // ByteDance/TikTok data centers
  '112.', '111.', // ByteDance China
  '161.', // ByteDance Singapore  
  '147.', // ByteDance US
  '103.136.', // TikTok APAC
  '128.1.', // ByteDance CDN
];

// Known data center IPv6 prefixes
const DATA_CENTER_PREFIXES_V6 = [
  // Cloudflare
  '2a06:98c0:', '2606:4700:', '2803:f800:', '2400:cb00:', '2c0f:f248:',
  // AWS
  '2600:1f', '2a05:d', '2406:da', '2620:108:',
  // Google Cloud
  '2607:f8b0:', '2001:4860:', '2a00:1450:',
  // Azure
  '2603:', '2a01:111:',
  // ByteDance/TikTok
  '2a09:', '2402:4e00:', '2001:b28:',
  // Facebook/Meta
  '2a03:2880:', '2620:0:1c',
  // DigitalOcean
  '2604:a880:', '2400:6180:',
  // Vultr
  '2001:19f0:',
  // Linode
  '2600:3c0',
  // OVH
  '2001:41d0:',
];

// TikTok Ads specific indicators in headers/UA
const TIKTOK_ADS_INDICATORS = [
  'bytedance',
  'tiktok',
  'musical_ly',
  'tt_webview',
  'trill',
  'aweme', // TikTok internal name
];

// Function to get all relevant headers for logging
function getRelevantHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const relevantHeaders = [
    'user-agent',
    'x-forwarded-for',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'x-real-ip',
    'x-original-forwarded-for',
    'via',
    'x-tiktok-',
    'x-tt-',
    'x-bd-',
    'referer',
    'origin',
  ];
  
  req.headers.forEach((value, key) => {
    const keyLower = key.toLowerCase();
    if (relevantHeaders.some(h => keyLower.startsWith(h) || keyLower === h)) {
      headers[key] = value;
    }
  });
  
  return headers;
}

// Check if UA contains a social app identifier
function isSocialApp(userAgent: string): { isSocialApp: boolean; appName: string } {
  const ua = userAgent.toLowerCase();
  for (const app of SOCIAL_APPS) {
    if (ua.includes(app)) {
      return { isSocialApp: true, appName: app };
    }
  }
  return { isSocialApp: false, appName: '' };
}

// Check if UA is an infrastructure bot (platform verifier)
function isInfraBot(userAgent: string): { isInfraBot: boolean; botName: string } {
  const ua = userAgent.toLowerCase();
  for (const bot of INFRA_BOTS) {
    if (ua.includes(bot)) {
      return { isInfraBot: true, botName: bot };
    }
  }
  return { isInfraBot: false, botName: '' };
}

// Traditional bot check (excludes social apps)
function isBot(userAgent: string): { isBot: boolean; reason: string } {
  const ua = userAgent.toLowerCase();
  
  for (const botUA of BOT_USER_AGENTS) {
    if (ua.includes(botUA)) {
      return { isBot: true, reason: `user_agent_match:${botUA}` };
    }
  }
  
  return { isBot: false, reason: '' };
}

// Cloudflare IP prefixes - should be excluded when traffic is proxied through user's Cloudflare
const CLOUDFLARE_IP_PREFIXES_V6 = [
  '2a06:98c0:', '2606:4700:', '2803:f800:', '2400:cb00:', '2c0f:f248:',
];

const CLOUDFLARE_IP_PREFIXES_V4 = [
  '104.', '172.', // Common Cloudflare ranges
];

// Check if IP is a Cloudflare IP
function isCloudflareIP(ip: string): boolean {
  const ipLower = ip.toLowerCase();
  
  for (const prefix of CLOUDFLARE_IP_PREFIXES_V6) {
    if (ipLower.startsWith(prefix.toLowerCase())) {
      return true;
    }
  }
  
  for (const prefix of CLOUDFLARE_IP_PREFIXES_V4) {
    if (ip.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// Check if IP is from a data center (supports both IPv4 and IPv6)
// skipCloudflare: when true, doesn't flag Cloudflare IPs as data center (for proxied traffic)
function isDataCenterIP(ip: string, skipCloudflare: boolean = false): { isDataCenter: boolean; provider: string } {
  // If traffic is proxied through Cloudflare (user's CDN), don't flag Cloudflare IPs
  if (skipCloudflare && isCloudflareIP(ip)) {
    return { isDataCenter: false, provider: '' };
  }
  
  // Check IPv4
  for (const prefix of DATA_CENTER_PREFIXES_V4) {
    if (ip.startsWith(prefix)) {
      return { isDataCenter: true, provider: `ipv4:${prefix}` };
    }
  }
  
  // Check IPv6 (normalize to lowercase)
  const ipLower = ip.toLowerCase();
  for (const prefix of DATA_CENTER_PREFIXES_V6) {
    if (ipLower.startsWith(prefix.toLowerCase())) {
      return { isDataCenter: true, provider: `ipv6:${prefix}` };
    }
  }
  
  return { isDataCenter: false, provider: '' };
}

// Check for TikTok Ads specific indicators
function hasTikTokAdsIndicators(req: Request, userAgent: string): { detected: boolean; reason: string } {
  const ua = userAgent.toLowerCase();
  
  // Check UA for TikTok indicators
  for (const indicator of TIKTOK_ADS_INDICATORS) {
    if (ua.includes(indicator)) {
      // Check if it's a known verifier/crawler (not real user in app)
      // TikTok Ads verification crawlers have specific patterns
      if (ua.includes('spider') || ua.includes('bot') || ua.includes('crawler')) {
        return { detected: true, reason: `tiktok_crawler:${indicator}` };
      }
    }
  }
  
  // Check for TikTok-specific headers
  const tiktokHeaders = [
    'x-tt-trace-id',
    'x-tt-token',
    'x-bd-traceid',
    'x-tt-bypass-dp',
    'x-tt-request-tag',
  ];
  
  for (const header of tiktokHeaders) {
    if (req.headers.get(header)) {
      return { detected: true, reason: `tiktok_header:${header}` };
    }
  }
  
  // Check referer for TikTok Ads patterns
  const referer = req.headers.get('referer') || '';
  if (referer.includes('ads.tiktok.com') || referer.includes('business.tiktok.com')) {
    return { detected: true, reason: 'tiktok_ads_referer' };
  }
  
  return { detected: false, reason: '' };
}

// Check for Cloudflare CDN (traffic proxied through CF)
function isCloudflareProxy(req: Request, ip: string): { isProxy: boolean; reason: string } {
  // Check for Cloudflare-specific headers
  const cfRay = req.headers.get('cf-ray');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  if (cfRay && cfConnectingIp) {
    // If CF-Connecting-IP differs from x-forwarded-for, it's proxied
    const xForwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (xForwardedFor && xForwardedFor !== cfConnectingIp) {
      return { isProxy: true, reason: 'cloudflare_proxy_detected' };
    }
  }
  
  // Check for Cloudflare IPv6 ranges
  const ipLower = ip.toLowerCase();
  if (ipLower.startsWith('2a06:98c0:') || ipLower.startsWith('2606:4700:')) {
    return { isProxy: true, reason: 'cloudflare_ip' };
  }
  
  return { isProxy: false, reason: '' };
}

function isMobile(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua);
}

// Determine traffic type based on UA and headers
// Returns: 'platform_verifier' | 'bot' | 'real_user' with detailed logging
function getTrafficType(req: Request, userAgent: string, clientIP: string): { 
  type: 'platform_verifier' | 'bot' | 'real_user'; 
  reason: string;
  checks: Record<string, any>;
} {
  const ua = userAgent.toLowerCase();
  const checks: Record<string, any> = {};
  
  // 1. Check for infrastructure bots (always platform verifiers)
  const infraCheck = isInfraBot(userAgent);
  checks.infraBot = infraCheck;
  if (infraCheck.isInfraBot) {
    return { type: 'platform_verifier', reason: `infra_bot:${infraCheck.botName}`, checks };
  }
  
  // 2. Check for TikTok Ads specific indicators
  const tiktokCheck = hasTikTokAdsIndicators(req, userAgent);
  checks.tiktokAds = tiktokCheck;
  if (tiktokCheck.detected) {
    return { type: 'platform_verifier', reason: tiktokCheck.reason, checks };
  }
  
  // 3. Check for social apps
  const socialCheck = isSocialApp(userAgent);
  checks.socialApp = socialCheck;
  if (socialCheck.isSocialApp) {
    // Social app detected - check for emulation indicators
    if (ua.includes('swiftshader') || ua.includes('llvmpipe')) {
      return { type: 'platform_verifier', reason: `social_app_emulator:${socialCheck.appName}`, checks };
    }
    // Real user using social app
    return { type: 'real_user', reason: '', checks };
  }
  
  // 4. Check for traditional bots
  const botCheck = isBot(userAgent);
  checks.botUA = botCheck;
  if (botCheck.isBot) {
    return { type: 'bot', reason: botCheck.reason, checks };
  }
  
  // 5. Check for Cloudflare proxy (suspicious if coming through CF Workers/Proxy)
  const cfCheck = isCloudflareProxy(req, clientIP);
  checks.cloudflareProxy = cfCheck;
  
  return { type: 'real_user', reason: '', checks };
}

// Fake page templates stored server-side for cloaking
const FAKE_PAGE_TEMPLATES: Record<number, string> = {
  1: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>5 Estratégias de Marketing Digital para 2025 | Blog</title><meta name="description" content="Descubra as melhores estratégias de marketing digital que vão transformar seu negócio em 2025."><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;line-height:1.7;color:#333;background:#fafafa}.header{background:#fff;border-bottom:1px solid #eee;padding:20px 0}.container{max-width:800px;margin:0 auto;padding:0 20px}.logo{font-size:24px;font-weight:700;color:#1a1a1a}.article{background:#fff;margin:40px auto;padding:48px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08)}h1{font-size:32px;font-weight:700;line-height:1.3;margin-bottom:16px;color:#1a1a1a}.meta{display:flex;gap:16px;color:#888;font-size:14px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #eee}p{margin-bottom:20px;color:#444;font-size:17px}h2{font-size:24px;font-weight:600;margin:32px 0 16px;color:#1a1a1a}.footer{text-align:center;padding:40px;color:#888;font-size:14px}</style></head><body><header class="header"><div class="container"><div class="logo">Blog Empresarial</div></div></header><main class="container"><article class="article"><h1>5 Estratégias de Marketing Digital que Vão Transformar seu Negócio em 2025</h1><div class="meta"><span>Por João Silva</span><span>18 de dezembro de 2024</span><span>8 min de leitura</span></div><p>O marketing digital está em constante evolução, e 2025 promete ser um ano de grandes mudanças. Com o avanço da inteligência artificial, novas formas de interação com o consumidor e mudanças nos algoritmos das principais plataformas, empresas precisam se adaptar rapidamente.</p><h2>1. Inteligência Artificial no Atendimento</h2><p>A IA está revolucionando a forma como empresas interagem com clientes. Chatbots inteligentes, assistentes virtuais e sistemas de recomendação personalizados são algumas das aplicações que estão transformando a experiência do consumidor.</p><h2>2. Marketing de Conteúdo Autêntico</h2><p>Em um mundo saturado de informações, a autenticidade se tornou um diferencial competitivo. Consumidores estão cada vez mais céticos em relação a propagandas tradicionais e buscam conexões genuínas com as marcas.</p><h2>Conclusão</h2><p>Implementar essas estratégias pode parecer desafiador, mas os resultados valem o esforço. Comece identificando quais táticas fazem mais sentido para o seu negócio.</p></article></main><footer class="footer"><p>&copy; 2024 Blog Empresarial. Todos os direitos reservados.</p></footer></body></html>`,
  2: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Site em Manutenção</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:20px}.container{max-width:600px}.icon{font-size:80px;margin-bottom:30px}h1{font-size:48px;font-weight:700;margin-bottom:16px}.subtitle{font-size:20px;opacity:.9;margin-bottom:40px}.progress{background:rgba(255,255,255,.2);border-radius:20px;height:8px;max-width:400px;margin:0 auto 40px;overflow:hidden}.bar{background:#fff;height:100%;width:75%;border-radius:20px}.eta{font-size:14px;opacity:.8}.footer{margin-top:60px;font-size:12px;opacity:.6}</style></head><body><div class="container"><div class="icon">🛠️</div><h1>Em Manutenção</h1><p class="subtitle">Estamos trabalhando para melhorar sua experiência. Voltamos em breve!</p><div class="progress"><div class="bar"></div></div><p class="eta">Previsão de retorno: Em algumas horas</p><p class="footer">&copy; 2024 Empresa. Todos os direitos reservados.</p></div></body></html>`,
  3: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Innovate Solutions | Soluções Empresariais</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333}.header{background:#fff;padding:20px 0;border-bottom:1px solid #eee}.container{max-width:1200px;margin:0 auto;padding:0 20px}.logo{font-size:24px;font-weight:700;color:#2563eb}.hero{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:100px 0;text-align:center}h1{font-size:48px;font-weight:700;margin-bottom:20px}.hero p{font-size:20px;opacity:.9;max-width:600px;margin:0 auto 40px}.btn{display:inline-block;padding:16px 32px;background:#fff;color:#2563eb;font-weight:600;text-decoration:none;border-radius:8px}.features{padding:80px 0;background:#f8fafc;text-align:center}.features h2{font-size:36px;margin-bottom:60px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}.feature{background:#fff;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.05)}.feature h3{font-size:20px;margin:20px 0 12px}.footer{background:#0f172a;color:#94a3b8;padding:40px 0;text-align:center;font-size:14px}</style></head><body><header class="header"><div class="container"><div class="logo">Innovate Solutions</div></div></header><section class="hero"><div class="container"><h1>Transformamos Negócios com Tecnologia</h1><p>Soluções empresariais inovadoras para acelerar o crescimento da sua empresa.</p><a href="#" class="btn">Fale Conosco</a></div></section><section class="features"><div class="container"><h2>Nossos Serviços</h2><div class="grid"><div class="feature"><div style="font-size:48px">💡</div><h3>Consultoria Estratégica</h3><p>Análise completa do seu negócio e planejamento estratégico.</p></div><div class="feature"><div style="font-size:48px">⚡</div><h3>Transformação Digital</h3><p>Modernize seus processos e adote tecnologias inovadoras.</p></div><div class="feature"><div style="font-size:48px">📊</div><h3>Business Intelligence</h3><p>Dashboards e análises para decisões baseadas em dados.</p></div></div></div></section><footer class="footer"><p>&copy; 2024 Innovate Solutions. Todos os direitos reservados.</p></footer></body></html>`,
  4: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Fone Bluetooth Premium | TechStore</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333;background:#f5f5f5}.header{background:#1a1a1a;padding:16px 0}.container{max-width:1200px;margin:0 auto;padding:0 20px}.logo{font-size:24px;font-weight:700;color:#fff}.product{background:#fff;border-radius:12px;padding:40px;margin:24px auto}.grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}.image{background:#f8f8f8;border-radius:12px;padding:40px;text-align:center;font-size:150px}h1{font-size:28px;font-weight:600;margin-bottom:8px}.rating{color:#f59e0b;font-size:18px;margin-bottom:16px}.price{font-size:36px;font-weight:700;color:#16a34a;margin-bottom:24px}.original{font-size:18px;color:#999;text-decoration:line-through;margin-left:12px}.shipping{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;color:#166534;font-weight:600}.features li{margin-bottom:8px;color:#444}.btn{width:100%;padding:18px;border:none;border-radius:8px;font-size:18px;font-weight:600;cursor:pointer;margin-bottom:12px}.buy{background:#f59e0b;color:#fff}.cart{background:#fff;color:#1a1a1a;border:2px solid #1a1a1a}.footer{text-align:center;padding:40px;color:#666;font-size:14px}</style></head><body><header class="header"><div class="container"><div class="logo">TechStore</div></div></header><div class="container"><div class="product"><div class="grid"><div class="image">🎧</div><div><h1>Fone de Ouvido Bluetooth Premium com Cancelamento de Ruído</h1><div class="rating">★★★★★ 4.8 (2.547 avaliações)</div><div class="price">R$ 299,90<span class="original">R$ 499,90</span></div><div class="shipping">🚚 FRETE GRÁTIS para todo Brasil</div><ul class="features"><li>✓ Cancelamento de ruído ativo</li><li>✓ Bateria de 40 horas</li><li>✓ Qualidade Hi-Fi</li><li>✓ Bluetooth 5.3</li></ul><button class="btn buy">Comprar Agora</button><button class="btn cart">Adicionar ao Carrinho</button></div></div></div></div><footer class="footer"><p>&copy; 2024 TechStore. CNPJ: 00.000.000/0001-00</p></footer></body></html>`,
  5: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Nova tecnologia revoluciona energia | TechNews</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;line-height:1.8;color:#1a1a1a}.header{background:#dc2626;padding:12px 0}.container{max-width:800px;margin:0 auto;padding:0 20px}.logo{font-family:'Segoe UI',sans-serif;font-size:28px;font-weight:700;color:#fff}.nav{background:#1a1a1a;padding:12px 0;text-align:center}.nav a{color:#fff;text-decoration:none;font-size:14px;margin:0 12px}.article{padding:40px 0}.category{color:#dc2626;font-size:14px;text-transform:uppercase;margin-bottom:12px}h1{font-size:40px;font-weight:700;line-height:1.2;margin-bottom:20px}.subtitle{font-size:22px;color:#666;margin-bottom:24px;font-style:italic}.meta{display:flex;gap:24px;color:#888;font-size:14px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #eee}.featured{width:100%;height:400px;background:linear-gradient(135deg,#0ea5e9,#0284c7);border-radius:8px;margin-bottom:32px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:100px}p{margin-bottom:24px;font-size:19px}h2{font-size:28px;margin:40px 0 20px}.quote{background:#f8f8f8;border-left:4px solid #dc2626;padding:24px;margin:32px 0;font-style:italic;font-size:22px}.footer{background:#1a1a1a;color:#888;padding:40px 0;text-align:center;font-size:14px}</style></head><body><header class="header"><div class="container"><div class="logo">TechNews</div></div></header><nav class="nav"><a href="#">Tecnologia</a><a href="#">Negócios</a><a href="#">Ciência</a><a href="#">Inovação</a></nav><div class="container"><article class="article"><div class="category">Tecnologia</div><h1>Nova tecnologia brasileira promete revolucionar o setor de energia renovável</h1><p class="subtitle">Startup paulista desenvolve sistema que aumenta eficiência de painéis solares em até 40%</p><div class="meta"><span>Por Maria Santos</span><span>18 de dezembro de 2024</span><span>6 min de leitura</span></div><div class="featured">⚡</div><p>Uma startup brasileira desenvolveu uma tecnologia que promete transformar o mercado de energia renovável. O sistema utiliza inteligência artificial para otimizar a captação de energia solar.</p><div class="quote">"Estamos apenas começando. Nossa tecnologia tem o potencial de acelerar a transição energética global."<br><small>— Dr. Paulo Mendes, CEO</small></div><h2>Como funciona</h2><p>O sistema utiliza sensores IoT e algoritmos de machine learning para ajustar em tempo real o ângulo dos painéis solares, maximizando a captação de luz durante todo o dia.</p></article></div><footer class="footer"><p>&copy; 2024 TechNews. Todos os direitos reservados.</p></footer></body></html>`,
};

// Also keep string keys for backward compatibility
const FAKE_PAGE_TEMPLATES_STRING: Record<string, string> = {
  blog: FAKE_PAGE_TEMPLATES[1],
  maintenance: FAKE_PAGE_TEMPLATES[2],
  corporate: FAKE_PAGE_TEMPLATES[3],
  ecommerce: FAKE_PAGE_TEMPLATES[4],
  news: FAKE_PAGE_TEMPLATES[5],
};

function generateFakePage(customContent?: string, templateKey?: string | number): string {
  if (customContent && customContent.trim()) {
    return customContent;
  }
  
  // Support numeric keys
  if (typeof templateKey === 'number' && FAKE_PAGE_TEMPLATES[templateKey]) {
    return FAKE_PAGE_TEMPLATES[templateKey];
  }
  
  // Support string keys for backward compatibility
  if (typeof templateKey === 'string' && FAKE_PAGE_TEMPLATES_STRING[templateKey]) {
    return FAKE_PAGE_TEMPLATES_STRING[templateKey];
  }
  
  // Default to blog template
  return FAKE_PAGE_TEMPLATES[1];
}

function generateErrorPage(title: string, message: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#333;text-align:center;padding:20px}.container{max-width:500px;background:#fff;padding:48px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.1)}.icon{font-size:64px;margin-bottom:24px}h1{font-size:32px;font-weight:700;margin-bottom:12px;color:#1a1a1a}p{font-size:16px;color:#666;line-height:1.6}</style></head><body><div class="container"><div class="icon">⚠️</div><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

// Helper to create HTML responses with correct Content-Type
function createHtmlResponse(html: string, status: number = 200, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }
  
  return new Response(html, { status, headers });
}

// Background task helper - tracks events without blocking the response
async function trackEventsInBackground(
  supabaseUrl: string,
  supabaseKey: string,
  events: Array<{
    table: 'page_events' | 'bot_detections';
    data: Record<string, unknown>;
  }>
): Promise<void> {
  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Group events by table for batch inserts
    const pageEvents = events.filter(e => e.table === 'page_events').map(e => e.data);
    const botDetections = events.filter(e => e.table === 'bot_detections').map(e => e.data);
    
    const operations: Array<Promise<void>> = [];
    
    if (pageEvents.length > 0) {
      operations.push((async () => { await supabase.from('page_events').insert(pageEvents as any); })());
    }
    
    if (botDetections.length > 0) {
      operations.push((async () => { await supabase.from('bot_detections').insert(botDetections as any); })());
    }
    
    await Promise.all(operations);
    console.log(`Background tracking completed in ${Date.now() - startTime}ms (${events.length} events)`);
  } catch (error) {
    console.error('Background tracking error:', error);
  }
}

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

serve(async (req) => {
  const requestStart = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pageId = url.searchParams.get('page');
    const cloakingId = url.searchParams.get('cloaking');

    if (!pageId && !cloakingId) {
      return createHtmlResponse(generateErrorPage('Erro 400', 'ID de página ou cloaking é necessário'), 400);
    }

    const userAgent = req.headers.get('user-agent') || '';
    // Prefer CF-Connecting-IP for real visitor IP when behind Cloudflare
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') ||
                     'unknown';

    // Log all relevant headers for debugging
    const relevantHeaders = getRelevantHeaders(req);
    console.log(`[DEBUG] Request headers:`, JSON.stringify(relevantHeaders, null, 2));

    // Handle domain verification requests (accepts both ?page=verify-X and ?cloaking=verify-X)
    const verifyParam = pageId || cloakingId;
    if (verifyParam && verifyParam.startsWith('verify-')) {
      const verifyToken = verifyParam.replace('verify-', '');
      console.log(`Domain verification request for token: ${verifyToken}`);
      return new Response(JSON.stringify({
        status: 'ok',
        token: `visuflow-verified-${verifyToken}`,
        timestamp: Date.now()
      }), {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      });
    }

    // ========== CLOAKING MODE ==========
    if (cloakingId) {
      console.log(`\n========== CLOAKING REQUEST ==========`);
      console.log(`Cloaking identifier: ${cloakingId}`);
      console.log(`Client IP: ${clientIP}`);
      console.log(`User-Agent: ${userAgent}`);
      
      // Check for preview mode (for bot simulation)
      const previewMode = url.searchParams.get('preview');
      
      // Resolve cloaking config by slug, short_id, or id (UUID)
      // Try slug first, then short_id, then UUID
      let config = null;
      let configError = null;
      
      // Check if it's a UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cloakingId);
      
      if (isUUID) {
        // Direct UUID lookup
        const result = await supabase
          .from('cloaking_configs')
          .select('*')
          .eq('id', cloakingId)
          .maybeSingle();
        config = result.data;
        configError = result.error;
      } else {
        // Try slug first
        let result = await supabase
          .from('cloaking_configs')
          .select('*')
          .eq('slug', cloakingId)
          .maybeSingle();
        
        if (!result.data && !result.error) {
          // Try short_id
          result = await supabase
            .from('cloaking_configs')
            .select('*')
            .eq('short_id', cloakingId)
            .maybeSingle();
        }
        
        config = result.data;
        configError = result.error;
      }

      if (configError || !config) {
        console.error('Cloaking config not found:', cloakingId);
        return createHtmlResponse(generateErrorPage('Erro 404', 'Configuração de cloaking não encontrada'), 404);
      }
      
      // Use actual config.id for tracking
      const actualCloakingId = config.id;

      // If preview=bot, just return the fake page directly without tracking
      if (previewMode === 'bot') {
        console.log(`Bot preview mode for cloaking: ${config.name}`);
        const fakePage = generateFakePage(config.fake_page_html, config.fake_page_template || 1);
        return createHtmlResponse(fakePage, 200, { 'X-Preview-Mode': 'bot' });
      }

      console.log(`Config: ${config.name}`);
      console.log(`Settings: block_known_bots=${config.block_known_bots}, block_data_centers=${config.block_data_centers}`);

      const deviceType = isMobile(userAgent) ? 'mobile' : 'desktop';
      
      // Use the enhanced traffic type detection with detailed checks
      const trafficCheck = getTrafficType(req, userAgent, clientIP);
      console.log(`[DETECTION] Traffic check result:`, JSON.stringify(trafficCheck, null, 2));
      
      let detectedAsBot = false;
      let isPlatformVerifier = false;
      let detectionReason = '';

      // Check traffic type (UA-based detection)
      if (config.block_known_bots) {
        if (trafficCheck.type === 'platform_verifier') {
          isPlatformVerifier = true;
          detectedAsBot = true;
          detectionReason = trafficCheck.reason;
          console.log(`[BLOCKED] Platform verifier detected: ${detectionReason}`);
        } else if (trafficCheck.type === 'bot') {
          detectedAsBot = true;
          detectionReason = trafficCheck.reason;
          console.log(`[BLOCKED] Bot detected: ${detectionReason}`);
        }
      }

      // Check IP (data centers) - supports both IPv4 and IPv6
      // Skip Cloudflare IPs when traffic is proxied through user's Cloudflare CDN
      if (!detectedAsBot && config.block_data_centers) {
        const isProxiedThroughCloudflare = !!req.headers.get('cf-ray');
        const dcCheck = isDataCenterIP(clientIP, isProxiedThroughCloudflare);
        console.log(`[DETECTION] Data center IP check (skipCF=${isProxiedThroughCloudflare}):`, JSON.stringify(dcCheck));
        
        if (dcCheck.isDataCenter) {
          detectedAsBot = true;
          detectionReason = `datacenter_ip:${dcCheck.provider}`;
          console.log(`[BLOCKED] Data center IP detected: ${detectionReason}`);
        }
      }

      // Extract UTM parameters and referrer for tracking
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');
      const utmContent = url.searchParams.get('utm_content');
      const utmTerm = url.searchParams.get('utm_term');
      const referrer = req.headers.get('referer') || null;

      // If platform verifier detected and safe_redirect_url is configured
      if (isPlatformVerifier && config.safe_redirect_url) {
        console.log(`[ACTION] Redirecting platform verifier to safe URL: ${config.safe_redirect_url}`);

        // Track as platform verifier with safe_redirect event
        EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, [
          {
            table: 'bot_detections',
            data: {
              cloaking_id: actualCloakingId,
              detection_type: 'platform_verifier',
              detection_reason: detectionReason,
              user_agent: userAgent,
              ip_address: clientIP,
              fingerprint_data: { 
                method: 'server_side', 
                type: 'platform_verifier',
                checks: trafficCheck.checks,
                headers: relevantHeaders,
              },
              blocked: false,
            }
          },
          {
            table: 'page_events',
            data: {
              cloaking_id: actualCloakingId,
              event_type: 'safe_redirect',
              user_agent: userAgent,
              ip_address: clientIP,
              device_type: deviceType,
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              utm_content: utmContent,
              utm_term: utmTerm,
              referrer: referrer,
              is_human: false,
              metadata: { redirect_url: config.safe_redirect_url, detection_reason: detectionReason },
            }
          }
        ]));

        console.log(`Response time: ${Date.now() - requestStart}ms`);
        return new Response(null, {
          status: 302,
          headers: { 
            ...corsHeaders, 
            'Location': config.safe_redirect_url 
          },
        });
      }

      // If bot detected (not platform verifier, or no safe URL configured)
      if (detectedAsBot) {
        console.log(`[ACTION] Bot action: ${config.bot_action}`);

        // Track bot detection in background
        const botEvents: Array<{ table: 'page_events' | 'bot_detections'; data: Record<string, unknown> }> = [{
          table: 'bot_detections',
          data: {
            cloaking_id: actualCloakingId,
            detection_type: isPlatformVerifier ? 'platform_verifier' : 'cloaking',
            detection_reason: detectionReason,
            user_agent: userAgent,
            ip_address: clientIP,
            fingerprint_data: { 
              method: 'server_side',
              checks: trafficCheck.checks,
              headers: relevantHeaders,
            },
            blocked: true,
          }
        }];

        // Handle bot based on action type
        if (config.bot_action === 'redirect' && config.bot_redirect_url) {
          botEvents.push({
            table: 'page_events',
            data: {
              cloaking_id: actualCloakingId,
              event_type: 'bot_redirect',
              user_agent: userAgent,
              ip_address: clientIP,
              device_type: deviceType,
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              utm_content: utmContent,
              utm_term: utmTerm,
              referrer: referrer,
              is_human: false,
              metadata: { redirect_url: config.bot_redirect_url, detection_reason: detectionReason },
            }
          });
          EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, botEvents));
          console.log(`Redirecting bot to: ${config.bot_redirect_url} (${Date.now() - requestStart}ms)`);
          return new Response(null, {
            status: 302,
            headers: { 
              ...corsHeaders, 
              'Location': config.bot_redirect_url 
            },
          });
        }

        if (config.bot_action === 'block') {
          botEvents.push({
            table: 'page_events',
            data: {
              cloaking_id: actualCloakingId,
              event_type: 'bot_blocked',
              user_agent: userAgent,
              ip_address: clientIP,
              device_type: deviceType,
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              utm_content: utmContent,
              utm_term: utmTerm,
              referrer: referrer,
              is_human: false,
              metadata: { detection_reason: detectionReason },
            }
          });
          EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, botEvents));
          console.log(`Blocking bot with 403 (${Date.now() - requestStart}ms)`);
          return new Response('Access Denied', { status: 403, headers: corsHeaders });
        }

        // Default: serve fake page
        botEvents.push({
          table: 'page_events',
          data: {
            cloaking_id: actualCloakingId,
            event_type: 'fake_page_view',
            user_agent: userAgent,
            ip_address: clientIP,
            device_type: deviceType,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            referrer: referrer,
            is_human: false,
            metadata: { template: config.fake_page_template, detection_reason: detectionReason },
          }
        });
        EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, botEvents));
        console.log(`Serving fake page to bot (${Date.now() - requestStart}ms)`);
        return createHtmlResponse(generateFakePage(config.fake_page_html, config.fake_page_template));
      }

      // User classified as real
      console.log(`[RESULT] Classified as REAL USER`);
      
      // Determine redirect URL
      let redirectUrl = config.redirect_url;
      
      if (config.use_separate_urls) {
        const mobile = isMobile(userAgent);
        if (mobile && config.redirect_url_mobile) {
          redirectUrl = config.redirect_url_mobile;
        } else if (!mobile && config.redirect_url_desktop) {
          redirectUrl = config.redirect_url_desktop;
        }
      }

      // Track view and redirect events in background with UTMs
      EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, [
        {
          table: 'page_events',
          data: {
            cloaking_id: actualCloakingId,
            event_type: 'view',
            user_agent: userAgent,
            ip_address: clientIP,
            device_type: deviceType,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            referrer: referrer,
            is_human: true,
          }
        },
        {
          table: 'page_events',
          data: {
            cloaking_id: actualCloakingId,
            event_type: 'redirect',
            user_agent: userAgent,
            ip_address: clientIP,
            device_type: deviceType,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            referrer: referrer,
            is_human: true,
            metadata: { redirect_url: redirectUrl },
          }
        }
      ]));

      // Return redirect immediately
      console.log(`Redirecting real user to: ${redirectUrl} (${Date.now() - requestStart}ms)`);
      console.log(`==========================================\n`);
      return new Response(null, {
        status: 302,
        headers: { 
          ...corsHeaders, 
          'Location': redirectUrl 
        },
      });
    }

    // ========== PAGE MODE (existing behavior) ==========
    // Resolve page by slug, short_id, or id (UUID)
    let page = null;
    let pageError = null;
    
    // Check if it's a UUID format
    const isPageUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pageId!);
    
    if (isPageUUID) {
      // Direct UUID lookup
      const result = await supabase
        .from('generated_pages')
        .select('*')
        .eq('id', pageId)
        .maybeSingle();
      page = result.data;
      pageError = result.error;
    } else {
      // Try slug first
      let result = await supabase
        .from('generated_pages')
        .select('*')
        .eq('slug', pageId)
        .maybeSingle();
      
      if (!result.data && !result.error) {
        // Try short_id
        result = await supabase
          .from('generated_pages')
          .select('*')
          .eq('short_id', pageId)
          .maybeSingle();
      }
      
      page = result.data;
      pageError = result.error;
    }

    if (pageError || !page) {
      console.error('Page not found:', pageId);
      return createHtmlResponse(generateErrorPage('Página não encontrada', 'A página que você está procurando não existe ou foi removida.'), 404);
    }

    const botConfig = page.bot_protection_config || {};

    console.log(`Serving page ${pageId} to IP: ${clientIP}, UA: ${userAgent.substring(0, 50)}...`);

    // Check if cloaking is enabled
    if (botConfig.enableCloaking) {
      let detectedAsBot = false;
      let detectionReason = '';

      // Check User-Agent using enhanced traffic type detection
      if (botConfig.blockKnownBots) {
        const trafficCheck = getTrafficType(req, userAgent, clientIP);
        console.log(`[PAGE MODE] Traffic check:`, JSON.stringify(trafficCheck, null, 2));
        
        if (trafficCheck.type === 'bot' || trafficCheck.type === 'platform_verifier') {
          detectedAsBot = true;
          detectionReason = trafficCheck.reason;
        }
      }

      // Check IP (data centers) - supports IPv4 and IPv6
      // Skip Cloudflare IPs when traffic is proxied through user's Cloudflare CDN
      if (!detectedAsBot && botConfig.blockDataCenters) {
        const isProxiedThroughCloudflare = !!req.headers.get('cf-ray');
        const dcCheck = isDataCenterIP(clientIP, isProxiedThroughCloudflare);
        if (dcCheck.isDataCenter) {
          detectedAsBot = true;
          detectionReason = `datacenter_ip:${dcCheck.provider}`;
        }
      }

      // If bot detected, log and serve fake page or redirect
      if (detectedAsBot) {
        console.log(`Bot detected! Reason: ${detectionReason}`);

        // Track bot detection in background
        EdgeRuntime.waitUntil(trackEventsInBackground(supabaseUrl, supabaseServiceKey, [{
          table: 'bot_detections',
          data: {
            page_id: pageId,
            detection_type: 'cloaking',
            detection_reason: detectionReason,
            user_agent: userAgent,
            ip_address: clientIP,
            fingerprint_data: { method: 'server_side' },
            blocked: true,
          }
        }]));

        // Check cloaking mode: redirect to URL or serve HTML
        const cloakingMode = botConfig.cloakingMode || 'html';
        
        if (cloakingMode === 'url' && botConfig.fakePageUrl) {
          console.log(`Redirecting bot to: ${botConfig.fakePageUrl} (${Date.now() - requestStart}ms)`);
          return new Response(null, {
            status: 302,
            headers: { 
              ...corsHeaders, 
              'Location': botConfig.fakePageUrl 
            },
          });
        }

        // Serve fake HTML page using template or custom content
        console.log(`Serving fake page to bot (${Date.now() - requestStart}ms)`);
        return createHtmlResponse(generateFakePage(botConfig.fakePageContent, botConfig.fakePageTemplate));
      }
    }

    // Serve real page
    console.log(`Serving real page to visitor (${Date.now() - requestStart}ms)`);
    return createHtmlResponse(page.html_content);

  } catch (error) {
    console.error('Error in serve-page function:', error);
    return createHtmlResponse(generateErrorPage('Erro Interno', 'Ocorreu um erro ao processar sua solicitação. Tente novamente.'), 500);
  }
});
