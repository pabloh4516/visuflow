import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VercelSetupProps {
  domain: string;
}

const SUPABASE_URL = 'https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/serve-page';

export function VercelSetup({ domain }: VercelSetupProps) {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  // Extract subdomain prefix from domain (e.g., "go" from "go.example.com")
  const domainParts = domain.split('.');
  const subdomainPrefix = domainParts.length > 2 ? domainParts[0] : 'go';
  const rootDomain = domainParts.length > 2 ? domainParts.slice(1).join('.') : domain;

  const middlewareCode = `// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota de proxy /p/{pageId}
  const match = pathname.match(/^\\/p\\/([a-zA-Z0-9-]+)$/);
  
  if (match) {
    const pageId = match[1];
    const targetUrl = '${SUPABASE_URL}?page=' + pageId;
    
    // Faz rewrite para o VisuFlow preservando headers
    return NextResponse.rewrite(new URL(targetUrl), {
      headers: {
        'X-Forwarded-For': request.ip || '',
        'X-Real-IP': request.ip || '',
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/p/:path*',
};`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(middlewareCode);
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
              </div>
            </div>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">✓ Por que usar um subdomínio?</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span><strong className="text-foreground">Não afeta seu site:</strong> Seu site principal continua funcionando</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span><strong className="text-foreground">Mais profissional:</strong> Links como go.suaempresa.com passam confiança</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '1. Criar projeto no Vercel',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Crie um novo projeto Next.js no Vercel:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Acesse <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a> e faça login</li>
            <li>Clique em <strong className="text-foreground">"New Project"</strong></li>
            <li>Selecione <strong className="text-foreground">"Clone Template"</strong> → Next.js</li>
            <li>Dê um nome ao projeto (ex: <code className="bg-secondary px-1 rounded">visuflow-proxy</code>)</li>
            <li>Clique em <strong className="text-foreground">"Deploy"</strong></li>
          </ol>
          <Button variant="outline" size="sm" asChild className="mt-2">
            <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Abrir Vercel
            </a>
          </Button>
        </div>
      ),
    },
    {
      title: '2. Adicionar o middleware',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Crie o arquivo de middleware:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Clone o repositório do projeto criado</li>
            <li>Na raiz do projeto, crie o arquivo <code className="bg-secondary px-1 rounded">middleware.ts</code></li>
            <li>Cole o código abaixo</li>
            <li>Faça commit e push das alterações</li>
          </ol>
          
          <div className="relative mt-4">
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
              {middlewareCode}
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
      title: '3. Configurar domínio customizado',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Conecte seu domínio ao projeto Vercel:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>No painel do Vercel, vá em <strong className="text-foreground">"Settings"</strong> → <strong className="text-foreground">"Domains"</strong></li>
            <li>
              Digite seu domínio:{' '}
              <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                {domain}
              </code>
            </li>
            <li>O Vercel mostrará os registros DNS necessários</li>
          </ol>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Como configurar o DNS no seu registrador
            </h4>
            
            <div className="space-y-3">
              <p className="text-xs">Para subdomínios, você geralmente precisa adicionar um registro <strong>CNAME</strong>:</p>
              
              <div className="bg-background rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-mono text-foreground">CNAME</span>
                  
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-mono text-primary font-bold">{subdomainPrefix}</span>
                  
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-mono text-foreground">cname.vercel-dns.com</span>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <p className="font-medium text-foreground">Registradores populares:</p>
                <ul className="space-y-1">
                  <li>• <strong>GoDaddy:</strong> DNS → Add Record → CNAME</li>
                  <li>• <strong>Namecheap:</strong> Advanced DNS → Add New Record → CNAME</li>
                  <li>• <strong>Cloudflare:</strong> DNS → Add Record → CNAME (com Proxy desligado)</li>
                  <li>• <strong>Registro.br:</strong> Configurações → DNS → Adicionar CNAME</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-lg p-3">
            <p className="text-success text-xs">
              <strong>Pronto!</strong> Após verificar, seus links funcionarão em:{' '}
              <code className="bg-success/20 px-1 rounded">https://{domain}/p/seu-page-id</code>
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3">
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
        <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 76 65" fill="currentColor">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Configuração Vercel Edge</h3>
          <p className="text-sm text-muted-foreground">Siga os passos abaixo para configurar o proxy</p>
        </div>
      </div>

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
    </div>
  );
}
