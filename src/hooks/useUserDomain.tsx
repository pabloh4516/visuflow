import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserDomain() {
  const { user } = useAuth();
  const [domain, setDomain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDomain = useCallback(async () => {
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
      setDomain(data || null);
    } catch (error) {
      console.error('Erro ao buscar domínio:', error);
      setDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDomain();
  }, [fetchDomain]);

  const saveDomain = async (domainName: string) => {
    if (!user?.id) return { success: false, error: 'Não autenticado' };
    try {
      // 1. Salva no Supabase
      const { error: supabaseError } = await supabase
        .from('user_domains')
        .upsert({ 
          user_id: user.id, 
          domain: domainName, 
          is_verified: false,
          provider: 'vps_a_record' 
        });
      if (supabaseError) throw supabaseError;

      // 2. Salva na API da VPS
      await fetch('https://api.visuflow.online/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainName, user_id: user.id } )
      });

      await fetchDomain();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const verifyDomain = async () => {
    if (!domain?.domain) return { success: false, error: 'Sem domínio' };
    try {
      const response = await fetch('https://api.visuflow.online/api/check-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.domain } )
      });
      const result = await response.json();
      if (result.verified) {
        await supabase.from('user_domains').update({ is_verified: true }).eq('id', domain.id);
        await fetchDomain();
        return { success: true };
      }
      return { success: false, error: 'DNS ainda não aponta para o IP 77.111.101.142' };
    } catch (error) {
      return { success: false, error: 'Erro na verificação' };
    }
  };

  return { domain, isLoading, saveDomain, verifyDomain, refetch: fetchDomain };
}
