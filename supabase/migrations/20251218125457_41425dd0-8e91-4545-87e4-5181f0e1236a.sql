-- Add name column to generated_pages for custom page naming
ALTER TABLE generated_pages 
ADD COLUMN name TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN generated_pages.name IS 'Custom user-defined name for the page';