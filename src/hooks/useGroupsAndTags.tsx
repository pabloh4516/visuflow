import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tag, PageGroup } from "@/components/generator/TagBadge";

interface PageTagRelation {
  page_id: string;
  tag_id: string;
}

export function useGroupsAndTags() {
  const [groups, setGroups] = useState<PageGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pageTags, setPageTags] = useState<PageTagRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, tagsRes, pageTagsRes] = await Promise.all([
        supabase.from("page_groups").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
        supabase.from("page_tags").select("page_id, tag_id"),
      ]);

      if (groupsRes.data) setGroups(groupsRes.data as PageGroup[]);
      if (tagsRes.data) setTags(tagsRes.data as Tag[]);
      if (pageTagsRes.data) setPageTags(pageTagsRes.data);
    } catch (error) {
      console.error("Error fetching groups and tags:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTagsForPage = useCallback(
    (pageId: string): Tag[] => {
      const tagIds = pageTags
        .filter((pt) => pt.page_id === pageId)
        .map((pt) => pt.tag_id);
      return tags.filter((t) => tagIds.includes(t.id));
    },
    [pageTags, tags]
  );

  const updatePageTags = useCallback(
    (pageId: string, newTags: Tag[]) => {
      // Update local state for immediate UI feedback
      setPageTags((prev) => {
        const filtered = prev.filter((pt) => pt.page_id !== pageId);
        const newRelations = newTags.map((t) => ({
          page_id: pageId,
          tag_id: t.id,
        }));
        return [...filtered, ...newRelations];
      });
    },
    []
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const getGroupById = useCallback(
    (groupId: string | null): PageGroup | undefined => {
      if (!groupId) return undefined;
      return groups.find((g) => g.id === groupId);
    },
    [groups]
  );

  return {
    groups,
    setGroups,
    tags,
    setTags,
    pageTags,
    isLoading,
    getTagsForPage,
    getGroupById,
    updatePageTags,
    refresh,
  };
}
