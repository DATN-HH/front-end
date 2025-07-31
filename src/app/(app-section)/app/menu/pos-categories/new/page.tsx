'use client';

import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCustomToast } from '@/lib/show-toast';

export default function NewPosCategoryPage() {
    const router = useRouter();
    const { success, error: showError } = useCustomToast();
    const [formData, setFormData] = useState({
        name: '',
        parentCategory: '',
        sequence: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            showError('Validation Error', 'Please enter category name.');
            return;
        }

        success(
            'Category Created',
            `${formData.name} has been created successfully.`
        );

        router.push('/app/menu/pos-categories');
    };

    const handleSaveAndNew = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            showError('Validation Error', 'Please enter category name.');
            return;
        }

        success(
            'Category Created',
            `${formData.name} has been created successfully. Creating new category.`
        );

        // Reset form
        setFormData({
            name: '',
            parentCategory: '',
            sequence: '',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/app/menu/pos-categories">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New POS Category
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new category to organize products on POS
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Information</CardTitle>
                        <CardDescription>
                            Enter basic POS category information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parentCategory">
                                Parent Category
                            </Label>
                            <Select
                                value={formData.parentCategory}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        parentCategory: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent category (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">
                                        Main Course
                                    </SelectItem>
                                    <SelectItem value="drink">
                                        Beverage
                                    </SelectItem>
                                    <SelectItem value="appetizer">
                                        Appetizer
                                    </SelectItem>
                                    <SelectItem value="dessert">
                                        Dessert
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sequence">Sequence Number</Label>
                            <Input
                                id="sequence"
                                type="number"
                                value={formData.sequence}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sequence: e.target.value,
                                    })
                                }
                                placeholder="Enter display sequence number"
                            />
                            <p className="text-sm text-muted-foreground">
                                Lower numbers will display first. Leave empty
                                for automatic ordering.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Link href="/app/menu/pos-categories">
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
