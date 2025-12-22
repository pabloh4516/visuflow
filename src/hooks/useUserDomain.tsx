import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserDomain {
  id: string;
  domain: string;
  provider: string;
  is_verified: boolean;
}

interface VerificationResult {
  success: boolean;
  error?: string;
  details?: string;
}

export function useUserDomain() {
  const { user } = useAuth();
  const [domain, setDomain] = useState<UserDomain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDomain = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_domains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setDomain(data as UserDomain | null);
    } catch (error) {
      console.error('Error fetching user domain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomain();
  }, [user?.id]);

  // For generated_pages - use short_id or slug if available
  const getPageUrl = (pageId: string, shortId?: string | null, slug?: string | null) => {
    // Prioritize: slug > short_id > UUID
    const identifier = slug || shortId || pageId;
    if (domain?.is_verified && domain.domain) {
      return `https://${domain.domain}/p/${identifier}?type=page`;
    }
    return `https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/serve-page?page=${identifier}`;
  };

  // For cloaking_configs - use short_id or slug if available
  const getCloakingUrl = (configId: string, shortId?: string | null, slug?: string | null) => {
    // Prioritize: slug > short_id > UUID
    const identifier = slug || shortId || configId;
    if (domain?.is_verified && domain.domain) {
      return `https://${domain.domain}/p/${identifier}`;
    }
    return `https://eggghcfnwpoymownwgbb.supabase.co/functions/v1/serve-page?cloaking=${identifier}`;
  };

  const saveDomain = async (domainName: string, provider: string) => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    try {
      if (domain) {
        // Update existing
        const { error } = await supabase
          .from('user_domains')
          .update({ domain: domainName, provider, is_verified: false })
          .eq('id', domain.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_domains')
          .insert({ user_id: user.id, domain: domainName, provider });
        if (error) throw error;
      }
      
      await fetchDomain();
      return { success: true };
    } catch (error: any) {
      console.error('Error saving domain:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyDomain = async (): Promise<VerificationResult> => {
    if (!domain?.id || !user?.id) {
      return { success: false, error: 'Nenhum domínio configurado' };
    }

    const verifyToken = user.id.slice(0, 8);
    const testUrl = `https://${domain.domain}/p/verify-${verifyToken}`;
    
    console.log(`Verifying domain: ${domain.domain}`);
    console.log(`Test URL: ${testUrl}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { 
          success: false, 
          error: 'O proxy não retornou uma resposta válida',
          details: `Status: ${response.status}. Verifique se o Worker/Middleware está configurado corretamente.`
        };
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        return { 
          success: false, 
          error: 'Resposta inválida do proxy',
          details: 'O proxy não retornou JSON válido. Verifique se o código do Worker está correto.'
        };
      }

      const expectedToken = `visuflow-verified-${verifyToken}`;
      
      if (data.token === expectedToken) {
        // Success! Update database
        const { error } = await supabase
          .from('user_domains')
          .update({ is_verified: true })
          .eq('id', domain.id);

        if (error) throw error;
        
        await fetchDomain();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Token de verificação não corresponde',
          details: `O proxy está funcionando mas não retornou o token esperado. Verifique se o Worker está apontando para a URL correta do VisuFlow.`
        };
      }
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Timeout na verificação',
          details: 'A requisição demorou mais de 15 segundos. Possíveis causas: DNS ainda não propagou, Worker não está ativo, ou domínio não existe.'
        };
      }

      // CORS or network error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Não foi possível conectar ao domínio',
          details: 'Possíveis causas: DNS não propagou (aguarde até 24h), domínio não existe, Worker não está configurado na rota correta, ou erro de CORS.'
        };
      }

      return { 
        success: false, 
        error: 'Erro na verificação',
        details: error.message || 'Erro desconhecido. Tente novamente.'
      };
    }
  };

  const deleteDomain = async () => {
    if (!domain?.id) return { success: false, error: 'No domain configured' };

    try {
      const { error } = await supabase
        .from('user_domains')
        .delete()
        .eq('id', domain.id);

      if (error) throw error;
      
      setDomain(null);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    domain,
    isLoading,
    getPageUrl,
    getCloakingUrl,
    saveDomain,
    verifyDomain,
    deleteDomain,
    refetch: fetchDomain,
  };
}
