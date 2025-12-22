import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface ActionBreakdownChartProps {
  fakePageViews: number;
  safeRedirects: number;
  botRedirects: number;
  botBlocked: number;
  realRedirects: number;
}

export function ActionBreakdownChart({
  fakePageViews,
  safeRedirects,
  botRedirects,
  botBlocked,
  realRedirects,
}: ActionBreakdownChartProps) {
  const data = [
    { name: 'Destino Real', value: realRedirects, color: '#22c55e' },
    { name: 'Fake Page', value: fakePageViews, color: '#f97316' },
    { name: 'Safe Redirect', value: safeRedirects, color: '#06b6d4' },
    { name: 'Bot Redirect', value: botRedirects, color: '#a855f7' },
    { name: 'Bloqueado', value: botBlocked, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieIcon className="h-5 w-5" />
            Breakdown por Ação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieIcon className="h-5 w-5" />
          Breakdown por Ação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with values */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className="text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
