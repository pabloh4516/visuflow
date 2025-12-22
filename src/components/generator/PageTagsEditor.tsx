import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, PageGroup, TagBadge, TAG_COLORS, TagColor } from "./TagBadge";
import { toast } from "sonner";
import { Tag as TagIcon, Folder, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageTagsEditorProps {
  pageId: string;
  currentGroupId: string | null;
  currentTags: Tag[];
  availableGroups: PageGroup[];
  availableTags: Tag[];
  onGroupChange: (groupId: string | null) => void;
  onTagsChange: (tags: Tag[]) => void;
}

export function PageTagsEditor({
  pageId,
  currentGroupId,
  currentTags,
  availableGroups,
  availableTags,
  onGroupChange,
  onTagsChange,
}: PageTagsEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGroupChange = async (groupId: string) => {
    setIsUpdating(true);
    try {
      const newGroupId = groupId === "none" ? null : groupId;
      
      const { error } = await supabase
        .from("generated_pages")
        .update({ group_id: newGroupId })
        .eq("id", pageId);

      if (error) throw error;
      
      onGroupChange(newGroupId);
      toast.success("Grupo atualizado!");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Erro ao atualizar grupo");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    setIsUpdating(true);
    const isTagged = currentTags.some((t) => t.id === tag.id);

    try {
      if (isTagged) {
        // Remove tag
        const { error } = await supabase
          .from("page_tags")
          .delete()
          .eq("page_id", pageId)
          .eq("tag_id", tag.id);

        if (error) throw error;
        onTagsChange(currentTags.filter((t) => t.id !== tag.id));
      } else {
        // Add tag
        const { error } = await supabase.from("page_tags").insert({
          page_id: pageId,
          tag_id: tag.id,
        });

        if (error) throw error;
        onTagsChange([...currentTags, tag]);
      }
    } catch (error) {
      console.error("Error toggling tag:", error);
      toast.error("Erro ao atualizar tags");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentGroup = availableGroups.find((g) => g.id === currentGroupId);

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Group Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-7 gap-1.5 text-xs sm:text-sm",
              currentGroup && `border-${currentGroup.color}-500/50`
            )}
          >
            <Folder className="w-3 h-3 shrink-0" />
            {currentGroup ? (
              <span className="flex items-center gap-1.5 truncate max-w-[100px] sm:max-w-[150px]">
                <span className={cn("w-2 h-2 rounded-full shrink-0", `bg-${currentGroup.color}-500`)} />
                <span className="truncate">{currentGroup.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Sem grupo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start" side="bottom">
          <div className="space-y-1">
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors",
                !currentGroupId && "bg-secondary"
              )}
              onClick={() => handleGroupChange("none")}
              disabled={isUpdating}
            >
              <span className="w-3 h-3" />
              Sem grupo
              {!currentGroupId && <Check className="w-4 h-4 ml-auto" />}
            </button>
            {availableGroups.map((group) => (
              <button
                key={group.id}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors",
                  currentGroupId === group.id && "bg-secondary"
                )}
                onClick={() => handleGroupChange(group.id)}
                disabled={isUpdating}
              >
                <span className={cn("w-3 h-3 rounded-full shrink-0", `bg-${group.color}-500`)} />
                <span className="truncate">{group.name}</span>
                {currentGroupId === group.id && <Check className="w-4 h-4 ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Current Tags */}
      <div className="flex flex-wrap items-center gap-1">
        {currentTags.slice(0, 3).map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => handleToggleTag(tag)}
          />
        ))}
        {currentTags.length > 3 && (
          <span className="text-xs text-muted-foreground">+{currentTags.length - 3}</span>
        )}
      </div>

      {/* Add Tag Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
            <Plus className="w-3 h-3" />
            <TagIcon className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start" side="bottom">
          <p className="text-xs text-muted-foreground mb-2 px-2">Adicionar tags</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhuma tag disponível
              </p>
            ) : (
              availableTags.map((tag) => {
                const isTagged = currentTags.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-secondary transition-colors",
                      isTagged && "bg-secondary"
                    )}
                    onClick={() => handleToggleTag(tag)}
                    disabled={isUpdating}
                  >
                    <span className={cn("w-3 h-3 rounded-full shrink-0", `bg-${tag.color}-500`)} />
                    <span className="truncate">{tag.name}</span>
                    {isTagged && <Check className="w-4 h-4 ml-auto shrink-0 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
