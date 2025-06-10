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
import { ArrowLeft, Edit, Trash2, Settings, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Mock data
const attribute = {
    id: 1,
    name: 'Pizza Size',
    displayType: 'Radio',
    creationMode: 'Instantly',
    valueCount: 3,
    values: [
        { id: 1, name: 'Small', sequence: 1, active: true, usageCount: 15 },
        { id: 2, name: 'Medium', sequence: 2, active: true, usageCount: 28 },
        { id: 3, name: 'Large', sequence: 3, active: true, usageCount: 22 },
    ],
    active: true,
    description: 'Size options for pizza products',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    usedInProducts: [
        { id: 1, name: 'Margherita Pizza', variantCount: 3 },
        { id: 2, name: 'Pepperoni Pizza', variantCount: 3 },
        { id: 3, name: 'Hawaiian Pizza', variantCount: 2 },
        { id: 4, name: 'Meat Lovers Pizza', variantCount: 3 },
    ],
};

export default function AttributeDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { toast } = useToast();

    const handleDelete = () => {
        toast({
            title: 'Attribute Deleted',
            description: `${attribute.name} has been deleted successfully.`,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/attributes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {attribute.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Product attribute details and configuration
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/app/menu/attributes/${attribute.id}/edit`}>
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
                    <TabsTrigger value="values">Values</TabsTrigger>
                    <TabsTrigger value="products">Used in Products</TabsTrigger>
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
                                            Attribute Name
                                        </label>
                                        <p className="text-sm font-medium">
                                            {attribute.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Display Type
                                        </label>
                                        <Badge variant="outline">
                                            {attribute.displayType}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Creation Mode
                                        </label>
                                        <Badge variant="secondary">
                                            {attribute.creationMode}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Value Count
                                        </label>
                                        <p className="text-sm font-medium">
                                            {attribute.valueCount}
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
                                                attribute.createdAt
                                            ).toLocaleDateString('en-US')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Last Updated
                                        </label>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                attribute.updatedAt
                                            ).toLocaleDateString('en-US')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Description
                                    </label>
                                    <p className="text-sm">
                                        {attribute.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {attribute.usedInProducts.length}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Products using this attribute
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {attribute.values.reduce(
                                            (sum, value) =>
                                                sum + value.usageCount,
                                            0
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Total variants created
                                    </p>
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
                                            attribute.active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {attribute.active ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Has Values
                                    </label>
                                    <Badge
                                        variant={
                                            attribute.valueCount > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {attribute.valueCount > 0
                                            ? 'Yes'
                                            : 'No'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Used in Products
                                    </label>
                                    <Badge
                                        variant={
                                            attribute.usedInProducts.length > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {attribute.usedInProducts.length > 0
                                            ? 'Yes'
                                            : 'No'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Auto Create Variants
                                    </label>
                                    <Badge
                                        variant={
                                            attribute.creationMode ===
                                            'Instantly'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {attribute.creationMode === 'Instantly'
                                            ? 'Yes'
                                            : 'No'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="values" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attribute Values</CardTitle>
                            <CardDescription>
                                List of possible values for this attribute
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {attribute.values.map((value) => (
                                    <div
                                        key={value.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Settings className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <h4 className="font-medium">
                                                    {value.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Sequence: {value.sequence}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {value.usageCount} variants
                                                </p>
                                                <Badge
                                                    variant={
                                                        value.active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {value.active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products Using This Attribute</CardTitle>
                            <CardDescription>
                                Products that have variants based on this
                                attribute
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {attribute.usedInProducts.map((product) => (
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
                                                    {product.variantCount}{' '}
                                                    variants
                                                </p>
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

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attribute Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Display Type
                                        </label>
                                        <p className="text-sm">
                                            {attribute.displayType}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Variant Creation
                                        </label>
                                        <p className="text-sm">
                                            {attribute.creationMode}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Required
                                        </label>
                                        <p className="text-sm">Yes</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Multiple Selection
                                        </label>
                                        <p className="text-sm">No</p>
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
