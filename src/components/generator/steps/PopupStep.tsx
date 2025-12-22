import { GeneratorConfig, PopupType, PopupTemplate, PopupPosition, popupTemplateNames } from '@/types/generator';
import { cn } from '@/lib/utils';
import { Cookie, Globe, Users, Calendar, ShieldCheck, Sparkles, Move } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PopupStepProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

const popupTypes: { id: PopupType; name: string; icon: React.ElementType; description: string }[] = [
  { id: 'cookies', name: 'Cookies', icon: Cookie, description: 'Aviso de cookies e GDPR' },
  { id: 'country', name: 'País', icon: Globe, description: 'Seleção de localização' },
  { id: 'gender', name: 'Gênero', icon: Users, description: 'Identificação de gênero' },
  { id: 'age', name: 'Idade', icon: Calendar, description: 'Verificação de idade' },
  { id: 'captcha', name: 'Captcha', icon: ShieldCheck, description: 'Verificação humana' },
];

const positionOptions: { value: PopupPosition; label: string; icon: string }[] = [
  { value: 'top-left', label: 'Topo Esq.', icon: '↖' },
  { value: 'top', label: 'Topo', icon: '↑' },
  { value: 'top-right', label: 'Topo Dir.', icon: '↗' },
  { value: 'center', label: 'Centro', icon: '⊙' },
  { value: 'bottom-left', label: 'Baixo Esq.', icon: '↙' },
  { value: 'bottom', label: 'Baixo', icon: '↓' },
  { value: 'bottom-right', label: 'Baixo Dir.', icon: '↘' },
  { value: 'custom', label: 'Livre', icon: '✥' },
];

export function PopupStep({ config, onConfigChange }: PopupStepProps) {
  const templates: PopupTemplate[] = [1, 2, 3, 4, 5];
  const templateNames = popupTemplateNames[config.popupType];

  const updatePopupConfig = (key: string, value: string) => {
    onConfigChange({
      ...config,
      popupConfig: { ...config.popupConfig, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o Popup</h2>
        <p className="text-muted-foreground">
          Selecione o tipo de popup e personalize o conteúdo
        </p>
      </div>

      {/* Popup Type Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Tipo do Popup</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {popupTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onConfigChange({ ...config, popupType: type.id })}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                config.popupType === type.id
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                config.popupType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <type.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-sm font-medium",
                config.popupType === type.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {type.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Template Visual</Label>
        <div className="grid grid-cols-5 gap-2">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => onConfigChange({ ...config, popupTemplate: template })}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200",
                config.popupTemplate === template
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-xl font-bold transition-colors",
                config.popupTemplate === template 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {template}
              </div>
              <span className="text-[10px] text-center font-medium text-muted-foreground truncate w-full">
                {templateNames[template - 1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popup Position */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Posição do Popup</Label>
          </div>
          {config.popupPosition === 'custom' && config.customPosition && (
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
              X: {config.customPosition.x}% · Y: {config.customPosition.y}%
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {positionOptions.map((pos) => (
            <button
              key={pos.value}
              onClick={() => onConfigChange({ ...config, popupPosition: pos.value })}
              className={cn(
                "p-3 rounded-xl border-2 transition-all duration-200 text-center",
                config.popupPosition === pos.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50",
                pos.value === 'custom' && "col-span-1"
              )}
            >
              <span className="block text-lg mb-0.5">{pos.icon}</span>
              <span className="block text-[10px] text-muted-foreground leading-tight">{pos.label}</span>
            </button>
          ))}
        </div>
        {config.popupPosition === 'custom' && (
          <p className="text-xs text-muted-foreground text-center bg-primary/5 border border-primary/20 rounded-lg p-2">
            💡 Arraste o popup no preview para posicioná-lo livremente
          </p>
        )}
      </div>

      {/* Popup Content */}
      <div className="grid gap-4 p-5 rounded-xl bg-secondary/30 border border-border/50">
        <h4 className="font-semibold text-foreground">Conteúdo do Popup</h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="popup-title" className="text-xs">Título</Label>
            <Input
              id="popup-title"
              value={config.popupConfig.title}
              onChange={(e) => updatePopupConfig('title', e.target.value)}
              placeholder="Título do popup"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary-btn" className="text-xs">Botão Principal</Label>
            <Input
              id="primary-btn"
              value={config.popupConfig.primaryButtonText}
              onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
              placeholder="Aceitar"
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="popup-description" className="text-xs">Descrição</Label>
          <Textarea
            id="popup-description"
            value={config.popupConfig.description}
            onChange={(e) => updatePopupConfig('description', e.target.value)}
            placeholder="Descrição do popup..."
            rows={2}
            className="bg-background/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-btn" className="text-xs">Botão Secundário</Label>
          <Input
            id="secondary-btn"
            value={config.popupConfig.secondaryButtonText}
            onChange={(e) => updatePopupConfig('secondaryButtonText', e.target.value)}
            placeholder="Recusar"
            className="bg-background/50"
          />
        </div>
      </div>
    </div>
  );
}
