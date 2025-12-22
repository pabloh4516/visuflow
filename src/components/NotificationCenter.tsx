import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Bot, Globe, Lightbulb, Check, X, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'bot' | 'domain' | 'tip';
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  read: boolean;
  data?: {
    detection_type?: string;
    detection_reason?: string;
    page_id?: string;
    cloaking_id?: string;
  };
}

const iconMap = {
  bot: Bot,
  domain: Globe,
  tip: Lightbulb,
};

const colorMap = {
  bot: 'text-destructive bg-destructive/10',
  domain: 'text-success bg-success/10',
  tip: 'text-primary bg-primary/10',
};

const STORAGE_KEY = 'visuflow-notifications';
const MAX_NOTIFICATIONS = 20;

export function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  // Subscribe to realtime bot detections
  useEffect(() => {
    const channel = supabase
      .channel('bot-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bot_detections',
        },
        (payload) => {
          const detection = payload.new as {
            id: string;
            detection_type: string;
            detection_reason: string;
            page_id: string | null;
            cloaking_id: string | null;
            blocked: boolean;
            detected_at: string;
          };

          // Only notify for blocked bots
          if (!detection.blocked) return;

          const newNotification: Notification = {
            id: detection.id,
            type: 'bot',
            title: '🤖 Bot Detectado!',
            message: `${detection.detection_type}: ${detection.detection_reason}`,
            time: 'Agora',
            timestamp: new Date(detection.detected_at),
            read: false,
            data: {
              detection_type: detection.detection_type,
              detection_reason: detection.detection_reason,
              page_id: detection.page_id || undefined,
              cloaking_id: detection.cloaking_id || undefined,
            },
          };

          setNotifications((prev) => {
            const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
            return updated;
          });

          // Show toast notification
          toast.warning('Bot detectado e bloqueado!', {
            description: detection.detection_reason,
            icon: <Shield className="h-4 w-4 text-destructive" />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update relative times periodically
  useEffect(() => {
    const updateTimes = () => {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          time: formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ptBR }),
        }))
      );
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setOpen(false);
    
    if (notification.data?.cloaking_id) {
      navigate(`/cloaking/${notification.data.cloaking_id}`);
    } else if (notification.data?.page_id) {
      navigate(`/dashboard?page=${notification.data.page_id}`);
    }
  };

  const isClickable = (notification: Notification) => {
    return !!(notification.data?.page_id || notification.data?.cloaking_id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="font-semibold text-sm">Notificações</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Ler todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
              <p className="text-xs mt-1">Detecções de bots aparecerão aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                const clickable = isClickable(notification);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors cursor-pointer group',
                      !notification.read && 'bg-muted/30',
                      clickable ? 'hover:bg-primary/10' : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                        colorMap[notification.type]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {clickable && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2 group-hover:text-primary transition-colors" />
                    )}
                    {!notification.read && !clickable && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
