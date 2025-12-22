import * as React from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

const presets: { label: string; value: DateRangePreset; getDates: () => DateRange }[] = [
  {
    label: "Hoje",
    value: "today",
    getDates: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "7 dias",
    value: "7d",
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "30 dias",
    value: "30d",
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "90 dias",
    value: "90d",
    getDates: () => ({
      from: startOfDay(subDays(new Date(), 90)),
      to: endOfDay(new Date()),
    }),
  },
];

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  align = "end",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    onDateRangeChange(preset.getDates());
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!dateRange?.from) return "Selecionar período";
    
    // Check if matches a preset
    const today = startOfDay(new Date());
    const fromDate = startOfDay(dateRange.from);
    
    if (dateRange.to) {
      const daysDiff = Math.round((endOfDay(dateRange.to).getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (fromDate.getTime() === today.getTime() && daysDiff <= 1) {
        return "Hoje";
      }
      if (daysDiff === 7) return "Últimos 7 dias";
      if (daysDiff === 30) return "Últimos 30 dias";
      if (daysDiff === 90) return "Últimos 90 dias";
      
      return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`;
    }
    
    return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-2 text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align} sideOffset={8}>
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-border p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Período</p>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (range?.from && range?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={1}
              locale={ptBR}
              className="pointer-events-auto"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
