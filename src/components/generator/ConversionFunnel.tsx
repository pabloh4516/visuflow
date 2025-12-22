import { Card } from '@/components/ui/card';
import { Eye, MousePointer, ArrowRight, TrendingDown } from 'lucide-react';

interface PageEvent {
  id: string;
  event_type: string;
  created_at: string;
}

interface ConversionFunnelProps {
  events: PageEvent[];
}

export function ConversionFunnel({ events }: ConversionFunnelProps) {
  const views = events.filter(e => e.event_type === 'view').length;
  const interactions = events.filter(e => e.event_type === 'popup_interaction').length;
  const redirects = events.filter(e => e.event_type === 'redirect').length;

  const interactionRate = views > 0 ? Math.round((interactions / views) * 100) : 0;
  const conversionRate = views > 0 ? Math.round((redirects / views) * 100) : 0;
  const finalConversion = interactions > 0 ? Math.round((redirects / interactions) * 100) : 0;

  const steps = [
    { 
      label: 'Visualizações', 
      value: views, 
      icon: Eye, 
      color: 'bg-blue-500',
      dropoff: null 
    },
    { 
      label: 'Interações', 
      value: interactions, 
      icon: MousePointer, 
      color: 'bg-purple-500',
      dropoff: views > 0 ? Math.round(((views - interactions) / views) * 100) : 0
    },
    { 
      label: 'Redirects', 
      value: redirects, 
      icon: ArrowRight, 
      color: 'bg-green-500',
      dropoff: interactions > 0 ? Math.round(((interactions - redirects) / interactions) * 100) : 0
    },
  ];

  const maxValue = Math.max(views, 1);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Funil de Conversão</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const widthPercent = (step.value / maxValue) * 100;
          
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${step.color}/10 flex items-center justify-center`}>
                    <step.icon className={`w-4 h-4 ${step.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium text-sm">{step.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{step.value}</span>
                  {step.dropoff !== null && step.dropoff > 0 && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -{step.dropoff}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${step.color} transition-all duration-500 rounded-lg flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(widthPercent, 5)}%` }}
                >
                  {widthPercent > 20 && (
                    <span className="text-xs font-medium text-white">
                      {Math.round(widthPercent)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{interactionRate}%</p>
          <p className="text-xs text-muted-foreground">Taxa de Interação</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground">Conversão Geral</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-500">{finalConversion}%</p>
          <p className="text-xs text-muted-foreground">Interação → Redirect</p>
        </div>
      </div>
    </Card>
  );
}
