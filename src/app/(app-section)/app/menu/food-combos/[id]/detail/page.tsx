'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Archive,
    ShoppingCart,
    Package,
    Users,
    Clock,
    DollarSign,
    Image as ImageIcon,
    RotateCcw,
    Settings,
    Eye
} from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { 
    useFoodCombo, 
    useDeleteFoodCombo,
    FoodComboResponse,
    ComboItemResponse,
    Status 
} from '@/api/v1/menu/food-combos';

export default function FoodComboDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const comboId = Number(params.id);
    const { data: combo, isLoading, error } = useFoodCombo(comboId);
    const deleteComboMutation = useDeleteFoodCombo();

    const [showEditModal, setShowEditModal] = useState(false);

    const handleDelete = async () => {
        if (!combo) return;
        
        const confirmed = confirm(`Are you sure you want to delete "${combo.name}"? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            await deleteComboMutation.mutateAsync(comboId);
            toast({
                title: 'Food Combo Deleted',
                description: `${combo.name} has been deleted successfully.`,
            });
            router.push('/app/menu/food-combos');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete food combo. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusBadge = (status: Status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'DELETED':
                return <Badge variant="destructive">Deleted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={ShoppingCart}
                    title="Loading..."
                    left={
                        <Link href="/app/menu/food-combos">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    }
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !combo) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={ShoppingCart}
                    title="Error"
                    left={
                        <Link href="/app/menu/food-combos">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    }
                />
                <div className="text-center text-red-500 py-8">
                    Error loading food combo: {error?.message || 'Food combo not found'}
                </div>
            </div>
        );
    }

    const isDeleted = combo.status === 'DELETED';
    const hasCustomPricing = combo.price && combo.price !== combo.effectivePrice;

    return (
        <div className="space-y-6">
            <PageTitle
                icon={ShoppingCart}
                title={combo.name}
                left={
                    <Link href="/app/menu/food-combos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                }
                right={
                    <div className="flex items-center space-x-3">
                        {getStatusBadge(combo.status)}
                        {!isDeleted && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditModal(true)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={handleDelete}
                                    disabled={deleteComboMutation.isPending}
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-base">{combo.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Internal Reference</label>
                                <p className="text-base">{combo.internalReference || '-'}</p>
                            </div>
                        </div>

                        {combo.description && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="text-base">{combo.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Category</label>
                                <p className="text-base">{combo.categoryName || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">POS Category</label>
                                <p className="text-base">{combo.posCategoryName || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Items Count</label>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="text-base">{combo.itemsCount}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Variants Count</label>
                                <div className="flex items-center space-x-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <span className="text-base">{combo.variantsCount}</span>
                                </div>
                            </div>
                            {combo.estimateTime && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estimate Time</label>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-base">{combo.estimateTime} min</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Image & Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ImageIcon className="h-5 w-5" />
                            <span>Image & Stats</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Image */}
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {combo.image ? (
                                <Image
                                    src={combo.image}
                                    alt={combo.name}
                                    width={200}
                                    height={200}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="text-center">
                                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No image</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Can Be Sold</span>
                                <Badge variant={combo.canBeSold ? 'default' : 'secondary'}>
                                    {combo.canBeSold ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Available in POS</span>
                                <Badge variant={combo.availableInPos ? 'default' : 'secondary'}>
                                    {combo.availableInPos ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            {combo.posSequence && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">POS Sequence</span>
                                    <span className="text-sm font-medium">{combo.posSequence}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pricing Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Pricing Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <label className="text-sm font-medium text-gray-500">Effective Price</label>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(combo.effectivePrice)}
                            </p>
                            <p className="text-xs text-gray-500">Final selling price</p>
                        </div>
                        
                        {hasCustomPricing && (
                            <div className="text-center">
                                <label className="text-sm font-medium text-gray-500">Override Price</label>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(combo.price)}
                                </p>
                                <p className="text-xs text-gray-500">Custom price override</p>
                            </div>
                        )}
                        
                        <div className="text-center">
                            <label className="text-sm font-medium text-gray-500">Calculated Price</label>
                            <p className="text-2xl font-bold text-gray-600">
                                {formatCurrency(combo.calculatedPrice)}
                            </p>
                            <p className="text-xs text-gray-500">Sum of item prices</p>
                        </div>
                        
                        <div className="text-center">
                            <label className="text-sm font-medium text-gray-500">Effective Cost</label>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(combo.effectiveCost)}
                            </p>
                            <p className="text-xs text-gray-500">Total cost</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for detailed information */}
            <Tabs defaultValue="items" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="items">Combo Items ({combo.itemsCount})</TabsTrigger>
                    {combo.hasAttributes && (
                        <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    )}
                    {combo.hasVariants && (
                        <TabsTrigger value="variants">Variants ({combo.variantsCount})</TabsTrigger>
                    )}
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Combo Items</CardTitle>
                            <CardDescription>
                                Products included in this combo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {combo.comboItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No items in this combo</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {combo.comboItems.map((item: ComboItemResponse, index: number) => (
                                        <div key={item.id} className="border rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    {item.productImage ? (
                                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium">{item.productName}</h4>
                                                        {item.isOptional && (
                                                            <Badge variant="outline" className="text-xs">Optional</Badge>
                                                        )}
                                                        {item.isSubstitutable && (
                                                            <Badge variant="outline" className="text-xs">Substitutable</Badge>
                                                        )}
                                                    </div>
                                                    {item.productDescription && (
                                                        <p className="text-sm text-gray-500">{item.productDescription}</p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-sm text-blue-600 italic">Note: {item.notes}</p>
                                                    )}
                                                </div>

                                                {/* Pricing & Quantity */}
                                                <div className="text-right space-y-1">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Qty: </span>
                                                        <span className="font-medium">{item.quantity}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Unit: </span>
                                                        <span className="font-medium">{formatCurrency(item.effectiveUnitPrice)}</span>
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        <span className="text-gray-500">Total: </span>
                                                        <span className="text-green-600">{formatCurrency(item.totalPrice)}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Seq: {item.sequenceOrder}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {combo.hasAttributes && (
                    <TabsContent value="attributes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attributes</CardTitle>
                                <CardDescription>
                                    Attributes assigned to this combo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {combo.attributeLines.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Settings className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No attributes assigned</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {combo.attributeLines.map((attributeLine) => (
                                            <div key={attributeLine.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{attributeLine.attributeName}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            Type: {attributeLine.attributeDisplayType}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{attributeLine.displayValue}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {combo.hasVariants && (
                    <TabsContent value="variants" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Variants</CardTitle>
                                <CardDescription>
                                    Different variations of this combo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {combo.variants.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No variants created</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {combo.variants.map((variant) => (
                                            <div key={variant.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{variant.displayName}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {variant.attributeCombination}
                                                        </p>
                                                        {variant.internalReference && (
                                                            <p className="text-sm text-gray-400">
                                                                Ref: {variant.internalReference}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-green-600">
                                                            {formatCurrency(variant.effectivePrice)}
                                                        </p>
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusBadge(variant.status)}
                                                            <Badge variant={variant.isActive ? 'default' : 'secondary'}>
                                                                {variant.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="audit" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                            <CardDescription>
                                Creation and modification history
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-base">
                                        {new Date(combo.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Updated At</label>
                                    <p className="text-base">
                                        {new Date(combo.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}