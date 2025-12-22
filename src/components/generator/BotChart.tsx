import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface BotDetection {
  id: string;
  detected_at: string;
  detection_type: string;
  detection_reason: string;
}

interface BotChartProps {
  detections: BotDetection[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(220, 70%, 50%)', 'hsl(45, 93%, 47%)', 'hsl(280, 65%, 60%)'];

export function BotChart({ detections }: BotChartProps) {
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = 0;
    }
    
    // Count detections
    detections.forEach(d => {
      const key = new Date(d.detected_at).toISOString().split('T')[0];
      if (days[key] !== undefined) {
        days[key]++;
      }
    });
    
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      count,
    }));
  }, [detections]);

  const reasonData = useMemo(() => {
    const reasons: Record<string, number> = {};
    detections.forEach(d => {
      const reason = d.detection_reason.split(':')[0].trim();
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    
    return Object.entries(reasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [detections]);

  const typeData = useMemo(() => {
    const cloaking = detections.filter(d => d.detection_type === 'cloaking').length;
    const frontend = detections.filter(d => d.detection_type === 'frontend').length;
    const devtools = detections.filter(d => d.detection_type === 'devtools').length;
    return [
      { name: 'Cloaking', value: cloaking },
      { name: 'Frontend', value: frontend },
      { name: 'DevTools', value: devtools },
    ].filter(d => d.value > 0);
  }, [detections]);

  if (detections.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Detecções (Últimos 7 dias)</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Tipo de Detecção</h4>
        <div className="h-[200px] flex items-center">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center w-full">Sem dados</p>
          )}
          <div className="space-y-2">
            {typeData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
                <span className="text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {reasonData.length > 0 && (
        <Card className="p-4 md:col-span-2">
          <h4 className="text-sm font-medium mb-4">Top Motivos de Detecção</h4>
          <div className="flex flex-wrap gap-3">
            {reasonData.map((item, index) => (
              <div 
                key={item.name}
                className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
