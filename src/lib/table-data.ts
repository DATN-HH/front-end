import type { Table } from './types';

export const tables: Table[] = [
    { id: '1', number: 1, capacity: 2, status: 'available', x: 20, y: 30, restaurantId: 'default' },
    { id: '2', number: 2, capacity: 2, status: 'occupied', x: 40, y: 30, restaurantId: 'default' },
    { id: '3', number: 3, capacity: 4, status: 'available', x: 60, y: 30, restaurantId: 'default' },
    { id: '4', number: 4, capacity: 4, status: 'reserved', x: 80, y: 30, restaurantId: 'default' },
    { id: '5', number: 5, capacity: 6, status: 'available', x: 20, y: 60, restaurantId: 'default' },
    { id: '6', number: 6, capacity: 6, status: 'available', x: 40, y: 60, restaurantId: 'default' },
    { id: '7', number: 7, capacity: 8, status: 'available', x: 60, y: 60, restaurantId: 'default' },
    { id: '8', number: 8, capacity: 2, status: 'occupied', x: 80, y: 60, restaurantId: 'default' },
];
