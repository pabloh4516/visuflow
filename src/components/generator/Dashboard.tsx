import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download, Eye, Clock, Globe, Bot, Shield, 
  AlertTriangle, Sparkles, Copy, ExternalLink, CheckCircle2, 
  XCircle, Activity, Zap, Plus, BarChart3, TrendingUp, Trash2,
  Pencil, Check, X, FileText, Wrench, Calendar, Info, Settings, RefreshCw,
  Folder, Tag as TagIcon
} from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageMetrics } from './PageMetrics';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { OverviewCards } from './OverviewCards';
import { DashboardFilters, type SortOption } from './DashboardFilters';
import { DashboardPagesSkeleton, DashboardBotsSkeleton, DashboardOverviewSkeleton } from './DashboardSkeleton';
import { EmptyState } from './EmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshButton } from '@/components/ui/refresh-button';
import { getExplanation, getBlockedActionText, categoryInfo, INFORMATIONAL_REASONS, type BotExplanation } from '@/lib/botExplanations';
import { BotProtectionConfig } from '@/types/generator';
import { useUserDomain } from '@/hooks/useUserDomain';
import { Link as LinkIcon } from 'lucide-react';
import { useGroupsAndTags } from '@/hooks/useGroupsAndTags';
import { Tag, PageGroup, TagBadge, GroupBadge, GROUP_COLORS, GroupColor } from './TagBadge';
import { GroupTagManager } from './GroupTagManager';
import { PageTagsEditor } from './PageTagsEditor';

interface PageBotProtectionConfig extends Partial<BotProtectionConfig> {
  [key: string]: unknown;
}

interface GeneratedPage {
  id: string;
  name: string | null;
  landing_url: string;
  redirect_url: string;
  popup_type: string;
  popup_template: number;
  /**
   * Conteúdo HTML é pesado, então só buscamos sob demanda (baixar/editar).
   */
  html_content?: string;
  desktop_screenshot: string | null;
  created_at: string;
  /**
   * Config pode ser grande; no dashboard ela é buscada apenas ao editar/duplicar.
   */
  config?: any;
  bot_protection_config?: PageBotProtectionConfig | null;
  group_id: string | null;
}

interface PageStats {
  views: number;
  redirects: number;
  conversionRate: number;
}

interface BotDetection {
  id: string;
  page_id: string | null;
  detected_at: string;
  detection_type: string;
  user_agent: string | null;
  ip_address: string | null;
  detection_reason: string;
  blocked: boolean;
}

