'use client';

import React, { useEffect, useState } from 'react';
import { ProductFeedbackForm } from '@/features/feedback/components/ProductFeedbackForm';

export default function ProductFeedbackPage() {
    const [branches, setBranches] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const [products, setProducts] = useState<
        Array<{ id: number; name: string; category?: string }>
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Mock data for now since we don't have the APIs implemented
                setBranches([
                    { id: 1, name: 'Branch 1' },
                    { id: 2, name: 'Branch 2' },
                    { id: 3, name: 'Branch 3' },
                ]);

                setProducts([
                    { id: 1, name: 'Margherita Pizza', category: 'Pizza' },
                    { id: 2, name: 'Caesar Salad', category: 'Salads' },
                    { id: 3, name: 'Beef Burger', category: 'Burgers' },
                    { id: 4, name: 'Chocolate Cake', category: 'Desserts' },
                    { id: 5, name: 'Grilled Salmon', category: 'Main Course' },
                    { id: 6, name: 'Pasta Carbonara', category: 'Pasta' },
                    { id: 7, name: 'Chicken Wings', category: 'Appetizers' },
                    { id: 8, name: 'Tiramisu', category: 'Desserts' },
                    { id: 9, name: 'Fish & Chips', category: 'Main Course' },
                    { id: 10, name: 'Greek Salad', category: 'Salads' },
                ]);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
                    <div className="bg-gray-200 rounded-lg h-96"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Rate Our Products</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Help us improve our menu! Share your thoughts about specific
                    dishes and products. Your feedback helps our chefs create
                    better flavors and experiences.
                </p>
            </div>

            <ProductFeedbackForm
                branches={branches}
                products={products}
                onSuccess={() => {
                    // Redirect to thank you page or show success message
                    window.location.href = '/feedback/thank-you';
                }}
            />
        </div>
    );
}
