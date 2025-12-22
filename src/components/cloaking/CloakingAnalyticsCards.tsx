import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Users, 
  ArrowRight, 
  Bot, 
  FileText, 
  Shield, 
  ShieldAlert,
  TrendingUp 
} from 'lucide-react';

interface CloakingAnalyticsCardsProps {
  totalViews: number;
  realUsers: number;
  redirects: number;
  botsDetected: number;
  fakePageViews: number;
  safeRedirects: number;
  botRedirects: number;
  botBlocked: number;
}

export function CloakingAnalyticsCards({
  totalViews,
  realUsers,
  redirects,
  botsDetected,
  fakePageViews,
  safeRedirects,
  botRedirects,
  botBlocked,
}: CloakingAnalyticsCardsProps) {
  const protectionRate = totalViews > 0 
    ? Math.round((botsDetected / totalViews) * 100) 
    : 0;

  const conversionRate = realUsers > 0 
    ? Math.round((redirects / realUsers) * 100) 
    : 0;

  const cards = [
    {
      title: 'Total de Acessos',
      value: totalViews,
      icon: Eye,
      description: 'Bots + Usuários Reais',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Usuários Reais',
      value: realUsers,
      icon: Users,
      description: 'Visitantes legítimos',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Redirecionados',
      value: redirects,
      icon: ArrowRight,
      description: 'Chegaram ao destino',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Bots Detectados',
      value: botsDetected,
      icon: Bot,
      description: 'Bloqueados pela proteção',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Fake Page Views',
      value: fakePageViews,
      icon: FileText,
      description: 'Bots viram página fake',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Safe Redirects',
      value: safeRedirects,
      icon: Shield,
      description: 'Platform verifiers',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Bot Redirects',
      value: botRedirects,
      icon: ShieldAlert,
      description: 'Bots redirecionados',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Taxa de Proteção',
      value: `${protectionRate}%`,
      icon: TrendingUp,
      description: `${conversionRate}% conversão`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm font-medium text-foreground">{card.title}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
