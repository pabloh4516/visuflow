import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CloudflareSetup } from '@/components/settings/CloudflareSetup';
import { VercelSetup } from '@/components/settings/VercelSetup';
import { ManualSetup } from '@/components/settings/ManualSetup';
import { useUserDomain } from '@/hooks/useUserDomain';
import { 
  Globe, Shield, CheckCircle2, XCircle, 
  Loader2, Trash2, RefreshCw, AlertTriangle, Zap, Eye, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Provider = 'cloudflare' | 'vercel' | 'manual';

export default function DomainSettings() {
  const { domain, isLoading, saveDomain, verifyDomain, deleteDomain } = useUserDomain();
  
  const [domainInput, setDomainInput] = useState(domain?.domain || '');
  const [provider, setProvider] = useState<Provider>((domain?.provider as Provider) || 'cloudflare');
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Update input when domain loads
  useState(() => {
    if (domain?.domain) {
      setDomainInput(domain.domain);
      setProvider((domain.provider as Provider) || 'cloudflare');
    }
  });

  const handleSave = async () => {
    if (!domainInput.trim()) {
      toast.error('Digite um domínio');
      return;
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domainInput.trim())) {
      toast.error('Domínio inválido. Use o formato: go.seusite.com');
      return;
    }

    setIsSaving(true);
    const result = await saveDomain(domainInput.trim(), provider);
    setIsSaving(false);

    if (result.success) {
      toast.success('Domínio salvo! Agora siga as instruções para configurar o proxy.');
    } else {
      toast.error(result.error || 'Erro ao salvar domínio');
    }
  };

  const [verificationError, setVerificationError] = useState<{ error: string; details?: string } | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationError(null);
    const result = await verifyDomain();
    setIsVerifying(false);

    if (result.success) {
      toast.success('Domínio verificado com sucesso! Proxy funcionando.');
    } else {
      setVerificationError({ error: result.error || 'Erro desconhecido', details: result.details });
      toast.error(result.error || 'Erro ao verificar domínio');
    }
  };

  const handleDelete = async () => {
    const result = await deleteDomain();
    if (result.success) {
      setDomainInput('');
      toast.success('Domínio removido');
    } else {
      toast.error(result.error || 'Erro ao remover domínio');
    }
  };

  const providers: { id: Provider; name: string; description: string; recommended?: boolean }[] = [
    { 
      id: 'cloudflare', 
      name: 'Cloudflare Workers', 
      description: 'Mais fácil e gratuito',
      recommended: true 
    },
    { 
      id: 'vercel', 
      name: 'Vercel Edge', 
      description: 'Para quem já usa Vercel' 
    },
    { 
      id: 'manual', 
      name: 'Manual (VPS)', 
      description: 'Nginx/Apache próprio' 
    },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Domínio Customizado</h1>
          <p className="text-muted-foreground">Configure seu próprio domínio para cloaking</p>
        </div>

        {/* Why use custom domain */}
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Por que usar um domínio próprio?</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span><strong className="text-foreground">Mais seguro:</strong> URLs não revelam uso de ferramentas de cloaking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span><strong className="text-foreground">Mais profissional:</strong> Links com sua marca passam mais confiança</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span><strong className="text-foreground">Ad Platforms:</strong> Menor chance de bloqueio por domínios suspeitos</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Domain Configuration */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Seu Domínio
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domínio ou Subdomínio</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="domain"
                  placeholder="go.seusite.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Recomendamos usar um subdomínio como <code className="bg-secondary px-1 rounded">go.seusite.com</code> ou <code className="bg-secondary px-1 rounded">link.seusite.com</code>
              </p>
            </div>

            {domain && (
              <div className="space-y-3">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  domain.is_verified 
                    ? "bg-success/10 border-success/30" 
                    : "bg-warning/10 border-warning/30"
                )}>
                  <div className="flex items-center gap-2">
                    {domain.is_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      domain.is_verified ? "text-success" : "text-warning"
                    )}>
                      {domain.is_verified ? 'Domínio verificado - Proxy funcionando!' : 'Aguardando verificação'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="gap-2"
                    >
                      {isVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {isVerifying ? 'Verificando...' : 'Verificar'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover domínio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso vai remover a configuração do domínio. Seus links de cloaking voltarão a usar o domínio padrão.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Verification Error Details */}
                {verificationError && !domain.is_verified && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">{verificationError.error}</p>
                        {verificationError.details && (
                          <p className="text-xs text-muted-foreground">{verificationError.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-destructive/20">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Dicas de troubleshooting:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Verifique se o Worker está ativo e deployado</li>
                        <li>• Confirme que a rota <code className="bg-secondary px-1 rounded">{domain.domain}/p/*</code> está configurada</li>
                        <li>• Aguarde 5-10 minutos para propagação DNS</li>
                        <li>• Certifique-se que o proxy status está "Proxied" (laranja) no DNS</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Success info */}
                {domain.is_verified && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                    <p className="text-xs text-success">
                      Seus links de cloaking agora usam: <code className="bg-success/20 px-1 rounded">https://{domain.domain}/p/page-id</code>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Provider Selection */}
        {domain && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Escolha o Provedor</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "relative p-4 rounded-lg border text-left transition-all",
                      provider === p.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    {p.recommended && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                    <span className="font-medium text-foreground block">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Setup Instructions */}
            <Card className="p-6">
              {provider === 'cloudflare' && <CloudflareSetup domain={domainInput || domain.domain} />}
              {provider === 'vercel' && <VercelSetup domain={domainInput || domain.domain} />}
              {provider === 'manual' && <ManualSetup domain={domainInput || domain.domain} />}
            </Card>
          </>
        )}

        {/* Show provider selection and instructions even before saving domain */}
        {!domain && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Escolha o Provedor</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "relative p-4 rounded-lg border text-left transition-all",
                      provider === p.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    {p.recommended && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                    <span className="font-medium text-foreground block">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Setup Instructions Preview */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Passo 1:</strong> Digite e salve seu domínio acima para personalizar as instruções
                </p>
              </div>
              {provider === 'cloudflare' && <CloudflareSetup domain={domainInput || 'go.seusite.com'} />}
              {provider === 'vercel' && <VercelSetup domain={domainInput || 'go.seusite.com'} />}
              {provider === 'manual' && <ManualSetup domain={domainInput || 'go.seusite.com'} />}
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}