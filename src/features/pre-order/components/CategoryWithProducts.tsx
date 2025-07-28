'use client';

import { useMenuProductsByCategory } from '@/api/v1/menu/menu-products';
import { Button } from '@/components/ui/button';

interface CategoryWithProductsProps {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    onClick: () => void;
}

export function CategoryWithProducts({
    categoryId,
    categoryName,
    isActive,
    onClick,
}: CategoryWithProductsProps) {
    const { data: products } = useMenuProductsByCategory(categoryId);

    // Don't render if no products
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={`flex-shrink-0 ${
                isActive
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'hover:bg-orange-50'
            }`}
            onClick={onClick}
        >
            {categoryName}
        </Button>
    );
}
