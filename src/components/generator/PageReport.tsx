import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Globe, Shield, Bot, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { BotChart } from './BotChart';
import { BotTimeline } from './BotTimeline';

interface GeneratedPage {
  id: string;
  landing_url: string;
  redirect_url: string;
  popup_type: string;
  popup_template: number;
  html_content: string;
  desktop_screenshot: string | null;
  created_at: string;
  bot_protection_config?: {
    enableFrontendDetection?: boolean;
    enableCloaking?: boolean;
  } | null;
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

interface PageReportProps {
  page: GeneratedPage;
  onBack: () => void;
}

export function PageReport({ page, onBack }: PageReportProps) {
  const [detections, setDetections] = useState<BotDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetections();
  }, [page.id]);

  const fetchDetections = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_detections')
        .select('*')
        .eq('page_id', page.id)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setDetections(data || []);
    } catch (error) {
      console.error('Error fetching detections:', error);
      toast.error('Erro ao carregar detecções');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: detections.length,
    cloaking: detections.filter(d => d.detection_type === 'cloaking').length,
    frontend: detections.filter(d => d.detection_type === 'frontend').length,
    blocked: detections.filter(d => d.blocked).length,
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const popupTypeLabels: Record<string, string> = {
    cookies: '🍪 Cookies',
    country: '🌍 País',
    gender: '👤 Gênero',
    age: '🔞 Idade',
    captcha: '🤖 Captcha',
  };

  const protectionConfig = page.bot_protection_config;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Relatório de Bots</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Page Info Header */}
        <Card className="p-6">
          <div className="flex gap-6">
            <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {page.desktop_screenshot ? (
                <img 
                  src={page.desktop_screenshot} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Globe className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                  {popupTypeLabels[page.popup_type] || page.popup_type}
                </span>
                <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                  Template {page.popup_template}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Landing:</span>
                  <a 
                    href={page.landing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate max-w-md"
                  >
                    {page.landing_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Redirect:</span>
                  <a 
                    href={page.redirect_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate max-w-md"
                  >
                    {page.redirect_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDate(page.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  {protectionConfig?.enableFrontendDetection && (
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      Frontend
                    </span>
                  )}
                  {protectionConfig?.enableCloaking && (
                    <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Cloaking
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Detectado</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.blocked}</p>
                <p className="text-xs text-muted-foreground">Bloqueados</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cloaking}</p>
                <p className="text-xs text-muted-foreground">Via Cloaking</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.frontend}</p>
                <p className="text-xs text-muted-foreground">Via Frontend</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <BotChart detections={detections} />
            <Card className="p-6">
              <BotTimeline detections={detections} pageId={page.id} onLogsDeleted={fetchDetections} />
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
