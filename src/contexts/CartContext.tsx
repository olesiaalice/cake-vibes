import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Customization } from '@/types/product';
import { CreateOrderData } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, customization?: Customization) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  placeOrder: (orderData: CreateOrderData) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const addToCart = async (product: Product, quantity = 1, customization?: Customization) => {
    const basePrice = product.price;
    const customizationPrice = customization ? await calculateCustomizationPrice(customization) : 0;
    const totalPrice = (basePrice + customizationPrice) * quantity;

    const cartItem: CartItem = {
      product,
      quantity,
      customization,
      totalPrice
    };

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
        JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        updatedItems[existingItemIndex].totalPrice += totalPrice;
        return updatedItems;
      }

      return [...prevItems, cartItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    for (const item of items) {
      if (item.product.id === productId) {
        const basePrice = item.product.price;
        const customizationPrice = item.customization ? await calculateCustomizationPrice(item.customization) : 0;
        const totalPrice = (basePrice + customizationPrice) * quantity;
        
        setItems(prevItems =>
          prevItems.map(prevItem => 
            prevItem.product.id === productId 
              ? { ...prevItem, quantity, totalPrice }
              : prevItem
          )
        );
        break;
      }
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateCustomizationPrice = async (customization: Customization): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('customization_options')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      let price = 0;
      
      // Size pricing
      const sizeOption = data?.find(opt => 
        opt.option_type === 'size' && 
        opt.option_name.toLowerCase() === customization.size?.toLowerCase()
      );
      if (sizeOption) {
        price += sizeOption.price_adjustment;
      }
      
      // Toppings pricing
      customization.toppings.forEach(topping => {
        const toppingOption = data?.find(opt => 
          opt.option_type === 'topping' && 
          opt.option_name.toLowerCase() === topping.toLowerCase()
        );
        if (toppingOption) {
          price += toppingOption.price_adjustment;
        }
      });
      
      return price;
    } catch (error) {
      console.error('Error calculating customization price:', error);
      // Fallback to hardcoded pricing if database fails
      let price = 0;
      
      switch (customization.size?.toLowerCase()) {
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
      
      return price;
    }
  };

  const placeOrder = async (orderData: CreateOrderData) => {
    if (!user) {
      return { success: false, error: 'User must be logged in to place an order' };
    }

    if (items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      // Check minimum delivery days requirement
      const { data: storeSettings, error: settingsError } = await supabase
        .from('store_settings')
        .select('minimum_delivery_days')
        .limit(1)
        .single();

      if (settingsError) {
        console.error('Error fetching store settings:', settingsError);
      }

      const minimumDeliveryDays = storeSettings?.minimum_delivery_days || 2;
      
      if (orderData.delivery_date) {
        const deliveryDate = new Date(orderData.delivery_date);
        const today = new Date();
        const diffTime = deliveryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < minimumDeliveryDays) {
          return { 
            success: false, 
            error: `Delivery must be at least ${minimumDeliveryDays} day${minimumDeliveryDays !== 1 ? 's' : ''} in advance. Please select a later date.` 
          };
        }
      }

      const total = getTotalPrice();

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address,
          delivery_date: orderData.delivery_date,
          special_instructions: orderData.special_instructions,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_per_item: item.totalPrice / item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      clearCart();
      toast.success('Order placed successfully!');
      return { success: true, orderId: order.id };

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
      return { success: false, error: 'Failed to place order' };
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};