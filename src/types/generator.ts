export type PopupType = 'cookies' | 'country' | 'gender' | 'age' | 'captcha';
export type PopupTemplate = 1 | 2 | 3 | 4 | 5;
export type PopupSize = 'small' | 'medium' | 'large';
export type PopupPosition = 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export type CloakingMode = 'html' | 'url';
export type FakePageTemplate = 'blog' | 'maintenance' | 'corporate' | 'ecommerce' | 'news' | 'custom';

export interface BotProtectionConfig {
  // Clean Mode - Removes obfuscation for ad platform compatibility
  cleanMode: boolean;
  // Frontend Detection - Basic
  enableFrontendDetection: boolean;
  detectWebdriver: boolean;
  detectHeadless: boolean;
  detectCanvas: boolean;
  detectWebGL: boolean;
  detectTiming: boolean;
  // Frontend Detection - Advanced (NEW)
  detectAdPlatformBots: boolean;
  detectAutomationTools: boolean;
  detectAudioFingerprint: boolean;
  detectWebRTC: boolean;
  detectBehavior: boolean;
  collectAdvancedFingerprint: boolean;
  // DevTools Detection
  enableDevToolsDetection: boolean;
  devToolsRedirectUrl: string;
  // Cloaking
  enableCloaking: boolean;
  blockKnownBots: boolean;
  blockDataCenters: boolean;
  cloakingMode: CloakingMode;
  fakePageContent: string;
  fakePageUrl: string;
  fakePageTemplate: FakePageTemplate;
}

export interface CustomPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export type DefaultBackgroundId = 'gradient-blue' | 'gradient-green' | 'gradient-orange' | 'gradient-dark' | 'gradient-purple' | 'gradient-gold' | 'gradient-sunset' | 'gradient-ocean';

export interface DefaultBackground {
  id: DefaultBackgroundId;
  name: string;
  gradient: string;
}

export const defaultBackgrounds: DefaultBackground[] = [
  { id: 'gradient-blue', name: 'Azul', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-green', name: 'Verde', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'gradient-orange', name: 'Laranja', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-dark', name: 'Escuro', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { id: 'gradient-purple', name: 'Roxo', gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
  { id: 'gradient-gold', name: 'Dourado', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { id: 'gradient-sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient-ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
];

export interface GeneratorConfig {
  pageName: string;
  pageSlug: string;
  landingUrl: string;
  redirectUrl: string;
  // Separate redirect URLs for real users (Desktop vs Mobile)
  useSeparateRedirectUrls: boolean;
  redirectUrlDesktop: string;
  redirectUrlMobile: string;
  customPixels: string;
  desktopScreenshot: string;
  mobileScreenshot: string;
  useManualScreenshots: boolean;
  manualDesktopScreenshot: string;
  manualMobileScreenshot: string;
  // Default backgrounds
  useDefaultBackground: boolean;
  defaultBackgroundId: DefaultBackgroundId;
  popupType: PopupType;
  popupTemplate: PopupTemplate;
  popupSize: PopupSize;
  popupPosition: PopupPosition;
  customPosition?: CustomPosition;
  globalStyles: {
    fontFamily: string;
    fontWeight: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    overlayOpacity: number;
  };
  popupConfig: {
    title: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    countries?: Array<{ code: string; name: string; flag: string }>;
    ageOptions?: string[];
    minimumAge?: number;
    genderOptions?: Array<{ value: string; label: string }>;
  };
  botProtection: BotProtectionConfig;
}

export const popupTemplateNames: Record<PopupType, string[]> = {
  cookies: ['Clássico', 'Moderno', 'Minimalista', 'GDPR', 'Flutuante'],
  country: ['Bandeiras', 'Lista Simples', 'Grid', 'Dropdown', 'Cards'],
  gender: ['Ícones', 'Botões', 'Cards', 'Radio', 'Moderno'],
  age: ['Portão', 'Checkbox', 'Slider', 'Botões', 'Data'],
  captcha: ['reCAPTCHA', 'Cloudflare', 'hCaptcha', 'Slider', 'Puzzle'],
};

export const defaultBotProtection: BotProtectionConfig = {
  // Clean Mode
  cleanMode: false,
  // Basic
  enableFrontendDetection: false,
  detectWebdriver: true,
  detectHeadless: true,
  detectCanvas: true,
  detectWebGL: true,
  detectTiming: true,
  // Advanced (NEW)
  detectAdPlatformBots: true,
  detectAutomationTools: true,
  detectAudioFingerprint: true,
  detectWebRTC: false,
  detectBehavior: true,
  collectAdvancedFingerprint: true,
  // DevTools
  enableDevToolsDetection: false,
  devToolsRedirectUrl: 'https://google.com',
  // Cloaking
  enableCloaking: false,
  blockKnownBots: true,
  blockDataCenters: false,
  cloakingMode: 'html',
  fakePageContent: '',
  fakePageUrl: '',
  fakePageTemplate: 'blog',
};

export const defaultConfig: GeneratorConfig = {
  pageName: '',
  pageSlug: '',
  landingUrl: '',
  redirectUrl: '',
  useSeparateRedirectUrls: false,
  redirectUrlDesktop: '',
  redirectUrlMobile: '',
  customPixels: '',
  desktopScreenshot: '',
  mobileScreenshot: '',
  useManualScreenshots: false,
  manualDesktopScreenshot: '',
  manualMobileScreenshot: '',
  useDefaultBackground: false,
  defaultBackgroundId: 'gradient-blue',
  popupType: 'cookies',
  popupTemplate: 1,
  popupSize: 'medium',
  popupPosition: 'center',
  customPosition: { x: 50, y: 50 },
  globalStyles: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    primaryColor: '#0ea5e9',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    buttonColor: '#0ea5e9',
    buttonTextColor: '#ffffff',
    overlayOpacity: 0.8,
  },
  popupConfig: {
    title: 'Este site utiliza cookies',
    description: 'Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa política de privacidade.',
    primaryButtonText: 'Aceitar',
    secondaryButtonText: 'Fechar',
    countries: [
      { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    ],
    ageOptions: ['+18', '+21', '+25'],
    minimumAge: 18,
    genderOptions: [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Feminino' },
      { value: 'other', label: 'Outro' },
    ],
  },
  botProtection: defaultBotProtection,
};
