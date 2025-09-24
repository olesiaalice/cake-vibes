import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      className="overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer group bg-gradient-card backdrop-blur-sm border-0 hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="aspect-square relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-2 sm:p-4">
        <div className="mb-2 sm:mb-3">
          <h3 className="font-playfair font-semibold text-sm sm:text-lg text-foreground mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
            {product.description}
          </p>
          <p className="text-lg sm:text-xl font-bold text-gradient">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="w-8 sm:flex-1 bg-secondary/50 hover:bg-secondary hover:text-accent border-muted text-xs sm:text-sm px-1 py-1 h-7 sm:h-9"
            onClick={handleCustomize}
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Customize</span>
          </Button>
          <Button 
            size="sm"
            className="flex-1 bg-gradient-accent text-white hover:opacity-90 shadow-soft text-xs sm:text-sm px-1 py-1 h-7 sm:h-9"
            onClick={handleQuickBuy}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Quick Buy</span>
            <span className="xs:hidden">Buy</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;