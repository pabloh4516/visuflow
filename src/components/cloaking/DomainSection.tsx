import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, XCircle, Loader2, Settings, ExternalLink } from 'lucide-react';
import { useUserDomain } from '@/hooks/useUserDomain';
import { useNavigate } from 'react-router-dom';

export function DomainSection() {
  const navigate = useNavigate();
  const { domain, isLoading, verifyDomain } = useUserDomain();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    const result = await verifyDomain();
    if (!result.success) {
      setVerifyError(result.error || 'Erro na verificação');
    }
    setIsVerifying(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Domínio Customizado</h3>
            <p className="text-xs text-muted-foreground">
              Configure seu domínio para URLs de cloaking personalizadas
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings/domain')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Configurar
        </Button>
      </div>

      {domain ? (
        <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-foreground">{domain.domain}</span>
              {domain.is_verified ? (
                <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 gap-1">
                  <XCircle className="h-3 w-3" />
                  Não verificado
                </Badge>
              )}
            </div>
            {!domain.is_verified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVerify}
                disabled={isVerifying}
                className="gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar agora'
                )}
              </Button>
            )}
          </div>

          {verifyError && (
            <p className="text-xs text-destructive mt-2">{verifyError}</p>
          )}

          {domain.is_verified && (
            <p className="text-xs text-muted-foreground mt-2">
              Suas URLs de cloaking usarão: <code className="text-primary">https://{domain.domain}/p/[id]</code>
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-dashed border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Nenhum domínio configurado. Configure um domínio para usar URLs personalizadas.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/domain')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Configurar Domínio
          </Button>
        </div>
      )}
    </Card>
  );
}