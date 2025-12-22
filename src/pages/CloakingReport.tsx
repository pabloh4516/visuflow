import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloakingAnalyticsCards } from '@/components/cloaking/CloakingAnalyticsCards';
import { CloakingFunnel } from '@/components/cloaking/CloakingFunnel';
import { ActionBreakdownChart } from '@/components/cloaking/ActionBreakdownChart';
import { BotChart } from '@/components/generator/BotChart';
import { BotTimeline } from '@/components/generator/BotTimeline';
import { TrafficSources } from '@/components/generator/TrafficSources';
import { RefreshButton } from '@/components/ui/refresh-button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CloakingConfig } from '@/types/cloaking';
import { Shield, Copy, Check, ExternalLink, Loader2, Pencil, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface BotDetection {
  id: string;
  detected_at: string;
  detection_type: string;
  detection_reason: string;
  user_agent: string | null;
  ip_address: string | null;
  blocked: boolean;
}

interface PageEvent {
  id: string;
  event_type: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  device_type: string | null;
  is_human: boolean | null;
}

export default function CloakingReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<CloakingConfig | null>(null);
  const [detections, setDetections] = useState<BotDetection[]>([]);
  const [events, setEvents] = useState<PageEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data: configData, error: configError } = await supabase
        .from('cloaking_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (configError) throw configError;
      setConfig(configData as unknown as CloakingConfig);

      const { data: detectionsData, error: detectionsError } = await supabase
        .from('bot_detections')
        .select('*')
        .eq('cloaking_id', id)
        .order('detected_at', { ascending: false });

      if (detectionsError) throw detectionsError;
      setDetections(detectionsData || []);

      const { data: eventsData, error: eventsError } = await supabase
        .from('page_events')
        .select('*')
        .eq('cloaking_id', id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching cloaking data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do cloaking.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getCloakingUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/serve-page?cloaking=${id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getCloakingUrl());
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const views = events.filter(e => e.event_type === 'view').length;
    const redirects = events.filter(e => e.event_type === 'redirect').length;
    const fakePageViews = events.filter(e => e.event_type === 'fake_page_view').length;
    const safeRedirects = events.filter(e => e.event_type === 'safe_redirect').length;
    const botRedirects = events.filter(e => e.event_type === 'bot_redirect').length;
    const botBlocked = events.filter(e => e.event_type === 'bot_blocked').length;
    
    const botsDetected = detections.length;
    const realUsers = views; // Views are only tracked for real users
    const totalViews = realUsers + botsDetected;

    return {
      totalViews,
      realUsers,
      redirects,
      botsDetected,
      fakePageViews,
      safeRedirects,
      botRedirects,
      botBlocked,
    };
  }, [events, detections]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!config) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Cloaking não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            A configuração de cloaking que você está procurando não existe.
          </p>
          <Button onClick={() => navigate('/cloaking')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{config.name}</h1>
              <p className="text-sm text-muted-foreground">
                Criado em {format(new Date(config.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copiar Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(config.redirect_url, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Destino
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cloaking/${id}/edit`)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/cloaking/${id}/bot-preview`)}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              Ver Visão do Bot
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <CloakingAnalyticsCards
          totalViews={analytics.totalViews}
          realUsers={analytics.realUsers}
          redirects={analytics.redirects}
          botsDetected={analytics.botsDetected}
          fakePageViews={analytics.fakePageViews}
          safeRedirects={analytics.safeRedirects}
          botRedirects={analytics.botRedirects}
          botBlocked={analytics.botBlocked}
        />

        {/* Funnel and Action Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <CloakingFunnel
            totalViews={analytics.totalViews}
            realUsers={analytics.realUsers}
            redirects={analytics.redirects}
            botsDetected={analytics.botsDetected}
            fakePageViews={analytics.fakePageViews}
            safeRedirects={analytics.safeRedirects}
            botRedirects={analytics.botRedirects}
            botBlocked={analytics.botBlocked}
          />
          <ActionBreakdownChart
            fakePageViews={analytics.fakePageViews}
            safeRedirects={analytics.safeRedirects}
            botRedirects={analytics.botRedirects}
            botBlocked={analytics.botBlocked}
            realRedirects={analytics.redirects}
          />
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">URL de Destino</p>
                <p className="font-medium truncate">{config.redirect_url}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ação para Bots</p>
                <p className="font-medium capitalize">{config.bot_action.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloquear Bots Conhecidos</p>
                <p className="font-medium">{config.block_known_bots ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloquear Data Centers</p>
                <p className="font-medium">{config.block_data_centers ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        {events.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Fontes de Tráfego</h2>
            <TrafficSources events={events} />
          </div>
        )}

        {/* Bot Charts */}
        {detections.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Detecções de Bots</h2>
            <BotChart detections={detections} />
          </div>
        )}

        {/* Timeline */}
        {detections.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Timeline de Detecções</h2>
            <BotTimeline detections={detections} cloakingId={id} />
          </div>
        )}

        {/* Empty state */}
        {detections.length === 0 && events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado ainda</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ainda não há dados de tráfego ou detecções para este cloaking.
                Comece a usar o link para ver as métricas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}