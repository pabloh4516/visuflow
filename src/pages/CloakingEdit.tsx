import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { CloakingForm } from '@/components/cloaking/CloakingForm';
import { useCloaking } from '@/hooks/useCloaking';
import { CloakingFormData, CloakingConfig } from '@/types/cloaking';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function CloakingEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateConfig } = useCloaking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<CloakingConfig | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('cloaking_configs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setConfig(data as unknown as CloakingConfig);
      } catch (error) {
        console.error('Error fetching cloaking config:', error);
        toast({
          title: 'Erro ao carregar configuração',
          description: 'Não foi possível carregar a configuração de cloaking.',
          variant: 'destructive',
        });
        navigate('/cloaking');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [id, navigate]);

  const handleSubmit = async (data: CloakingFormData) => {
    if (!id) return;
    
    console.log('CloakingEdit: Updating form data:', data);
    setIsSubmitting(true);
    
    try {
      const success = await updateConfig(id, data);
      
      if (success) {
        toast({
          title: 'Cloaking atualizado!',
          description: 'Sua configuração foi atualizada com sucesso.',
        });
        navigate(`/cloaking/${id}`);
      }
    } catch (error) {
      console.error('CloakingEdit: Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!config) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Cloaking não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            A configuração de cloaking que você está procurando não existe.
          </p>
          <Button onClick={() => navigate('/cloaking')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  // Convert CloakingConfig to CloakingFormData
  const initialData: CloakingFormData = {
    name: config.name,
    redirect_url: config.redirect_url,
    use_separate_urls: config.use_separate_urls || false,
    redirect_url_desktop: config.redirect_url_desktop || '',
    redirect_url_mobile: config.redirect_url_mobile || '',
    bot_action: config.bot_action as CloakingFormData['bot_action'],
    fake_page_template: config.fake_page_template || 1,
    fake_page_html: config.fake_page_html || '',
    bot_redirect_url: config.bot_redirect_url || '',
    safe_redirect_url: config.safe_redirect_url || '',
    block_known_bots: config.block_known_bots ?? true,
    block_data_centers: config.block_data_centers ?? true,
    slug: config.slug || '',
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            Editar Cloaking
          </h1>
          <p className="text-muted-foreground mt-1">
            Editar configuração: {config.name}
          </p>
        </div>

        <CloakingForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          isEditing
        />
      </div>
    </AppLayout>
  );
}