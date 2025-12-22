import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Globe, Shield, Bot, Eye, ArrowRight, MousePointer, TrendingUp, Calendar, Info, Clock, Volume2, Lock, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { ConversionFunnel } from './ConversionFunnel';
import { TrafficSources } from './TrafficSources';
import { BotChart } from './BotChart';
import { BotTimeline } from './BotTimeline';
import { RefreshButton } from '@/components/ui/refresh-button';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PageEvent {
  id: string;
  page_id: string | null;
  event_type: string;
  is_human: boolean;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
}

interface BotDetection {
  id: string;
  detected_at: string;
  detection_type: string;
  user_agent: string | null;
  ip_address: string | null;
  detection_reason: string;
  blocked: boolean | null;
}

interface GeneratedPage {
  id: string;
  landing_url: string;
  redirect_url: string;
  popup_type: string;
  popup_template: number;
  desktop_screenshot: string | null;
  created_at: string;
  bot_protection_config?: {
    enableFrontendDetection?: boolean;
    enableCloaking?: boolean;
  } | null;
}

interface PageMetricsProps {
  page: GeneratedPage;
  onBack: () => void;
}

export function PageMetrics({ page, onBack }: PageMetricsProps) {
  const [events, setEvents] = useState<PageEvent[]>([]);
  const [botDetections, setBotDetections] = useState<BotDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [botSubTab, setBotSubTab] = useState<'real' | 'informational'>('real');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [page.id, period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let cutoffDate: Date | null = null;
      
      if (period !== 'all') {
        cutoffDate = new Date();
        if (period === 'today') {
          cutoffDate.setHours(0, 0, 0, 0);
        } else {
          const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
          cutoffDate.setDate(cutoffDate.getDate() - days);
        }
      }

      let eventsQuery = supabase
        .from('page_events')
        .select('*')
        .eq('page_id', page.id)
        .order('created_at', { ascending: false });
      
      let botsQuery = supabase
        .from('bot_detections')
        .select('*')
        .eq('page_id', page.id)
        .order('detected_at', { ascending: false });
      
      if (cutoffDate) {
        eventsQuery = eventsQuery.gte('created_at', cutoffDate.toISOString());
        botsQuery = botsQuery.gte('detected_at', cutoffDate.toISOString());
      }

      const [eventsRes, botsRes] = await Promise.all([eventsQuery, botsQuery]);

      if (eventsRes.error) throw eventsRes.error;
      if (botsRes.error) throw botsRes.error;

      setEvents((eventsRes.data || []) as PageEvent[]);
      setBotDetections(botsRes.data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  // Separar bots reais (bloqueados) de informativos
  const realBots = useMemo(() => botDetections.filter(b => b.blocked), [botDetections]);
  const informationalBots = useMemo(() => botDetections.filter(b => !b.blocked), [botDetections]);

  const stats = useMemo(() => {
    // Filtrar apenas eventos de view para contagem principal e device breakdown
    const viewEvents = events.filter(e => e.event_type === 'view');
    const views = viewEvents.length;
    const interactions = events.filter(e => e.event_type === 'popup_interaction').length;
    const redirects = events.filter(e => e.event_type === 'redirect').length;
    // Contar apenas bots reais (bloqueados) no card principal
    const bots = realBots.length;
    const conversionRate = views > 0 ? Math.round((redirects / views) * 100) : 0;

    // Device breakdown - apenas views para consistência com o total
    const desktop = viewEvents.filter(e => e.device_type === 'desktop').length;
    const mobile = viewEvents.filter(e => e.device_type === 'mobile').length;
    const tablet = viewEvents.filter(e => e.device_type === 'tablet').length;

    return { views, interactions, redirects, bots, conversionRate, desktop, mobile, tablet };
  }, [events, realBots]);

  const popupTypeLabels: Record<string, string> = {
    cookies: '🍪 Cookies',
    country: '🌍 País',
    gender: '👤 Gênero',
    age: '🔞 Idade',
    captcha: '🤖 Captcha',
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">Métricas da Página</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton 
                onRefresh={handleRefresh} 
                isLoading={isRefreshing}
                tooltip="Atualizar métricas"
              />
              <Select value={period} onValueChange={(v) => setPeriod(v as 'today' | '7d' | '30d' | '90d' | 'all')}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">📅 Hoje</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Page Info */}
        <Card className="p-6">
          <div className="flex gap-6">
            <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {page.desktop_screenshot ? (
                <img src={page.desktop_screenshot} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Globe className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                  {popupTypeLabels[page.popup_type] || page.popup_type}
                </span>
                <span className="bg-secondary px-2 py-0.5 rounded text-xs">Template {page.popup_template}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{page.landing_url}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Criada em {new Date(page.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.views}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.interactions}</p>
                <p className="text-xs text-muted-foreground">Interações</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.redirects}</p>
                <p className="text-xs text-muted-foreground">Redirects</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.bots}</p>
                <p className="text-xs text-muted-foreground">Bots</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversão</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="traffic">Tráfego</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <ConversionFunnel events={events} />
                
                {/* Device Breakdown */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Por Dispositivo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-2xl font-bold">{stats.desktop}</p>
                      <p className="text-sm text-muted-foreground">Desktop</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-2xl font-bold">{stats.mobile}</p>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-2xl font-bold">{stats.tablet}</p>
                      <p className="text-sm text-muted-foreground">Tablet</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="traffic" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <TrafficSources events={events} />
            )}
          </TabsContent>

          <TabsContent value="bots" className="mt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Sub-tabs para Bots Reais vs Informativos */}
                <div className="flex gap-2">
                  <Button
                    variant={botSubTab === 'real' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBotSubTab('real')}
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Bots Reais ({realBots.length})
                  </Button>
                  <Button
                    variant={botSubTab === 'informational' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setBotSubTab('informational')}
                    className="gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Informativos ({informationalBots.length})
                  </Button>
                </div>

                {botSubTab === 'real' ? (
                  <>
                    <BotChart detections={realBots} />
                    <Card className="p-6">
                      <BotTimeline detections={realBots} pageId={page.id} onLogsDeleted={fetchData} />
                    </Card>
                  </>
                ) : (
                  <>
                    <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-emerald-500">Detecções Informativas</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Estas são características normais de navegadores modernos com proteção de privacidade (Safari, Firefox).
                            São usuários reais e <strong>NÃO foram bloqueados</strong>.
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Legenda visual dos tipos de detecção informativa */}
                    <div className="grid gap-3 md:grid-cols-2">
                      <Card className="p-4 bg-secondary/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Precisão de Tempo Reduzida</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Safari e Firefox arredondam timestamps por privacidade. Comportamento normal de usuários reais.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-secondary/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">WebGL sem Debug</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Navegador oculta informações de hardware (GPU) por configuração de privacidade.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-secondary/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Volume2 className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Anomalia de Áudio</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Diferenças normais no processamento de áudio entre navegadores e dispositivos.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-secondary/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">API de Permissões Bloqueada</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Usuário ou navegador bloqueou acesso a APIs de permissão por privacidade.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-secondary/30 md:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <Fingerprint className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Fingerprint Único</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Características únicas do navegador detectadas, mas sem indicadores de automação. Usuário real.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                    <Card className="p-6">
                      <BotTimeline detections={informationalBots} pageId={page.id} onLogsDeleted={fetchData} />
                    </Card>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </TooltipProvider>
  );
}
