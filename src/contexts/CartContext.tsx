import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Customization } from '@/types/product';
import { CreateOrderData } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, customization?: Customization) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

  const addToCart = (product: Product, quantity = 1, customization?: Customization) => {
    const basePrice = product.price;
    const customizationPrice = customization ? calculateCustomizationPrice(customization) : 0;
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId) {
          const basePrice = item.product.price;
          const customizationPrice = item.customization ? calculateCustomizationPrice(item.customization) : 0;
          const totalPrice = (basePrice + customizationPrice) * quantity;
          
          return { ...item, quantity, totalPrice };
        }
        return item;
      })
    );
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

  const calculateCustomizationPrice = (customization: Customization): number => {
    let price = 0;
    
    // Size pricing
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
    
    // Toppings pricing (each topping adds $3)
    price += customization.toppings.length * 3;
    
    return price;
  };

  const placeOrder = async (orderData: CreateOrderData) => {
    if (!user) {
      return { success: false, error: 'User must be logged in to place an order' };
    }

    if (items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
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