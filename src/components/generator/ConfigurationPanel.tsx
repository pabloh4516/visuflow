import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GeneratorConfig } from '@/types/generator';
import { Palette } from 'lucide-react';

interface ConfigurationPanelProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
  showUrlFields?: boolean;
}

export function ConfigurationPanel({ config, onConfigChange, showUrlFields = true }: ConfigurationPanelProps) {
  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onConfigChange(newConfig);
  };

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Estilos do Popup</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buttonColor" className="text-muted-foreground text-sm">
            Cor do Botão
          </Label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="color"
              id="buttonColor"
              value={config.globalStyles.buttonColor}
              onChange={(e) => updateConfig('globalStyles.buttonColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={config.globalStyles.buttonColor}
              onChange={(e) => updateConfig('globalStyles.buttonColor', e.target.value)}
              className="bg-input border-border flex-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="buttonTextColor" className="text-muted-foreground text-sm">
            Texto do Botão
          </Label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="color"
              id="buttonTextColor"
              value={config.globalStyles.buttonTextColor}
              onChange={(e) => updateConfig('globalStyles.buttonTextColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={config.globalStyles.buttonTextColor}
              onChange={(e) => updateConfig('globalStyles.buttonTextColor', e.target.value)}
              className="bg-input border-border flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="backgroundColor" className="text-muted-foreground text-sm">
            Fundo do Popup
          </Label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="color"
              id="backgroundColor"
              value={config.globalStyles.backgroundColor}
              onChange={(e) => updateConfig('globalStyles.backgroundColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={config.globalStyles.backgroundColor}
              onChange={(e) => updateConfig('globalStyles.backgroundColor', e.target.value)}
              className="bg-input border-border flex-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="textColor" className="text-muted-foreground text-sm">
            Cor do Texto
          </Label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="color"
              id="textColor"
              value={config.globalStyles.textColor}
              onChange={(e) => updateConfig('globalStyles.textColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={config.globalStyles.textColor}
              onChange={(e) => updateConfig('globalStyles.textColor', e.target.value)}
              className="bg-input border-border flex-1"
            />
          </div>
        </div>

        <div className="col-span-2">
          <Label htmlFor="overlayOpacity" className="text-muted-foreground text-sm">
            Opacidade do Overlay: {Math.round(config.globalStyles.overlayOpacity * 100)}%
          </Label>
          <Slider
            id="overlayOpacity"
            value={[config.globalStyles.overlayOpacity]}
            onValueChange={([value]) => updateConfig('globalStyles.overlayOpacity', value)}
            min={0.3}
            max={1}
            step={0.05}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
