import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GeneratorConfig, defaultConfig, defaultBotProtection, CustomPosition, PopupType, PopupTemplate, defaultBackgrounds } from '@/types/generator';
import { AppLayout } from '@/components/AppLayout';
import { WizardSteps } from '@/components/generator/WizardSteps';
import { UrlStep } from '@/components/generator/steps/UrlStep';
import { PopupStep } from '@/components/generator/steps/PopupStep';
import { StyleStep } from '@/components/generator/steps/StyleStep';
import { PixelsStep } from '@/components/generator/steps/PixelsStep';
import { ProtectionStep } from '@/components/generator/steps/ProtectionStep';
import { PreviewPanel } from '@/components/generator/PreviewPanel';
import { MiniPreview } from '@/components/generator/MiniPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Download, Sparkles, Monitor, Smartphone, Copy, Check, Code, Loader2, Pencil, Files, X, Shield, Link, Globe, Settings } from 'lucide-react';
import { generateHtml } from '@/lib/generateHtml';
import { captureScreenshot } from '@/lib/api/screenshot';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserDomain } from '@/hooks/useUserDomain';

const TOTAL_STEPS = 5;

type ViewMode = 'generator' | 'preview';

interface LocationState {
  page?: any;
  mode?: 'edit' | 'duplicate';
}

