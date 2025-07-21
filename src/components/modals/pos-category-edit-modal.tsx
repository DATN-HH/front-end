'use client';

import { Save, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';

import {
  useAllPosCategories,
  useUpdatePosCategory,
  PosCategoryResponse,
  PosCategoryUpdateRequest,
} from '@/api/v1/menu/pos-categories';
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
import { useToast } from '@/hooks/use-toast';

interface PosCategoryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PosCategoryResponse | null;
}

export function PosCategoryEditModal({
  open,
  onOpenChange,
  category,
}: PosCategoryEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    parentCategory: 'none',
    sequence: '',
    description: '',
  });

  // API hooks
  const { data: allCategories = [] } = useAllPosCategories();
  const updatePosCategoryMutation = useUpdatePosCategory();

  // Get root categories for parent dropdown (excluding current category to prevent circular reference)
  const rootCategories = allCategories.filter(
    (cat) => cat.isRoot && cat.id !== category?.id
  );

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        parentCategory: category.parentId
          ? category.parentId.toString()
          : 'none',
        sequence: category.sequence?.toString() || '',
        description: category.description || '',
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter category name.',
        variant: 'destructive',
      });
      return;
    }

    if (!category) return;

    try {
      const requestData: PosCategoryUpdateRequest = {
        name: formData.name.trim(),
        parentId:
          formData.parentCategory === 'none'
            ? undefined
            : Number(formData.parentCategory),
        sequence: formData.sequence ? Number(formData.sequence) : undefined,
        description: formData.description || undefined,
      };

      await updatePosCategoryMutation.mutateAsync({
        id: category.id,
        data: requestData,
      });

      toast({
        title: 'Category Updated',
        description: `${formData.name} has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (category) {
      setFormData({
        name: category.name || '',
        parentCategory: category.parentId
          ? category.parentId.toString()
          : 'none',
        sequence: category.sequence?.toString() || '',
        description: category.description || '',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit POS Category</DialogTitle>
          <DialogDescription>
            Update category information and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>
                Update basic POS category information
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
                <Label htmlFor="parentCategory">Parent Category</Label>
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
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {rootCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
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
                  Lower numbers will display first. Leave empty for automatic
                  ordering.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter category description (optional)"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePosCategoryMutation.isPending}
            >
              {updatePosCategoryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Update Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
