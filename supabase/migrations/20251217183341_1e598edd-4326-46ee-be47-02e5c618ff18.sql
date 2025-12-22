-- Create table for generated pages history
CREATE TABLE public.generated_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_url TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  popup_type TEXT NOT NULL,
  popup_template INTEGER NOT NULL,
  config JSONB NOT NULL,
  html_content TEXT NOT NULL,
  desktop_screenshot TEXT,
  mobile_screenshot TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_pages ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since there's no auth)
CREATE POLICY "Anyone can view pages" 
ON public.generated_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create pages" 
ON public.generated_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete pages" 
ON public.generated_pages 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_pages_updated_at
BEFORE UPDATE ON public.generated_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();