import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: "Added to basket!",
      description: `${product.name} added to your basket.`,
    });
    navigate('/basket');
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-sm">
          <Star className="h-3 w-3 mr-1 fill-accent text-accent" />
          {product.rating}
        </Badge>
        <Badge className="absolute top-3 left-3 bg-accent/90 text-accent-foreground backdrop-blur-sm">
          {product.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
          <p className="text-xl font-bold text-accent">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="flex-1 bg-secondary/50 hover:bg-secondary hover:text-accent border-muted"
            onClick={handleCustomize}
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button 
            size="sm"
            className="flex-1 bg-gradient-accent text-white hover:opacity-90 shadow-soft"
            onClick={handleQuickBuy}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Quick Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;