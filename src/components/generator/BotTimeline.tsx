import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Bot, AlertTriangle, Download, Clock, Globe, Shield, Wrench, Info, HelpCircle, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplanation, getBlockedActionText, categoryInfo, INFORMATIONAL_REASONS } from '@/lib/botExplanations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BotDetection {
  id: string;
  detected_at: string;
  detection_type: string;
  user_agent: string | null;
  ip_address: string | null;
  detection_reason: string;
  blocked: boolean | null;
}

interface BotTimelineProps {
  detections: BotDetection[];
  pageId?: string;
  cloakingId?: string;
  onLogsDeleted?: () => void;
}

export function BotTimeline({ detections, pageId, cloakingId, onLogsDeleted }: BotTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'all' | 'before30d' | null }>({ open: false, type: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const allCount = detections.length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const before30dCount = detections.filter(d => new Date(d.detected_at) < thirtyDaysAgo).length;

  const handleDelete = async () => {
    if (!deleteDialog.type || (!pageId && !cloakingId)) return;
    setIsDeleting(true);

    try {
      let query = supabase.from('bot_detections').delete();
      
      if (pageId) {
        query = query.eq('page_id', pageId);
      } else if (cloakingId) {
        query = query.eq('cloaking_id', cloakingId);
      }

      if (deleteDialog.type === 'before30d') {
        query = query.lt('detected_at', thirtyDaysAgo.toISOString());
      }

      const { error } = await query;

      if (error) throw error;

      const labels: Record<string, string> = {
        all: 'Todos os logs removidos',
        before30d: 'Logs antigos removidos',
      };

      toast.success(labels[deleteDialog.type]);
      onLogsDeleted?.();
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Erro ao remover logs');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, type: null });
    }
  };

  const getDeleteDescription = () => {
    switch (deleteDialog.type) {
      case 'all':
        return `Isso removerá TODOS os ${allCount} logs de detecção desta página. Esta ação não pode ser desfeita.`;
      case 'before30d':
        return `Isso removerá ${before30dCount} logs anteriores a 30 dias. Esta ação não pode ser desfeita.`;
      default:
        return '';
    }
  };

  const filteredDetections = filter === 'all' 
    ? detections 
    : detections.filter(d => d.detection_type === filter);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const exportToCsv = () => {
    const headers = ['Data/Hora', 'Tipo', 'Motivo', 'User-Agent', 'IP', 'Bloqueado'];
    const rows = filteredDetections.map(d => [
      formatDateTime(d.detected_at),
      d.detection_type,
      d.detection_reason,
      d.user_agent || '',
      d.ip_address || '',
      d.blocked ? 'Sim' : 'Não',
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-detections-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDetectionIcon = (type: string) => {
    switch (type) {
      case 'devtools':
        return <Wrench className="w-4 h-4 text-purple-500" />;
      case 'cloaking':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bot className="w-4 h-4 text-blue-500" />;
    }
  };

  const getDetectionColor = (type: string) => {
    switch (type) {
      case 'devtools':
        return 'bg-purple-500/10';
      case 'cloaking':
        return 'bg-orange-500/10';
      default:
        return 'bg-blue-500/10';
    }
  };

  const getDetectionBadgeColor = (type: string) => {
    switch (type) {
      case 'devtools':
        return 'bg-purple-500/10 text-purple-500';
      case 'cloaking':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  if (detections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Nenhum bot detectado nesta página</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Timeline de Detecções</h4>
            <span className="text-sm text-muted-foreground">({filteredDetections.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cloaking">Cloaking</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="devtools">DevTools</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Gerenciar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem
                  onClick={() => setDeleteDialog({ open: true, type: 'before30d' })}
                  disabled={before30dCount === 0}
                >
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  Limpar {'>'} 30 dias ({before30dCount})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialog({ open: true, type: 'all' })}
                  disabled={allCount === 0}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todos ({allCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={exportToCsv}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredDetections.map((detection, index) => {
            const explanation = getExplanation(detection.detection_reason);
            const catInfo = categoryInfo[explanation.category];
            const CatIcon = catInfo.icon;
            
            return (
              <Card 
                key={detection.id} 
                className={cn(
                  "p-3 transition-colors hover:bg-secondary/30",
                  index === 0 && "border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-help",
                        getDetectionColor(detection.detection_type)
                      )}>
                        {getDetectionIcon(detection.detection_type)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[280px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{catInfo.name}</p>
                        <p className="text-xs text-muted-foreground">{catInfo.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatDateTime(detection.detected_at)}
                      </span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        getDetectionBadgeColor(detection.detection_type)
                      )}>
                        {detection.detection_type.toUpperCase()}
                      </span>
                      {detection.blocked ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium cursor-help flex items-center gap-1">
                              BLOQUEADO
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[250px]">
                            <p className="text-xs">{getBlockedActionText(detection.detection_type, true)}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : explanation.isInformational ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium cursor-help flex items-center gap-1">
                              INFORMATIVO
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[280px]">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-emerald-400">✓ Usuário NÃO foi bloqueado</p>
                              <p className="text-xs">Característica normal em navegadores modernos (Safari, Firefox). Dados coletados apenas para análise.</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium text-foreground cursor-help flex items-center gap-1.5">
                            {explanation.name}
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[300px]">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CatIcon className={cn("w-4 h-4", catInfo.color)} />
                              <span className="font-semibold">{explanation.name}</span>
                            </div>
                            <p className="text-xs">{explanation.description}</p>
                            <div className="pt-1 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Ação:</span> {explanation.action}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {detection.detection_reason}
                    </p>
                    
                    {detection.user_agent && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={detection.user_agent}>
                        {detection.detection_type === 'devtools' ? '👤' : '🤖'} {detection.user_agent}
                      </p>
                    )}
                    
                    {detection.ip_address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {detection.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>{getDeleteDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
