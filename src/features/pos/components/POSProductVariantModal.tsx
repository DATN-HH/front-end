'use client';

import { ProductVariantResponse } from '@/api/v1/menu/product-attributes';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Add Vietnamese currency formatter at the top
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Local interface for variant display
interface ProductVariant {
    id: number;
    name: string;
    displayName: string;
    price?: number;
    effectivePrice?: number;
    attributeCombination?: string;
    isActive: boolean;
}

interface POSProductVariantModalProps {
    product: any;
    onVariantSelect: (variant: ProductVariantResponse) => void;
    onClose: () => void;
}

interface VariantCardProps {
    variant: ProductVariant;
    onClick: () => void;
}

function VariantCard({ variant, onClick }: VariantCardProps) {
    return (
        <button
            onClick={onClick}
            className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left w-full"
        >
            <div className="font-medium">
                {variant.displayName || variant.name}
            </div>
            <div className="text-sm text-gray-600 mt-1">
                {variant.attributeCombination}
            </div>
            <div className="text-lg font-semibold text-green-600 mt-2">
                {formatVND(variant.effectivePrice || variant.price || 0)}
            </div>
        </button>
    );
}

export function POSProductVariantModal({
    product,
    onVariantSelect,
    onClose,
}: POSProductVariantModalProps) {
    // Convert API response to local variant type
    const variants: ProductVariant[] = (product.variants || [])
        .filter((v: any) => v.price || v.effectivePrice)
        .map((v: any) => ({
            id: v.id,
            name: v.name,
            displayName: v.displayName,
            price: v.price,
            effectivePrice: v.effectivePrice,
            attributeCombination: v.attributeCombination,
            isActive: v.isActive !== false,
        }));

    return (
        <Dialog open onOpenChange={() => onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-6">
                        {product.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {variants.map((variant) => (
                            <VariantCard
                                key={variant.id}
                                variant={variant}
                                onClick={() => {
                                    // Convert back to API response type when selecting
                                    const apiVariant: ProductVariantResponse = {
                                        id: variant.id,
                                        name: variant.name,
                                        displayName: variant.displayName,
                                        price: variant.price,
                                        effectivePrice: variant.effectivePrice,
                                        attributeCombination:
                                            variant.attributeCombination,
                                        isActive: variant.isActive,
                                        status: 'ACTIVE',
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                        productTemplateId: product.id,
                                        productTemplateName: product.name,
                                    };
                                    onVariantSelect(apiVariant);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
