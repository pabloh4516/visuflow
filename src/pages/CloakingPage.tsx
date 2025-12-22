import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useCloaking } from '@/hooks/useCloaking';
import { useUserDomain } from '@/hooks/useUserDomain';
import { CloakingCard } from '@/components/cloaking/CloakingCard';
import { DomainSection } from '@/components/cloaking/DomainSection';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Loader2 } from 'lucide-react';

export default function CloakingPage() {
  const navigate = useNavigate();
  const { configs, isLoading, deleteConfig } = useCloaking();
  const { getCloakingUrl } = useUserDomain();

  const handleViewReport = (configId: string) => {
    navigate(`/cloaking/${configId}`);
  };

  const handleDelete = async (configId: string) => {
    await deleteConfig(configId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              Cloaking
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas configurações de cloaking independente
            </p>
          </div>
          <Button onClick={() => navigate('/cloaking/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cloaking
          </Button>
        </div>

        <DomainSection />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-primary/10 inline-flex mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum cloaking configurado</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie sua primeira configuração de cloaking para proteger suas páginas de bots
              e rastreadores.
            </p>
            <Button onClick={() => navigate('/cloaking/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Cloaking
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {configs.map((config) => (
              <CloakingCard
                key={config.id}
                config={config}
                cloakingUrl={getCloakingUrl(config.id)}
                onViewReport={() => handleViewReport(config.id)}
                onDelete={() => handleDelete(config.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
