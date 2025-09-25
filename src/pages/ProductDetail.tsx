import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { Customization } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [customizationOptions, setCustomizationOptions] = useState<any>({
    sizes: [],
    toppings: [],
    colors: [],
    flavors: []
  });

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    toppings: [],
    size: 'medium',
    color: 'original',
    flavor: 'original',
    specialInstructions: '',
  });

  useEffect(() => {
    const fetchProduct = async (productId: string) => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomizationOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('customization_options')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        
        const grouped = {
          sizes: data?.filter(opt => opt.option_type === 'size') || [],
          toppings: data?.filter(opt => opt.option_type === 'topping') || [],
          colors: data?.filter(opt => opt.option_type === 'color') || [],
          flavors: data?.filter(opt => opt.option_type === 'flavor') || []
        };
        
        setCustomizationOptions(grouped);
        
        // Set default values based on available options
        if (grouped.sizes.length > 0) {
          const defaultSize = grouped.sizes.find(s => s.option_name.toLowerCase() === 'medium') || grouped.sizes[0];
          setCustomization(prev => ({ ...prev, size: defaultSize.option_name.toLowerCase() }));
        }
        if (grouped.colors.length > 0) {
          const defaultColor = grouped.colors.find(c => c.option_name.toLowerCase() === 'original') || grouped.colors[0];
          setCustomization(prev => ({ ...prev, color: defaultColor.option_name.toLowerCase() }));
        }
        if (grouped.flavors.length > 0) {
          const defaultFlavor = grouped.flavors.find(f => f.option_name.toLowerCase() === 'original') || grouped.flavors[0];
          setCustomization(prev => ({ ...prev, flavor: defaultFlavor.option_name.toLowerCase() }));
        }
      } catch (error) {
        console.error('Error fetching customization options:', error);
      }
    };

    if (id) {
      fetchProduct(id);
      fetchCustomizationOptions();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎂</div>
          <p className="text-muted-foreground">Loading cake details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const calculatePrice = () => {
    let price = product.price;
    
    // Size pricing
    const sizeOption = customizationOptions.sizes.find(s => 
      s.option_name.toLowerCase() === customization.size
    );
    if (sizeOption) {
      price += sizeOption.price_adjustment;
    }
    
    // Toppings pricing
    customization.toppings.forEach(topping => {
      const toppingOption = customizationOptions.toppings.find(t => 
        t.option_name.toLowerCase() === topping.toLowerCase()
      );
      if (toppingOption) {
        price += toppingOption.price_adjustment;
      }
    });
    
    return price * quantity;
  };

  const handleToppingToggle = (topping: string) => {
    setCustomization(prev => ({
      ...prev,
      toppings: prev.toppings.includes(topping)
        ? prev.toppings.filter(t => t !== topping)
        : [...prev.toppings, topping]
    }));
  };

  const handleBuy = () => {
    addToCart(product, quantity, customization);
    toast({
      title: "Added to basket!",
      description: `${quantity} ${product.name} added to your basket.`,
    });
    navigate('/basket');
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Details</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Product Image */}
        <div className="relative mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover rounded-2xl shadow-card"
          />
          <Badge className="absolute top-4 right-4 bg-background text-foreground">
            <Star className="h-3 w-3 mr-1 fill-accent text-accent" />
            {product.rating}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">{product.name}</h2>
          <p className="text-xl sm:text-2xl font-bold text-gradient mb-3">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Customization Options */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-6">
            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Choose size</h3>
              <div className="flex gap-2 w-full">
                {customizationOptions.sizes.map((sizeOption) => (
                  <Button
                    key={sizeOption.id}
                    variant={customization.size === sizeOption.option_name.toLowerCase() ? "default" : "outline"}
                    className="flex-1 capitalize text-xs sm:text-sm px-1 sm:px-3"
                    onClick={() => setCustomization(prev => ({ ...prev, size: sizeOption.option_name.toLowerCase() as any }))}
                  >
                    <span className="block sm:inline">{sizeOption.option_name}</span>
                    <span className="block sm:inline text-xs">
                      {sizeOption.price_adjustment > 0 && ` (+$${sizeOption.price_adjustment})`}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            {customizationOptions.toppings.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Toppings</h3>
                <div className="grid grid-cols-2 gap-2">
                  {customizationOptions.toppings.map((toppingOption) => (
                    <Button
                      key={toppingOption.id}
                      variant={customization.toppings.some(t => 
                        t.toLowerCase() === toppingOption.option_name.toLowerCase()
                      ) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToppingToggle(toppingOption.option_name)}
                      className="justify-start"
                    >
                      {toppingOption.option_name}
                      {toppingOption.price_adjustment > 0 && ` (+$${toppingOption.price_adjustment})`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {customizationOptions.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex gap-2 flex-wrap">
                  {customizationOptions.colors.map((colorOption) => (
                    <Button
                      key={colorOption.id}
                      variant={customization.color === colorOption.option_name.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomization(prev => ({ ...prev, color: colorOption.option_name.toLowerCase() }))}
                    >
                      {colorOption.option_name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor */}
            {customizationOptions.flavors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Flavor</h3>
                <div className="flex gap-2 flex-wrap">
                  {customizationOptions.flavors.map((flavorOption) => (
                    <Button
                      key={flavorOption.id}
                      variant={customization.flavor === flavorOption.option_name.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomization(prev => ({ ...prev, flavor: flavorOption.option_name.toLowerCase() }))}
                    >
                      {flavorOption.option_name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Special Instructions</h3>
              <Textarea
                placeholder="Any special requests or modifications..."
                value={customization.specialInstructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                className="min-h-20"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Upload Reference Image</h3>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quantity and Buy */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleBuy}
              className="w-full py-6 text-lg font-semibold bg-gradient-accent text-white rounded-xl shadow-floating hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              Buy - ${calculatePrice().toFixed(2)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;