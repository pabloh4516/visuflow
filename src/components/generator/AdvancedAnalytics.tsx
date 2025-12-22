import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Bot, MousePointer, Eye, ArrowRight } from 'lucide-react';

interface PageEvent {
  id: string;
  page_id: string | null;
  event_type: string;
  is_human: boolean;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  created_at: string;
}

interface BotDetection {
  id: string;
  detected_at: string;
  detection_reason: string;
}

interface AdvancedAnalyticsProps {
  events: PageEvent[];
  botDetections: BotDetection[];
  period: '7d' | '30d' | '90d';
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AdvancedAnalytics({ events, botDetections, period }: AdvancedAnalyticsProps) {
  // Calculate time series data
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: { date: string; views: number; bots: number; redirects: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => e.created_at.startsWith(dateStr));
      const dayBots = botDetections.filter(b => b.detected_at.startsWith(dateStr));
      
      data.push({
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date),
        views: dayEvents.filter(e => e.event_type === 'view').length,
        bots: dayBots.length,
        redirects: dayEvents.filter(e => e.event_type === 'redirect').length,
      });
    }
    
    return data;
  }, [events, botDetections, period]);

  // Bot breakdown by platform
  const botBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    botDetections.forEach(bot => {
      const reasons = bot.detection_reason.split(',');
      reasons.forEach(reason => {
        const platform = reason.includes('ad_platform_') 
          ? reason.replace('ad_platform_', '').trim()
          : reason.includes('webdriver') || reason.includes('headless') || reason.includes('selenium')
            ? 'Automation'
            : reason.includes('canvas') || reason.includes('webgl')
              ? 'Fingerprint'
              : 'Outros';
        
        breakdown[platform] = (breakdown[platform] || 0) + 1;
      });
    });

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [botDetections]);

  // Device breakdown - apenas views para consistência com total de visualizações
  const deviceBreakdown = useMemo(() => {
    const breakdown = { desktop: 0, mobile: 0, tablet: 0 };
    
    // Filtrar apenas eventos de view
    const viewEvents = events.filter(e => e.event_type === 'view');
    
    viewEvents.forEach(event => {
      if (event.device_type && event.device_type in breakdown) {
        breakdown[event.device_type as keyof typeof breakdown]++;
      }
    });

    return [
      { name: 'Desktop', value: breakdown.desktop },
      { name: 'Mobile', value: breakdown.mobile },
      { name: 'Tablet', value: breakdown.tablet },
    ].filter(d => d.value > 0);
  }, [events]);

  // UTM Source breakdown - apenas views para consistência com total de visualizações
  const utmBreakdown = useMemo(() => {
    const sources: Record<string, number> = {};
    
    // Filtrar apenas eventos de view
    const viewEvents = events.filter(e => e.event_type === 'view');
    
    viewEvents.forEach(event => {
      const source = event.utm_source || 'Direto';
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [events]);

  // Calculate stats
  const stats = useMemo(() => {
    const views = events.filter(e => e.event_type === 'view').length;
    const redirects = events.filter(e => e.event_type === 'redirect').length;
    const interactions = events.filter(e => e.event_type === 'popup_interaction').length;
    const conversionRate = views > 0 ? Math.round((redirects / views) * 100) : 0;

    return { views, redirects, interactions, conversionRate };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.views}</p>
              <p className="text-xs text-muted-foreground">Visualizações</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.redirects}</p>
              <p className="text-xs text-muted-foreground">Redirects</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.interactions}</p>
              <p className="text-xs text-muted-foreground">Interações</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversão</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tráfego ao Longo do Tempo</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="views" 
                name="Visualizações"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="bots" 
                name="Bots"
                stroke="hsl(var(--destructive))" 
                fillOpacity={1} 
                fill="url(#colorBots)" 
              />
              <Line 
                type="monotone" 
                dataKey="redirects" 
                name="Redirects"
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Breakdowns Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bot Breakdown */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Bots por Tipo</h3>
          {botBreakdown.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={botBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {botBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Nenhum bot detectado
            </div>
          )}
          <div className="mt-2 space-y-1">
            {botBreakdown.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Por Dispositivo</h3>
          {deviceBreakdown.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {deviceBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Sem dados de dispositivo
            </div>
          )}
          <div className="mt-2 space-y-1">
            {deviceBreakdown.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* UTM Source Breakdown */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Origem do Tráfego</h3>
          {utmBreakdown.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utmBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {utmBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Sem dados de UTM
            </div>
          )}
          <div className="mt-2 space-y-1">
            {utmBreakdown.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
