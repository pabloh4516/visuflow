import { GeneratorConfig, BotProtectionConfig } from '@/types/generator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Eye, Bot, Fingerprint, Clock, Monitor, Code, ExternalLink, Wifi, Activity, Cpu, Volume2, Radio, Sparkles, CheckCircle2, XCircle, Globe, Server } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProtectionStepProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

export function ProtectionStep({ config, onConfigChange }: ProtectionStepProps) {
  const updateProtection = (updates: Partial<BotProtectionConfig>) => {
    onConfigChange({
      ...config,
      botProtection: {
        ...config.botProtection,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Proteção Anti-Bot Completa
        </h2>
        <p className="text-sm text-muted-foreground">
          Sistema avançado de detecção que identifica bots de todas as plataformas de anúncios e ferramentas de automação
        </p>
      </div>

      {/* Clean Mode Toggle */}
      <Card className="p-5 space-y-4 border-2 border-green-500/30 bg-green-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Modo Limpo
                <Badge className="text-xs bg-green-500/20 text-green-600 border-green-500/30">
                  Recomendado para Ads
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Código legível, sem ofuscação - compatível com Google Ads, Meta Ads</p>
            </div>
          </div>
          <Switch
            checked={config.botProtection.cleanMode}
            onCheckedChange={(checked) => updateProtection({ cleanMode: checked })}
          />
        </div>

        <div className="bg-green-500/10 rounded-lg p-3 text-xs border border-green-500/20">
          <p className="font-medium text-foreground mb-2">✨ O que o Modo Limpo faz:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="font-medium text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Mantém (~85% proteção):
              </p>
              <ul className="text-muted-foreground space-y-0.5 ml-4">
                <li>• Detecção de bots de Ads</li>
                <li>• Detecção de automação</li>
                <li>• Canvas/WebGL fingerprint</li>
                <li>• Report para Dashboard</li>
                <li>• Bloqueio de DevTools</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-orange-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Remove (evita flags):
              </p>
              <ul className="text-muted-foreground space-y-0.5 ml-4">
                <li>• Ofuscação de variáveis</li>
                <li>• String splitting</li>
                <li>• Bracket notation</li>
                <li>• Audio fingerprint</li>
                <li>• WebRTC leak detection</li>
              </ul>
            </div>
          </div>
        </div>

        {config.botProtection.cleanMode && (
          <Alert className="border-green-500/30 bg-green-500/5">
            <Sparkles className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-xs">
              <strong>Modo Limpo ativo.</strong> O HTML gerado usará código legível e passará em scanners de segurança (VirusTotal, Google Safe Browsing). 
              Ideal para campanhas de Google Ads, Meta Ads e tráfego orgânico.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Frontend Detection */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Detecção Frontend Avançada
                <Badge variant="secondary" className="text-xs">Completa</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Detecta bots diretamente no navegador com 9 métodos de análise</p>
            </div>
          </div>
          <Switch
            checked={config.botProtection.enableFrontendDetection}
            onCheckedChange={(checked) => updateProtection({ enableFrontendDetection: checked })}
          />
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">💡 Como funciona:</p>
          <p>Executa 9 tipos de verificação no navegador do visitante para identificar bots de plataformas de anúncios (Google, Meta, TikTok, Microsoft) e ferramentas de automação (Selenium, Puppeteer, Playwright). 
          Bots detectados <strong>não conseguem acionar o redirecionamento</strong> e todos os dados são enviados para analytics.</p>
        </div>

        {config.botProtection.enableFrontendDetection && (
          <div className="pl-13 space-y-4 border-l-2 border-primary/20 ml-5 pl-4">
            {/* Section: Basic Detection */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                Detecção Básica
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Métodos fundamentais de identificação de automação</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">navigator.webdriver</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectWebdriver}
                  onCheckedChange={(checked) => updateProtection({ detectWebdriver: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Detecta a flag <code className="bg-secondary px-1 rounded">navigator.webdriver = true</code> definida por Selenium, Puppeteer, Playwright.
              </p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Headless Browsers</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectHeadless}
                  onCheckedChange={(checked) => updateProtection({ detectHeadless: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Identifica Chrome Headless, PhantomJS, Nightmare via <code className="bg-secondary px-1 rounded">window.chrome</code>, plugins ausentes e User-Agent.
              </p>
            </div>

            <Separator className="my-4" />

            {/* Section: Ad Platform Bots */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Bots de Plataformas de Anúncios
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">NOVO</Badge>
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Detecção por User-Agent de crawlers conhecidos</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Detectar Bots de Ads</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectAdPlatformBots}
                  onCheckedChange={(checked) => updateProtection({ detectAdPlatformBots: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Identifica User-Agents de: <strong>Google</strong> (AdsBot-Google, Googlebot, Google-Ads), <strong>Meta</strong> (facebookexternalhit, Facebot, Meta-ExternalAgent), 
                <strong> TikTok</strong> (Bytespider, Tiktokbot), <strong>Microsoft</strong> (Bingbot, adidxbot), <strong>LinkedIn</strong>, <strong>Twitter</strong>, <strong>Pinterest</strong>, e outros 30+ crawlers.
              </p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Ferramentas de Automação</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectAutomationTools}
                  onCheckedChange={(checked) => updateProtection({ detectAutomationTools: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Detecta Selenium (<code className="bg-secondary px-1 rounded">$cdc_</code>, <code className="bg-secondary px-1 rounded">callSelenium</code>), 
                Puppeteer, Playwright (<code className="bg-secondary px-1 rounded">__playwright</code>), 
                Cypress (<code className="bg-secondary px-1 rounded">window.Cypress</code>), e Chrome DevTools Protocol (CDP).
              </p>
            </div>

            <Separator className="my-4" />

            {/* Section: Fingerprinting */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                Fingerprinting Avançado
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Coleta de características únicas do dispositivo</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Canvas Fingerprint</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectCanvas}
                  onCheckedChange={(checked) => updateProtection({ detectCanvas: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Renderiza texto no Canvas e gera hash único. Bots têm fingerprints uniformes ou falham na renderização.
              </p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">WebGL Fingerprint</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectWebGL}
                  onCheckedChange={(checked) => updateProtection({ detectWebGL: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Coleta GPU renderer/vendor. Detecta SwiftShader, llvmpipe, VirtualBox, VMware - indicadores de ambiente virtual.
              </p>
            </div>

            <div className={`space-y-2 py-2 ${config.botProtection.cleanMode ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Audio Fingerprint</Label>
                  {config.botProtection.cleanMode ? (
                    <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">OFF no Modo Limpo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">NOVO</Badge>
                  )}
                </div>
                <Switch
                  checked={config.botProtection.detectAudioFingerprint && !config.botProtection.cleanMode}
                  onCheckedChange={(checked) => updateProtection({ detectAudioFingerprint: checked })}
                  disabled={config.botProtection.cleanMode}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Gera hash único usando AudioContext. Cada dispositivo real produz uma assinatura sonora diferente.
                {config.botProtection.cleanMode && <span className="text-orange-500"> (Desativado no Modo Limpo)</span>}
              </p>
            </div>

            <div className={`space-y-2 py-2 ${config.botProtection.cleanMode ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">WebRTC Leak Detection</Label>
                  {config.botProtection.cleanMode ? (
                    <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">OFF no Modo Limpo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">NOVO</Badge>
                  )}
                </div>
                <Switch
                  checked={config.botProtection.detectWebRTC && !config.botProtection.cleanMode}
                  onCheckedChange={(checked) => updateProtection({ detectWebRTC: checked })}
                  disabled={config.botProtection.cleanMode}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Extrai IPs locais via WebRTC. Pode revelar IP real mesmo usando VPN. Útil para análise avançada.
                {config.botProtection.cleanMode && <span className="text-orange-500"> (Desativado no Modo Limpo)</span>}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Section: Behavioral Analysis */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Análise Comportamental
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Padrões de interação que diferenciam humanos de bots</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Análise de Timing</Label>
                </div>
                <Switch
                  checked={config.botProtection.detectTiming}
                  onCheckedChange={(checked) => updateProtection({ detectTiming: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Mede tempo de execução de operações. Bots executam muito mais rápido que navegadores reais.
              </p>
            </div>

            <div className={`space-y-2 py-2 ${config.botProtection.cleanMode ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Análise de Comportamento</Label>
                  {config.botProtection.cleanMode ? (
                    <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">OFF no Modo Limpo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">NOVO</Badge>
                  )}
                </div>
                <Switch
                  checked={config.botProtection.detectBehavior && !config.botProtection.cleanMode}
                  onCheckedChange={(checked) => updateProtection({ detectBehavior: checked })}
                  disabled={config.botProtection.cleanMode}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Monitora padrões de mouse, scroll e cliques. Detecta movimentos lineares robóticos e timing artificial.
                {config.botProtection.cleanMode && <span className="text-orange-500"> (Desativado no Modo Limpo)</span>}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Section: Data Collection */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                Coleta de Dados para Analytics
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Informações detalhadas enviadas para o dashboard</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Fingerprint Expandido</Label>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">NOVO</Badge>
                </div>
                <Switch
                  checked={config.botProtection.collectAdvancedFingerprint}
                  onCheckedChange={(checked) => updateProtection({ collectAdvancedFingerprint: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Coleta 25+ pontos de dados: CPU cores, memória, touch points, color depth, pixel ratio, plugins, 
                connection type, viewport, WebGL renderer, Canvas hash, Audio hash, timezone, battery level, e mais.
              </p>
            </div>

            {/* Summary of collected data */}
            <div className="bg-primary/5 rounded-lg p-3 text-xs border border-primary/20">
              <p className="font-medium text-foreground mb-2">📊 Dados enviados para o Dashboard:</p>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>• Razões de detecção (múltiplas)</span>
                <span>• Screen resolution</span>
                <span>• User-Agent completo</span>
                <span>• Timezone + offset</span>
                <span>• Canvas/Audio/WebGL hash</span>
                <span>• CPU cores + memória</span>
                <span>• Touch points</span>
                <span>• Color depth + pixel ratio</span>
                <span>• Browser features</span>
                <span>• Connection type + speed</span>
                <span>• WebRTC IPs (se ativo)</span>
                <span>• Behavioral patterns</span>
                <span>• Referrer + URL</span>
                <span>• Battery level</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* DevTools Detection */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bloqueio de DevTools</h3>
              <p className="text-xs text-muted-foreground">Impede análise técnica da página</p>
            </div>
          </div>
          <Switch
            checked={config.botProtection.enableDevToolsDetection}
            onCheckedChange={(checked) => updateProtection({ enableDevToolsDetection: checked })}
          />
        </div>

        <div className="bg-purple-500/5 rounded-lg p-3 text-xs text-muted-foreground border border-purple-500/10">
          <p className="font-medium text-foreground mb-1">💡 Como funciona:</p>
          <p>Detecta quando alguém tenta abrir as ferramentas de desenvolvedor do navegador (F12, Inspect Element, etc.) e <strong>redireciona imediatamente</strong> para outra página. 
          Útil para impedir que curiosos ou concorrentes analisem o código da sua página.</p>
        </div>

        {config.botProtection.enableDevToolsDetection && (
          <div className="pl-13 space-y-3 border-l-2 border-purple-500/20 ml-5 pl-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                URL de Redirecionamento
              </Label>
              <Input
                type="url"
                value={config.botProtection.devToolsRedirectUrl}
                onChange={(e) => updateProtection({ devToolsRedirectUrl: e.target.value })}
                placeholder="https://google.com"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Visitantes serão redirecionados para esta URL ao tentar abrir DevTools
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">🔍 Métodos de detecção:</p>
              <ul className="space-y-1 mt-1">
                <li>• <strong>Teclas de atalho:</strong> F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U</li>
                <li>• <strong>Menu contexto:</strong> Bloqueio do clique direito</li>
                <li>• <strong>Timing do console:</strong> Detecta abertura via diferença de tempo</li>
                <li>• <strong>Debugger trap:</strong> Loop infinito que trava quando DevTools está aberto</li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* Info - Comparison Table */}
      <div className="bg-secondary/30 rounded-lg p-4 text-sm">
        <p className="font-medium text-foreground mb-3">📊 Comparativo das Proteções:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-foreground">Proteção</th>
                <th className="text-left py-2 font-medium text-foreground">Quando Age</th>
                <th className="text-left py-2 font-medium text-foreground">O que Bot Vê</th>
                <th className="text-left py-2 font-medium text-foreground">Eficácia</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 font-medium text-foreground">Frontend Completa</td>
                <td className="py-2">Após carregar</td>
                <td className="py-2">Página real, sem redirect</td>
                <td className="py-2">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-foreground">DevTools Block</td>
                <td className="py-2">Ao abrir DevTools</td>
                <td className="py-2">Redirect para URL</td>
                <td className="py-2">⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 <strong>Dica:</strong> Use <strong>Detecção Frontend Completa + DevTools Block</strong> para máxima proteção.
          Para cloaking server-side, acesse a seção <strong>Cloaking</strong> no menu.
        </p>
      </div>
    </div>
  );
}
