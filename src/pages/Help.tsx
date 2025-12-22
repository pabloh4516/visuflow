import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  FileText,
  Eye,
  Globe,
  BarChart3,
  Keyboard,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';

// Quick Start Steps
const quickStartSteps = [
  {
    step: 1,
    title: 'Crie sua primeira página',
    description: 'Configure uma landing page com popup em minutos',
    icon: FileText,
    link: '/app',
    linkText: 'Criar página',
  },
  {
    step: 2,
    title: 'Configure o cloaking',
    description: 'Proteja sua página contra bots e revisores',
    icon: Eye,
    link: '/cloaking/new',
    linkText: 'Configurar cloaking',
  },
  {
    step: 3,
    title: 'Adicione seu domínio',
    description: 'Use seu próprio domínio para suas páginas',
    icon: Globe,
    link: '/settings/domain',
    linkText: 'Configurar domínio',
  },
];

// Help Categories with Articles
const helpCategories = [
  {
    id: 'pages',
    title: 'Criando Páginas',
    icon: FileText,
    description: 'Aprenda a criar e personalizar landing pages',
    articles: [
      {
        id: 'create-page',
        title: 'Como criar uma landing page',
        content: `Para criar sua primeira landing page:

1. **Acesse a seção Páginas** clicando em "Páginas" no menu lateral
2. **Informe a URL de destino** - a página para onde os visitantes serão redirecionados
3. **Escolha o tipo de popup** - Modal, Sidebar ou Banner
4. **Selecione um template** - temos vários templates prontos para diferentes nichos
5. **Personalize as cores e textos** conforme sua necessidade
6. **Adicione pixels de rastreamento** se desejar (Facebook Pixel, Google Tag)
7. **Configure proteção anti-bot** opcionalmente
8. **Salve e copie o código** gerado

Sua página estará pronta para uso!`,
        tags: ['landing page', 'criar', 'nova página'],
      },
      {
        id: 'popup-types',
        title: 'Tipos de popups disponíveis',
        content: `O VisuFlow oferece 3 tipos de popup:

**Modal**
- Aparece no centro da tela
- Ideal para ofertas importantes
- Captura toda a atenção do usuário

**Sidebar**
- Desliza pela lateral da tela
- Menos intrusivo que o modal
- Bom para mensagens secundárias

**Banner**
- Aparece no topo ou rodapé
- Minimalista e discreto
- Ideal para avisos ou promoções simples

Cada tipo pode ser customizado em cores, textos e comportamento.`,
        tags: ['popup', 'modal', 'sidebar', 'banner'],
      },
      {
        id: 'customize-styles',
        title: 'Personalizando cores e estilos',
        content: `Na etapa de estilização você pode:

- **Cor de fundo do popup** - escolha qualquer cor ou use transparente
- **Cor do texto** - garanta contraste adequado com o fundo
- **Cor dos botões** - use cores que chamem atenção
- **Cor do overlay** - o fundo escurecido atrás do popup
- **Opacidade do overlay** - de 0% (transparente) a 100% (opaco)
- **Arredondamento das bordas** - de quadrado a muito arredondado

Dica: Use cores que combinem com sua marca e garantam boa legibilidade.`,
        tags: ['personalizar', 'cores', 'estilos', 'design'],
      },
      {
        id: 'tracking-pixels',
        title: 'Adicionando pixels de rastreamento',
        content: `Você pode adicionar pixels para rastrear conversões:

**Facebook Pixel**
1. Acesse seu Gerenciador de Eventos do Facebook
2. Copie o ID do seu Pixel (número de 15-16 dígitos)
3. Cole no campo "Facebook Pixel ID"

**Google Tag Manager**
1. Acesse sua conta do GTM
2. Copie seu ID (formato GTM-XXXXXX)
3. Cole no campo "Google Tag ID"

Os pixels serão disparados automaticamente quando o popup for exibido e quando o usuário clicar no botão.`,
        tags: ['pixel', 'facebook', 'google', 'rastreamento', 'tracking'],
      },
      {
        id: 'bot-protection',
        title: 'Proteção anti-bot nas páginas',
        content: `A proteção anti-bot detecta acessos automatizados usando várias técnicas:

**Detecções disponíveis:**
- WebDriver - detecta navegadores automatizados (Selenium, Puppeteer)
- Canvas fingerprint - identifica renderização inconsistente
- WebGL fingerprint - analisa características da GPU
- Timing analysis - mede tempos de resposta suspeitos
- Headless browser - detecta navegadores sem interface

**Quando ativar:**
Recomendamos ativar se você está rodando tráfego pago ou quer proteger suas páginas de scraping.

**Importante:** Esta proteção é diferente do Cloaking. Ela apenas detecta bots, enquanto o Cloaking também redireciona.`,
        tags: ['bot', 'proteção', 'segurança', 'anti-bot'],
      },
    ],
  },
  {
    id: 'cloaking',
    title: 'Cloaking',
    icon: Eye,
    description: 'Entenda como proteger suas páginas de revisores',
    articles: [
      {
        id: 'what-is-cloaking',
        title: 'O que é cloaking e como funciona',
        content: `Cloaking é uma técnica que mostra conteúdos diferentes para diferentes visitantes:

**Como funciona:**
1. Um visitante acessa sua URL
2. O sistema analisa se é um bot ou humano
3. Bots veem uma "página segura" (fake page)
4. Humanos são redirecionados para sua página real

**Por que usar:**
- Proteger páginas de ofertas contra revisão
- Evitar que concorrentes copiem suas páginas
- Manter compliance com redes de anúncios

**Detecções utilizadas:**
- User-agent de crawlers conhecidos
- IPs de data centers (AWS, Google, etc)
- Padrões de acesso suspeitos
- Fingerprinting de navegador`,
        tags: ['cloaking', 'o que é', 'como funciona'],
      },
      {
        id: 'create-cloaking',
        title: 'Criando uma configuração de cloaking',
        content: `Para criar uma configuração de cloaking:

1. **Acesse Cloaking** no menu lateral
2. **Clique em "Novo Cloaking"**
3. **Dê um nome** para identificar (ex: "Oferta Black Friday")
4. **Configure a URL de destino** - onde humanos serão redirecionados
5. **Escolha a ação para bots:**
   - Mostrar página fake (recomendado)
   - Redirecionar para outra URL
6. **Selecione um template** de fake page ou crie uma personalizada
7. **Salve** e obtenha sua URL única

Use essa URL nos seus anúncios ao invés da URL original.`,
        tags: ['criar', 'configurar', 'novo cloaking'],
      },
      {
        id: 'fake-page',
        title: 'Página real vs fake page',
        content: `**Página Real:**
A página que seus clientes/visitantes legítimos vão ver. Pode ser sua oferta, landing page ou qualquer conteúdo.

**Fake Page:**
A página "segura" que bots e revisores vão ver. Deve ser:
- Conteúdo neutro e permitido
- Relacionado ao tema do anúncio
- Sem ofertas agressivas

**Templates disponíveis:**
1. Blog de notícias
2. Artigo de saúde genérico
3. Página de receitas
4. Conteúdo educacional
5. Página institucional

Você também pode criar seu próprio HTML personalizado.`,
        tags: ['fake page', 'página segura', 'template'],
      },
      {
        id: 'cloaking-reports',
        title: 'Entendendo os relatórios de cloaking',
        content: `Os relatórios mostram estatísticas detalhadas:

**Métricas principais:**
- Total de visitas
- Humanos (redirecionados)
- Bots (bloqueados/mostrada fake page)
- Taxa de humanos vs bots

**Gráficos disponíveis:**
- Timeline de detecções
- Distribuição por tipo de bot
- Funil de conversão
- Tráfego por device

**Detalhes das detecções:**
- IP e user-agent
- Motivo da detecção
- Horário exato
- Ação tomada

Use esses dados para otimizar suas campanhas e identificar padrões.`,
        tags: ['relatório', 'métricas', 'estatísticas'],
      },
      {
        id: 'bot-types',
        title: 'Tipos de bots detectados',
        content: `O sistema detecta diversos tipos de bots:

**Crawlers de buscadores:**
- Googlebot
- Bingbot
- Yandex
- Baidu

**Bots de redes sociais:**
- Facebook External Hit
- Twitter Bot
- LinkedIn Bot

**Ferramentas de análise:**
- Ahrefs
- SEMrush
- Moz

**Bots maliciosos:**
- Scrapers
- Spam bots
- Vulnerability scanners

**Data centers:**
IPs de AWS, Google Cloud, Azure, DigitalOcean são automaticamente detectados.`,
        tags: ['bots', 'tipos', 'crawlers'],
      },
    ],
  },
  {
    id: 'domain',
    title: 'Domínio Personalizado',
    icon: Globe,
    description: 'Configure seu próprio domínio',
    articles: [
      {
        id: 'why-custom-domain',
        title: 'Por que usar um domínio próprio',
        content: `Vantagens de usar seu próprio domínio:

**Profissionalismo:**
- URL com sua marca (seudominio.com ao invés de visuflow.app/xyz)
- Mais confiança do visitante
- Melhor percepção da marca

**Performance:**
- URLs mais curtas
- Melhor CTR nos anúncios
- Menor chance de ser bloqueado

**Flexibilidade:**
- Controle total sobre DNS
- Pode usar subdomínios (lp.seudominio.com)
- Migração facilitada

**Requisitos:**
- Domínio registrado em seu nome
- Acesso ao painel DNS
- Certificado SSL (configuramos automaticamente)`,
        tags: ['domínio', 'por que', 'vantagens'],
      },
      {
        id: 'cloudflare-setup',
        title: 'Configuração via Cloudflare',
        content: `Para configurar usando Cloudflare Workers:

1. **Acesse seu painel Cloudflare**
2. **Vá em Workers & Pages > Overview**
3. **Clique em "Create Application"**
4. **Selecione "Create Worker"**
5. **Cole o código** fornecido pelo VisuFlow
6. **Salve e publique**
7. **Configure a rota** para seu domínio
8. **Volte ao VisuFlow** e clique em "Verificar"

O Cloudflare é gratuito e oferece CDN global, HTTPS automático e alta disponibilidade.`,
        tags: ['cloudflare', 'worker', 'configurar'],
      },
      {
        id: 'vercel-setup',
        title: 'Configuração via Vercel',
        content: `Para configurar usando Vercel Edge Functions:

1. **Crie uma conta na Vercel** (se não tiver)
2. **Crie um novo projeto**
3. **Adicione o arquivo** de configuração fornecido
4. **Configure as environment variables**
5. **Faça deploy**
6. **Adicione seu domínio** nas configurações do projeto
7. **Configure o DNS** apontando para Vercel
8. **Volte ao VisuFlow** e clique em "Verificar"

A Vercel oferece ótima performance e deploy automático via Git.`,
        tags: ['vercel', 'edge function', 'configurar'],
      },
      {
        id: 'manual-setup',
        title: 'Configuração manual (Nginx/Apache)',
        content: `Se você tem seu próprio servidor:

**Nginx:**
\`\`\`
location / {
    proxy_pass https://api.visuflow.com/serve;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
\`\`\`

**Apache:**
\`\`\`
ProxyPass / https://api.visuflow.com/serve
ProxyPassReverse / https://api.visuflow.com/serve
\`\`\`

**Requisitos:**
- Servidor com acesso root
- mod_proxy (Apache) ou proxy_pass (Nginx)
- Certificado SSL configurado

Após configurar, teste acessando seu domínio e verifique no VisuFlow.`,
        tags: ['nginx', 'apache', 'manual', 'servidor'],
      },
      {
        id: 'dns-verification',
        title: 'Verificação de DNS',
        content: `Para verificar se o DNS está correto:

**Verifique a propagação:**
1. Acesse whatsmydns.net
2. Digite seu domínio
3. Confirme que todos os servidores mostram o IP correto

**Tempo de propagação:**
- Normalmente: 5-30 minutos
- Máximo: até 48 horas

**Problemas comuns:**
- Cache do navegador (limpe ou use aba anônima)
- TTL alto no DNS anterior
- CNAME ao invés de A record

**Testando:**
Acesse seu domínio em uma aba anônima. Se redirecionar corretamente, está funcionando!`,
        tags: ['dns', 'verificar', 'propagação'],
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard e Métricas',
    icon: BarChart3,
    description: 'Entenda seus dados e relatórios',
    articles: [
      {
        id: 'overview-cards',
        title: 'Cards de métricas',
        content: `O dashboard mostra cards com métricas importantes:

**Visitas Totais:**
Número total de acessos às suas páginas.

**Humanos:**
Visitantes identificados como usuários reais.

**Bots Bloqueados:**
Acessos de bots que foram detectados e tratados.

**Taxa de Conversão:**
Percentual de visitantes que clicaram no CTA.

**Tendências:**
Cada card mostra a variação comparada ao período anterior (↑ aumento, ↓ queda).

Clique em qualquer card para ver detalhes expandidos.`,
        tags: ['dashboard', 'cards', 'métricas', 'visitas'],
      },
      {
        id: 'charts',
        title: 'Interpretando gráficos',
        content: `**Gráfico de Timeline:**
Mostra o volume de tráfego ao longo do tempo. Use para identificar picos e padrões.

**Funil de Conversão:**
Visualize as etapas: Visitas → Popup visto → Clique no CTA → Redirecionamento.

**Distribuição por Device:**
Porcentagem de acessos mobile vs desktop.

**Origem do Tráfego:**
De onde vem seu tráfego (direct, social, ads, organic).

**Dicas:**
- Compare períodos para identificar tendências
- Use os filtros para segmentar dados
- Exporte para análise mais profunda`,
        tags: ['gráficos', 'charts', 'análise'],
      },
      {
        id: 'export-data',
        title: 'Exportando dados',
        content: `Você pode exportar seus dados para análise externa:

**Formatos disponíveis:**
- CSV (Excel, Google Sheets)
- JSON (ferramentas de BI)

**O que é exportado:**
- Todas as visitas com timestamps
- Detecções de bots
- Eventos de conversão
- UTM parameters

**Como exportar:**
1. Vá ao Dashboard
2. Selecione o período desejado
3. Clique no botão de exportar
4. Escolha o formato

Os dados são baixados imediatamente para seu dispositivo.`,
        tags: ['exportar', 'csv', 'dados', 'download'],
      },
    ],
  },
  {
    id: 'shortcuts',
    title: 'Atalhos de Teclado',
    icon: Keyboard,
    description: 'Navegue mais rápido com atalhos',
    articles: [
      {
        id: 'all-shortcuts',
        title: 'Lista completa de atalhos',
        content: `**Busca e Navegação:**
- \`⌘ + K\` ou \`Ctrl + K\` - Abrir busca global
- \`G\` então \`D\` - Ir para Dashboard
- \`G\` então \`P\` - Ir para Páginas
- \`G\` então \`C\` - Ir para Cloaking
- \`G\` então \`S\` - Ir para Settings

**Ações Rápidas:**
- \`N\` - Nova página
- \`C\` - Novo cloaking
- \`?\` - Mostrar ajuda de atalhos

**Dicas:**
- Os atalhos funcionam em qualquer lugar da aplicação
- Atalhos sequenciais (G + D) precisam ser pressionados rapidamente
- Não funcionam quando o foco está em campos de texto`,
        tags: ['atalhos', 'keyboard', 'shortcuts'],
      },
    ],
  },
];

// FAQ Items
const faqItems = [
  {
    question: 'Como funciona a proteção anti-bot?',
    answer: 'A proteção usa várias técnicas de fingerprinting e detecção comportamental para identificar acessos automatizados. Quando um bot é detectado, ele pode ver uma página fake ou ser redirecionado, dependendo da sua configuração.',
  },
  {
    question: 'Meus visitantes reais serão bloqueados?',
    answer: 'Não. O sistema é calibrado para ter alta precisão na detecção de bots enquanto permite 100% do tráfego humano. Técnicas como fingerprinting de canvas e WebGL são usadas para distinguir humanos de bots de forma precisa.',
  },
  {
    question: 'Como verificar se meu domínio está funcionando?',
    answer: 'Acesse seu domínio em uma aba anônima do navegador. Se você for redirecionado corretamente para sua página de destino, está funcionando. Você também pode verificar no painel de Settings > Domínio.',
  },
  {
    question: 'Posso usar o VisuFlow com qualquer plataforma de anúncios?',
    answer: 'Sim! O VisuFlow funciona com Facebook Ads, Google Ads, TikTok Ads, native ads e qualquer outra plataforma. Basta usar a URL gerada como destino dos seus anúncios.',
  },
  {
    question: 'Os pixels do Facebook funcionam com cloaking?',
    answer: 'Sim. Os pixels são disparados normalmente para visitantes humanos. Bots não disparam pixels, o que ajuda a manter seus dados de conversão limpos.',
  },
  {
    question: 'Quantas páginas/configs de cloaking posso criar?',
    answer: 'O limite depende do seu plano. No plano gratuito você pode criar até 3 páginas e 2 configs de cloaking. Planos pagos têm limites maiores ou ilimitados.',
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['pages']);

  // Filter articles based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return helpCategories;

    const query = searchQuery.toLowerCase();
    return helpCategories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (article) =>
            article.title.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query) ||
            article.tags.some((tag) => tag.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.articles.length > 0);
  }, [searchQuery]);

  // Filter FAQ based on search
  const filteredFaq = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;

    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.articles.length, 0) + filteredFaq.length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Central de Ajuda
          </div>
          <h1 className="text-3xl font-bold">Como podemos ajudar?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre guias, tutoriais e respostas para suas dúvidas sobre o VisuFlow
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar ajuda..."
            className="pl-12 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Quick Start (only show when not searching) */}
        {!searchQuery && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Início Rápido</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {quickStartSteps.map((item) => (
                <Card key={item.step} className="group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {item.step}
                      </div>
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" size="sm" className="group-hover:text-primary -ml-3" asChild>
                      <Link to={item.link}>
                        {item.linkText}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* Help Categories */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Guias Detalhados</h2>
          </div>

          {filteredCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum artigo encontrado para "{searchQuery}"
              </p>
            </Card>
          ) : (
            <Accordion
              type="multiple"
              value={expandedCategories}
              onValueChange={setExpandedCategories}
              className="space-y-4"
            >
              {filteredCategories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{category.title}</p>
                        <p className="text-sm text-muted-foreground font-normal">
                          {category.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto mr-4">
                        {category.articles.length} artigo{category.articles.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 pt-2">
                      {category.articles.map((article) => (
                        <Card key={article.id} className="p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {article.title}
                          </h4>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {article.content}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>

        <Separator />

        {/* FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Perguntas Frequentes</h2>
          </div>

          {filteredFaq.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma pergunta encontrada para "{searchQuery}"
              </p>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaq.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>

        <Separator />

        {/* Contact Support */}
        <section>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-full bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-1">Ainda precisa de ajuda?</h3>
                  <p className="text-muted-foreground">
                    Nossa equipe de suporte está disponível para ajudar você
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" asChild>
                    <a href="mailto:suporte@visuflow.com">
                      Enviar Email
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button asChild>
                    <a href="https://discord.gg/visuflow" target="_blank" rel="noopener noreferrer">
                      Comunidade Discord
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
