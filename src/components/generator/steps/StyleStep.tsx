import { GeneratorConfig, PopupSize } from '@/types/generator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyleStepProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
];

const sizes: { value: PopupSize; label: string }[] = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
];

export function StyleStep({ config, onConfigChange }: StyleStepProps) {
  const updateGlobalStyles = (key: string, value: string | number) => {
    onConfigChange({
      ...config,
      globalStyles: { ...config.globalStyles, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Palette className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Personalize o Estilo</h2>
        <p className="text-muted-foreground">
          Configure cores, fontes e tamanho do popup
        </p>
      </div>

      <div className="grid gap-8 max-w-2xl mx-auto">
        {/* Size Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Tamanho do Popup</Label>
          <div className="grid grid-cols-3 gap-3">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => onConfigChange({ ...config, popupSize: size.value })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200",
                  config.popupSize === size.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-secondary/30 hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "mx-auto rounded-lg bg-muted mb-2 transition-all",
                  size.value === 'small' && "w-12 h-8",
                  size.value === 'medium' && "w-16 h-10",
                  size.value === 'large' && "w-20 h-12"
                )} />
                <span className="text-sm font-medium">{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Fonte</Label>
          <div className="grid grid-cols-5 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font.value}
                onClick={() => updateGlobalStyles('fontFamily', font.value)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all duration-200",
                  config.globalStyles.fontFamily === font.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-secondary/30 hover:border-primary/50"
                )}
              >
                <span 
                  className="text-sm font-medium"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4 p-5 rounded-xl bg-secondary/30 border border-border/50">
          <h4 className="font-semibold text-foreground">Cores</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.globalStyles.backgroundColor}
                  onChange={(e) => updateGlobalStyles('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {config.globalStyles.backgroundColor}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Texto</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.globalStyles.textColor}
                  onChange={(e) => updateGlobalStyles('textColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {config.globalStyles.textColor}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Botão</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.globalStyles.buttonColor}
                  onChange={(e) => updateGlobalStyles('buttonColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {config.globalStyles.buttonColor}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Texto Botão</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.globalStyles.buttonTextColor}
                  onChange={(e) => updateGlobalStyles('buttonTextColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {config.globalStyles.buttonTextColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Opacity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Opacidade do Overlay</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {Math.round(config.globalStyles.overlayOpacity * 100)}%
            </span>
          </div>
          <Slider
            value={[config.globalStyles.overlayOpacity * 100]}
            onValueChange={([value]) => updateGlobalStyles('overlayOpacity', value / 100)}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Transparente</span>
            <span>Escuro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