interface PageEvent {
  id: string;
  page_id: string | null;
  event_type: string;
  is_human: boolean;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { domain: userDomain, getCloakingUrl, getPageUrl } = useUserDomain();
  const { 
    groups, 
    setGroups, 
    tags, 
    setTags, 
    getTagsForPage,
    getGroupById,
    updatePageTags,
    refresh: refreshGroupsTags 
  } = useGroupsAndTags();
  
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [botDetections, setBotDetections] = useState<BotDetection[]>([]);
  const [pageEvents, setPageEvents] = useState<PageEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<GeneratedPage | null>(null);
  const [activeTab, setActiveTab] = useState('pages');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [viewingMetrics, setViewingMetrics] = useState<GeneratedPage | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Date range for overview cards
  const [overviewDateRange, setOverviewDateRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });
  
  // Inline rename state
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [popupFilter, setPopupFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Group and tag filters
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Log management state
  const [deleteLogsDialog, setDeleteLogsDialog] = useState<{ 
    open: boolean; 
    type: 'informational' | 'all' | 'before30d' | null 
  }>({ open: false, type: null });
  const [isDeletingLogs, setIsDeletingLogs] = useState(false);

  const getBotCountForPage = (pageId: string) => {
    return botDetections.filter(b => b.page_id === pageId && b.blocked).length;
  };


  // Get stats for a specific page
  const getPageStats = (pageId: string): PageStats => {
    const pageEventsForPage = pageEvents.filter(e => e.page_id === pageId);
    const views = pageEventsForPage.filter(e => e.event_type === 'view').length;
    const redirects = pageEventsForPage.filter(e => e.event_type === 'redirect').length;
    const conversionRate = views > 0 ? Math.round((redirects / views) * 100) : 0;
    return { views, redirects, conversionRate };
  };

  // Memoize all page stats for sorting
  const pageStatsMap = useMemo(() => {
    const map = new Map<string, PageStats>();
    pages.forEach(p => {
      map.set(p.id, getPageStats(p.id));
    });
    return map;
  }, [pages, pageEvents]);

  // Get protection badges for a page
  const getProtectionBadges = (config: PageBotProtectionConfig | null | undefined) => {
    const badges: Array<{ label: string; icon: string; color: string; details: string[] }> = [];
    
    if (!config) return badges;
    
    if (config.cleanMode) {
      badges.push({
        label: 'Código Limpo',
        icon: '🧹',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        details: ['Sem ofuscação', 'Compatível com Ad Platforms']
      });
    }
    
    if (config.enableCloaking) {
      const cloakingDetails = ['Cloaking ativo'];
      if (config.blockKnownBots) cloakingDetails.push('Bloqueia bots conhecidos');
      if (config.blockDataCenters) cloakingDetails.push('Bloqueia datacenters');
      badges.push({
        label: 'Cloaking',
        icon: '🔒',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        details: cloakingDetails
      });
    }
    
    if (config.enableFrontendDetection) {
      const detectionDetails: string[] = [];
      if (config.detectWebdriver) detectionDetails.push('✅ Webdriver');
      if (config.detectHeadless) detectionDetails.push('✅ Headless');
      if (config.detectCanvas) detectionDetails.push('✅ Canvas');
      if (config.detectWebGL) detectionDetails.push('✅ WebGL');
      if (config.detectTiming) detectionDetails.push('✅ Timing');
      if (config.detectAdPlatformBots) detectionDetails.push('✅ Ad Platform Bots');
      if (config.detectAutomationTools) detectionDetails.push('✅ Automation Tools');
      if (config.detectBehavior) detectionDetails.push('✅ Behavioral');
      badges.push({
        label: 'Frontend',
        icon: '🛡️',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        details: detectionDetails.length > 0 ? detectionDetails : ['Detecção básica']
      });
    }
    
    if (config.enableDevToolsDetection) {
      badges.push({
        label: 'DevTools',
        icon: '🔧',
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        details: ['Bloqueia F12 e Ctrl+Shift+I']
      });
    }
    
    return badges;
  };


  useEffect(() => {
    fetchData();
  }, [analyticsPeriod]);

  // Handle page query param from notification click
  useEffect(() => {
    const pageId = searchParams.get('page');
    if (pageId && pages.length > 0) {
      const page = pages.find(p => p.id === pageId);
      if (page) {
        setViewingMetrics(page);
        setActiveTab('pages');
        // Clear the query param to avoid re-triggering
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, pages, setSearchParams]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const days = analyticsPeriod === '7d' ? 7 : analyticsPeriod === '30d' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Fetch pages first (critical for UI) with minimal fields including group_id
      const pagesRes = await supabase
        .from('generated_pages')
        .select('id, name, landing_url, redirect_url, popup_type, popup_template, desktop_screenshot, created_at, bot_protection_config, group_id')
        .order('created_at', { ascending: false })
        .limit(50);

      if (pagesRes.error) throw pagesRes.error;
      setPages((pagesRes.data || []) as unknown as GeneratedPage[]);
      setIsLoading(false); // Show pages immediately

      // Fetch bots and events in parallel (background) - only minimal fields needed for counts
      const [botsRes, eventsRes] = await Promise.all([
        supabase
          .from('bot_detections')
          .select('id, page_id, detected_at, detection_type, user_agent, ip_address, detection_reason, blocked')
          .eq('blocked', true)
          .gte('detected_at', cutoffDate.toISOString())
          .order('detected_at', { ascending: false })
          .limit(200),
        supabase
          .from('page_events')
          .select('id, page_id, event_type, device_type, created_at')
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      if (!botsRes.error) {
        setBotDetections(botsRes.data || []);
      }
      if (!eventsRes.error) {
        setPageEvents((eventsRes.data || []) as PageEvent[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPages(pages.filter(p => p.id !== id));
      toast.success('Página removida');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erro ao remover página');
    }
  };

  const handleDownload = async (page: GeneratedPage) => {
    try {
      toast.loading('Baixando...', { id: 'download' });
      
      // Fetch html_content only when downloading
      const { data, error } = await supabase
        .from('generated_pages')
        .select('html_content')
        .eq('id', page.id)
        .single();
      
      if (error || !data) throw error;
      
      const blob = new Blob([data.html_content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = page.name || `presell-${page.popup_type}`;
      a.download = `${fileName}-${new Date(page.created_at).toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Arquivo baixado!', { id: 'download' });
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Erro ao baixar', { id: 'download' });
    }
  };

  const handleDuplicate = async (page: GeneratedPage) => {
    try {
      toast.loading('Carregando para duplicar...', { id: 'dup' });

      // Fetch config only when needed (keeps dashboard load fast)
      const { data, error } = await supabase
        .from('generated_pages')
        .select('config, bot_protection_config')
        .eq('id', page.id)
        .single();

      if (error || !data) throw error;

      navigate('/app', {
        state: {
          page: {
            ...page,
            id: undefined,
            config: data.config,
            bot_protection_config: data.bot_protection_config,
          },
          mode: 'duplicate',
        },
      });

      toast.info('Duplicando página...', { id: 'dup' });
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Erro ao preparar duplicação', { id: 'dup' });
    }
  };

  const handleEdit = async (page: GeneratedPage) => {
    const loadingToast = toast.loading('Carregando página...');
    try {
      // Fetch config + screenshots from separate columns (screenshots removed from config for optimization)
      const { data, error } = await supabase
        .from('generated_pages')
        .select('config, bot_protection_config, desktop_screenshot, mobile_screenshot')
        .eq('id', page.id)
        .single();

      if (error || !data) throw error;

      toast.dismiss(loadingToast);
      navigate('/app', {
        state: {
          page: {
            ...page,
            config: data.config,
            bot_protection_config: data.bot_protection_config,
            // Pass screenshots from separate columns so AppGenerator can load them
            desktop_screenshot: data.desktop_screenshot,
            mobile_screenshot: data.mobile_screenshot,
          },
          mode: 'edit',
        },
      });
    } catch (error) {
      console.error('Error loading page:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao carregar página');
    }
  };

  const handleClearBots = async () => {
    try {
      const { error } = await supabase.from('bot_detections').delete().not('id', 'is', null);
      if (error) throw error;
      setBotDetections([]);
      toast.success('Logs de bots limpos');
    } catch (error) {
      console.error('Error clearing bot logs:', error);
      toast.error('Erro ao limpar logs');
    }
  };

  const handleDeleteLogs = async () => {
    if (!deleteLogsDialog.type) return;
    setIsDeletingLogs(true);
    
    try {
      if (deleteLogsDialog.type === 'informational') {
        // Delete only informational (non-blocked) - preserves real bots
        const { error } = await supabase
          .from('bot_detections')
          .delete()
          .eq('blocked', false);
        if (error) throw error;
      } else if (deleteLogsDialog.type === 'before30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { error } = await supabase
          .from('bot_detections')
          .delete()
          .lt('detected_at', thirtyDaysAgo.toISOString());
        if (error) throw error;
      } else {
        // For 'all' - use valid condition that matches all records
        const { error } = await supabase
          .from('bot_detections')
          .delete()
          .not('id', 'is', null);
        if (error) throw error;
      }
      
      toast.success('Logs removidos com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Erro ao remover logs');
    } finally {
      setIsDeletingLogs(false);
      setDeleteLogsDialog({ open: false, type: null });
    }
  };

  // Count logs older than 30 days
  const logsOlderThan30d = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return botDetections.filter(b => new Date(b.detected_at) < thirtyDaysAgo).length;
  }, [botDetections]);

  const handleCopyPageId = (pageId: string) => {
    navigator.clipboard.writeText(pageId);
    toast.success('ID copiado!');
  };

  const handleCopyCode = async (page: GeneratedPage) => {
    try {
      toast.loading('Carregando código...', { id: 'copy-code' });
      
      const { data, error } = await supabase
        .from('generated_pages')
        .select('html_content')
        .eq('id', page.id)
        .single();
      
      if (error || !data) throw error;
      
      await navigator.clipboard.writeText(data.html_content);
      toast.success('Código HTML copiado!', { id: 'copy-code' });
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error('Erro ao copiar código', { id: 'copy-code' });
    }
  };

  // Inline rename handlers
  const startRename = (page: GeneratedPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingName(page.name || '');
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(null);
    setEditingName('');
  };

  const saveRename = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('generated_pages')
        .update({ name: editingName.trim() || null })
        .eq('id', pageId);
      
      if (error) throw error;
      
      setPages(pages.map(p => 
        p.id === pageId ? { ...p, name: editingName.trim() || null } : p
      ));
      
      toast.success('Nome atualizado!');
    } catch (error) {
      console.error('Error renaming page:', error);
      toast.error('Erro ao renomear');
    } finally {
      setEditingPageId(null);
      setEditingName('');
    }
  };

  const popupTypeLabels: Record<string, string> = {
    cookies: '🍪 Cookies',
    country: '🌍 País',
    gender: '👤 Gênero',
    age: '🔞 Idade',
    captcha: '🤖 Captcha',
  };

  const popupTypeColors: Record<string, string> = {
    cookies: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    country: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gender: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    age: 'bg-red-500/20 text-red-400 border-red-500/30',
    captcha: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  // Calculate overview stats with date range filter
  const overviewStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter events by date range
    const filteredEvents = overviewDateRange?.from 
      ? pageEvents.filter(e => {
          const eventDate = new Date(e.created_at);
          return eventDate >= overviewDateRange.from! && 
                 (!overviewDateRange.to || eventDate <= overviewDateRange.to);
        })
      : pageEvents;
    
    const filteredBots = overviewDateRange?.from
      ? botDetections.filter(b => {
          const botDate = new Date(b.detected_at);
          return botDate >= overviewDateRange.from! && 
                 (!overviewDateRange.to || botDate <= overviewDateRange.to);
        })
      : botDetections;
    
    // Contar apenas bots reais (bloqueados) nos cards de overview
    const botsToday = filteredBots.filter(b => b.blocked && new Date(b.detected_at) >= todayStart).length;
    const totalBots = filteredBots.filter(b => b.blocked).length;
    
    const protectionRate = pages.length > 0 
      ? Math.round((pages.filter(p => p.bot_protection_config?.enableCloaking || p.bot_protection_config?.enableFrontendDetection).length / pages.length) * 100)
      : 0;

    // Novas métricas de tráfego
    const viewEvents = filteredEvents.filter(e => e.event_type === 'view');
    const totalViews = viewEvents.length;
    const totalRedirects = filteredEvents.filter(e => e.event_type === 'redirect').length;
    const totalInteractions = filteredEvents.filter(e => e.event_type === 'popup_interaction').length;
    const conversionRate = totalViews > 0 ? Math.round((totalRedirects / totalViews) * 100) : 0;

    // Device breakdown (apenas views)
    const mobileViews = viewEvents.filter(e => e.device_type === 'mobile').length;
    const desktopViews = viewEvents.filter(e => e.device_type === 'desktop').length;
    const mobilePercent = totalViews > 0 ? Math.round((mobileViews / totalViews) * 100) : 0;
    const desktopPercent = totalViews > 0 ? Math.round((desktopViews / totalViews) * 100) : 0;

    const stats = {
      totalPages: pages.length,
      totalBots,
      botsToday,
      protectionRate,
      totalViews,
      totalRedirects,
      totalInteractions,
      conversionRate,
      mobilePercent,
      desktopPercent,
    };
    
    return stats;
  }, [pages, botDetections, pageEvents, overviewDateRange]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success('Dados atualizados');
  };

  // Filtered and sorted pages
  const filteredPages = useMemo(() => {
    let result = [...pages];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.landing_url.toLowerCase().includes(query) || 
        p.redirect_url.toLowerCase().includes(query) ||
        (p.name && p.name.toLowerCase().includes(query))
      );
    }

    if (popupFilter !== 'all') {
      result = result.filter(p => p.popup_type === popupFilter);
    }

    // Group filter
    if (groupFilter !== 'all') {
      if (groupFilter === 'none') {
        result = result.filter(p => !p.group_id);
      } else {
        result = result.filter(p => p.group_id === groupFilter);
      }
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter(p => {
        const pageTags = getTagsForPage(p.id);
        return pageTags.some(t => t.id === tagFilter);
      });
    }

    if (periodFilter !== 'all') {
      const now = new Date();
      let cutoff: Date;
      
      switch (periodFilter) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7d':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      
      result = result.filter(p => new Date(p.created_at) >= cutoff);
    }

    // Sorting
    switch (sortBy) {
      case 'views':
        result.sort((a, b) => {
          const statsA = pageStatsMap.get(a.id) || { views: 0 };
          const statsB = pageStatsMap.get(b.id) || { views: 0 };
          return statsB.views - statsA.views;
        });
        break;
      case 'conversion':
        result.sort((a, b) => {
          const statsA = pageStatsMap.get(a.id) || { conversionRate: 0 };
          const statsB = pageStatsMap.get(b.id) || { conversionRate: 0 };
          return statsB.conversionRate - statsA.conversionRate;
        });
        break;
      case 'bots':
        result.sort((a, b) => getBotCountForPage(b.id) - getBotCountForPage(a.id));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [pages, searchQuery, popupFilter, periodFilter, sortBy, pageStatsMap, groupFilter, tagFilter, getTagsForPage]);

  // Memoize bot stats to avoid recalculation on every render
  const stats = useMemo(() => {
    const total = botDetections.length;
    const cloaking = botDetections.filter(b => b.detection_type === 'cloaking').length;
    const frontend = botDetections.filter(b => b.detection_type === 'frontend').length;
    
    const reasons: Record<string, number> = {};
    botDetections.forEach(b => {
      const reason = b.detection_reason.split(':')[0];
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return { total, cloaking, frontend, reasons };
  }, [botDetections]);

  if (viewingMetrics) {
    return <PageMetrics page={viewingMetrics} onBack={() => setViewingMetrics(null)} />;
  }

  // Handle quick group change from card
  const handleUpdatePageGroup = async (pageId: string, groupId: string | null) => {
    try {
      const { error } = await supabase
        .from('generated_pages')
        .update({ group_id: groupId })
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.map(p => p.id === pageId ? { ...p, group_id: groupId } : p));
      toast.success(groupId ? 'Página adicionada ao grupo!' : 'Página removida do grupo!');
    } catch (error) {
      console.error('Error updating page group:', error);
      toast.error('Erro ao atualizar grupo');
    }
  };

  // Handle quick tag toggle from card
  const handleTogglePageTag = async (pageId: string, tag: Tag, isCurrentlyTagged: boolean) => {
    try {
      if (isCurrentlyTagged) {
        // Remove tag
        const { error } = await supabase
          .from('page_tags')
          .delete()
          .eq('page_id', pageId)
          .eq('tag_id', tag.id);
        
        if (error) throw error;
        
        updatePageTags(pageId, getTagsForPage(pageId).filter(t => t.id !== tag.id));
        toast.success('Tag removida!');
      } else {
        // Add tag
        const { error } = await supabase
          .from('page_tags')
          .insert({ page_id: pageId, tag_id: tag.id });
        
        if (error) throw error;
        
        updatePageTags(pageId, [...getTagsForPage(pageId), tag]);
        toast.success('Tag adicionada!');
      }
    } catch (error) {
      console.error('Error toggling tag:', error);
      toast.error('Erro ao atualizar tag');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas páginas e monitore bots</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/settings/domain')} className="gap-2" size="sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Domínio</span>
              {userDomain?.is_verified && (
                <span className="w-2 h-2 rounded-full bg-success" />
              )}
            </Button>
            <Button onClick={() => navigate('/app')} className="gap-2 hover-lift" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Nova Página</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {isLoading ? (
          <DashboardOverviewSkeleton />
        ) : (
          <OverviewCards 
            totalPages={overviewStats.totalPages}
            totalBots={overviewStats.totalBots}
            botsToday={overviewStats.botsToday}
            protectionRate={overviewStats.protectionRate}
            totalViews={overviewStats.totalViews}
            totalRedirects={overviewStats.totalRedirects}
            totalInteractions={overviewStats.totalInteractions}
            conversionRate={overviewStats.conversionRate}
            mobilePercent={overviewStats.mobilePercent}
            desktopPercent={overviewStats.desktopPercent}
            dateRange={overviewDateRange}
            onDateRangeChange={setOverviewDateRange}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="mb-4 sm:mb-6 bg-secondary/50 p-1 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="pages" className="gap-1.5 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Páginas</span>
              <span className="xs:hidden">Pág</span>
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 rounded-full">
                {filteredPages.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="gap-1.5 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Proteção</span>
              <span className="xs:hidden">Bots</span>
              {stats.total > 0 && (
                <span className="ml-1 text-xs bg-red-500/20 text-red-400 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {stats.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="animate-fade-in">
            {/* Filters */}
            <div className="space-y-4 mb-6">
              <DashboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                popupFilter={popupFilter}
                onPopupFilterChange={setPopupFilter}
                periodFilter={periodFilter}
                onPeriodFilterChange={setPeriodFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
              
              {/* Group and Tag Filters */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <GroupTagManager 
                  onGroupsChange={setGroups}
                  onTagsChange={setTags}
                />
                
                {groups.length > 0 && (
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-[120px] sm:w-36 h-8 text-xs sm:text-sm">
                      <Folder className="w-3 h-3 mr-1 shrink-0" />
                      <SelectValue placeholder="Grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos grupos</SelectItem>
                      <SelectItem value="none">Sem grupo</SelectItem>
                      {groups.map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", `bg-${g.color}-500`)} />
                            <span className="truncate">{g.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {tags.length > 0 && (
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-[100px] sm:w-32 h-8 text-xs sm:text-sm">
                      <TagIcon className="w-3 h-3 mr-1 shrink-0" />
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas tags</SelectItem>
                      {tags.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", `bg-${t.color}-500`)} />
                            <span className="truncate">{t.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {isLoading ? (
              <DashboardPagesSkeleton />
            ) : filteredPages.length === 0 ? (
              pages.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Nenhuma página gerada"
                  description="Comece criando sua primeira página presell com proteção anti-bot e popups customizáveis"
                  actionLabel="Criar Primeira Página"
                  onAction={() => navigate('/app')}
                  variant="primary"
                />
              ) : (
                <EmptyState
                  icon={Globe}
                  title="Nenhum resultado encontrado"
                  description="Tente ajustar os filtros de busca ou criar uma nova página"
                  variant="default"
                />
              )
            ) : (
              <TooltipProvider>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPages.map((page, index) => (
                  <Card
                    key={page.id}
                    className={cn(
                      "overflow-hidden cursor-pointer group border-border/50 card-interactive",
                      "animate-fade-in",
                      selectedPage?.id === page.id && "ring-2 ring-primary shadow-lg shadow-primary/10"
                    )}
                    style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
                    onClick={() => setSelectedPage(selectedPage?.id === page.id ? null : page)}
                  >
                    {/* Screenshot Preview with Lazy Loading */}
                    <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                      {page.desktop_screenshot ? (
                        <>
                          {/* Blur placeholder shown while image loads */}
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted animate-pulse" />
                          <img 
                            src={page.desktop_screenshot} 
                            alt="Preview" 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 relative z-10"
                            onLoad={(e) => {
                              // Remove placeholder when image loads
                              const img = e.currentTarget;
                              img.previousElementSibling?.classList.add('opacity-0');
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Globe className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      {/* Status badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm",
                          popupTypeColors[page.popup_type] || "bg-secondary text-secondary-foreground"
                        )}>
                          {popupTypeLabels[page.popup_type] || page.popup_type}
                        </span>
                      </div>

                      {/* Protection badges with tooltips */}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[140px] justify-end">
                        {(() => {
                          const badges = getProtectionBadges(page.bot_protection_config);
                          if (badges.length === 0) {
                            return (
                              <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                Sem proteção
                              </div>
                            );
                          }
                          return badges.map((badge, i) => (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "flex items-center gap-1 backdrop-blur-sm text-xs px-2 py-1 rounded-full border cursor-help",
                                  badge.color
                                )}>
                                  <span>{badge.icon}</span>
                                  <span className="hidden sm:inline">{badge.label}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p className="font-semibold mb-1">{badge.icon} {badge.label}</p>
                                <ul className="text-xs space-y-0.5">
                                  {badge.details.map((detail, j) => (
                                    <li key={j}>{detail}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          ));
                        })()}
                      </div>
                      
                      {/* Quick action buttons on hover */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                            onClick={(e) => { e.stopPropagation(); handleDownload(page); }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                            onClick={(e) => { e.stopPropagation(); setViewingMetrics(page); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 sm:p-4">
                      {/* Group and Tags Badges */}
                      {(() => {
                        const pageTags = getTagsForPage(page.id);
                        const pageGroup = getGroupById(page.group_id);
                        if (pageTags.length === 0 && !pageGroup) return null;
                        
                        return (
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            {pageGroup && (
                              <span className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all",
                                `bg-${pageGroup.color}-500/20 text-${pageGroup.color}-400 border-${pageGroup.color}-500/30`
                              )}>
                                <span className={cn("w-2 h-2 rounded-full", `bg-${pageGroup.color}-400`)} />
                                {pageGroup.name}
                              </span>
                            )}
                            {pageTags.slice(0, 2).map(tag => (
                              <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                            {pageTags.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{pageTags.length - 2}</span>
                            )}
                          </div>
                        );
                      })()}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs font-mono bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-muted-foreground">
                            T{page.popup_template}
                          </span>
                          {getBotCountForPage(page.id) > 0 && (
                            <span className="text-xs bg-red-500/10 text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 border border-red-500/20">
                              <Bot className="w-3 h-3" />
                              <span className="hidden xs:inline">{getBotCountForPage(page.id)} bloqueados</span>
                              <span className="xs:hidden">{getBotCountForPage(page.id)}</span>
                            </span>
                          )}
                          
                          {/* Quick Group Selector */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={() => handleUpdatePageGroup(page.id, null)}
                                className={cn(!page.group_id && "bg-secondary")}
                              >
                                <span className="w-3 h-3 mr-2" />
                                Sem grupo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {groups.map(group => (
                                <DropdownMenuItem 
                                  key={group.id}
                                  onClick={() => handleUpdatePageGroup(page.id, group.id)}
                                  className={cn(page.group_id === group.id && "bg-secondary")}
                                >
                                  <span className={cn("w-3 h-3 rounded-full mr-2", `bg-${group.color}-500`)} />
                                  {group.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Quick Tag Selector */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="start" onClick={(e) => e.stopPropagation()}>
                              <p className="text-xs text-muted-foreground mb-2 px-2">Adicionar tags</p>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {tags.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-2">
                                    Nenhuma tag criada
                                  </p>
                                ) : (
                                  tags.map((tag) => {
                                    const pageTags = getTagsForPage(page.id);
                                    const isTagged = pageTags.some((t) => t.id === tag.id);
                                    return (
                                      <button
                                        key={tag.id}
                                        className={cn(
                                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors",
                                          isTagged && "bg-secondary"
                                        )}
                                        onClick={() => handleTogglePageTag(page.id, tag, isTagged)}
                                      >
                                        <span className={cn("w-3 h-3 rounded-full", `bg-${tag.color}-500`)} />
                                        <span className="truncate">{tag.name}</span>
                                        {isTagged && <Check className="w-4 h-4 ml-auto text-primary" />}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(page.created_at)}
                        </span>
                      </div>
                      
                      {/* Page Name with inline edit */}
                      <div className="mb-2">
                        {editingPageId === page.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Nome da página..."
                              className="h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(page.id, e as any);
                                if (e.key === 'Escape') cancelRename(e as any);
                              }}
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => saveRename(page.id, e)}>
                              <Check className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={cancelRename}>
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/name">
                            {page.name ? (
                              <p className="text-sm text-foreground font-semibold truncate flex items-center gap-2" title={page.name}>
                                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                {page.name}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground truncate" title={page.landing_url}>
                                {page.landing_url || 'Screenshot manual'}
                              </p>
                            )}
                            <button
                              onClick={(e) => startRename(page, e)}
                              className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {page.name && (
                        <p className="text-xs text-muted-foreground truncate mb-1" title={page.landing_url}>
                          {page.landing_url || 'Screenshot manual'}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mb-3" title={page.redirect_url}>
                        <ExternalLink className="w-3 h-3" />
                        {page.redirect_url}
                      </p>
                      
                      {/* Minimalist Metrics */}
                      {(() => {
                        const stats = pageStatsMap.get(page.id) || { views: 0, redirects: 0, conversionRate: 0 };
                        return (
                          <div className="flex items-center gap-3 text-xs border-t border-border/50 pt-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-help">
                                  <Eye className="w-3 h-3" />
                                  {stats.views}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Visualizações</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-help">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {stats.redirects}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Redirecionamentos</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={cn(
                                  "flex items-center gap-1 font-medium cursor-help",
                                  stats.conversionRate >= 50 ? "text-green-400" :
                                  stats.conversionRate >= 20 ? "text-yellow-400" : "text-muted-foreground"
                                )}>
                                  <TrendingUp className="w-3 h-3" />
                                  {stats.conversionRate}%
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Taxa de Conversão</TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Expanded Details */}
                    {selectedPage?.id === page.id && (
                      <div className="border-t border-border p-4 space-y-4 bg-secondary/20 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Landing URL</p>
                            <p className="text-sm truncate text-foreground">{page.landing_url || 'Manual'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Redirect URL</p>
                            <p className="text-sm truncate text-foreground">{page.redirect_url}</p>
                          </div>
                        </div>
                        
                        {/* Link da Página */}
                        <div className={`p-3 rounded-lg space-y-2 ${
                          page.bot_protection_config?.enableCloaking 
                            ? 'bg-purple-500/10 border border-purple-500/30' 
                            : 'bg-primary/10 border border-primary/30'
                        }`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <LinkIcon className={`w-4 h-4 ${page.bot_protection_config?.enableCloaking ? 'text-purple-400' : 'text-primary'}`} />
                            <span className={`text-xs font-medium ${page.bot_protection_config?.enableCloaking ? 'text-purple-400' : 'text-primary'}`}>
                              Link da Página
                            </span>
                            {userDomain?.is_verified && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30">
                                Domínio próprio
                              </span>
                            )}
                            {page.bot_protection_config?.enableCloaking && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Cloaking Ativo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono text-foreground bg-background/50 p-2 rounded truncate">
                              {getPageUrl(page.id)}
                            </code>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="h-8 shrink-0"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigator.clipboard.writeText(getPageUrl(page.id));
                                toast.success('Link copiado!');
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                          {page.bot_protection_config?.enableCloaking && (
                            <p className="text-xs text-purple-300/80">
                              🛡️ Este link já tem proteção. Bots verão uma página falsa.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Page ID:</span>
                            <code className="text-xs font-mono text-primary">{page.id.slice(0, 8)}...</code>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={(e) => { e.stopPropagation(); handleCopyPageId(page.id); }}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleCopyCode(page); }}
                                title="Copiar Código HTML"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar Código HTML</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleDownload(page); }}
                                title="Download HTML"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download HTML</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); setViewingMetrics(page); }}
                                title="Ver Métricas"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver Métricas</TooltipContent>
                          </Tooltip>
                          <Button size="sm" className="flex-1" onClick={() => handleEdit(page)}>
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleDuplicate(page)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicar</TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="px-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A página e todos os dados de analytics associados serão removidos permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(page.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              </TooltipProvider>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Analytics Avançado
              </h3>
              <Select 
                value={analyticsPeriod} 
                onValueChange={(v) => {
                  setAnalyticsPeriod(v as '7d' | '30d' | '90d');
                  fetchData();
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <AdvancedAnalytics 
                events={pageEvents} 
                botDetections={botDetections} 
                period={analyticsPeriod}
              />
            )}
          </TabsContent>

          <TabsContent value="bots" className="animate-fade-in">
            <TooltipProvider>
              {/* Header with log management */}
              <div className="flex items-center justify-end mb-6">
                {/* Log Management Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Gerenciar Logs
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setDeleteLogsDialog({ open: true, type: 'before30d' })}
                      disabled={logsOlderThan30d === 0}
                    >
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      Limpar {">"} 30 dias ({logsOlderThan30d})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteLogsDialog({ open: true, type: 'all' })}
                      className="text-red-500"
                      disabled={botDetections.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Todos ({botDetections.length})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Delete Logs Confirmation Dialog */}
              <AlertDialog open={deleteLogsDialog.open} onOpenChange={(open) => !open && setDeleteLogsDialog({ open: false, type: null })}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {deleteLogsDialog.type === 'before30d' && 'Limpar logs antigos?'}
                      {deleteLogsDialog.type === 'all' && 'Limpar todos os logs?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {deleteLogsDialog.type === 'before30d' && (
                        <>Serão removidos <strong>{logsOlderThan30d}</strong> registros com mais de 30 dias.</>
                      )}
                      {deleteLogsDialog.type === 'all' && (
                        <>Serão removidos <strong>{botDetections.length}</strong> registros. Esta ação não pode ser desfeita.</>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingLogs}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteLogs}
                      disabled={isDeletingLogs}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeletingLogs ? 'Removendo...' : 'Confirmar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Bot Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card className="p-5 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 hover-glow">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                          <Shield className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                          <p className="text-sm text-muted-foreground">Bots Bloqueados</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 hover-glow">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-foreground">{stats.cloaking}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-muted-foreground cursor-help underline decoration-dotted">Via Cloaking</p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                              <p className="text-xs">Bots detectados pelo servidor. Uma página fake foi servida ao invés do conteúdo real.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 hover-glow">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                          <Bot className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-foreground">{stats.frontend}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-muted-foreground cursor-help underline decoration-dotted">Via Frontend</p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                              <p className="text-xs">Bots detectados pelo JavaScript. O redirect foi bloqueado, mas o bot conseguiu ver a página.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Bot Glossary */}
                  <Card className="p-5 mb-6 border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Entenda os Tipos de Detecção
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(categoryInfo)
                        .filter(([key]) => key !== 'informational')
                        .map(([key, cat]) => {
                          const CatIcon = cat.icon;
                          return (
                            <div key={key} className={cn("p-3 rounded-lg border border-border/50", cat.bgColor)}>
                              <div className="flex items-center gap-2 mb-1">
                                <CatIcon className={cn("w-4 h-4", cat.color)} />
                                <span className="font-medium text-sm">{cat.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{cat.description}</p>
                            </div>
                          );
                        })}
                    </div>
                  </Card>

                  {/* Detection Reasons Breakdown */}
                  {Object.keys(stats.reasons).length > 0 && (
                    <Card className="p-5 mb-6 border-border/50">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Motivos de Detecção
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.reasons)
                          .sort((a, b) => b[1] - a[1])
                          .map(([reason, count]) => {
                            const explanation = getExplanation(reason);
                            const catInfoItem = categoryInfo[explanation.category];
                            const CatIcon = catInfoItem.icon;
                            
                            return (
                              <Tooltip key={reason}>
                                <TooltipTrigger asChild>
                                  <div className="bg-secondary/70 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-border/50 hover:border-primary/30 transition-colors cursor-help">
                                    <CatIcon className={cn("w-3.5 h-3.5", catInfoItem.color)} />
                                    <span className="font-medium text-foreground">{explanation.name}</span>
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                                      {count}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[280px]">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{explanation.name}</p>
                                    <p className="text-xs">{explanation.description}</p>
                                    <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                                      <span className="font-medium">Ação:</span> {explanation.action}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                      </div>
                    </Card>
                  )}

              {/* Bot Detections List */}
              {isLoading ? (
                <DashboardBotsSkeleton />
              ) : botDetections.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nenhum Bot Bloqueado"
                  description="Nenhum bot real foi detectado ainda. Isso é bom! Suas páginas estão seguras."
                  variant="success"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Bots Bloqueados
                    </h3>
                    <Button variant="outline" size="sm" onClick={handleClearBots} className="text-destructive hover:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Limpar Logs
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {botDetections.map((detection, index) => {
                      const explanation = getExplanation(detection.detection_reason);
                      const catInfoItem = categoryInfo[explanation.category];
                      const CatIcon = catInfoItem.icon;
                      
                      return (
                        <Card 
                          key={detection.id} 
                          className="p-4 border-border/50 hover:border-border transition-all duration-200 animate-fade-in hover-glow"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 cursor-help",
                                    detection.detection_type === 'cloaking' 
                                      ? "bg-orange-500/20" 
                                      : detection.detection_type === 'devtools'
                                        ? "bg-purple-500/20"
                                        : "bg-blue-500/20"
                                  )}>
                                    {detection.detection_type === 'cloaking' ? (
                                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    ) : detection.detection_type === 'devtools' ? (
                                      <Wrench className="w-5 h-5 text-purple-500" />
                                    ) : (
                                      <Bot className="w-5 h-5 text-blue-500" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px]">
                                  <p className="font-semibold">{catInfoItem.name}</p>
                                  <p className="text-xs text-muted-foreground">{catInfoItem.description}</p>
                                </TooltipContent>
                              </Tooltip>
                              <div className="space-y-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-medium text-foreground cursor-help flex items-center gap-1.5">
                                      {explanation.name}
                                      <CatIcon className={cn("w-3.5 h-3.5", catInfoItem.color)} />
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[300px]">
                                    <div className="space-y-2">
                                      <p className="font-semibold">{explanation.name}</p>
                                      <p className="text-xs">{explanation.description}</p>
                                      <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                                        <span className="font-medium">Ação:</span> {explanation.action}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                                <p className="text-xs text-muted-foreground truncate max-w-[400px]">
                                  {detection.user_agent || 'User agent não disponível'}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {detection.ip_address && (
                                    <span className="flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      {detection.ip_address}
                                    </span>
                                  )}
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium",
                                    detection.detection_type === 'cloaking' 
                                      ? "bg-orange-500/10 text-orange-400" 
                                      : detection.detection_type === 'devtools'
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "bg-blue-500/10 text-blue-400"
                                  )}>
                                    {detection.detection_type}
                                  </span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 cursor-help">
                                        BLOQUEADO
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{getBlockedActionText(detection.detection_type, true)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-muted-foreground block">
                                {formatRelativeTime(detection.detected_at)}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70">
                                {formatDate(detection.detected_at)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </TooltipProvider>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}