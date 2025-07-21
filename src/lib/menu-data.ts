import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: '1',
    name: 'Crispy Calamari',
    description: 'Fresh squid rings with marinara sauce',
    price: 12.99,
    image: '/placeholder.svg?height=200&width=300&query=crispy calamari rings',
    category: 'Appetizers',
  },
  {
    id: '2',
    name: 'Buffalo Wings',
    description: 'Spicy chicken wings with blue cheese dip',
    price: 14.99,
    image: '/placeholder.svg?height=200&width=300&query=buffalo chicken wings',
    category: 'Appetizers',
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'Mozzarella Sticks',
    description: 'Golden fried mozzarella with marinara',
    price: 9.99,
    originalPrice: 12.99,
    image: '/placeholder.svg?height=200&width=300&query=mozzarella sticks',
    category: 'Appetizers',
    isPromotion: true,
    promotionType: 'fixed',
    promotionValue: 3,
  },

  // Main Courses
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herb butter',
    price: 24.99,
    image:
      '/placeholder.svg?height=200&width=300&query=grilled salmon with vegetables',
    category: 'Main Courses',
    isBestSeller: true,
  },
  {
    id: '5',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye with garlic mashed potatoes',
    price: 32.99,
    image:
      '/placeholder.svg?height=200&width=300&query=ribeye steak with mashed potatoes',
    category: 'Main Courses',
  },
  {
    id: '6',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with pasta marinara',
    price: 19.99,
    image:
      '/placeholder.svg?height=200&width=300&query=chicken parmesan with pasta',
    category: 'Main Courses',
  },
  {
    id: '7',
    name: 'Vegetarian Pasta',
    description: 'Penne with roasted vegetables and pesto',
    price: 16.99,
    originalPrice: 19.99,
    image:
      '/placeholder.svg?height=200&width=300&query=vegetarian pasta with pesto',
    category: 'Main Courses',
    isPromotion: true,
    promotionType: 'percentage',
    promotionValue: 15,
  },

  // Burgers
  {
    id: '8',
    name: 'Classic Beef Burger',
    description: 'Angus beef patty with lettuce, tomato, onion',
    price: 16.99,
    image:
      '/placeholder.svg?height=200&width=300&query=classic beef burger with fries',
    category: 'Burgers',
    isBestSeller: true,
  },
  {
    id: '9',
    name: 'BBQ Bacon Burger',
    description: 'Beef patty with BBQ sauce, bacon, and cheddar',
    price: 18.99,
    image: '/placeholder.svg?height=200&width=300&query=bbq bacon burger',
    category: 'Burgers',
  },
  {
    id: '10',
    name: 'Veggie Burger',
    description: 'Plant-based patty with avocado and sprouts',
    price: 15.99,
    image:
      '/placeholder.svg?height=200&width=300&query=veggie burger with avocado',
    category: 'Burgers',
  },

  // Desserts
  {
    id: '11',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with vanilla ice cream',
    price: 8.99,
    image:
      '/placeholder.svg?height=200&width=300&query=chocolate lava cake with ice cream',
    category: 'Desserts',
    isBestSeller: true,
  },
  {
    id: '12',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 7.99,
    image: '/placeholder.svg?height=200&width=300&query=tiramisu dessert',
    category: 'Desserts',
  },

  // Combos
  {
    id: '13',
    name: 'Family Feast',
    description: 'Perfect for sharing - includes multiple dishes',
    price: 49.99,
    originalPrice: 65.99,
    image:
      '/placeholder.svg?height=200&width=300&query=family feast combo meal',
    category: 'Combos',
    isCombo: true,
    comboItems: [
      { name: 'Buffalo Wings', quantity: 1 },
      { name: 'Classic Beef Burger', quantity: 2 },
      { name: 'Mozzarella Sticks', quantity: 1 },
      { name: 'Chocolate Lava Cake', quantity: 2 },
    ],
    isPromotion: true,
    promotionType: 'fixed',
    promotionValue: 16,
  },
  {
    id: '14',
    name: 'Date Night Special',
    description: 'Romantic dinner for two',
    price: 39.99,
    originalPrice: 49.98,
    image:
      '/placeholder.svg?height=200&width=300&query=romantic dinner for two',
    category: 'Combos',
    isCombo: true,
    comboItems: [
      { name: 'Grilled Salmon', quantity: 2 },
      { name: 'Tiramisu', quantity: 2 },
    ],
    isPromotion: true,
    promotionType: 'percentage',
    promotionValue: 20,
  },
];

export const categories = [
  'All',
  'Appetizers',
  'Main Courses',
  'Burgers',
  'Desserts',
  'Combos',
];

export const quickNotes = [
  'No onions',
  'Extra spicy',
  'On the side',
  'Well done',
  'Medium rare',
  'No cheese',
  'Extra sauce',
  'Gluten free',
  'Vegetarian',
  'Less salt',
];
