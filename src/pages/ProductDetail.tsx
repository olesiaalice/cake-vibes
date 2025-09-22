import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Customization } from '@/types/product';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    toppings: [],
    size: 'medium',
    color: 'original',
    flavor: 'original',
    specialInstructions: '',
  });

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const toppings = ['Fresh Berries', 'Chocolate Chips', 'Nuts', 'Sprinkles', 'Caramel', 'Whipped Cream'];
  const colors = ['Original', 'Pink', 'Blue', 'Yellow', 'Purple'];
  const flavors = ['Original', 'Vanilla', 'Chocolate', 'Strawberry', 'Lemon'];

  const calculatePrice = () => {
    let price = product.price;
    
    switch (customization.size) {
      case 'small':
        price += 0;
        break;
      case 'medium':
        price += 10;
        break;
      case 'large':
        price += 20;
        break;
    }
    
    price += customization.toppings.length * 3;
    
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
            onClick={() => navigate(-1)}
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
          <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
          <p className="text-lg font-semibold text-accent mb-2">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Customization Options */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-6">
            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Choose size</h3>
              <div className="flex gap-3">
                {['small', 'medium', 'large'].map((size) => (
                  <Button
                    key={size}
                    variant={customization.size === size ? "default" : "outline"}
                    className="flex-1 capitalize"
                    onClick={() => setCustomization(prev => ({ ...prev, size: size as any }))}
                  >
                    {size}
                    {size === 'medium' && ' (+$10)'}
                    {size === 'large' && ' (+$20)'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Toppings (+$3 each)</h3>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map((topping) => (
                  <Button
                    key={topping}
                    variant={customization.toppings.includes(topping) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToppingToggle(topping)}
                    className="justify-start"
                  >
                    {topping}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant={customization.color === color.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomization(prev => ({ ...prev, color: color.toLowerCase() }))}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Flavor */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Flavor</h3>
              <div className="flex gap-2 flex-wrap">
                {flavors.map((flavor) => (
                  <Button
                    key={flavor}
                    variant={customization.flavor === flavor.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomization(prev => ({ ...prev, flavor: flavor.toLowerCase() }))}
                  >
                    {flavor}
                  </Button>
                ))}
              </div>
            </div>

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
              className="w-full py-6 text-lg font-semibold bg-gradient-accent text-white rounded-xl shadow-floating"
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