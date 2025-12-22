import { useState, useRef } from 'react';
import { GeneratorConfig, defaultConfig } from '@/types/generator';
import { WizardSteps } from '@/components/generator/WizardSteps';
import { UrlStep } from '@/components/generator/steps/UrlStep';
import { PopupStep } from '@/components/generator/steps/PopupStep';
import { StyleStep } from '@/components/generator/steps/StyleStep';
import { PixelsStep } from '@/components/generator/steps/PixelsStep';
import { ProtectionStep } from '@/components/generator/steps/ProtectionStep';
import { PreviewPanel } from '@/components/generator/PreviewPanel';
import { MiniPreview } from '@/components/generator/MiniPreview';
import { Dashboard } from '@/components/generator/Dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Download, Sparkles, Monitor, Smartphone, Copy, Check, Code, Loader2, History, Plus } from 'lucide-react';
import { generateHtml } from '@/lib/generateHtml';
import { captureScreenshot } from '@/lib/api/screenshot';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 5;

type ViewMode = 'generator' | 'preview' | 'dashboard';

const Index = () => {
  const [config, setConfig] = useState<GeneratorConfig>(defaultConfig);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [showCode, setShowCode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    // When using manual screenshots, only redirect URL is required
    if (config.useManualScreenshots) {
      if (!config.redirectUrl) {
        toast.error('Preencha a URL de redirecionamento');
        return;
      }
      if (!config.manualDesktopScreenshot || !config.manualMobileScreenshot) {
        toast.error('Por favor, faça upload das imagens de desktop e mobile');
        return;
      }
    } else {
      if (!config.landingUrl || !config.redirectUrl) {
        toast.error('Preencha as URLs primeiro');
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      toast.info('Gerando página...');
      
      let updatedConfig = { ...config };

      // Use manual screenshots if enabled, otherwise capture automatically
      if (config.useManualScreenshots) {
        if (!config.manualDesktopScreenshot || !config.manualMobileScreenshot) {
          toast.error('Por favor, faça upload das imagens de desktop e mobile.');
          setIsGenerating(false);
          return;
        }
        updatedConfig.desktopScreenshot = config.manualDesktopScreenshot;
        updatedConfig.mobileScreenshot = config.manualMobileScreenshot;
      } else {
        const [desktopResult, mobileResult] = await Promise.all([
          captureScreenshot(config.landingUrl, 'desktop'),
          captureScreenshot(config.landingUrl, 'mobile'),
        ]);

        if (desktopResult.success && desktopResult.screenshot) {
          const screenshot = desktopResult.screenshot;
          updatedConfig.desktopScreenshot = screenshot.startsWith('http') || screenshot.startsWith('data:') 
            ? screenshot 
            : `data:image/png;base64,${screenshot}`;
        }

        if (mobileResult.success && mobileResult.screenshot) {
          const screenshot = mobileResult.screenshot;
          updatedConfig.mobileScreenshot = screenshot.startsWith('http') || screenshot.startsWith('data:') 
            ? screenshot 
            : `data:image/png;base64,${screenshot}`;
        }

        if (!updatedConfig.desktopScreenshot || !updatedConfig.mobileScreenshot) {
          toast.error('Erro ao capturar screenshots. Verifique a URL.');
          setIsGenerating(false);
          return;
        }
      }

      setConfig(updatedConfig);
      
      // Generate a unique ID for this page (for bot tracking)
      const pageId = crypto.randomUUID();
      
      const html = generateHtml(updatedConfig, pageId);
      setGeneratedHtml(html);

      // Save to database with the same ID
      try {
        await supabase.from('generated_pages').insert({
          id: pageId,
          landing_url: updatedConfig.landingUrl,
          redirect_url: updatedConfig.redirectUrl,
          popup_type: updatedConfig.popupType,
          popup_template: updatedConfig.popupTemplate,
          config: updatedConfig as any,
          html_content: html,
          desktop_screenshot: updatedConfig.desktopScreenshot,
          mobile_screenshot: updatedConfig.mobileScreenshot,
          bot_protection_config: updatedConfig.botProtection as any,
        });
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
      }

      setViewMode('preview');
      toast.success('Página gerada com sucesso!');
    } catch (error) {
      console.error('Error generating:', error);
      toast.error('Erro ao gerar página. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedHtml) return;
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presell-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Arquivo baixado!');
  };

  const handleLoadPage = (page: any) => {
    setConfig(page.config);
    setGeneratedHtml(page.html_content);
    setViewMode('preview');
  };

  const handleDuplicatePage = (page: any) => {
    // Load the config but don't load the generated HTML (forces re-generation)
    const duplicatedConfig = { ...page.config };
    setConfig(duplicatedConfig);
    setGeneratedHtml('');
    setCurrentStep(1);
    setViewMode('generator');
    toast.success('Página duplicada! Ajuste as configurações e gere novamente.');
  };

  const handleEditPage = (page: any) => {
    // Load everything to edit mode
    setConfig(page.config);
    setGeneratedHtml('');
    setCurrentStep(1);
    setViewMode('generator');
  };

  const handleNewPage = () => {
    setConfig(defaultConfig);
    setGeneratedHtml('');
    setCurrentStep(1);
    setViewMode('generator');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // When using manual screenshots, only redirect URL is required
        if (config.useManualScreenshots) {
          return config.redirectUrl && config.manualDesktopScreenshot && config.manualMobileScreenshot;
        }
        return config.landingUrl && config.redirectUrl;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <UrlStep config={config} onConfigChange={setConfig} />;
      case 2:
        return <PopupStep config={config} onConfigChange={setConfig} />;
      case 3:
        return <StyleStep config={config} onConfigChange={setConfig} />;
      case 4:
        return <PixelsStep config={config} onConfigChange={setConfig} />;
      case 5:
        return <ProtectionStep config={config} onConfigChange={setConfig} />;
      default:
        return null;
    }
  };

  // Dashboard View - redirect to dashboard page
  if (viewMode === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Presell Generator</h1>
                <p className="text-xs text-muted-foreground">Crie páginas presell em minutos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('dashboard')}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              
              {viewMode === 'preview' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewPage}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Página</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'generator' ? (
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Left: Wizard */}
            <div>
              <WizardSteps
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onStepClick={setCurrentStep}
              />

              <div className="bg-card rounded-2xl border border-border/50 p-8 mb-8 shadow-sm">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>

                {currentStep === TOTAL_STEPS ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      isGenerating || 
                      !config.redirectUrl || 
                      (config.useManualScreenshots 
                        ? (!config.manualDesktopScreenshot || !config.manualMobileScreenshot)
                        : !config.landingUrl
                      )
                    }
                    className="gap-2 px-8"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gerar Página
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Preview ao Vivo
                  </h3>
                </div>
                <div className="aspect-[9/16] rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                  <MiniPreview key={`${config.popupType}-${config.popupTemplate}-${config.popupSize}`} config={config} />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Visualização do popup em tempo real
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Full Preview + Code View */
          <div className="space-y-6">
            {/* Preview Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('generator')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Editar
                </Button>
                <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors flex items-center gap-2",
                      previewDevice === 'desktop' ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors flex items-center gap-2",
                      previewDevice === 'mobile' ? "bg-background shadow-sm" : "hover:bg-background/50"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Mobile</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  {showCode ? 'Esconder' : 'Ver'} Código
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className={cn(
              "mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted transition-all duration-500",
              previewDevice === 'desktop' ? "max-w-5xl aspect-video" : "max-w-[375px] aspect-[9/19]"
            )}>
              <PreviewPanel ref={previewRef} config={config} device={previewDevice} />
            </div>

            {/* Code View */}
            {showCode && (
              <div className="bg-card rounded-xl border border-border p-4">
                <pre className="overflow-auto max-h-[400px] text-sm font-mono text-muted-foreground">
                  <code>{generatedHtml}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-5">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>Presell Generator • HTML pronto para S3, Cloudflare ou qualquer hospedagem</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;