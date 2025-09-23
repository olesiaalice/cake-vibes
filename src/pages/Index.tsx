import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, profile, signOut, isManager, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [storeName, setStoreName] = useState<string>('OhMyCake');

  useEffect(() => {
    fetchProducts();
    fetchStoreName();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchStoreName = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('store_name')
        .limit(1)
        .single();

      if (error) throw error;
      if (data?.store_name) {
        setStoreName(data.store_name);
      }
    } catch (error) {
      console.error('Error fetching store name:', error);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesCategory;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎂</div>
          <p className="text-muted-foreground">Loading delicious cakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {storeName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem disabled>
                      <span className="text-sm text-muted-foreground">
                        {profile?.email}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isManager && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/manager')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Manager Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
                onClick={() => navigate('/basket')}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-white text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2 mt-[5px]">
              Get your <span className="text-accent">Cakes</span>
            </h1>
            <p className="text-muted-foreground">
              on one finger tap
            </p>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (selectedCategory === null && category === 'All') ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap hover:opacity-90 transition-opacity"
                style={selectedCategory === category || (selectedCategory === null && category === 'All') ? 
                  { backgroundColor: '#947050', borderColor: '#947050', color: 'white' } : 
                  { borderColor: '#947050', color: '#947050', backgroundColor: 'transparent' }
                }
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-6">
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 auto-rows-fr">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-lg font-semibold mb-2">No cakes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
