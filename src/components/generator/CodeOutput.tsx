import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GeneratorConfig } from '@/types/generator';
import { generateHtml } from '@/lib/generateHtml';
import { Copy, Download, Check, Code, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { captureScreenshot } from '@/lib/api/screenshot';

interface CodeOutputProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
}

export function CodeOutput({ config, onConfigChange }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!config.landingUrl) {
      toast({
        title: 'URL necessária',
        description: 'Insira a URL da página de origem primeiro.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const [desktopResult, mobileResult] = await Promise.all([
        captureScreenshot(config.landingUrl, 'desktop'),
        captureScreenshot(config.landingUrl, 'mobile'),
      ]);

      let updatedConfig = { ...config };

      if (desktopResult.success && desktopResult.screenshot) {
        // Check if it's already a URL or base64
        const screenshot = desktopResult.screenshot;
        if (screenshot.startsWith('http') || screenshot.startsWith('data:')) {
          updatedConfig.desktopScreenshot = screenshot;
        } else {
          updatedConfig.desktopScreenshot = `data:image/png;base64,${screenshot}`;
        }
      }

      if (mobileResult.success && mobileResult.screenshot) {
        const screenshot = mobileResult.screenshot;
        if (screenshot.startsWith('http') || screenshot.startsWith('data:')) {
          updatedConfig.mobileScreenshot = screenshot;
        } else {
          updatedConfig.mobileScreenshot = `data:image/png;base64,${screenshot}`;
        }
      }

      onConfigChange(updatedConfig);

      const html = generateHtml(updatedConfig);
      setGeneratedHtml(html);

      toast({
        title: 'Página gerada!',
        description: 'HTML pronto para download.',
      });
    } catch (error) {
      console.error('Error generating:', error);
      toast({
        title: 'Erro ao gerar',
        description: 'Falha ao processar. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedHtml) return;
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'O HTML foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presell-page.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download iniciado!',
      description: 'O arquivo presell-page.html foi baixado.',
    });
  };

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Gerar Página</h3>
        </div>
      </div>

      {!generatedHtml ? (
      <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Clique no botão abaixo para gerar o HTML da página.
          </p>
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !config.landingUrl}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Página
              </>
            )}
          </Button>
          {!config.landingUrl && (
            <p className="text-xs text-destructive mt-2">
              Insira a URL de origem primeiro
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            
            <Button
              size="sm"
              onClick={handleDownload}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Baixar .html
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 ml-auto"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Regenerar
            </Button>
          </div>
          
          <div className="relative">
            <pre className="bg-background rounded-lg p-4 overflow-auto max-h-[400px] text-sm font-mono text-muted-foreground border border-border">
              <code>{generatedHtml}</code>
            </pre>
            
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-lg" />
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            HTML pronto para upload • Sem dependências externas • Compatível com qualquer hospedagem
          </p>
        </>
      )}
    </div>
  );
}
