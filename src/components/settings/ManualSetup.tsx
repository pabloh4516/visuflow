import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ManualSetupProps {
  domain: string;
}

const SUPABASE_URL = 'https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/serve-page';

export function ManualSetup({ domain }: ManualSetupProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const nginxConfig = `# Nginx configuration for ${domain}
server {
    listen 80;
    listen 443 ssl http2;
    server_name ${domain};
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    
    # Proxy para VisuFlow
    location ~ ^/p/([a-zA-Z0-9-]+)$ {
        set $page_id $1;
        
        proxy_pass ${SUPABASE_URL}?page=$page_id;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_ssl_server_name on;
    }
}`;

  const apacheConfig = `# Apache configuration for ${domain}
<VirtualHost *:80>
    ServerName ${domain}
    Redirect permanent / https://${domain}/
</VirtualHost>

<VirtualHost *:443>
    ServerName ${domain}
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${domain}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${domain}/privkey.pem
    
    # Proxy para VisuFlow
    ProxyPreserveHost Off
    SSLProxyEngine On
    
    <LocationMatch "^/p/([a-zA-Z0-9-]+)$">
        RewriteEngine On
        RewriteCond %{REQUEST_URI} ^/p/([a-zA-Z0-9-]+)$
        RewriteRule ^/p/(.*)$ ${SUPABASE_URL}?page=$1 [P,L]
        
        RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"
        RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
    </LocationMatch>
</VirtualHost>`;

  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const steps = [
    {
      title: '1. Requisitos',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Para configuração manual, você precisa de:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Um servidor com <strong className="text-foreground">Nginx</strong> ou <strong className="text-foreground">Apache</strong></li>
            <li>Certificado SSL (recomendamos <strong className="text-foreground">Let's Encrypt</strong>)</li>
            <li>Acesso root/sudo ao servidor</li>
            <li>Domínio apontando para o IP do servidor</li>
          </ul>
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mt-3">
            <p className="text-warning text-xs">
              <strong>Aviso:</strong> Esta opção requer conhecimento técnico em administração de servidores.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '2. Configuração Nginx',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Se você usa Nginx, adicione esta configuração:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Crie o arquivo <code className="bg-secondary px-1 rounded">/etc/nginx/sites-available/{domain}</code></li>
            <li>Cole a configuração abaixo</li>
            <li>Crie um link simbólico: <code className="bg-secondary px-1 rounded">ln -s /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/</code></li>
            <li>Teste: <code className="bg-secondary px-1 rounded">nginx -t</code></li>
            <li>Reinicie: <code className="bg-secondary px-1 rounded">systemctl reload nginx</code></li>
          </ol>
          
          <div className="relative mt-4">
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
              {nginxConfig}
            </pre>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(nginxConfig, 'nginx')}
              className="absolute top-2 right-2 gap-2"
            >
              {copied === 'nginx' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'nginx' ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: '3. Configuração Apache',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Se você usa Apache, adicione esta configuração:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Ative módulos necessários: <code className="bg-secondary px-1 rounded">a2enmod proxy proxy_http ssl rewrite headers</code></li>
            <li>Crie o arquivo <code className="bg-secondary px-1 rounded">/etc/apache2/sites-available/{domain}.conf</code></li>
            <li>Cole a configuração abaixo</li>
            <li>Ative o site: <code className="bg-secondary px-1 rounded">a2ensite {domain}</code></li>
            <li>Reinicie: <code className="bg-secondary px-1 rounded">systemctl reload apache2</code></li>
          </ol>
          
          <div className="relative mt-4">
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
              {apacheConfig}
            </pre>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(apacheConfig, 'apache')}
              className="absolute top-2 right-2 gap-2"
            >
              {copied === 'apache' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'apache' ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: '4. Configurar SSL',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Configure SSL com Let's Encrypt (gratuito):</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Instale certbot: <code className="bg-secondary px-1 rounded">apt install certbot</code></li>
            <li>Para Nginx: <code className="bg-secondary px-1 rounded">certbot --nginx -d {domain}</code></li>
            <li>Para Apache: <code className="bg-secondary px-1 rounded">certbot --apache -d {domain}</code></li>
            <li>Siga as instruções do certbot</li>
            <li>Os certificados serão renovados automaticamente</li>
          </ol>
          <div className="bg-success/10 border border-success/30 rounded-lg p-3 mt-3">
            <p className="text-success text-xs">
              <strong>Pronto!</strong> Após configurar, seus links funcionarão em:{' '}
              <code className="bg-secondary px-1 rounded">https://{domain}/p/seu-page-id</code>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Server className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Configuração Manual (VPS/Servidor)</h3>
          <p className="text-sm text-muted-foreground">Para servidores próprios com Nginx ou Apache</p>
        </div>
      </div>

      {steps.map((step, index) => (
        <Card
          key={index}
          className={cn(
            "overflow-hidden transition-all",
            expandedStep === index + 1 ? "border-primary/50" : "border-border/50"
          )}
        >
          <button
            onClick={() => setExpandedStep(expandedStep === index + 1 ? null : index + 1)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
          >
            <span className={cn(
              "font-medium",
              expandedStep === index + 1 ? "text-primary" : "text-foreground"
            )}>
              {step.title}
            </span>
            {expandedStep === index + 1 ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {expandedStep === index + 1 && (
            <div className="px-4 pb-4 border-t border-border/50 pt-4">
              {step.content}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
