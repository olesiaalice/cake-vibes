export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

export interface Customization {
  toppings: string[];
  size: 'small' | 'medium' | 'large';
  color: string;
  flavor: string;
  specialInstructions?: string;
  customImage?: File;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: Customization;
  totalPrice: number;
}

export interface Order {
  items: CartItem[];
  deliveryDate: Date;
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    holderName: string;
  };
  specialNotes?: string;
  totalAmount: number;
}