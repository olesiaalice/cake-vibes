-- Create customization options table
CREATE TABLE public.customization_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_type text NOT NULL, -- 'size', 'topping', 'color', 'flavor'
  option_name text NOT NULL,
  price_adjustment numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active customization options" 
ON public.customization_options 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only managers can insert customization options" 
ON public.customization_options 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Only managers can update customization options" 
ON public.customization_options 
FOR UPDATE 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Only managers can delete customization options" 
ON public.customization_options 
FOR DELETE 
USING (has_role(auth.uid(), 'manager'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customization_options_updated_at
BEFORE UPDATE ON public.customization_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default customization options
INSERT INTO public.customization_options (option_type, option_name, price_adjustment, display_order) VALUES 
-- Sizes
('size', 'Small', 0, 1),
('size', 'Medium', 10, 2), 
('size', 'Large', 20, 3),

-- Toppings
('topping', 'Fresh Berries', 3, 1),
('topping', 'Chocolate Chips', 3, 2),
('topping', 'Nuts', 3, 3),
('topping', 'Sprinkles', 3, 4),
('topping', 'Caramel', 3, 5),
('topping', 'Whipped Cream', 3, 6),

-- Colors
('color', 'Pink', 0, 1),
('color', 'Blue', 0, 2),
('color', 'White', 0, 3),
('color', 'Purple', 0, 4),
('color', 'Gold', 0, 5),

-- Flavors
('flavor', 'Vanilla', 0, 1),
('flavor', 'Chocolate', 0, 2),
('flavor', 'Strawberry', 0, 3),
('flavor', 'Red Velvet', 0, 4),
('flavor', 'Lemon', 0, 5);