import { cn } from '@/lib/utils';
import { Check, Link, Palette, Sparkles, Code, Shield } from 'lucide-react';

interface WizardStepsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { id: 1, name: 'URLs', icon: Link, description: 'Landing e Redirect' },
  { id: 2, name: 'Popup', icon: Sparkles, description: 'Tipo e Template' },
  { id: 3, name: 'Estilo', icon: Palette, description: 'Cores e Fontes' },
  { id: 4, name: 'Pixels', icon: Code, description: 'Scripts e Tracking' },
  { id: 5, name: 'Proteção', icon: Shield, description: 'Anti-Bot' },
];

export function WizardSteps({ currentStep, totalSteps, onStepClick }: WizardStepsProps) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = step.id <= currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-300",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30",
                    !isCompleted && !isCurrent && "bg-background border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-sm font-semibold transition-colors",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
