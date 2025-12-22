import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloakingConfig } from '@/types/cloaking';
import { 
  Shield, 
  Copy, 
  Check, 
  ExternalLink, 
  BarChart3, 
  Trash2,
  Bot,
  FileText,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface CloakingCardProps {
  config: CloakingConfig;
  cloakingUrl: string;
  onViewReport: () => void;
  onDelete: () => Promise<void>;
}

export function CloakingCard({ config, cloakingUrl, onViewReport, onDelete }: CloakingCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(cloakingUrl);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const getBotActionLabel = (action: string) => {
    switch (action) {
      case 'fake_page': return 'Página Fake';
      case 'redirect': return 'Redirecionamento';
      case 'block': return 'Bloqueio';
      default: return action;
    }
  };

  const getBotActionIcon = (action: string) => {
    switch (action) {
      case 'fake_page': return <FileText className="h-3 w-3" />;
      case 'redirect': return <ExternalLink className="h-3 w-3" />;
      case 'block': return <Bot className="h-3 w-3" />;
      default: return <Bot className="h-3 w-3" />;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{config.name}</h3>
              <p className="text-xs text-muted-foreground">
                Criado em {format(new Date(config.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            {getBotActionIcon(config.bot_action)}
            {getBotActionLabel(config.bot_action)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">URL de destino:</p>
          <a 
            href={config.redirect_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block"
          >
            {config.redirect_url}
          </a>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Link de Cloaking:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
              {cloakingUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
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

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={onViewReport}
          >
            <BarChart3 className="h-4 w-4" />
            Ver Relatório
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate(`/cloaking/${config.id}/bot-preview`)}
            title="Ver visão do bot"
          >
            <Bot className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate(`/cloaking/${config.id}/edit`)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Cloaking</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{config.name}"? Esta ação não pode ser desfeita
                  e todos os dados de métricas serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
