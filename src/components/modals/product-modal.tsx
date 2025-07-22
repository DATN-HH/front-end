'use client';

import { Save, Plus } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductModal({ open, onOpenChange }: ProductModalProps) {
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

        // Reset form and close modal
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
        onOpenChange(false);
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
            description: `${formData.name} has been created successfully. Create another product.`,
        });

        // Reset form but keep modal open
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>
                        Add a new food item, beverage, or service to the system
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Enter the basic information of the product
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
                                                internalReference:
                                                    e.target.value,
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
                                <Label htmlFor="posCategory">
                                    POS Category
                                </Label>
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
                                            Appetizers
                                        </SelectItem>
                                        <SelectItem value="main">
                                            Main Course
                                        </SelectItem>
                                        <SelectItem value="drink">
                                            Beverages
                                        </SelectItem>
                                        <SelectItem value="dessert">
                                            Desserts
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <DialogFooter className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
