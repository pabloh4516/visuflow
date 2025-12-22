import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GeneratorConfig, PopupSize, PopupType, PopupPosition } from '@/types/generator';
import { Settings2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopupConfigPanelProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

const sizeOptions: { value: PopupSize; label: string; desc: string }[] = [
  { value: 'small', label: 'Pequeno', desc: '320px' },
  { value: 'medium', label: 'Médio', desc: '420px' },
  { value: 'large', label: 'Grande', desc: '520px' },
];

const positionOptions: { value: PopupPosition; label: string; icon: string }[] = [
  { value: 'top-left', label: 'Topo Esq.', icon: '↖' },
  { value: 'top', label: 'Topo', icon: '↑' },
  { value: 'top-right', label: 'Topo Dir.', icon: '↗' },
  { value: 'center', label: 'Centro', icon: '⊙' },
  { value: 'bottom-left', label: 'Baixo Esq.', icon: '↙' },
  { value: 'bottom', label: 'Baixo', icon: '↓' },
  { value: 'bottom-right', label: 'Baixo Dir.', icon: '↘' },
];

export function PopupConfigPanel({ config, onConfigChange }: PopupConfigPanelProps) {
  const updatePopupConfig = (key: string, value: any) => {
    onConfigChange({
      ...config,
      popupConfig: {
        ...config.popupConfig,
        [key]: value,
      },
    });
  };

  const renderSizeSelector = () => (
    <div className="mb-5 pb-5 border-b border-border">
      <Label className="text-muted-foreground text-sm mb-2 block">Tamanho do Popup</Label>
      <div className="grid grid-cols-3 gap-2">
        {sizeOptions.map((size) => (
          <button
            key={size.value}
            onClick={() => onConfigChange({ ...config, popupSize: size.value })}
            className={cn(
              'p-3 rounded-lg border-2 transition-all text-center',
              config.popupSize === size.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            )}
          >
            <span className="block text-sm font-medium text-foreground">{size.label}</span>
            <span className="block text-xs text-muted-foreground">{size.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPositionSelector = () => (
    <div className="mb-5 pb-5 border-b border-border">
      <div className="flex items-center gap-2 mb-2">
        <Move className="w-4 h-4 text-muted-foreground" />
        <Label className="text-muted-foreground text-sm">Posição do Popup</Label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {positionOptions.map((pos) => (
          <button
            key={pos.value}
            onClick={() => onConfigChange({ ...config, popupPosition: pos.value })}
            className={cn(
              'p-2 rounded-lg border-2 transition-all text-center',
              config.popupPosition === pos.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50',
              pos.value === 'center' && 'col-span-1'
            )}
          >
            <span className="block text-lg mb-0.5">{pos.icon}</span>
            <span className="block text-[10px] text-muted-foreground leading-tight">{pos.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCookiesConfig = () => (
    <div className="space-y-4">
      {renderSizeSelector()}
      {renderPositionSelector()}
      <div>
        <Label className="text-muted-foreground text-sm">Título</Label>
        <Input
          value={config.popupConfig.title}
          onChange={(e) => updatePopupConfig('title', e.target.value)}
          placeholder="Este site utiliza cookies"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Descrição</Label>
        <Textarea
          value={config.popupConfig.description}
          onChange={(e) => updatePopupConfig('description', e.target.value)}
          placeholder="Utilizamos cookies para melhorar sua experiência..."
          className="mt-1.5 bg-input border-border h-20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground text-sm">Botão Principal</Label>
          <Input
            value={config.popupConfig.primaryButtonText}
            onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
            placeholder="Aceitar"
            className="mt-1.5 bg-input border-border"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm">Botão Secundário</Label>
          <Input
            value={config.popupConfig.secondaryButtonText}
            onChange={(e) => updatePopupConfig('secondaryButtonText', e.target.value)}
            placeholder="Recusar"
            className="mt-1.5 bg-input border-border"
          />
        </div>
      </div>
    </div>
  );

  const renderCountryConfig = () => (
    <div className="space-y-4">
      {renderSizeSelector()}
      {renderPositionSelector()}
      <div>
        <Label className="text-muted-foreground text-sm">Título</Label>
        <Input
          value={config.popupConfig.title}
          onChange={(e) => updatePopupConfig('title', e.target.value)}
          placeholder="Selecione seu país"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Descrição (opcional)</Label>
        <Input
          value={config.popupConfig.description}
          onChange={(e) => updatePopupConfig('description', e.target.value)}
          placeholder="Escolha sua localização para continuar"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Texto do Botão</Label>
        <Input
          value={config.popupConfig.primaryButtonText}
          onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
          placeholder="Continuar"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Países (formato: código,nome,emoji por linha)</Label>
        <Textarea
          value={config.popupConfig.countries?.map(c => `${c.code},${c.name},${c.flag}`).join('\n') || ''}
          onChange={(e) => {
            const countries = e.target.value.split('\n').filter(Boolean).map(line => {
              const [code, name, flag] = line.split(',');
              return { code: code?.trim() || '', name: name?.trim() || '', flag: flag?.trim() || '' };
            });
            updatePopupConfig('countries', countries);
          }}
          placeholder="BR,Brasil,🇧🇷&#10;PT,Portugal,🇵🇹"
          className="mt-1.5 bg-input border-border h-24 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderGenderConfig = () => (
    <div className="space-y-4">
      {renderSizeSelector()}
      {renderPositionSelector()}
      <div>
        <Label className="text-muted-foreground text-sm">Título</Label>
        <Input
          value={config.popupConfig.title}
          onChange={(e) => updatePopupConfig('title', e.target.value)}
          placeholder="Selecione seu gênero"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Descrição (opcional)</Label>
        <Input
          value={config.popupConfig.description}
          onChange={(e) => updatePopupConfig('description', e.target.value)}
          placeholder="Personalize sua experiência"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Texto do Botão</Label>
        <Input
          value={config.popupConfig.primaryButtonText}
          onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
          placeholder="Continuar"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Opções de Gênero (valor,label por linha)</Label>
        <Textarea
          value={config.popupConfig.genderOptions?.map(g => `${g.value},${g.label}`).join('\n') || ''}
          onChange={(e) => {
            const options = e.target.value.split('\n').filter(Boolean).map(line => {
              const [value, label] = line.split(',');
              return { value: value?.trim() || '', label: label?.trim() || '' };
            });
            updatePopupConfig('genderOptions', options);
          }}
          placeholder="male,Masculino&#10;female,Feminino&#10;other,Outro"
          className="mt-1.5 bg-input border-border h-24 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderAgeConfig = () => (
    <div className="space-y-4">
      {renderSizeSelector()}
      {renderPositionSelector()}
      <div>
        <Label className="text-muted-foreground text-sm">Título</Label>
        <Input
          value={config.popupConfig.title}
          onChange={(e) => updatePopupConfig('title', e.target.value)}
          placeholder="Verificação de Idade"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Descrição</Label>
        <Textarea
          value={config.popupConfig.description}
          onChange={(e) => updatePopupConfig('description', e.target.value)}
          placeholder="Você confirma ter mais de 18 anos?"
          className="mt-1.5 bg-input border-border h-16"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground text-sm">Botão Confirmar</Label>
          <Input
            value={config.popupConfig.primaryButtonText}
            onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
            placeholder="SIM, tenho +18"
            className="mt-1.5 bg-input border-border"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-sm">Botão Recusar</Label>
          <Input
            value={config.popupConfig.secondaryButtonText}
            onChange={(e) => updatePopupConfig('secondaryButtonText', e.target.value)}
            placeholder="NÃO"
            className="mt-1.5 bg-input border-border"
          />
        </div>
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Opções de Idade (separadas por vírgula)</Label>
        <Input
          value={config.popupConfig.ageOptions?.join(', ') || ''}
          onChange={(e) => updatePopupConfig('ageOptions', e.target.value.split(',').map(s => s.trim()))}
          placeholder="+18, +21, +25"
          className="mt-1.5 bg-input border-border"
        />
      </div>
    </div>
  );

  const renderCaptchaConfig = () => (
    <div className="space-y-4">
      {renderSizeSelector()}
      {renderPositionSelector()}
      <div>
        <Label className="text-muted-foreground text-sm">Título</Label>
        <Input
          value={config.popupConfig.title}
          onChange={(e) => updatePopupConfig('title', e.target.value)}
          placeholder="Verificação de Segurança"
          className="mt-1.5 bg-input border-border"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Descrição</Label>
        <Textarea
          value={config.popupConfig.description}
          onChange={(e) => updatePopupConfig('description', e.target.value)}
          placeholder="Clique no botão para verificar que você não é um robô"
          className="mt-1.5 bg-input border-border h-16"
        />
      </div>
      <div>
        <Label className="text-muted-foreground text-sm">Texto do Botão</Label>
        <Input
          value={config.popupConfig.primaryButtonText}
          onChange={(e) => updatePopupConfig('primaryButtonText', e.target.value)}
          placeholder="Não sou um robô"
          className="mt-1.5 bg-input border-border"
        />
      </div>
    </div>
  );

  const configRenderers: Record<PopupType, () => JSX.Element> = {
    cookies: renderCookiesConfig,
    country: renderCountryConfig,
    gender: renderGenderConfig,
    age: renderAgeConfig,
    captcha: renderCaptchaConfig,
  };

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Configuração do Popup</h3>
      </div>
      
      {configRenderers[config.popupType]()}
    </div>
  );
}