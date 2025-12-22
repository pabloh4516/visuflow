import { cn } from '@/lib/utils';
import { GeneratorConfig, PopupTemplate, popupTemplateNames } from '@/types/generator';
import { Layout } from 'lucide-react';

interface PopupTemplateSelectorProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

export function PopupTemplateSelector({ config, onConfigChange }: PopupTemplateSelectorProps) {
  const templates: PopupTemplate[] = [1, 2, 3, 4, 5];
  const templateNames = popupTemplateNames[config.popupType];

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layout className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Modelo do Popup</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {templates.map((template) => (
          <button
            key={template}
            onClick={() => onConfigChange({ ...config, popupTemplate: template })}
            className={cn(
              'relative flex flex-col items-center p-3 rounded-lg border-2 transition-all',
              config.popupTemplate === template
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 bg-secondary/50'
            )}
          >
            <div className={cn(
              'w-full aspect-square rounded-md mb-2 flex items-center justify-center text-2xl font-bold',
              config.popupTemplate === template ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {template}
            </div>
            <span className="text-xs text-center font-medium text-foreground truncate w-full">
              {templateNames[template - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
