import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FileText,
  Eye,
  Settings,
  Globe,
  Plus,
  Search,
  Keyboard,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Nova Página',
    icon: Plus,
    shortcut: 'N',
    action: '/app',
  },
  {
    title: 'Novo Cloaking',
    icon: Eye,
    shortcut: 'C',
    action: '/cloaking/new',
  },
];

const navigation = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    shortcut: 'G D',
    action: '/dashboard',
  },
  {
    title: 'Páginas',
    icon: FileText,
    shortcut: 'G P',
    action: '/app',
  },
  {
    title: 'Cloaking',
    icon: Eye,
    shortcut: 'G C',
    action: '/cloaking',
  },
  {
    title: 'Configurações',
    icon: Settings,
    shortcut: 'G S',
    action: '/settings',
  },
  {
    title: 'Domínio',
    icon: Globe,
    action: '/settings/domain',
  },
  {
    title: 'Ajuda',
    icon: HelpCircle,
    action: '/help',
  },
];

const helpArticles = [
  { title: 'Como criar uma landing page', action: '/help', keywords: ['criar', 'página', 'landing'] },
  { title: 'O que é cloaking', action: '/help', keywords: ['cloaking', 'o que é'] },
  { title: 'Configurar domínio Cloudflare', action: '/help', keywords: ['cloudflare', 'domínio', 'dns'] },
  { title: 'Tipos de popups', action: '/help', keywords: ['popup', 'modal', 'sidebar', 'banner'] },
  { title: 'Proteção anti-bot', action: '/help', keywords: ['bot', 'proteção', 'segurança'] },
  { title: 'Atalhos de teclado', action: '/help', keywords: ['atalhos', 'keyboard', 'shortcuts'] },
];

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();

  const runCommand = (action: string) => {
    onOpenChange(false);
    navigate(action);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas, ações, ajuda..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p>Nenhum resultado encontrado</p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="Ações Rápidas">
          {quickActions.map((item) => (
            <CommandItem
              key={item.title}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1">{item.title}</span>
              {item.shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navegação">
          {navigation.map((item) => (
            <CommandItem
              key={item.title}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{item.title}</span>
              {item.shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Artigos de Ajuda">
          {helpArticles.map((article) => (
            <CommandItem
              key={article.title}
              onSelect={() => runCommand(article.action)}
              className="flex items-center gap-3"
              keywords={article.keywords}
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{article.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Atalhos">
          <CommandItem className="flex items-center gap-3 opacity-60 cursor-default">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Pressione ? para ver todos os atalhos</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
