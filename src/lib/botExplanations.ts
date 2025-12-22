import { Bot, AlertTriangle, Wrench, Zap, Eye, Clock, Shield, Fingerprint, Search, MonitorSmartphone } from 'lucide-react';

export interface BotExplanation {
  name: string;
  description: string;
  action: string;
  category: 'ad_platform' | 'automation' | 'fingerprint' | 'timing' | 'devtools' | 'informational' | 'other';
  isInformational?: boolean;
}

// Reasons that are informational only - NOT bot indicators
// These should NEVER block real users
export const INFORMATIONAL_REASONS = [
  'timing_no_precision',
  'webgl_no_debug', 
  'audio_anomaly',
  'no_permissions_api',
  'fingerprint_only',
  // Social app detections - users browsing via TikTok/Facebook/Instagram apps
  'ad_platform_musical_ly',
  'ad_platform_BytedanceWebview',
  'ad_platform_TikTok',
  'ad_platform_FBAN',
  'ad_platform_FBAV',
  'ad_platform_Instagram',
  'ad_platform_ByteLocale',
  'ad_platform_JsSdk',
];

export const botExplanations: Record<string, BotExplanation> = {
  // Plataformas de Ads
  'ad_platform_AdsBot-Google': {
    name: 'Google Ads Bot',
    description: 'Bot oficial do Google que verifica páginas de destino para conformidade com políticas de publicidade.',
    action: 'Redirect bloqueado - Bot vê a página mas não acessa a oferta final',
    category: 'ad_platform',
  },
  'ad_platform_Googlebot': {
    name: 'Googlebot (Crawler)',
    description: 'Crawler principal do Google para indexação de páginas. Analisa conteúdo e links.',
    action: 'Redirect bloqueado ou página fake servida (cloaking)',
    category: 'ad_platform',
  },
  'ad_platform_facebookexternalhit': {
    name: 'Meta/Facebook Bot',
    description: 'Bot do Meta que verifica páginas compartilhadas e anúncios para gerar previews.',
    action: 'Redirect bloqueado - Bot vê a página mas não acessa a oferta',
    category: 'ad_platform',
  },
  'ad_platform_Twitterbot': {
    name: 'Twitter/X Bot',
    description: 'Bot do Twitter/X que gera cards de preview para links compartilhados.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_LinkedInBot': {
    name: 'LinkedIn Bot',
    description: 'Bot do LinkedIn para verificação de links e geração de previews.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_bingbot': {
    name: 'Bing Bot',
    description: 'Crawler do Microsoft Bing para indexação e verificação de anúncios.',
    action: 'Redirect bloqueado ou página fake servida',
    category: 'ad_platform',
  },
  'ad_platform_TikTok': {
    name: 'TikTok Bot',
    description: 'Bot do TikTok para verificação de páginas de destino de anúncios.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_Tiktokbot': {
    name: 'TikTok Crawler',
    description: 'Crawler oficial do TikTok para indexação e verificação de conteúdo.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_TikTok_Ads_Bot': {
    name: 'TikTok Ads Verification Bot',
    description: 'Bot específico do TikTok Ads Manager que verifica URLs de destino antes de aprovar anúncios. Analisa conteúdo, velocidade de carregamento e conformidade com políticas.',
    action: 'Redirect bloqueado - Bot não acessa oferta final',
    category: 'ad_platform',
  },
  'ad_platform_Bytespider': {
    name: 'ByteSpider (TikTok)',
    description: 'Principal crawler da ByteDance/TikTok. Rastreia e indexa páginas para o ecossistema TikTok, incluindo verificação de landing pages de campanhas.',
    action: 'Redirect bloqueado ou página fake servida (cloaking)',
    category: 'ad_platform',
  },
  'ad_platform_Musical.ly': {
    name: 'Musical.ly Bot (Legacy TikTok)',
    description: 'Bot legado do Musical.ly (antigo TikTok). Ainda ativo em algumas verificações de conteúdo.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_ByteDanceWebkit': {
    name: 'ByteDance WebKit',
    description: 'Motor WebKit customizado da ByteDance para renderização e análise de páginas em apps TikTok.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_TTPush': {
    name: 'TTPush Bot',
    description: 'Bot de push notifications do TikTok que verifica páginas antes de enviar notificações com links.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_TikTokApi': {
    name: 'TikTok API Bot',
    description: 'Bot da API oficial do TikTok para desenvolvedores, usado em integrações e verificações automatizadas.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },
  'ad_platform_BytedanceSpider': {
    name: 'ByteDance Spider',
    description: 'Spider secundário da ByteDance para crawling de conteúdo específico de campanhas publicitárias.',
    action: 'Redirect bloqueado',
    category: 'ad_platform',
  },

  // Detecção de Automação
  'webdriver_detected': {
    name: 'WebDriver Detectado',
    description: 'Navegador controlado por ferramentas de automação como Selenium, Puppeteer ou Playwright.',
    action: 'Redirect bloqueado - Acesso automatizado identificado',
    category: 'automation',
  },
  'headless_detected': {
    name: 'Navegador Headless',
    description: 'Navegador sem interface gráfica, típico de scripts automatizados e bots.',
    action: 'Redirect bloqueado',
    category: 'automation',
  },
  'headless_noplugins': {
    name: 'Sem Plugins (Headless)',
    description: 'Navegador sem plugins instalados - comportamento típico de navegadores headless.',
    action: 'Redirect bloqueado',
    category: 'automation',
  },
  'automation_cdp': {
    name: 'CDP Detectado',
    description: 'Chrome DevTools Protocol ativo - indica controle remoto do navegador.',
    action: 'Redirect bloqueado',
    category: 'automation',
  },

  // Fingerprinting
  'canvas_anomaly': {
    name: 'Canvas Anômalo',
    description: 'Renderização de Canvas HTML5 apresenta anomalias típicas de ambientes virtualizados.',
    action: 'Redirect bloqueado',
    category: 'fingerprint',
  },
  'webgl_virtual': {
    name: 'WebGL Virtual',
    description: 'Renderização WebGL indica placa de vídeo virtual ou emulada (VM/bot).',
    action: 'Redirect bloqueado',
    category: 'fingerprint',
  },
  'webgl_anomaly': {
    name: 'WebGL Anômalo',
    description: 'Parâmetros WebGL inconsistentes com hardware real.',
    action: 'Redirect bloqueado',
    category: 'fingerprint',
  },
  'fingerprint_only': {
    name: 'Coleta de Fingerprint',
    description: 'Dados do dispositivo coletados para análise. Não indica bot automaticamente.',
    action: 'Apenas monitoramento - usuário NÃO bloqueado',
    category: 'informational',
    isInformational: true,
  },

  // Timing
  'timing_toofast': {
    name: 'Execução Muito Rápida',
    description: 'Código JavaScript executou em tempo impossível para humanos (< 100ms).',
    action: 'Redirect bloqueado - Tempo de carregamento anormal',
    category: 'timing',
  },
  'timing_no_precision': {
    name: 'Precisão de Tempo Reduzida',
    description: 'Navegador com timestamps arredondados por privacidade. Comum em Safari/iOS e Firefox. NÃO é indicador de bot.',
    action: 'Apenas monitoramento - usuário NÃO bloqueado',
    category: 'informational',
    isInformational: true,
  },

  // DevTools
  'devtools_keyboard_f12': {
    name: 'DevTools via F12',
    description: 'Usuário tentou abrir ferramentas de desenvolvedor pressionando F12.',
    action: 'Usuário redirecionado para URL configurada',
    category: 'devtools',
  },
  'devtools_keyboard_ctrlshifti': {
    name: 'DevTools via Ctrl+Shift+I',
    description: 'Usuário tentou abrir DevTools pelo atalho Ctrl+Shift+I.',
    action: 'Usuário redirecionado',
    category: 'devtools',
  },
  'devtools_right_click': {
    name: 'Clique Direito Bloqueado',
    description: 'Usuário tentou abrir menu de contexto (possivelmente para inspecionar).',
    action: 'Usuário redirecionado',
    category: 'devtools',
  },
  'devtools_window_resize': {
    name: 'Resize Suspeito',
    description: 'Mudança de tamanho da janela indica abertura do painel DevTools.',
    action: 'Usuário redirecionado',
    category: 'devtools',
  },

  // Data Center / IP
  'datacenter_ip': {
    name: 'IP de Data Center',
    description: 'Acesso originado de IP pertencente a data centers (AWS, Google Cloud, etc).',
    action: 'Página fake servida via cloaking',
    category: 'other',
  },
  'known_bot_ua': {
    name: 'User-Agent de Bot',
    description: 'User-Agent identificado como pertencente a um bot conhecido.',
    action: 'Página fake servida ou redirect bloqueado',
    category: 'other',
  },

  // Platform Mismatch (Emuladores/Bots disfarçados)
  'platform_mismatch': {
    name: 'Platform Mismatch',
    description: 'User-Agent diz ser mobile (Android/iPhone) mas plataforma é desktop (x86_64). Indica emulador ou bot disfarçado.',
    action: 'Redirect bloqueado - Bot detectado por inconsistência de plataforma',
    category: 'automation',
  },
  'fake_mobile_fingerprint': {
    name: 'Fingerprint Mobile Falso',
    description: 'Dispositivo tenta se passar por mobile mas fingerprint não corresponde a dispositivo real (touchpoints, GPU, etc).',
    action: 'Redirect bloqueado - Emulador ou VM detectado',
    category: 'fingerprint',
  },
};

export const categoryInfo = {
  ad_platform: {
    name: 'Plataformas de Ads',
    description: 'Bots oficiais de plataformas de publicidade que verificam conformidade',
    icon: Search,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  automation: {
    name: 'Automação',
    description: 'Ferramentas de automação como Selenium, Puppeteer, scripts',
    icon: MonitorSmartphone,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  fingerprint: {
    name: 'Fingerprinting',
    description: 'Anomalias detectadas via Canvas, WebGL e outros marcadores',
    icon: Fingerprint,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  timing: {
    name: 'Timing',
    description: 'Comportamento temporal anormal indicando automação',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  devtools: {
    name: 'DevTools',
    description: 'Tentativas de inspecionar a página usando ferramentas de desenvolvedor',
    icon: Wrench,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  other: {
    name: 'Outros',
    description: 'Detecções baseadas em IP, User-Agent e outros fatores',
    icon: Shield,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
  },
  informational: {
    name: 'Informativo',
    description: 'Características normais de navegadores modernos. NÃO bloqueiam usuários reais.',
    icon: Eye,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
};

export function getExplanation(reason: string): BotExplanation {
  // Try exact match first
  if (botExplanations[reason]) {
    return botExplanations[reason];
  }

  // Try prefix match for ad platforms
  if (reason.startsWith('ad_platform_')) {
    const platform = reason.replace('ad_platform_', '');
    return {
      name: `Bot de Ads (${platform})`,
      description: `Bot de verificação da plataforma ${platform}.`,
      action: 'Redirect bloqueado ou página fake servida',
      category: 'ad_platform',
    };
  }

  // Try to identify category by keywords
  if (reason.includes('webdriver') || reason.includes('headless') || reason.includes('automation')) {
    return {
      name: 'Automação Detectada',
      description: reason,
      action: 'Redirect bloqueado',
      category: 'automation',
    };
  }

  if (reason.includes('canvas') || reason.includes('webgl') || reason.includes('fingerprint')) {
    return {
      name: 'Fingerprint Anômalo',
      description: reason,
      action: 'Redirect bloqueado',
      category: 'fingerprint',
    };
  }

  if (reason.includes('timing') || reason.includes('fast') || reason.includes('precision')) {
    return {
      name: 'Timing Suspeito',
      description: reason,
      action: 'Redirect bloqueado',
      category: 'timing',
    };
  }

  if (reason.includes('devtools') || reason.includes('f12') || reason.includes('inspect')) {
    return {
      name: 'DevTools Detectado',
      description: reason,
      action: 'Usuário redirecionado',
      category: 'devtools',
    };
  }

  // Default
  return {
    name: 'Detecção de Bot',
    description: reason,
    action: 'Redirect bloqueado ou dados coletados',
    category: 'other',
  };
}

export function getBlockedActionText(detectionType: string, blocked: boolean): string {
  if (!blocked) return 'Não bloqueado (apenas monitoramento)';
  
  switch (detectionType) {
    case 'frontend':
      return 'Redirect impedido - bot vê a página mas não acessa a oferta';
    case 'cloaking':
      return 'Página fake servida via servidor';
    case 'devtools':
      return 'Usuário redirecionado para URL de proteção';
    default:
      return 'Ação bloqueada';
  }
}
