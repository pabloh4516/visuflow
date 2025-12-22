import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Edit, Download, BarChart3, Trash2, ExternalLink } from 'lucide-react';

interface PageActionsProps {
  onDuplicate: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onViewReport: () => void;
  onDelete: () => void;
  onCopyLink?: () => void;
}

export function PageActions({
  onDuplicate,
  onEdit,
  onDownload,
  onViewReport,
  onDelete,
  onCopyLink,
}: PageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onDuplicate} className="gap-2">
          <Copy className="w-4 h-4" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewReport} className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Ver Relatório
        </DropdownMenuItem>
        {onCopyLink && (
          <DropdownMenuItem onClick={onCopyLink} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Copiar Link
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
