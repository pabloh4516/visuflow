import { useState, useEffect, memo } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Globe, Bot, Shield, Clock, TrendingUp, TrendingDown, Minus,
  Eye, MousePointerClick, Percent, Smartphone, Monitor, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { RefreshButton } from '@/components/ui/refresh-button';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface MetricData {
  totalPages: number;
  totalBots: number;
  botsToday: number;
  protectionRate: number;
  totalViews: number;
  totalRedirects: number;
  totalInteractions: number;
  conversionRate: number;
  mobilePercent: number;
  desktopPercent: number;
}

type MetricKey = 
  | 'pages' 
  | 'bots' 
  | 'botsToday' 
  | 'protection' 
  | 'views' 
  | 'redirects' 
  | 'interactions' 
  | 'conversion' 
  | 'mobile' 
  | 'desktop';

interface MetricConfig {
  key: MetricKey;
  title: string;
  getValue: (data: MetricData) => string | number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  getTrend: (data: MetricData) => 'up' | 'down' | 'neutral' | null;
  getSubtitle: (data: MetricData) => string;
}

const STORAGE_KEY = 'visuflow-dashboard-metrics';
const DEFAULT_METRICS: MetricKey[] = ['pages', 'bots', 'botsToday', 'protection'];
const MAX_VISIBLE_CARDS = 6;

const allMetrics: MetricConfig[] = [
  {
    key: 'pages',
    title: 'Páginas Ativas',
    getValue: (d) => d.totalPages,
    icon: Globe,
    color: 'primary',
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    getTrend: () => null,
    getSubtitle: (d) => d.totalPages === 1 ? '1 página criada' : `${d.totalPages} páginas criadas`,
  },
  {
    key: 'views',
    title: 'Visualizações',
    getValue: (d) => d.totalViews,
    icon: Eye,
    color: 'cyan',
    gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-500',
    getTrend: (d) => d.totalViews > 100 ? 'up' : d.totalViews > 0 ? 'neutral' : null,
    getSubtitle: (d) => d.totalViews > 0 ? 'Total no período' : 'Nenhuma ainda',
  },
  {
    key: 'redirects',
    title: 'Redirects',
    getValue: (d) => d.totalRedirects,
    icon: MousePointerClick,
    color: 'emerald',
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-500',
    getTrend: (d) => d.totalRedirects > 50 ? 'up' : d.totalRedirects > 0 ? 'neutral' : null,
    getSubtitle: (d) => d.totalRedirects > 0 ? 'Usuários redirecionados' : 'Nenhum ainda',
  },
  {
    key: 'interactions',
    title: 'Interações',
    getValue: (d) => d.totalInteractions,
    icon: MousePointerClick,
    color: 'violet',
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-500',
    getTrend: (d) => d.totalInteractions > 50 ? 'up' : d.totalInteractions > 0 ? 'neutral' : null,
    getSubtitle: (d) => d.totalInteractions > 0 ? 'Cliques no popup' : 'Nenhuma ainda',
  },
  {
    key: 'conversion',
    title: 'Taxa de Conversão',
    getValue: (d) => `${d.conversionRate}%`,
    icon: Percent,
    color: 'amber',
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-500',
    getTrend: (d) => d.conversionRate >= 50 ? 'up' : d.conversionRate >= 25 ? 'neutral' : 'down',
    getSubtitle: (d) => d.conversionRate >= 50 ? 'Excelente!' : d.conversionRate >= 25 ? 'Bom' : 'Pode melhorar',
  },
  {
    key: 'bots',
    title: 'Bots Bloqueados',
    getValue: (d) => d.totalBots,
    icon: Bot,
    color: 'red',
    gradient: 'from-red-500/20 via-red-500/10 to-transparent',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-500',
    getTrend: (d) => d.totalBots > 0 ? 'up' : null,
    getSubtitle: (d) => d.totalBots > 0 ? 'Total bloqueado' : 'Nenhum ainda',
  },
  {
    key: 'botsToday',
    title: 'Bots Hoje',
    getValue: (d) => d.botsToday,
    icon: Clock,
    color: 'orange',
    gradient: 'from-orange-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-500',
    getTrend: (d) => d.botsToday > 5 ? 'up' : d.botsToday > 0 ? 'neutral' : null,
    getSubtitle: (d) => d.botsToday > 0 ? 'Nas últimas 24h' : 'Tudo limpo!',
  },
  {
    key: 'protection',
    title: 'Taxa de Proteção',
    getValue: (d) => `${d.protectionRate}%`,
    icon: Shield,
    color: 'green',
    gradient: 'from-green-500/20 via-green-500/10 to-transparent',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-500',
    getTrend: (d) => d.protectionRate >= 80 ? 'up' : d.protectionRate >= 50 ? 'neutral' : 'down',
    getSubtitle: (d) => d.protectionRate >= 80 ? 'Excelente!' : d.protectionRate >= 50 ? 'Bom' : 'Ative mais proteções',
  },
  {
    key: 'mobile',
    title: 'Tráfego Mobile',
    getValue: (d) => `${d.mobilePercent}%`,
    icon: Smartphone,
    color: 'pink',
    gradient: 'from-pink-500/20 via-pink-500/10 to-transparent',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-500',
    getTrend: (d) => d.mobilePercent >= 60 ? 'up' : d.mobilePercent >= 30 ? 'neutral' : null,
    getSubtitle: (d) => d.mobilePercent > 0 ? 'Do total de views' : 'Sem dados',
  },
  {
    key: 'desktop',
    title: 'Tráfego Desktop',
    getValue: (d) => `${d.desktopPercent}%`,
    icon: Monitor,
    color: 'slate',
    gradient: 'from-slate-500/20 via-slate-500/10 to-transparent',
    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-400',
    getTrend: (d) => d.desktopPercent >= 60 ? 'up' : d.desktopPercent >= 30 ? 'neutral' : null,
    getSubtitle: (d) => d.desktopPercent > 0 ? 'Do total de views' : 'Sem dados',
  },
];

