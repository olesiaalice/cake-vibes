-- Add minimum delivery days setting to store_settings table
ALTER TABLE public.store_settings 
ADD COLUMN minimum_delivery_days integer NOT NULL DEFAULT 2;

-- Add a comment to explain the column
COMMENT ON COLUMN public.store_settings.minimum_delivery_days IS 'Minimum number of days required between order date and delivery date';