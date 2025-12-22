import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Eye,
  Settings,
  Globe,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserDomain } from '@/hooks/useUserDomain';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const mainNavItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Páginas',
    icon: FileText,
    href: '/app',
  },
  {
    title: 'Cloaking',
    icon: Eye,
    href: '/cloaking',
  },
];

const settingsNavItems = [
  {
    title: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Domínio',
    icon: Globe,
    href: '/settings/domain',
  },
];

const helpLinks = [
  {
    title: 'Ajuda',
    icon: HelpCircle,
    href: '/help',
  },
  {
    title: 'Documentação',
    icon: BookOpen,
    href: 'https://docs.visuflow.com',
    external: true,
  },
];

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const { domain, isLoading: domainLoading } = useUserDomain();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/cloaking') {
      return location.pathname.startsWith('/cloaking');
    }
    if (href === '/settings') {
      return location.pathname === '/settings';
    }
    return location.pathname === href;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const NavItem = ({ item, showBadge }: { item: typeof mainNavItems[0] & { external?: boolean }; showBadge?: React.ReactNode }) => {
    const active = isActive(item.href);
    const content = (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
          active
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {showBadge}
          </>
        )}
      </div>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {'external' in item && item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link to={item.href}>{content}</Link>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if ('external' in item && item.external) {
      return (
        <a href={item.href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return <Link to={item.href}>{content}</Link>;
  };

  const DomainBadge = () => {
    if (domainLoading) return null;
    if (!domain) return null;
    
    return domain.is_verified ? (
      <CheckCircle2 className="h-4 w-4 text-success" />
    ) : (
      <AlertCircle className="h-4 w-4 text-warning" />
    );
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-sidebar-border', collapsed && 'justify-center px-2')}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-sidebar-foreground">VisuFlow</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Configurações
          </p>
        )}
        <nav className="space-y-1">
          {settingsNavItems.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              showBadge={item.href === '/settings/domain' ? <DomainBadge /> : undefined}
            />
          ))}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

        <nav className="space-y-1">
          {helpLinks.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full mt-2 text-muted-foreground', collapsed && 'px-2')}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="ml-2">Recolher</span>}
        </Button>
      </div>
    </aside>
  );
}
