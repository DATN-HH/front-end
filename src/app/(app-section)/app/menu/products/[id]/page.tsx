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
import { ArrowLeft, Edit, Archive, ImageIcon, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Mock data
const product = {
    id: 1,
    name: 'Phở Bò Tái',
    type: 'Consumable',
    price: 50000,
    cost: 30000,
    internalReference: 'PHO001',
    category: 'Món chính',
    posCategory: 'Phở',
    active: true,
    availableInPos: true,
    canBeSold: true,
    canBePurchased: false,
    hasImage: true,
    description:
        'Phở bò tái truyền thống với nước dùng đậm đà, thịt bò tái mềm ngon',
    variants: [
        {
            id: 1,
            name: 'Phở Bò Tái - Nhỏ',
            price: 45000,
            attributes: 'Kích cỡ: Nhỏ',
        },
        {
            id: 2,
            name: 'Phở Bò Tái - Vừa',
            price: 50000,
            attributes: 'Kích cỡ: Vừa',
        },
        {
            id: 3,
            name: 'Phở Bò Tái - Lớn',
            price: 60000,
            attributes: 'Kích cỡ: Lớn',
        },
    ],
};

export default function ProductDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { toast } = useToast();

    const handleArchive = () => {
        toast({
            title: 'Sản phẩm đã được lưu trữ',
            description: `${product.name} đã được lưu trữ thành công.`,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/products">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {product.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Chi tiết sản phẩm và cấu hình
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/app/menu/products/${product.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={handleArchive}>
                        <Archive className="mr-2 h-4 w-4" />
                        Lưu trữ
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="variants">Biến thể</TabsTrigger>
                    <TabsTrigger value="sales">Bán hàng</TabsTrigger>
                    <TabsTrigger value="pos">Point of Sale</TabsTrigger>
                    <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Tên sản phẩm
                                        </label>
                                        <p className="text-sm font-medium">
                                            {product.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Loại sản phẩm
                                        </label>
                                        <Badge variant="outline">
                                            {product.type}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Giá bán
                                        </label>
                                        <p className="text-sm font-medium">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Giá vốn
                                        </label>
                                        <p className="text-sm font-medium">
                                            {formatCurrency(product.cost)}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Mã nội bộ
                                        </label>
                                        <p className="text-sm font-medium">
                                            {product.internalReference}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Danh mục
                                        </label>
                                        <p className="text-sm font-medium">
                                            {product.category}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Mô tả
                                    </label>
                                    <p className="text-sm">
                                        {product.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hình ảnh sản phẩm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    {product.hasImage ? (
                                        <ImageIcon className="h-16 w-16 text-gray-400" />
                                    ) : (
                                        <div className="text-center">
                                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">
                                                Chưa có hình ảnh
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Hoạt động
                                    </label>
                                    <Badge
                                        variant={
                                            product.active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {product.active ? 'Có' : 'Không'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Có thể bán
                                    </label>
                                    <Badge
                                        variant={
                                            product.canBeSold
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {product.canBeSold ? 'Có' : 'Không'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Có thể mua
                                    </label>
                                    <Badge
                                        variant={
                                            product.canBePurchased
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {product.canBePurchased
                                            ? 'Có'
                                            : 'Không'}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Có sẵn trong POS
                                    </label>
                                    <Badge
                                        variant={
                                            product.availableInPos
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {product.availableInPos
                                            ? 'Có'
                                            : 'Không'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Biến thể sản phẩm</CardTitle>
                            <CardDescription>
                                Danh sách các biến thể của sản phẩm này
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {product.variants.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <h4 className="font-medium">
                                                {variant.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {variant.attributes}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {formatCurrency(variant.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cấu hình bán hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Mô tả bán hàng
                                    </label>
                                    <p className="text-sm">
                                        {product.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Chính sách hóa đơn
                                        </label>
                                        <p className="text-sm">Theo đơn hàng</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Đơn vị tính
                                        </label>
                                        <p className="text-sm">Phần</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cấu hình Point of Sale</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Có sẵn trong POS
                                        </label>
                                        <Badge
                                            variant={
                                                product.availableInPos
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.availableInPos
                                                ? 'Có'
                                                : 'Không'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Danh mục POS
                                        </label>
                                        <p className="text-sm font-medium">
                                            {product.posCategory}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin tồn kho</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Loại sản phẩm
                                        </label>
                                        <p className="text-sm font-medium">
                                            {product.type}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Theo dõi tồn kho
                                        </label>
                                        <Badge variant="secondary">
                                            {product.type === 'Stockable'
                                                ? 'Có'
                                                : 'Không'}
                                        </Badge>
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
