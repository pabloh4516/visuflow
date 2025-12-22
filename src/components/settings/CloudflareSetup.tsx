import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CloudflareSetupProps {
  domain: string;
}

const SUPABASE_URL = 'https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/serve-page';

export function CloudflareSetup({ domain }: CloudflareSetupProps) {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  // Extract subdomain prefix from domain (e.g., "go" from "go.example.com")
  const domainParts = domain.split('.');
  const subdomainPrefix = domainParts.length > 2 ? domainParts[0] : 'go';
  const rootDomain = domainParts.length > 2 ? domainParts.slice(1).join('.') : domain;

  const workerCode = `// Cloudflare Worker para ${domain}
// Este código faz proxy das requisições para o VisuFlow

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Extrai o identificador do path /p/{identifier}
    // Aceita UUIDs, short_ids (8 chars) e slugs personalizados
    const match = path.match(/^\\/p\\/([a-zA-Z0-9-]+)$/);
    
    if (!match) {
      return new Response('Page not found', { status: 404 });
    }
    
    const identifier = match[1];
    
    // Detecta se é uma página gerada (type=page) ou cloaking config
    const isPageType = url.searchParams.get('type') === 'page';
    
    // Monta a URL correta baseado no tipo
    // - type=page: usa ?page= (páginas geradas)
    // - sem type: usa ?cloaking= (configurações de cloaking)
    // O backend resolve por slug, short_id ou UUID automaticamente
    const baseUrl = '${SUPABASE_URL}';
    const param = isPageType ? 'page' : 'cloaking';
    
    // Preserva UTMs e outros parâmetros (remove apenas 'type')
    const queryParams = new URLSearchParams(url.search);
    queryParams.delete('type');
    const extraParams = queryParams.toString();
    
    const targetUrl = baseUrl + '?' + param + '=' + identifier + (extraParams ? '&' + extraParams : '');
    
    // Cria headers preservando informações do visitante
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Forwarded-Proto', 'https');
    
    // Faz a requisição para o VisuFlow
    // IMPORTANTE: redirect: 'manual' para NÃO seguir redirects automaticamente
    // Isso permite que o 302 seja repassado para o navegador do usuário
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      redirect: 'manual',
    });
    
    // Copia os headers da resposta
    const responseHeaders = new Headers(response.headers);
    
    // Header de diagnóstico para confirmar que o Worker novo está ativo
    responseHeaders.set('X-Proxy-Version', 'cf-v4');
    
    // REMOVE headers CSP que podem bloquear estilos/scripts inline
    // Isso é necessário porque as páginas geradas usam CSS/JS inline
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('content-security-policy-report-only');
    responseHeaders.delete('x-content-security-policy');
    responseHeaders.delete('x-webkit-csp');
    
    // Para páginas (não verificação), força headers compatíveis
    if (response.status === 200 && !identifier.startsWith('verify-')) {
      // FORÇA Content-Type como text/html
      responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
      
      // Define CSP permissivo para inline styles/scripts
      responseHeaders.set('Content-Security-Policy', 
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval'; " +
        "style-src * 'unsafe-inline';"
      );
    }
    
    // Retorna a resposta (incluindo redirects 302)
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  }
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(workerCode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const steps = [
    {
      title: '0. Entendendo Subdomínios',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              O que é um subdomínio?
            </h4>
            <div className="space-y-2">
              <p>Um subdomínio é um "prefixo" adicionado antes do seu domínio principal:</p>
              <div className="bg-secondary/50 rounded p-3 font-mono text-xs space-y-1">
                <p><span className="text-muted-foreground">seusite.com</span> → domínio principal</p>
                <p><span className="text-primary font-bold">go</span>.seusite.com → subdomínio "go"</p>
                <p><span className="text-primary font-bold">link</span>.seusite.com → subdomínio "link"</p>
                <p><span className="text-primary font-bold">track</span>.seusite.com → subdomínio "track"</p>
              </div>
            </div>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">✓ Por que usar um subdomínio?</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span><strong className="text-foreground">Não afeta seu site:</strong> Seu site principal continua funcionando normalmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span><strong className="text-foreground">Mais profissional:</strong> Links como go.suaempresa.com passam confiança</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span><strong className="text-foreground">Fácil de lembrar:</strong> Usuários reconhecem sua marca</span>
              </li>
            </ul>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">💡 Subdomínios populares para cloaking:</h4>
            <div className="flex flex-wrap gap-2">
              {['go', 'link', 'click', 'track', 'promo', 'offer', 'deal', 'r'].map((sub) => (
                <code key={sub} className="bg-background px-2 py-1 rounded text-xs">
                  {sub}.seusite.com
                </code>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '1. Criar conta no Cloudflare (se não tiver)',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Se você ainda não tem uma conta no Cloudflare:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Acesse <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cloudflare.com</a></li>
            <li>Clique em <strong className="text-foreground">"Sign Up"</strong> no canto superior direito</li>
            <li>Preencha seu email e crie uma senha</li>
            <li>Confirme seu email clicando no link recebido</li>
          </ol>
          <Button variant="outline" size="sm" asChild className="mt-2">
            <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Abrir Cloudflare
            </a>
          </Button>
        </div>
      ),
    },
    {
      title: '2. Adicionar/Verificar seu domínio no Cloudflare',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <p className="text-warning font-medium">⚠️ Se seu domínio já está no Cloudflare, pule para o passo 3!</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Se seu domínio NÃO está no Cloudflare:</h4>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>No painel do Cloudflare, clique em <strong className="text-foreground">"Add a Site"</strong></li>
              <li>Digite seu domínio principal: <code className="bg-secondary px-1 rounded">{rootDomain}</code></li>
              <li>Selecione o plano <strong className="text-foreground">Free</strong> (gratuito)</li>
              <li>O Cloudflare vai mostrar os nameservers para você configurar</li>
            </ol>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Como alterar os Nameservers no seu registrador
            </h4>
            
            <div className="space-y-4">
              {/* GoDaddy */}
              <div className="border-l-2 border-primary pl-3">
                <p className="font-medium text-foreground">GoDaddy:</p>
                <ol className="text-xs space-y-1 mt-1">
                  <li>1. Acesse <a href="https://dcc.godaddy.com" target="_blank" className="text-primary hover:underline">dcc.godaddy.com</a></li>
                  <li>2. Clique no domínio → "DNS" → "Nameservers"</li>
                  <li>3. Selecione "Change" → "Enter my own nameservers"</li>
                  <li>4. Cole os nameservers do Cloudflare e salve</li>
                </ol>
              </div>

              {/* Namecheap */}
              <div className="border-l-2 border-primary pl-3">
                <p className="font-medium text-foreground">Namecheap:</p>
                <ol className="text-xs space-y-1 mt-1">
                  <li>1. Acesse <a href="https://ap.namecheap.com" target="_blank" className="text-primary hover:underline">ap.namecheap.com</a> → Domain List</li>
                  <li>2. Clique em "Manage" no domínio</li>
                  <li>3. Em "Nameservers", selecione "Custom DNS"</li>
                  <li>4. Adicione os nameservers do Cloudflare</li>
                </ol>
              </div>

              {/* Google Domains */}
              <div className="border-l-2 border-primary pl-3">
                <p className="font-medium text-foreground">Google Domains / Squarespace:</p>
                <ol className="text-xs space-y-1 mt-1">
                  <li>1. Acesse <a href="https://domains.squarespace.com" target="_blank" className="text-primary hover:underline">domains.squarespace.com</a></li>
                  <li>2. Clique no domínio → "DNS" → "Name servers"</li>
                  <li>3. Selecione "Use custom name servers"</li>
                  <li>4. Adicione os nameservers do Cloudflare</li>
                </ol>
              </div>

              {/* Hostinger */}
              <div className="border-l-2 border-primary pl-3">
                <p className="font-medium text-foreground">Hostinger:</p>
                <ol className="text-xs space-y-1 mt-1">
                  <li>1. hPanel → Domínios → Gerenciar</li>
                  <li>2. Clique em "DNS / Nameservers"</li>
                  <li>3. Em "Alterar nameservers", clique em "Alterar"</li>
                  <li>4. Cole os nameservers do Cloudflare</li>
                </ol>
              </div>

              {/* Registro.br */}
              <div className="border-l-2 border-primary pl-3">
                <p className="font-medium text-foreground">Registro.br:</p>
                <ol className="text-xs space-y-1 mt-1">
                  <li>1. Acesse <a href="https://registro.br" target="_blank" className="text-primary hover:underline">registro.br</a> e faça login</li>
                  <li>2. Clique no domínio → "Alterar Servidores DNS"</li>
                  <li>3. Troque para os nameservers do Cloudflare</li>
                  <li>4. Salve e aguarde até 24h para propagar</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-info/10 border border-info/30 rounded-lg p-3">
            <p className="text-xs">
              <strong className="text-foreground">⏱️ Tempo de propagação:</strong> Após alterar os nameservers, pode levar de 10 minutos até 24 horas para propagar. O Cloudflare vai mostrar quando estiver "Active".
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '3. Criar o subdomínio no DNS',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Agora vamos criar o registro DNS para seu subdomínio:</p>
          
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>No painel do Cloudflare, selecione seu domínio</li>
            <li>No menu lateral, clique em <strong className="text-foreground">"DNS"</strong> → <strong className="text-foreground">"Records"</strong></li>
            <li>Clique em <strong className="text-foreground">"Add record"</strong></li>
            <li>
              Configure assim:
              <div className="bg-secondary/50 rounded-lg p-3 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-mono text-foreground">A</span>
                  
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-mono text-primary font-bold">{subdomainPrefix}</span>
                  
                  <span className="text-muted-foreground">IPv4 address:</span>
                  <span className="font-mono text-foreground">192.0.2.1</span>
                  
                  <span className="text-muted-foreground">Proxy status:</span>
                  <span className="text-orange-400 font-medium">Proxied (nuvem laranja ☁️)</span>
                </div>
              </div>
            </li>
            <li>Clique em <strong className="text-foreground">"Save"</strong></li>
          </ol>

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <p className="text-xs">
              <strong className="text-warning">Importante:</strong> O IP 192.0.2.1 é apenas um placeholder - o Worker vai interceptar as requisições antes de chegar nesse IP. O importante é que o <strong>Proxy status esteja "Proxied" (laranja)</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '4. Criar o Worker',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Crie um Worker para fazer o proxy:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>No menu lateral, clique em <strong className="text-foreground">"Workers & Pages"</strong></li>
            <li>Clique em <strong className="text-foreground">"Create"</strong></li>
            <li>Selecione <strong className="text-foreground">"Create Worker"</strong></li>
            <li>Dê um nome ao worker (ex: <code className="bg-secondary px-1 rounded">visuflow-proxy</code>)</li>
            <li>Clique em <strong className="text-foreground">"Deploy"</strong></li>
          </ol>
        </div>
      ),
    },
    {
      title: '5. Colar o código do Worker',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Substitua o código padrão pelo código abaixo:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Após criar o worker, clique em <strong className="text-foreground">"Edit Code"</strong> (ou "Quick Edit")</li>
            <li><strong className="text-foreground">Apague todo o código existente</strong></li>
            <li>Cole o código abaixo</li>
            <li>Clique em <strong className="text-foreground">"Save and Deploy"</strong></li>
          </ol>
          
          <div className="relative mt-4">
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
              {workerCode}
            </pre>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="absolute top-2 right-2 gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: '6. Configurar a rota do Worker',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Conecte o worker ao seu subdomínio:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Na página do Worker, vá na aba <strong className="text-foreground">"Settings"</strong></li>
            <li>Clique em <strong className="text-foreground">"Triggers"</strong></li>
            <li>Em "Routes", clique em <strong className="text-foreground">"Add Route"</strong></li>
            <li>
              Configure:
              <div className="bg-secondary/50 rounded-lg p-3 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">Route:</span>
                  <code className="text-primary font-bold">{domain}/p/*</code>
                  
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="font-mono text-foreground">{rootDomain}</span>
                </div>
              </div>
            </li>
            <li>Clique em <strong className="text-foreground">"Add Route"</strong></li>
          </ol>

          <div className="bg-success/10 border border-success/30 rounded-lg p-3 mt-4">
            <p className="text-success font-medium mb-2">
              ✅ Pronto! Seus links funcionarão assim:
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Páginas geradas:</span>
                <code className="block mt-1 bg-secondary px-2 py-1 rounded">
                  https://{domain}/p/PAGE_ID?type=page
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Cloaking configs:</span>
                <code className="block mt-1 bg-secondary px-2 py-1 rounded">
                  https://{domain}/p/CLOAKING_ID
                </code>
              </div>
            </div>
          </div>

          <div className="bg-info/10 border border-info/30 rounded-lg p-3 mt-2">
            <p className="text-xs">
              <strong className="text-foreground">ℹ️ Diferença:</strong> O parâmetro <code className="bg-secondary px-1 rounded">type=page</code> indica que é uma página gerada no sistema. Sem ele, o sistema procura nas configurações de cloaking.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 mt-2">
            <p className="text-xs">
              <strong className="text-foreground">💡 Dica:</strong> Volte para a página anterior e clique em "Verificar" para confirmar que tudo está funcionando!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <img src="https://www.cloudflare.com/favicon.ico" alt="Cloudflare" className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Configuração Cloudflare Workers</h3>
          <p className="text-sm text-muted-foreground">Siga os passos abaixo para configurar o proxy</p>
        </div>
      </div>

      <TooltipProvider>
        {steps.map((step, index) => (
          <Card
            key={index}
            className={cn(
              "overflow-hidden transition-all",
              expandedStep === index ? "border-primary/50" : "border-border/50"
            )}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
            >
              <span className={cn(
                "font-medium",
                expandedStep === index ? "text-primary" : "text-foreground"
              )}>
                {step.title}
              </span>
              {expandedStep === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expandedStep === index && (
              <div className="px-4 pb-4 border-t border-border/50 pt-4">
                {step.content}
              </div>
            )}
          </Card>
        ))}
      </TooltipProvider>
    </div>
  );
}
