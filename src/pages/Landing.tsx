import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Camera, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  Check,
  Bot,
  Globe,
  Code2,
  MousePointer,
  Menu,
  X,
  Eye,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LandingStats from '@/components/landing/LandingStats';
import LandingDemo from '@/components/landing/LandingDemo';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingUseCases from '@/components/landing/LandingUseCases';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Recursos', href: '#features' },
    { label: 'Como Funciona', href: '#how-it-works' },
    { label: 'Casos de Uso', href: '#use-cases' },
    { label: 'FAQ', href: '#faq' },
  ];

  const features = [
    {
      icon: Camera,
      title: "Screenshots Automáticos",
      description: "Capture automaticamente sua landing page em desktop e mobile para usar como background visual.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Proteção Anti-Bot",
      description: "Detecta e bloqueia bots, webdrivers, headless browsers e ferramentas de automação.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: BarChart3,
      title: "Analytics de Bots",
      description: "Dashboard completo mostrando todas as tentativas de acesso de bots às suas páginas.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Zap,
      title: "HTML Pronto",
      description: "Gere um arquivo HTML independente pronto para hospedar em qualquer lugar.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Eye,
      title: "Cloaking Avançado",
      description: "Mostre páginas diferentes para bots e usuários reais. Proteja suas ofertas.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: Lock,
      title: "IP & User-Agent",
      description: "Bloqueio inteligente por IP de data centers e análise de User-Agent.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    }
  ];

  const protections = [
    { icon: Bot, text: "Detecção de WebDriver" },
    { icon: MousePointer, text: "Verificação Humana" },
    { icon: Code2, text: "Bloqueio DevTools" },
    { icon: Globe, text: "Cloaking por IP" },
  ];

  const steps = [
    {
      number: "01",
      title: "Configure",
      description: "Adicione suas URLs, escolha o popup e personalize o estilo da sua página",
      icon: RefreshCw
    },
    {
      number: "02",
      title: "Gere",
      description: "O sistema captura screenshots automaticamente e gera o HTML otimizado",
      icon: Zap
    },
    {
      number: "03",
      title: "Publique",
      description: "Baixe e hospede em qualquer servidor — Cloudflare, Vercel, ou seu próprio",
      icon: Globe
    }
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">VisuFlow</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button asChild>
                  <Link to="/app">
                    Acessar Painel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">
                      Começar Grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-border/50 mt-4 animate-fade-in">
              <nav className="flex flex-col gap-2 mb-4">
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="px-3 py-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                {user ? (
                  <Button asChild className="w-full">
                    <Link to="/app">Acessar Painel</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/auth">Entrar</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/auth">Começar Grátis</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Shield className="h-4 w-4" />
              Proteção Anti-Bot Avançada
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
              Crie Páginas Presell
              <span className="text-primary block">Protegidas de Bots</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Gere páginas de pré-venda com screenshots automáticos, popups inteligentes 
              e proteção anti-bot de última geração. Tudo em HTML puro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/auth">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <a href="#demo" onClick={(e) => handleAnchorClick(e, '#demo')}>Ver Demo</a>
              </Button>
            </div>

            {/* Protection badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {protections.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <LandingStats />

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              Recursos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recursos poderosos para criar páginas presell profissionais e protegidas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <div id="demo" className="scroll-mt-20">
        <LandingDemo />
      </div>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-transparent via-muted/20 to-transparent scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              Simples & Rápido
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Três passos simples para criar sua página protegida
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-card/50 border border-border/50 rounded-2xl p-8 text-center hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-5xl font-bold text-primary/20 mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-5 h-6 w-6 text-primary/30 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <div id="use-cases" className="scroll-mt-20">
        <LandingUseCases />
      </div>

      {/* FAQ Section */}
      <div id="faq" className="scroll-mt-20">
        <LandingFAQ />
      </div>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Comece em menos de 2 minutos
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Pronto para proteger suas páginas?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Junte-se a centenas de profissionais que já protegem suas campanhas com o VisuFlow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-10 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/auth">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                Setup em minutos
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                Suporte incluso
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
