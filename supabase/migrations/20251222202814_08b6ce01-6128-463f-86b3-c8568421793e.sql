-- Create page_groups table
CREATE TABLE public.page_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_tags junction table (N:N relationship)
CREATE TABLE public.page_tags (
  page_id UUID NOT NULL REFERENCES public.generated_pages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (page_id, tag_id)
);

-- Add group_id to generated_pages
ALTER TABLE public.generated_pages 
ADD COLUMN group_id UUID REFERENCES public.page_groups(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.page_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_groups
CREATE POLICY "Users can view own groups"
ON public.page_groups FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own groups"
ON public.page_groups FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups"
ON public.page_groups FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups"
ON public.page_groups FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for tags
CREATE POLICY "Users can view own tags"
ON public.tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
ON public.tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
ON public.tags FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
ON public.tags FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for page_tags (users can only manage tags for their own pages)
CREATE POLICY "Users can view page tags for own pages"
ON public.page_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.generated_pages gp
  WHERE gp.id = page_tags.page_id AND gp.user_id = auth.uid()
));

CREATE POLICY "Users can add tags to own pages"
ON public.page_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.generated_pages gp
  WHERE gp.id = page_tags.page_id AND gp.user_id = auth.uid()
));

CREATE POLICY "Users can remove tags from own pages"
ON public.page_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.generated_pages gp
  WHERE gp.id = page_tags.page_id AND gp.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_page_groups_user_id ON public.page_groups(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_page_tags_page_id ON public.page_tags(page_id);
CREATE INDEX idx_page_tags_tag_id ON public.page_tags(tag_id);
CREATE INDEX idx_generated_pages_group_id ON public.generated_pages(group_id);

-- Trigger for updating updated_at on page_groups
CREATE TRIGGER update_page_groups_updated_at
BEFORE UPDATE ON public.page_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();