import { Product } from '@/types/product';
import chocolateCake from '@/assets/chocolate-cake.jpg';
import vanillaWeddingCake from '@/assets/vanilla-wedding-cake.jpg';
import redVelvetCake from '@/assets/red-velvet-cake.jpg';
import rainbowCake from '@/assets/rainbow-cake.jpg';
import blueberryCheesecake from '@/assets/blueberry-cheesecake.jpg';
import lavaCake from '@/assets/lava-cake.jpg';
import strawberryShortcake from '@/assets/strawberry-shortcake.jpg';
import tiramisuCake from '@/assets/tiramisu-cake.jpg';
import lemonCake from '@/assets/lemon-cake.jpg';
import carrotCake from '@/assets/carrot-cake.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Chocolate Dream',
    description: 'Rich chocolate cake with velvety frosting and fresh strawberries',
    price: 45.00,
    image: chocolateCake,
    category: 'Birthday',
    rating: 4.9
  },
  {
    id: '2',
    name: 'Vanilla Wedding',
    description: 'Elegant three-tier wedding cake with buttercream and roses',
    price: 120.00,
    image: vanillaWeddingCake,
    category: 'Wedding',
    rating: 5.0
  },
  {
    id: '3',
    name: 'Red Velvet Classic',
    description: 'Traditional red velvet with cream cheese frosting',
    price: 38.00,
    image: redVelvetCake,
    category: 'Classic',
    rating: 4.8
  },
  {
    id: '4',
    name: 'Rainbow Celebration',
    description: 'Colorful rainbow layers perfect for birthdays and celebrations',
    price: 52.00,
    image: rainbowCake,
    category: 'Birthday',
    rating: 4.7
  },
  {
    id: '5',
    name: 'Blueberry Cheesecake',
    description: 'Creamy cheesecake topped with fresh blueberry compote',
    price: 42.00,
    image: blueberryCheesecake,
    category: 'Cheesecake',
    rating: 4.9
  },
  {
    id: '6',
    name: 'Chocolate Lava',
    description: 'Decadent molten chocolate cake with vanilla ice cream',
    price: 28.00,
    image: lavaCake,
    category: 'Individual',
    rating: 4.8
  },
  {
    id: '7',
    name: 'Strawberry Shortcake',
    description: 'Light sponge cake with fresh strawberries and whipped cream',
    price: 35.00,
    image: strawberryShortcake,
    category: 'Classic',
    rating: 4.6
  },
  {
    id: '8',
    name: 'Tiramisu Delight',
    description: 'Coffee-soaked ladyfingers with mascarpone cream',
    price: 48.00,
    image: tiramisuCake,
    category: 'Italian',
    rating: 4.9
  },
  {
    id: '9',
    name: 'Lemon Sunshine',
    description: 'Zesty lemon cake with bright citrus frosting',
    price: 32.00,
    image: lemonCake,
    category: 'Citrus',
    rating: 4.5
  },
  {
    id: '10',
    name: 'Carrot Garden',
    description: 'Moist carrot cake with cinnamon and cream cheese frosting',
    price: 40.00,
    image: carrotCake,
    category: 'Classic',
    rating: 4.7
  }
];