import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, Users, Bot, ArrowRight, FileText, Shield, ShieldOff, Ban } from 'lucide-react';

interface CloakingFunnelProps {
  totalViews: number;
  realUsers: number;
  redirects: number;
  botsDetected: number;
  fakePageViews: number;
  safeRedirects: number;
  botRedirects: number;
  botBlocked: number;
}

export function CloakingFunnel({
  totalViews,
  realUsers,
  redirects,
  botsDetected,
  fakePageViews,
  safeRedirects,
  botRedirects,
  botBlocked,
}: CloakingFunnelProps) {
  const botPercentage = totalViews > 0 ? Math.round((botsDetected / totalViews) * 100) : 0;
  const realPercentage = totalViews > 0 ? Math.round((realUsers / totalViews) * 100) : 0;
  const conversionRate = realUsers > 0 ? Math.round((redirects / realUsers) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowDown className="h-5 w-5" />
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total */}
          <div className="relative">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Total de Acessos</p>
                    <p className="text-sm text-muted-foreground">Todos os visitantes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-xs text-muted-foreground">100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Split */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bots */}
            <div className="space-y-3">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-500">Bots Detectados</p>
                    <p className="text-xs text-muted-foreground">{botPercentage}% do total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-500">{botsDetected}</p>
              </div>

              {/* Bot breakdown */}
              <div className="space-y-2 pl-4 border-l-2 border-red-500/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span>Fake Page</span>
                  </div>
                  <span className="font-medium">{fakePageViews}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-500" />
                    <span>Safe Redirect</span>
                  </div>
                  <span className="font-medium">{safeRedirects}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="h-4 w-4 text-purple-500" />
                    <span>Bot Redirect</span>
                  </div>
                  <span className="font-medium">{botRedirects}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-red-500" />
                    <span>Bloqueado (403)</span>
                  </div>
                  <span className="font-medium">{botBlocked}</span>
                </div>
              </div>
            </div>

            {/* Real Users */}
            <div className="space-y-3">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-500">Usuários Reais</p>
                    <p className="text-xs text-muted-foreground">{realPercentage}% do total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-500">{realUsers}</p>
              </div>

              {/* Real users breakdown */}
              <div className="pl-4 border-l-2 border-green-500/20">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Redirecionados</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-emerald-500">{redirects}</p>
                    <p className="text-xs text-muted-foreground">({conversionRate}% conversão)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
