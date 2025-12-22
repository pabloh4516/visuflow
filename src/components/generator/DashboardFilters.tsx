import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Layers, ArrowUpDown } from 'lucide-react';

export type SortOption = 'recent' | 'views' | 'conversion' | 'bots';

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  popupFilter: string;
  onPopupFilterChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  sortBy?: SortOption;
  onSortChange?: (value: SortOption) => void;
}

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  popupFilter,
  onPopupFilterChange,
  periodFilter,
  onPeriodFilterChange,
  sortBy = 'recent',
  onSortChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-6 p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por URL ou nome..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors w-full"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Select value={popupFilter} onValueChange={onPopupFilterChange}>
          <SelectTrigger className="w-full xs:w-[130px] sm:w-[140px] bg-background/50 border-border/50">
            <Layers className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="cookies">🍪 Cookies</SelectItem>
            <SelectItem value="country">🌍 País</SelectItem>
            <SelectItem value="gender">👤 Gênero</SelectItem>
            <SelectItem value="age">🔞 Idade</SelectItem>
            <SelectItem value="captcha">🤖 Captcha</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
          <SelectTrigger className="w-full xs:w-[130px] sm:w-[140px] bg-background/50 border-border/50">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="today">📅 Hoje</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>

        {onSortChange && (
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-full xs:w-[140px] sm:w-[150px] bg-background/50 border-border/50">
              <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="recent">📅 Mais recentes</SelectItem>
              <SelectItem value="views">👁 Mais views</SelectItem>
              <SelectItem value="conversion">📈 Maior conversão</SelectItem>
              <SelectItem value="bots">🤖 Mais bots</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
