import { Monitor, Smartphone, Shield, Check } from 'lucide-react';

export default function LandingDemo() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Veja o Resultado
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suas páginas ficam profissionais e protegidas em questão de segundos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Mockup */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                    suapagina.com/presell
                  </div>
                </div>
              </div>
              
              {/* Content preview */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-foreground/20 rounded" />
                    <div className="h-2 w-24 bg-muted-foreground/20 rounded mt-1.5" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                    <Monitor className="h-8 w-8 text-primary/50" />
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-accent/50" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-4/5" />
                  <div className="h-2 bg-muted rounded w-3/5" />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-primary rounded-lg" />
                  <div className="w-10 h-10 bg-secondary rounded-lg" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-success/90 text-success-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Protegido
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              Tudo Automatizado
            </h3>
            
            <div className="space-y-4">
              {[
                'Screenshots automáticos em desktop e mobile',
                'Popup inteligente com call-to-action',
                'Detecção de bots em tempo real',
                'Analytics detalhado de acessos',
                'HTML puro, hospede em qualquer lugar',
                'Funciona com Cloudflare, Vercel e mais',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
