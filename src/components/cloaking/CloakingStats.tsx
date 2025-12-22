import { Card, CardContent } from '@/components/ui/card';
import { Eye, MousePointerClick, Bot, Shield } from 'lucide-react';

interface CloakingStatsProps {
  views: number;
  redirects: number;
  botDetections: number;
  blockedBots: number;
}

export function CloakingStats({ views, redirects, botDetections, blockedBots }: CloakingStatsProps) {
  const stats = [
    {
      label: 'Visualizações',
      value: views,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Redirecionamentos',
      value: redirects,
      icon: MousePointerClick,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Bots Detectados',
      value: botDetections,
      icon: Bot,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Bots Bloqueados',
      value: blockedBots,
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
