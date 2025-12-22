import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloakingConfig } from '@/types/cloaking';
import { Bot, Loader2, Eye, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const fakePageTemplates: Record<number, { name: string; icon: string }> = {
  1: { name: 'Blog', icon: '📰' },
  2: { name: 'Manutenção', icon: '🛠️' },
  3: { name: 'Corporativo', icon: '🏢' },
  4: { name: 'E-commerce', icon: '🛒' },
  5: { name: 'Notícias', icon: '⚡' },
};

export default function CloakingBotPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<CloakingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [fakePageHtml, setFakePageHtml] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('cloaking_configs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setConfig(data as unknown as CloakingConfig);
      } catch (error) {
        console.error('Error fetching cloaking config:', error);
        toast({
          title: 'Erro ao carregar configuração',
          description: 'Não foi possível carregar a configuração de cloaking.',
          variant: 'destructive',
        });
        navigate('/cloaking');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [id, navigate]);

  // Fetch the fake page HTML when config is loaded and action is fake_page
  useEffect(() => {
    if (!config || config.bot_action !== 'fake_page') return;

    const fetchFakePage = async () => {
      setIsLoadingPreview(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/serve-page?cloaking=${id}&preview=bot`);
        const html = await response.text();
        setFakePageHtml(html);
      } catch (error) {
        console.error('Error fetching fake page:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchFakePage();
  }, [config, id]);

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

  const getBotActionDisplay = () => {
    switch (config.bot_action) {
      case 'fake_page':
        const template = fakePageTemplates[config.fake_page_template || 1];
        return {
          label: 'Página Fake',
          description: `Template: ${template?.icon} ${template?.name}`,
          showPreview: true,
        };
      case 'redirect':
        return {
          label: 'Redirecionamento',
          description: `Redireciona para: ${config.bot_redirect_url || 'Não configurado'}`,
          showPreview: false,
        };
      case 'block':
        return {
          label: 'Bloqueio',
          description: 'Retorna erro 403 (Forbidden)',
          showPreview: false,
        };
      default:
        return {
          label: 'Desconhecido',
          description: '',
          showPreview: false,
        };
    }
  };

  const actionDisplay = getBotActionDisplay();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Bot className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Visualização do Bot
              </h1>
              <p className="text-sm text-muted-foreground">
                Simule como bots do TikTok, Facebook e Google veem seu cloaking
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Configuração: {config.name}
            </CardTitle>
            <CardDescription>
              Quando um bot acessar seu link de cloaking, verá o seguinte:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {actionDisplay.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">{actionDisplay.description}</p>
            </div>

            {config.safe_redirect_url && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  🛡️ URL Safe para Verificadores: {config.safe_redirect_url}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verificadores do TikTok/Facebook com emulador serão redirecionados para esta URL
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Types Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipos de Bots Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎵</span>
                  <h4 className="font-medium">TikTok</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  bytespider, tiktok_ads_bot, bytedancespider
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📘</span>
                  <h4 className="font-medium">Facebook/Meta</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  facebookexternalhit, facebookcatalog, facebot
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔍</span>
                  <h4 className="font-medium">Google</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  googlebot, adsbot-google, google-ads
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {actionDisplay.showPreview && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Preview da Página Fake</CardTitle>
                  <CardDescription>
                    Esta é a página que bots verão ao acessar seu link
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                    className="gap-1"
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                    className="gap-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div 
                    className={`bg-white rounded-lg shadow-lg overflow-hidden border transition-all duration-300 ${
                      viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                    }`}
                  >
                    <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 truncate">
                        preview.seudominio.com
                      </div>
                    </div>
                    <iframe
                      srcDoc={fakePageHtml}
                      className={`w-full border-0 ${
                        viewMode === 'mobile' ? 'h-[667px]' : 'h-[600px]'
                      }`}
                      title="Bot Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Blocked State */}
        {config.bot_action === 'block' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold mb-2">Acesso Bloqueado</h3>
              <p className="text-muted-foreground">
                Bots receberão um erro HTTP 403 (Forbidden) ao tentar acessar este link
              </p>
            </CardContent>
          </Card>
        )}

        {/* Redirect State */}
        {config.bot_action === 'redirect' && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">↪️</div>
              <h3 className="text-xl font-semibold mb-2">Redirecionamento</h3>
              <p className="text-muted-foreground mb-4">
                Bots serão redirecionados para:
              </p>
              {config.bot_redirect_url ? (
                <Button
                  variant="outline"
                  onClick={() => window.open(config.bot_redirect_url || '', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {config.bot_redirect_url}
                </Button>
              ) : (
                <Badge variant="destructive">URL não configurada</Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detection Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métodos de Detecção Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`p-4 border rounded-lg ${config.block_known_bots ? 'border-green-500/50 bg-green-500/5' : 'border-muted'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Bloquear Bots Conhecidos</h4>
                  <Badge variant={config.block_known_bots ? 'default' : 'secondary'}>
                    {config.block_known_bots ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detecta crawlers do Meta, Google, TikTok, Bing e outros
                </p>
              </div>
              <div className={`p-4 border rounded-lg ${config.block_data_centers ? 'border-green-500/50 bg-green-500/5' : 'border-muted'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Bloquear Data Centers</h4>
                  <Badge variant={config.block_data_centers ? 'default' : 'secondary'}>
                    {config.block_data_centers ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detecta IPs de AWS, Google Cloud, Azure e outros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}