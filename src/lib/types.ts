export interface MenuItem {
    id: string;
    name: string;
    description: string;
    detailedDescription: string;
    price: number;
    originalPrice?: number;
    image: string;
    images: string[];
    category: string;
    isPromotion?: boolean;
    promotionType?: 'percentage' | 'fixed';
    promotionValue?: number;
    isBestSeller?: boolean;
    isCombo?: boolean;
    comboItems?: { name: string; quantity: number; id: string }[];
    ingredients: string[];
    allergens: string[];
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    preparationTime: number;
    spiceLevel?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    rating: number;
    reviewCount: number;
    chef?: string;
    restaurantId: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    images?: string[];
    helpful: number;
}

export interface Restaurant {
    id: string;
    name: string;
    description: string;
    cuisine: string[];
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    rating: number;
    reviewCount: number;
    image: string;
    images: string[];
    address: string;
    phone: string;
    email: string;
    website?: string;
    coordinates: { lat: number; lng: number };
    hours: {
        [key: string]: { open: string; close: string; closed?: boolean };
    };
    features: string[];
    dressCode: string;
    reservationPolicy: string;
    cancellationPolicy: string;
}

export interface CartItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
    customizations?: string[];
}

export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    x: number;
    y: number;
    restaurantId: string;
}

export interface BookingData {
    tableId?: string;
    startTime: string;
    endTime?: string;
    guests: number;
    notes?: string;
    restaurantId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
}

export interface OrderData {
    type: 'dine-in' | 'takeaway' | 'delivery';
    tableNumber?: string;
    address?: string;
    branch?: string;
    restaurantId?: string;
    notes?: string;
    scheduledTime?: string;
}
