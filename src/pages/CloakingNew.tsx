import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { CloakingForm } from '@/components/cloaking/CloakingForm';
import { useCloaking } from '@/hooks/useCloaking';
import { useUserDomain } from '@/hooks/useUserDomain';
import { CloakingFormData } from '@/types/cloaking';
import { Shield, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CloakingNew() {
  const navigate = useNavigate();
  const { createConfig } = useCloaking();
  const { getCloakingUrl } = useUserDomain();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdConfig, setCreatedConfig] = useState<{ id: string; name: string; short_id: string | null; slug: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (data: CloakingFormData) => {
    console.log('CloakingNew: Submitting form data:', data);
    setIsSubmitting(true);
    
    try {
      const config = await createConfig(data);
      console.log('CloakingNew: createConfig result:', config);
      
      if (config) {
        setCreatedConfig({ 
          id: config.id, 
          name: config.name,
          short_id: config.short_id,
          slug: config.slug,
        });
        toast({
          title: 'Cloaking criado!',
          description: 'Sua configuração de cloaking foi criada com sucesso.',
        });
      } else {
        console.error('CloakingNew: createConfig returned null');
      }
    } catch (error) {
      console.error('CloakingNew: Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdConfig) return;
    const url = getCloakingUrl(createdConfig.id, createdConfig.short_id, createdConfig.slug);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdConfig) {
    const cloakingUrl = getCloakingUrl(createdConfig.id, createdConfig.short_id, createdConfig.slug);
    
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-green-500/10 w-fit mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Cloaking Criado com Sucesso!</CardTitle>
              <CardDescription className="text-base">
                "{createdConfig.name}" está pronto para uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Seu link de cloaking:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate">
                    {cloakingUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Como funciona:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Usuários reais serão redirecionados para sua página de destino</li>
                  <li>• Bots e crawlers verão a página fake ou serão bloqueados</li>
                  <li>• Todas as métricas são registradas automaticamente</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => navigate('/cloaking')}
                >
                  Ver Todos
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/cloaking/${createdConfig.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            Novo Cloaking
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure uma nova proteção de cloaking independente
          </p>
        </div>

        <CloakingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </AppLayout>
  );
}