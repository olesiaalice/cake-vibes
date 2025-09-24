export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_date?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_item: number;
  created_at: string;
}

export interface OrderWithItems {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_date?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  order_items: Array<OrderItem & {
    products: {
      name: string;
      image: string;
    };
  }>;
}

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_date?: string;
  special_instructions?: string;
}