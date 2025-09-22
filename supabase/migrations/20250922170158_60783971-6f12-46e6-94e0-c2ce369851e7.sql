-- Create products table to store cake data
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'manager');

-- Create profiles table for user data and roles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
    AND role = _role
  )
$$;

-- Products policies - everyone can read, only managers can modify
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Only managers can insert products" ON public.products
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Only managers can update products" ON public.products
  FOR UPDATE USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Only managers can delete products" ON public.products
  FOR DELETE USING (public.has_role(auth.uid(), 'manager'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing product data with proper UUIDs
INSERT INTO public.products (name, description, price, image, category, rating)
VALUES 
  ('Chocolate Dream', 'Rich chocolate cake with velvety frosting and fresh strawberries', 45.00, '/src/assets/chocolate-cake.jpg', 'Birthday', 4.9),
  ('Vanilla Wedding', 'Elegant three-tier wedding cake with buttercream and roses', 120.00, '/src/assets/vanilla-wedding-cake.jpg', 'Wedding', 5.0),
  ('Red Velvet Classic', 'Traditional red velvet with cream cheese frosting', 38.00, '/src/assets/red-velvet-cake.jpg', 'Classic', 4.8),
  ('Rainbow Celebration', 'Colorful rainbow layers perfect for birthdays and celebrations', 52.00, '/src/assets/rainbow-cake.jpg', 'Birthday', 4.7),
  ('Blueberry Cheesecake', 'Creamy cheesecake topped with fresh blueberry compote', 42.00, '/src/assets/blueberry-cheesecake.jpg', 'Cheesecake', 4.9),
  ('Chocolate Lava', 'Decadent molten chocolate cake with vanilla ice cream', 28.00, '/src/assets/lava-cake.jpg', 'Individual', 4.8),
  ('Strawberry Shortcake', 'Light sponge cake with fresh strawberries and whipped cream', 35.00, '/src/assets/strawberry-shortcake.jpg', 'Classic', 4.6),
  ('Tiramisu Delight', 'Coffee-soaked ladyfingers with mascarpone cream', 48.00, '/src/assets/tiramisu-cake.jpg', 'Italian', 4.9),
  ('Lemon Sunshine', 'Zesty lemon cake with bright citrus frosting', 32.00, '/src/assets/lemon-cake.jpg', 'Citrus', 4.5),
  ('Carrot Garden', 'Moist carrot cake with cinnamon and cream cheese frosting', 40.00, '/src/assets/carrot-cake.jpg', 'Classic', 4.7);