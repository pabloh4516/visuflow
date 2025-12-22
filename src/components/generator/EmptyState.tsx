import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconClassName?: string;
  variant?: 'default' | 'success' | 'primary';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconClassName,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: 'from-primary/20 to-accent/20',
    success: 'from-green-500/20 to-emerald-500/20',
    primary: 'from-primary/30 to-primary/10'
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-green-500',
    primary: 'text-primary'
  };

  return (
    <div className="text-center py-16 animate-fade-in">
      <div className={cn(
        "inline-flex items-center justify-center w-28 h-28 rounded-3xl mb-6 relative",
        "bg-gradient-to-br",
        variantStyles[variant]
      )}>
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
        <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />
        
        <Icon className={cn(
          "w-14 h-14 relative z-10 animate-float",
          iconColors[variant],
          iconClassName
        )} />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {title}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '150ms' }}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Button 
            onClick={onAction} 
            size="lg" 
            className="gap-2 hover-lift"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}