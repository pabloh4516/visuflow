import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CloakingConfig, CloakingFormData } from '@/types/cloaking';
import { toast } from '@/hooks/use-toast';

export function useCloaking() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<CloakingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cloaking_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs((data as unknown as CloakingConfig[]) || []);
    } catch (error) {
      console.error('Error fetching cloaking configs:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar suas configurações de cloaking.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const createConfig = async (formData: CloakingFormData): Promise<CloakingConfig | null> => {
    if (!user) {
      console.error('createConfig: No user authenticated');
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar um cloaking.',
        variant: 'destructive',
      });
      return null;
    }

    console.log('createConfig: Starting creation with user:', user.id);
    console.log('createConfig: Form data:', JSON.stringify(formData, null, 2));

    try {
      const insertData = {
        user_id: user.id,
        name: formData.name,
        redirect_url: formData.redirect_url,
        use_separate_urls: formData.use_separate_urls,
        redirect_url_desktop: formData.use_separate_urls ? formData.redirect_url_desktop : null,
        redirect_url_mobile: formData.use_separate_urls ? formData.redirect_url_mobile : null,
        bot_action: formData.bot_action,
        fake_page_template: formData.fake_page_template,
        fake_page_html: formData.fake_page_html || null,
        bot_redirect_url: formData.bot_action === 'redirect' ? formData.bot_redirect_url : null,
        safe_redirect_url: formData.safe_redirect_url || null,
        block_known_bots: formData.block_known_bots,
        block_data_centers: formData.block_data_centers,
        slug: formData.slug?.trim() || null,
      };

      console.log('createConfig: Inserting data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('cloaking_configs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('createConfig: Supabase error:', error);
        throw error;
      }
      
      console.log('createConfig: Success! Created config:', data);
      await fetchConfigs();
      return data as unknown as CloakingConfig;
    } catch (error: any) {
      console.error('createConfig: Error creating cloaking config:', error);
      toast({
        title: 'Erro ao criar configuração',
        description: error?.message || 'Não foi possível criar a configuração de cloaking.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateConfig = async (id: string, formData: Partial<CloakingFormData>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {
        ...formData,
        redirect_url_desktop: formData.use_separate_urls ? formData.redirect_url_desktop : null,
        redirect_url_mobile: formData.use_separate_urls ? formData.redirect_url_mobile : null,
        bot_redirect_url: formData.bot_action === 'redirect' ? formData.bot_redirect_url : null,
        safe_redirect_url: formData.safe_redirect_url || null,
      };
      
      // Handle slug separately to allow clearing it
      if ('slug' in formData) {
        updateData.slug = formData.slug?.trim() || null;
      }
      
      const { error } = await supabase
        .from('cloaking_configs')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error updating cloaking config:', error);
      toast({
        title: 'Erro ao atualizar configuração',
        description: 'Não foi possível atualizar a configuração de cloaking.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteConfig = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cloaking_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error deleting cloaking config:', error);
      toast({
        title: 'Erro ao excluir configuração',
        description: 'Não foi possível excluir a configuração de cloaking.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getCloakingUrl = (configId: string, shortId?: string | null, slug?: string | null): string => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // Prioritize: slug > short_id > UUID
    const identifier = slug || shortId || configId;
    return `${supabaseUrl}/functions/v1/serve-page?cloaking=${identifier}`;
  };

  return {
    configs,
    isLoading,
    createConfig,
    updateConfig,
    deleteConfig,
    getCloakingUrl,
    refetch: fetchConfigs,
  };
}
