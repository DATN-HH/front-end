'use client';
import { ArrowLeft, Edit, Archive, FolderOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

import {
    useCategory,
    useProductCountByCategory,
    useProductsByCategory,
    useArchiveCategory,
    useUnarchiveCategory,
    ProductListResponse,
} from '@/api/v1/menu/categories';
import { CategoryEditModal } from '@/components/modals/CategoryEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Product Card Component
const ProductCard = ({ product }: { product: ProductListResponse }) => {
    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
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

    const getTypeBadge = (type: string) => {
        const typeColors = {
            CONSUMABLE: 'bg-blue-100 text-blue-800',
            STOCKABLE: 'bg-green-100 text-green-800',
            SERVICE: 'bg-purple-100 text-purple-800',
            EXTRA: 'bg-orange-100 text-orange-800',
        };

        return (
            <Badge
                className={
                    typeColors[type as keyof typeof typeColors] ||
                    'bg-gray-100 text-gray-800'
                }
            >
                {type}
            </Badge>
        );
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-medium text-sm">
                                {product.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {product.internalReference}
                            </p>
                        </div>
                        {getStatusBadge(product.status)}
                    </div>

                    <div className="flex items-center justify-between">
                        {getTypeBadge(product.type)}
                        <div className="text-right">
                            <p className="text-sm font-medium">
                                {formatCurrency(product.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Cost: {formatCurrency(product.cost)}
                            </p>
                        </div>
                    </div>

                    {product.size && (
                        <p className="text-xs text-gray-600">
                            Size: {product.size}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex gap-2">
                            <Badge
                                variant={
                                    product.canBeSold ? 'default' : 'secondary'
                                }
                                className="text-xs"
                            >
                                {product.canBeSold
                                    ? 'Sellable'
                                    : 'Not Sellable'}
                            </Badge>
                        </div>
                        <Link href={`/app/menu/products/${product.id}/detail`}>
                            <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CategoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { toast } = useToast();
    const { id } = use(params);
    const categoryId = parseInt(id);

    // State for edit modal
    const [showEditModal, setShowEditModal] = useState(false);

    // API hooks using /api/menu/categories/{id}, /api/menu/categories/{id}/product-count, and /api/menu/categories/{id}/products
    const { data: category, isLoading, error } = useCategory(categoryId);
    const { data: productCount } = useProductCountByCategory(categoryId);
    const { data: products, isLoading: productsLoading } =
        useProductsByCategory(categoryId);
    const archiveCategoryMutation = useArchiveCategory();
    const unarchiveCategoryMutation = useUnarchiveCategory();

    const handleArchive = async () => {
        if (!category) return;

        try {
            await archiveCategoryMutation.mutateAsync(categoryId);
            toast({
                title: 'Category Archived',
                description: `${category.name} has been archived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to archive category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnarchive = async () => {
        if (!category) return;

        try {
            await unarchiveCategoryMutation.mutateAsync(categoryId);
            toast({
                title: 'Category Unarchived',
                description: `${category.name} has been unarchived successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to unarchive category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'DELETED':
                return <Badge variant="destructive">Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading category details...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/categories">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Category Not Found
                        </h1>
                        <p className="text-muted-foreground">
                            The category you're looking for doesn't exist.
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {error?.message || 'Category not found'}
                            </p>
                            <Link href="/app/menu/categories">
                                <Button>Back to Categories</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isArchived = category.status === 'DELETED';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/categories">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {category.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Category details and configuration
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {!isArchived && (
                        <>
                            <Button onClick={() => setShowEditModal(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleArchive}
                                disabled={archiveCategoryMutation.isPending}
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                        </>
                    )}
                    {isArchived && (
                        <Button
                            onClick={handleUnarchive}
                            disabled={unarchiveCategoryMutation.isPending}
                        >
                            Unarchive
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">
                        General Information
                    </TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Core category details and configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Category Name
                                        </label>
                                        <p className="text-sm font-medium">
                                            {category.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Category Code
                                        </label>
                                        <p className="text-sm font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                                            {category.code}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Status
                                        </label>
                                        <div className="mt-1">
                                            {getStatusBadge(category.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Description
                                        </label>
                                        <p className="text-sm">
                                            {category.description ||
                                                'No description provided'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                                <CardDescription>
                                    Category usage and metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Total Products
                                        </label>
                                        <div className="mt-1">
                                            <Badge
                                                variant="outline"
                                                className="text-lg px-3 py-1"
                                            >
                                                {productCount !== undefined
                                                    ? productCount
                                                    : '...'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Created Date
                                        </label>
                                        <p className="text-sm">
                                            {formatDate(category.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Last Updated
                                        </label>
                                        <p className="text-sm">
                                            {formatDate(category.updatedAt)}
                                        </p>
                                    </div>
                                    {category.createdBy && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Created By
                                            </label>
                                            <p className="text-sm">
                                                {category.createdBy}
                                            </p>
                                        </div>
                                    )}
                                    {category.updatedBy && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                Updated By
                                            </label>
                                            <p className="text-sm">
                                                {category.updatedBy}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products in this Category</CardTitle>
                            <CardDescription>
                                {productCount !== undefined
                                    ? `${productCount} products found in this category`
                                    : 'Loading product count...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productsLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                                        <p className="text-gray-500">
                                            Loading products...
                                        </p>
                                    </div>
                                </div>
                            ) : products && products.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                            />
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t">
                                        <Link
                                            href={`/app/menu/products?category=${category.id}`}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View All Products in Products
                                                Page
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 mb-4">
                                            No products found in this category
                                        </p>
                                        <Link
                                            href={`/app/menu/products/new?category=${category.id}`}
                                        >
                                            <Button>Add First Product</Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Analytics</CardTitle>
                            <CardDescription>
                                Performance metrics and insights for this
                                category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">
                                        Analytics dashboard coming soon
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Category Modal */}
            <CategoryEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                category={category}
            />
        </div>
    );
}
