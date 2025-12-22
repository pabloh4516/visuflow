import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tag, 
  PageGroup, 
  TagColor, 
  GroupColor, 
  TAG_COLORS, 
  GROUP_COLORS 
} from "./TagBadge";
import { toast } from "sonner";
import { Folder, Tag as TagIcon, Plus, Trash2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupTagManagerProps {
  onGroupsChange?: (groups: PageGroup[]) => void;
  onTagsChange?: (tags: Tag[]) => void;
}

export function GroupTagManager({ onGroupsChange, onTagsChange }: GroupTagManagerProps) {
  const [groups, setGroups] = useState<PageGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"groups" | "tags">("groups");
  
  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState<GroupColor>("blue");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<TagColor>("gray");
  
  const [editingGroup, setEditingGroup] = useState<PageGroup | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGroupsAndTags();
  }, []);

  const fetchGroupsAndTags = async () => {
    try {
      const [groupsRes, tagsRes] = await Promise.all([
        supabase.from("page_groups").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
      ]);

      if (groupsRes.data) {
        const typedGroups = groupsRes.data as PageGroup[];
        setGroups(typedGroups);
        onGroupsChange?.(typedGroups);
      }
      if (tagsRes.data) {
        const typedTags = tagsRes.data as Tag[];
        setTags(typedTags);
        onTagsChange?.(typedTags);
      }
    } catch (error) {
      console.error("Error fetching groups and tags:", error);
    }
  };

  // Group CRUD
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("page_groups")
        .insert({
          name: newGroupName.trim(),
          color: newGroupColor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newGroups = [...groups, data as PageGroup].sort((a, b) => a.name.localeCompare(b.name));
      setGroups(newGroups);
      onGroupsChange?.(newGroups);
      setNewGroupName("");
      setNewGroupColor("blue");
      toast.success("Grupo criado!");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erro ao criar grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("page_groups")
        .update({
          name: editingGroup.name,
          color: editingGroup.color,
        })
        .eq("id", editingGroup.id);

      if (error) throw error;

      const newGroups = groups.map((g) =>
        g.id === editingGroup.id ? editingGroup : g
      );
      setGroups(newGroups);
      onGroupsChange?.(newGroups);
      setEditingGroup(null);
      toast.success("Grupo atualizado!");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Erro ao atualizar grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("page_groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      const newGroups = groups.filter((g) => g.id !== groupId);
      setGroups(newGroups);
      onGroupsChange?.(newGroups);
      toast.success("Grupo removido!");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Erro ao remover grupo");
    }
  };

  // Tag CRUD
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tags")
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTags = [...tags, data as Tag].sort((a, b) => a.name.localeCompare(b.name));
      setTags(newTags);
      onTagsChange?.(newTags);
      setNewTagName("");
      setNewTagColor("gray");
      toast.success("Tag criada!");
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Erro ao criar tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("tags")
        .update({
          name: editingTag.name,
          color: editingTag.color,
        })
        .eq("id", editingTag.id);

      if (error) throw error;

      const newTags = tags.map((t) => (t.id === editingTag.id ? editingTag : t));
      setTags(newTags);
      onTagsChange?.(newTags);
      setEditingTag(null);
      toast.success("Tag atualizada!");
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Erro ao atualizar tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase.from("tags").delete().eq("id", tagId);

      if (error) throw error;

      const newTags = tags.filter((t) => t.id !== tagId);
      setTags(newTags);
      onTagsChange?.(newTags);
      toast.success("Tag removida!");
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Erro ao remover tag");
    }
  };

  const colorOptions = Object.keys(TAG_COLORS) as TagColor[];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Folder className="w-4 h-4" />
          <span className="hidden sm:inline">Gerenciar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Gerenciar Grupos e Tags</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "groups" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("groups")}
            className="gap-2"
          >
            <Folder className="w-4 h-4" />
            Grupos ({groups.length})
          </Button>
          <Button
            variant={activeTab === "tags" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("tags")}
            className="gap-2"
          >
            <TagIcon className="w-4 h-4" />
            Tags ({tags.length})
          </Button>
        </div>

        {activeTab === "groups" ? (
          <div className="space-y-4">
            {/* Create Group */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Nome do grupo"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Select
                  value={newGroupColor}
                  onValueChange={(v) => setNewGroupColor(v as GroupColor)}
                >
                  <SelectTrigger className="w-full sm:w-28">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", `bg-${newGroupColor}-500`)} />
                      <span className="capitalize truncate">{newGroupColor}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)} />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateGroup} disabled={isLoading || !newGroupName.trim()} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Groups List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum grupo criado ainda
                </p>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                  >
                    {editingGroup?.id === group.id ? (
                      <>
                        <Input
                          value={editingGroup.name}
                          onChange={(e) =>
                            setEditingGroup({ ...editingGroup, name: e.target.value })
                          }
                          className="flex-1 h-8"
                        />
                        <Select
                          value={editingGroup.color}
                          onValueChange={(v) =>
                            setEditingGroup({ ...editingGroup, color: v as GroupColor })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <div className={cn("w-3 h-3 rounded-full", `bg-${editingGroup.color}-500`)} />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)} />
                                  <span className="capitalize">{color}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={handleUpdateGroup}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingGroup(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className={cn("w-3 h-3 rounded-full", `bg-${group.color}-500`)} />
                        <span className="flex-1 text-sm font-medium">{group.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingGroup(group)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Tag */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Nome da tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Select
                  value={newTagColor}
                  onValueChange={(v) => setNewTagColor(v as TagColor)}
                >
                  <SelectTrigger className="w-full sm:w-28">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", `bg-${newTagColor}-500`)} />
                      <span className="capitalize truncate">{newTagColor}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)} />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateTag} disabled={isLoading || !newTagName.trim()} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tags List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tag criada ainda
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                  >
                    {editingTag?.id === tag.id ? (
                      <>
                        <Input
                          value={editingTag.name}
                          onChange={(e) =>
                            setEditingTag({ ...editingTag, name: e.target.value })
                          }
                          className="flex-1 h-8"
                        />
                        <Select
                          value={editingTag.color}
                          onValueChange={(v) =>
                            setEditingTag({ ...editingTag, color: v as TagColor })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <div className={cn("w-3 h-3 rounded-full", `bg-${editingTag.color}-500`)} />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)} />
                                  <span className="capitalize">{color}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={handleUpdateTag}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTag(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className={cn("w-3 h-3 rounded-full", `bg-${tag.color}-500`)} />
                        <span className="flex-1 text-sm font-medium">{tag.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTag(tag)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
