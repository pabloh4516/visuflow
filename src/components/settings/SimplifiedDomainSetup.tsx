import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Globe, CheckCircle2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserDomain } from '@/hooks/useUserDomain';

export function SimplifiedDomainSetup() {
  const { domain, isLoading, saveDomain, verifyDomain } = useUserDomain();
  const [domainInput, setDomainInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!domainInput.includes('.')) return toast.error('Domínio inválido');
    setIsSaving(true);
    const res = await saveDomain(domainInput.trim());
    setIsSaving(false);
    if (res?.success) toast.success('Domínio salvo!');
    else toast.error(res?.error || 'Erro ao salvar');
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {!domain ? (
        <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Globe className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-bold">Conectar seu Domínio</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Use seu próprio domínio para passar mais autoridade e profissionalismo nos seus links.
            </p>
            <div className="flex gap-2 mt-6">
              <Input 
                placeholder="ex: go.meusite.com" 
                value={domainInput} 
                onChange={e => setDomainInput(e.target.value)}
                className="bg-white"
              />
              <Button onClick={handleAdd} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Conectar'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Domínio Atual</p>
              <h3 className="text-2xl font-bold">{domain.domain}</h3>
            </div>
            {domain.is_verified ? (
              <div className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-green-500/30">
                <CheckCircle2 size={18} /> Ativo
              </div>
            ) : (
              <div className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-amber-500/30">
                <AlertCircle size={18} /> Pendente
              </div>
            )}
          </div>

          <div className="p-6 bg-white space-y-6">
            {!domain.is_verified && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-blue-800 font-bold text-sm mb-3">Siga estes passos no seu provedor de DNS:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tipo</span>
                      <span className="font-mono font-bold text-slate-700 text-lg">A</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Nome</span>
                      <span className="font-mono font-bold text-slate-700 text-lg">@</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor (IP)</span>
                      <span className="font-mono font-bold text-primary text-lg">77.111.101.142</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full py-6 text-lg font-bold" onClick={() => verifyDomain()}>
                  <RefreshCw className="mr-2" size={20} /> Verificar Conexão Agora
                </Button>
              </div>
            )}
            
            {domain.is_verified && (
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-green-800 font-medium">Tudo pronto! Seus links agora usam seu domínio próprio.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
