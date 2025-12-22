import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RefreshButtonProps extends Omit<ButtonProps, 'onClick'> {
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
  tooltip?: string;
}

export function RefreshButton({
  onRefresh,
  isLoading = false,
  tooltip = "Atualizar dados",
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleClick = async () => {
    if (isRefreshing || isLoading) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Pequeno delay para feedback visual
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const spinning = isRefreshing || isLoading;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={spinning}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
          {...props}
        >
          <RefreshCw 
            className={cn(
              "h-4 w-4 transition-transform duration-500",
              spinning && "animate-spin"
            )} 
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
