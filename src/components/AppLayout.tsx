import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { SearchCommand } from '@/components/SearchCommand';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useKeyboardShortcuts, useGoShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/app': 'Páginas',
  '/cloaking': 'Cloaking',
  '/cloaking/new': 'Novo Cloaking',
  '/settings': 'Configurações',
  '/settings/domain': 'Domínio',
  '/help': 'Ajuda',
};

// Special route patterns for dynamic segments
const getRouteLabel = (path: string, segment: string): string => {
  // Check for edit pattern
  if (path.includes('/edit')) return 'Editar';
  // Check for bot-preview pattern
  if (path.includes('/bot-preview')) return 'Visão do Bot';
  // Check for dynamic cloaking ID (report page)
  if (path.match(/^\/cloaking\/[0-9a-f-]+$/i)) return 'Relatório';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
  });
  useGoShortcuts();

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { href: string; label: string; isLast: boolean }[] = [];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Skip dynamic segments (like :id)
      if (segment.match(/^[0-9a-f-]+$/i) && segment.length > 10) {
        breadcrumbs.push({
          href: currentPath,
          label: 'Detalhes',
          isLast,
        });
      } else {
        const label = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          href: currentPath,
          label,
          isLast,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4 gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <AppSidebar collapsed={false} onCollapsedChange={() => {}} />
            </SheetContent>
          </Sheet>

          {/* Search Button */}
          <Button
            variant="outline"
            className="flex-1 max-w-md justify-start text-muted-foreground gap-2 bg-muted/50 border-border/50"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
              ⌘K
            </kbd>
          </Button>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="border-b border-border/50 px-4 py-2 bg-muted/30">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={crumb.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Search Command */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
