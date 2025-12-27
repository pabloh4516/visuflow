import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CloudflareSetup } from '@/components/settings/CloudflareSetup';
import { VercelSetup } from '@/components/settings/VercelSetup';
import { ManualSetup } from '@/components/settings/ManualSetup';
import { SimplifiedDomainSetup } from '@/components/settings/SimplifiedDomainSetup'; // NOVO
import { useUserDomain } from '@/hooks/useUserDomain'; // ATUALIZADO
import { 
  Globe, Shield, CheckCircle2, XCircle, 
  Loader2, Trash2, RefreshCw, AlertTriangle, Zap, Eye, Lock, TrendingUp, Info
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // NOVO
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"; // NOVO

type Provider = 'cloudflare' | 'vercel' | 'manual' | 'cname';

export default function DomainSettings() {
  const { domain, isLoading, saveDomain, verifyDomain, deleteDomain } = useUserDomain();
  
  const [domainInput, setDomainInput] = useState(domain?.domain || '');
  const [provider, setProvider] = useState<Provider>((domain?.provider as Provider) || 'cname'); // Padrão: 'cname'
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<{ error: string; details?: string } | null>(null);

  // Update input when domain loads
  useState(() => {
    if (domain?.domain) {
      setDomainInput(domain.domain);
      setProvider((domain.provider as Provider) || 'cname');
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
      toast.success(provider === 'cname' 
        ? 'Domínio adicionado! Configure o CNAME no seu DNS.'
        : 'Domínio salvo! Agora siga as instruções para configurar o proxy.'
      );
    } else {
      toast.error(result.error || 'Erro ao salvar domínio');
    }
  };

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
      setProvider('cname');
      toast.success('Domínio removido');
    } else {
      toast.error(result.error || 'Erro ao remover domínio');
    }
  };

  const providers: { id: Provider; name: string; description: string; recommended?: boolean }[] = [
    { 
      id: 'cname', 
      name: 'Configuração Simples (CNAME)', 
      description: 'Apenas 1 registro CNAME - Recomendado',
      recommended: true 
    },
    { 
      id: 'cloudflare', 
      name: 'Cloudflare Workers', 
      description: 'Mais controle e gratuito'
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
          <h1 className="text-2xl font-bold text-foreground">Domínio Personalizado</h1>
          <p className="text-muted-foreground">Configure seu próprio domínio para páginas e cloaking</p>
        </div>

        {/* Why use custom domain */}
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Por que usar um domínio próprio?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Mais seguro:</strong>
                    <span className="text-muted-foreground"> URLs não revelam uso de ferramentas de cloaking</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Mais profissional:</strong>
                    <span className="text-muted-foreground"> Links com sua marca passam mais confiança</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Ad Platforms:</strong>
                    <span className="text-muted-foreground"> Menor chance de bloqueio por domínios suspeitos</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Melhor conversão:</strong>
                    <span className="text-muted-foreground"> Usuários confiam mais em domínios próprios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Configuration Tabs */}
        <Tabs defaultValue={domain?.provider === 'cname' ? 'simple' : 'advanced'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">
              ⚡ Configuração Simples (Recomendado)
            </TabsTrigger>
            <TabsTrigger value="advanced">
              🔧 Configuração Avançada
            </TabsTrigger>
          </TabsList>

          {/* Simple CNAME Setup */}
          <TabsContent value="simple" className="space-y-4">
            {domain && domain.provider !== 'cname' ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Domínio configurado no modo Avançado</AlertTitle>
                <AlertDescription>
                  Para usar a Configuração Simples, remova o domínio atual primeiro.
                  <Button variant="outline" size="sm" className="ml-4" onClick={handleDelete}>
                    Remover Domínio
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card className="p-4 bg-success/5 border-success/30">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-success mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Configuração Simplificada</p>
                      <p className="text-muted-foreground">
                        Apenas 3 passos: adicione o domínio → configure um CNAME → pronto! 
                        Sem código, sem Workers, sem complicação. ✨
                      </p>
                    </div>
                  </div>
                </Card>

                <SimplifiedDomainSetup />
              </>
            )}
          </TabsContent>

          {/* Advanced Setup (Legacy) */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="p-4 bg-warning/5 border-warning/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Configuração Avançada</p>
                  <p className="text-muted-foreground">
                    Para usuários avançados que querem controle total sobre a infraestrutura. 
                    Requer conhecimento técnico de Workers/Edge Functions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Domain Configuration Card */}
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

                {domain && domain.provider !== 'cname' && (
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

            {/* Provider Selection (only for advanced) */}
            {domain && domain.provider !== 'cname' && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Escolha o Provedor</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {providers.filter(p => p.id !== 'cname').map((p) => (
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
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold text-foreground mb-3">Precisa de ajuda?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Configuração Simples:</strong> Perfeita para a maioria dos usuários. 
              Configure em minutos sem conhecimento técnico.
            </p>
            <p>
              <strong className="text-foreground">Configuração Avançada:</strong> Para quem já tem Workers/Edge Functions 
              configurados ou precisa de controle total sobre o proxy.
            </p>
            <p className="pt-2">
              💡 <strong>Dica:</strong> Recomendamos começar com a Configuração Simples. 
              Você sempre pode mudar depois se precisar.
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}