export default function AppGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(defaultConfig);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [showCode, setShowCode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editorDevice, setEditorDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [copied, setCopied] = useState(false);
  const [copiedCloaking, setCopiedCloaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'edit' | 'duplicate' | null>(null);
  const [generatedPageId, setGeneratedPageId] = useState<string | null>(null);
  const [generatedShortId, setGeneratedShortId] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hasLoadedFromStateRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { domain: userDomain, getPageUrl, getCloakingUrl } = useUserDomain();

  // Load page data from navigation state - only process once
  useEffect(() => {
    // Prevent double processing (React StrictMode or re-renders)
    if (hasLoadedFromStateRef.current) return;
    
    const state = location.state as LocationState;
    if (state?.page) {
      // Mark as processed BEFORE doing anything else
      hasLoadedFromStateRef.current = true;
      
      const pageData = state.page;
      const pageConfig = pageData.config as GeneratorConfig | null;
      
      // Check if config exists and has data
      if (pageConfig && Object.keys(pageConfig).length > 0) {
        setConfig({
          ...defaultConfig,
          ...pageConfig,
          // Ensure botProtection is loaded correctly
          botProtection: {
            ...defaultBotProtection,
            ...(pageConfig.botProtection || {}),
          },
        });
      } else {
        // Fallback: use basic page data when config is missing
        setConfig({
          ...defaultConfig,
          pageName: pageData.name || '',
          landingUrl: pageData.landing_url || '',
          redirectUrl: pageData.redirect_url || '',
          popupType: (pageData.popup_type as PopupType) || 'cookies',
          popupTemplate: (pageData.popup_template as PopupTemplate) || 1,
          desktopScreenshot: pageData.desktop_screenshot || '',
          mobileScreenshot: pageData.mobile_screenshot || '',
          botProtection: {
            ...defaultBotProtection,
            ...(pageData.bot_protection_config || {}),
          },
        });
      }
      
      setEditMode(state.mode || null);
      if (state.mode === 'edit' && pageData.id) {
        setEditingPageId(pageData.id);
      }
      
      // Clear state AFTER setting everything
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handlePositionChange = useCallback((position: CustomPosition) => {
    setConfig(prev => ({
      ...prev,
      customPosition: position,
    }));
  }, []);

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
    // Validation based on background mode
    if (config.useDefaultBackground) {
      if (!config.redirectUrl) {
        toast.error('Preencha a URL de redirecionamento');
        return;
      }
    } else if (config.useManualScreenshots) {
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

      if (config.useDefaultBackground) {
        // Using default background - no screenshots needed
        const selectedBg = defaultBackgrounds.find(bg => bg.id === config.defaultBackgroundId);
        updatedConfig.desktopScreenshot = '';
        updatedConfig.mobileScreenshot = '';
        // Store the gradient info in config for generateHtml
      } else if (config.useManualScreenshots) {
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
      
      const pageId = editingPageId || crypto.randomUUID();
      const html = generateHtml(updatedConfig, pageId);
      setGeneratedHtml(html);

      try {
        // Remove screenshots from config to avoid duplication (stored in separate columns)
        const configWithoutScreenshots = {
          ...updatedConfig,
          desktopScreenshot: '',
          mobileScreenshot: '',
          manualDesktopScreenshot: '',
          manualMobileScreenshot: '',
        };

        if (editingPageId) {
          // UPDATE existing page
          const { data: updatedPage } = await supabase.from('generated_pages').update({
            name: updatedConfig.pageName || null,
            landing_url: updatedConfig.landingUrl,
            redirect_url: updatedConfig.redirectUrl,
            popup_type: updatedConfig.popupType,
            popup_template: updatedConfig.popupTemplate,
            config: configWithoutScreenshots as any,
            html_content: html,
            desktop_screenshot: updatedConfig.desktopScreenshot,
            mobile_screenshot: updatedConfig.mobileScreenshot,
            bot_protection_config: updatedConfig.botProtection as any,
            slug: updatedConfig.pageSlug || null,
          }).eq('id', editingPageId).select('short_id, slug').single();
          
          if (updatedPage) {
            setGeneratedShortId(updatedPage.short_id);
            setGeneratedSlug(updatedPage.slug);
          }
        } else {
          // INSERT new page
          const { data: newPage } = await supabase.from('generated_pages').insert({
            id: pageId,
            name: updatedConfig.pageName || null,
            landing_url: updatedConfig.landingUrl,
            redirect_url: updatedConfig.redirectUrl,
            popup_type: updatedConfig.popupType,
            popup_template: updatedConfig.popupTemplate,
            config: configWithoutScreenshots as any,
            html_content: html,
            desktop_screenshot: updatedConfig.desktopScreenshot,
            mobile_screenshot: updatedConfig.mobileScreenshot,
            bot_protection_config: updatedConfig.botProtection as any,
            user_id: user?.id,
            slug: updatedConfig.pageSlug || null,
          }).select('short_id, slug').single();
          
          if (newPage) {
            setGeneratedShortId(newPage.short_id);
            setGeneratedSlug(newPage.slug);
          }
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
      }

      setGeneratedPageId(pageId);
      setViewMode('preview');
      toast.success(editingPageId ? 'Página atualizada!' : 'Página gerada com sucesso!');
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

  const handleNewPage = () => {
    setConfig(defaultConfig);
    setGeneratedHtml('');
    setCurrentStep(1);
    setViewMode('generator');
    setEditingPageId(null);
    setEditMode(null);
    setGeneratedPageId(null);
    setGeneratedShortId(null);
    setGeneratedSlug(null);
  };

  const handleCopyCloakingLink = async () => {
    if (!generatedPageId) return;
    // Use getPageUrl with short_id or slug for shorter URLs
    const link = getPageUrl(generatedPageId, generatedShortId, generatedSlug);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedCloaking(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopiedCloaking(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const handleCancelEdit = () => {
    navigate('/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (config.useDefaultBackground) {
          return !!config.redirectUrl;
        }
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Edit/Duplicate Mode Indicator */}
        {editMode && (
          <div className={cn(
            "flex items-center justify-between mb-6 px-4 py-3 rounded-lg border",
            editMode === 'edit' 
              ? "bg-blue-500/10 border-blue-500/30" 
              : "bg-purple-500/10 border-purple-500/30"
          )}>
            <div className="flex items-center gap-3">
              {editMode === 'edit' ? (
                <Pencil className="w-5 h-5 text-blue-400" />
              ) : (
                <Files className="w-5 h-5 text-purple-400" />
              )}
              <span className={cn(
                "font-medium",
                editMode === 'edit' ? "text-blue-400" : "text-purple-400"
              )}>
                {editMode === 'edit' ? 'Editando página existente' : 'Duplicando página'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        )}

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
                      (config.useDefaultBackground 
                        ? false
                        : config.useManualScreenshots 
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
                        {editingPageId ? 'Atualizando...' : 'Gerando...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {editingPageId ? 'Atualizar Página' : 'Gerar Página'}
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
                  <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                    <button
                      onClick={() => setEditorDevice('desktop')}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        editorDevice === 'desktop' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Desktop"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditorDevice('mobile')}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        editorDevice === 'mobile' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Mobile"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={cn(
                  "rounded-2xl overflow-hidden border border-border/50 shadow-xl transition-all duration-300",
                  editorDevice === 'desktop' ? "aspect-[16/10]" : "aspect-[9/16]"
                )}>
                  <MiniPreview 
                    key={`${config.popupType}-${config.popupTemplate}-${config.popupSize}-${config.popupPosition}-${editorDevice}`} 
                    config={config} 
                    onPositionChange={handlePositionChange}
                    device={editorDevice}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {config.popupPosition === 'custom' 
                    ? 'Arraste o popup para posicioná-lo' 
                    : `Visualização ${editorDevice === 'desktop' ? 'desktop' : 'mobile'}`}
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
                <Button size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Page Link - Always show when we have a generated page */}
            {generatedPageId && (
              <div className={cn(
                "p-4 rounded-xl border animate-fade-in",
                config.botProtection?.enableCloaking 
                  ? "bg-purple-500/10 border-purple-500/30" 
                  : "bg-primary/10 border-primary/30"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    config.botProtection?.enableCloaking ? "bg-purple-500/20" : "bg-primary/20"
                  )}>
                    {config.botProtection?.enableCloaking ? (
                      <Shield className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Link className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-sm font-semibold",
                        config.botProtection?.enableCloaking ? "text-purple-400" : "text-primary"
                      )}>
                        {config.botProtection?.enableCloaking ? 'Link com Proteção' : 'Link da Página'}
                      </h4>
                      {config.botProtection?.enableCloaking && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Cloaking Ativo
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs",
                      config.botProtection?.enableCloaking ? "text-purple-300/80" : "text-muted-foreground"
                    )}>
                      {config.botProtection?.enableCloaking 
                        ? 'Use este link nos seus anúncios. Bots verão uma página falsa, usuários reais verão sua presell.'
                        : 'Use este link para acessar sua página ou compartilhar nos seus anúncios.'
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-xs font-mono text-foreground bg-background/50 p-2 rounded truncate">
                        {getPageUrl(generatedPageId)}
                      </code>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="shrink-0"
                        onClick={handleCopyCloakingLink}
                      >
                        {copiedCloaking ? <Check className="w-4 h-4 mr-1" /> : <Link className="w-4 h-4 mr-1" />}
                        {copiedCloaking ? 'Copiado!' : 'Copiar Link'}
                      </Button>
                    </div>
                    {/* Custom domain hint */}
                    {!userDomain?.is_verified && (
                      <div className={cn(
                        "flex items-center gap-2 mt-2 pt-2 border-t",
                        config.botProtection?.enableCloaking ? "border-purple-500/20" : "border-primary/20"
                      )}>
                        <Globe className={cn(
                          "w-4 h-4",
                          config.botProtection?.enableCloaking ? "text-purple-400/60" : "text-primary/60"
                        )} />
                        <span className={cn(
                          "text-xs",
                          config.botProtection?.enableCloaking ? "text-purple-300/60" : "text-muted-foreground"
                        )}>
                          Use seu próprio domínio para maior segurança.
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className={cn(
                            "h-auto p-0 text-xs",
                            config.botProtection?.enableCloaking ? "text-purple-400" : "text-primary"
                          )}
                          onClick={() => navigate('/settings/domain')}
                        >
                          Configurar →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
      </div>
    </AppLayout>
  );
}
