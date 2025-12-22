import { GeneratorConfig, defaultBackgrounds, DefaultBackgroundId } from '@/types/generator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ExternalLink, CheckCircle, Monitor, Smartphone, Upload, Image, FileText, Palette, Check } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface UrlStepProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

type BackgroundMode = 'auto' | 'manual' | 'default';

export function UrlStep({ config, onConfigChange }: UrlStepProps) {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File, type: 'desktop' | 'mobile') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'desktop') {
        onConfigChange({ ...config, manualDesktopScreenshot: base64 });
      } else {
        onConfigChange({ ...config, manualMobileScreenshot: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const getCurrentMode = (): BackgroundMode => {
    if (config.useDefaultBackground) return 'default';
    if (config.useManualScreenshots) return 'manual';
    return 'auto';
  };

  const setBackgroundMode = (mode: BackgroundMode) => {
    onConfigChange({
      ...config,
      useManualScreenshots: mode === 'manual',
      useDefaultBackground: mode === 'default',
    });
  };

  const selectDefaultBackground = (id: DefaultBackgroundId) => {
    onConfigChange({
      ...config,
      defaultBackgroundId: id,
      useDefaultBackground: true,
      useManualScreenshots: false,
    });
  };

  const currentMode = getCurrentMode();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Configure as URLs</h2>
        <p className="text-muted-foreground">
          Insira a URL da landing page e a URL de redirecionamento
        </p>
      </div>

      <div className="grid gap-6 max-w-xl mx-auto">
        {/* Page Name */}
        <div className="space-y-3">
          <Label htmlFor="page-name" className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Nome da Página
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Input
              id="page-name"
              type="text"
              placeholder="Ex: Campanha Black Friday, Teste A/B Oferta..."
              value={config.pageName}
              onChange={(e) => onConfigChange({ ...config, pageName: e.target.value })}
              className="h-12 pl-4 pr-10 text-base bg-secondary/50 border-border/50 focus:border-primary"
            />
            {config.pageName && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Dê um nome descritivo para identificar facilmente esta página no dashboard
          </p>
        </div>

        {/* Page Slug */}
        <div className="space-y-3">
          <Label htmlFor="page-slug" className="text-sm font-medium flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            Slug Personalizado
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Input
              id="page-slug"
              type="text"
              placeholder="Ex: black-friday, oferta-especial..."
              value={config.pageSlug}
              onChange={(e) => onConfigChange({ ...config, pageSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              className="h-12 pl-4 pr-10 text-base bg-secondary/50 border-border/50 focus:border-primary"
            />
            {config.pageSlug && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            URL amigável: seudominio.com/p/{config.pageSlug || 'seu-slug'} (apenas letras, números e hífens)
          </p>
        </div>

        {/* Landing URL - only required if using auto mode */}
        {currentMode === 'auto' && (
          <div className="space-y-3">
            <Label htmlFor="landing-url" className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              URL da Landing Page
            </Label>
            <div className="relative">
              <Input
                id="landing-url"
                type="url"
                placeholder="https://exemplo.com/landing"
                value={config.landingUrl}
                onChange={(e) => onConfigChange({ ...config, landingUrl: e.target.value })}
                className="h-12 pl-4 pr-10 text-base bg-secondary/50 border-border/50 focus:border-primary"
              />
              {config.landingUrl && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O screenshot desta página será usado como fundo do presell
            </p>
          </div>
        )}

        {/* Redirect URL */}
        <div className="space-y-3">
          <Label htmlFor="redirect-url" className="text-sm font-medium flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            URL de Redirecionamento
          </Label>
          <div className="relative">
            <Input
              id="redirect-url"
              type="url"
              placeholder="https://exemplo.com/oferta"
              value={config.redirectUrl}
              onChange={(e) => onConfigChange({ ...config, redirectUrl: e.target.value })}
              className="h-12 pl-4 pr-10 text-base bg-secondary/50 border-border/50 focus:border-primary"
            />
            {config.redirectUrl && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Para onde o usuário será redirecionado após interagir com o popup
          </p>
        </div>

        {/* Background Mode Selection */}
        <div className="pt-4 border-t border-border/50">
          <Label className="text-sm font-medium mb-4 block">Tipo de Background</Label>
          <div className="grid grid-cols-3 gap-3">
            {/* Auto Mode */}
            <button
              type="button"
              onClick={() => setBackgroundMode('auto')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                currentMode === 'auto'
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50"
              )}
            >
              <Globe className={cn("w-6 h-6", currentMode === 'auto' ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", currentMode === 'auto' ? "text-primary" : "text-muted-foreground")}>
                Screenshot
              </span>
            </button>

            {/* Manual Mode */}
            <button
              type="button"
              onClick={() => setBackgroundMode('manual')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                currentMode === 'manual'
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50"
              )}
            >
              <Upload className={cn("w-6 h-6", currentMode === 'manual' ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", currentMode === 'manual' ? "text-primary" : "text-muted-foreground")}>
                Upload
              </span>
            </button>

            {/* Default Background Mode */}
            <button
              type="button"
              onClick={() => setBackgroundMode('default')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                currentMode === 'default'
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50"
              )}
            >
              <Palette className={cn("w-6 h-6", currentMode === 'default' ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", currentMode === 'default' ? "text-primary" : "text-muted-foreground")}>
                Gradiente
              </span>
            </button>
          </div>
        </div>

        {/* Default Backgrounds Gallery */}
        {currentMode === 'default' && (
          <div className="space-y-4 animate-fade-in">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Escolha um Background
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {defaultBackgrounds.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => selectDefaultBackground(bg.id)}
                  className={cn(
                    "relative h-20 rounded-xl border-2 transition-all overflow-hidden group",
                    config.defaultBackgroundId === bg.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-primary/50"
                  )}
                  style={{ background: bg.gradient }}
                >
                  {config.defaultBackgroundId === bg.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-xs font-medium text-white drop-shadow-lg">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Upload Fields */}
        {currentMode === 'manual' && (
          <div className="space-y-4 animate-fade-in">
            {/* Desktop Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                Imagem Desktop
              </Label>
              <input
                ref={desktopInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'desktop');
                }}
              />
              <div 
                onClick={() => desktopInputRef.current?.click()}
                className="relative h-32 rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                {config.manualDesktopScreenshot ? (
                  <>
                    <img 
                      src={config.manualDesktopScreenshot} 
                      alt="Desktop preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-background/80 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-xs font-medium">Imagem carregada</span>
                      <span className="text-xs text-muted-foreground">Clique para trocar</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                    <span className="text-xs text-muted-foreground">Recomendado: 1920x1080</span>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Imagem Mobile
              </Label>
              <input
                ref={mobileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'mobile');
                }}
              />
              <div 
                onClick={() => mobileInputRef.current?.click()}
                className="relative h-32 rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                {config.manualMobileScreenshot ? (
                  <>
                    <img 
                      src={config.manualMobileScreenshot} 
                      alt="Mobile preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-1 bg-background/80 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-xs font-medium">Imagem carregada</span>
                      <span className="text-xs text-muted-foreground">Clique para trocar</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                    <span className="text-xs text-muted-foreground">Recomendado: 390x844</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
