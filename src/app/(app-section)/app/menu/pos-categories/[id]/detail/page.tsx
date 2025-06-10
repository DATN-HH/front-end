'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Tags, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Mock data
const category = {
    id: 1,
    name: 'Main Course',
    parentCategory: null,
    sequence: 2,
    productCount: 15,
    active: true,
    description:
        'Main dishes including rice, noodles, and traditional Vietnamese cuisine',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-20',
    products: [
        { id: 1, name: 'Beef Pho', price: 50000, active: true },
        { id: 2, name: 'Grilled Pork Vermicelli', price: 45000, active: true },
        { id: 3, name: 'Broken Rice', price: 40000, active: true },
        { id: 4, name: 'Grilled Pork Banh Mi', price: 30000, active: true },
        { id: 5, name: 'Grilled Meat', price: 55000, active: true },
    ],
    subcategories: [
        { id: 3, name: 'Pho', productCount: 6, sequence: 1 },
        { id: 4, name: 'Noodles', productCount: 4, sequence: 2 },
        { id: 10, name: 'Banh Mi', productCount: 2, sequence: 3 },
    ],
};

export default function PosCategoryDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { toast } = useToast();

    const handleDelete = () => {
        toast({
            title: 'Category Deleted',
            description: `${category.name} has been deleted successfully.`,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 1000); // Convert VND to USD for display
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/pos-categories">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {category.name}
                        </h1>
                        <p className="text-muted-foreground">
                            POS category details and configuration
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/app/menu/pos-categories/${category.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">
                        General Information
                    </TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="subcategories">
                        Subcategories
                    </TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                            Parent Category
                                        </label>
                                        <p className="text-sm font-medium">
                                            {category.parentCategory ||
                                                'Root Category'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Sequence
                                        </label>
                                        <p className="text-sm font-medium">
                                            {category.sequence}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Product Count
                                        </label>
                                        <p className="text-sm font-medium">
                                            {category.productCount}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Created Date
                                        </label>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                category.createdAt
                                            ).toLocaleDateString('en-US')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Last Updated
                                        </label>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                category.updatedAt
                                            ).toLocaleDateString('en-US')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Description
                                    </label>
                                    <p className="text-sm">
                                        {category.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Category Icon</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <Tags className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">
                                            No icon uploaded
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Active
                                    </label>
                                    <Badge
                                        variant={
                                            category.active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {category.active ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Visible in POS
                                    </label>
                                    <Badge variant="default">Yes</Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Has Products
                                    </label>
                                    <Badge
                                        variant={
                                            category.productCount > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {category.productCount > 0
                                            ? 'Yes'
                                            : 'No'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Has Subcategories
                                    </label>
                                    <Badge
                                        variant={
                                            category.subcategories.length > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {category.subcategories.length > 0
                                            ? 'Yes'
                                            : 'No'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products in this Category</CardTitle>
                            <CardDescription>
                                List of products assigned to this category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {category.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Package className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <h4 className="font-medium">
                                                    {product.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Product ID: {product.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        product.price
                                                    )}
                                                </p>
                                                <Badge
                                                    variant={
                                                        product.active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {product.active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <Link
                                                href={`/app/menu/products/${product.id}/detail`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subcategories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subcategories</CardTitle>
                            <CardDescription>
                                Child categories under this category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {category.subcategories.map((subcategory) => (
                                    <div
                                        key={subcategory.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Tags className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <h4 className="font-medium">
                                                    {subcategory.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Sequence:{' '}
                                                    {subcategory.sequence}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {subcategory.productCount}{' '}
                                                    products
                                                </p>
                                            </div>
                                            <Link
                                                href={`/app/menu/pos-categories/${subcategory.id}/detail`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Display Order
                                        </label>
                                        <p className="text-sm">
                                            Sequence: {category.sequence}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Visibility
                                        </label>
                                        <p className="text-sm">
                                            Visible in POS
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Layout
                                        </label>
                                        <p className="text-sm">Grid view</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Color Theme
                                        </label>
                                        <p className="text-sm">Default</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
