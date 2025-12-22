import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Eye, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
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
  {
    title: 'Config',
    icon: Settings,
    href: '/settings',
  },
];

export function MobileNav() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/cloaking') {
      return location.pathname.startsWith('/cloaking');
    }
    if (href === '/settings') {
      return location.pathname.startsWith('/settings');
    }
    return location.pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-sm safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  active && 'bg-primary/10'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
