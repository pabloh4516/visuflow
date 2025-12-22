import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';

export function PageCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card 
      className="overflow-hidden border-border/50 animate-fade-in"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Screenshot area with shimmer effect */}
      <div className="aspect-video bg-gradient-to-br from-secondary via-muted to-secondary relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-60" />
        {/* Badge placeholders */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-background/30 backdrop-blur-sm animate-pulse" />
        </div>
        <div className="absolute top-3 right-3">
          <div className="h-6 w-16 rounded-full bg-background/30 backdrop-blur-sm animate-pulse" />
        </div>
        {/* Centered icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-muted/30 animate-pulse" />
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title & badges row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-10 rounded bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-muted/80 animate-pulse" style={{ animationDelay: '100ms' }} />
          </div>
          <div className="h-4 w-14 rounded bg-muted/60 animate-pulse" style={{ animationDelay: '150ms' }} />
        </div>
        
        {/* Page name */}
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" style={{ animationDelay: '200ms' }} />
        
        {/* URL */}
        <div className="h-4 w-full rounded bg-muted/60 animate-pulse" style={{ animationDelay: '250ms' }} />
        
        {/* Metrics row */}
        <div className="flex items-center gap-3 border-t border-border/30 pt-3">
          <div className="h-4 w-12 rounded bg-muted/50 animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="h-4 w-12 rounded bg-muted/50 animate-pulse" style={{ animationDelay: '350ms' }} />
          <div className="h-4 w-10 rounded bg-muted/50 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </Card>
  );
}

export function OverviewCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card 
      className="p-5 border-border/50 animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-secondary animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" style={{ animationDelay: '100ms' }} />
        </div>
        <div className="h-6 w-14 rounded-full bg-muted/40 animate-pulse" style={{ animationDelay: '150ms' }} />
      </div>
    </Card>
  );
}

export function BotCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card 
      className="p-4 border-border/50 animate-fade-in"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-secondary animate-pulse flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-3 w-72 rounded bg-muted/60 animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="flex items-center gap-3">
              <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-5 w-16 rounded bg-muted/40 animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="h-4 w-10 rounded bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded bg-muted/50 animate-pulse" style={{ animationDelay: '100ms' }} />
        </div>
      </div>
    </Card>
  );
}

export const DashboardPagesSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PageCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
});
DashboardPagesSkeleton.displayName = 'DashboardPagesSkeleton';

export const DashboardOverviewSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <OverviewCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
});
DashboardOverviewSkeleton.displayName = 'DashboardOverviewSkeleton';

export const DashboardBotsSkeleton = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <BotCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
});
DashboardBotsSkeleton.displayName = 'DashboardBotsSkeleton';
