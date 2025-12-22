import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export const TAG_COLORS = {
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  lime: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  sky: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
} as const;

export type TagColor = keyof typeof TAG_COLORS;

export const GROUP_COLORS = TAG_COLORS;
export type GroupColor = TagColor;

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  user_id: string;
  created_at: string;
}

export interface PageGroup {
  id: string;
  name: string;
  color: GroupColor;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md";
  onClick?: () => void;
  onRemove?: () => void;
  isActive?: boolean;
}

export function TagBadge({ 
  tag, 
  size = "sm", 
  onClick, 
  onRemove,
  isActive = false,
}: TagBadgeProps) {
  const colorClass = TAG_COLORS[tag.color as TagColor] || TAG_COLORS.gray;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border transition-all",
        colorClass,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        onClick && "cursor-pointer hover:opacity-80",
        isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span className="font-medium">{tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

interface GroupBadgeProps {
  group: PageGroup;
  size?: "sm" | "md";
  onClick?: () => void;
  isActive?: boolean;
}

export function GroupBadge({
  group,
  size = "sm",
  onClick,
  isActive = false,
}: GroupBadgeProps) {
  const colorClass = GROUP_COLORS[group.color as GroupColor] || GROUP_COLORS.blue;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border transition-all",
        colorClass,
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        onClick && "cursor-pointer hover:opacity-80",
        isActive && "ring-2 ring-primary"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className={cn(
        "rounded-full",
        size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5",
        `bg-${group.color}-400`
      )} />
      <span className="font-medium">{group.name}</span>
    </span>
  );
}
