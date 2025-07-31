'use client';

import { Save, Plus, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { useCustomToast } from '@/lib/show-toast';

interface AttributeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AttributeModal({ open, onOpenChange }: AttributeModalProps) {
    const { success, error: showError } = useCustomToast();
    const [formData, setFormData] = useState({
        name: '',
        displayType: '',
        creationMode: 'Instantly',
    });
    const [values, setValues] = useState<string[]>([]);
    const [newValue, setNewValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.displayType) {
            showError(
                'Validation Error',
                'Please fill in all required fields.'
            );
            return;
        }

        if (values.length === 0) {
            showError(
                'Validation Error',
                'Please add at least one value for the attribute.'
            );
            return;
        }

        success(
            'Attribute Created',
            `${formData.name} has been created successfully with ${values.length} values.`
        );

        // Reset form and close modal
        setFormData({
            name: '',
            displayType: '',
            creationMode: 'Instantly',
        });
        setValues([]);
        setNewValue('');
        onOpenChange(false);
    };

    const addValue = () => {
        if (newValue.trim() && !values.includes(newValue.trim())) {
            setValues([...values, newValue.trim()]);
            setNewValue('');
        }
    };

    const removeValue = (index: number) => {
        setValues(values.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addValue();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Attribute</DialogTitle>
                    <DialogDescription>
                        Define a new attribute to create product variants
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attribute Information</CardTitle>
                            <CardDescription>
                                Enter basic information of the attribute
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Attribute Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Pizza Size, Spice Level, Color"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayType">
                                        Display Type *
                                    </Label>
                                    <Select
                                        value={formData.displayType}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                displayType: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select display type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Radio">
                                                Radio (Radio buttons)
                                            </SelectItem>
                                            <SelectItem value="Select">
                                                Select (Dropdown list)
                                            </SelectItem>
                                            <SelectItem value="Color">
                                                Color (Color picker)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="creationMode">
                                        Variant Creation Mode
                                    </Label>
                                    <Select
                                        value={formData.creationMode}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                creationMode: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Instantly">
                                                Instantly
                                            </SelectItem>
                                            <SelectItem value="Dynamically">
                                                Dynamically
                                            </SelectItem>
                                            <SelectItem value="Never">
                                                Never
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attribute Values</CardTitle>
                            <CardDescription>
                                Add possible values for this attribute
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    value={newValue}
                                    onChange={(e) =>
                                        setNewValue(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter new value"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={addValue}
                                    disabled={!newValue.trim()}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {values.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Value List ({values.length})</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {values.map((value, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                            >
                                                {value}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                                    onClick={() =>
                                                        removeValue(index)
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
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
