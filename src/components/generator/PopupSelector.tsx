import { cn } from '@/lib/utils';
import { PopupType } from '@/types/generator';
import { Cookie, Globe2, Users, Calendar, Shield } from 'lucide-react';

interface PopupSelectorProps {
  selected: PopupType;
  onSelect: (type: PopupType) => void;
}

const popupTypes = [
  {
    id: 'cookies' as PopupType,
    name: 'Cookies',
    description: 'Política de cookies com botões Aceitar/Fechar',
    icon: Cookie,
  },
  {
    id: 'country' as PopupType,
    name: 'Países',
    description: 'Seleção de país com bandeiras',
    icon: Globe2,
  },
  {
    id: 'gender' as PopupType,
    name: 'Gênero',
    description: 'Opções: Masculino, Feminino, Outro',
    icon: Users,
  },
  {
    id: 'age' as PopupType,
    name: 'Idade',
    description: 'Verificação de faixa etária (+18, +21)',
    icon: Calendar,
  },
  {
    id: 'captcha' as PopupType,
    name: 'Captcha',
    description: 'Simulação visual de verificação',
    icon: Shield,
  },
];

export function PopupSelector({ selected, onSelect }: PopupSelectorProps) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <h3 className="font-semibold text-foreground mb-4">Escolha o Popup Inteligente</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {popupTypes.map((popup) => {
          const Icon = popup.icon;
          const isSelected = selected === popup.id;
          
          return (
            <button
              key={popup.id}
              onClick={() => onSelect(popup.id)}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all duration-200 text-left group',
                'hover:border-primary/50 hover:bg-secondary/50',
                isSelected
                  ? 'border-primary bg-primary/10 glow-primary'
                  : 'border-border bg-card'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:text-primary'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <h4 className={cn(
                'font-medium text-sm mb-1 transition-colors',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {popup.name}
              </h4>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {popup.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
