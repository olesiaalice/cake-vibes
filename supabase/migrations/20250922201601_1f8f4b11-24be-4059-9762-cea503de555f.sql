-- Create store_settings table for configurable store information
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'OhMyCake',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for store settings
CREATE POLICY "Anyone can view store settings" 
ON public.store_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only managers can update store settings" 
ON public.store_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Only managers can insert store settings" 
ON public.store_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

-- Insert default store settings
INSERT INTO public.store_settings (store_name) VALUES ('OhMyCake');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();