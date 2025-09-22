import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
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

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {user ? `Welcome back!` : 'Welcome!'}
                </p>
                <p className="font-semibold">
                  {user ? (profile?.email || 'Cake Lover') : 'Guest'}
                </p>
              </div>
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

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cakes..."
              className="pl-10 bg-secondary/50 border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (selectedCategory === null && category === 'All') ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
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
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Popular Cakes ({filteredProducts.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-lg font-semibold mb-2">No cakes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
