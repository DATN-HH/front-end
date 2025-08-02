'use client';

import { Package, Tags, Utensils, Printer } from 'lucide-react';
import Link from 'next/link';

import { PageTitle } from '@/components/layouts/app-section/page-title';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function MenuModulePage() {
    return (
        <div className="space-y-6">
            <PageTitle icon={Utensils} title="Menu Management" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245</div>
                        <p className="text-xs text-muted-foreground">
                            +20% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Categories
                        </CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                            +1 new category
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            POS Categories
                        </CardTitle>
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 new categories
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/app/menu/products">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <Package className="h-8 w-8 mx-auto text-blue-500" />
                            <CardTitle className="text-lg">Products</CardTitle>
                            <CardDescription>
                                Manage menu items and products
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/app/menu/categories/unified">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <Tags className="h-8 w-8 mx-auto text-green-500" />
                            <CardTitle className="text-lg">
                                Categories
                            </CardTitle>
                            <CardDescription>
                                Manage product categories with hierarchy support
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/app/menu/pos-categories">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <Tags className="h-8 w-8 mx-auto text-yellow-500" />
                            <CardTitle className="text-lg">
                                POS Categories
                            </CardTitle>
                            <CardDescription>
                                Organize POS display categories
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/app/menu/attributes">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <Package className="h-8 w-8 mx-auto text-purple-500" />
                            <CardTitle className="text-lg">
                                Attributes
                            </CardTitle>
                            <CardDescription>
                                Define product attributes
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/app/menu/kitchen-printers">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center">
                            <Printer className="h-8 w-8 mx-auto text-orange-500" />
                            <CardTitle className="text-lg">
                                Kitchen Printers
                            </CardTitle>
                            <CardDescription>
                                Configure kitchen printing
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Best Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="space-y-4">
                            {[
                                {
                                    name: 'Beef Pho',
                                    sales: 45,
                                    revenue: '$225',
                                },
                                {
                                    name: 'Grilled Pork Vermicelli',
                                    sales: 38,
                                    revenue: '$190',
                                },
                                {
                                    name: 'Broken Rice',
                                    sales: 32,
                                    revenue: '$160',
                                },
                                { name: 'Banh Mi', sales: 28, revenue: '$84' },
                                {
                                    name: 'Three-Color Dessert',
                                    sales: 22,
                                    revenue: '$66',
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.sales} orders - {item.revenue}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        #{index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest changes in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                'Added new product: Spring Rolls',
                                'Updated price: Beef Pho',
                                'Created category: Summer Drinks',
                                'Archived product: Red Bean Dessert',
                                'Updated image: Hue Beef Noodle',
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                                    <p className="text-sm">{activity}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
