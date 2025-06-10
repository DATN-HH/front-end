'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function NewProductPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        salesPrice: '',
        cost: '',
        internalReference: '',
        category: '',
        posCategory: '',
        canBeSold: true,
        canBePurchased: false,
        availableInPos: true,
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type || !formData.salesPrice) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Product Created',
            description: `${formData.name} has been created successfully.`,
        });

        router.push('/app/menu/products');
    };

    const handleSaveAndNew = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type || !formData.salesPrice) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Product Created',
            description: `${formData.name} has been created successfully. Creating new product.`,
        });

        // Reset form
        setFormData({
            name: '',
            type: '',
            salesPrice: '',
            cost: '',
            internalReference: '',
            category: '',
            posCategory: '',
            canBeSold: true,
            canBePurchased: false,
            availableInPos: true,
            description: '',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/app/menu/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New Product
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new food item, beverage, or service to the system
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter basic product information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Product Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            type: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Consumable">
                                            Consumable
                                        </SelectItem>
                                        <SelectItem value="Stockable">
                                            Stockable
                                        </SelectItem>
                                        <SelectItem value="Service">
                                            Service
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salesPrice">
                                    Sales Price *
                                </Label>
                                <Input
                                    id="salesPrice"
                                    type="number"
                                    value={formData.salesPrice}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            salesPrice: e.target.value,
                                        })
                                    }
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cost: e.target.value,
                                        })
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="internalReference">
                                    Internal Reference
                                </Label>
                                <Input
                                    id="internalReference"
                                    value={formData.internalReference}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            internalReference: e.target.value,
                                        })
                                    }
                                    placeholder="Enter internal reference"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    Internal Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            category: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="food">
                                            Food
                                        </SelectItem>
                                        <SelectItem value="drink">
                                            Beverage
                                        </SelectItem>
                                        <SelectItem value="service">
                                            Service
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Internal Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Enter product description"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sales Configuration</CardTitle>
                        <CardDescription>
                            Set up sales options for the product
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="canBeSold"
                                checked={formData.canBeSold}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        canBeSold: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="canBeSold">Can be sold</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="canBePurchased"
                                checked={formData.canBePurchased}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        canBePurchased: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="canBePurchased">
                                Can be purchased
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Point of Sale Configuration</CardTitle>
                        <CardDescription>
                            Set up product display on POS
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="availableInPos"
                                checked={formData.availableInPos}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        availableInPos: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="availableInPos">
                                Available in POS
                            </Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="posCategory">POS Category</Label>
                            <Select
                                value={formData.posCategory}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        posCategory: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select POS category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appetizer">
                                        Appetizer
                                    </SelectItem>
                                    <SelectItem value="main">
                                        Main Course
                                    </SelectItem>
                                    <SelectItem value="drink">
                                        Beverage
                                    </SelectItem>
                                    <SelectItem value="dessert">
                                        Dessert
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Link href="/app/menu/products">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAndNew}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Save & Create New
                    </Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
