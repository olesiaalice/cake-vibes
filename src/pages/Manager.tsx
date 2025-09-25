import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, ArrowLeft, ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';
import { OrderWithItems, OrderStatus } from '@/types/order';
import OrderCard from '@/components/OrderCard';
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}
const Manager = () => {
  const {
    user,
    profile,
    isManager,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storeName, setStoreName] = useState<string>('OhMyCake');
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [minimumDeliveryDays, setMinimumDeliveryDays] = useState<number>(2);
  const [newMinimumDeliveryDays, setNewMinimumDeliveryDays] = useState<number>(2);
  const [isEditingDeliveryDays, setIsEditingDeliveryDays] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<any[]>([]);
  const [editingCustomization, setEditingCustomization] = useState<any>(null);
  const [newCustomization, setNewCustomization] = useState({ option_type: 'topping', option_name: '', price_adjustment: 0 });
  const [activeTab, setActiveTab] = useState('orders');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    rating: '5.0'
  });
  useEffect(() => {
    if (!loading && (!user || !isManager)) {
      navigate('/auth');
      return;
    }
    if (user && isManager) {
      fetchProducts();
      fetchStoreName();
      fetchOrders();
      fetchStoreSettings();
      fetchCustomizationOptions();
    }
  }, [user, isManager, loading, navigate]);
  const fetchProducts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const {
        data,
        error
      } = await supabase.from('orders').select(`
          *,
          order_items (
            *,
            products (
              name,
              image
            )
          )
        `).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const {
        error
      } = await supabase.from('orders').update({
        status
      }).eq('id', orderId);
      if (error) throw error;
      toast.success(`Order status updated to ${status}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  const fetchStoreSettings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('store_settings').select('store_name, minimum_delivery_days').limit(1).single();
      if (error) throw error;
      if (data) {
        if (data.store_name) {
          setStoreName(data.store_name);
          setNewStoreName(data.store_name);
        }
        if (data.minimum_delivery_days !== null) {
          setMinimumDeliveryDays(data.minimum_delivery_days);
          setNewMinimumDeliveryDays(data.minimum_delivery_days);
        }
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    }
  };

  const fetchStoreName = async () => {
    await fetchStoreSettings();
  };
  const updateStoreName = async () => {
    if (!newStoreName.trim()) return;
    try {
      const {
        error
      } = await supabase.from('store_settings').update({
        store_name: newStoreName.trim()
      }).eq('id', (await supabase.from('store_settings').select('id').limit(1).single()).data?.id);
      if (error) throw error;
      setStoreName(newStoreName.trim());
      setIsEditingStoreName(false);
      toast.success('Store name updated successfully');
    } catch (error) {
      console.error('Error updating store name:', error);
      toast.error('Failed to update store name');
    }
  };

  const updateMinimumDeliveryDays = async () => {
    if (newMinimumDeliveryDays < 1) return;
    try {
      const {
        error
      } = await supabase.from('store_settings').update({
        minimum_delivery_days: newMinimumDeliveryDays
      }).eq('id', (await supabase.from('store_settings').select('id').limit(1).single()).data?.id);
      if (error) throw error;
      setMinimumDeliveryDays(newMinimumDeliveryDays);
      setIsEditingDeliveryDays(false);
      toast.success('Minimum delivery days updated successfully');
    } catch (error) {
      console.error('Error updating minimum delivery days:', error);
      toast.error('Failed to update minimum delivery days');
    }
  };

  const fetchCustomizationOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('customization_options')
        .select('*')
        .order('option_type')
        .order('display_order');
      
      if (error) throw error;
      setCustomizationOptions(data || []);
    } catch (error) {
      console.error('Error fetching customization options:', error);
    }
  };

  const addCustomizationOption = async () => {
    if (!newCustomization.option_name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('customization_options')
        .insert([{
          option_type: newCustomization.option_type,
          option_name: newCustomization.option_name.trim(),
          price_adjustment: newCustomization.price_adjustment,
          display_order: customizationOptions.filter(opt => opt.option_type === newCustomization.option_type).length + 1
        }]);
      
      if (error) throw error;
      toast.success('Customization option added successfully');
      setNewCustomization({ option_type: 'topping', option_name: '', price_adjustment: 0 });
      fetchCustomizationOptions();
    } catch (error) {
      console.error('Error adding customization option:', error);
      toast.error('Failed to add customization option');
    }
  };

  const updateCustomizationOption = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('customization_options')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Customization option updated successfully');
      setEditingCustomization(null);
      fetchCustomizationOptions();
    } catch (error) {
      console.error('Error updating customization option:', error);
      toast.error('Failed to update customization option');
    }
  };

  const deleteCustomizationOption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customization option?')) return;
    
    try {
      const { error } = await supabase
        .from('customization_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Customization option deleted successfully');
      fetchCustomizationOptions();
    } catch (error) {
      console.error('Error deleting customization option:', error);
      toast.error('Failed to delete customization option');
    }
  };
  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      rating: '5.0'
    });
  };
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        error
      } = await supabase.from('products').insert([{
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image: productForm.image,
        category: productForm.category,
        rating: parseFloat(productForm.rating)
      }]);
      if (error) throw error;
      toast.success('Product added successfully');
      resetForm();
      setIsAddingProduct(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const {
        error
      } = await supabase.from('products').update({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image: productForm.image,
        category: productForm.category,
        rating: parseFloat(productForm.rating)
      }).eq('id', editingProduct.id);
      if (error) throw error;
      toast.success('Product updated successfully');
      resetForm();
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const {
        error
      } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };
  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      rating: product.rating.toString()
    });
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user || !isManager) {
    return <div className="min-h-screen flex items-center justify-center">Access denied</div>;
  }
  return <div className="min-h-screen bg-background p-2 sm:p-6 px-[15px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Store Manager</h1>
              <p className="text-muted-foreground">Manage your cake store</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Preparing</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {orders.filter(o => o.status === 'preparing').length}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm text-muted-foreground">Revenue</p>
                       <p className="text-2xl font-bold text-green-600">
                         ${orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total_amount), 0).toFixed(2)}
                       </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Button variant="outline" onClick={fetchOrders}>
                  Refresh
                </Button>
              </div>
              
              {loadingOrders ? <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading orders...</div>
                </div> : orders.length === 0 ? <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">
                    Orders will appear here when customers place them.
                  </p>
                </div> : <div className="space-y-4">
                  {orders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onUpdateStatus={updateOrderStatus} 
                      showActions={true} 
                    />
                  ))}
                </div>}
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Products ({products.length})</h3>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                  resetForm();
                  setIsAddingProduct(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={productForm.name} onChange={e => setProductForm(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={productForm.category} onChange={e => setProductForm(prev => ({
                        ...prev,
                        category: e.target.value
                      }))} required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={productForm.description} onChange={e => setProductForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(prev => ({
                        ...prev,
                        price: e.target.value
                      }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating</Label>
                        <Input id="rating" type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={e => setProductForm(prev => ({
                        ...prev,
                        rating: e.target.value
                      }))} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" type="url" value={productForm.image} onChange={e => setProductForm(prev => ({
                      ...prev,
                      image: e.target.value
                    }))} required />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddingProduct(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Product</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map(product => <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }} />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold">${product.price}</span>
                      <span className="text-sm text-muted-foreground">
                        ⭐ {product.rating}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingProduct?.id === product.id} onOpenChange={open => {
                    if (!open) setEditingProduct(null);
                  }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => startEditing(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleEditProduct} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" value={productForm.name} onChange={e => setProductForm(prev => ({
                              ...prev,
                              name: e.target.value
                            }))} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Input id="edit-category" value={productForm.category} onChange={e => setProductForm(prev => ({
                              ...prev,
                              category: e.target.value
                            }))} required />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea id="edit-description" value={productForm.description} onChange={e => setProductForm(prev => ({
                            ...prev,
                            description: e.target.value
                          }))} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-price">Price ($)</Label>
                                <Input id="edit-price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(prev => ({
                              ...prev,
                              price: e.target.value
                            }))} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-rating">Rating</Label>
                                <Input id="edit-rating" type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={e => setProductForm(prev => ({
                              ...prev,
                              rating: e.target.value
                            }))} required />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-image">Image URL</Label>
                              <Input id="edit-image" type="url" value={productForm.image} onChange={e => setProductForm(prev => ({
                            ...prev,
                            image: e.target.value
                          }))} required />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                                Cancel
                              </Button>
                              <Button type="submit">Update Product</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <div className="flex gap-2">
                    <Input id="store-name" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} disabled={!isEditingStoreName} />
                    {isEditingStoreName ? <div className="flex gap-2">
                        <Button onClick={updateStoreName} size="sm">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                      setIsEditingStoreName(false);
                      setNewStoreName(storeName);
                    }} size="sm">
                          Cancel
                        </Button>
                      </div> : <Button variant="outline" onClick={() => setIsEditingStoreName(true)} size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-days">Minimum Delivery Days</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="delivery-days" 
                      type="number" 
                      min="1" 
                      max="30"
                      value={newMinimumDeliveryDays} 
                      onChange={e => setNewMinimumDeliveryDays(parseInt(e.target.value) || 1)} 
                      disabled={!isEditingDeliveryDays}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">days advance notice required</span>
                    {isEditingDeliveryDays ? <div className="flex gap-2">
                        <Button onClick={updateMinimumDeliveryDays} size="sm">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                      setIsEditingDeliveryDays(false);
                      setNewMinimumDeliveryDays(minimumDeliveryDays);
                    }} size="sm">
                          Cancel
                        </Button>
                      </div> : <Button variant="outline" onClick={() => setIsEditingDeliveryDays(true)} size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customers must order at least {minimumDeliveryDays} day{minimumDeliveryDays !== 1 ? 's' : ''} in advance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
                <p className="text-sm text-muted-foreground">Manage cake sizes, toppings, colors, and flavors with pricing</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Customization Option */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium">Add New Option</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={newCustomization.option_type}
                        onChange={e => setNewCustomization(prev => ({...prev, option_type: e.target.value}))}
                      >
                        <option value="size">Size</option>
                        <option value="topping">Topping</option>
                        <option value="color">Color</option>
                        <option value="flavor">Flavor</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        value={newCustomization.option_name}
                        onChange={e => setNewCustomization(prev => ({...prev, option_name: e.target.value}))}
                        placeholder="e.g., Extra Large"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price Adjustment ($)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={newCustomization.price_adjustment}
                        onChange={e => setNewCustomization(prev => ({...prev, price_adjustment: parseFloat(e.target.value) || 0}))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addCustomizationOption} disabled={!newCustomization.option_name.trim()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Customization Options List */}
                {['size', 'topping', 'color', 'flavor'].map(type => (
                  <div key={type} className="space-y-3">
                    <h4 className="font-medium capitalize">{type}s</h4>
                    <div className="space-y-2">
                      {customizationOptions
                        .filter(option => option.option_type === type)
                        .map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                            {editingCustomization?.id === option.id ? (
                              <div className="flex items-center gap-4 flex-1">
                                <Input 
                                  value={editingCustomization.option_name}
                                  onChange={e => setEditingCustomization(prev => ({...prev, option_name: e.target.value}))}
                                  className="flex-1"
                                />
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">$</span>
                                  <Input 
                                    type="number"
                                    step="0.01"
                                    value={editingCustomization.price_adjustment}
                                    onChange={e => setEditingCustomization(prev => ({...prev, price_adjustment: parseFloat(e.target.value) || 0}))}
                                    className="w-20"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateCustomizationOption(option.id, {
                                      option_name: editingCustomization.option_name,
                                      price_adjustment: editingCustomization.price_adjustment
                                    })}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingCustomization(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{option.option_name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {option.price_adjustment === 0 ? 'Free' : `+$${option.price_adjustment.toFixed(2)}`}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingCustomization(option)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteCustomizationOption(option.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      {customizationOptions.filter(option => option.option_type === type).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No {type}s added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Manager;