interface OverviewCardsProps extends MetricData {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export const OverviewCards = memo(function OverviewCards({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing,
  ...props
}: OverviewCardsProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(DEFAULT_METRICS);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedMetrics(parsed);
        }
      } catch {
        // Use default if parsing fails
      }
    }
  }, []);

  // Save to localStorage when selection changes
  const handleToggleMetric = (key: MetricKey) => {
    setSelectedMetrics(prev => {
      let newSelection: MetricKey[];
      
      if (prev.includes(key)) {
        // Don't allow less than 1 card
        if (prev.length <= 1) return prev;
        newSelection = prev.filter(k => k !== key);
      } else {
        // Don't allow more than MAX_VISIBLE_CARDS
        if (prev.length >= MAX_VISIBLE_CARDS) {
          // Remove first and add new one
          newSelection = [...prev.slice(1), key];
        } else {
          newSelection = [...prev, key];
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const visibleCards = allMetrics.filter(m => selectedMetrics.includes(m.key));

  // Dynamic grid based on number of cards
  const gridCols = visibleCards.length <= 4 
    ? 'grid-cols-2 lg:grid-cols-4' 
    : visibleCards.length === 5 
      ? 'grid-cols-2 lg:grid-cols-5'
      : 'grid-cols-2 lg:grid-cols-6';

  return (
    <TooltipProvider>
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Visão Geral</h3>
        <div className="flex items-center gap-2">
          {onDateRangeChange && (
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
            />
          )}
          {onRefresh && (
            <RefreshButton 
              onRefresh={onRefresh} 
              isLoading={isRefreshing}
              tooltip="Atualizar métricas"
            />
          )}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Personalizar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-3 bg-card border-border z-50" 
              align="end"
              sideOffset={8}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Métricas visíveis</p>
                  <span className="text-xs text-muted-foreground">{selectedMetrics.length}/{MAX_VISIBLE_CARDS}</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allMetrics.map((metric) => (
                    <label 
                      key={metric.key}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedMetrics.includes(metric.key)}
                        onCheckedChange={() => handleToggleMetric(metric.key)}
                        className="border-border"
                      />
                      <metric.icon className={cn("h-4 w-4", metric.iconColor)} />
                      <span className="text-sm">{metric.title}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Selecione até {MAX_VISIBLE_CARDS} métricas para exibir
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className={cn("grid gap-4", gridCols)}>
        {visibleCards.map((card, index) => {
          const value = card.getValue(props);
          const trend = card.getTrend(props);
          const subtitle = card.getSubtitle(props);

          return (
            <Card 
              key={card.key}
              className={cn(
                "relative overflow-hidden border-border/50 cursor-default",
                "hover-lift hover-glow",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-70",
                card.gradient
              )} />
              
              {/* Glow Effect */}
              <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all duration-500",
                card.color === 'primary' && "bg-primary",
                card.color === 'red' && "bg-red-500",
                card.color === 'orange' && "bg-orange-500",
                card.color === 'green' && "bg-green-500",
                card.color === 'cyan' && "bg-cyan-500",
                card.color === 'emerald' && "bg-emerald-500",
                card.color === 'violet' && "bg-violet-500",
                card.color === 'amber' && "bg-amber-500",
                card.color === 'pink' && "bg-pink-500",
                card.color === 'slate' && "bg-slate-500",
                card.color === 'yellow' && "bg-yellow-500"
              )} />
              
              <div className="relative p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    card.iconBg
                  )}>
                    <card.icon className={cn("w-6 h-6 transition-transform duration-300", card.iconColor)} />
                  </div>
                  
                  {trend && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-transform duration-300 group-hover:scale-105",
                      trend === 'up' && card.color === 'green' && "bg-green-500/20 text-green-400",
                      trend === 'up' && card.color === 'emerald' && "bg-emerald-500/20 text-emerald-400",
                      trend === 'up' && card.color === 'cyan' && "bg-cyan-500/20 text-cyan-400",
                      trend === 'up' && card.color === 'amber' && "bg-amber-500/20 text-amber-400",
                      trend === 'up' && card.color === 'pink' && "bg-pink-500/20 text-pink-400",
                      trend === 'up' && card.color === 'violet' && "bg-violet-500/20 text-violet-400",
                      trend === 'up' && card.color === 'slate' && "bg-slate-500/20 text-slate-400",
                      trend === 'up' && !['green', 'emerald', 'cyan', 'amber', 'pink', 'violet', 'slate'].includes(card.color) && "bg-red-500/20 text-red-400",
                      trend === 'down' && "bg-yellow-500/20 text-yellow-400",
                      trend === 'neutral' && "bg-muted text-muted-foreground"
                    )}>
                      {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                      {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      {trend === 'neutral' && <Minus className="w-3 h-3" />}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-3xl font-bold text-foreground tracking-tight transition-transform duration-300 group-hover:scale-[1.02]">
                    {value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {card.title}
                  </p>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </TooltipProvider>
  );
});